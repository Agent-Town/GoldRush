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

## E10 campaign-extra Archive World wave

### F-3D-D-107 — The campaign grant requires one sculpt and two deliberate reuses

The published E10 factory contracts make the boundary explicit. `e10-archive-world` owns a unique `e10-archive-world` tile and requests a preferred terrain mesh, so it receives a terrain/panorama pair. `e10-last-claim` is an `ark-plaza-e10` deck variant and `e10-river` is a `frontier-river-claim` dawn variant; both set `render.terrainMesh` to `off`. Creating terrain for either reuse would contradict the factory contract rather than improve the campaign. The verifier records both no-sculpt decisions.

### F-3D-D-108 — The library composition follows the authored restoration masks

Archive World is organized around four exact restoration terraces: the south entry, opposed west/east stack wings, and the north warning shelf. A narrow central missing-sentence cut distinguishes the map without becoming collision or an inaccessible firing perch. Every build rectangle is carried one terrain-cell diagonal beyond its authored edge, then independently sampled on the exported triangle surface at 2,145 points. All four report zero height deviation. Three light holds stay on those buildable flats; the deeper Static, re-ink, lore-unlock, and spawn systems remain code-owned.

### F-3D-D-109 — Un-inked means aged absence, not clean white or horror

The atlas is baked from the E10 Ark kit, worlds plate, and shipped terrain paint. Surviving stack ink, dragged page scars, deep shelf shadow, and aged parchment absence create a prior civilization erased mid-sentence. Warm re-ink light is scarce and localized. Five empty-asset mount records reserve the entry gate, two stack ruins, warning shelf ruin, and `ours-unless` marker; larger archive bodies in verdict images are review-only proxies and are absent from the terrain blend/GLB.

### F-3D-D-110 — Archive World's panorama needed its own Deep Sky correction

The generic E10 kit crop first produced a black wall; the brighter worlds plate then produced a parchment ceiling. The final Panorama v2 atlas keeps a dark ground-matched skirt, irregular near/far archive silhouettes, a low parchment-gold memory band, four asymmetric veils, and sparse seeded star stipple that quiets toward a deep-ink zenith. The panorama remains a separate mounted GLB and changes no playfield, spawn, fog, water, or build mask.

## E10 Archive World gate state

- Archive World terrain `.blend` / GLB / 2048² atlas / contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Separate Panorama v2 `.blend` / GLB / 2048² atlas / contract: PASS
- Panorama GLB: 3,072 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Four build-zone flats: 2,145 exported triangle-surface samples each, maximum deviation 0.00 m: PASS
- Five empty-asset landmark mount records; no baked landmark bodies: PASS
- Last Claim and River factory `terrainMesh=off` reuse decisions: PASS
- Mood A/B, flat/sculpted A/B, mask agreement, and center-horizon distance boards: PASS
- Integrated `npm run build`: PASS
- `src/`, masks, contracts, simulation, choreography, and runtime edits: none

## E10 Archive World owner-verdict images

- `artifacts/map-rebuild-spike/e10-archive-owner-verdict.png` — run camera, overview, and low field angle
- `artifacts/map-rebuild-spike/e10-archive-mood-ab.png` — E10 kit ancestry / hardship gate
- `artifacts/map-rebuild-spike/e10-archive-flat-vs-sculpted-ab.png` — identical-camera geometry proof
- `artifacts/map-rebuild-spike/e10-archive-mask-agreement-board.png` — published restoration flats and warning shelf
- `artifacts/map-rebuild-spike/e10-archive-panorama-mood-ab.png` — panorama before/mounted/horizon evidence
- `artifacts/map-rebuild-spike/e10-archive-panorama-distance-gate.png` — playfield-center distance gate

READY-FOR-GATES

## 27-map campaign — E5 extra-map wave

### F-3D-D-85 — The campaign identity gate yields one E5 sculpt, not three recolours

The published factory contracts distinguish map identity from contract identity. `e5-regatta` owns the unique `tileId: e5-regatta`, so it receives a new terrain/panorama pair. `e5-flotilla` and `e5-stillwater` both explicitly reuse `tileId: e5-deepwater-claim`; under the campaign's variant rule and the One-Town Law, new sculpts for those contracts would be contract drift rather than variety. They therefore retain the accepted Deepwater Claim landform and panorama while the factory varies fleet/state/gameplay above the planar tile.

### F-3D-D-86 — Regatta's difference is submerged course geography

Regatta is a 128 × 128 metre open-sea race tile, not another drowned-town shelf. Its render terrain builds a bent five-beacon bathymetric course: five foundation rises carry the published checkpoint centres, a deep storm-front scarp follows the published fast-water rectangle, and irregular troughs keep the rest of the seabed rough. Independent probes record the start and mid-course rises at -2.3773 m and -2.1988 m, the fast-water shelf at -5.58 m, and ordinary open water at -3.3899 m. The geometry A/B hides water on both sides so the sculpt is reviewable; the owner boards restore the honest temporary water proxy.

### F-3D-D-87 — Water and race semantics remain code-owned

The terrain GLB contains no sea surface, Claim Boat, beacon body, course trace, speed state, spawn, collision, movement, or checkpoint authority. Those are verdict-only helpers removed before export. The separate panorama supplies an irregular open-sea distance ring with unequal weather banks and a quiet zenith; it changes no mask or playfield edge. The published runtime deck, west spawn, five beacon circles, and fast-water zone are reproduced only on the mask board.

## E5 extra-map gate state

- Fresh reference base: `0faabaa29fc0ea92a1614a782f2258f8e698a89a`
- Regatta terrain: one mesh, one primitive, one material, one embedded 2048² atlas, 32,768 triangles: PASS
- Regatta Panorama v2: separate one-mesh GLB, one material, one embedded 2048² atlas, 2,704 triangles: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Exact published mask table and four independent bathymetry probes: PASS
- Mood A/B, water-hidden geometry A/B, owner verdict, mask agreement, and center-horizon distance gates: PASS
- Flotilla and Stillwater valid Deepwater Claim tile reuse: PASS
- `npm run build`: PASS
- Independent `codex review --uncommitted`: reran the Blender verifier green and emitted no product finding before recursively launching another review; the recursion was terminated and is not counted as a separate verdict
- `src/`, simulation, water, gameplay, landmark, and factory-contract edits: none

## E5 extra-map owner-verdict images

- `artifacts/map-rebuild-spike/regatta-owner-verdict.png` — real run camera, whole-course overview, and low storm-lull read
- `artifacts/map-rebuild-spike/regatta-mood-ab.png` — shipped E5 shelf paint / Regatta working-sea mood gate
- `artifacts/map-rebuild-spike/regatta-flat-vs-sculpted-ab.png` — water-hidden identical-camera bathymetry proof
- `artifacts/map-rebuild-spike/regatta-mask-agreement-board.png` — published Claim Boat deck, five beacons, fast-water zone, and west spawn
- `artifacts/map-rebuild-spike/regatta-panorama-distance-gate.png` — playfield-center distance gate

READY-FOR-GATES

## E9 The Dome Basin terrain wave

### F-3D-D-75 — One dry C3-complete mesh keeps persistence code-owned

`assets/contracts/epoch-9-redfields/mask-tables/e9-dome-basin.json` is the sole terrain authority. The terrain is one dry mesh shared by C0 through C3: the complete feeder-canal earthworks are already sculpted, while stage water, channel activation, green spread, persistence, movement, collision, placement, and `Terrain.visualY` remain code-owned. No water surface or water source exists in either GLB.

### F-3D-D-76 — The basin is an industrial excavation, not a decorative lake

The authored h-2 depression is the dominant landform, joined by the northern h4 quarry scarp and the descending six-point feeder canal. Rust-red plate-derived engraving, stained soil, hard shadow pockets, spoil, shattered stone, and literal E1 riverbank green only at four landing anchors keep the scene desperate and worked. Existing E9 bodies appear only as temporary verdict helpers; they are removed before save/export and no landmark mount or runtime asset is authored.

