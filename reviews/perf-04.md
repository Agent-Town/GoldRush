# Review — perf-04 fixed-timestep audit + determinism harness

**Slice:** perf-04 (lane-d, FIRE-AUTHORED s208)
**Branch/tip:** `lane/perf` @ `8529d6a` (salvage-guarded as `save/perf-04`)
**Merge base:** `main` (additive graft — 2 new files + 4-line additive gate in `src/main.ts`)
**Drained by:** s211 fire staged it (then DIED mid-drain); **s212 fire completed the gate + commit** — landed in `0737818` (LANE-TOUCHED, path-scoped; content byte-identical to `save/perf-04@8529d6a`, verified empty `git diff --cached save/perf-04`). NOTE: a concurrent **attended Fable session independently re-merged lane/perf** at `a865e54` (perf-04 + mkt-04) ~5 min later — perf-04 content is on main via BOTH commits, identical, no conflict. Combined-tree (perf-04 + attended AC-02/SS-02/mkt) tsc+build re-verified green by s212.
**Verdict:** ✅ MERGE — clean additive diagnostics slice; determinism GREEN on the merged tree (s212-verified on desktop, hash matches the runner's independent lane result exactly).

## What it does
Adds the save-integrity/replay/netcode determinism guard the VISION-HOOKS binding invariants require ("Economy event log = single replayable truth; sim on a fixed timestep, render decoupled"). A `?debug&determinism`-gated, lazy-imported harness (`src/diagnostics/DeterminismHarness.ts`) runs a fixed-seed, no-input deterministic sim session (STEP_SECONDS 1/30, SIM_SECONDS 600 = 18,000 ticks) and emits the `summarizeLog`-derived Economy event-log hash plus an entity-count-per-tick timeline. `e2e/perf-04-determinism.spec.ts` runs the session TWICE with the same seed and asserts an identical hash + identical timeline. Mirrors the m5-03 `?debug&simitem` sibling exactly. Diagnostics/e2e-only: zero sim-semantic change, zero normal-boot effect (its own lazy chunk, imported only behind the flag).

## Classification (LANE-TOUCHED vs MAIN-MOVED)
The lane was cut on a stale base; the raw `main..lane/perf` diff shows 8 files, but only 3 are perf-04's real deliverable. The rest are stale-base drift (MAIN-MOVED — main's versions kept, NOT merged):
- **LANE-TOUCHED (merged):** `src/diagnostics/DeterminismHarness.ts` (new, +233), `e2e/perf-04-determinism.spec.ts` (new, +88), `src/main.ts` (+4 additive gate line beside the `simitem` block, context intact vs main → clean graft).
- **MAIN-MOVED / drift (IGNORED, kept main's):** `STATUS.md`, `tasks/BACKLOG.md`, `specs/marketing/README.md`, `tasks/mkt-04-feature-reel-pilot.md`, `tasks/lane-d-perf-04-determinism-harness.md` — all bookkeeping/marketing churn from the lane's older base, none of it perf-04's work.

## Evidence (merged tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green; separate lazy chunk `DeterminismHarness-CbxWhDtK.js` (3.08 kB / gzip 1.44 kB) |
| `e2e/perf-04-determinism.spec.ts` desktop (`--workers=1`, merged tree) | ✅ 2/2 PASS — both runs `status:pass`, identical hash `fnv1a32:598dff4d`, timeline 18,000 ticks, `entityTimeline` equal, 0 console/page errors. (First attempt flaked once on a report-read navigation race → **F-perf04-6**; GREEN on the single clean re-run.) |
| `e2e/perf-04-determinism.spec.ts` mobile | Runner-verified GREEN on lane tree (identical code + identical hash `fnv1a32:598dff4d`); not separately re-run by s212 (same code path, would be identical). |
| Plain-boot (no `determinism` flag): "?debug without determinism leaves the harness dormant" | ✅ PASS (desktop, merged tree) — harness undefined, 0 console/page errors → confirms zero normal-boot effect. |
| Adjacent (m5-03 `?debug&simitem` sibling) | m5-03 already SHIPPED s204 (`b459c73`) + re-merged by attended a865e54; combined-tree tsc+build green, no regression. |

Determinism verdict (s212, merged tree, desktop, 12.9m clean re-run): two matching 600s fixed-step sessions → identical Economy-log hash `fnv1a32:598dff4d`, 18,000-tick timeline, `entityTimeline` equal, no console/page errors. **This hash is byte-identical to the runner's independent lane-tree result** — strong cross-environment determinism evidence.

## Firewall compliance
Runner honored the firewall: fixed ZERO seed-plumbing (reported structural nondeterminism as findings instead of stretching scope — §5 #14 reject-don't-stretch). No sim semantics, `Rng.ts`, `Economy.ts` reducer, Balance, or existing e2e touched.

## Findings (audit — reported, NOT fixed; all non-blocking, for future slices)
- **F-perf04-1 (structural):** the LIVE loop is still variable rAF-delta (`src/core/Loop.ts:14`, `src/game/Game.ts:1127`). The harness uses the manual fixed-step seam (`Game.ts:2874`). A true fixed-step live loop is a structural change out of this slice's scope.
- **F-perf04-2:** combat-only substep exists (`src/systems/CombatSystem.ts:211`) but does not make the whole sim fixed-step.
- **F-perf04-3:** sim-side raw economy event IDs are nondeterministic via `crypto.randomUUID()` + fallbacks (`src/entities/Sluice.ts:435`, `src/systems/HarvestSystem.ts:284`). The harness hashes `summarizeLog` + log length, NOT raw IDs, so determinism holds at the replayable-truth layer.
- **F-perf04-4 (render/UI-only, benign):** score timestamps, story timers, audio pitch/throttle, power-graph timing, run-suspend metadata, VFX waits, pool settle helpers use clocks/randomness — none feed sim state.
- **F-perf04-5 (extension):** no scripted input-tape recorder exists; the harness uses no-input deterministic autoplay. An input-tape recorder is a future extension, correctly not built here.
- **F-perf04-6 (e2e test-robustness, NON-BLOCKING, corrective owed):** `runDeterminism` polls `status !== 'running'` (bool) then does a SEPARATE `page.evaluate` to read `__GR_DETERMINISM__` (spec line 40→49). At session end the game navigates to the contract/level screen, and this race destroys the execution context mid-read → intermittent `"Execution context was destroyed, most likely because of a navigation"` (hit once on the 2nd session of the desktop run; passed clean on re-run). It is a TEST-WRAPPER flake, NOT a determinism divergence and NOT a harness/product defect (the report is computed correctly; test 1 + the clean re-run + the runner's independent GREEN all confirm). Fix: have the poll return the report object itself in one atomic `page.evaluate` (poll-for-value), or snapshot `__GR_DETERMINISM__` into a stable global the game never clears on navigation. Corrective queued for lane-d when lane/perf is free (see BACKLOG) — do NOT queue while mkt-04's lane is live (LANE-SAFETY).

These are enumerated for a future fixed-step-loop slice; none block this diagnostic merge. The harness will now catch any NEW `Math.random()`/`Date.now()` leak into the Economy log as a determinism regression.
