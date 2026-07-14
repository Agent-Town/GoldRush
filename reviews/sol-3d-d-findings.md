---
source: codex
project: Gold Rush
date: 2026-07-14
type: digest
branch: sol/map-rebuild-spike
---

# Session 3D-D — five unique Epoch 1 contract terrains

## Result

The reuse shortcut is removed from the final terrain set. The Claim, Dry Gulch, Twin Banks, Night Shift, and the Claim-Jumper Baron now each own a separate Blender file, GLB, painted atlas, contract record, terrain heightfield, owner-verdict composition, and data-driven landmark mounts.

The first Epoch 2 wave now adds the two contracts that actually have factory-authored mask tables: Hill Mine and Trestle. Both ship as terrain/panorama pairs in the spike. Pressure Garden and Incline are held at the mask gate rather than fabricated from manifest prose.

They remain one region by sharing the same painted source plates, stained ochre/rust/river-stone palette family, rough working-water language, sparse acclimated vegetation, illustrated proportions, and camera grammar. They differ at the level that matters to play: macro silhouette, enclosure, water/ford read, spatial rhythm, focal landmark, and story condition.

No `src/` file changed. Simulation, collision, placement, spawns, range, line of sight, and water classification remain code-owned. Epoch 1 remains planar; Epoch 2's existing factory `TileHeight` remains the sole elevation authority. The art mesh never becomes a second simulation surface. All landmarks, water surfaces, ford stones, lights, and cameras shown in verdict renders are temporary helpers removed before terrain save/export.

The durable design and rebuild guidance is in `artifacts/map-rebuild-spike/MODEL-HANDOFF.md`. Exact asset measurements and hashes live in the adjacent terrain contracts and `artifacts/map-rebuild-spike/verification.json`.

## Findings

### F-3D-D-01 — Regional cohesion belongs to the grammar, not to duplicated land

Evidence: `artifacts/map-rebuild-spike/all-contracts-regional-family-verdict.png` compares all five real run-camera renders at identical framing. The ochre/rust substrate, water and stone family, sparse greens, timber/iron props, and illustrated scale read as one county. River width, dry-basin scarcity, lantern light, and siege occupation separate the contract stories.

Decision: future Epoch 1 contracts may reuse source plates, material recipes, vegetation species, and prop construction language. They must not reuse another contract's exported terrain mesh as their identity solution.

### F-3D-D-02 — Every contract now owns a distinct render asset

Evidence: `assets/pilots/map-rebuild-spike/verify_contract_terrains.py` requires five unique geometry fingerprints, five unique GLB hashes, and five unique embedded-atlas hashes. The current machine result records `5 / 5 / 5` under `identityChecks`.

This is stronger than renaming files or moving props. The check hashes the saved vertex positions separately from the complete GLB and texture payloads.

### F-3D-D-03 — Shared runtime topology does not imply shared render terrain

Night Shift and the Baron still point at the `frontier-river-claim` runtime tile because their canonical river, ford, placement, and spawn semantics are unchanged. Their GLBs carry separate `contract_id` metadata and separate visual heightfields.

Night Shift uses side shoulders, lantern terraces, and a work corridor. Baron uses an occupied far-bank plateau, trench, bastions, and a calm player approach. Both preserve the same river/ford mask as The Claim without reopening The Claim's Blender file.

### F-3D-D-04 — Twin Banks is honest about the current water descriptor

Twin Banks now has a separate broad floodplain mesh, two asymmetric settlement shelves, two fixed fords, two gravel bars, oversized paired riverbank winches, opposing homesteads, and irrigated furrow fields. Its water surface remains one wide code-owned band because the current descriptor does not authorize irregular side channels.

The contract prose calls the river braided; the present honest rendering communicates braiding through submerged gravel bars and two crossings, not through fake dry islands or channels that would disagree with runtime water sampling. A true multi-channel silhouette still requires an authored water-mask capability first.

### F-3D-D-05 — The planar law prevents uncontestable firing perches

All five GLBs declare `render_only=true`, `sim_surface=planar`, and `height_socket=Terrain.visualY`. Their heightfields are visual grounding data only.

If any hill became collision, reachability, cover, or line-of-sight truth, the long-range heroine could occupy ground opponents cannot contest. Rope traversal remains outside this ladder because it would require shared hero/enemy traversal and shooting rules, not just a character animation.

