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

## SPIKE — MERGED, OWNER VERDICT PENDING (attended, 2026-07-13 evening)
Tip 8511e352 merged (renders + GLB + findings; render-only per charter, zero src). The proposed next step is on record: a default-off pilot feeding Terrain.visualY while movement/collision/water/placement stay planar — ATTENDED authors that slice IF the owner's render verdict says GO. Do not build further until the verdict.

## CONSECUTIVE-GOAL WAVE — MERGED (attended, 2026-07-14). Owner verdict on the Claim: GO — the promotion pilot is factory-queued (terrain3d-01-claim-pilot; your MODEL-HANDOFF is its spec voice). HOLD further map sculpts until the pilot proves the seam in-game; Twin Banks braided-water waits on the author-masks-first flow your handoff correctly demands.

## THE GRIT LAW (owner art-direction ruling, 2026-07-14 — verbatim): "the style does not yet reflect the mood/theme of the world when the player plays these maps. It has to be more grungy, frontier style, hard, desperate, brutal and rough - the player is fighting for their life not on a holiday."
THE NAMED FAILURE: **the holiday read** — smooth clay surfaces, pastel water, clean untouched ground. The composition of the five terrains is ACCEPTED; the MATERIAL LANGUAGE must be rebuilt to the game's own engraved-hardship style.

### The texture bible (bake FROM these, exactly as the town buildings baked from their paintings)
- `assets/processed/` terrain tiles (the shipped painted bank/river/gulch art) — scratchy engraved hatching, stained sepia earth, grit and grain in every stroke.
- The kit plates (kit-era-1/2) — value range and weathering: deep shadow pockets, sun-bleached bone-dry lights, NOTHING evenly lit.
- The contract plates (plate-contract-*) — how each map's HARDSHIP reads as illustration.

### The grunge vocabulary (per terrain, composed not sprinkled)
Wheel-rut scars and drag marks · stained and salt-crusted earth · sun-bleached splintered timber · rockfall rubble and tailings that look DUMPED, not decorated · dead brush, burnt stumps · rope-worn posts · murky working water (engraved flow-lines, foam streaks, mud-fouled banks — never resort-blue/green) · old scorch and blast pockmarks near the fought-over ground · the ONE tended exception stays readable: crops/camp kept alive by effort (the contrast IS the story — hard land, stubborn care).
- STILL LAW: warm never gory (no blood, no corpses; hardship not horror) · pictograms only · water/coordinates/masks agreement unchanged · same tri/material contract.

### Acceptance gate (added to every terrain wave from now on)
Each verdict board includes a MOOD A/B: the sculpted terrain at the gameplay camera NEXT TO the shipped painted tile of the same map — the 3D must read as the SAME WORLD, harder. A fresh unprimed critique answers one question first: "holiday or fight?" Anything reading holiday returns to the easel.

## LANDMARKS = MOUNTED (owner ruling 2026-07-14: "mounting is ok for me")
Landmark models ship as SEPARATE GLBs mounted on the terrain (the town-buildings-on-plate pattern), never baked into the ground mesh. Terrain stays stable while landmark packs iterate; each terrain's contract JSON lists its landmark mount points (id, position, rotation, scale) so the factory's mount seam is data-driven. Proxies in current renders stay proxies until a landmark-pack wave is granted.

## GRIT PASS (owner-directed, in progress) + THE PANORAMA LAW (2026-07-14)
Owner: E1 maps evolved grittier (Grit Law pass) + a panorama/background view added to ALL maps. PANORAMA CONTRACT: the backdrop is a RING/BACKPLATE beyond the playfield edge — render-only, engraved-sky style matched to the era's kit plate horizon; it must NOT change playfield bounds, spawn edges, fog-gating, or any mask; budget ≤4k tris + ONE ≤2048² material per panorama (it's scenery, not terrain); delivered as `<map>-panorama.glb` beside each terrain with mount transform in the contract JSON. MOOD A/B gate applies (the panorama should make the maps feel like PLACES IN THE COUNTY — the fevered world's dark horizon may show at the far rim per canon, warm never grim).
