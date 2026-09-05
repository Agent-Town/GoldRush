# Review: terrain-height-triangle-sampler — `visualY` samples the triangles the player sees (lane-d, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `terrain-height-triangle-sampler` · `lane/d` · commit `1556adaca` (one path-scoped commit) over base `25a3b25a7` · merge `cf91fe5e9` (no-ff; package.json + BACKLOG unions).
**Verdict:** MERGED. F-ASTRA-10 cured: the render-side height sampler now reads each cell's diagonal from the index buffer and interpolates barycentrically on the drawn triangle, so `visualY` equals the rendered surface everywhere. Rendering-only (CLAUDE.md §4.6): the planar sim is untouched and the fingerprint spec stays green.

## Evidence
| Terrain | Triangles | OLD max | OLD p95 | NEW max | NEW p95 | Astra's max |
|---|---:|---:|---:|---:|---:|---:|
| The Claim | 32,768 | 0.025272 | 0.000719 | 2.78e-15 | 8.88e-16 | 0.0253 |
| Twin Banks | 51,200 | 0.022965 | 0.001956 | 5.53e-07 | 6.64e-08 | 0.0230 |
| Hill Mine | 32,768 | 0.103274 | 0.000250 | 1.42e-14 | 8.88e-16 | 0.1033 |
| Mare Claim | 32,768 | 0.666667 | 0.003457 | 7.11e-14 | 1.07e-14 | 0.6667 |
The OLD column reproduces Astra's table to within 0.15% (asserted by the new guard). Twin Banks' 5.5e-07 is float32 (its 0.4 grid step is not a binary fraction). Mare worst centroid (41.667, −26.667): OLD visualY 1.333 with the hero sunk into the ledge, NEW 2.000 with the hero on it — `artifacts/terrain-height-triangle-sampler/mare-worst-centroid-{old,new}-{desktop,mobile-390}.png`, zero console/page errors.
| Gate | Result |
|---|---|
| `scripts/terrain-height-sampler.test.mjs` | green (in the single `run-node-guards` list); unit tests prove the sampler follows the index buffer and rejects unsplit/double-split/degenerate cells |
| `e2e/terrain3d-claim-pilot.spec.ts` (runner, own port 5304) | 4/5 per project: the one red is F-T3D-1, unchanged by design; the terrain-budget test passed on both (F-LTW2-1 cure confirmed) |
| Runner's `test:node-guards` | 673/680: `desk-declaration-guard` and `fixture-teardown` also red on main; contention advisory; `bench-seeds` + `engine-era-guard` red until the drain's pin (`4198ee61`, `src/` in the corpus) |
| Attended gates on the merged tree `cf91fe5e9` | tsc 0, build 0, `terrain-height-sampler.test.mjs` 3/3, era pin `95c5a753` 5/5, `terrain3d-claim-pilot` (now 10/10 with the two harness cures) + `landmark-brightness` + `perf-01-stress-budget` 16/16 desktop + 390px; node-guards: see the drain commit message |

## F-T3D-1 resolved by measurement, not by the sampler
All five sample points of the red test sit on exact grid vertices of the Claim's 0.5-unit grid, where bilinear and barycentric are identical; both samplers return the same value there (delta exactly 0). The hero is displaced from the requested teleport (target z = −10, hero settles at z = −10.40), so the harness compares the hero's Y at its ACTUAL position with `visualY` at the REQUESTED one; the 0.0214 is the slope over that 0.40. Revert-run-reapply on the same server: main produces the identical failure. Cured attended in `f9006774b` (the spec waits for near-and-settled arrival and samples the ground under the hero's real position); the whole spec is 10/10 both projects.

## Findings
- **F-THTS-1 (CURED in the drain commit):** two guard files the attended session unioned into `package.json` on 2026-09-05 (`shared-atlas-plugin.test.mjs`, `gltf-loader-usage-guard.test.mjs`) were appended AFTER `node scripts/nul-audit.mjs`, which ignores positional arguments — so neither guard ever ran in the battery. Moved into the `run-node-guards.mjs` list (101 files, one invocation). The union helper now inserts before the next `&&`.
- **Housekeeping:** the runner's mobile run left a 111 MB `trace.zip` under the worktree's git-ignored `test-results/`; disk only, cannot ride into main.
