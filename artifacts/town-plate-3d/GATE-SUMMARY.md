# Town plate 3D-C Wave 2 gate summary

Verdict: **READY-FOR-GATES — decoration pass shipped by fresh visual QA.**

## Town plate asset contract

| Gate | Result |
| --- | --- |
| GLB SHA-256 | `6450898a74303282913f75a26583b20e1544f234c4d5831cab3df768af91be29` |
| GLB bytes | 7,899,168 |
| Geometry | 1 mesh, 1 primitive, 17,596 triangles; pass under 30,000 |
| Material | 1 baked material; metallic 0; roughness 0.9; no emission |
| Texture | 1 embedded PNG, 2048 x 2048 |
| Scene payload | 0 cameras, 0 lights, 0 animations |
| Three.js bounds | 44 x 3.331283 x 44 units; base/plaza origin `(0, 0, 0)` |
| Deterministic export | checked GLB and `reexport-pilot.sh` output are byte-identical |

Full machine-readable evidence: `asset-contract.json`.

## Decoration and clearance contract

- Eight parcel clusters supply era-1 frontier vocabulary: kegs/barrels, crates, sacks, hitching posts, rope coils, buckets, unlit lantern posts, a pictogram-only notice board, planks, and planters.
- All 170 authored parts are joined into the Town plate's single exported mesh and share its single atlas material.
- Minimum clearance from a canonical actor route: **3.6844 units**.
- Minimum clearance from a building pad: **0.17 units**.
- Minimum clearance from a separately shipped Town prop: **0.2532 units**.
- Minimum clearance from the open plaza stage: **6.7062 units**.
- Minimum clearance between decoration clusters: **3.2818 units**.

Full machine-readable evidence: `decoration-clearance.json`.

## Canon and flat-walk contract

- `src/town/townLayout.ts` is read at build time for the seven canonical building slots, approaches, footprints, and shipped-prop positions.
- The Stamp Mill footprint is read from `src/town/TownScene.ts`; the additional Dynamo Hall pilot pad is read from `assets/contracts/epoch-2-steamworks/manifest.json`.
- The ring road, eight radial paths, plaza center, and all eight rendered building pads are tested against the realized joined mesh with ray casts.
- Realized route maximum absolute height: **0.037101** across 4,122 samples, below the 0.05 limit.
- Realized plaza maximum absolute height: **0.034182** across 749 samples, below the 0.05 limit.
- Worst realized building-pad maximum absolute height: **0.000136** across 63 samples per pad.

Full evidence: `layout-contract.json`, `flat-walk-report.json`, and `flat-walk-realized.json`.

## Independent Pan Monument correction

The Pan Monument remains in the independently mounted plaza-prop GLB and is not duplicated inside the Town plate.

| Gate | Result |
| --- | --- |
| GLB SHA-256 | `fe5ab9f8eb5aa21799e81797adba583cd676c6de952aabd127aaaf2408f6d97d` |
| Geometry | 1 mesh, 1 primitive, 864 triangles |
| Material | 1 non-emissive material and 1 embedded 256 x 256 PNG |
| Scene payload | 0 cameras, 0 lights, 0 animations |
| Deterministic export | checked GLB and re-export are byte-identical |

## Visual evidence

- `assets/pilots/town-plate-3d/renders/town-plate-wave2-ab-ts04.png`: Wave 1 on the left versus decorated Wave 2 on the right at the locked TS-04 camera.
- `assets/pilots/town-plate-3d/renders/town-plate-wave2-clearance-overlay-ts04.png`: canonical routes, open stage, building pads, and decoration footprints.
- `assets/pilots/town-plate-3d/renders/town-plate-wave2-tavern-workyard-detail-ts04.png`: kegs, feed sack, bucket, rope, and hitch rail at the owner's flagged parcel.
- `assets/pilots/town-plate-3d/renders/town-plate-wave2-pan-detail-ts04.png`: corrected independent Pan Monument.

Fresh unprimed visual QA returned **SHIP** for the exact final renders. The fixed-pair visual telemetry shows localized detail without a global scene shift: edge energy rose 4.75%, average luminance moved -0.8585, and only 0.633% of pixels differ by more than 32 grayscale levels. The remaining large dark Tavern side planes belong to the separate Tavern building model and are recorded as adjacent work in `reviews/sol-3d-c-findings.md`.

## Runtime and source state

- `npm run build`: pass on the exact exported bytes.
- This wave replaces the already mounted Town plate GLB at its stable path; no runtime source was changed.
- Branch base is `294a915a`; main was observed at `0cec4a83`. None of the plate's canonical source inputs or the Wave 2 queue/recipe changed between those commits.
