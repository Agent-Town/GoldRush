# Review: lantern-true-world-reel-2 — the reel shows the world without booting the game (lane-c, codex runner on gpt-6-astra xhigh; output salvaged and committed attended; attended drain 2026-09-05)

**Slice/branch/tip:** `lantern-true-world-reel-2` · `lane/c` · salvage commit `106f9d262` (the runner exited rc1 without committing; the attended session committed its worktree, salvage ref `save/lantern-true-world-reel-2-attended`) over base `33999b560 (archive: pruned by the A3 rewrite)` · merge `6f8e4d435` (no-ff, no conflicts, no MAIN-MOVED file).
**Verdict:** MERGED. F-ASTRA-11 cured for the featured reel: the plain watch URL opens the game's world stage driven by the verified replay, not a schematic; the SVG survives only as the labelled tactical reel.

## What it does
- `src/replay/LanternController.ts` (182 lines) owns agent-replay classification, the era refusal, the worker lifecycle, fixed-tick pacing through the existing `Loop`, pause/speed/restart/wave-skip and the LanternShow updates; `Game.ts` loses 128 lines to it and calls the shared controller (in-game replay byte-identical: `tape-02-lantern-show` + `true-reel-harness` green).
- `src/replay/LanternBoot.ts` (41 lines): `watchRunTape` in `main.ts` routes to it; it stages the contract with `stageReplayContract` BEFORE the dynamic import of the stage (the worker's own ordering), probes WebGL before constructing a renderer, and hands shelf tapes across a fresh-page boundary through a one-shot sessionStorage handoff (Terrain stays page-global by design; F-LTW2-3 below).
- `src/world/LanternWorldStage.ts` (303 lines): the game's renderer, painted bank/river/fords, a minimal terrain-pilot `Host`, `LightRig` (with Night Shift via `setNightShift`), `CameraRig` framing the contract bounds, `GeneratedSpriteBatch` pools, `GoldPickupPool` and float texts; sprites interpolate between authoritative snapshots at `Terrain.visualY`; works are keyed by family+index (the review's P2 fix); missing kinds keep an explicit placeholder disclosure.
- Fallbacks: lite → the labelled tactical SVG while the painted fallback constructs (no GLB load); no WebGL → the labelled SVG with no renderer (v1's characterization table became assertions); `reel=tactical` survives both URL rebuilds. 390px: the canvas is 62% of the viewport height, the framing disclosure starts closed.

## Evidence (merged tree `6f8e4d435` + era pin `b395ee1f`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 |
| `e2e/lantern-true-world.spec.ts` (new, 226 lines) + `reel-deep-links` + `tape-02-lantern-show` + `true-reel-harness` + `perf-01-stress-budget` (drain port 5273, workers=1, host load ≈ 4) | 32/32 desktop + 390px |
| Reel frame budget (runner, isolated) | desktop: game p95 10.8 ms vs reel 11.0 ms (101.9% of the 115% limit); 390px: 21.2 ms vs 8.7 ms (41%) — the overlapping desktop measurement (188%) is kept in `verified-gates.log`, not replaced |
| Runner's full browser run on its tree | 36 passed / 6 failed, all six in UNMODIFIED tests: two terrain-budget timeouts (F-LTW2-1, reproduced on HEAD), the hero-height 0.0214 (F-T3D-1), a teleport-wait flake (F-LTW2-2); nine new mobile tests green |
| `npm run test:node-guards` | see the drain commit message |
| Changed assertions | `e2e/reel-deep-links.spec.ts` "plain watch URL opens the true current-era show without a profile or debug": the default plain-watch presentation now asserts the visible world canvas; the SVG terrain + water assertions run after navigating to `?reel=tactical` |

## Findings
- **F-LTW2-1 (fire-authorable, harness):** `e2e/terrain3d-claim-pilot.spec.ts:169` replaces one `release` closure per matching request; two requests for `the-claim-terrain.glb` are held and `:173` releases only the second, so the first stays blocked and the terrain-budget cases time out — on HEAD and on the candidate alike. This is the mechanism behind the inventory's 60 s timeout rows since 2026-08-11. Let the harness release every held match, or distinguish the renderer request from prefetch.
- **F-LTW2-2 (non-blocking):** the terrain-consumer test observes rendered/interpolated coordinates on a live simulation and is timing-sensitive; folds into F-T3D-1's investigation.
- **F-LTW2-3 (design, recorded):** `Terrain.ts:78/:80` and `TileHeight.ts:4` still capture one page-global contract/tile; the independent route stages before import and changes pages when needed. Showing several contracts' worlds in one page needs a page-local Terrain — a separate slice, not owed by the launch.
- **F-LTW2-4 (process, fire-authorable):** the runner finished the slice and exited rc1 without committing; the salvage law (`git branch save/<slice> <lane>` the instant codex exits) kept the work only because an attended session was watching. Consider a runner rule: commit the lane delta on ANY exit code when the worktree holds tracked modifications under `src/`/`e2e/`.