### F-3D-D-06 — Landmark proxies are composition evidence; production landmarks are mounted

The verdict builds use deterministic low-poly landmarks to test focal scale, rhythm, and contract story. They do not reach the complete painted-wrap standard of the approved town building work, and none survives in a saved terrain file.

Every terrain contract now carries five mount records with id, position, rotation, and scale in one declared coordinate space. Production landmarks remain separate GLBs attached through those records. Editor- or manifest-authored fixture, build-exclusion, and routing footprints are still required; neither Blender bounds nor mount data becomes gameplay collision.

### F-3D-D-07 — Night identity must remain playable, not merely dark

The first unique Night Shift pass hid its new terrain under near-black lighting. The final verdict keeps cold moon orientation, uses near-black muddy water rather than luminous blue, and gives the central relight a broad warm pool. The map still reads as night, but the work corridor, ford, and bank shapes remain visible at the real play camera.

The low-angle render contains a strong warm reflection on the water. Treat that as an atmospheric verdict effect, not a promise about the production water shader.

### F-3D-D-08 — Baron occupation must enter the run-camera frame

The first unique Baron pass concentrated its fortress on the far bank, leaving the player-facing half visually empty. The final composition adds side guard towers, broken barricades, a supply cache, and near-bank standards while retaining the far-bank headframe, siege line, tents, rocket cart, trench, and bastions.

The real run camera still crops the tops of the side towers. The overview is therefore required for the full macro verdict. Production landmark layout should be playtested before those proxies receive final geometry.

### F-3D-D-09 — The builders, not the generic re-export script, own safety metadata

Each authoritative build removes helper geometry before save, exports one terrain mesh with one rough non-metallic atlas, and records render-only, planar, contract, water, and height-socket metadata.

The strict verifier independently re-exports each `.blend` to a temporary GLB and compares its binary payload and semantic contract. `scripts/reexport-pilot.sh` remains a useful geometry/material/budget probe, but should not replace the builder output until its metadata behavior is deliberately aligned.

### F-3D-D-10 — Run-camera review must be allowed to reject a technically unique map

A fresh unprimed visual critique accepted the regional cohesion and the distinct reads for Dry Gulch, Night Shift, and Baron, but rejected the pre-final Twin Banks board because its broad river-and-buildings read still rhymed too closely with The Claim.

The final pass did not change labels to manufacture distinction. It enlarged and moved the paired winches and homesteads into the gameplay frame, added opposed furrow-field rhythms, and retained the two fords, wider water band, wet bars, and asymmetric shelves. The machine identity checks remain necessary, but the identical-camera board is the higher-value art-direction gate.

### F-3D-D-11 — Material hardship must come from shipped paint, not generic noise

The accepted compositions initially failed because their clean clay surfaces, even lighting, and green water read as a holiday. The rebuilt atlases give the shipped terrain tiles meaningful weight, use kit and contract plates for value and palette targets, restore engraved cuts in shadowed source marks, and compose wear around each map's work or conflict story.

This is not a permission slip for a universal dirt overlay. The Claim carries camp and extraction wear; Dry Gulch carries failed workings, mineral crust, and washes; Twin Banks carries dragged floodplain marks around tended fields; Night Shift carries soot pockets and a worked road; Baron carries occupation rust, trench damage, and scars. Tended areas remain readable by contrast.

### F-3D-D-12 — Working water cannot read as a recreational color band

The visible verdict-water helpers and exported atlases now use rough mud-brown or near-black water, dark flow structure, subtle fouled foam, and stained bank transitions. The sim-owned water and ford masks did not move.

This correction matters because the broad water band dominates three run-camera frames. A resort-blue or saturated green strip can reverse the mood of an otherwise hard landscape.

### F-3D-D-13 — The mood gate passed, with measurable remaining landmark debt

`artifacts/map-rebuild-spike/all-contracts-mood-ab.png` is the terrain acceptance board. A fresh unprimed critic answered “fight” at 78% confidence before the final hatching and working-water correction. The critique's ground and water defects were corrected. Its prop warning later became the explicit proxy-weathering pass in F-3D-D-14; complete painted wraps remain separate mounted-landmark work.

The source plates retain higher edge density and usually higher contrast than the run-camera renders; that telemetry is diagnostic, not a pixel-parity score, because the pairs do not share geometry or framing. It correctly exposes that temporary low-poly landmark proxies cannot carry the painted plates' full abrasion language. The terrain verdict therefore passes without promoting proxy props to production art.

