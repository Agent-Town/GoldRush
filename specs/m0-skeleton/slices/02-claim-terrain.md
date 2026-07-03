# m0/02-claim-terrain

**Contract:** the arena becomes a river gold claim; the world owns walkability. All later slices consume this one spatial truth.

**Seam:** `src/world/Terrain.ts` — data first: claim 64×64 m; river band across the middle, z ∈ [−5, +5], with a **ford** at x ∈ [−3, +3]; API `sample(x,z): TerrainSample = { walkable: boolean; speedMul: number; zone: 'bank'|'shallows'|'river'|'ford'|'out' }` (river `speedMul 0.55`, ford `0.85`), `bounds`, `nodeAnchors: Vec2[]` (6 anchors on banks/shallows — M1 gold seams), `spawnEdges(): Vec2[]` (N/S/E/W gates), `isBuildable(x,z)` (dry bank only). `src/world/props.ts` — 8–12 primitive rocks/stumps + one wooden claim-post. `src/assets/palette.ts` — brief §4.1 tokens (sand `#f5e6c8`, ochre `#c4883a`, rust `#a0522d`, teal `#5b8a8a`, wood `#2e1b0e`, sun `#ffe4a0`). Visuals: vertex-colored/canvas-textured plane (parchment-sand banks with sepia hatching feel, desaturated dusty greens — never lush), teal river strip with slow UV scroll, lit from upper-left. `assets/layer-contracts/claim-terrain.layer-contract.v1.json` + `src/assets/slots.ts`: `terrain.bank`, `terrain.river`, `terrain.ford`, `prop.rock`, `prop.stump`, `prop.claim_post`.

**Playable checkpoint:** dev server shows a recognizable river claim from above; demo capsule wades slower through water, faster at the ford.

**Verification:** GATE-STD; screenshot-critique with single variable "layout + palette read as Frontier Ledger river claim" (water shimmer/texture quality explicitly out of scope — that's an art-batch slot); e2e probe asserting `sample()` at 6 known coords (bank/river/ford/out); perf snapshot: draw calls < 150.

**Deps:** 01. Parallel with 03/04 — publishes `TerrainSample` type immediately for 03's stub.

**Firewalls:** no gameplay logic in `world/` — Terrain answers queries, never moves anything. No entities, no HUD. No heightmaps or water shaders.
