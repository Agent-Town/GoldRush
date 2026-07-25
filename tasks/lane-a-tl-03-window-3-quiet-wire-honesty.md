# lane-a: TL-03 Window 3 corrective — "the wire is quiet" must mean the wire IS quiet

**FIRE-AUTHORED s1043 (attended review welcome).** A two-branch honesty fix on tooling that shipped one
fire earlier, closing F-1043-2(a) + F-1043-1 from its own drain review.

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). **Commit prefix:** `tl:`

## Why (evidence, quoted, dated — and MEASURED, not inferred)
Window 3 shipped s1043 (`5227409f`, review `reviews/tl-03-window-3-ticker-stats.md`). Its drain probed the
live endpoint directly and found the tool telling a **false** story:

> `GET https://gold-rush-3in.pages.dev/api/stats` → **HTTP 200**, `application/json`,
> `{"ok":true,"empty":true,"message":"the office opens with the first assay","stats":{"runs":{"today":0,…}}}`
> … and `node scripts/ticker-stats.mjs` prints **`the wire is quiet.`**

The wire is **not** quiet. It answered, correctly, in 200 — the county's book is merely **empty**. The two
shipped windows of this same spine keep those states apart, in the wording the spine established:

- **Window 2**, `src/encyclopedia/liveStats.ts` (shipped s753): `payload.empty === true` →
  `'the office opens with the first assay.'`; non-`ok`/throw → `'the wire is quiet.'` — **two lines, two
  meanings.**
