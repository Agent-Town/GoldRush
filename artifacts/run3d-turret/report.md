---
slice: run3d-09-turret
date: 2026-07-13
---

# RUN-3D Turret evidence

- Asset: one mesh, one primitive, one material, one embedded 512x512 image; 1,152 triangles.
- Bounds: 1.35w x 1.35d x 1.99h, root origin `(0, 0, 0)`, footprint inside the turret's 1.2 overlap radius.
- Re-export: checked GLB and clean Blender re-export share SHA-256 `2973dcbf4bf51d4c153398c847e6ed1a3d03d0116e901cd5a04091dd7202aab7`.
- Shape: timber tripod, concentric induction coils, signal lens, and crossed steam arcs; no barrel or firearm silhouette.
- Runtime: four live instances (the existing hard sim capacity) share one GLB fetch; demolition reduced the mounted count from four to three.
- Performance: desktop p95 ratio 1.042; mobile p95 ratio 0.995, both below 1.15. The requested 12-instance sample is impossible without changing the out-of-scope `Balance.turret.maxCount = 4`; the gate therefore exercises maximum legal capacity.
- Boot bytes: unchanged because `Game.ts` and its existing lazy import were untouched.
- Gates: `npm run build` green; turret plus sluice 16/16 desktop/mobile green; adjacent m1-01 6/8 in a concurrent run, with the two failures (Vite websocket and death timeout) isolated-rerun green 2/2.
- Contact sheet: `turret-sprite-vs-3d-contact-sheet.png` uses the desktop run camera for both halves.
