# Contract terrain family — Blender handoff

This spike proves the environment rule across the current epoch ladder: every contract owns a distinct terrain composition, while maps from the same epoch remain recognizably part of one region. Later terrain waves consume their published factory mask tables directly; accepted assets remain snapshots of the table version that authorized them.

The current assets are render-first pilots. They do not change runtime code or authorize the art mesh as gameplay elevation. Exact asset names, measurements, hashes, rebuild profiles, and wave-specific evidence live beside the builders under `assets/pilots/map-rebuild-spike/` and `artifacts/map-rebuild-spike/`; this handoff keeps only the durable authoring principles.

## The regional-family rule

Consistency and uniqueness operate at different scales.

The region owns the visual grammar:

- stained ochre, rust, dusty umber, mud-brown working water, and sparse slate accents;
- the same processed bank and river source plates, engraved surface rhythm, deep value range, and damaged edge treatment;
- weathered timber, dark iron, frontier canvas, river stone, and sparse acclimated vegetation;
- the same illustrated proportions and camera language.

Each contract owns the composition:

- a separate terrain mesh and atlas treatment;
- a different macro silhouette and enclosure pattern;
- a different water, crossing, or scarcity read where the contract permits it;
- a different spatial rhythm, focal landmark, and story condition.

Do not satisfy a new contract by reopening another map's `.blend` and moving a few props. Reuse the regional source plates and procedural helper vocabulary; rebuild the landform and composition.

## The grit law

Composition and material language are separate verdicts. A strong silhouette can still fail if smooth clay, pastel water, or untouched ground makes the frontier feel recreational.

Terrain atlases must begin with the shipped painted terrain tiles. Kit plates set the value range; contract plates set the hardship target. The useful regional vocabulary is stained earth, engraved cuts, dragged and wheel-worn routes, dumped tailings, blast or scorch pockets, mud-fouled banks, and rough water with dark flow structure. Damage is composed around work, conflict, and travel; a uniform grunge filter has no story.

Keep tended ground as an exception earned by visible effort. Crops, a maintained camp, or one surviving spring become meaningful because the surrounding land is hard. Warm light remains welcome, but warmth must not flatten the value range or turn water resort-green. Hardship is never permission for gore.

Buildings must obey the same law even while they are composition proxies. A frontier structure can be maintained without looking new: show stained stock, oxidized sheets, dark foundations, visible repairs, uneven roof seams, debris at the contact edge, and one or two condition-specific failures. Do not rely on a brown noise overlay alone. Wear must alter the silhouette or construction story at the gameplay camera. Dry Gulch therefore carries a failed roof, shortened chimney, collapsed canopy, and fallen panel; The Claim keeps the same regional construction language but reads as patched and still working. Twin Banks, Night Shift, and Baron reuse the repair vocabulary without reusing the same building condition.

## Contract identities

The Claim is the county's open, maintained working valley. Its river, central ford, active extraction, camp, and riparian edge make it the visual baseline.

Dry Gulch is an enclosed failed basin. Its only spring, draining washes, ruins, cactus, bones, and hotter exposed ground make scarcity visible.

Twin Banks is a broad damp floodplain divided into two settlement shelves. Its wider water corridor, two fords, submerged gravel bars, oversized paired river winches, opposing homesteads, and irrigated furrow fields make the two-front contract legible.

Night Shift is a rock-bound work corridor shaped around the seven contract lanterns. It keeps the county's river and material language, but uses dark shoulders, a lampworks yard, cold pools, and one warm relight to organize space.

The Baron is an occupied river fortress. It preserves the same canonical river and ford mask as The Claim while giving the land its own far-bank hierarchy, siege trench, bastions, guard towers, seized industry, rocket cart, and oxblood occupation language.

Hill Mine is a scarred three-tier steamworks hillside above a flooded east-west rail cut. Five split build terraces, one central impassable cliff, switching mine spurs, a high mine-mouth mount, and a low boiler site make its north-rising hierarchy explicit.

