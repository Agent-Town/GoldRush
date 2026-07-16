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

## GRIT + PANORAMA WAVE — ACCEPTED + MERGED (attended, 2026-07-14). Tip e0e5191d: five distinct FIGHT-verdict exteriors + five mounted panoramas, sim untouched, byte-reproducible. The factory's terrain3d-02 registry mounts ALL of it behind the flag for the owner's tour.
## ANSWER TO YOUR QUESTION ("are you building the new maps like these ones here?") — YES, BY DESIGN: every new factory map (E2's Pressure Garden/Incline, E3's Canyon Works/Blackout Ridge/Moth Season) authors its water/build/spawn/pylon masks FIRST and reports the mask coordinate tables in its drain report — exactly so YOU can sculpt them second, per your own handoff doctrine. **YOUR NEXT WAVE (granted): the E2 family** — Hill Mine, Trestle, Pressure Garden, Incline from their authored masks, same laws (Grit, Panorama, masks-agreement, Mood A/B). E3 follows once its tiles ship.

## PANORAMA LAW v2 (2026-07-14, from the owner's stitching review with the session — three NAMED FAILURES + the correction contract)
The ring geometry closes correctly; the failures are projection/atmospheric:
1. **THE PAINTED WALL** — a hard horizontal join where panorama meets terrain. LAW: the panorama SINKS behind an irregular distant ridge line (occluder geometry or terrain rim), never meets the ground on a straight seam; a dusty atmospheric transition band (haze gradient) bridges ridge → sky.
2. **THE CEILING** — dense engraving stretched high on the cylinder reads as an inverted canopy. LAW: engraving density is a VERTICAL GRADIENT — dense at the horizon band, quieting to near-plain parchment sky at the top. The zenith is calm.
3. **THE ECHO** — one mirrored strip repeats recognizable sky structure around the ring. LAW: break repeats with asymmetric cloud/atmosphere features per quadrant (edit passes on the strip are enough; full unique 360° not required), so no landmark cloud appears twice at the same height.
CORRECTION WAVE (granted, rides BEFORE the E2 family): apply v2 to all five E1 panoramas — same budgets, same mounts (GLB-replace in place; the registry mount survives), MOOD A/B per map + one PANORAMA-SPECIFIC check: a horizon look from the playfield center answers "distance," never "wall" or "ceiling."

## PANORAMA v2 CORRECTION — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-14 evening). Tip 9e0dcf98: all three named failures corrected across the five E1 maps (wall/ceiling/echo); registry suites 20/20 at the gate. **THE E1 COUNTY IS VISUALLY COMPLETE** (grit terrains + v2 panoramas, all behind ?terrain3dPilot — owner tour → promotion verdict). **NEXT WAVE (standing grant): the E2 family** — Hill Mine, Trestle, Pressure Garden, Incline from the factory's authored masks; Panorama Law v2 + Grit Law + Mood A/B all apply from wave one.

## E2 PAIR (HILL MINE + TRESTLE) — ACCEPTED + MERGED + DEPLOYED (attended, 2026-07-14 night). Tip bd6ee9aa. The HOLD on pressure-garden/incline was CORRECT (mask files absent — the factory owed them; publish-e2-mask-tables now queued closes it; F-3D-D-23 wrapper finding noted). Resume the last two E2 maps when the tables land on main. THE LANDMARK PACK WAVE remains granted alongside.

## THE LANDMARK SOURCE LADDER (owner direction 2026-07-14: "we have a lot of assets for the different epochs. We could also use those as landmarks?... This is a bit random maybe?" — ANSWER: not random if sourcing follows ONE ladder, the same style law as everything else)
For every landmark mount id, source in THIS order:
1. **REUSE an existing 3D asset** where the id names something that exists: boiler-house-site → assets/pilots/run3d/boiler-house.glb · lampworks/lantern ids → lantern-post.glb · rocket_cart → the railcar-3d family piece · sluice/riparian dressing → sluice.glb · palisade/siege lines → palisade.glb. A landmark VARIANT of a reused asset (weathered, half-buried, grit-dressed sibling .glb) is encouraged — reuse means the SHAPE VOCABULARY, not necessarily the pristine unit.
2. **DERIVE from painted art of that exact thing** where 2D exists but 3D doesn't: claim houses/homesteads from the bld-* painting proportions and palette; trestle pieces from ter-rail-elements; ruins as broken-down derivations of the shipped building shapes (a ruin IS a building minus its future).
3. **BUILD NEW, in-era, only for ids with no source** (headframes, winches, bison skeleton, cactus thickets): bake from the era's contract plates and kit plates (plate-contract-hill-mine shows its headframes; dry-gulch's plate shows its failure) — never free-styled.
ERA STAMP: each map's landmarks are born in its contract's era style (E1 maps = E1 vocabulary). Budgets: ≤3k tris per landmark, one shared ≤2048² atlas per map-pack, Grit Law, base-center origins at your recorded mount transforms, `asset` fields filled in the contract JSONs. Deliver per-map or as one wave.

## THE CRAWLER MODEL — TRANSFERRED IN (attended, 2026-07-15; from 3D-C, never started there). While your garden/incline heartbeat waits (their contracts are BUILDING factory-side now — tables will publish behind them; E3 tables also queued): build the Rival Dynamo Crawler GLB from `assets/raw/plate-e3-boss-crawler.png` (the shipped reference: tracked chassis, DRAIN-MAST insulator antenna, capacitor bank racks + three damaged states). Contract = the railcar precedent: ≤12k tris, ONE ≤1024² material, THREE named component sub-meshes (drain_mast/tracks/capacitor_bank) with damage morphs, base-center origin, byte-identical re-export, run-camera on-tile render (the canyon gorge). Territory: assets/pilots/crawler-3d/*. The choreography is building factory-side with placeholder presentation — your model wires in like the railcar's did. LANDMARK LAW REMINDER: no further landmark work anywhere until the owner's A/B verdict.

## UNBLOCKED 2026-07-16 (file-verified): e2 mask-tables/ holds pressure-garden + incline (your heartbeat paths); e3 mask-tables/ holds canyon-works + moth-season (+ dust-flats early; blackout-ridge's follows). RESUME: (1) Garden + Incline terrain/panorama pairs per your held charter; (2) then the E3 family — Canyon (the first NIGHT tile: grit must read under dusk; the six pylon-site masks stay buildable-flat) + Moth Season. All standing laws (Grit, Panorama v2, Mood A/B, masks-agreement). Landmark freeze still holds pending the owner A/B.

## E2 COUNTY COMPLETE (2026-07-16): Garden + Incline ACCEPTED + MERGED + DEPLOYED — all four E2 maps sculpted, masks-exact. PROCEED: the E3 family per your standing grant (canyon + moth-season tables published; canyon = the first NIGHT tile, pylon sites buildable-flat). Landmark freeze still holds.

## E3 FAMILY VERIFIED-DELIVERED (2026-07-16): canyon + moth-season sculpts confirmed on main (b4166b68, re-verified byte-identical; pylon sites zero-deviation ×2176 samples — exemplary). NEXT WAVE (granted): **blackout-ridge + dust-flats sculpts** — their mask tables land today via the factory chore (epoch-3/mask-tables/e3-blackout-ridge.json + epoch-4-motor/mask-tables/e4-dust-flats.json); poll or await the word. Dust-flats = the first E4 tile: motor-era grit (ruts, tar stains, orbit ring road as the dominant landform). Landmark freeze holds.
