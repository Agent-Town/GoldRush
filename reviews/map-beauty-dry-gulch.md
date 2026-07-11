# Review — map-beauty-dry-gulch

**Slice/branch/tip:** map-beauty-dry-gulch · lane-polish-ts04 · tip `0e051103` (runner lane-c) → landed on main as `c505ee7a`
**Drained by:** s378 fire, 2026-07-12 (idle-attended wave drain #2 of 3)
**Verdict:** ✅ MERGED (tip-graft, not branch-merge)

## What it does
Dry Gulch was rendering on the flat fallback ground instead of its authored mesa/wash relief. The `e1-dry-gulch` tile contract now sets `tileParams.render = { "terrainMesh": "required" }`, so the world builder consumes the authored heightfield (spring basin + southwest arroyo + east-mesa wash) rather than the flat plane, while other tiles (the Claim) keep the flat fallback. The dry-gulch splat `antiTile` is raised 0.72 → 0.86 to further break up visible ground tiling. Pure contract-data change — the reader (`src/world/ContinuousGroundMesh.ts`) is byte-identical to main.

## Evidence
| Gate | Result |
|------|--------|
| tsc --noEmit | clean |
| npm run build | green (463ms) |
| e2e/map-beauty-dry-gulch.spec.ts | 4 passed (desktop+mobile × relief-consumed + FULL/LITE render-budget, 24.5s) |
| fix-frozen-waves (coupled, same tile) | still 2 passed on the updated contract |
| adjacent e2e/tr-02-splat-ground.spec.ts (only adjacent terrain spec touching dry-gulch) | 4 passed (1.9m) |
| boot errors | zero (specs' error buckets clean both viewports) |

## Merge classification
- **Base:** merge-base with main = `835c8108` (lane/polish); branch sits over 086 `d5d0bb97` + 2 fixes → NOT branch-merged (would drag 086). 
- **assets/contracts/epoch-1-frontier/contracts.json** — MAIN-MOVED-check: main's pre-image byte-matched the branch (no `render` line between biome/river; `antiTile` 0.72 at the dry-gulch splat). Applied the two hunks **surgically via Edit**; `git diff 0e051103 -- contracts.json` == EMPTY (byte-match confirmed). Other tiles' antiTile (0.56/0.64) untouched.
- **e2e/map-beauty-dry-gulch.spec.ts, artifacts/dry-gulch-relief/** — LANE-TOUCHED new files → `git checkout 0e051103 -- <paths>`.

## Findings
None blocking. Render-budget tests (FULL + LITE) pass, so the relief mesh does not regress frame budget on either viewport.