Trestle is a low two-bank gorge organized by one north-south rail spine and bridge across east-west water. Two opposed approach zones and boiler mounts, one southern spur, and a flatter horizon keep it unmistakable from Hill Mine while the E2 rust, soot, timber, water, and engraved paint remain shared.

Pressure Garden is a north-bank industrial cultivation climb. Three boiler beds, two hard-won growing terraces, an upper coal bed, and four stepped height bands make pressure management and exhausted production visible without turning the desert lush.

Incline is a twin funicular cut. Two parallel north-south rail lines cross the river at separate authored fords and climb through a lower engine yard, landing yard, west bench, and upper ore yard. The rails and stronger 3.8 m rise make its route hierarchy unlike every other E2 map.

The older recommendation to reuse The Claim's terrain for Night Shift and Baron is superseded. Sharing a runtime water topology does not require sharing a render mesh.

## The planar law

Terrain art is never a second gameplay coordinate system. Epoch 1 remains planar. Hill Mine and Trestle already have factory-authored `TileHeight` simulation; that code remains the sole elevation, slope, traversal, range, and line-of-sight authority. The render mesh follows it through `Terrain.visualY` but never replaces it. Movement, collision, spawns, pickups, build placement, and water classification remain code-owned on game X/Z.

This is also a combat rule. If visual hills became collision or reachability, the long-range heroine could occupy perches opponents cannot contest. A rope or climb mechanic would require shared hero/enemy traversal and shooting rules; it is outside this terrain ladder.

Every visible participant must eventually sample the same render height. Hero, opponents, buildings, pickups, effects, and shadows cannot each invent their own grounding rule. Dynamic buildings need a padded footprint sample rather than one center point.

## Water remains simulation truth

The visible shoreline must describe the code-owned water mask. A terrain may sculpt a deeper channel, submerged bars, bank shoulders, and ford approaches inside that mask, but it must not paint a dry crossing or side channel the simulation does not recognize.

The Claim, Night Shift, and Baron intentionally share one river/ford topology while using separate landforms. Twin Banks follows its wider descriptor and two fixed fords. Dry Gulch follows its spring and wash descriptor. The exact masks belong to the contract registry and builder profiles; do not transcribe them into new art notes.

For a genuinely irregular future river, reverse the order: author water, ford, build, fixture, and spawn masks in the map editor first; sculpt Blender terrain to that manifest second.

Epoch 2 currently exposes one descriptor conflict. Hill Mine and Trestle declare `water.visualHalfWidth = 10`, but gameplay classifies deep water only at `z=-5..5`, shallows through `+/-6.25`, and placeable bank beyond. The spike ends visible water at `+/-6.25` so a sluice-valid bank never looks submerged, while preserving the complete factory table in each machine contract. Promotion needs an owner/factory ruling before runtime wiring; do not silently expand the visible river or shrink placement to make the values agree.

## Authoring principles

Compose named landforms rather than applying broad noise. Shelves, washes, tailings, trenches, hummocks, bastions, and rock shoulders create place identity; generic undulation only makes a plate lumpy.

The common rectangular tile footprint is an integration boundary, not a level identity. Make the internal silhouette do the work: vary the width and scarcity of water, the position and strength of terraces, the enclosure rhythm, the mass of the focal landmark, and the distribution of occupied versus empty ground.

Protect gameplay aprons explicitly. Strong relief belongs around the visual hierarchy, not across the primary build or crossing read. A dramatic outer silhouette can coexist with a calm central plane.

Clutter needs clusters and gaps. Uniform scatter reads as a generator. Use a few material families in uneven groups, vary silhouette and orientation, and keep negative space around the primary route.