### F-3D-D-77 — Overlapping masks require an explicit precedence proof

An independent review correctly rejected the first verifier's single-point h4/h-2 checks. Dense exported-triangle sampling then exposed a 3.4 cm spoil-tail leak into the quarry; the sculpt now clips spoil out of the scarp. The final verifier samples 6,463 quarry points and 7,792 basin points with 0.00 m deviation outside named overlap footprints. The only exceptions are authored landform/placement precedence: the dry canal cuts the scarp; dry C2/C3 gate berms rise inside the basin; and a triangle-safe flat guard wins where `seed-rows-footing` shares the basin's x=18 edge. All five build rectangles independently return 2,145 samples with 0.00 m deviation.

### F-3D-D-78 — Panorama v2 makes the redfields feel distant, not enclosed

The separate panorama uses an irregular terrain-matched skirt, independent near/far rust ridges, a quiet zenith, and unequal hatched dust columns. The corrected center-horizon view keeps a broken low silhouette and haze gap behind the playfield instead of a mirrored painted wall or an engraved ceiling. The panorama remains render-only, mounted separately, and changes no bounds or masks.

### F-3D-D-79 — The E9 evidence names the persistence and overlap laws visibly

The owner, mood, identical-camera, panorama, and mask boards compare the sculpt against the fresh E9 kit base. The mask board now states the overlap law instead of claiming blanket h4/h-2 agreement, and the adjacent JSON records the same precedence text. The final run camera reads as rust-red labor under late light, never resort; staged water remains visibly absent.

## E9 Dome Basin gate state

- Terrain `.blend` / GLB / one embedded 2048² atlas / adjacent contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material: PASS
- Separate Panorama v2 `.blend` / GLB / one embedded 2048² atlas / adjacent contract: PASS
- Panorama GLB: 3,072 triangles, one mesh, one primitive, one material: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Exact published mask copy and one-mesh staged-water contract: PASS
- Five build rectangles, 2,145 exported-surface samples each, maximum deviation 0.00 m: PASS
- Quarry/basin exhaustive agreement outside documented overlap footprints: PASS
- Mood A/B, identical-camera geometry, owner, mask, and Panorama v2 distance boards: PASS
- Independent `codex review --uncommitted`: caught the verifier coverage gap; its recursive follow-on did not return a final verdict and is not counted as a gate
- `src/`, simulation, water, masks, runtime registry, and landmark edits: none

## E9 Dome Basin owner-verdict images

- `artifacts/map-rebuild-spike/dome-basin-owner-verdict.png`
- `artifacts/map-rebuild-spike/dome-basin-mood-ab.png`
- `artifacts/map-rebuild-spike/dome-basin-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/dome-basin-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/dome-basin-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/dome-basin-panorama-distance-gate.png`
## E10 Ember Shore terrain wave

### F-3D-D-80 — The published preserve table is the only terrain authority

`assets/contracts/epoch-10-deepsky/mask-tables/e10-ember-shore.json` is copied exactly into the adjacent terrain contract. The pair adds no water, spawn, movement, collision, placement, combat, or Static-state authority. The terrain is one dry render mesh; the panorama remains a separately mounted render-only mesh. The Ark is not inferred into this wave because no Ark terrain mask or contract gate exists.

### F-3D-D-81 — The three cooling bands must be negative landform, not painted lava

The first candidate failed its own render: a broad titan-shelf `maximum` unintentionally clamped every negative rift height to zero outside that shelf. The resulting bands looked like road markings. The corrected sculpt limits that operation to the titan shelf, exports down to approximately -2.17 m, and gives each authored band a cooled floor, broken crust lips, and sparse longitudinal residual-heat fractures. Independent exported-triangle sampling measures all 65 cross-sections per band as visibly recessed, with mean shoulder-to-floor depressions of 2.69 m west, 2.05 m center, and 2.48 m east.

### F-3D-D-82 — Both preserve sites are triangle-safe flats

The last-warm-vent and cooled-titan machine rectangles carry a one-grid-diagonal constant-height guard before triangulation. The verifier samples 2,145 points on the actual exported triangle surface per build rectangle and reports 0.00 m deviation for both. It separately samples the coincident vent fixture rectangle at the same density and reports 0.00 m. The loss-condition stake stays at the published `(3, -10)` position, and the north/west/east spawn-edge list is unchanged.

### F-3D-D-83 — Deep Sky emptiness is engraved, not tiled

The first panorama candidate produced a regular star grid and therefore a ceiling. The final atlas replaces it with deterministic sparse irregular stipple, four asymmetric parchment-gold nebula edits, a quiet deep-ink zenith, low independent cooled shelves, and a basalt skirt matched to the terrain boundary. The mood board crops the first-world third of `plate-e10-worlds.png`; the other two world families do not enter the Ember palette comparison. The panorama has no Earth and no gameplay authority.

### F-3D-D-84 — Titan and vent bodies are verdict cues, not hidden landmark work

The cooled titan machine and last-warm-vent fixture visible in renders are procedural preview-only scale cues. They are deleted before the `.blend` and GLB are saved, declared in `verdictPreviewOnly`, and accompanied by empty landmark mounts. Their purpose is to prove that the two authored flats can carry the factory's future bodies without quietly claiming landmark, collision, or placement ownership.

## E10 Ember Shore gate state

- Published mask table copied exactly: PASS
- Terrain `.blend` / GLB / embedded 2048² atlas / contract: PASS
- Terrain: one mesh, one primitive, one material, 32,768 triangles: PASS
- Separate Panorama v2 `.blend` / GLB / embedded 2048² atlas / contract: PASS
- Panorama: one mesh, one primitive, one material, 3,072 triangles: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Two build rectangles plus vent fixture, 2,145 exported-surface samples each, 0.00 m deviation: PASS
- Three cooling bands, 65 exported cross-sections each, every sample visibly recessed: PASS
- Mood A/B, identical-camera geometry, owner, mask, and Panorama v2 boards: PASS
- Integrated `npm run build`: PASS
- Independent `codex review --uncommitted`: PASS — no actionable regression; it reproduced the Blender verifier, artifact hashes, diff check, and production build
- `src/`, simulation, runtime, mask, landmark, and Static-state edits: none

## E10 Ember Shore owner-verdict images

- `artifacts/map-rebuild-spike/ember-shore-owner-verdict.png`
- `artifacts/map-rebuild-spike/ember-shore-mood-ab.png`
- `artifacts/map-rebuild-spike/ember-shore-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/ember-shore-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/ember-shore-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/ember-shore-panorama-distance-gate.png`

READY-FOR-GATES

## E8 The Mare Claim terrain wave

### F-3D-D-70 — The palette note is a material contract, not a colour suggestion

The E8 bundle's locked palette governs this wave literally: silver-and-teal over parchment, warm-grey stippled engraving rather than cold photoreal regolith, a soft blue-green Earth cameo, brass and glass dome language, and vacuum silence expressed as negative space. The terrain atlas derives local engraved ink from `assets/processed/kit-era-8.png` and `assets/raw/plate-e8-bld-set.png`, but does not wrap either illustration across the ground. An early verdict still exposed repeated source-like circles and stamped dots; the final atlas confines plate-derived high-pass ink to unequal patches and uses broken cross-hatching for the governing surface grain.

### F-3D-D-71 — The authored mask creates the composition and remains the authority

