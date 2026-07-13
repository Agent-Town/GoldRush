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

The preview composition itself creates 186 temporary objects, 13 temporary materials, and about 3,892 mesh triangles before curve tessellation. That is explicitly **not** a proposed runtime asset budget; it is the cheap deterministic layout model used to answer whether these landmarks belong on the map.

The generic recipe re-export passes geometry and budget, but omits custom node extras because it does not pass `export_extras`. The build script is authoritative until an attended promotion deliberately fixes that export seam. Full hashes and probes are in `artifacts/map-rebuild-spike/verification.json` and `assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json`.

## Same-camera evidence

The A/B uses the game's 42° vertical FOV, hero start `(0, 0.06, 12)`, camera offset `(0, 26.2, 18.3)`, and the established look target. A fixed `814×560` center crop removes the HUD without changing framing.

- shipped average luminance: `119.67525`
- composed average luminance: `113.58825`
- shipped edge energy: `0.05760`
- composed edge energy: `0.10496` (`1.82×`)

The slightly darker value comes from the lower daylight angle used to reveal forms and shadows. These metrics locate the visual delta; they are not a pixel-parity gate.

## Independent visual critique

An unprimed screenshot reviewer found that the first landmark render's ford looked like a hard rectangular overlay, the skeleton and chimney lost their identity, the shadows were too hard, and the sunset spent too much of its frame on orange sky. Those concrete defects were fixed: verdict water now uses its own procedural render material, the bones are thicker and brighter, the chimney is a capped dark masonry shape, daylight shadows are softer, and the sunset uses a higher camera plus cool fill and a contrasting dusk sky.

The reviewer also called out the overview's rectangular slab read, the straight river, weak small-prop hierarchy, and proxy softness. Those are retained as owner-verdict limitations rather than disguised: straight outer banks are forced by this Claim's water mask, and the landmarks are intentionally massing models awaiting an approval decision. Cactus overlap was retained because a dense thicket, not individually readable scatter, is the requested landmark.

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

### F-3D-D-06 — Camera composition is deliberately edge-weighted

The run camera keeps the central claim apron readable and places the mine, farmhouse, and cactus mass at the frame edges. The overview and sunset renders show the whole landmark silhouettes. That composition gives the player an open working area surrounded by place identity, but the owner should decide whether the far mine is too cropped before any production-quality landmark assets are commissioned.

### F-3D-D-07 — The preview landmarks are massing models, not final art

The low-poly ruin, farmhouse, cactus, and bones are deterministic procedural proxies built from Blender primitives. They prove size, placement, silhouette, and shadow. They do not yet reach the painted full-wrap quality of the approved town Tavern model. A promoted ladder should replace only the landmarks the owner approves, one asset family at a time, using the town handoff's complete-geometry and locked-camera rules.

### F-3D-D-08 — The generic recipe does not preserve safety extras

The final build-script GLB contains the render-only / planar / `Terrain.visualY` metadata. `scripts/reexport-pilot.sh` passes the mandated geometry check but produces a geometry-equivalent GLB without those extras. Do not substitute its output for the authoritative build until the promotion export path is deliberately extended.

## Sourcing and reference ledger

- Existing project plates only: the three processed terrain-bank variants, processed river tile, and `kit-era-1` palette plate.
- Existing 3D standard consulted: `artifacts/town-blender-v3/MODEL-HANDOFF.md` from the attended Tavern build, especially complete geometry, narrow painted edges, locked-camera silhouette, and separate debug/evidence paths.
- Tripo, Gemini, and ElevenLabs credential probes were blank. No external generation call, paid model, or new still image was used.
- Procedural proxies were chosen because this is an owner-composition gate and deterministic rebuild matters more than prematurely polishing assets that may be rejected.

## Recommendation

Use this revision to decide the **map grammar**, not to ship the proxies. If the owner likes the composition, the next ladder should author a genuinely new contract's water, fixture, build, and spawn masks in the map editor first; then Blender should sculpt terrain to that manifest and productionize only the approved landmarks. That order permits irregular banks and stronger place identity without lying about sluice placement or opponent reachability.

Rope/climb mechanics should remain outside this terrain ladder. They reopen combat reachability and farming risks that the render-only approach deliberately avoids.

## Gate state

- deterministic terrain GLB + atlas build: PASS
- recipe mesh/material/budget verification: PASS; generic recipe metadata preservation remains documented
- independent GLB and `.blend` parse: PASS
- triangle/material/texture budget: PASS
- planar/water/ford/apron/perimeter probes: PASS for the spike
- landmark runtime behavior: intentionally absent
- independent screenshot critique: ACTIONED; fixed water/ford, bone/chimney readability, shadow hardness, and sunset framing; retained documented mask/proxy limitations
- `src/` edits: none
- runtime/build/e2e gates: intentionally deferred to the attended promotion session

READY-FOR-GATES
