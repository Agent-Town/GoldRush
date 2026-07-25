# lane-resource-timing-false-greens — four guards that prove a NEGATIVE against an evictable buffer

**FIRE-AUTHORED s1033 (attended review welcome).**
**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/m3`).

## READ FIRST (paths, in this order)
- `reviews/e5-deepwater-resource-guard.md` — the s1032 drain that MEASURED this mechanism on this
  board. It is the whole premise; read it before anything else.
- `e2e/e5-deepwater-claim.spec.ts:9-12` — **the reference fix, already merged and gated**
  (`performance.setResourceTimingBufferSize(10_000)` inside a `beforeEach` → `page.addInitScript`).
  You are propagating exactly this, not inventing anything.
- The four sites you own, each read in full before editing:
  `e2e/mu-02-music.spec.ts:45-58` (assertion at **:49**),
  `e2e/mu-03-era-audio.spec.ts:14-22` (assertion at **:18**) and `:32-40` (assertion at **:35**),
  `e2e/e5-water-spike.spec.ts:84-91` (assertion at **:87-90**).
- `CLAUDE.md` §5 Mistake #1 (no-op) and #10 (debug-gate leftover — "where does the PLAYER see this").

## WHY (quoted evidence, dated — the mechanism is measured, the exposure is not)

**s1032 closed F-1029-3 by proving that Chromium's Resource Timing buffer silently evicts entries on
this board, today.** `e2e/e5-deepwater-claim.spec.ts` was red on both projects because the buffer is
capped at **250 entries by default** and the advance stream prefetches **144 assets**
(`data-asset-prefetch-total="144"`), so `DeepwaterClaimTile.ts` fell outside the retained window **by
URL ordering** — desktop kept it 1 run in 3, **mobile's window ended around `DeepwaterArsenal.ts` and
kept it 0 in 3**. `src/` had not moved by a byte. There was never a load regression. The fix was one
line, and after it the slice gated **18/18**.

**That guard failed LOUDLY. Four others fail SILENTLY, in the opposite direction — and that is the
dangerous half.** `grep -rn "getEntriesByType('resource')" e2e/` returns **12 sites across 10
specs**; s1033 re-verified each one's assertion direction at file:line rather than carrying the
count forward. **Four of them assert that something did NOT load:**

| # | Site | Assertion (verified s1033) | What eviction does to it |
|---|---|---|---|
| 1 | `mu-02-music.spec.ts:49` | `some(name.includes('era-e1-frontier-loop'))` → `.toBe(false)` | passes spuriously |
| 2 | `mu-03-era-audio.spec.ts:18` | `some(/era-e[123]-.*-loop/)` → `.toBe(false)` | passes spuriously |
| 3 | `mu-03-era-audio.spec.ts:35` | `some(name.includes('title-theme'))` → `.toBe(false)` | passes spuriously |
| 4 | `e5-water-spike.spec.ts:87-90` | `.toEqual({ installed: false, resources: [] })` | `resources` passes spuriously |

**An evicted entry makes each of these pass for precisely the reason they were written to catch.**
Site 2 guards *boot-critical audio*; site 3 guards *the browser autoplay policy*; site 1 guards
*lazy* music loading; site 4 asserts *"plain debug boot leaves the deepwater chunk dormant"* — and
site 4 sits in the **same asset neighbourhood where s1032 measured eviction happening**, so there it
is not hypothetical.

**HONEST LIMIT, stated so you do not over-read this task:** the *mechanism* is proven; **per-site
exposure is UNVERIFIED** — each of the four runs at a different boot depth, and whether a plain boot
reaches the 250-entry ceiling has never been measured. **You are not here to fix four known-broken
tests. You are here to find out which of them are already vacuous, and to say so with numbers.**

**One nuance in your favour, so you weigh site 4 correctly:** `e5-water-spike:88` also asserts
`installed: window.__GR_E5_DEEPWATER__ !== undefined`, which is a global, **not** eviction-dependent.
That half of the assertion still bites regardless, so site 4 is the *least* exposed of the four.
Say so in your report rather than treating all four as equally at risk.

## SCOPE (numbered, each testable)

1. **MEASURE BEFORE YOU FIX — this is the deliverable, not the preamble.** At each of the four
   assertion points, on **both projects**, log the **UNFILTERED**
   `performance.getEntriesByType('resource').length` (and, for context, the last 3 entry names in
   buffer order). **A count pinned at exactly 250 means that guard is ALREADY VACUOUS** — it has
   been asserting against a truncated list. Report the raw number per site per project. Use a
   temporary probe (a `console.log` or an extra `page.evaluate`); it is scaffolding, and scope 5
   removes it.
2. **Apply the reference fix at each of the three files.** `performance.setResourceTimingBufferSize(10_000)`,
   copied from `e2e/e5-deepwater-claim.spec.ts:10`. **It MUST run before navigation** — inside
   `page.addInitScript`, never after `page.goto`, because a buffer raised after the fact cannot
   recover entries already dropped. That is the single way this task can silently accomplish nothing.
   The three seams differ, and each needs a different hand — this is why they are named for you:
   - `mu-02-music.spec.ts:7` — `seedProfile()` already calls `page.addInitScript(() => { ... })` with
     a **block body**. Add the line inside it. Easiest of the three.
   - `mu-03-era-audio.spec.ts:4` — `seedProfile()` uses a **concise arrow body**
     (`page.addInitScript(() => localStorage.setItem(...))`). Convert it to a block body, or add a
     second `addInitScript` call. Do not mangle the existing `localStorage.setItem`.
   - `e5-water-spike.spec.ts` — **has no init script at all.** The target test at `:84` navigates at
     `:85`. Add a `page.addInitScript` before that `goto`. Confirm the other three tests in this file
     still pass; if you add a file-level `beforeEach`, it affects all of them.
3. **Re-measure and report the delta.** Same counts, after the fix. A count that now exceeds 250
   proves eviction was real at that site; a count that was always well under 250 proves that guard
   was honest all along. **Both outcomes are successes — say which you found, per site.**
4. **THE BRANCH THAT MATTERS MOST — read this twice.** If raising the buffer makes any of the four
   assertions **FAIL**, that is **not a regression you introduced and not a test to repair.** It
   means the resource the test asserts must *not* load **does load**, and the guard has been hiding
   it — a **REAL product finding** about boot-critical audio, the autoplay gate, or a deepwater
   chunk that is not dormant. In that case: **STOP. Do NOT revert the buffer line. Do NOT loosen,
   skip or delete the assertion. Do NOT "fix" the source.** Report the failing site, the entry names
   that appeared, and which project. That finding is worth more than a green board, and s1032's
   sweep exists precisely to surface it.
5. **Remove the scope-1 probes and prove the guards can still fail.** For each of the four, mutate
   the watched name so the resource *should* be reported present, confirm the assertion goes **red**,
   then revert and **verify the revert two ways** (diff + grep). **A green run only proves the line
   executed, never that it still bites** — this is the step that turned `m2-01:322` from vacuously
   red into a real guard and that closed F-1029-3.
6. Report the per-site table: before count, after count, verdict (`was vacuous` / `was honest` /
   `REAL FINDING`), and the can-it-still-fail result.

## FIREWALL

**TOUCH-ONLY:** `e2e/mu-02-music.spec.ts`, `e2e/mu-03-era-audio.spec.ts`, `e2e/e5-water-spike.spec.ts`.

**NO:**
- **Do not touch `e2e/m2-05-base-damage-repair.spec.ts`** — lane-c is running a task inside that file
  RIGHT NOW. Two writers on one file is how this board breaks itself.
- **Do not touch `e2e/e5-deepwater-claim.spec.ts`** — it is the already-fixed reference. Read it,
  copy from it, leave it alone.
- **No `src/` changes.** If your evidence genuinely implicates the source (scope 4), **STOP and
  report** rather than land it. The fix for a measurement defect is never in the product.
- Do not weaken, skip, delete or comment out any of the four assertions, and do not convert a
  `.toBe(false)` into something laxer. **Reject-don't-stretch.** Making a guard stop noticing is the
  exact defect class this board has now closed four times (F-1026-1, F-1026-5, F-1029-3, F-1030-1).
- Do not "propagate the fix" to the other 8 resource-timing sites. They assert POSITIVES, where
  eviction fails loudly and is therefore self-announcing. They are a separate, lower-priority rung.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls, `m1-01`'s
  **77** geometries, `asset-diet`'s **25,000,000** bytes.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its
content is already merged to main (verify via git log/diff), it is a SAFE DUPE →
`git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds
uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green
before touching anything.

