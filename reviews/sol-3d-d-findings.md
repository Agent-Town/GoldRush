---
source: codex
project: Gold Rush
date: 2026-07-13
type: digest
branch: sol/map-rebuild-spike
---

# Session 3D-D — Claim terrain and landmark composition spike

## Result

The flat-sim / 3D-render seam still holds, and the map now has an authored composition rather than one uninterrupted ground plate. The terrain mesh adds dry-land shelves, cuts, tailings, a wash, and hummocks. Four procedural landmark families test the larger rhythm Robin requested:

- a dense two-bank cactus thicket kept clear of the river and ford;
- a ruined mining headframe, rails, cart, shed, and tailings;
- a weathered farmhouse with porch, chimney, and broken fence;
- a bison skeleton in a shallow wash.

The owner-approved composition now also includes a restrained support-rubble pass: 36 rocks and eight broken timbers in loose, edge-weighted clusters. The ford and central claim apron remain open so the debris adds scale and lived-in texture without disguising the primary work/combat space.

These landmarks are **owner-verdict render helpers**, not shipped assets. They are generated for the renders and deleted before the `.blend` and `.glb` are saved. The saved deliverable contains exactly one terrain mesh and one material. No collision, movement, damage, pathing, line-of-sight, spawn, or placement behavior was added.

Owner verdict set:

- `artifacts/map-rebuild-spike/owner-run-camera-sculpted.png` — the exact run-camera angle;
- `artifacts/map-rebuild-spike/owner-layout-overview.png` — whole-tile composition read;
- `artifacts/map-rebuild-spike/owner-low-sunset.png` — low angle showing relief and the mine silhouette;
- `artifacts/map-rebuild-spike/owner-ab-shipped-flat-vs-sculpted.png` — identical-framing A/B;
- `artifacts/map-rebuild-spike/owner-progression-flat-terrain-landmarks.png` — flat → terrain → composition progression.

## Hard-law evidence

- `src/` is untouched. The final GLB node extras declare `render_only=true`, `sim_surface=planar`, and `height_socket=Terrain.visualY`.
- The exported mesh authors game X/Z as Blender X/-Y and visual height as Blender Z. Blender's glTF conversion therefore lands at game `(X, visualY, Z)` without mirroring north/south.
- The simulation river remains `z=-5..5`; visible shallows remain `±6.25`; the sole ford remains `x=-3..3`.
- The cactus thicket never places a preview cactus inside `|z|<7`. New local landform relief fades in only across `|z|=7.5..9.5`, so it contributes zero extra height at the `z=±6.5` sluice aprons.
- Across `x=-24..24`, the north/south apron along-bank grades remain at most `0.0700 / 0.0595` per metre. The local landmark relief begins farther inland.
- The outer 512 terrain vertices remain capped at `1.10 m`, below the current vista inner-edge ceiling of `1.18 m`.
- Opening the final `.blend` shows one object (`TheClaimTerrain`), one material, zero cameras, and zero lights. Parsing the GLB shows the same one-mesh/one-material contract and no landmark nodes.

## Export contract and cost

`scripts/reexport-pilot.sh` reports one mesh, one material, 32,768 triangles, zero cameras, and zero lights.

- GLB: `8,114,748` bytes
- GLB SHA-256: `d9dbaf34295e62e7f57890f1b4e1649d19ce84f6cecdd2ed4ed8e74037460661`
- vertices: `16,641`
- triangles: `32,768 / 60,000` budget
- material: one, metallic `0`, roughness `0.9`, no emission
- image: one embedded `2048×2048` PNG
- terrain primitives / attributable draw calls: one
- animations / cameras / lights: zero

Repeated final-geometry builds reproduced the GLB and atlas hashes. `.blend` bytes retain Blender session/path metadata. Eevee shadow sampling changed render bytes between builds without changing the authored composition, so render pixel identity is not claimed.

The preview composition itself creates 230 temporary objects, 13 temporary materials, and about 4,740 mesh triangles before curve tessellation. That is explicitly **not** a proposed runtime asset budget; it is the cheap deterministic layout model used to answer whether these landmarks and support rubble belong on the map.

