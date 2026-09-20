# RUN-3D 12 — Boiler House evidence

- Model: 508 triangles, one mesh, one primitive, one material, one embedded 384x384 PNG.
- Bounds: 1.72w x 1.43d x 2.26h; base-centered and grounded inside the existing 2x2 footprint. Height is 7.8% below the established 2.45m steam-plume silhouette.
- Re-export: byte-identical SHA-256 `b253cf0e0c2432032fab9909cc74159a7dca36e7368d40c6e78f2c86915413a2`.
- Lifecycle: three live Boiler Houses produce three pilot meshes from one `boiler-house.glb` request; demolishing one leaves two.
- p95: desktop ratio 0.9109; mobile ratio 0.9100.
- Gates: `npm run build` green; run3d-boiler-house 8/8, run3d-sluice 8/8, and m1-01 8/8 desktop/mobile; zero console/page errors.

The requested 12-instance sample cannot be represented by the read-only seam: `Balance.boilerHouse.maxCount` is 3. The gate uses the maximum legal three simultaneous Boiler Houses; changing the cap or adding a synthetic write path would violate this slice's firewall.
