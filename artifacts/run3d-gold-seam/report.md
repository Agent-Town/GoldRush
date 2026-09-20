# Gold Seam RUN-3D gate

- Model: 720 triangles; one mesh, primitive, material, and embedded 512×512 image baked from `assets/processed/node-gold-seam.png`.
- Bounds: 1.6260w × 1.0578d × 1.0940h, base-center origin; no cameras, lights, or animations.
- Re-export: byte-identical and semantic-identical (`model-contract.json`).
- Runtime: live `HarvestSystem` snapshots mount active nodes and unmount depleted/respawn-scheduled nodes; 12 Dust Flats instances share one GLB fetch.
- Fallbacks: flag-off, LITE, and invalid bytes retain `GoldSeamVisualBatch`; no HarvestSystem, entity, Game, or sim writes were added.
- Compatibility: `run3dPilot=all` retains its landed buildable-only aggregate contract; the rider is selected with `run3dPilot=gold_seam` so the unmodified sluice gate remains green.
- Performance: desktop p95 ratio 0.8897; mobile-390 ratio 0.8776 with 12 instances (both ≤1.15).
- Browser gates: gold seam 8/8 and unmodified sluice 8/8, desktop + mobile-390, `--workers=1`, zero captured console/page errors.
- Static gates: `npx tsc --noEmit` clean; `npm run build` green.
- Contact sheets: `gold-seam-sprite-vs-3d-contact-sheet.png` and `gold-seam-sprite-vs-3d-contact-sheet-mobile.png`.
