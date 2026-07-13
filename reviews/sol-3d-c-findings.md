# SOL 3D-C — Town plate pilot findings

Branch: `sol/town-plate`

Base: `bacb5717`

Tip: single-wave branch-tip commit; exact SHA is reported in the attended handoff

Verdict: **READY-FOR-GATES — asset pilot complete; no runtime seam touched.**

## Delivered

- Deterministic Blender build for a 44 x 44-unit engraved-earth town plate.
- Flat pads for every canonical `townLayout.ts` building slot plus the existing Dynamo Hall pilot site.
- Canonical ring road, seven building approaches, and north gate radial baked into the atlas and shallow relief.
- Relief reserved for non-walk space, with a raised/eroded north bank and muted river strip.
- Plate-only `.blend` and `.glb`; existing buildings and props are temporary render context only.
- Locked TS-04 painted-ground/plate A/B and a separate walk-loop/pad overlay.

## Gate evidence

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

## Findings

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

## Integration note

The pilot intentionally contains no runtime mount. The permanent painted ground remains untouched as the LITE, flag-off, and load-failure fallback required by the queue.

## Merge classification

- Branch base: `bacb5717`.
- Main observed during final review: `f70a97ab3c2c`; it advanced after the branch was cut.
- LANE-TOUCHED: every delivered file is new and confined to `assets/pilots/town-plate-3d/`, `artifacts/town-plate-3d/`, or this findings file.
- MAIN-MOVED-ONLY: unrelated canon/story work after `bacb5717`; none of the builder's four input sources (`townLayout.ts`, `TownScene.ts`, the Dynamo manifest, or `ter-plaza-ground.png`) changed between the branch base and observed main.
- Expected integration: path-scoped add of new files; no textual conflict resolution required. The attended session should still rerun the SHA/source checks if main advances those inputs before landing.
