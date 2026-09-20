---
slice: run3d-08-palisade
date: 2026-07-13
---

# Palisade 3D verification

- Asset: 396 triangles; one mesh, primitive, material, and embedded 512×512 image; bounds `0.46 × 3.00 × 1.04`; base-center origin.
- Re-export: checked GLB and clean Blender re-export share SHA-256 `a9841ee934fcc0035571caa4b73fc9bd9fc4827697ade631b43fe3f9c8928878`.
- Lifecycle: 12 palisades mounted from one `palisade.glb` request; demolishing one reduced the published instance count from 12 to 11.
- Fallback: flag-off and LITE made zero palisade GLB requests; invalid bytes published `failed` while the sprite pool stayed active.
- Performance: desktop p95 ratio `1.0988`; mobile-390 p95 ratio `1.1183`; both below `1.15` with 12 instances.
- Gates: `npm run build`; palisade 8/8; run3d-sluice + m1-01 adjacent 16/16, desktop and mobile-390; zero captured console/page errors.
- Boot: `Run3dPilot` remains a lazy chunk; flag-off boot requests no palisade GLB and the main `Game`/`index` bundle sizes remained `524425`/`1171319` bytes.