Landmark proxies answer composition questions only. They are deleted before save/export and must not silently become collision or placement owners. Production landmarks ship as separate mounted assets. Each terrain contract owns data-driven mount records in game coordinates; their vertical offset is applied through `Terrain.visualY`. Exact ids and transforms belong in the adjacent contract JSON, while fixture and build-exclusion footprints remain editor- or manifest-owned gameplay data.

Judge the map from the real run camera before polishing a low angle. The low angle exposes relief; the run camera decides whether the player will actually experience it.

## Load-bearing masks and motor-era landforms

A circular build site is a surface contract, not a vertex contract. Flattening only terrain-grid vertices inside the authored radius can still leave sloped triangles crossing the disk edge. Carry the calm plateau one grid-cell diagonal beyond the mask, then sample points across the exported triangle surface. The factory table remains the position and radius authority; the extra margin exists only to make interpolation honor it.

Night terrain needs a paired readability gate. Relief, atlas range, and the dusk rig must be judged together at the run camera: a valid ridge can disappear when engraved ground and route ink collapse into one blue-black value. Preserve deep shadow, but give critical routes a construction shoulder and enough raking light for the landform to read without diagnostic overlays. Warm pools may organize survival space; they cannot substitute for readable ground.

Motor-era identity belongs in landform as well as paint. A dominant ring road should have a worn crown, twin wheel cuts, and displaced shoulders before tar and rut colour reinforce it. If the geometry is nearly flat and the atlas carries all the contrast, the ring reads as a decal. Broad tar pockets remain useful damage language, but they must not erase the hierarchy between orbit, haul road, stain, and shadow.

Panorama seams can be shading failures even when the atlas is continuous. A flat-shaded cylindrical backplate produces repeated vertical value panels under a lit evidence rig; inspect the atlas separately before diagnosing stitching. Smooth the scenery normals and keep the zenith quiet. More depth layers are not automatically better: if a far belt echoes the near ridge as another continuous ribbon, remove the redundant belt and let one irregular occluding ridge plus haze establish distance.

## Exterior county policy

The playable tile must feel cut from a larger county rather than placed on a flat backdrop. Every Epoch 1 verdict now uses a 160 m render-only surround that continues the tile's landform, water truth, work scars, and contract story past the playable boundary. This is an art-direction policy, not a runtime vista system.

Apply these rules together:

- Build one temporary welded tile-plus-county surface for verdict renders. Two touching meshes create a ruler-straight shadow and value seam even when their edge heights match.
- Hide the export terrain only while drawing that welded surface. Delete the surround, water, lights, cameras, and landmark proxies; restore the original terrain before save and export.
- Preserve simulation truth. Continue water only where the contract has water, keep visible banks aligned with the water mask, and never imply a new ford, dry island, build area, or traversable elevation.
- Use the shipped painted bank and contract plates as the soil language. The exterior must inherit stained earth, dragged routes, murky working water, deep shadow pockets, and damaged extraction traces rather than switching to clean procedural clay.
- The desert has no trees. Cacti are the only tall vegetation. Use several scales and uneven clusters rather than a regular scatter; reeds may appear only at valid water edges.
- Keep landmarks as mounted assets. Exterior headframes, winches, ruins, lantern works, and towers are composition proxies only and must never be baked into the terrain or become collision owners.
- Share a regional grammar but not a horizon composition. Ochre geology, sparse cacti, murky water, rough timber, iron, and extraction damage identify one county. Each contract still needs a different enclosure, skyline, route continuation, and outer work scar.
- Gate at the cameras that expose failure: identical shifted-edge before/after, the real run camera, one low sunset angle, and a fresh unprimed “fight or holiday?” critique. A flattering overview cannot waive a visible seam.
- Require binary proof that the saved GLB and embedded atlas are unchanged when a wave changes only verdict surrounds.

The map signatures are deliberately different:

- The Claim remains the open working valley: two S-curve river exits, layered shelves, tailings, and a distant headframe.
- Dry Gulch closes into a failed basin: two dry washes continue outward, the mesas enclose rather than open, a collapsed stamp frame marks abandonment, and no exterior water is invented.
- Twin Banks opens into the widest floodplain: the broad channel continues between low opposed shelves and paired outer-bank winches reinforce the two-front river economy.
- Night Shift becomes a dark rock corridor: the enclosing shoulders continue outward along an outer lantern road toward a distant lampworks stack.
- The Baron points toward occupied country: a fortified far-bank horizon, paired outer watchtowers, and an extraction ridge extend the siege hierarchy beyond the tile.

The first Claim pass established the welded-surface solution. The four-map application proves that the same construction rule can support separate contract stories, removes the remaining tree proxies, and keeps every saved playable terrain export unchanged. The fresh review still rejects these exteriors as production art: close edge views expose soil and water cuts; water is too flat and opaque; far geology repeats a small slab vocabulary; cactus color and spacing can feel staged; Night Shift loses forms in black; and some outer landmarks are too small to own the skyline. Treat those as mandatory promotion work, not as reasons to weaken the planar law or bake the previews into shipping terrain.

## Panorama policy

The distant sky and far rim are not part of the terrain surround. Each map owns a separate mounted `<map>-panorama.glb` with a corresponding `.blend`, embedded atlas, machine contract, and `panoramaMount` record in the terrain contract JSON. The current mount is county origin with identity rotation and scale; changing that transform remains data work, not a terrain edit.

PANORAMA LAW v2 turns each asset into one mesh below the 4,000-triangle ceiling containing a 190 m sky ring, a closer sloped ridge belt, and—on the later profiles—a polar county apron outside the playfield. The E1 and first E2 assets use 1,920 triangles; Pressure Garden and Incline use 2,112. The ridge remains centered at 161.5 m at its foot and 174 m at its crest, with irregular radial offsets recorded in each contract. Every panorama still uses one material and one embedded 2048² atlas. The ring, ridge, and apron are scenery inside the panorama asset, never terrain, collision, masks, or gameplay bounds.

The v2 atlas is baked from the matching shipped epoch kit plate without enlarging its painted cloud mass across the cylinder. E1 uses its processed kit; all four E2 maps use the processed E2 kit, with Hill Mine's dedicated contract plate as an additional hardship reference. The plate supplies parchment value and engraved ink; a tree-free central sky crop is horizontally filtered so vertical marks cannot become a desert treeline. Engraving is dense only in the low horizon band and grades continuously to near-plain parchment at the zenith. Four asymmetric cloud edits and one contract-specific wind-scoured dust feature break the repeating strip. The faint far ridge and closer physical ridge use independent map-specific profiles, so the same hump cannot echo at two depths.

The county remains warm while the far edge can darken: Claim stays open but dust-hardened, Dry Gulch bleaches toward unequal mesas, Twin Banks keeps low opposed river-country shelves, Night Shift cools around one stubborn warm break, and Baron pushes toward an occupied oxblood rim. Map-specific linear exposure is baked into each atlas because glTF's unlit material has no Blender Background-strength socket; the mounted GLB therefore preserves the authored restraint instead of reverting to a common emissive value.

Panoramas are scenery only. Their GLBs declare that they affect no playfield bounds, spawn edge, fog gate, water/build/spawn mask, or terrain height. They cast no verdict shadow, never enter the terrain `.blend` or GLB, and re-export byte-identically from their own authoring files.

`all-contracts-panorama-mood-ab.png` is the panorama mood gate: painted plate, the same low camera without the backplate, and the mounted result. `all-contracts-panorama-distance-gate.png` adds one uncropped 16:9 center-playfield horizon look per map, retaining the full zenith and terrain join. The first v2 candidate passed distance only narrowly and still failed holiday, echo, and tree-like-combing review. The correction desaturated the doubled orange tint, separated near and far ridge profiles, removed fine vertical plate marks, and added asymmetric dust structure. Once the gate retained the whole source frame, it exposed remaining matte bands in Twin Banks and Night Shift; their center-facing ridge profiles now open into low passes, while a lighter eroded near-ridge texture replaces the black slab. Claim and Baron carry stronger wind-scoured dust at the owner camera. A final fresh review, backed by a neutral second look, passed all five questions: distance rather than wall/ceiling, fight rather than holiday, no repeated echo, no tree-like contamination, and complete evidence framing.

