# lane-e5-deepwater-resource-guard — the Deepwater boot guard asserts against an empty array

**FIRE-AUTHORED (attended review welcome)** — s1031, 2026-07-25
**Role:** e2e guard-honesty diagnosis + fix. **Workdir:** `worktrees/lane-a` (lane branch `lane/m3`).

## READ FIRST (paths, not memory)
- `e2e/e5-deepwater-claim.spec.ts:29-96` — the failing test. The list is BUILT at **:59**
  (`performance.getEntriesByType('resource')` filtered by `/DeepwaterClaimTile/i`) and ASSERTED at
  **:69** (`expect(state.resources).not.toHaveLength(0)`). Note the whole `page.evaluate` block
  `:31-61` returns in one shot — the resource list is sampled at that instant, not polled.
- `src/world/DeepwaterClaimTile.ts` — the module the guard names. It is a **static** import at
  `src/game/Game.ts:240` and constructed at `src/game/Game.ts:598`
  (`createDeepwaterClaimTile(this.activeContract)`), which returns non-null only for
  `e5-deepwater-claim`.
- `tasks/runs/20260725-113439-lane-a-lane-m1-m2-resource-guards.md.log` — the run this finding
  comes from: failures listed at **:35164** (desktop) and **:35183** (mobile), full failure text at
  **:35201-35218**, and the playwright invocation at **:34764**.
- `tasks/BACKLOG.md` — **F-1029-3** (this finding) and **F-1026-1** (its sister case: a guard that
  measured the wrong server and misled two fires before anyone checked what it measured).
- `src/assets/AdvanceStream.ts` — the prefetch merged `e109639f` on Jul-25; hypothesis (a) below.

## WHY (evidence, quoted and dated)
`e5-deepwater-claim.spec.ts:29` *"boots the Deepwater contract with deck pads, depth gates, and a
storm-scheduled corsair wave"* fails on **both projects**, and it fails on the one assertion in that
test that is about **asset loading** rather than about Deepwater rules. Quoted verbatim from the run
log (`:35201-35215`), not from anyone's summary:

```
Error: expect(received).not.toHaveLength(expected)
Expected length: not 0
Received array:      []
> 69 |   expect(state.resources).not.toHaveLength(0);
```

| Project | Test | Assertion | Reading | Conditions |
|---|---|---|---|---|
| desktop-chrome | `:29` | `:69` resources non-empty | **`[]`** | `--workers=1`, dev server |
| mobile-chrome | `:29` | `:69` resources non-empty | **`[]`** | `--workers=1`, dev server |

The other two tests in the file (`:98` run-wave counter, `:134` deterministic replay) passed on both
projects in the same run, and every other assertion in `:29` passed — **only the resource probe
failed.** It ran at `--workers=1` against the DEFAULT webServer (`npx playwright test …` with no env
prefix, log `:34764`), so this is neither the F-1026-2 uncapped-sweep artefact nor the F-1026-1
wrong-server artefact. It is its own thing.

