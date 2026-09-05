| Priority | Area | Finding | Evidence path | Suggested fix |
|---|---|---|---|---|
| Before launch | Lantern | Replay remains a colored schematic, without the sculpted world | `src/ui/TrueReelTerrain.ts` | Reuse gameplay terrain and mounts |
| Before launch | Delivery | Prefetch eventually requests every available board contract | `src/assets/AdvanceStream.ts` | Bound speculative downloads |
| Before launch | Acceptance | The 25 MB delivery check warns by default; phone performance remains unverified here | `scripts/deploy.sh` | Require an explicit release verdict |
| Next | Textures | Identical atlases are embedded and loaded repeatedly | `assets/pilots/map-rebuild-spike/landmarks/` | Share one texture per pack |
| Next | Compression | Era variants and panoramas bypass asset-diet | `scripts/asset-diet.mjs` | Select assets explicitly; verify decoder coverage |
| Next | Height | Bilinear height sampling differs from the rendered triangles | `src/world/Terrain3dClaimPilot.ts` | Sample the actual triangle surface |
| Next | Lighting | Landmark paint uses substantial whole-surface emission | `src/world/Terrain3dClaimPilot.ts` | Calibrate paint and lighting together |
| Next | Factory | Generic re-export drops extras and disables animation | `scripts/reexport-pilot.sh` | Preserve each asset’s export contract |
| Next | Art | Era identity survives, but surface values become too uniform | `artifacts/town-e9/town-e9-wardrobe-board.png` | Restore material and value separation |
| Later | Hero | The 3D pilot has severe texture projection/stretching | `assets/pilots/hero-3d/hero-turntable.png` | Rework UVs before promotion |

Read-only review of the September 5 checkout, including concurrent working changes. I parsed all **444 GLBs** under `assets/`, `public/`, and `src/`: **904,237,916 bytes**. I also inspected existing renders and built assets. No build, tests, Blender export, or file changes were performed. The existing `dist/` has no `version.json`, so its measurements are evidence about those files, not a verified production build. Production fetches were unavailable.

## 1. 3D asset quality and consistency

### F-ASTRA-1 — Preserve the silhouettes; improve the surface hierarchy

These are measurements from GLB accessors and embedded image headers. “Vertices” means exported POSITION entries, including splits at UV/normal boundaries—not Blender’s welded vertex count. **Every asset below has one mesh primitive, one material, and one texture.** Sizes are decimal MB.

Paths are beneath `assets/pilots/`; terrain filenames are beneath `map-rebuild-spike/`.

| Asset | Vertices | Triangles | Texture | MB |
|---|---:|---:|---|---:|
| `the-claim-terrain.glb` | 16,641 | 32,768 | 2048² | 8.126 |
| `hill-mine-terrain.glb` | 16,641 | 32,768 | 2048² | 7.783 |
| `mare-claim-terrain.glb` | 16,641 | 32,768 | 2048² | 5.257 |
| `the-claim-panorama.glb` | 4,280 | 1,920 | 2048² | 0.518 |
| `landmarks/the-claim/active_headframe.glb` | 1,664 | 788 | 1024² | 1.988 |
| `landmarks/mare-claim/earthrise-listening-array.glb` | 2,124 | 1,132 | 1024² | 1.584 |
| `schoolhouse-3d/schoolhouse.glb` | 11,776 | 5,520 | 1024² | 1.386 |
| `schoolhouse-3d/schoolhouse.e2.glb` | 14,984 | 7,176 | 1024² | 1.499 |
| `schoolhouse-3d/schoolhouse.e8.glb` | 14,722 | 7,404 | 1024² | 1.831 |
| `schoolhouse-3d/schoolhouse.e9.glb` | 15,111 | 7,620 | 1024² | 1.734 |
| `assay-office-3d/assay-office.glb` | 6,922 | 3,340 | 1024² | 1.455 |
| `assay-office-3d/assay-office.e8.glb` | 9,969 | 5,380 | 1024² | 1.667 |
| `plaza-props-3d/covered_wagon.glb` | 1,440 | 784 | 256² | 0.054 |
| `hero-3d/hero-3d.glb` | 4,370 | 3,288 | 4096×2048 | 3.656 |