### F-3D-D-14 — Building hardship must change construction, not merely color

Evidence: `artifacts/map-rebuild-spike/all-contracts-building-grit-ab.png` compares the previous committed run-camera buildings with the corrected proxy set. The first attempted correction only darkened and mottled the primitives. A fresh unprimed reviewer rejected it because Dry Gulch still looked intact, the Baron damage read as a seam, and repair states disappeared at the gameplay camera.

The correction keeps a shared regional construction vocabulary but gives it visible condition states. The Claim is patched and working; Dry Gulch has a failed roof, shortened chimney, collapsed canopy, and fallen roof panel; Twin Banks and Night Shift use dark foundations, roof seams, bracing, and work debris; the Baron loses wall teeth, carries impact repairs, and once again casts contact shadows. All of this remains verdict-only helper geometry deleted before save/export.

A second fresh critique still rejected these as production buildings: doors, fasteners, wall framing, lifted patch edges, soot, end grain, and human-scale hardware do not survive the real run camera consistently. That is a useful boundary rather than a terrain blocker. The owner can judge the new condition language now, but shipping buildings still require separate mounted GLBs, authored gameplay footprints, and their own close/render/game-camera gate.

### F-3D-D-15 — The exterior is regional grammar; The Claim keeps its own horizon story

Evidence: `artifacts/map-rebuild-spike/the-claim-exterior-ab.png` compares the same low sunset camera before and after the county pass. The flat brown void becomes a 160 m desert valley with a continuous S-curve river, layered rock shelves, cacti, a tailings shoulder, and a distant extraction silhouette. `owner-run-camera-east-edge.png` uses the real run-camera angle shifted to the east boundary so the playable seam cannot hide outside the frame.

The first attempt failed a fresh visual review. It repeated the 64 m atlas as obvious squares, left a vertical edge seam, kept the river nearly black, and used trapezoidal mesa proxies that read as walls. The correction renders one temporary welded tile-plus-county surface, blends the shipped bank plates at world scale, continues one water ribbon through the whole view, replaces trees with cacti, pushes the horizon to 160 m, and replaces the trapezoids with layered faceted rock shelves. A second fresh review accepted the result as an exploration spike.

The acceptance is deliberately narrower than production approval. The shifted edge view still reveals a soil/value transition; the river remains too broad and slab-like; the far geology needs more layers; sunset compresses the value range; and the cactus distribution remains visibly authored. These are promotion findings, not permissions to change simulation. The saved terrain, water mask, ford, movement, collision, placement, spawns, and `Terrain.visualY` ownership are unchanged. The Claim GLB and atlas hashes remain byte-identical to the previous commit.

### F-3D-D-16 — One exterior construction policy now supports five different horizon stories

Owner authorization extended the accepted Claim direction to Dry Gulch, Twin Banks, Night Shift, and the Baron. Evidence: `artifacts/map-rebuild-spike/all-contracts-exterior-ab.png` compares the same shifted edge camera before and after each surround; `all-contracts-exterior-low-verdict.png` compares the resulting horizon compositions; `all-contracts-exterior-edge-crops.png` magnifies the transition instead of hiding it.

The shared implementation is one temporary welded 160 m county surface, shipped painted soil plates, cactus-only tall vegetation, faceted desert geology, contract-honest water continuation, and mounted landmark proxies deleted before save/export. Twin Banks' last tree proxies were removed. Dry Gulch adds an enclosing dry basin, two continuing washes, and a collapsed outer stamp frame with no invented water. Twin Banks adds the broadest floodplain, low opposed shelves, and paired outer-bank winches. Night Shift adds a rock corridor, outer lantern road, and lampworks stack. The Baron adds a fortified far-bank ridge and paired outer watchtowers. They share a county vocabulary without reusing one exterior composition.

The playable assets did not move. Rebuilding the four authoring files left their exported GLB and embedded-atlas hashes unchanged: Dry Gulch `1189f0ca…` / `73f24e3d…`; Twin Banks `d292a5d0…` / `421dda50…`; Night Shift `747eacb0…` / `a4c417ab…`; Baron `accf4035…` / `5b8721e3…`. Their contracts record `exported=false`, radius 160, cactus-only grammar, and a separate horizon signature.