`assets/contracts/epoch-8-orbital/mask-tables/e8-mare-claim.json` is copied exactly into the adjacent terrain contract. Its four rectangular h6 bands form the crater rim; its h0 mare remains quiet; the named lava-tube rectangle contains the sole negative-height collapse; and all seven build rectangles are independently sampled on the exported triangle surface. Each returns 2,145 samples with 0.00 m maximum deviation. The revised tube uses a long throat and raised back crescent inside the published rectangle so it reads as an entrance rather than another round impact. Movement, collision, spawns, gravity, atmosphere, build rules, water classification, and `Terrain.visualY` remain code-owned and unchanged.

### F-3D-D-72 — Landmark context can prove scale without breaking the freeze

The verdict scene reuses the existing Dome Commons plate only as a temporary render helper and adds temporary launch and mass-driver cues. Review rejected the first thin line as insufficient evidence, so the final mass driver uses two rails, repeated sleepers, and structural feet while staying absent from the saved terrain blend and GLB. No landmark body, mount id, registry entry, or runtime placement was authored or changed. The terrain/panorama pair therefore preserves the standing landmark freeze.

### F-3D-D-73 — Vacuum Panorama v2 needs physical silhouettes and directional comfort

The panorama is a separate render-only GLB with a terrain-matched rectangular apron, independent near and far lunar ridge profiles, and a mostly empty vacuum ring. No atmospheric haze or clouds fill the negative space. Two blind reviews rejected the first horizon because the exact foreground rim and smooth distant bands collapsed into one wall read. The final evidence camera shows the authored rim as a nearby crater corner while sharper, non-parallel ridge silhouettes remain visible beyond it. Earth appears once on the Mare-facing side and nowhere in the opposite Far Side view; the panorama contract records that directional rule explicitly.

### F-3D-D-74 — Countable visual evidence must be as exact as the JSON

The first mask board technically contained every label but merged the tube/debris legend and collided `R1/B1` and `B7/Q1`. The final board gives tube and debris separate rows, relocates all rim labels, and separates the rail label from its overlapping build footing. A fresh unprimed review of the corrected mood, owner, panorama-distance, Earth-side, and mask boards returns `SHIP`. The earlier `NO-SHIP` verdicts are retained as the reason the atlas, tube, rail, horizon, and board changed rather than being explained away.

## E8 Mare Claim gate state

- Terrain `.blend` / GLB / one embedded 2048² atlas / adjacent contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material: PASS
- Separate Panorama v2 `.blend` / GLB / one embedded 2048² atlas / adjacent contract: PASS
- Panorama GLB: 3,072 triangles, one mesh, one primitive, one material: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Exact published mask copy; four h6 rim bands; h0 mare; named lava-tube collapse: PASS
- Seven build rectangles, 2,145 exported-surface samples each, maximum deviation 0.00 m: PASS
- Earth-side rule and opposite Far Side absence: PASS
- Mood A/B, identical-camera geometry, owner, mask, Panorama v2 distance, and Earth-side boards: PASS
- Fresh final unprimed visual verdict: SHIP
- Independent `codex review --uncommitted`: attempted; the reviewer recursively launched another `codex review` instead of returning a verdict, so both were terminated and this is not counted as a gate
- Landmark freeze preserved; no landmark assets or mounts authored
- `src/`, simulation, masks, runtime registry, and main edits: none

## E8 Mare Claim owner-verdict images

- `artifacts/map-rebuild-spike/mare-claim-owner-verdict.png`
- `artifacts/map-rebuild-spike/mare-claim-mood-ab.png`
- `artifacts/map-rebuild-spike/mare-claim-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/mare-claim-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/mare-claim-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/mare-claim-panorama-distance-gate.png`
- `artifacts/map-rebuild-spike/mare-claim-earth-side-gate.png`

READY-FOR-GATES

## E7 Relay Valley terrain wave

### F-3D-D-65 — Relay Valley is a line-of-sight placement puzzle, not four decorative towers

`assets/contracts/epoch-7-signal/mask-tables/e7-relay-valley.json` is the only coordinate authority. The two published h5 ridge bands carry four guarded 10 × 10 m relay pads in two visible pairs. Existing `relay-tower.glb` bodies and thin teal LOS spans appear only in the verdict scene, are removed before save/export, and create no runtime mount or placement authority. The central ridge dead gap remains visibly unbridged. Movement, collision, combat, spawns, fog gating, and `Terrain.visualY` remain planar and factory-owned.

### F-3D-D-66 — Exact ridge masks need eroded shoulders outside their authority

The first sculpt held each entire ridge rectangle at h5 but exposed its edge as a hard slab. The corrected height function still resolves the published ridge rectangles and all four relay pads exactly, while a wider broken-shale shoulder lives outside those rectangles and carries the descent into the h0 teaching valley. Independent triangle-surface sampling covers 2,145 points per pad and reports 0.00 m maximum deviation for B1 through B4.

### F-3D-D-67 — Dead zones belong in the terrain read without becoming gameplay fog

The ridge gap, west fog pocket, and east fog pocket are shallow, low-frequency render basins with quiet teal-gray hatch in the painted atlas. The teaching patrol loop is a worn punch-tape trace. These marks make the authored pressure map readable from above but never instantiate volumetric fog, blockers, AI paths, damage, or build restrictions. The mask board independently labels 4 build pads, 2 h5 ridges, 3 dead zones, and 1 patrol loop from the published table.

### F-3D-D-68 — The E7 kit's pale bands become a cyclorama unless the panorama is rebuilt vertically

The first Panorama v2 attempt wrapped the kit's broad pale values into a gray ceiling. A second candidate still left a continuous luminous far-ridge belt; a fresh blind gate correctly returned `NO-SHIP` because it read as a bowl wall. The final atlas uses a quiet walnut-to-teal vertical dusk gradient, four small asymmetric weather marks, no painted duplicate ridge profile, and darker independently broken physical ridge silhouettes. The corrected fresh gate returns `SHIP` and explicitly answers `DISTANCE`, never wall or ceiling.

### F-3D-D-69 — Signal warmth must remain a hardship accent

The shipped E7 kit supplies walnut, honey-glass, and agent-teal vocabulary. Relay Valley uses those accents only at the four working sites and two exhausted valley lamps; engraved shale, cable trenches, soot, rubble, and dead-zone hatch own the larger image. The final blind gate answers `FIGHT`, not holiday, while the towers and LOS links remain readable at the run camera.

## E7 Relay Valley gate state

- Terrain `.blend` / GLB / 2048² atlas / contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Separate Panorama v2 `.blend` / GLB / 2048² atlas / contract: PASS
- Panorama GLB: 3,084 triangles against 4,000, one mesh, one primitive, one material, one embedded atlas: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for terrain and panorama GLBs: PASS
- Four relay build-pad triangle surfaces, 2,145 independent samples each, maximum deviation 0.00 m: PASS
- Exact published build/ridge/fog/patrol masks and no water: PASS
- Panorama non-interference and empty landmark mounts: PASS
- Mood A/B, identical-camera geometry, owner, mask, and Panorama v2 distance boards: PASS
- First blind panorama verdict: NO-SHIP; pale cyclorama band corrected
- Fresh final unprimed visual verdict: SHIP; fight / ridge chains / distance / mask counts all pass
- Independent `codex review --uncommitted`: attempted; CLI exited after repository inventory without a review verdict, so it is not counted as a gate
- Integrated `npm run build`: PASS
- `src/`, simulation, runtime registry, masks, and landmark edits: none

## E7 Relay Valley owner-verdict images

- `artifacts/map-rebuild-spike/relay-valley-owner-verdict.png`
- `artifacts/map-rebuild-spike/relay-valley-mood-ab.png`
- `artifacts/map-rebuild-spike/relay-valley-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/relay-valley-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/relay-valley-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/relay-valley-panorama-distance-gate.png`

READY-FOR-GATES

## E6 Glow Mesa terrain wave

### F-3D-D-59 — The published E6 table is the only planar authority