The generic recipe re-export passes geometry and budget, but omits custom node extras because it does not pass `export_extras`. The build script is authoritative until an attended promotion deliberately fixes that export seam. Full hashes and probes are in `artifacts/map-rebuild-spike/verification.json` and `assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json`.

## Same-camera evidence

The A/B uses the game's 42° vertical FOV, hero start `(0, 0.06, 12)`, camera offset `(0, 26.2, 18.3)`, and the established look target. A fixed `814×560` center crop removes the HUD without changing framing.

- shipped average luminance: `119.67525`
- composed average luminance: `113.57696`
- shipped edge energy: `0.05760`
- composed edge energy: `0.10535` (`1.83×`)

The slightly darker value comes from the lower daylight angle used to reveal forms and shadows. These metrics locate the visual delta; they are not a pixel-parity gate.

## Independent visual critique

An unprimed screenshot reviewer found that the first landmark render's ford looked like a hard rectangular overlay, the skeleton and chimney lost their identity, the shadows were too hard, and the sunset spent too much of its frame on orange sky. Those concrete defects were fixed: verdict water now uses its own procedural render material, the bones are thicker and brighter, the chimney is a capped dark masonry shape, daylight shadows are softer, and the sunset uses a higher camera plus cool fill and a contrasting dusk sky.

The reviewer also called out the overview's rectangular slab read, the straight river, weak small-prop hierarchy, and proxy softness. Those are retained as owner-verdict limitations rather than disguised: straight outer banks are forced by this Claim's water mask, and the landmarks are intentionally massing models awaiting an approval decision. Cactus overlap was retained because a dense thicket, not individually readable scatter, is the requested landmark.

A second unprimed critique focused on the rubble pass. It confirmed the ford and central play corridor remained readable, but found stamped cactus orientation, an intersecting southwest cactus/timber pair, and debris that stopped too abruptly before the outer fields. The final pass varies cactus arm directions, moves the intersecting props clear of the boulder group, and feathers small rock clusters toward the tile edges. The critique also repeated the already documented mine crop and farmhouse proxy-read limitations; those remain promotion decisions rather than scope-expanding edits to this render spike.

The independent repository-review process recursively launched another `codex review` and was terminated rather than allowed to loop. Its completed diagnostics were still actionable: they found a Blender/game yaw mismatch in the farmhouse attachments, a cactus path condition that could never run after the dry-bank filter, and fence rails grounded from the wrong post. The yaw and rail grounding were corrected; the dead path condition was deleted. Because the reviewer never returned a final verdict, the build/parse/recipe/diff checks below remain the formal gates.

## Findings for an attended follow-up

### F-3D-D-01 — The planar law forbids gameplay perches

The tile rises to `2.238 m` internally, but Claim simulation height remains flat. Hero, opponents, buildings, pickups, and effects must receive the same render-side `Terrain.visualY` placement. Nothing in this GLB may become collision, cover, line-of-sight, range, or pathing data. This keeps the long-range heroine from acquiring a visual perch enemies cannot contest.

### F-3D-D-02 — A cactus barrier is a gameplay feature, not scatter art

The dense cactus thicket is visually convincing as a slow or hazardous passage, but this spike does not make that promise. If the owner ratifies cactus terrain later, one attended gameplay slice must define hero and enemy traversal together, projectile/line-of-sight behavior, damage cadence, spawn exits, and anti-farming escape routes. Making only the heroine slow while opponents ignore the thicket — or allowing shots through an impassable wall — would create the exact unfair safe spot raised in discussion.

### F-3D-D-03 — Permanent landmarks need editor-authored footprints

The mine, farmhouse, thicket, and skeleton currently have no sim footprint. Production versions need explicit fixture/build-exclusion shapes in the new contract manifest or map editor, with enemy routing and spawn validation performed against the same shapes. Their Blender geometry must not silently become the collision owner.

### F-3D-D-04 — Dynamic buildings still need padded visual grounding

The Claim has no authored build-zone subset; every bank remains potentially buildable. A promotion must place each dynamic building at the established padded `Terrain.visualY(x,z,base,padRadius)` result, then verify footprints at runtime. Do not flatten the sim, move pads, or make Blender geometry the placement validator.

### F-3D-D-05 — Keep shipped water as the runtime owner

