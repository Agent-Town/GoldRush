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

They remain one region by sharing the same painted source plates, stained ochre/rust/river-stone palette family, rough working-water language, sparse acclimated vegetation, illustrated proportions, and camera grammar. They differ at the level that matters to play: macro silhouette, enclosure, water/ford read, spatial rhythm, focal landmark, and story condition.

No `src/` file changed. Simulation, collision, placement, spawns, range, line of sight, and water classification remain planar and code-owned. All landmarks, water surfaces, ford stones, lights, and cameras shown in verdict renders are temporary helpers removed before terrain save/export.

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
- 1,536 panorama triangles each against the 4,000 ceiling; one mesh and one material each: PASS
- Five distinct panorama GLB and atlas hashes; byte-identical semantic/binary re-exports: PASS
- Panorama playfield, spawn-edge, fog-gate, and water/build/spawn-mask non-interference metadata: PASS
- Panorama MOOD A/B with all fifteen source frames pinned by content hash: PASS
- Terrain acceptance frames prove the exported terrain; panorama-off/on frames are builder-generated and visibly distinct: PASS
- Fresh panorama review first answer: FIGHT at 96%; projection/atmosphere debt recorded in F-3D-D-17
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
- `artifacts/map-rebuild-spike/owner-run-camera-east-edge.png` — shifted real-camera seam check
- `artifacts/map-rebuild-spike/owner-county-overview.png` — county composition overview
- `artifacts/map-rebuild-spike/all-contracts-regional-family-verdict.png`
- `artifacts/map-rebuild-spike/all-contracts-unique-layout-verdict.png`
- per-map run-camera, overview, and low-angle renders live in the same artifact folder

The mood and building-grit boards are the current owner gates. The two older boards remain useful for regional cohesion and composition uniqueness.

READY-FOR-GATES