`assets/contracts/epoch-6-atomic/mask-tables/e6-glow-mesa.json` is copied into the terrain contract as the exact authored source. The render mesh preserves all five build rectangles and both civic fixture rectangles as triangle-surface flats; independent exported-mesh sampling reports 0.00 m maximum deviation for every zone. The terrain and separate panorama remain render-only. Movement, collision, spawns, build authority, water classification, and the existing `Terrain.visualY` seam are unchanged.

### F-3D-D-60 — Glow Mesa needs a true h1/h5 landform, not a raised decorative pad

The final sculpt has a broad h5 caprock mesa above the h1 south base, a separate h5 warehouse approach, and three eroded herd routes that explain how the playable plane crosses the visual relief. Review corrected the warehouse approach from an early h1 interpretation and added a calm shoulder around the authored flat. The caprock edge was sharpened after the first pass read as a shallow trench; clutter is now excluded from steep faces so the scarp remains geological rather than a rubble shelf.

### F-3D-D-61 — Atomic-homestead grit is contamination under pressure, not a holiday glow ring

The 2048 atlas is rebuilt from the shipped E6 kit plate and the established terrain paint banks. Warm engraved earth, fading decay hatches, deep shadow pockets, sparse rubble, and six dangerous teal starstone anchors carry the era language. A first circular glow treatment read ceremonial; the final builder breaks it into irregular leaking veins, reduces the emission wash, removes the toy-like dome preview, and keeps amber Combine infrastructure subordinate to the landform. Preview bodies remain evidence-only and are absent from both exported GLBs and mount contracts.

### F-3D-D-62 — The E6 panorama needs one climate contrast and no paper-haze ribbon

The separate 2,496-triangle Panorama v2 GLB uses one broken low ridge, a dry rectangular-to-radial ground skirt, a quiet zenith, asymmetric low weather, a narrow inland-water glint in one quadrant, and dust-dark plains opposite. Review exposed a pale paper haze following a hidden ridge profile closely enough to read as a painted ribbon. The final pass reduces it to a low dust-coloured trace and aims the center-horizon evidence through the authored inland cut. The verdict is layered distance, not wall, ceiling, moat, or repeated strip.

### F-3D-D-63 — Mask evidence must be independently countable

The final mask board adds a coordinate-derived schematic beside the render and labels every published family: B1-B5 build zones, F1-F2 fixtures, D1-D2 decay fields, H1-H3 herd paths, and A1-A6 starstone anchors. This replaced an earlier board that asserted counts without making the source coordinates independently auditable. The board also states the h1/h5 relationship, 0.00 m exported-surface deviation, no-water rule, empty mounts, and planar simulation boundary.

### F-3D-D-64 — The visual gate must change the terrain, not manufacture combat

Fresh screenshot-only reviews rejected the warm, rounded candidates as a tabletop holiday diorama even though their mask proof passed. The final correction makes the caprock and scarp explicitly faceted, adds harder engraved strata and deep fracture pockets, cools and hardens the dusk rig, strengthens the broken timber barricade silhouettes, localizes the starstone light, and lowers the panorama ridges. Short-lived smoke and bolt helpers were removed because they read as UI arrows and figurines; the terrain has to communicate pressure without fabricated gameplay. The final unprimed verdict is `SHIP`: FIGHT 7.5/10, DISTANCE 8/10, MASK LEGIBILITY 9.5/10, with no visible blocker and no actor requirement.

## E6 gate state

- Glow Mesa terrain `.blend` / GLB / 2048² atlas / contract set: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Separate Panorama v2 `.blend` / GLB / 2048² atlas / contract set: PASS
- Panorama GLB: 2,496 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Five build zones and two civic fixtures independently sampled from the exported triangle surface, maximum deviation 0.00 m: PASS
- Mood A/B, identical-camera geometry, owner, mask-agreement, and Panorama v2 distance boards: PASS
- Fresh final unprimed visual verdict: SHIP
- Integrated `npm run build`, Python compilation, and `git diff --check`: PASS
- Independent `codex review --uncommitted`: attempted; the reviewer recursively launched another review instead of returning a verdict, so it was interrupted and is not counted as a gate
- `src/`, simulation, runtime registry, masks, and landmark mounts: unchanged

## E6 owner-verdict images

- `artifacts/map-rebuild-spike/glow-mesa-owner-verdict.png` — real run camera, overview, and low dusk
- `artifacts/map-rebuild-spike/glow-mesa-mood-ab.png` — shipped painted source / E6 hardship gate
- `artifacts/map-rebuild-spike/glow-mesa-flat-vs-sculpted-ab.png` — identical-camera flat/sculpted geometry proof
- `artifacts/map-rebuild-spike/glow-mesa-mask-agreement-board.png` — coordinate-derived authored-zone proof
- `artifacts/map-rebuild-spike/glow-mesa-panorama-mood-ab.png` — panorama off/on mood evidence
- `artifacts/map-rebuild-spike/glow-mesa-panorama-distance-gate.png` — inland-cut center-horizon distance gate

READY-FOR-GATES

## Hill Mine + Trestle landmark bar-unification wave

### F-3D-D-58 — Painted-wrap quality is a body-and-material contract, not an atlas swap

Fresh references were regenerated from `origin/main@8d974f11` before any replacement. The neutral boards at `artifacts/map-rebuild-spike/landmark-bar-unification/hill-mine-blind-ab.png` and `trestle-blind-ab.png` preserve the same terrain, real run camera, mount ids, mount transforms, and asset paths on both sides. The withheld side key is recorded separately. Blind review chose the candidate for both maps at 97–98% confidence and answered “fight.”

The winning difference is structural. Hill Mine replaces its flat headframe icon with a four-legged ruined frame, mine mouth, pulley, rope, tailings, fallen timber, and repair sign; its boiler house becomes an articulated shed/drum/stack/valve/pipe worksite; its flooded gallery gains a pump, tram rails, sleepers, sump, portal, and broken supports; and its switchback and tailings packs gain visible route and dumping logic. Trestle gains repeated bridge bents, X-bracing, deck beams, repair plates, fallen members, distinct north/south boiler and approach damage, tar scars, rubble, drums, a broken gate, and an ore-working mine spur. These silhouettes remain readable at the gameplay camera instead of relying on close inspection.

Each map still owns one shared 1024² atlas, now baked only from its shipped Epoch 2 kit plus Hill Mine contract paint or the shipped Trestle rail paint. Stronger engraved ink, sun-bleached values, scratches, stains, soot, rust, and repair battens bring the material language up to the ratified E1 pack without copying an E1 composition. The source ladder remains 6 reuse, 4 derive, and 1 build-new across the 11 bodies.

The file replacement changes no terrain contract, mount id, position, rotation, scale, asset path, runtime registry, mask, or simulation owner. Expanded distributed approach kits clamp only newly lower sub-pieces to their shipped terrain-conform compensation, so the body remains grounded without moving its base-centred mount. Every GLB is a separate base-centred render-only body with one mesh, primitive, material, and embedded pack atlas; triangle counts range from 380 to 1,812 under the 3,000 ceiling. Reopening both pack `.blend` files and re-exporting all 11 bodies produced whole-file byte-identical and semantic-identical GLBs. Machine evidence lives in `artifacts/map-rebuild-spike/landmark-bar-unification/asset-contract.json`.

## Landmark bar-unification gate state

- Fresh-reference law, base SHA on both boards: PASS
- Blind candidate/current gate: candidate wins both maps, 97–98% confidence
- “Fight,” not “holiday”: PASS
- Same 11 mount ids, transforms, asset paths, and terrain contracts: PASS
- One shared 1024² painted atlas per map: PASS
- 11 separate GLBs, 380–1,812 triangles each against 3,000: PASS
- One mesh / primitive / material / embedded atlas per body: PASS
- Base-centred, render-only, no simulation authority: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export ×11: PASS
- `src/`, masks, terrain, panorama, registry, collision, movement, placement, spawns, and water edits: none
## Overview-transition improvement wave — NO-CHANGE verdict