A fresh unprimed review rejects the set as production art even though the owner-approved direction is materially better than the flat plates. It finds slab-like water and ruler-straight edge cuts, repeated small mesa silhouettes, staged bright cacti, underexposed Night Shift geology, and outer works too small to dominate the skyline. That verdict becomes policy: future promotion must repair the seam, water depth and shoreline, far-geology vocabulary, vegetation staging, night value separation, and landmark scale before these surrounds ship. It does not authorize runtime elevation, new water, or baked landmarks.

### F-3D-D-17 — Panoramas are mounted scenery, not enlarged terrain

The amended queue requires one separate background asset per contract. The five terrain contracts now mount `the-claim-panorama.glb`, `dry-gulch-panorama.glb`, `twin-banks-panorama.glb`, `night-shift-panorama.glb`, and `baron-panorama.glb` at county origin with identity rotation and scale. No panorama mesh survives inside a terrain `.blend` or GLB.

Each panorama is one inward-facing unlit ring with 1,536 triangles, one embedded 2048² material, no cameras/lights/animation, and explicit false flags for playfield, masks, spawn edges, and fog gating. Separate machine contracts record the `.blend`, GLB, atlas, mount, source plates, and non-interference statement. The strict gate reopens and byte-identically re-exports every panorama and requires five distinct GLB and atlas hashes.

The atlas path follows both owner laws. It samples the shipped processed Epoch 1 kit plate's engraved sky and far ridge, crops out the town tower and literal tree silhouettes, grades each contract separately, and keeps the distant darkening warm. `artifacts/map-rebuild-spike/all-contracts-panorama-mood-ab.png` compares the painted contract plate, the same low camera before mounting, and the mounted panorama. The first smooth-gradient treatment failed “holiday.” The final fresh unprimed verdict answers “fight” at 96% confidence.

Independent code review found that the first evidence implementation linked the panorama before both low-angle captures and replaced the exported terrain with the temporary county surface in the primary run-camera frames. The builders now keep the panorama hidden for terrain acceptance, render the exported 128-segment terrain first, write a genuine panorama-off frame, and only then reveal the separate ring. `build_verdict_boards.py` regenerates every current board from those fresh sources and auto-selects an installed Pillow runtime. The verifier pins decoded board/input pixels rather than Blender's timestamp-bearing PNG containers, and the edge board magnifies the boundary instead of fitting a full frame.

That mood pass is not production approval. Review still finds a low-ceiling/canopy projection, a hard horizontal join, repeated sky structure across Claim/Dry Gulch/Twin Banks, a far rim that can become too grim, and weak Night Shift ground readability. There are no literal panorama trees, but the dense engraving can suggest foliage at board scale. Production must solve projection and atmospheric integration without weakening the separate-mount contract or changing any gameplay boundary.

### F-3D-D-18 — PANORAMA LAW v2 converts the mounted strip into atmospheric distance

The v1 ring closed geometrically but failed as atmosphere. A hard terrain join produced the Painted Wall, vertically stretched engraving produced the Ceiling, and the same mirrored cloud/ridge structure produced the Echo. `artifacts/map-rebuild-spike/all-contracts-panorama-distance-gate.png` now holds one center-playfield horizon look for each contract so those failures cannot hide behind a low sunset composition.

Each replacement panorama remains one mounted GLB at the existing identity transform. Its one 1,920-triangle mesh contains the 190 m sky ring plus a closer sloped ridge occluder; one embedded 2048² atlas serves both. The contracts record and the verifier checks the irregular ridge's actual radius ranges, not only its center radii. Map-specific exposure is baked into the atlas because the exported unlit GLB cannot carry Blender's Background-strength socket. The atlas uses the shipped Epoch 1 kit plate for parchment value and engraved ink, but no longer enlarges the plate's painted cloud mass. Detail concentrates in the horizon band and quiets toward the zenith. A tree-free crop, horizontal ink filtering, asymmetric quadrant cloud edits, contract-specific wind-scoured dust, and independent near/far ridge profiles remove the canopy, vertical combing, and repeated hump failures.

