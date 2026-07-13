# SOL SESSION 3D-D — queue + territory (MAP REBUILD EXPLORATION)
Read this first, every session start. Owner-ordered 2026-07-13 ("exploring using Blender to rebuild the maps"); Fable-coordinated. Protocol: AGENTS.md §Interactive co-agent sessions.

## Identity & territory
- You are **Session 3D-D**: EXPLORATION of rebuilding run-scene contract maps (tiles) as Blender terrain.
- Branch: `sol/map-rebuild-spike`. TOUCH-ONLY: `assets/pilots/map-rebuild-spike/*`, `reviews/sol-3d-d-findings.md`, `artifacts/map-rebuild-spike/*`. NO src/ edits in the exploration phase — the wire seam comes later, attended-granted, after the owner verdicts your renders.
- Parallel: 3D-C owns the TOWN plate (different territory — the town square is NOT yours; contract tiles are). The factory's lanes run daily slices. Read, never write, outside your lane.

## THE BRIEF (exploration, owner verdict decides what ships)
Pick ONE shipped tile — recommend THE CLAIM (the owner knows it by heart; every visual delta reads instantly) — and rebuild it as sculpted terrain: the S-curve river CUT into the ground, real banks, the rocky bars, gentle valley walls, the parchment fade at the edges. Bake FROM the shipped tile art + kit-era plates (engraved style continued into relief; never photoreal).

## Hard laws (these protect the game — non-negotiable)
1. **THE SIM IS PLANAR AND SACRED** (CLAUDE.md §4.6): gameplay positions, collision, movement, spawn rings, building placement all live on the flat plane. A 3D map is RENDER-ONLY: visual height = the render layer's business (the visualY pattern). Elevation-as-GAMEPLAY exists only through specs/gameplay-terrain slices — never through art.
2. **Water is law**: sluices must remain placeable — the river's SIM-side water mask (Terrain.isWaterSourceAdjacent) is untouched; your sculpted river must AGREE with it visually (banks where the mask says banks).
3. Hero/enemies/buildings render ON the terrain via the existing visualY seam (GT-01 TileHeight shipped exactly this API — read it; your terrain should be able to FEED it later, one height-source swap).
4. Budgets for the spike: ≤60k tris for a whole tile (it replaces hundreds of ground draw-quads — measure, report), ONE ≤2048² material, RECIPE export contract.
5. Painted tiles stay LITE + fallback + flag-off FOREVER.

## Deliverables (spike = renders first, no wiring)
1. `assets/pilots/map-rebuild-spike/the-claim-terrain.blend` + `.glb` + build script.
2. Owner-verdict renders: the run camera angle (the REAL angle from a live run screenshot), a low sunset angle, and an A/B against the shipped flat tile — same framing.
3. Findings: where the flat-sim/3D-render seam will bite (river crossings, building pads, spawn edges), measured draw-call/tri budget notes.
4. READY-FOR-GATES + branch tip; attended gates/merges. The owner's render verdict decides whether this becomes a ladder.