### F-3D-D-57 — A shared apron fix must beat the shipped join, not merely remove one artifact mathematically

Two shared replacements were rendered against the 15 shipped terrain/panorama pairs. Exact terrain-perimeter height sampling raised the panorama ridge into a dark run-camera wall without removing the overview slab. A planar packed-atlas projection removed the old radial UV projection, but replaced it with brighter mirrored ground carpets and a stronger square-tile read. The blind boards selected the shipped/current join on all 12 materially changed pairs; Fairground, Dust Flats, and Deepwater Claim were visual ties. Candidate wins: zero.

The telemetry is diagnostic, not the verdict: the candidate raised average full-frame luminance by 2.7104 levels across the family and by as much as 8.7781 on Trestle. The visible failure, not the number, ruled: repeated pale ground panels advertised the panorama mesh more strongly than the residual shipped collar.

Per the granted no-change contract, every shipped terrain, panorama, atlas, contract, and render was restored byte-for-byte. The wave delivers only durable neutral A/B boards, the concealed/revealed side key, metrics, and verdict. Simulation, masks, mounts, materials, budgets, and runtime wiring remain untouched.

## Overview-transition gate state

- Blind A/B target fixed before reveal: distance; no square slab, collar, radial streaks, or bright carpet: PASS
- Fifteen shipped pairs represented across five neutral boards: PASS
- Current wins 12, ties 3, candidate wins 0: NO-CHANGE
- All tracked production assets restored; repository diff contains no terrain/panorama binary replacement: PASS
- Production `npm run build`, JSON parse, 3840×2160 board dimensions, and diff whitespace: PASS
- Independent `codex review --uncommitted`: attempted; CLI exited after inventory without a verdict, so it is not counted as a gate
- `src/`, simulation, masks, mounts, registry, and runtime edits: none

## Overview-transition evidence

- `artifacts/map-rebuild-spike/overview-transition/overview-transition-blind-ab-1.png` through `-5.png`
- `artifacts/map-rebuild-spike/overview-transition/overview-transition-blind-key.json`
- `artifacts/map-rebuild-spike/overview-transition/overview-transition-ab-metrics.json`
- `artifacts/map-rebuild-spike/overview-transition/overview-transition-blind-verdict.json`

READY-FOR-GATES

## E3 Fairground terrain wave

### F-3D-D-51 — The published Fairground table stays the only gameplay authority

`assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json` is consumed without edits and copied exactly into the terrain contract. The three build zones, west/east/north spawn edges, fair-gate stake, no-water agreement, and exact Ferris rectangle remain planar simulation truth. The terrain and panorama are render-only and `Terrain.visualY` remains the height seam. Main now records the landmark freeze as lifted; this terrain/panorama pair deliberately authors no landmark body or mount, so `landmarkMounts` stays empty without promoting a verdict proxy.

### F-3D-D-52 — A fairground must survive removal of its verdict proxies

Early candidates depended on the temporary wheel and pavilion silhouettes. Repeated fresh critiques correctly rejected that: after removing those proxies, the ground read as a generic dark clearing. The delivered terrain now carries the operating plan itself through a high-contrast packed-earth T/cross midway, broken oval service loop, two raised and stained pavilion work terraces, a double wheel-foundation scar, two iron sill marks, four guy-anchor stains, and a worn bowl/rim. These are ground construction and material history, not baked landmark bodies.

### F-3D-D-53 — Strong relief must not become black night holes

The terrain-only A/B exposed narrow physical ruts and deep circulation cuts as matte-black wedges under the dusk rig. The correction keeps wagon ruts, service circulation, and the exact foundation legible in the atlas while reserving geometry for broad pavilion terraces, the shallow wheel berm, asymmetric inner knuckles, and the broken perimeter rise. This produces meaningful sculpted relief at player distance without manufacturing impassable-looking trenches that the planar simulation does not own.

### F-3D-D-54 — The exact Ferris footprint is a triangle-surface gate

The builder resolves the fixture rectangle last, with one terrain-cell diagonal of guard before the exact authored bounds. The verifier then samples 2,145 points across the exported triangle surface, not only vertices. Maximum deviation is `0.000000 m` against the `0.02 m` limit, so the render height visibly agrees with the load-bearing placement rectangle.

### F-3D-D-55 — Fairground Panorama v2 needs open county, not an arena bowl

The separate panorama retains one near ridge, an independent far ridge, haze, asymmetric weather, and a quiet zenith, but lowers and breaks the near Fairground ridge. Its rectangular boundary skirt samples the actual terrain edge, then continues near-level county ground rather than sinking into a bright concentric moat. The final center-horizon view answers `distance`; no playfield, mask, spawn, fog, or collision authority moves into the panorama.

### F-3D-D-56 — Fresh criticism moved the deliverable before returning ACCEPT

Independent unprimed gates rejected earlier candidates for proxy-dependent identity, subtle relief, black rut wedges, a hard slab join, and an arena-like horizon. The builders, atlases, and evidence were revised rather than reframed. The final fresh unprimed gate returns `ACCEPT` with no release blockers: the ground independently reads as an exhausted working-fair site, the panorama reads distance, the published masks remain legible, and the mood answers fight rather than holiday. Because no shipped same-map Fairground painting exists, the Mood A/B honestly labels the shipped E3 kit plate as the palette/mood source instead of claiming a same-map comparison.

## E3 Fairground gate state

- Fairground terrain `.blend` / GLB / 2048² atlas / contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Separate Fairground Panorama v2 `.blend` / GLB / 2048² atlas / contract: PASS
- Panorama GLB: 3,072 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Whole-file byte-identical and semantic-identical re-export for both GLBs: PASS
- Exact published mask/water agreement: PASS
- Ferris fixture exported triangle-surface flatness, 2,145 samples / 0.000000 m deviation: PASS
- Mood A/B, identical-camera flat/sculpted A/B, owner board, mask agreement, and center-horizon distance gate: PASS
- Fresh final unprimed visual verdict: ACCEPT
- Independent `codex review --uncommitted`: attempted; the CLI exited after startup inventory without a review verdict, so it is not counted as a gate
- Landmark freeze is lifted; this pair authors no landmark body or mount, and the wheel/pavilion verdict proxies remain absent from both GLBs
- `src/`, simulation, masks, choreography, registry, and runtime edits: none

## E3 Fairground owner-verdict images

- `artifacts/map-rebuild-spike/fairground-owner-verdict.png`
- `artifacts/map-rebuild-spike/fairground-mood-ab.png`
- `artifacts/map-rebuild-spike/fairground-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/fairground-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/fairground-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/fairground-panorama-distance-gate.png`

READY-FOR-GATES

## E5 Deepwater Claim terrain + panorama wave

### F-3D-D-46 — The Flood Break starts with the shipped harbor paint

Deepwater Claim begins the second visual chain. Its one 2048² terrain atlas is baked from `assets/raw/ter-shelf-atlas.png`, `assets/processed/kit-era-5.png`, the shipped wreck plate, and the Claim-Boat plate. The result deliberately leaves the E1–E4 ochre county behind: blue-green parchment depth, tar shadow, rope-and-timber warmth, salt-dark working beds, and one stubborn warm boat light. No native or paid image generator, external model service, or photoreal texture entered the asset.

### F-3D-D-47 — Bathymetry can agree with the water table without owning water

The terrain mesh contains only the submerged floor: lagoon bars, a broken reef ring, the exact ten-metre reef-gap cut, the five-anchor wreck shelf, and the sealed trench edge. It exports no sea surface, swell, shoreline classifier, boat deck, collision, spawn logic, travel class, or placement authority. Those remain runtime-owned. The final terrain contract embeds the published `e5-deepwater-claim.json` mask truth unchanged, and the corrected mask board registers both halves to the same north-up 128 m grid rather than comparing unrelated texture crops.

