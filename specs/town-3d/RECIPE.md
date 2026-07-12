# Town 3D building recipe

Use this recipe for every Town building and contract buildable. Keep the painted facade as the LITE-tier and load-failure fallback.

## 1. Lock the inputs

1. Open `assets/processed/bld-<building>.png` as the color, stroke, material, and proportion reference.
2. Read the building's `footprint` and plaza slot from `src/town/townLayout.ts`; do not invent a second layout value.
3. Record the runtime name, approach point, interaction, flag, and fallback before modeling.
4. For calibration, use the Tavern facts: `bld-tavern.png` is 384 square; its slot is `5.2w × 3.4d`; its accepted mesh is `5.128w × 3.393d × 3.960h`.
5. Set Blender to meters, Z-up, and a base-center world origin; use X for width and Y for depth.
6. Add the painting as a non-rendering reference image and view it through the locked Town camera direction as well as front, side, and back orthographic views.
7. Preserve the public building identity and canon; add no readable signs, firearms, gore, or genre-parody decoration.

## 2. Block the complete volume

1. Block one box inside the footprint, place its floor at `Z=0`, and keep its origin at `(0, 0, 0)`.
2. Match the painting's large ratios first: wall-to-roof height, frontage width, porch depth, eave reach, and primary opening placement.
3. Interpret painted perspective instead of copying pixel lengths; verify the silhouette at gameplay zoom after every large change.
4. Model all four sides, the roof, eaves, and underside-visible edges; never stop at a decorated front plane.
5. Add depth where it changes the game-camera silhouette or proves a walk-under/around volume.
6. Keep the mesh inside the layout footprint; change neither the slot, approach point, coordinates, nor sim collision to accommodate art.

## 3. Spend geometry where it reads

1. Stay at or below 15,000 triangles; target one mesh, one primitive, and one material.
2. Spend triangles on the roof mass, corners, porch/eaves, posts, doors, chimney, and side/back service shapes.
3. Use narrow flat-shaded bevels for readable edges and relief.
4. Paint plank strokes, roof courses, hatching, hardware, and small trim into the atlas instead of modeling them.
5. Remove unseen interior faces and decorative geometry that disappears at the locked camera.
6. Keep forms planar and deliberate; reject inflated smoothing, glossy rounded trim, and melted-plastic silhouettes.

## 4. Author the painted atlas and UVs

1. Create one 1024×1024 sRGB RGBA atlas and one UV layer named `UVMap`.
2. Build the atlas from the processed painting: carry its hues, line density, directional strokes, painted shadows, and upper-left highlights onto every visible face.
3. Extend the painting's material language around corners; author side and back walls rather than stretching the front image around the shell.
4. Reserve coherent atlas regions for walls, roof, trim, openings, and accents; keep strokes aligned with each surface.
5. Mark seams on hidden, underside, or natural construction edges; unwrap the actual final geometry and pack every island with safe padding.
6. Check every UV island for paint coverage and directional consistency; eliminate empty/background sampling and edge bleed.
7. Treat this as an authored atlas bake, not a camera-projection shortcut. The accepted Tavern source retains no projection helper or bake-node rig.
8. Reproduce its preserved material graph exactly: use one Image Texture node with projection `FLAT`, extension `REPEAT`, interpolation `Linear`, and the packed sRGB atlas.
9. Let that Image Texture use the active `UVMap`; add no Texture Coordinate or UV Map node unless the active-layer behavior becomes ambiguous.
10. Link `Image Texture.Color` to `Principled BSDF.Base Color`, then link `Principled BSDF.BSDF` to `Material Output.Surface`.
11. Set metallic to `0` and roughness to `0.9`; use no emission, clearcoat, normal-map gloss, or lighting compensation.
12. Pack the atlas into the `.blend`; verify the exported GLB embeds one PNG and needs no external texture.

## 5. Match the Town tone

1. Drop the GLB into the FULL-tier pilot and capture it at the locked TS-04 Town camera beside its painted neighbors.
2. Measure non-ground luminance in fixed, repeatable regions for the new building and an adjacent painted facade.
3. Keep the absolute luminance delta within 5%; record both values and the percentage.
4. Lift or lower albedo inside the painting's existing hue band; never add emission to escape darkness.
5. Compare hue, stroke density, outline weight, and accent restraint as well as luminance.
6. Save a same-camera contact sheet and a numeric metrics JSON under the slice artifact directory.
7. Reject the candidate if it silhouettes darkly, turns photoreal, becomes glossy, or reads as a different regional architecture.

## 6. Export and inspect

1. Apply transforms and modifiers; recalculate normals; leave the object's base centered at world origin.
2. Keep exactly one visible mesh and one material; remove reference planes, cameras, lights, helpers, and unused materials from export.
3. Export binary glTF (`.glb`) with applied modifiers, embedded data, cameras off, and lights off.
4. Re-import the GLB into a clean Blender scene and verify one mesh, one primitive, one material, one embedded image, bounds, origin, and triangle count.
5. Verify metallic `0`, roughness `0.9`, no emissive texture, no animation, no camera, and no light.
6. Save the `.blend` beside the GLB under `assets/pilots/<building>-3d/`.
7. Headlessly re-export the saved `.blend`; compare SHA-256, size, parsed bounds, triangles, materials, images, cameras, and lights with the checked GLB.
8. Allow byte drift only when the parsed contract and browser gate still pass; explain any semantic drift.

## 7. Clone the per-building browser gate

1. Copy `e2e/town-tavern-blender.spec.ts` to `e2e/town-<building>-blender.spec.ts`; keep its seed, WebGL counter, error bucket, measurement window, and screenshot helper.
2. Replace the model marker, building id, approach interaction, expected bounds, and artifact directory; derive expected bounds from the inspected GLB.
3. Assert the default flag-off boot renders the facade and makes zero GLB requests.
4. Assert `?town3dPilot&tier=full` loads the GLB, reports one mesh, at most 15,000 triangles, one material, and the inspected bounds.
5. Assert p95 frame time is no more than 115% of the same-run facade baseline.
6. Walk to the unchanged approach point, open the building's existing interaction, exit Town, and assert disposal.
7. Assert `?town3dPilot&tier=lite` keeps the facade and makes zero GLB requests.
8. Fulfill the model request with invalid bytes; assert the facade and interaction survive the load failure.
9. Assert zero console errors and zero page errors in every case.
10. Run all cases on desktop and mobile-390 against the dev server and production preview; save screenshots and renderer JSON for both.

## 8. Reject known failure modes

- Reject paper theater: require authored side/back walls, roof, eaves, and a walk-around volume.
- Reject style drift: keep frontier settlement craft, the processed painting's palette, and the building's public identity.
- Reject darkness: correct albedo and remeasure; never use emission.
- Reject melted plastic: remove inflated smoothing and gloss; restore planar forms, painted strokes, and narrow bevels.
- Reject stretched paint: repack UVs and author each face; never wrap one facade crop around the volume.
- Reject micro-geometry: bake detail that does not change the gameplay silhouette.
- Reject layout drift: restore the declared footprint, base-center origin, approach point, and visual-only seam.
- Reject runtime coupling: keep one default-off flag, permanent LITE fallback, and zero sim or coordinate changes.
- Reject unproved art: require the locked-camera contact sheet, numeric tonal match, parsed asset contract, p95 evidence, and both browser projects green.