**Pre-proved for you (s1033 verified this directly, so you need not spend budget on it):** `lane/m3`
is **exactly 1 commit ahead** — `7d1ac416 runner(lane-a): lane-e5-deepwater-resource-guard.md` — and
**`git diff main lane/m3 -- src e2e` is EMPTY**, i.e. the lane holds **zero** code content that main
does not already have (that work merged as `7a020e66` in s1032). The full `git diff main lane/m3` is
pure main-ahead: reviews, scripts and ledgers the lane simply has not caught up to. It is therefore a
**SAFE DUPE** — confirm, then proceed.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first. Note that
**scope 1 alone justifies this task even if every count comes back under 250** — "all four guards
were honest, here are the numbers" is a complete, valuable result that retires an open finding. But
that outcome still requires the scope-2 fix to land (the buffer is free insurance against the counts
rising later) and the scope-5 proof to run. **A no-op that reports only "the mechanism might apply"
is NOT acceptable — that is exactly the unverified state this task was written to end.**

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** all three touched specs green **desktop + mobile** at `--workers=1`, run
**both isolated and as part of the full file**, each at `--repeat-each=3`. Resource-timing behaviour
is **order- and cache-dependent** (that is the entire finding — F-1029-3 was green whenever the
module happened to sort early), so a single green run is not evidence here.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/e5-deepwater-claim.spec.ts` (the
reference — if you changed shared behaviour it will say so), `e2e/perf-05-startup.spec.ts` and
`e2e/ed-04-gizmos.spec.ts` (two of the POSITIVE-asserting resource sites, as a control that raising
the buffer breaks nothing).
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-6 per-site table (before/after counts, per project),
which guards were vacuous and which were honest, any scope-4 REAL FINDING in full, the scope-5
can-it-still-fail results, and confirmation that the scope-1 probes were removed.
