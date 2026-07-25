# Review — m2-05 repair-dwell observable (F-1040-1 / F-1040-3 / F-1030-2)

**Slice:** `lane-m2-05-repair-dwell-observable` (attempt 2, master FIRE-AUTHORED s1040 / REFRESHED s1041)
**Branch:** `lane/e2-arsenal` · **Tip:** `7d951b76` ("runner(lane-c): lane-m2-05-repair-dwell-observable.md")
**Base:** `e77dcb52` (= `git merge-base main lane/e2-arsenal`) · **Drained:** s1042 fire, 2026-07-25 ~12:40Z
**Run log:** `tasks/runs/20260725-184427-lane-c-lane-m2-05-repair-dwell-observable.md.log`

## Verdict
✅ **MERGED.** Test-only, +5/−1 in one spec file, both drain riders clean, and the acceptance evidence the
master demanded (two can-it-still-fail proofs) is present and specific. The last timing red in m2-05 is
closed by **widening the observation window, not by weakening an assertion** — which is the distinction
this whole three-fire chain existed to protect.

## What it does
`e2e/m2-05-base-damage-repair.spec.ts` asserted mid-repair progress with
`expect.poll(() => …build.repair.progress).toBeGreaterThan(0)`. The runner's rAF telemetry shows the
non-zero progress window is **~123–126 ms wide**, while playwright's poll interval is ~100 ms — so the
assertion was a coin flip on a warm machine, failing **~1 in 3** full-file desktop invocations, **at two
different sites** (`:233` and `:260`) depending on scheduling. The fix overrides `wreck.repairSeconds` to
**8 simulated seconds** in both affected tests (≈1,000 ms real at `timescale=8`), widening the window
roughly **eightfold**. The interrupt test's post-interrupt wait now reads the **same local constant**, so
the wait follows the override instead of the compiled-in balance value.

## Evidence (real numbers, measured — not asserted)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged main) | **clean** |
| `npm run build` (merged main) | **green**, built in 1.23s, asset-diet 84%/87% cuts intact |
| m2-05 spec, **desktop**, merged main, invocation 1 | **7/7** (52.5s) |
| m2-05 spec, **desktop**, merged main, invocation 2 | **7/7** (53.1s) |
| m2-05 spec, **desktop**, merged main, invocation 3 | **7/7** (52.7s) |
| m2-05 spec, **mobile-chrome 390px**, merged main | **7/7** (45.5s) |
| `m1-01-claim-jumpers-death` boot probe, desktop | **4/4** (26.2s), zero console/page errors |

**Three separate desktop invocations on merged main** were run deliberately, not once: pre-fix the class
failed ~1/3 of invocations, so a single green is corroboration and three is a weak-but-real signal. The
strong evidence is the runner's, on the byte-identical file (zero divergence — `git diff` lane↔main for
this path is empty):

| Runner shape (lane) | Result |
|---|---:|
| Baseline, six separate desktop full-file invocations | **3× 7/7, then 6/7 `:233`, 6/7 `:233`, 6/7 `:260`** — the class reproduced at BOTH sites |
| Desktop isolated (post-fix) | 12/12 |
| Desktop full-file (post-fix) | **42/42** — six separate 7/7 runs |
| Mobile isolated / full-file (post-fix) | 12/12 · **42/42** |
| Adjacent battery, desktop + mobile | **38/38** |

**Measured rAF telemetry, passing vs failing run** (`ms: active/progress`): passing
`0:F/0 → 17.7:T/.222 → … → 136.1:T/.889 → 141.9:F/0`; failing `0:F/0 → 11.5:T/.222 → … → 134.5:F/0`.
Non-zero window ≈ **123–126 ms**. This is the first time in the chain the defect was quantified rather
than inferred.

**Scope-4 mutation proofs (the acceptance evidence, both required, both delivered):**
1. **First site** — hero kept outside repair radius → the *unchanged* progress poll failed `Received: 0`.
2. **Second site** — interrupt removed so the repair completes → after the shared 8.3 s simulated wait the
   sink assertion failed `Expected false, Received true`.
Both controls reverted; runner reports marker-grep and final diff clean — **independently confirmed here**
(see rider #1).

## Merge classification
**LANE-TOUCHED-only, byte-exact, no 3-way.** One file: `e2e/m2-05-base-damage-repair.spec.ts`.
`git diff 7d951b76^ main -- <path>` was **EMPTY** before landing ⇒ main never moved this file since the
lane's base, so the land is a path-scoped `git checkout lane/e2-arsenal -- <path>`; post-land
`git diff lane/e2-arsenal -- <path>` is **EMPTY** (byte-identical to the lane's tip). No src/, no
functions/, no assets touched — the diff is entirely inside the two tests named in the master's scope.

## Riders (both named by s1041 for this drain, both discharged)
- **Rider #1 — left-in mutation control:** ✅ **CLEAN, verified by reading the whole diff, not by trusting
  the report.** All three hunks are legitimate: two `const repairSeconds = 8` declarations, two
  `setBalance(page,'wreck.repairSeconds',repairSeconds)` calls, one `waitForSim` argument re-keyed. **No
  `page.route`, no removed interrupt, no deleted/loosened assertion, no leftover marker.** This mattered:
  scope 4 *ordered* the runner to add controls, and F-1036-2 once shipped one by accident.
- **Rider #2 — F-1041-1, does the wait follow `N`?** ✅ **YES.** The node-side
  `Balance.wreck.repairSeconds` read (old `:262`) is **gone**; the wait is `repairSeconds + 0.3` fed by the
  same local const as the page-side `setBalance`. The vacuous-guard trap s1041 caught pre-flight never
  opened — and mutation proof #2 is aimed exactly at it (remove the interrupt ⇒ the sink assertion must go
  red, and it did).

## Findings
- **F-1042-1 (non-blocking, informational — the chain's root lesson is now measurable):** this class
  ("assert on a transient the poller can miss") has now cost **four fires** (F-1030-2 → F-1036-1/2 →
  F-1040-1/3 → this). The generalisable guard: *an `expect.poll` on a value that is non-zero for a bounded
  window must first make the window wider than the poll interval, by overriding the balance that bounds it
  — never by shortening the assertion.* Both fixed sites now do this. **No corrective task owed**; recorded
  so the next author of a timing assertion has the pattern rather than the scar.
- **F-1042-2 (non-blocking, observed while classifying):** `Balance` may now be an unused import in this
  spec if `:262` was its only node-side read. `npx tsc --noEmit` on merged main is **clean**, so it is
  either still used elsewhere or not flagged by this project's config — **no action, no risk**; noted only
  so a future reader does not "tidy" it without checking.

## Duties (filter laws applied, not skipped silently)
- **Gazette/Ticker: NO item.** The real-change filter asks "where does the PLAYER see this?" — a test-only
  spec change has no player-visible surface. Correctly excluded, per the same law that keeps the feed honest.
- **Deploy: NOT run.** No gameplay-affecting code merged (zero `src/`), so `scripts/deploy.sh` is skipped
  by the deploy law rather than by omission.
