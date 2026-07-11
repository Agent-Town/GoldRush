# map-beauty-dry-gulch — the first slice of "the different maps should look beautiful"
ROLE: terrain/visual implementer. WORKDIR: lane-c (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner playtest 2026-07-11, verbatim): "The different maps should look beautiful." Evidence: his Dry Gulch screenshot is a flat ochre plane with visible texture tiling seams — while the Claim carries the W1 relief treatment and Hill Mine opts into the terrain mesh.
Standing law: the sim is planar; ALL of this is render-side (visualY / mesh / palette / scatter). Zero gameplay change.

## READ-FIRST
- reviews/hill-mine-relief.md — the proven recipe: per-tile `render.terrainMesh: 'required'` opts a tile into the TR-01 mesh renderer + slope-shade uniform.
- assets/contracts/epoch-1-frontier/contracts.json → e1-dry-gulch tileParams: a visual heightfield ALREADY EXISTS (`dry-gulch-mesa-washes`: spring basin at (-18,-18), two wash channels) — it is authored but the tile may not be consuming the mesh renderer.
- src/world/Terrain.ts + ContinuousGroundMesh.ts (TR-01 seam), src/world/Scatter.ts (props density), the dry-gulch palette block (ochre-red tint values).
- e2e/w1-01-terrain-relief.spec.ts + tr-01 specs (the gate grammar for relief slices).

## SCOPE
1. Opt e1-dry-gulch into the terrain mesh renderer (the Hill Mine pattern) so the authored mesa/wash heightfield actually SHOWS: basin dip readable, arroyo shadows, slope shading.
2. One scatter/palette polish pass within existing systems: break the texture tiling (macro-variation or scatter density tune), mesa rim props if slots exist. NO new art generations in this slice (that is the art lane's ladder).
3. Perf: frame p95 within budget on FULL and LITE tiers (058 gates); draw-call delta reported.
4. e2e: dry-gulch relief spec (mesh present when contract=e1-dry-gulch, plain-boot Claim unaffected — the flat-identity guard grammar from gt-02), both projects + screenshots.

## TOUCH-ONLY: contracts.json e1-dry-gulch render/tileParams block ONLY, src/world/* render-side, one new e2e, artifacts/.
## NO: sim/movement/Balance, other contracts' data, Enemy/Wave systems, story/UI.
## SELF-CHECK: tsc; build; new spec + w1-01 + tr-01 + gt suites + e1-dry-gulch adjacents green BOTH projects; determinism fingerprint unchanged on the Claim; zero console; before/after shots in artifacts/dry-gulch-relief/.
END: READY-FOR-GATES + before/after + perf table. (Siblings for night-shift/twin-banks follow the same recipe once this gates — the "beautiful maps" ladder.)