The correction was review-driven rather than declared complete after the first rebuild. An intermediate fresh gate passed distance but blocked release because Claim and Twin Banks still felt scenic, near and far ridges echoed, and fine vertical marks suggested a treeline. The next correction desaturated the romantic double-warm tint, lowered those backgrounds, removed fine vertical ridge variation, and separated every far silhouette from its near occluder. Independent packaging review then found that the distance board cropped the source vertically, Blender's Background strength did not survive glTF export, and the contracts reported center radii rather than the irregular ridge's ranges. The final wave preserves each complete 16:9 frame, bakes exposure into the atlas, verifies actual radius ranges, opens low center-facing passes through Twin Banks and Night Shift, replaces their black ridge belt with an eroded dusty midtone, and drives harsher asymmetric dust through Claim and Baron. A fresh release gate, backed by a neutral second look, passed DISTANCE, FIGHT, ECHO, tree-contamination, and full-frame checks with no remaining panorama blocker.

The strict verifier reopens and byte-identically re-exports all five panorama authoring files, requires five distinct GLBs and atlases, pins both verdict boards and their source renders by decoded-pixel hash, and confirms no `src/` edit. Current panorama GLB hashes begin `e6746aff`, `fc4e1760`, `770e9269`, `315bbd9d`, and `fe1701de`. Terrain GLBs and embedded terrain atlases remain byte-identical; playfield bounds, movement, collision, spawn edges, fog gates, and all water/build/spawn masks remain planar and unchanged. F-3D-D-18 supersedes the visual debt recorded at the end of F-3D-D-17 without changing its separate-mount policy.

### F-3D-D-19 — E2 terrain begins at the factory mask table, not at the manifest promise

The granted E2 family names four contracts, but the current factory source `assets/contracts/epoch-2-steamworks/contracts.json` authors complete coordinate tables for only `e2-hill-mine` and `e2-trestle`. `e2-pressure-garden` and `e2-incline` remain manifest/ladder promises; their factory reports stopped before contract and mask authoring. `artifacts/map-rebuild-spike/e2-mask-availability.json` records a fresh probe of main at `dd308192`.

The spike therefore builds Hill Mine and Trestle and deliberately does not invent the other two. This is a gate, not a reduced ambition: terrain authored before water, build, rail, fixture, spawn, and elevation truth would force gameplay to conform to Blender. The next wave starts by re-probing the factory table and adds Pressure Garden or Incline only after each id exists there.

### F-3D-D-20 — Hill Mine and Trestle share material grammar, not composition

Evidence: `artifacts/map-rebuild-spike/e2-owner-verdict.png`, `e2-mood-ab.png`, and `e2-flat-vs-sculpted-ab.png`. Hill Mine is a north-rising three-tier scar with a central impassable cliff, split upper pads, flooded east-west rail cut, switching mine spurs, and a high mine-mouth mount. Trestle is a low two-bank gorge with one uninterrupted north-south rail spine, one narrow bridge mount, two opposed boiler sites, and a south spur. Their geometry, GLB, and embedded-atlas hashes are all distinct.

Both atlases are baked from shipped bank, river, rail-element, Epoch 2 kit, and available contract paint. They share stained ochre earth, soot iron, tarred timber, murky work water, sparse cacti, engraved shadow cuts, and hard warm light. The terrain export contains none of the shown rails, headframes, boiler remains, rocks, cacti, bridge structure, lights, water, or cameras. Those are mounted-pack composition proxies; the contract JSON carries their mount transforms.

The Mood A/B is intentionally honest about source coverage. Hill Mine uses its shipped painted contract plate. Trestle has no dedicated painted plate, so its row compares the shipped flat Trestle runtime capture against the sculpted real-camera verdict instead of relabeling The Claim fallback as same-map art.

### F-3D-D-21 — E2's water table contains a visual-width conflict; bank legibility wins this spike

Both factory entries declare `water.visualHalfWidth = 10`, while the gameplay classifier still owns deep water at `z=-5..5`, shallows through `+/-6.25`, and bank/sluice placement beyond that line. Rendering a ten-metre half-width surface would visibly submerge coordinates the simulation calls placeable bank, violating the queue's masks-agreement law.

The terrain contracts preserve the complete factory table and name the mismatch. Their verdict water ends at `+/-6.25`, their terrain beds stay below that surface inside the band, and their visible banks begin where placement says bank. This does not edit the factory descriptor or runtime. Promotion needs an owner/factory ruling: either rename/reinterpret `visualHalfWidth`, or align the runtime water mesh with the placement shoreline before loading these GLBs.

### F-3D-D-22 — The E2 pair carries Panorama v2 from its first render