The GLB is the land/river-bed visual. Water and ford stones in the verdict renders are temporary copies of shipped runtime geometry and are removed before save/export. The procedural verdict water material is not a substitute for the animated, transparent `LivingWaterShader`; it only avoids the terrain-atlas rectangle in a static Blender render. Promotion should keep `src/world/Water.ts` as water/ford owner and overlay it at the established water level; it must not load a second gameplay-water mask.

### F-3D-D-06 — Camera composition and rubble are deliberately edge-weighted

The run camera keeps the central claim apron readable and places the mine, farmhouse, cactus mass, and low support rubble toward the frame edges. The overview and sunset renders show the whole landmark silhouettes and feathered outer debris. That composition gives the player an open working area surrounded by place identity, but the owner should decide whether the far mine is too cropped before any production-quality landmark assets are commissioned.

### F-3D-D-07 — The preview landmarks are massing models, not final art

The low-poly ruin, farmhouse, cactus, and bones are deterministic procedural proxies built from Blender primitives. They prove size, placement, silhouette, and shadow. They do not yet reach the painted full-wrap quality of the approved town Tavern model. A promoted ladder should replace only the landmarks the owner approves, one asset family at a time, using the town handoff's complete-geometry and locked-camera rules.

### F-3D-D-08 — The generic recipe does not preserve safety extras

The final build-script GLB contains the render-only / planar / `Terrain.visualY` metadata. `scripts/reexport-pilot.sh` passes the mandated geometry check but produces a geometry-equivalent GLB without those extras. Do not substitute its output for the authoritative build until the promotion export path is deliberately extended.

## Sourcing and reference ledger

- Existing project plates only: the three processed terrain-bank variants, processed river tile, and `kit-era-1` palette plate.
- Existing 3D standard consulted: `artifacts/town-blender-v3/MODEL-HANDOFF.md` from the attended Tavern build, especially complete geometry, narrow painted edges, locked-camera silhouette, and separate debug/evidence paths.
- Tripo, Gemini, and ElevenLabs credential probes were blank. No external generation call, paid model, or new still image was used.
- Procedural proxies were chosen because this is an owner-composition gate and deterministic rebuild matters more than prematurely polishing assets that may be rejected.

## Contract theme differentiation audit

### Finding — the spike is The Claim, but its landmarks mostly read as Dry Gulch

The terrain deliverable is unambiguously wired to `frontier-river-claim`: its river band, central ford, metadata, camera evidence, and export contract all belong to **The Claim**. The confusion is thematic rather than technical. The cactus thicket, ruined mine, abandoned farmhouse, bison skeleton, ochre dryness, and broad empty desert are a much closer match for the approved **Dry Gulch** plate than for the approved **Claim** plate.

The runtime comparison supports Robin's observation. A shared dry-bank crop from the current Claim and Dry Gulch gameplay shots has screenshot distance `0.01153`, mean absolute error `4.76741`, and almost identical edge energy (`0.07933` versus `0.07721`). The measurements are only locators, not acceptance gates, but visual inspection reaches the same conclusion: away from the water feature, both places use nearly the same ground, scale, detail rhythm, and camera composition. Dry Gulch's defining spring is not visible from its opening view, so the map initially loses its strongest distinguishing landmark.

An unprimed comparison against the approved contract plates independently described the Blender result as “Claim infrastructure placed inside Dry Gulch dressing.” It assigned the river and ford to The Claim; cactus, skeleton, bare sand, and angular dry rock to Dry Gulch; and noted that the mine and shack can read as Claim only when they look active rather than abandoned. Its highest-impact recommendations were distinct macro silhouettes, theme-controlled landmark kits, and separated moisture/material treatment. Those judgments match the descriptor and screenshot evidence without relying on labels.

The maps need distinct *place grammars*, not merely different tint values:

| Contract | Current authored distinction | Why the present read converges | Stronger identity |
| --- | --- | --- | --- |
| **The Claim** | Classic river, one ford, otherwise mostly default terrain | Its current flat bank and the spike's desert ruins both borrow Dry Gulch's visual language | A living first claim: greener wet banks, riparian growth, fresh stake, working tent, sluice timber, barrels, pan, wagon and camp traces |
| **Dry Gulch** | Mesa relief, dry washes, sparse cactus, and one sunken spring | Its ochre surface and generic scatter resemble the Claim until the distant spring enters view | Scarcity and abandonment: mesa walls, washes visibly draining toward the only green oasis, ruined mine, abandoned farmhouse, cactus thicket, bones and bleached debris |
| **Twin Banks** | Wider river, two fords, gravel bars, reeds and two build areas | The fixed straight river still reads as the Claim with extra reeds | Wet braided homestead: islands, multiple channels, reed beds, driftwood and two unmistakable claimed parcels; this needs authored water topology before Blender can depict it honestly |
| **Night Shift** | The Claim geography under a dusk-to-dark lighting rule and lantern chain | Its similarity is intentional, but it separates only once darkness arrives | Keep the same physical Claim; make cold darkness, warm lantern pools and reflected river light the transformation |
| **Baron** | The Claim geography under boss pressure | It is currently distinguished mainly by combat and UI | Keep the same physical Claim; add an occupation/siege dressing state with oxblood banners, wreckage, enemy-camp silhouettes and rocket traces |

### Landmark ownership

The existing sculpted relief is useful for **The Claim**, but the visible landmark kit should not be promoted there unchanged.

- Move the cactus thicket, *ruined* mine, abandoned farmhouse, bison skeleton, sun-bleached rubble and harsher mesa silhouettes into the visual plan for **Dry Gulch**.
- Give **The Claim** inhabited river-valley evidence: active headframe or sluice work, maintained timber and shack, fresh staking, a camp, damp-bank vegetation, river debris, darker stone, and only sparse desert growth on the remote uplands.
- Let **Twin Banks** own saturated wetland density and complex water silhouettes rather than trying to distinguish it with reeds alone.
- Treat **Night Shift** and **Baron** as states of The Claim, not as additional biomes. Their recognition should come from lighting and scenario dressing while the terrain remains familiar.

This creates an intentional contrast: **The Claim is a place being made; Dry Gulch is a place that failed and dried out.** That narrative difference gives every prop, color, silhouette, and route cue a consistent test.

### Recommended order

1. Keep the current Claim terrain relief and river agreement, but produce a same-camera render variant with the desert landmark kit replaced by the living working-claim kit.
2. Reuse the rejected desert composition as the starting art direction for a dedicated Dry Gulch rebuild, shaped around its existing mesa, washes, and spring descriptor.
3. Promote either terrain only as a default-off visual pilot through the existing `Terrain.visualY` seam; movement, placement, spawning, damage, and water ownership remain planar.
4. Design an authored water-mask capability before rebuilding Twin Banks. Gravel bars inside one straight strip cannot deliver the approved braided-water identity.
5. Build Night Shift and Baron as render dressing layers over the approved Claim base rather than duplicating terrain assets.

The current editor can already carry bounded render-height deltas and circular spring ponds, which is enough to iterate Claim and Dry Gulch. It cannot yet author the irregular multi-channel water shape Twin Banks needs. Palette controls are also currently terrain-only; water and scatter colors remain code-owned, so a theme pass must not promise editor controls that do not exist.

### Sequential loop checkpoint 1 — The Claim

The first themed revision keeps the approved Claim terrain, river band, ford, camera, and export contract. It replaces the cactus thicket and skeleton with a working tent camp, fresh stake, maintained house, active extraction equipment, cottonwoods, reeds, and darker river stones. The damp corridor also receives a restrained cooler tint while the dry uplands retain the shared painted-terrain source.

`artifacts/map-rebuild-spike/claim-theme-ab.png` is the identical-camera decision image. It shows that the change can separate the Claim without new gameplay topology: the before side reads as abandoned desert, while the revision reads as inhabited river work. The final GLB remains one mesh, one material, 32,768 triangles, and one 2048² texture; all landmarks remain excluded render helpers.

### Sequential loop checkpoint 2 — Dry Gulch

Dry Gulch now has its own render-only terrain build rather than borrowing the Claim surface. The mesh follows the existing descriptor: no river, a basin centered on the fixed `(-18,-18)` spring, the southwest and east dry washes, and a raised mesa rim. The palette is hotter red ochre; oasis green is concentrated around the one spring. The Claim's rejected desert props become purposeful here: ruined extraction, abandoned house, cactus thicket, bison bones, and bleached rubble.

