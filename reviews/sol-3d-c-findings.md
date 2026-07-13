# SOL 3D-C — Town plate pilot findings

Branches: `sol/town-plate` (Wave 1), `sol/town-cozy-pack` (Wave 2)

Bases: Wave 1 `bacb5717`; Wave 2 `e21dc4aa`

Tip: exact Wave 2 SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — Wave 2 decoration complete; stable runtime interface preserved.**

## Wave 2 — detail and decoration

### Delivered

- Eight parcel-specific frontier clusters, authored as 170 parts and joined into the existing `TownPlate` mesh: Tavern workyard; Claim notice yard; Store delivery yard; School garden yard; Assay sample yard; Chapel flower yard; Stamp Mill supply yard; and Dynamo utility yard.
- Functional vocabulary includes hoop-and-stave kegs, crates, cinched sacks, hitching posts and tie rings, rope coils, buckets, unlit lantern posts, one pictogram-only notice board, work planks, and planted boxes.
- All decoration shares the plate's single 2048 x 2048 atlas and exports through the same stable `assets/pilots/town-plate-3d/town-plate.glb` interface.
- The independent Pan Monument was corrected at its existing plaza-prop path; it is deliberately not duplicated into the Town plate.
- Locked-camera Wave 1/Wave 2 A/B, clearance overlay, and focused Tavern, civic, and Pan detail renders.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Geometry budget | exported Town plate GLB | 17,596 triangles; pass under 30,000 |
| Baked surface | exported Town plate GLB | 1 mesh, 1 material, 1 embedded 2048 x 2048 PNG |
| Export hygiene | exported Town plate GLB | 0 cameras, 0 lights, 0 animations |
| Determinism | checked versus re-exported Town plate | byte-identical SHA-256 `6450898a74303282913f75a26583b20e1544f234c4d5831cab3df768af91be29` |
| Route clearance | authored cluster footprints versus canonical route corridors | minimum 3.6844 units |
| Building-pad clearance | authored cluster footprints versus all eight pads | minimum 0.17 units |
| Plaza-stage clearance | authored cluster footprints versus open center ring | minimum 6.7062 units |
| Flat-walk routes | 4,122 realized mesh ray-casts | max absolute height 0.037101; pass under 0.05 |
| Flat plaza | 749 realized mesh ray-casts | max absolute height 0.034182; pass under 0.05 |
| Pan asset | independent checked/re-exported GLB | 864 triangles; one material; byte-identical SHA-256 `fe5ab9f8eb5aa21799e81797adba583cd676c6de952aabd127aaaf2408f6d97d` |
| App build | exact final exported bytes | `npm run build` pass |
| Visual QA | fresh unprimed review of exact final full view, overlay, Tavern, and Pan details | SHIP |

### F-3DC-06 — Tavern workyard fixes the empty parcel edge, not the building shell

**Severity:** high, adjacent building-asset territory

**Evidence:** the flagged top-right parcel now has an intentional workyard with three kegs, a bucket, cinched feed sack, visible rope, and a hitch rail. Fresh visual QA judged these as functional frontier props. The large dark side planes remain the dominant unfinished read in the close-up; those planes are geometry/material in the separately mounted Tavern building model, not in the Town plate.

**Request from the plate:** schedule a Tavern full-wrap repair in the Tavern asset's owning wave. Do not hide the planes with plate clutter: building pads and actor approaches must remain clear, and the Town plate cannot conform safely to defects in a replaceable building shell.

### F-3DC-07 — Full-view decoration density is intentionally parcel-local

**Severity:** low, accepted tradeoff

**Evidence:** at the locked whole-town camera, each cluster is a small punctuation mark rather than a continuous prop field. This is required by the clear-pad, clear-route, clear-shipped-prop, and open-stage laws. Objective telemetry confirms the change is localized: edge energy increased 4.75%, average luminance changed -0.8585, and only 0.633% of pixels differ from Wave 1 by more than 32 grayscale levels.

**Decision:** preserve the safe negative space. Future warmth should come from building-owned porches/facades, independently mounted animated life, and lighting—not by filling the cast's walk corridors.

### F-3DC-08 — Pan Monument remains an independent prop

**Severity:** low, integration invariant

**Evidence:** Town already mounts `pan_monument.glb` separately. The corrected bowl, riffles, nuggets, handle, and civic plinth therefore remain at the existing plaza-prop path. The Town plate GLB contains no Pan geometry.

**Decision:** keep this split to avoid duplicate centerpieces and preserve independent replacement of plaza props. The final plate clearance audit leaves 6.7062 units to the open stage even before the independently mounted Pan is considered.

## Wave 1 — foundation

### Delivered

- Deterministic Blender build for a 44 x 44-unit engraved-earth town plate.
- Flat pads for every canonical `townLayout.ts` building slot plus the existing Dynamo Hall pilot site.
- Canonical ring road, seven building approaches, and north gate radial baked into the atlas and shallow relief.
- Relief reserved for non-walk space, with a raised/eroded north bank and muted river strip.
- Plate-only `.blend` and `.glb`; existing buildings and props are temporary render context only.
- Locked TS-04 painted-ground/plate A/B and a separate walk-loop/pad overlay.

