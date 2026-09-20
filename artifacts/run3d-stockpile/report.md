# RUN-3D 10 — Stockpile evidence

- Model: 780 triangles, 432 vertices, one mesh, one primitive, one material, one embedded 512×512 PNG.
- Bounds: 1.380w × 1.380d × 0.780h; base-centered and grounded inside the authored 1.5×1.5 footprint.
- Re-export: byte-identical SHA-256 `c9a8bb0f9e9f24bc39b23293c46f725c8b8f042b2c592c4aa33387bfb3beda8f`.
- Lifecycle: two live stockpiles produce two pilot meshes from one `stockpile.glb` request; demolishing one leaves one.
- p95: desktop ratio 0.9952; mobile ratio 0.9538.
- Gates: `npm run build` green; run3d-stockpile 8/8 desktop/mobile; run3d-sluice + m1-01 passed through the first 13 combined checks before the fresh-profile overlay stalled the mobile stockpile case; the corrected stockpile suite reran 8/8 with zero console/page errors.

The requested 12-instance sample cannot be represented by the read-only seam: `Balance.stockpile.maxCount` is 2. The gate uses the maximum legal two simultaneous stockpiles; changing the cap or adding a synthetic write path would violate this slice's firewall.