The buildings’ dimensions and grounding are reasonably disciplined. Schoolhouse remains **3.96 units wide and 5.60 high**, with minimum Y=0 across the sampled eras; its depth changes from 3.375 to 3.458. Assay Office remains 4.424 wide and 4.20 high. Its base model’s horizontal center offsets are only 0.028/0.020 units, within the runtime’s 0.06 tolerance.

The stronger criticism is visual:

- The E2/E3 Schoolhouse turntable preserves identity and construction convincingly.
- The E8/E9 wardrobe board preserves recognizable buildings, but large areas become nearly uniform grey or rust. Trim, walls, roofs, and structural members lose separation.
- The saved 390px Claim screenshot, `reviews/shots-beauty-claim/u5-run-camera-mobile.png`, shows dense granular ground competing with a small heroine.
- The Mare verdict board has a strong overall enclosure, but its square cut and dark trench dominate the crater vocabulary.

These are judgments of saved evidence, not freshly reproduced runtime defects.

**Suggestion:** retain the geometry and edit the existing atlases. Reserve the darkest values for functional edges and contact; distinguish roof, wall, frame, and machinery through broad value groups. Reduce fine ground noise near traversal space. Judge at actual gameplay size: the next useful detail is usually a readable roofline or bank, not another engraved fastener.

### F-ASTRA-2 — The hero GLB is an unfinished pilot, not a launch upgrade

`hero-3d.glb` has one skin and one animation, `Hero_Walk_8_Seedance`. Its material uses the atlas as **emission**, with black base color; it is not a conventional diffuse painted character.

The turntable visibly stretches illustration across the arms, body sides, and rear. Facial identity survives frontally, while the side views expose flattened forms and smeared paint. The large atlas does not solve the mapping.

A 4096×2048 RGBA texture with mipmaps represents approximately **42.7 MiB** before other resources. That is disproportionate for this gameplay silhouette.

**Suggestion:** retain the current sprite heroine. `src/entities/Hero.ts` uses generated sprites; I found no runtime reference to this GLB. Before promotion, unwrap complete side/back surfaces, simplify the painted detail, target a 1024² gameplay atlas, and validate walking from all camera headings. This is later work.

## 2. Runtime cost

### F-ASTRA-3 — Asset-diet’s headline is valid but incomplete

`scripts/asset-diet.mjs` applies Meshopt compression/quantization and WebP quality 80. It performs **no triangle simplification and no GLB texture resizing**.

The existing build contains:

- **413 GLBs, 346,843,012 bytes total**.
- **235 selected GLBs, 92,718,740 bytes** after processing.
- The Claim terrain reduced from **8,126,136 to 966,064 bytes**, retaining **32,768 triangles**.

The filename selector misses `.eN` variants: `schoolhouse.e8-…` does not start with `schoolhouse-`. Its built file remains **1,831,376 bytes with PNG**, whereas the base Schoolhouse becomes **224,384 bytes with WebP**. Panoramas are also outside the selected terrain/landmark set.

**Suggestion:** replace prefix assumptions with an explicit production asset list. Extend coverage first to assets actually reachable at launch, then era variants. Check every affected loader before requiring Meshopt: several boss paths instantiate a plain `GLTFLoader`.

Compression is worth keeping. It reduces delivery and encoded geometry costs; it does not demonstrate lower triangle work or lower decoded texture memory.

### F-ASTRA-4 — “One atlas per pack” currently becomes several textures at runtime

Hashing embedded image bytes found **57 duplicate-image groups**, representing **353,742,105 redundant source-image bytes** across pilot GLBs. This is repository redundancy, not simultaneous resident memory.

The Claim’s five landmark files each embed the identical **1,929,054-byte, 1024² atlas**. The loader caches by asset path, so five separate GLBs produce separate texture sources.