## Landmark source ladder policy

Landmarks ship as separate mounted bodies. For every mount id, search in this order: reuse an existing project GLB; derive the missing condition or composition from exact shipped paint and existing shapes; build new only when neither source exists. Record the selected tier and source paths in the pack contract. Do not call a generator after a higher rung has already supplied an adequate body.

Keep the source vocabulary shared and the contract story local. Boiler houses, lanterns, palisades, sluices, wagons, coal bins, pipe runs, claim offices, stamp mills, and railcar parts create one regional family. Their arrangement, condition, supporting geometry, and atlas treatment must still answer the individual contract: working Claim camp, abandoned Dry Gulch, opposed Twin Banks, nocturnal lampworks, occupied Baron bank, terraced Hill Mine, or industrial Trestle approaches.

Each map pack owns one `.blend`, one atlas no larger than 2048² shared by all bodies in that pack, one contract, and one GLB per mount id. The current wave uses 1024² because the run-camera bodies do not benefit from four times the pixels. Each GLB must be base-centred, use one mesh/primitive/material/embedded atlas, stay at or below 3,000 triangles, and carry `render_only`, mount id, map pack, era, source tier, and `simulation_authority=none`. The terrain contract owns position, rotation, scale, and asset path. Gameplay footprints remain map-editor or manifest data; never infer collision, placement exclusion, movement, range, or masks from a landmark body.

Map-wide bodies need one extra authoring step. A single mount samples `Terrain.visualY` only at its origin, so distributed rigid pieces—ford stones, lanterns, cacti, banners, sleepers, palisades, and approach props—must be baked at terrain-relative local heights before they are joined. Preserve each piece's rigid silhouette; do not bend a house or post to the mesh. Record the base-centering compensation as `terrainConformOffsetY`, and subtract the previous generated value before rebuilding so the operation is idempotent. Night Shift's seven lantern bodies are derived directly from `e1-night-shift.tileParams.prePlacedBuildables`; promotion must replace or skin those fixtures, never add a second gameplay lantern set.

The current wave resolves all 36 mounts across seven maps: 15 reuse, 9 derive, and 12 build-new. `all-landmark-packs-verdict.png` is the compact source/body/mounted gate; `all-landmark-packs-proxy-ab.png` compares the previous composition proxies with the mounted result. The strict verifier requires exact terrain-mount equality, per-map shared-atlas identity, budgets, base-centred bounds, safety metadata, and byte-identical plus semantic-identical isolated re-export from every pack `.blend`.

The fresh release sequence rejected a clipped Baron focal body, moved and enlarged its seized headframe, then used a separate contact probe to catch flat-local-Z distributed packs. After terrain-relative grounding and factory-aligned Night Shift lanterns, the final board passed at 96% confidence with no blocker. Twin Banks shoreline voids, Night Shift edge clearance, Hill Mine support contact, and Trestle outer approaches remain promotion polish; tree evidence is inapplicable because the desert law forbids trees.

## Coordinate and export contract

Author terrain vertices as `(gameX, -gameZ, visualHeight)` in Blender. Blender's glTF conversion then lands at Three.js/game `(X, visualY, Z)`. Game-space yaw becomes negative Blender Z rotation.

The saved authoring files contain one terrain mesh and one material. Water, ford stones, landmarks, cameras, lights, and backdrop are temporary verdict helpers and must be removed before save/export.