Hill Mine and Trestle each mount a separate 1,920-triangle panorama GLB with one embedded 2048² atlas and identity transform. The Epoch 2 kit supplies the engraved paper and horizon ink; map-specific asymmetric ridge, cloud, and dust profiles keep the scarred high-country mine rim separate from the Trestle's lower river corridor. No panorama enters either terrain `.blend` or changes bounds, water/build/spawn masks, spawn edges, or fog.

`artifacts/map-rebuild-spike/e2-panorama-mood-ab.png` preserves identical before/mounted framing. `e2-panorama-distance-gate.png` retains the full zenith and terrain join. `e2-asset-contract.json` records one mesh/material/texture per asset, budget compliance, exact mask copies, distinct identities, and whole-file byte-identical re-exports for both terrains and both panoramas.

### F-3D-D-23 — The generic re-export wrapper strips required safety extras

The final packaging pass caught a false-positive workflow assumption. `scripts/reexport-pilot.sh` exports without `export_extras=True`; when run in place, it replaced all four valid E2 GLBs with files whose mesh nodes no longer carried `render_only`, simulation ownership, contract identity, mask non-interference, or Panorama v2 metadata. The strict E2 verifier failed immediately on the missing node extras. Rebuilding through the authoritative terrain and panorama builders restored the metadata, and isolated verification again proved exact whole-file byte identity when re-exporting with the contract settings.

The generic wrapper remains useful as a geometry/material probe only when run on copies. It is not a valid final exporter for these terrain/panorama assets until the factory aligns its options with `specs/town-3d/RECIPE.md` and the render-only metadata contract. This spike cannot edit that shared script under its path grant, so the incompatibility is recorded rather than hidden behind a passing geometry count.

### F-3D-D-24 — The Landmark Source Ladder produces one coherent wave without cloning one map

The seven current terrain contracts expose 36 mount ids. The ruled ladder resolves them as 15 reused bodies, 9 derived bodies, and 12 source-less new builds. Reuse starts from existing boiler house, lantern, palisade, sluice, stockpile, wagon, coal-bin, pipe-run, claim-office, stamp-mill, and railcar geometry. Derivation preserves those silhouettes or follows the exact shipped contract/rail paint. New builds are limited to missing types such as headframes, stakes, cacti, bones, springs, winches, rock shoulders, work roads, banners, and the trestle structure. No external model generation was needed because useful project sources existed above that rung.

Every map has its own pack `.blend`, one shared 1024² grit atlas baked from its epoch kit and matching contract or rail source, and one separate GLB per mount. The GLBs are base-centred, carry map/era/source-tier/render-only metadata, remain at or below 3,000 triangles, and contain no camera, light, animation, collision, mask, placement, or simulation authority. The existing terrain contracts now point each mount's `asset` field at its body; no landmark entered a terrain mesh.

`artifacts/map-rebuild-spike/landmark-pack-asset-contract.json` parses all 36 GLBs and proves one mesh, primitive, material, and embedded atlas per body. It reopens all seven source `.blend` files and requires every isolated export to be both whole-file byte-identical and semantic-identical. `all-landmark-packs-verdict.png` places the shipped source, body lineup, and real-camera mount beside one another; `all-landmark-packs-proxy-ab.png` records the composition proxy to mounted-body transition without implying a terrain or gameplay change.

### F-3D-D-25 — The run camera and terrain contact remain separate landmark gates

The first fresh release review rejected the Baron because its primary seized-headframe silhouette was hidden behind the far-bank fortification and clipped by the gameplay frame. The mount moved to the near-bank approach at `[-13, 0, 13]`, gained a 1.2 scale, and now counterweights the rocket cart. A correction-only review passed that exact blocker at 99% confidence.

A separate contact probe then exposed a structural issue that the board could conceal: a map-wide GLB mounted once at `Terrain.visualY` leaves its distant local pieces on a flat Z plane. Thirteen distributed packs now sample the exported terrain while authoring and move each rigid component as a whole before joining. Their base-centering compensation lives in `terrainConformOffsetY`; the builder subtracts the previous generated offset before recalculating, and repeated full rebuilds produced identical offsets. Night Shift also reads its seven lantern positions directly from the factory `prePlacedBuildables` table, and the verifier requires exact equality. These bodies may eventually replace fixture presentation, but they must never create a second gameplay lantern set.

