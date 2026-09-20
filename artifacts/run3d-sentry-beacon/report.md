---
slice: run3d-11-sentry-beacon
date: 2026-07-13
---

# Sentry Beacon 3D verification

- Asset: 444 triangles; one mesh, primitive, material, and embedded 512×512 image; bounds `0.5783 × 0.6310 × 0.9591`; base-center origin; painted teal core with no emissive texture.
- Re-export: checked GLB and headless Blender re-export share SHA-256 `8378611a2badecca12222a85e902820300985f892dc30d42ab81a5232cf4f1b3`.
- Lifecycle: four beacons (the sim's `Balance.beacon.maxCount`) mounted from one `sentry-beacon.glb` request; demolishing one reduced the published instance count from four to three.
- Fallback: flag-off and LITE made zero beacon GLB requests; invalid bytes published `failed` while the beacon build state stayed active.
- Performance: desktop p95 ratio `1.0169`; mobile-390 p95 ratio `0.9887`; both below `1.15` at the sim's legal maximum of four instances. The recipe's 12-instance probe is not reachable without changing the sim-owned capacity, which this slice's firewall forbids.
- Gates: `npm run build`; beacon 8/8; run3d-sluice 8/8; m1-01 8/8, all desktop and mobile-390; zero captured console/page errors.
- Boot: `Run3dPilot` remains a lazy chunk; flag-off boot requests no beacon GLB and the main `Game`/`index` bundle sizes remain `524.42`/`1171.31` kB.