Estimated mipmapped RGBA residency for that pack is **26.7 MiB instead of 5.3 MiB**. Adding the Claim terrain and panorama gives roughly **69.3 MiB** for these seven image allocations alone, before sprites, water, shadows, or framebuffers. Actual driver allocation was not measured.

**Suggestion:** package each map’s landmarks as named nodes sharing one atlas, or introduce explicit shared texture ownership keyed by atlas identity. Preserve mount IDs and transforms. Share textures even when different landmarks need distinct tint materials.

WebP helps downloads; dimensions and GPU texture format determine residency. The [three.js texture guide](https://threejs.org/manual/en/textures.html) explains this distinction.

### F-ASTRA-5 — Prefetch lacks a total-work boundary

`src/assets/AdvanceStream.ts` prioritizes likely destinations sensibly and fetches two files at a time. However, it subsequently enqueues **every E1 contract and then every board contract**. There is no byte ceiling or normal-mode stopping point. Save Data restricts it to priority 1; lite disables it.

The release plugin narrows the public E1 contract set, so this does **not** mean every phone immediately downloads all ten epochs. Nevertheless, bounded concurrency is not bounded downloading.

**Suggestion:** preload the likely destination and, optionally, one successor. Stop after that or after a measured byte allowance. Resume further warming during deliberate idle time or a relevant navigation. This is a small launch improvement with lower risk than geometry surgery.

### F-ASTRA-6 — Batch opaque repetitions; preserve transparent ordering

`src/world/Scatter.ts:221` already creates instanced classes. Their `frustumCulled=false` means entire classes remain submitted. Town props use `source.clone(true)` in `TownTavernPilot.ts:579`, sharing resources but retaining separate draws.

There is also relevant negative evidence: `reviews/perf-e1-r2.md` records a **60-call reduction** from enemy instancing that was reverted to opt-in because transparent interleaving failed mobile visual checks.

**Suggestion:** merge or instance repeated **opaque** wagons, fittings, and compatible scenery first. Keep unique landmarks separate when their transforms, dressing, or visibility need independence. Introduce spatial scatter chunks only after a current census shows meaningful off-camera work.

The sampled 788–1,220-triangle Claim landmarks are already economical. Wholesale decimation is not the highest-return change.

## 3. Pipeline

### F-ASTRA-7 — A Blender pipeline exists; reproducibility needs consolidation

The current production method is largely scripted Blender construction and reuse:

- `build_the_claim_terrain.py` creates a regular relief grid and paint-derived atlas.
- `build_landmark_packs.py` imports existing bodies and derives map-specific forms.
- `build_schoolhouse.py` samples shipped illustration colors, constructs geometry, and makes an atlas.
- `build_town_e9_wardrobe.py` imports E8 shells, preserves their UVs, edits the atlas, and adds bounded accessories.

The E9 process is a useful implementation of the consistency law. It should be extended, not replaced by independent regeneration.

There is no README inside the current `map-rebuild-spike/` tree; its scripts, contracts, and `docs/SOL-3D-{C,D}-CRAFTBOOK.md` carry the explanation. Other pilots, such as Dome Commons, have useful README contracts.

Reproducibility is uneven. `Terrain3dClaimPilot.ts:282` explicitly records that the Twin Banks landmark pack no longer regenerated faithfully, motivating runtime dressing.

**Suggestion:** maintain one small build entry point per family with pinned Blender version, source hashes, seed, export profile, and contract output. Distinguish three checks:

1. Re-exporting a saved `.blend`.
2. Regenerating that `.blend` from its builder and inputs.
3. Validating the compressed runtime derivative.

Success at the first does not prove the second.

### F-ASTRA-8 — Standardize export and validation before adding more processing

`scripts/reexport-pilot.sh` exports all selected meshes and recognized anchor empties, but omits `export_extras=True` and always disables animations.

The Claim terrain GLB contains extras including `grid_segments`, `height_socket`, and water/ford metadata. Its original builder explicitly exports extras. The generic helper therefore does not preserve that contract. Applying it to the hero would also remove its animation.

A concrete, repeatable Blender-side sequence should be:

- **Normalize static sources:** set metric units and scale length 1; apply rotation/scale using `bpy.ops.object.transform_apply`; place the origin at footprint center and ground level using `bpy.ops.object.origin_set(type='ORIGIN_CURSOR')`. Do not apply the static recipe blindly to rigs.
- **Reduce selectively:** use `obj.modifiers.new(..., 'DECIMATE')`; dissolve coplanar construction or collapse expendable detail on a duplicate, then `bpy.ops.object.modifier_apply`. Preserve UV seams, hard edges, sockets, and silhouette. Regular terrain requires the separate treatment in F-ASTRA-10.
- **Bake only what needs baking:** use a selected destination image node and `bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, margin=16)`. Keep directional lighting out of albedo. Bake restrained AO separately; reserve emission for actual luminous surfaces.
- **Atlas predictably:** preserve existing UVs across era edits. For new islands, use `bpy.ops.uv.pack_islands` with an explicit margin policy and verify padding after downsampling. Keep tiny props at 256²–512², buildings around 1024², and 2048² terrain only where the gameplay view justifies it.
- **Export explicitly:** `export_format='GLB'`, `use_selection=True`, `export_yup=True`, `export_texcoords=True`, `export_normals=True`, `export_materials='EXPORT'`, `export_extras=True`, and cameras/lights disabled. Static and rigged assets need different animation settings. These are supported [glTF export controls](https://docs.blender.org/api/main/bpy.ops.export_scene.html).

CI should validate transformed bounds, finite attributes, triangle/primitive counts, actual texture dimensions, permitted material modes, named anchors, required extras, and external-resource policy. Compare source and compressed derivatives semantically. Retain locked-camera, four-angle, and 390px visual checks.

The existing Schoolhouse verifier reports byte identity but asserts only its selected semantic fields. Expand that evidence rather than claiming the factory lacks validators.

## 4. Scene and render code

### F-ASTRA-9 — Lighting exceptions weaken material consistency

`src/core/Renderer.ts` correctly establishes sRGB output and ACES tone mapping, with default exposure 1.05; scene code can override exposure. `LightRig.ts` supplies warm directional/hemisphere lighting and contract-dependent fog.

The weakness is landmark compensation: `keepLandmarkPaintReadable` routes the diffuse atlas into emission. Default intensity is **3**, with several tuned contracts around **1.45–1.5**. Most daylight landmarks therefore illuminate themselves while surrounding terrain responds to the sun.

All **443 material records** scanned in pilot GLBs were double-sided. That is justified for some sheets and panoramas, but unnecessary for many closed buildings.

**Suggestion:** calibrate representative terrain, landmark, building, and sprite together under one reference rig. Reduce whole-body emission gradually; retain emissive windows and teal systems. Enable backface culling on verified closed meshes, not through a global toggle.

Shadow spending is already partly disciplined: landmarks do not cast, scatter does not cast, lite uses blobs, and the zero-intensity night sun stops updating its shadow map. The directional shadow spans 96 units: balanced’s 1024 map gives about **9.4 cm per texel**.

The point-light pool allocates 32 slots but the configured cap is **8**, not 32 active lights. Six spotlight flash objects remain present even at zero intensity; inspect their shader cost before considering more lighting infrastructure.

### F-ASTRA-10 — Terrain topology is a runtime contract, and its height sampler is approximate

`Terrain3dClaimPilot.ts:527` infers a square grid from `sqrt(position.count)`, demands exactly one vertex per grid cell, and constructs a bilinear sampler. `validTerrain` also requires exact contract counts.

Consequently, applying arbitrary Blender decimation or replacing the mesh with a general LOD will fail installation.

There is an existing surface mismatch: rendered triangles interpolate linearly, while `visualY` samples bilinearly. I evaluated every triangle centroid in four source terrains:

| Terrain | Maximum discrepancy | 95th percentile |
|---|---:|---:|
| The Claim | 0.0253 units | 0.00072 |
| Twin Banks | 0.0230 | 0.00196 |
| Hill Mine | 0.1033 | 0.00025 |
| Mare Claim | 0.6667 | 0.00346 |

These are geometric measurements, not proof that a player occupies the worst points. The larger errors occur around abrupt relief.

**Suggestion:** interpolate on the grid’s actual triangle diagonal. For future LOD, publish the visual height data independently of render topology, with a declared surface-error tolerance. A 64×64 grid has 8,192 triangles versus today’s common 32,768, but cliff preservation and grounding must decide whether that reduction is acceptable.

Keep collision, movement, and benchmark state separate. The existing `Terrain.visualY` and height-source installation boundary are the right foundation; do not make GLB geometry authoritative for simulation.

## 5. Replay / Lantern view

### F-ASTRA-11 — The September fix improved geography, but did not reproduce the game world

The playtest document records the September 2 fix as shipped. Current source confirms what changed:

- `TrueReelTerrain.ts` creates an **80×56 SVG**, with a **16×12** height-sampling grid.
- It draws colored ground, waterways, contours, rails, and manifest features.
- It loads no terrain GLBs, painted terrain atlases, panoramas, or landmark bodies.
- It independently implements terrain-height formulas.
- `TrueReelRenderer.ts` overlays sprite images; decorative props remain explicitly absent.

The saved mobile screenshot confirms a brown rectangle and straight teal river strip. This resolves blank grey ground while leaving the owner’s underlying visual disappointment understandable.

**Suggestion:** retain `BrowserAgentTapeWorker` and verified snapshots as the replay authority. Extract the existing static world installation from its `Game` host, then reuse:

- `Terrain3dClaimPilot` asset selection, mount transforms, and visual-height source.
- The applicable water and atmosphere owners.
- `CameraRig`, renderer color management, and performance tiers.
- Existing visual entity components, driven by snapshot positions and interpolated between replay ticks.

Do not instantiate a second live game merely to obtain its scenery: that risks input, persistence, and lifecycle side effects.

For launch, a fixed camera over the existing world plus snapshot-driven sprites is a reasonable first slice. Full animation and decorative effects can follow. On lite, reuse the gameplay painted fallback. If the SVG remains temporarily, present it as a tactical replay and eliminate its duplicated height formulas.

The mobile Lantern layout also deserves immediate attention: in the saved capture, the map occupies roughly one-third of the image while framing and explanatory copy dominate. Give the ride more space.

## 6. Launch triage

### F-ASTRA-12 — Require evidence for the actual phone and delivery path

`PerformanceTier.ts:244` sends **all iOS devices to lite**, and `installTerrain3dClaimPilot` then skips the sculpted terrain. A 390px Chromium viewport therefore does not demonstrate either iPhone performance or iPhone visual parity.

Separately, `scripts/deploy.sh` has a **25,000,000-byte** town budget, but `STRICT=0` by default; overages and failed measurements warn and continue.

**Before public launch:**

- Give the featured Lantern reel the recognizable gameplay world, or explicitly label the temporary tactical presentation.
- Bound speculative prefetch.
- Require a recorded verdict for delivery budget, actual iPhone/lite readability, and a representative Android run under combat pressure. Measure first usable frame and sustained frame times separately.
- Keep the sprite heroine and existing geometry. Avoid a launch-wide asset rebuild.

**Next:**

- Deduplicate atlas residency and extend compression coverage.
- Repair export metadata preservation and builder reproducibility.
- Correct triangle-height sampling.
- Normalize landmark lighting and improve era value separation.
- Batch measured opaque repetitions.

**Later / nice-to-have:**

- Terrain LOD after separating height data from topology.
- KTX2/Basis GPU textures after shared-atlas ownership is established.
- A properly unwrapped 3D heroine.
- More elaborate replay animation, atmosphere, or lighting.

The low-poly landmark bodies, one-material building exports, era-preserving shells, asynchronous loading, and planar simulation boundary are all suitable foundations. They do not justify replacing this pipeline.

**What I would do first:** improve the featured Lantern replay using the world assets already paid for, while bounding prefetch. Then deduplicate one landmark pack and measure the memory difference on a real phone. That sequence improves the public experience and establishes a useful performance result without destabilizing the game.