### F-3D-D-48 — E4 town bodies become a drowned settlement through mounts, not baking

The owner-authorized drowned-town treatment reuses four landed E4 bodies: Claim Office, Chapel, General Store, and Stamp Mill. Their contract records asset path, position, rotation, and scale. Mount Y is a local burial offset added to `Terrain.visualY` at each X/Z, not an absolute seabed height, so runtime cannot apply bathymetry twice. Owner review also caught the first verdict scale spanning the water column like floating houses. The final terrain gives every ruin a local drowned foundation hollow; near-authored `0.78..1.02` scale bodies then use only `-0.30..-0.22 m` of silt bite. The strict mesh probe resolves their four seabed contacts at `-5.9848`, `-5.9737`, `-5.7411`, and `-5.8856 m`. They remain fully submerged but visibly rest on the floor because they are buildings, not buoyant props. In verdict renders they are tipped, grouped along the working shelf, and joined by loose verdict-only timbers so they read as one flooded settlement. No E4 mesh or material was modified, and all four bodies are removed before the terrain `.blend` save and GLB export. The terrain remains stable if the mounts are disabled, swapped, or moved by the attended wiring pass.

### F-3D-D-49 — Open-sea Panorama v2 needs a submerged apron and real distance cues

A county-style ridge ring becomes a wall at sea. Deepwater instead uses a true 190 m cylinder sunk to -160 m, a scenery-only submerged apron that traces the exact square terrain boundary before falling to the far radius, four unequal weather cells, and four tiny wreck-mast silhouettes. The ring is a separate 2,704-triangle GLB with one embedded 2048² atlas. The quiet zenith stays nearly plain, the storm cells break the repeated strip, and the mast cues suggest scale without confirming a coast. The apron and sky ring change no playfield bounds, masks, spawns, fog gates, or water sampling.

### F-3D-D-50 — Visual criticism changed the assets and the evidence contract

Blind review rejected successive candidates for a rectangular terrain slab, wall-like panorama bands, barely visible upright town cards, an empty non-working claim, long ungrounded salvage cables, and a mask board that could not be audited point-to-point. The final builders remove the slab with the boundary-matched scenery apron, group and tip the E4 bodies into a readable ruin field, replace tile-spanning cables with short local salvage lines, add a tapered evidence-only Claim-Boat and channel markers, break the sky with asymmetric storm cells, and generate a coordinate-registered mask schematic. Runtime stand-ins are explicitly excluded from the exported terrain and are not promoted as production models.

The final scoped recheck returns `SHIP`: exact mask registration, independently legible bathymetry, a coherent drowned-town band, and open-sea distance with unequal weather cells and mystery-scale mast cues. Its only non-blocking note is that the far masts are deliberately subtle enough to resemble pale cross marks at crop scale.

## E5 gate state

- Terrain `.blend` / GLB / 2048² atlas / contract: PASS
- Terrain GLB: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Separate Panorama v2 `.blend` / GLB / 2048² atlas / contract: PASS
- Panorama GLB: 2,704 triangles, one mesh, one primitive, one material, one embedded atlas: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for both GLBs: PASS
- Exact lagoon, reef, ten-metre gap, wreck shelf/anchors, trench, Claim-Boat build zone, and west-spawn mask agreement: PASS
- Runtime-owned sea surface, swell, travel classes, spawns, collision, movement, and build semantics: unchanged
- Four existing E4 town GLBs recorded as separate reuse-only `Terrain.visualY` mounts; all four floor probes are below `-5.7 m`, with only `0.22..0.30 m` of silt bite: PASS
- Mood A/B, identical-camera flat/sculpted A/B, registered mask agreement, owner run/overview/low board, and center-horizon distance gate: PASS
- Integrated `npm run build`: PASS
- Python compilation and `git diff --check`: PASS
- Fresh final scoped visual verdict: SHIP
- `src/`, simulation, choreography, registry, and runtime edits: none

## E5 owner-verdict images

- `artifacts/map-rebuild-spike/deepwater-owner-verdict.png` — real run camera, whole-tile overview, and low storm-lull angle
- `artifacts/map-rebuild-spike/deepwater-mood-ab.png` — shipped shelf paint / working-harbor hardship gate
- `artifacts/map-rebuild-spike/deepwater-flat-vs-sculpted-ab.png` — identical-camera bathymetry proof
- `artifacts/map-rebuild-spike/deepwater-mask-agreement-board.png` — exact north-up 128 m table/overlay registration
- `artifacts/map-rebuild-spike/deepwater-ruin-contact-gate.png` — identical-camera seabed contact / final submerged state
- `artifacts/map-rebuild-spike/deepwater-panorama-mood-ab.png` — separate panorama off/on evidence
- `artifacts/map-rebuild-spike/deepwater-panorama-distance-gate.png` — playfield-center open-sea distance gate

READY-FOR-GATES

## Blackout Ridge + Dust Flats wave

### F-3D-D-42 — Published masks remain the only gameplay truth

Both terrain contracts copy their published E3/E4 mask tables exactly. Blackout Ridge resolves all three pylon and two capacitor disks to exported triangle-surface flats; Dust Flats preserves its four build zones, r=24 orbit, four road corridors, four tar seams, and dry wash. No simulation, movement, spawn, collision, fog, or landmark file changed.

### F-3D-D-43 — Blackout Ridge needs a geometric climb before night grading

The night tile now combines a rising diagonal shelf, broken ledge, physical trunk trench and shoulders, sparse rubble, cool raking light, and localized failing-copper warmth. The pylon/capacitor flats override the render relief only inside their load-bearing disks.

### F-3D-D-44 — Dust Flats is organized by motor wear, not a painted circle

The E4 tile uses a physically crowned and rutted orbit road, paired wheel ruts on all authored corridors, uneven shoulders, tar depressions, a dry wash, and edge drifts. Sub-metre orbit wobble breaks compass-perfect repetition while retaining the authored r=24 gameplay read.

### F-3D-D-45 — Panorama evidence exposed a transition limit

The Panorama v2 rings remain separate render-only assets with exact-boundary ground skirts, asymmetric ridges, haze, and quiet zeniths. Blind review passed both panoramas as distance rather than wall or ceiling, but rejected an earlier smooth collar/tabletop join. The delivered correction removes the one-metre void, adds irregular skirt relief, and confines boundary-matched paint to a narrow band. The attended owner gate should still judge the residual overview transition; no gameplay authority was moved to hide it.

## Blackout Ridge + Dust Flats gate state

- Terrain GLBs: 32,768 triangles, one mesh/primitive/material and one embedded 2048² atlas each: PASS
- Panorama GLBs: 3,072 Blackout / 2,688 Dust triangles, one mesh/primitive/material and one embedded 2048² atlas each: PASS
- Whole-file byte-identical re-export for all four GLBs: PASS
- Blackout load-bearing pylon/capacitor triangle-surface flats: PASS
- Exact published mask copies and empty landmark mounts under the freeze: PASS
- Mood A/B, identical-camera geometry, owner, mask, and Panorama v2 boards: PASS
- Panorama distance verdict: PASS
- Residual terrain/panorama overview transition: OWNER VERDICT
- `src/`, simulation, runtime, and landmark edits: none

## Blackout Ridge + Dust Flats owner-verdict images

- `artifacts/map-rebuild-spike/blackout-dust-owner-verdict.png`
- `artifacts/map-rebuild-spike/blackout-dust-mood-ab.png`
- `artifacts/map-rebuild-spike/blackout-dust-flat-vs-sculpted-ab.png`
- `artifacts/map-rebuild-spike/blackout-dust-mask-agreement-board.png`
- `artifacts/map-rebuild-spike/blackout-dust-panorama-mood-ab.png`
- `artifacts/map-rebuild-spike/blackout-dust-panorama-distance-gate.png`