### Gate evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Flat-walk routes | 4,122 realized mesh ray-casts | max absolute height 0.037101; pass under 0.05 |
| Flat plaza | 749 realized mesh ray-casts | max absolute height 0.034182; pass under 0.05 |
| Flat pads | 63 samples at each of 8 pads | worst max absolute height 0.000136 |
| Geometry budget | exported GLB | 8,192 triangles; pass under 20,000 |
| Baked surface | exported GLB | 1 material, 1 embedded 2048 x 2048 PNG |
| Export hygiene | exported GLB | 0 cameras, 0 lights, 0 animations |
| Determinism | checked versus re-exported GLB | byte-identical SHA-256 `04073f38e33f2fe55dafa530450e3d9007b96525f7a301922e44b95ab1082bb0` |
| Visual QA | fresh unprimed review of A/B plus overlay | ACCEPT; no fatal artifact |

### Findings

### F-3DC-01 — Building kits need a shared ground-contact convention

**Severity:** medium, adjacent territory

**Evidence:** the locked-camera render shows generally credible placement, but base treatment varies by kit: some models provide a visible foundation/skirt while others end directly at the ground plane. Contact shadows help, yet they do not fully unify the silhouettes.

**Request from the plate:** future building passes should choose one shared convention—small foundations/skirting authored into the building kits, or renderer-owned contact shadows/AO tuned for every kit. The plate already supplies nearly zero-height pads and a subtle baked contact collar; it should not grow per-building corrective geometry.

### F-3DC-02 — Dynamo Hall is an additive pilot site, not a canonical townLayout slot

**Severity:** medium, integration decision

**Evidence:** `townLayout.ts` contains seven canonical slots. Dynamo Hall's `(10, 10)` position and `5.5 x 3.5` footprint come from the Epoch 2 Steamworks manifest, so the builder records that source separately. That area is also close to the Pony Express plot used elsewhere in Town presentation work.

**Request from the plate:** attended integration should confirm long-term ownership of the northeast parcel before promoting this pilot pad to a runtime contract. No canonical coordinate was changed here.

### F-3DC-03 — North water should remain a restrained background read

**Severity:** medium, non-blocking visual follow-up

**Evidence:** fresh visual QA accepted the v1 but noted that the olive river strip can also read as a grassy berm because of the locked camera and hard rear silhouette.

**Request from the plate:** if a later environment pass extends the world beyond this pilot, continue the river surface or hide the rear plate silhouette with environment dressing. Do not raise or cut the nearby civic routes to solve the read.

### F-3DC-04 — Road wear is intentionally legible but overly regular

**Severity:** medium, non-blocking art follow-up

**Evidence:** fresh visual QA found the ring-and-spoke ruts readable but diagrammatic, with limited hierarchy between the ring road and secondary approaches.

**Request from the plate:** a future texture-only pass can vary route width, fade selected spokes, and add localized wagon wear while preserving the exact canonical centerlines and the flat-walk measurements.

### F-3DC-05 — Pale wagon exposure is a render-context issue

**Severity:** low, adjacent territory

**Evidence:** the northern covered wagon reads washed out in the shared evidence lighting while the plate itself remains within its non-emissive material contract.

**Request from the plate:** correct the prop material or Town lighting in its owning wave; do not compensate inside the ground atlas.

### Integration note

The pilot intentionally contains no runtime mount. The permanent painted ground remains untouched as the LITE, flag-off, and load-failure fallback required by the queue.

### Wave 1 merge classification

- Branch base: `bacb5717`.
- Main observed during final review: `f70a97ab3c2c`; it advanced after the branch was cut.
- LANE-TOUCHED: every delivered file is new and confined to `assets/pilots/town-plate-3d/`, `artifacts/town-plate-3d/`, or this findings file.
- MAIN-MOVED-ONLY: unrelated canon/story work after `bacb5717`; none of the builder's four input sources (`townLayout.ts`, `TownScene.ts`, the Dynamo manifest, or `ter-plaza-ground.png`) changed between the branch base and observed main.
- Expected integration: path-scoped add of new files; no textual conflict resolution required. The attended session should still rerun the SHA/source checks if main advances those inputs before landing.

## Wave 2 merge classification

- Branch base: `e21dc4aa`.
- Main observed during final review: `1da7bfb6`; it advanced after the branch was cut.
- LANE-TOUCHED: the existing Town plate asset/artifact paths, the independent Pan Monument build and binary at its existing plaza-prop path, and this findings file.
- MAIN-MOVED-ONLY: unrelated handoff/coordination work; none of `townLayout.ts`, `TownScene.ts`, the Dynamo manifest, the Wave 2 queue, or the Town recipe changed between the branch base and observed main.
- Expected integration: path-scoped merge of the listed asset and evidence files; no runtime source or queue/spec edit is part of this branch.