- **Window 1** shipped the same pair (BACKLOG:136, s261: *"graceful empty ('the office opens with the first
  assay') + 'the wire is quiet' network fallback"*).
- **The law they all serve** (`specs/accounts/README.md:33`): *"all three windows render the one endpoint;
  **no surface computes its own truth**."*

**This is the AUTHORING fire's defect, not the runner's** — s1042's scope 3 explicitly ordered *"or the
graceful empty state → print the honest quiet-wire line"*, and the runner obeyed it exactly, harness case
included. Recorded plainly so nobody blames the implementation: **the master was wrong, the run was right.**

Second finding from the same review, same shape (a true thing hidden behind a false line) — **F-1043-1**:
`statsEndpoint()` throws a plain `Error('STATS_ENDPOINT not found')` if the constant is renamed/moved, and
`draftTickerStats`'s catch converts anything that is not an `UnsafeTickerCopyError` into the quiet-wire line.
So a **broken tool** and a **down endpoint** are indistinguishable to a drafting fire. (Partly mitigated
today: the harness asserts the read, so a rename turns the *harness* red — but nothing tells the drafter.)

**Why this is worth a run for ~two branches:** the whole reason Window 3 exists is that a fire compiling a
digest must never be handed a number the endpoint did not send. A tool that reports a *healthy* endpoint as
*down* fails that mandate from the other direction: it invites the drafter to write "no news" on a day the
office simply has no assays yet — and it will keep doing so on the first real day of tallies, because
`empty` flips to `false` only once runs land.

## READ FIRST
`AGENTS.md` · `reviews/tl-03-window-3-ticker-stats.md` (**your whole brief — F-1043-1, F-1043-2, and the
non-finding already retired by measurement**) · `scripts/ticker-stats.mjs` + `scripts/test-ticker-stats.mjs`
(what you are editing) · `src/encyclopedia/liveStats.ts` (**the shipped wording you must MATCH, not
re-invent** — read `readAssayStats`) · `specs/accounts/README.md` §TELEMETRY lines 29-33 (the three-window
law) · `specs/marketing/README.md` STAGE 2.7 (the Ticker's hard laws — unchanged by this task).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is
already merged to main (verify with `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's
content is **not** on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted
edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Pre-proved for you (s1043, measured at authoring time):** `git log main..lane/m3` shows exactly one commit,
`46146b0b` (`runner(lane-a): lane-a-tl-03-window-3-ticker-stats.md`), and its content **is** on main — I
drained it myself this fire as `5227409f`, byte-exact path-scoped, both files identical. **Nothing can be
lost by the reset; proceed.** *(Honest limit: the worktree's uncommitted-dirt state is NOT independently
probed — `git -C` on a worktree is permission-gated for fires. `git clean -fd` covers residue; treat anything
else you find there as a finding worth reporting, not as expected.)*

## Scope (numbered, each item testable)
1. **Split the two states in `render()`/`draftTickerStats`.** `payload.empty === true` (with `ok: true`) →
   the **empty-office line**, byte-matching Window 2's string exactly: `the office opens with the first assay.`
   Unreachable / non-200 / malformed JSON / `ok !== true` / shape-invalid → **unchanged** `the wire is quiet.`
   Exit 0 in every one of those cases, as today. **Match the shipped wording character-for-character — do
   NOT invent new in-universe copy** (canon: brief §9.4 naming rules; the spine's vocabulary is already
   ratified by two shipped windows, and a third variant would be the divergence this task exists to end).
2. **Keep `validPayload` honest about which line it earns.** A payload that is `ok: true, empty: false` but
   fails the shape check is **not** an empty office — it is an unusable answer → quiet-wire line. Make that
   ordering explicit in the code rather than incidental, so the next reader cannot mis-trace it.
3. **F-1043-1: a broken endpoint read must not masquerade as a quiet wire.** When `statsEndpoint()` cannot
   find the constant (renamed / moved / re-quoted), keep **stdout paste-safe and exit 0** (a fire compiling a
   digest is never blocked — s1042 scope 3, still law), but emit a **distinct operator-facing diagnostic to
   stderr** naming the file and the constant it looked for. **stderr text is tooling output, not in-world
   copy — plain English, no frontier voice, no new canon.** Distinguish it in the code from the down-endpoint
   path (different branch, not a shared catch-all).
4. **Do not weaken the deny-list.** `guard()` and `BANNED_WORDS` are untouched; both existing poison cases
   (rendered path + `--json` path) must still pass. The 140-char cap stays as-is — the drain already measured
   its headroom (96 chars at fixture counts, 132 at 99,999,999 per bucket, so it cannot trip below ~1e9 per
   bucket); **do not "improve" it, and do not re-derive that number.**
5. **Harness (`scripts/test-ticker-stats.mjs`) — the cases that make this real.**
   a. **Fix the now-wrong case:** the existing `empty: true` assertion expects `'the wire is quiet.'` — it
      must now expect the empty-office line. (This is the assertion that encoded the defect; changing it *is*
      the fix, and you should say so in your report.)
   b. Keep all three failure fixtures (throw / 500 / garbage JSON) asserting `'the wire is quiet.'`, so the
      two states are pinned **apart** by tests that would both break if they were re-merged.
   c. `ok: true, empty: false` + a shape violation → quiet-wire line (scope 2, asserted).
   d. **MUTATION CONTROL, mandatory, and report its output:** temporarily make the empty branch return the
      quiet line again (i.e. re-introduce the shipped defect) and show that the harness **goes RED** naming
      the empty case. Then restore and show green. *A test that cannot fail is worse than no test
      (F-1026-1 class); this exact control is what proved the deny-list guard load-bearing at the last drain,
      and it is not optional here.*
6. **No scope creep into the digest duty.** The `--help` STATS LINE note stays. Do not touch published
   digests, `news/herald.json`, the approval/publication flow, or add any automation.

## Firewall
**TOUCH ONLY:** `scripts/ticker-stats.mjs` · `scripts/test-ticker-stats.mjs`
**NO:** game `src/` (including `liveStats.ts` — you **read** it for the wording, you do not edit it) ·
`functions/` (the endpoint is correct; F-1043-2(b)'s zero tallies are an OWNER question, explicitly **not
yours**) · `site/` · `specs/` · published digests / `news/herald.json` · the approval or publication flow ·
any network call in a test · any deny-list / 140-char-cap change · `package.json`.

## No-op guard
If you are about to exit without changes, **write WHY into your report first.** "The endpoint was
unreachable" is NOT a reason to stop — every case in scope 5 is fixture-driven and offline by construction.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` + `npm run build` green (additive tooling; both projects unaffected).
- `node scripts/test-ticker-stats.mjs` → **all cases pass**, including the new ones.
- **Scope 5d control:** paste the RED output (defect re-introduced) and the restored green line.
- **The acceptance evidence, and it is observable TODAY:** run `node scripts/ticker-stats.mjs` against the
  real endpoint and paste the output. Because the live endpoint currently answers `200 {ok:true, empty:true}`
  (measured s1043), a correct fix prints **`the office opens with the first assay.`** where the shipped tool
  printed `the wire is quiet.` **That before/after pair is the proof this task changed real behaviour, not
  just tests.** If the live endpoint has since changed state, say so and paste what it actually returned —
  an honest mismatch is evidence; a claim without the paste is not.
- `npx playwright test e2e/m1-01-claim-jumpers-death.spec.ts` → **8/8** both projects, zero console (cheap
  proof nothing leaked into the client bundle). No screenshots owed (no rendering surface).

**End: READY-FOR-GATES** + the before/after live output + the scope-5d control output + anything the payload
still cannot honestly express.