READY-FOR-GATES

## E2 Pressure Garden + Incline terrain wave

### F-3D-D-37 — The published final-pair tables close the E2 family without inference

`assets/contracts/epoch-2-steamworks/mask-tables/e2-pressure-garden.json` and `e2-incline.json` are now the coordinate authority for the final pair. Their `maskTruth` and `waterAgreement` objects are copied byte-for-meaning into the adjacent terrain contracts and compared for exact JSON equality by the verifier. No position came from the earlier concept discussion, another E2 map, or a visual guess. Movement, collision, spawns, placement, water classification, and `Terrain.visualY` remain factory-owned.

### F-3D-D-38 — Pressure Garden is an exhausted production climb, not a greener Hill Mine

Pressure Garden follows the authored 0.8 / 1.6 / 2.4 m stepped terraces. Three boiler beds occupy the first north-bank band, paired hard-grown crop terraces occupy the next, and the published coal seams stain the upper working bed. Sparse cactus and rubble keep the desert law. The growing strips are deliberately narrow, dark, and desaturated: one hard-won industrial exception inside barren ground, never a lush holiday garden.

### F-3D-D-39 — Incline is organized by two continuous haul lines and their two authored fords

Incline follows the stronger 0.7 / 2.2 / 3.8 m climb while keeping both rail corridors calm enough to read as working routes. The twin lines remain continuous through the two published crossings at x=-12 and x=12, then connect the lower engine yard, landing yard, west bench, and upper ore yard. The final evidence-water material removes a blown-out specular disk without entering the terrain GLB; the visible shoreline still ends at the published shallows boundary.

### F-3D-D-40 — Panorama evidence needs a far plane beyond the panorama radius

The new panoramas remain separate mounted 2,112-triangle GLBs with one embedded 2048² atlas each. A first low-sunset render showed a smooth purple dome that looked like a painted landmark. It was not panorama geometry: the off-centre evidence camera's 240 m far plane clipped the far side of the 190 m ring and exposed the world background. Raising only the evidence camera's clip end to 420 m removes the hole. The corrected ridge silhouettes are rougher and lower, the sky-to-horizon density still quiets toward the zenith, and the panorama assets keep zero gameplay authority.

### F-3D-D-41 — The final blind gate returns SHIP with honest promotion notes

A fresh unprimed review of the full mood, owner, distance, and mask boards plus tight crops returns `SHIP`. It finds Pressure Garden and Incline genuinely distinct but regional, harsh rather than recreational, panoramically open, and mask-legible. Non-blocking notes are retained: thin teal evidence lines can lose contrast, Incline rails darken over water, and Pressure Garden's narrow green strips need their surrounding boiler/coal context to read as crops. The purple semicircles visible in the older Hill Mine/Trestle low-sunset rows are previously accepted evidence debt and are absent from the corrected final pair.

Fixed-framing telemetry is descriptive rather than a score. Pressure Garden changes 11.80% of pixels by more than 16 luminance levels and raises mean edge energy 4.68%; Incline changes 10.57% and raises it 5.53%. The heatmap locates the authored terrace and cut changes while the owner board, masks, and blind critique remain the actual acceptance gates.

## E2 final-family gate state

- Published mask tables for all four E2 maps: PASS
- Pressure Garden and Incline terrain `.blend` / GLB / 2048² atlas / contract sets: PASS
- New terrain GLBs: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas each: PASS
- Pressure Garden and Incline Panorama v2 `.blend` / GLB / 2048² atlas / contract sets: PASS
- New panorama GLBs: 2,112 triangles, one mesh, one primitive, one material, one embedded atlas each: PASS
- Exact authored mask/water agreement and defining geometry probes: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export across all eight E2 GLBs: PASS
- Mood A/B, identical-camera geometry, run/overview/sunset, mask agreement, and full-frame panorama distance boards: PASS
- Fixed-framing flat/sculpted visual telemetry: PASS
- Fresh final unprimed visual verdict: SHIP
- Integrated `npm run build`: PASS
- Independent `codex review --uncommitted`: attempted; the reviewer recursively launched another `codex review` instead of returning a verdict, so it was interrupted and is not counted as a gate
- Landmark freeze preserved; no new or changed landmark bodies
- `src/`, simulation, masks, runtime registry, and main edits: none

## E2 final-pair owner-verdict images

- `artifacts/map-rebuild-spike/e2-owner-verdict.png` — four-map real-camera, overview, and low-sunset comparison
- `artifacts/map-rebuild-spike/e2-mood-ab.png` — same-map shipped source / hardship gate
- `artifacts/map-rebuild-spike/e2-flat-vs-sculpted-ab.png` — fixed-camera geometry proof
- `artifacts/map-rebuild-spike/e2-mask-agreement-board.png` — published zones, stakes, rails, water, banks, and coal seams
- `artifacts/map-rebuild-spike/e2-panorama-mood-ab.png` — panorama off/on mood evidence
- `artifacts/map-rebuild-spike/e2-panorama-distance-gate.png` — playfield-center distance gate
- `artifacts/map-rebuild-spike/e2-final-flat-sculpted-telemetry.png` — objective change-location telemetry

READY-FOR-GATES

## E3 Canyon Works + Moth Season terrain wave

### F-3D-D-30 — Published masks are the only terrain authority

`assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json` and `e3-moth-season.json` are the authored inputs for this wave. The builders consume those tables without adding gameplay geometry or changing movement, build, spawn, water, fog, or `Terrain.visualY` ownership. Pressure Garden and Incline were still held when this E3 wave shipped; their later authored-table delivery and completed terrain/panorama pair are recorded above in F-3D-D-37 through F-3D-D-41. No placeholder mask was inferred in either wave.

### F-3D-D-31 — Canyon's six pylon sites are load-bearing flats

The Canyon terrain shapes its gorge, shoulders, and eroded mesa around the six published pylon disks, then explicitly resolves each disk to a buildable-flat visual height. An independent review caught that the first verifier sampled only vertices: triangle interpolation still leaked up to 0.24 m of slope into a rim disk edge. The corrected builder carries the flat plateau one grid diagonal beyond the authored disk, and the corrected verifier samples 2,176 points on the actual exported triangle surface per site. It now reports zero height deviation at all six full-radius sites, below the 0.02 tolerance. The two published rim disks centred at z=8 overlap the published shallow-water edge by table design; the mask board discloses that authored relationship rather than silently moving either authority.

### F-3D-D-32 — The first night tile needs hardship and combat readability together

Canyon Works uses a dusk rig with deep gorge shadow, restrained blue-violet distance, and localized lantern warmth. The murky working river follows the exact published water mask inside the playfield; its continuation outside the bounds is evidence-only scenery and is absent from the terrain GLB. Iteration removed the early underexposure, straight water seam, slab-like edge, and ambiguous pylon overlays while preserving the intended dangerous night mood.

### F-3D-D-33 — Moth Season is a corridor, not a Canyon recolour

Moth Season has no river. Its identity comes from two exhausted yard rims framing a dark north/south migration corridor, wind-scoured ground, and asymmetric fevered distance. It shares the county's engraved frontier palette and grit vocabulary, but its composition, silhouette, traversal read, panorama, and mask story are distinct from Canyon Works.

### F-3D-D-34 — Panorama v2 needs structural depth, not only a painted cylinder

Each E3 panorama remains a separate mounted GLB. A single 2,496-triangle mesh combines a polar apron whose inner row traces one metre outside the rectangular playfield, an irregular near ridge, a quieter far ridge, and the sky ring; one embedded 2048² atlas and exported `COLOR_0` tint create the horizon-to-zenith density falloff and quadrant asymmetry. This avoids both failure modes found in review: a circular apron inside the tile can cover valid banks, while a circle outside the farthest corner leaves a visible moat. The final terrain/panorama join preserves Canyon's river continuation and hides behind layered distance and haze. The panorama changes no bounds, masks, spawns, fog gates, water, or build semantics.

