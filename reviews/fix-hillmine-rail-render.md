# Review — fix-hillmine-rail-render (P0, owner live-play)

- **Slice / branch / tip:** fix-hillmine-rail-render · lane-a / `lane/m3` @ `a67cb4b0` (fix commit; parent `983ed062` = pressure-generalize-engine, already shipped on main as `c54cdd52`) · re-landed onto clean main by s581.
- **Verdict:** SHIP. tsc + build green; own spec 16/16 both projects (incl. new rail-resample test); adjacent terrain/rail/hill-mine suites 28 passed / 2 skipped; zero console/page errors (asserted in-test).

## What it does
Owner reported (live hill-mine play, 2026-07-15): rail segments render VERTICAL / billboarded over the terraces, floating above the bed — "the perspective problem that was fixed already is back on this tile." Root cause: `RailPathView` baked its rail/tie geometry once at construction against the flat planar points, so when the terrain-3d pilot mounted a terraced surface (visualY rising along the cut), the rails stayed at their build-time heights and read as vertical/floating — a Mistake #6 (world-anchored-frame) regression on the mounted-terrain path.

Fix (world-anchored law): `RailPathView` gains `resampleTerrain()` — it rebuilds rail/tie geometry sampling the live `visualY` height source, and disposes the old instanced meshes first (no leak). `Terrain3dClaimPilot` fires a new `onVisualHeightSourceInstalled` host callback the moment the height source installs; `Game.ts` wires it to `resampleTerrain()` on both the claim rail path and the megaproject rail path. On flat tiles (no height source) behaviour is byte-identical to before.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built 616ms |
| `e2e/terrain3d-registry.spec.ts` (own spec) | 16 passed, desktop+mobile (incl. `Hill Mine rails resample onto the mounted terrain surface`) |
| `e2e/terrain3d-claim-pilot.spec.ts` + `e2e/e2-hill-mine.spec.ts` + `e2e/e2-rail-entity.spec.ts` (adjacent) | 28 passed, 2 skipped (mobile-only capture skips — expected) |
| Boot probe (console/page errors) | `{ console: [], page: [] }` asserted in every terrain test |
| Rail-tracks-terrain proof | `rail-heights.json`: sampled `y` === `expectedY` (terrainVisualY, tol 3dp) at all 5 samples; height variance 1.41 → 3.64+ (>1 unit) → rails follow the terraces, not flat |
| Owner-angle before/after | `artifacts/fix-hillmine-rail-render/{desktop-chrome-before,desktop-chrome-after,mobile-chrome-after}.png` + `comparison/owner-angle-side-by-side.png`; worldCrop MAE 1.83, edgeEnergyRatio 0.95 (rail edges settle onto the bed, no new vertical energy) |

Screenshots + metrics: `artifacts/fix-hillmine-rail-render/`.

## Merge classification
- Base: clean main (`fbfff34b`). Re-landed the pure fix delta `a67cb4b0` vs its parent `983ed062` (pressure content already on main as `c54cdd52`, code-identical — confirmed `git diff 983ed062 c54cdd52` = bookkeeping only). The 4 touched src/e2e files were byte-identical between main and `983ed062` (verified), so the fix applied cleanly with no conflict.
- Files LANDED (all LANE-TOUCHED, additive): `src/world/RailPath.ts`, `src/world/Terrain3dClaimPilot.ts`, `src/game/Game.ts`, `e2e/terrain3d-registry.spec.ts`, `artifacts/fix-hillmine-rail-render/**`. Queue master `tasks/queue/lane-a/fix-hillmine-rail-render.md` removed (consumed).
- Left untouched: the pre-existing attended artifact churn (e2-hill-mine / e2-rail / canyon / pressure PNGs) is disjoint regression-screenshot dirt owned by no done-move — not staged.

## Findings
- **F-1 (non-blocking):** `983ed062` remains on `lane/m3` as a false-ahead commit (already shipped as `c54cdd52`). No action — the lane will retire when it next resets/refreshes; do NOT re-drain it (Mistake #8 / tip-graft-false-ahead).
- No blocking findings.