The final updated board passed fresh visual review at 96% confidence with no blocker: terrain contact reads plausibly, the segmented Night Shift road and fixture lighting remain legible, and Baron's headframe stays fully framed. Non-blocking promotion debt remains at Twin Banks' black shoreline shapes, Night Shift edge clearance and lower-field contrast, Hill Mine's central support contact, and Trestle's fragmented outer approaches. The reviewer's request to prove tree models is deliberately rejected: the binding desert law forbids trees, so cactus-only vegetation is correct.

## Contract identity summary

| Contract | Macro identity | Contract focal read |
| --- | --- | --- |
| The Claim | Open working river valley | Maintained extraction, camp, central ford, riparian edge |
| Dry Gulch | Enclosed failed basin | One spring, draining washes, ruins, cactus, bones |
| Twin Banks | Broad dual-shelf floodplain | Two fords, opposed furrow fields and homesteads, giant winches, wet bars |
| Night Shift | Rock-bound lantern corridor | Seven fixed lantern terraces, cold pools, warm relight |
| Baron | Occupied river fortress | Far-bank hierarchy, trench, towers, banners, rocket cart |

This table is an art-direction test, not a runtime registry. The contract descriptor remains the source of truth for exact masks, coordinates, fixtures, and rules.

## Sourcing and reference ledger

- Existing project terrain-bank and river plates supply the regional material grammar.
- Kit plates supply the deep-shadow and sun-bleached value range; each contract plate supplies its map-specific hardship target.
- The approved town Blender handoff remains the quality reference for complete geometry, painted edge treatment, locked-camera silhouette, and clean debug/evidence separation.
- The repository forbids paid still-image generation for this work. The native still generator was not needed because approved project plates and deterministic Blender procedures were sufficient.
- Tripo, Gemini, and ElevenLabs credential probes were blank. No external generation call, paid model, or downloaded asset was used.

## Gate state

- Five distinct `.blend` / `.glb` / atlas / contract terrain sets: PASS
- Five unique saved geometry fingerprints: PASS
- Five unique GLB and embedded-atlas hashes: PASS
- One mesh, one material, one embedded 2048² atlas per terrain: PASS
- 32,768 triangles per terrain against the 60,000 ceiling: PASS
- Zero saved cameras, lights, animations, water helpers, or landmark nodes: PASS
- Five validated landmark mount records per terrain; proxies remain absent from saved terrain: PASS
- Semantic and binary-payload re-export comparison: PASS
- Saved-mesh probes for Claim river/ford, Dry Gulch basin/washes, Twin Banks two fords/banks, Night Shift shoulders/terraces, and Baron trench/bastions: PASS
- Five-row same-map mood A/B board and all ten source inputs pinned by content hash: PASS
- Five-row building-grit before/after board pinned by content hash: PASS
- The Claim exterior identical-camera A/B pinned by content hash: PASS
- Four-map exterior identical-camera A/B, low-angle verdict, and seam crops pinned with all source images: PASS
- Five 160 m render-only county surrounds; cactus-only tall vegetation; separate horizon signatures: PASS
- Saved GLBs and atlases unchanged across the exterior-only rebuilds: PASS
- Fresh exterior review: owner-approved direction, REJECT as production art; promotion debt recorded in F-3D-D-16
- Five separate mounted panorama `.blend` / GLB / 2048² atlas / contract sets: PASS
- 1,920 panorama triangles each against the 4,000 ceiling; one mesh and one material each: PASS
- Five distinct panorama GLB and atlas hashes; byte-identical semantic/binary re-exports: PASS
- Panorama playfield, spawn-edge, fog-gate, and water/build/spawn-mask non-interference metadata: PASS
- Panorama MOOD A/B with all fifteen source frames pinned by content hash: PASS
- Five-map center-horizon distance board and all five source renders pinned by content hash: PASS
- Terrain acceptance frames prove the exported terrain; panorama-off/on frames are builder-generated and visibly distinct: PASS
- Fresh PANORAMA LAW v2 release review: DISTANCE, FIGHT, no ECHO, no tree-like contamination — PASS
- E2 factory mask availability: Hill Mine and Trestle authored; Pressure Garden and Incline correctly held — PASS
- Two E2 terrain `.blend` / GLB / 2048² atlas / contract sets; 32,768 triangles each — PASS
- Two separate E2 Panorama v2 `.blend` / GLB / 2048² atlas / contract sets; 1,920 triangles each — PASS
- E2 factory-table equality, mount ownership, water-bank agreement, budgets, and distinct asset hashes — PASS
- Whole-file byte-identical and semantic-identical re-export for all four E2 GLBs — PASS
- Dedicated contract re-export with extras, whole-file hash equality, and semantic equality for all four E2 GLBs — PASS
- Generic `scripts/reexport-pilot.sh` metadata preservation — BLOCKED by missing `export_extras=True`; F-3D-D-23 records the factory follow-up
- Fresh unprimed E2 visual review: distinct maps, FIGHT, no trees, DISTANCE, legible masks, no blocker — PASS
- Seven landmark pack `.blend` files, seven shared 1024² atlases, and 36 separate mounted GLBs — PASS
- Landmark Source Ladder provenance: 15 reuse, 9 derive, 12 build-new — PASS
- Every landmark at or below 3,000 triangles; one mesh/material/embedded atlas; base-centred — PASS
- Whole-file byte-identical and semantic-identical re-export for all 36 landmark GLBs — PASS
- Thirteen distributed rigid-piece packs terrain-conformed through the existing mount/`Terrain.visualY` seam; repeated rebuild offsets stable — PASS
- Night Shift landmark lantern positions exactly equal the seven authored pre-placed fixture records — PASS
- Final fresh landmark review: plausible terrain contact, legible Night Shift, fully framed Baron headframe, no visual blocker — PASS (96% confidence)
- Terrain contract mount assets filled; landmark collision, masks, placement, and simulation authority remain absent — PASS
- `src/` edits: none
- Runtime loading, placement, disposal, gameplay, and performance: intentionally deferred to an attended promotion