Each terrain stays under the queue budget with one embedded painted atlas. The build scripts are authoritative because they preserve the custom `render_only`, `sim_surface=planar`, contract identity, water truth, and `Terrain.visualY` extras.

The generic `scripts/reexport-pilot.sh` is useful as a geometry/material probe, but it is not the final exporter until its metadata behavior is deliberately aligned with these builders. Its current export call omits `export_extras=True`; running it in place strips the render-only and non-interference node metadata from terrain and panorama GLBs. Use the dedicated verifier for final byte-identical re-export, or run the generic wrapper only on disposable copies.

## Rebuild and evidence

The Claim and Dry Gulch have dedicated builders. The remaining profiles live in `build_unique_contract_terrains.py`; invoke that builder once per profile rather than using the legacy state-render entrypoints.

Build the five panorama assets before rebuilding terrain verdicts, because the terrain builders mount those GLBs only for renders:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/build_contract_panoramas.py
```

After running the five terrain builders, rebuild every current comparison board from those fresh frames. This script uses Pillow and automatically selects the bundled Codex workspace Python when the shell's `python3` does not provide it:

```sh
python3 assets/pilots/map-rebuild-spike/build_verdict_boards.py
```

Run the strict gate after rebuilding:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/verify_contract_terrains.py
```

The authored E2 family uses the same panorama builder and one mask-driven terrain builder. Build the panorama GLBs first because the terrain pass mounts them only for evidence renders:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/build_contract_panoramas.py -- hill-mine trestle pressure-garden incline
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/build_e2_contract_terrains.py -- hill-mine trestle pressure-garden incline
/Users/robin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 assets/pilots/map-rebuild-spike/build_e2_verdict_boards.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/verify_e2_contract_terrains.py
```

Build and gate the current seven-map landmark wave after the terrain and panorama files exist:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/build_landmark_packs.py
python3 assets/pilots/map-rebuild-spike/build_landmark_verdict_boards.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/pilots/map-rebuild-spike/verify_landmark_packs.py
```

`build_e2_contract_terrains.py` resolves each contract in `assets/contracts/epoch-2-steamworks/contracts.json` and, where published, copies the matching file in `assets/contracts/epoch-2-steamworks/mask-tables/` exactly. It does not keep a second hand-copied mask table. `verify_e2_contract_terrains.py` requires exact equality with those sources, one terrain and panorama per authored id, whole-file byte-identical re-export, and the current owner boards. It also writes `e2-mask-availability.json`. If a granted map's authored table is absent, stop at the availability finding—do not infer masks from briefing prose or a previous map.

The verifier reopens every terrain and panorama `.blend`, parses every GLB, checks the embedded atlases, both mount schemas, budgets, and non-interference extras, re-exports to temporary files, probes contract-defining terrain geometry, requires distinct terrain and panorama identities, pins decoded evidence pixels by content hash, and confirms `src/` remains untouched. Pixel hashing deliberately ignores Blender's changing `Date` and `RenderTime` PNG metadata. The terrain builders render the exported terrain before enabling the county helper, then write a separate panorama-off frame before mounting the ring; stale or duplicated evidence is therefore not an acceptable rebuild.

The current material verdict is `all-contracts-mood-ab.png`: each shipped contract plate sits beside the matching sculpted run camera. It answers “fight or holiday?” before any flattering low-angle render is considered. `all-contracts-building-grit-ab.png` isolates the building correction against the previous committed renders: mottled plastic boxes become patched working stock, abandoned remains, repaired sheds, or an occupied damaged compound.

Exterior evidence has three jobs. `all-contracts-exterior-ab.png` is the identical shifted-edge before/after proof for Dry Gulch, Twin Banks, Night Shift, and the Baron. `all-contracts-exterior-low-verdict.png` compares their contract-specific horizon stories. `all-contracts-exterior-edge-crops.png` deliberately magnifies the remaining seams and water defects. The Claim's original `the-claim-exterior-ab.png` remains the direction record. The earlier regional-family and layout boards remain composition evidence, not current material evidence.

