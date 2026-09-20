# RUN-3D 07 — Sluice evidence

- Model: 764 triangles, one mesh, one primitive, one material, one embedded 512×512 PNG.
- Bounds: 1.980w × 0.840d × 1.040h; base-centered and grounded inside the 2×1 footprint.
- Re-export: byte-identical SHA-256 `6194e91019f061b27ee01dc326260ff1a157c64e2aa81d48f5b1e1745758939e`.
- Lifecycle: three live sluices produce three pilot meshes from one `sluice.glb` request; demolishing one leaves two.
- p95: desktop ratio 1.0171; mobile ratio 0.9888.
- Gates: `npm run build` green; run3d-sluice + unchanged m1-01 = 16/16 desktop/mobile; zero console/page errors.

The requested 12-instance sluice sample cannot be represented by the read-only debug seam: `Balance.sluice.maxCount` is 3. The gate uses the maximum legal three simultaneous sluices; changing the cap or adding a synthetic write path would violate this slice's firewall.