## Owner verdict images

- `artifacts/map-rebuild-spike/all-contracts-mood-ab.png` — current material-language gate
- `artifacts/map-rebuild-spike/all-contracts-building-grit-ab.png` — building condition and construction gate
- `artifacts/map-rebuild-spike/the-claim-exterior-ab.png` — first exterior county direction gate
- `artifacts/map-rebuild-spike/all-contracts-exterior-ab.png` — four-map identical-camera before/after gate
- `artifacts/map-rebuild-spike/all-contracts-exterior-low-verdict.png` — four distinct exterior horizon stories
- `artifacts/map-rebuild-spike/all-contracts-exterior-edge-crops.png` — enlarged seam and water debt review
- `artifacts/map-rebuild-spike/all-contracts-panorama-mood-ab.png` — painted plate / before / mounted panorama mood gate
- `artifacts/map-rebuild-spike/all-contracts-panorama-distance-gate.png` — center-playfield distance / wall / ceiling / echo gate
- `artifacts/map-rebuild-spike/e2-owner-verdict.png` — E2 run camera / overview / low sunset family verdict
- `artifacts/map-rebuild-spike/e2-mood-ab.png` — E2 hardship gate using honest per-map shipped sources
- `artifacts/map-rebuild-spike/e2-flat-vs-sculpted-ab.png` — identical-camera geometry proof
- `artifacts/map-rebuild-spike/e2-mask-agreement-board.png` — factory build, stake, rail, water, and bank evidence
- `artifacts/map-rebuild-spike/e2-panorama-mood-ab.png` — E2 before / mounted / center-horizon Panorama v2 gate
- `artifacts/map-rebuild-spike/e2-panorama-distance-gate.png` — complete-frame E2 distance gate
- `artifacts/map-rebuild-spike/all-landmark-packs-verdict.png` — shipped source / pack bodies / mounted real-camera landmark gate
- `artifacts/map-rebuild-spike/all-landmark-packs-proxy-ab.png` — previous composition proxies / separate mounted landmark bodies
- `artifacts/map-rebuild-spike/owner-run-camera-east-edge.png` — shifted real-camera seam check
- `artifacts/map-rebuild-spike/owner-county-overview.png` — county composition overview
- `artifacts/map-rebuild-spike/all-contracts-regional-family-verdict.png`
- `artifacts/map-rebuild-spike/all-contracts-unique-layout-verdict.png`
- per-map run-camera, overview, and low-angle renders live in the same artifact folder

The E1 mood and building-grit boards remain its current owner gates. The E2 boards above gate the authored half of the new family; Pressure Garden and Incline remain outside the terrain wave until factory masks exist.

READY-FOR-GATES
