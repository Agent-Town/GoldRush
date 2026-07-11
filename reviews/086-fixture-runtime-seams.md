# Review — 086 fixture-runtime-seams (lanterns honor rotation + pure placement predicate)

**Slice:** 086-fixture-runtime-seams (FROM F-ED04-02 + F-ED04-04, `reviews/sol-findings-ed-04-gizmos.md`)
**Branch:** `lane-polish-ts04` (lane-c) — commits `73324072` (lantern rotations) + `7e18e874` (pure placement predicate); runner done-move `d5d0bb97`.
**Merge:** re-landed per-file onto current main `e1375498` (s354). Branch base `835c8108` (lane/polish) is badly stale — main has since absorbed the mega-drain/editor stack/audio/harvest-channels; a blind `git merge` of the stale branch was rejected in favour of a vetted per-file re-land (Mistake #15 spirit).
**Ship commit:** see the drain commit that carries this file.

## Verdict
**PASS** — merged. Firewalled single-player fix, full gate battery green (84 playwright tests, 0 failures), determinism hash unchanged.

## What it does (one paragraph)
Two ED-04 findings closed. (1) **Lantern rotation is real end-to-end:** BuildSystem's lantern dispatch now forwards `rotationSteps` (previously dropped), the LanternPostPool stores/renders per-instance rotation so the arm/lantern/halo swing to the authored yaw (`cos/sin` side-offsets replacing the fixed `+0.22/+0.52` x-offset), and RunSuspend's building capture records non-palisade rotation truthfully — extended the `captureBuildings` `rotationSteps` ternary to read `lantern_post` from `buildSystem.lanternPosts.rotationStepsAt(index)` (was hard-zeroed for everything but palisade). Night Shift's pre-placed lantern posts now render their authored rotations and a suspend→restore round-trip preserves them. (2) **The placement predicate goes pure:** BuildSystem's `matchesPlacement`/`overlapsExisting` core is extracted into a new exported pure module `src/systems/BuildPlacement.ts` (descriptor-shaped inputs, zero system state); BuildSystem calls it (behaviour byte-identical, its own suites green). The editor is NOT wired to it here (deferred, per firewall).

## Evidence (real numbers, this fire's gate on the assembled main tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (490ms) |
| `e2e/e1-night-shift.spec.ts` + `e2e/build-placement-pure.spec.ts` + `e2e/run-suspend.spec.ts` | **22/22** desktop + mobile |
| `e2e/perf-04-determinism.spec.ts` (hash-unchanged solo) | **6/6** desktop + mobile — economyHash & futureStateHash identical across runs |
| `e2e/m2-01` + `m2-02` (incl. palisade rotation AABB) + `m1-01` + `m1-05` + `task-025` | **56/56** desktop + mobile |
| Total | **84 passed, 0 failed** |
| Console/page errors | zero (asserted inside night-shift/determinism/run-suspend flows, plain `goto('/')`, desktop 1280 + 390px) |

Player-visibility (Mistake #10): lanterns render at their authored rotation inside the **Night Shift contract** (a normal contract flow, no `?debug`), and rotations survive the pause→continue suspend cycle — both covered by `e1-night-shift.spec.ts` + `run-suspend.spec.ts` without a debug flag. Shots in `reviews/shots-086/` (`true-dark-lantern-ring`, `restore-moment`, Codex's `authored-lantern-rotations-after-restore`).

## Merge classification (base `835c8108`; re-landed onto main `e1375498`)
| File | Class | Resolution |
|------|-------|-----------|
| `src/systems/BuildSystem.ts` | LANE-TOUCHED (base==main; absent from `git diff --name-only 835c8108 main`) | clean take of 086's version |
| `src/systems/BuildPlacement.ts` | NEW | free add |
| `e2e/build-placement-pure.spec.ts` | NEW | free add |
| `e2e/e1-night-shift.spec.ts` | LANE-TOUCHED (base==main) | clean take of 086's version |
| `src/game/RunSuspend.ts` | **MAIN-MOVED-too** (main changed it elsewhere since base) | 3-way by hand: applied ONLY the `lantern_post` `rotationSteps` hunk at `captureBuildings` (anchor line unchanged on main) — main's other RunSuspend changes preserved |

Two inherited `artifacts/town-t5/*.png` that the runner's broad-add swept into `d5d0bb97` were **excluded** from the merge (stray, not 086's — Codex flagged them "inherited"). No stray files, no `git add -A`.

## Findings
- **F-086-1 (non-blocking, process):** the branch ran on a stale base (`835c8108` / lane/polish) instead of fresh main — the lane-c worktree carried an old `lane-polish-ts04` branch that was never reset to current main before 086 ran. It re-landed cleanly here (only RunSuspend needed a 3-way, cleanly separable), but the lane pre-flight should reset to main. Handled: branch left as salvage; next lane-c refill MUST reset from main (the 086 content is already on main → safe-dupe, loss-free).
- **F-086-2 (non-blocking):** the runner's combined gate stalled during determinism (the runner reported "22 focused tests passed" + determinism/4 tests unfinished) — this fire ran the full battery to green, including the determinism hash gate the runner couldn't complete. No defect; a slower headless run.