### F-3D-D-35 — The fresh visual gate changed the deliverable before returning SHIP

Independent reviews rejected earlier candidates for underexposure, river-edge seams, a visible terrain plinth, wall-like panoramas, and unclear pylon evidence. Those were corrected in the builders and re-rendered. The final fresh unprimed verdict is `SHIP`: Canyon reads as a dangerous but playable dusk gorge; Moth Season reads as a separate migration-yard contract; both panoramas answer distance rather than wall or ceiling; no tree-like contamination or holiday mood remains.

### F-3D-D-36 — Preserve upstream contract drift as evidence, not local policy

The published Canyon mask table currently contains one rail entry while the aggregate E3 contract fixture expects two. This wave preserves the published authored mask table exactly and does not edit either factory-owned input. If the mismatch remains on the integrated main tip, `scripts/e3-mask-tables.test.mjs` will correctly stay red as an upstream reconciliation item rather than being hidden inside render-only art.

## E3 gate state

- Two terrain `.blend` / GLB / 2048² atlas / contract sets: PASS
- Terrain GLBs: 32,768 triangles, one mesh, one primitive, one material, one embedded atlas each: PASS
- Two separate Panorama v2 `.blend` / GLB / 2048² atlas / contract sets: PASS
- Panorama GLBs: 2,496 triangles, one mesh, one primitive, one material, one embedded atlas, exported `COLOR_0` each: PASS
- Whole-file byte-identical and semantic-identical reopen/re-export for all four GLBs: PASS
- Canyon water mask and bank agreement: PASS
- Six Canyon pylon-site buildable flats, maximum sampled deviation 0.00: PASS
- Moth Season no-river contract and migration-corridor identity: PASS
- Mood A/B, flat/sculpted A/B, mask agreement, and center-horizon distance gates: PASS
- Fresh final unprimed visual verdict: SHIP
- Integrated `npm run build`: PASS
- `node scripts/e3-mask-tables.test.mjs`: 1/2 PASS; exact-table test remains red only on the factory-owned second Canyon rail described in F-3D-D-36
- `src/`, simulation, choreography, landmark, and runtime edits: none

## E3 owner-verdict images

- `artifacts/map-rebuild-spike/e3-owner-verdict.png` — real run camera, overview, and low-angle family verdict
- `artifacts/map-rebuild-spike/e3-mood-ab.png` — shipped painted source / E3 hardship gate
- `artifacts/map-rebuild-spike/e3-flat-vs-sculpted-ab.png` — identical-camera flat/sculpted geometry proof
- `artifacts/map-rebuild-spike/e3-mask-agreement-board.png` — published masks, Canyon river banks, and six pylon flats
- `artifacts/map-rebuild-spike/e3-panorama-mood-ab.png` — panorama off/on and mood evidence
- `artifacts/map-rebuild-spike/e3-panorama-distance-gate.png` — playfield-center distance gate

READY-FOR-GATES

## Rival Dynamo Crawler wave

### F-3D-D-26 — The shipped Dynamo plate, not the queue shorthand, is the source

The queue calls the input `plate-e3-boss-crawler.png`; the ledger-backed file present in the repository is `assets/raw/plate-e3-boss-dynamo-crawler.png`, SHA-256 `eb52e2b77695536c2216958daae45028f044c6a80757ff4450424f59a3dae086`. The deterministic atlas builder samples that exact plate. No generated substitute, paid still-image model, or external 3D body entered the asset.

The resulting `assets/pilots/crawler-3d/crawler.glb` is base-centred at 3.20 × 1.389 × 2.6775 units. It contains exactly three identity-transform mesh nodes and three primitives, one shared embedded 1024² PNG atlas, 11,980 triangles against the 12,000 ceiling, and no camera, light, or animation. Its final SHA-256 is `a336f7574d42ae6e1d69d13310fd549411c442e93073fec6a64ea0128f4f75f9`.

### F-3D-D-27 — Component damage must be structural before the factory adds tint

The factory seam receives `drain_mast`, `tracks`, and `capacitor_bank`. Each has one default-zero damage morph: `Damage_ToppledDrainMast`, `Damage_ShatteredTracks`, and `Damage_RupturedCapacitorBank`. The mast falls from its armored foot and throws fragments; the near armor skirt tears away to expose and shed the track; the rack breaks outward while jars displace and jagged rupture cores become visible. This remains legible without depending on a future red flash or shader tint.

`renders/crawler-damage-states.png` is the visual gate. `renders/crawler-asset-contract.json` independently parses the GLB, confirms the names/bindings/budget/bounds, and proves whole-file byte identity plus semantic identity after reopening the saved Blender file.

### F-3D-D-28 — Run-camera critique changed the asset, not merely the board

Two fresh blind reviews rejected the early candidates. The first found an underexposed utility cart with weak damage and a stage-set canyon. The second still found a visually light open chassis, flat gorge evidence, and ambiguous track/capacitor failures. The corrections enlarged the armored underframe, added riveted track skirts, retained a visible tread rhythm, increased component separation, bent the river cut, raised continuous canyon rims, and changed the damage morph geometry itself.

The final fresh unprimed review returns `SHIP`. At the production 42° FOV it finds the boss dominant over the heroine, all three components readable, all three damage states unmistakable, and the static drain arc plus gorge channel credible as evidence-only combat pressure. Its non-blocking debt is honest: close-up piping/running gear remain simpler than the painted plate, and the engraved canyon surface is busy around the heroine and lower track.

### F-3D-D-29 — The model stops at the railcar-style presentation boundary

The package provides `.blend`, `.glb`, deterministic builder, renderer, verifier, source/reference A/B, run-camera verdict, turntable, damage sheet, and parsed contract. It does not edit `src/`, boss timing, attacks, collision, movement, masks, targeting, simulation ownership, or disposal. The heroine and drain arc in the gorge shot are temporary evidence objects; neither is saved in the GLB. Factory choreography remains the only runtime owner.

The threejs asset ladder was followed locally. Its API reference was read, then the credential probe returned blank `TRIPO_API_KEY`, `GEMINI_API_KEY`, and `ELEVENLABS_API_KEY`; no provider request, task id, paid credit, or downloaded model exists. The landmark freeze was preserved. The Pressure Garden/Incline mask heartbeat was still active at this checkpoint; it was retired after the final E2 pair shipped and its remote branch tip was verified.

## Crawler gate state

- Source plate and content hash pinned: PASS
- Exact nodes `drain_mast` / `tracks` / `capacitor_bank`: PASS
- One named default-zero damage morph per component: PASS
- 11,980 triangles against 12,000: PASS
- One material and one embedded 1024² PNG: PASS
- Base-centred identity-transform export: PASS
- Zero cameras, lights, animations, or external textures: PASS
- Generic saved-Blend re-export whole-file hash equality: PASS
- Dedicated reopen/re-export whole-file and semantic equality: PASS
- Python compilation and repository production build: PASS
- Fresh final unprimed visual verdict: SHIP
- Independent `codex review --uncommitted`: attempted; CLI exited after inventory without a review verdict, so it is not counted as a gate
- `src/`, choreography, simulation, and landmark edits: none

## Crawler owner-verdict images

- `assets/pilots/crawler-3d/renders/crawler-reference-ab.png` — shipped painted plate / real run-camera A/B
- `assets/pilots/crawler-3d/renders/crawler-canyon-run-camera.png` — heroine-scale canyon-gorge pressure shot
- `assets/pilots/crawler-3d/renders/crawler-turntable.png` — intact silhouette and component coverage
- `assets/pilots/crawler-3d/renders/crawler-damage-states.png` — three factory-facing damage morphs

READY-FOR-GATES
