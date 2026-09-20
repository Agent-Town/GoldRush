# RUN-3D rail elements gate

- Model: 132 triangles; one mesh, primitive, material, draw call, and embedded 256×256 image baked from `assets/processed/ter-rail-elements-r0c0.png`.
- Bounds: 1.32w × 0.22d × 0.16h, base-center origin; no cameras, lights, or animations.
- Re-export: byte-identical and semantic-identical (`model-contract.json`).
- Runtime: 221 `e2-hill-mine` tie transforms equal 221 `THREE.InstancedMesh` instances on desktop and mobile; one GLB fetch.
- Fallbacks: flag-off, LITE, and invalid bytes retain the procedural rail layer; `rail_element` and `gold_seam` are excluded from `run3dPilot=all`.
- Performance: desktop p95 ratio 0.7484; mobile-390 ratio 0.7529 (both ≤1.15).
- Browser gates: rail elements 10/10, gold-seam + sluice 16/16, six sibling riders 48/48; zero captured console/page errors.
- Plain-boot oracle: `m2-05` 14/14 and `night3d-perf:98` 2/2 green; declared pre-existing `night3d-perf:67` red at 1.5800 desktop and 1.6224 mobile.
- Static gates: `npx tsc --noEmit` and `npm run build` rc 0; node guards 226/226.