`artifacts/map-rebuild-spike/claim-vs-dry-gulch-theme-ab.png` uses identical framing and now reads as two different places before labels are considered. The real run camera sees the spring only at the far upper edge; `artifacts/map-rebuild-spike/dry-gulch-layout-overview.png` is therefore the necessary topology verdict showing both washes feeding its basin. The headframe was moved away from the pond in the preview so the only water source remains readable without changing its authored coordinates or radius.

The Dry Gulch GLB independently passes the same recipe ceiling: one mesh, one material, 32,768 triangles, one 2048² texture, zero cameras, and zero lights. The pond and all landmarks are render helpers removed before export; runtime water remains the spring circle from the contract.

### Sequential loop checkpoint 3 — Twin Banks

`artifacts/map-rebuild-spike/twin-banks-topology-verdict.png` renders every distinction the current descriptor can honestly own: the wider `7.8` half-width water strip, west and east fords, both gravel bars, north and south stake markers, and damp-bank reeds. These elements make the contract's two-front play readable, but the overview also proves the limitation: they remain features inside one rectangular channel and do not form a braided river.

No Twin Banks GLB was created. Duplicating the Claim terrain and baking fake side channels into its color or height would make the render disagree with water sampling, opponent routing, and building placement. Twin Banks therefore stops at an owner-reviewable render/capability gate until an authored water-mask or versioned multi-channel descriptor exists. The state renderer reuses the approved Claim terrain file and creates only temporary descriptor-owned water and dressing geometry.

### Sequential loop checkpoint 4 — Night Shift

Night Shift deliberately reuses the Claim terrain and landmark layout. `artifacts/map-rebuild-spike/night-shift-lighting-verdict.png` compares the true-dark cold lantern chain with one post relit at identical framing. The first frame preserves just enough cold blue silhouette to orient the player; the second makes the gameplay promise immediately legible through one concentrated warm pool and river reflections.

The seven temporary post proxies use the exact pre-placed contract coordinates. The warm frame is a state demonstration, not a change to the authored start: all seven remain wrecked in the descriptor until the player pays to relight one. No duplicate terrain or GLB is needed; this identity belongs to the lighting and fixture state layered over The Claim.

### Sequential loop checkpoint 5 — The Claim-Jumper Baron

`artifacts/map-rebuild-spike/baron-siege-verdict.png` keeps the same daylight, camera, river, ford, camp, and terrain on both sides. The Baron state changes only the far-bank story: oxblood standards, dark enemy tents, wreckage, and a three-tube rocket cart occupy the approach across the river. This is enough to communicate that the familiar Claim is under occupation without pretending the boss contract is a new biome.

Map-scale rocket trails were rejected during the render pass because the run camera turned them into dominant lines across the whole playfield. Rocket flight and impact telegraphs remain combat VFX; the static map dressing only establishes their launcher and siege camp. No Baron terrain or GLB was duplicated.

## Recommendation

Use this revision to approve the **relief grammar**, not the Claim landmark kit. The next visual comparison should keep the same terrain and camera while replacing the desert landmarks with the living working-claim kit. The desert composition should become the reference for a dedicated Dry Gulch rebuild. Any permanent landmark must still follow editor- or manifest-authored water, fixture, build, and spawn truth before Blender production work begins.

Rope/climb mechanics should remain outside this terrain ladder. They reopen combat reachability and farming risks that the render-only approach deliberately avoids.

## Gate state

- deterministic terrain GLB + atlas build: PASS
- recipe mesh/material/budget verification: PASS; generic recipe metadata preservation remains documented
- independent GLB and `.blend` parse: PASS
- triangle/material/texture budget: PASS
- planar/water/ford/apron/perimeter probes: PASS for the spike
- landmark runtime behavior: intentionally absent
- independent screenshot critique: ACTIONED twice; fixed water/ford, bone/chimney readability, shadow hardness, sunset framing, stamped cactus orientation, rubble intersections, and abrupt debris falloff; retained documented mask/proxy limitations
- `src/` edits: none
- runtime/build/e2e gates: intentionally deferred to the attended promotion session

READY-FOR-GATES