Panorama evidence has two current gates. `all-contracts-panorama-mood-ab.png` includes the painted plate in every row as required by the grit law and separates the terrain-only frame from the mounted backplate frame. `all-contracts-panorama-distance-gate.png` uses center-playfield cameras to expose the wall, ceiling, and echo failures that a flattering low angle can hide.

The unprimed terrain critique answered “fight” with 78% confidence before the final water and hatching correction. Its terrain criticisms—green fabric-like water and insufficient engraved cuts—drove the atlas pass. A later building-focused critique rejected the first weathering attempt because it changed color more than construction. The correction added condition-specific structural failure, contact foundations, roof seams, repair sheets, braces, missing wall teeth, and debris while keeping every structure temporary and mount-owned. Fresh review still correctly identifies a proxy ceiling: complete painted wraps, readable hardware, end grain, and production-grade edge wear belong to the separate mounted-landmark wave. No verdict board proves runtime loading, placement, disposal, performance, or gameplay behavior.

A fresh visual critique rejected the first five-map board because Twin Banks still read too closely to The Claim at the gameplay camera. The final Twin Banks verdict therefore moves both homesteads into the readable frame, aligns much larger winches with its two fords, adds opposed furrow-field rhythms, and keeps the wider river and wet gravel bars as the dominant middle band. That is the useful review pattern: fix the run-camera read, not the label.

For E2, `e2-owner-verdict.png` holds the real camera, whole-tile view, and low sunset for all four authored maps. `e2-mood-ab.png` is the hardship gate; Hill Mine uses its same-map painted plate, while Trestle, Pressure Garden, and Incline honestly use shipped flat runtime frames where no dedicated painted plate exists. `e2-flat-vs-sculpted-ab.png` keeps camera and material identical. `e2-mask-agreement-board.png` exposes build zones, stakes, rails, water, banks, and Pressure Garden's authored coal seams. The two Panorama v2 boards retain the full zenith and join. `e2-final-flat-sculpted-telemetry.png` locates the fixed-framing geometry changes without treating pixel distance as an acceptance score.

## E2 gate state

- Factory-authored ids: Hill Mine, Trestle, Pressure Garden, and Incline — PASS
- Missing factory-authored ids: none
- Four unique 96 m terrain assets: one mesh/material/embedded 2048² atlas, 32,768 triangles each — PASS
- Four separate Panorama v2 assets: one mesh/material/embedded 2048² atlas, 1,920–2,112 triangles each — PASS
- Exact factory mask copies, landmark and panorama mounts, water-bank ruling, and source ledger — PASS
- Dedicated whole-file byte-identical and semantic-identical re-export with node extras for all eight GLBs — PASS
- Generic `scripts/reexport-pilot.sh` final-export compatibility — BLOCKED; it strips required extras, so use it only on copies until the shared factory script is aligned
- Mood, identical-camera geometry, run/overview/sunset, mask, panorama before/mounted, and full-frame distance evidence — PASS
- Fresh unprimed review: distinct maps, FIGHT, no trees, DISTANCE, legible masks, no visual blocker — PASS
- Runtime loading, disposal, placement, performance, and gameplay — deferred to attended promotion

## Shortest safe promotion

Promote one terrain and its separate panorama mount at a time behind a default-off visual pilot. Keep shipped water and ford ownership, route every rendered participant through `Terrain.visualY`, and prove movement, collision, range, spawning, placement, playfield bounds, spawn edges, and fog gating remain unchanged.

Promote only the landmark families the owner approves. Mount transforms already live with the terrain contracts, but the map editor or contract manifest must still own gameplay footprints. Do not build a universal terrain system or rope traversal mechanic merely to load these render assets.

The durable test is simple: shared regional grammar, contract-owned composition, one planar gameplay truth.