**THE CONTRADICTION YOU MUST SETTLE FIRST, because it decides what kind of bug this is.** s1026's
deepwater-wave-counter drain gated this exact file at **`e5-deepwater-claim 3/3 both projects`**
(~10:0xZ Jul-25, `reviews/deepwater-wave-counter.md`). The failing run started **11:34Z**. Between
those two points **no code merged** — only bookkeeping commits (s1027's lock/handoff). A guard cannot
honestly be 3/3 green and then `[]`-red on both projects with an unchanged tree unless one of the
following is true, and your first job is to say **which**:
1. it is **intermittent** and s1026 caught it on a green roll (the F-1030-1 lesson: a 1-in-3 red
   reads green two times out of three — one run proves nothing);
2. it is **order- or cache-dependent** (the resource timeline is per-document, and what the browser
   already holds changes what gets fetched);
3. s1026's 3/3 was **mis-reported**.

**WHY THIS MATTERS BEYOND ONE RED.** This is the third guard on this board found asserting something
other than what it names (F-1026-1 measured the dev server while naming the built bundle; F-1026-5's
`m2-01:322` timed out three lines before its own assertion and was vacuously red for days). An
assertion whose input array is `[]` is either catching a real load regression or **watching nothing**
— and a guard that watches nothing is worse than an absent one, because every future fire pays it
respect. F-1030-3 already warns that the board's gates are only as honest as the suites they lean on.

## NAMED HYPOTHESES (so you do not flail — check these before inventing a fourth)
- **(a) Resource-timing buffer overflow.** `performance.getEntriesByType('resource')` is served from
  a buffer whose browser default is **250 entries**; once full, later entries are **dropped
  silently**. This app now fetches far more than 250 resources before the sample point: the DOM in
  the same log carries `data-asset-prefetch-total="144"` and `data-asset-loading-total="45"` on top
  of a Vite dev module graph in the hundreds. If `DeepwaterClaimTile.ts` resolves past entry 250 the
  filter returns `[]` **while the module is perfectly loaded**. Cheap to test: log
  `performance.getEntriesByType('resource').length` next to the filtered list and see whether it is
  pinned at exactly 250. If it is, the guard is measuring buffer capacity, not asset loading.
- **(b) The module URL no longer matches `/DeepwaterClaimTile/i`.** Vite dep-optimisation, chunking
  or an import rewrite can change the served URL. Test by printing the unfiltered entry names and
  grepping them yourself.
- **(c) A real regression** — the tile genuinely is not fetched for this contract any more (e.g. the
  advance stream's `force-cache` prefetch satisfies it in a different document, or a lazy path
  replaced the static import). **This is the only hypothesis where the guard is doing its job**, and
  if it is the answer the fix belongs in `src/`, not in the spec.

## SCOPE (numbered, each testable)
1. **Reproduce on CLEAN main first** (before any edit), `--workers=1`, **both projects**, with
   `--repeat-each=3`. Report the pass/fail count per project. This settles the contradiction above
   and is the only evidence that distinguishes flake from deterministic.
2. **Diagnose to file:line.** Determine which of (a)/(b)/(c) — or a fourth you can prove — makes the
   array empty. Report the unfiltered resource-entry **count** and a sample of names; if the count is
   exactly the buffer limit, say so plainly, that is the answer.
3. **Fix at the honest end**, according to what you found:
   - if **(a)**: make the probe independent of buffer capacity (e.g. raise the buffer via
     `performance.setResourceTimingBufferSize` in an init script, or sample by explicit
     `PerformanceObserver`, or assert on a signal the app actually publishes) — the assertion must
     still fail if the tile stops loading;
   - if **(b)**: match what is really served, and add a one-line comment naming the URL shape so
     nobody "tidies" it back;
   - if **(c)**: fix the **source**, not the test, and report it as a REAL regression.
4. **Prove the repaired guard can still fail.** Whatever route you take, demonstrate once that the
   assertion goes red when the thing it guards is absent (a temporary local mutation is fine — revert
   it, and verify the revert two ways). A green run only proves the line executed, never that it
   still bites. This is the exact step that turned `m2-01:322` from vacuously red into a real guard.
5. Report the before/after per project for the whole file.

## FIREWALL
**TOUCH-ONLY:** `e2e/e5-deepwater-claim.spec.ts` — plus `src/world/DeepwaterClaimTile.ts`,
`src/game/Game.ts` or `src/assets/AdvanceStream.ts` **ONLY IF** scope-3 lands on hypothesis (c) and
you have written the evidence for it first.

**NO:**
- **`e2e/m2-05-base-damage-repair.spec.ts` — a task is LIVE in that file on lane-c right now.** Do
  not read its reds as yours and do not touch it (Mistake #12: two writers, false attributions).
- Do not delete, comment out, `test.skip`, or loosen `:69` to make the file green. If the guard
  cannot be saved as written, **replace it with an assertion that proves the same intent** — that the
  Deepwater tile really loaded for this contract — and say in your report exactly what changed and
  why the replacement is not weaker.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls,
  `m1-01`'s **77** geometries, `asset-diet`'s **25,000,000** bytes.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**Pre-proved for you (s1031, so you need not spend budget on it):** `lane/m3`'s tip `64b0970d` is
the m2-01 fixture slice, which s1030 merged to main as `df51d877`. `git log main..lane/m3` = that one
commit; `git diff main lane/m3 --stat -- src e2e` = **one file, `e2e/asset-diet.spec.ts`, 1
insertion / 11 deletions — pure main-ahead**: the lane simply lacks `9ba65911`'s skip-guard comment
block and byte-logging. **Zero lane-unique additions.** It is therefore a **SAFE DUPE** — confirm,
then proceed.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. A diagnosis that concludes "the guard is fine, the failure was X" is a legitimate outcome **only if** scope-1's repeat-each evidence supports it; report it in full rather than exiting quietly.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/e5-deepwater-claim.spec.ts` green **desktop + mobile** at
`--workers=1`, run **twice**: once as `--repeat-each=3` on the `:29` test alone, once as the full
file. Four green runs, numbers reported for each — a single green run is not evidence for a test
whose failure mode may be intermittent.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/e5-boss-dredge-queen.spec.ts`,
`e2e/e5-arsenal.spec.ts`, `e2e/e5-water-spike.spec.ts`, `e2e/task-025-bandits-dont-swim.spec.ts`.
**Known pre-existing reds, NOT yours — do not fix them and do not count them against you:**
`m2-05:198` (**F-1030-2**) and `m2-05:319` (**F-1030-1**), both live on lane-c.
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: which hypothesis was true with its file:line evidence, the
unfiltered resource-entry count, the scope-1 repeat-each table, the scope-4 can-it-still-fail proof,
and whether anything in `src/` had to move.
