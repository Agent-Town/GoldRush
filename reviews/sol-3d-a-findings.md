# Session 3D-A — full-wrap Tavern findings

Branch: `sol/town-blender-v3`

Wave-1 tip: `416bffaa6e34063c7603a887b5a69be347e72195`

Iteration-2 tip: `HEAD` (the single variant-B commit)

Decision state: full-wrap architecture selected; facade fallback and visual-only seam remain decided.

## Findings

### F-3DA-01 — Variant A's paper-theater limit is confirmed

The owner selected B's complete building volume over A's facade-front stand. Four-angle renders show B has authored side/back walls, roof, eaves, chimney, rear door, windows, and service details instead of a decorated front plane. Variant A is retained only as the existing fallback.

Evidence: `assets/pilots/tavern-3d/tavern-2-fullwrap.blend`, `assets/pilots/tavern-3d/tavern-2-fullwrap.glb`, `artifacts/town-blender-v3/tavern-2-fullwrap-turntable.png`.

### F-3DA-02 — Initial B architecture was sound, but its dress drifted European

Old B's black grid, arched framing, and shallow frontage read as half-timbered/Tudor. Iteration 2 keeps the accepted roof mass, corners, and chimney while replacing that dress with horizontal plank relief, a deeper covered porch with posts, split swing doors, and a no-text pan medallion. A fresh neutral review judged final NEW B a passing frontier saloon at gameplay zoom.

Evidence: `artifacts/town-blender-v3/locked-camera-old-b-vs-new-b-contact-sheet.png`, `artifacts/town-blender-v3/locked-camera-new-b-townsfolk-crop.png`.

### F-3DA-03 — Albedo, not emission, fixes the Town-light mismatch

Old B's dark framing made it silhouette beside the painted shells. The final atlas lifts ochre/sepia albedo while keeping metallic `0`, roughness `0.9`, and no emissive channel. Fixed-region luminance moves from `54.31` to `61.27`; the adjacent painted facade is `58.34`, placing final B within `+5.0%` of its neighbor.

Evidence: `artifacts/town-blender-v3/materials-note.md`, `artifacts/town-blender-v3/locked-camera-old-b-vs-new-b-visual-metrics.json`.

### F-3DA-04 — The 2D-character-over-3D mix is plausible, with one visible weakness

The townsfolk and new Tavern share warm painted color and outlined silhouettes. At the locked crop, however, the large bartender is slightly oversized and weakly grounded; his vertical billboard stalk is conspicuous over the porch/doorway. This is useful owner evidence for the candidate mixed direction, not an asset defect to repair inside Tavern-only territory.

Evidence: `artifacts/town-blender-v3/locked-camera-new-b-townsfolk-crop.png`.

### F-3DA-05 — Debug-viewer swaps retain one geometry and texture

Sequentially replacing old B with new B in the existing drag/drop viewer moves renderer memory from 59 to 60 geometries and 21 to 22 textures. Frame calls remain identical and p95 improves by `1.02%`, so this is not a gate failure, but it indicates the debug viewer removes the prior model without disposing its resources. Per standing order, the viewer was not reimplemented or modified.

Evidence: `artifacts/town-blender-v3/locked-camera-old-b-vs-new-b.json`.

The exact old-B binary used by the comparison is preserved at `artifacts/town-blender-v3/old-b-half-timber-comparison.glb`; the final evidence does not depend on session-local temporary files.

### F-3DA-06 — Four requested Town regressions pre-date this asset

The full desktop/mobile battery is 58/62. The four failures are `town-t4-growth` expecting `town-growth-general-store` before the current Claim Ledger queue and `town-t6-surfaces` expecting three actions while Claim Ledger adds a fourth, each repeated in both projects. The exact fingerprints reproduce at the detached `22824e0d` parent baseline; all `ts-01` through `ts-04` cases are green.

Evidence: `artifacts/town-blender-v3/gate-summary-variant-b.md`, `artifacts/town-blender-v3/gate-summary.md`.

## Handoff

- Final asset: 10,864 tris, one embedded 1024² material, `5.128w × 3.393d`, base-center origin, no exported cameras/lights.
- Viewer interaction: Tavern approach prompt + Board pass; zero console/page errors.
- Renderer: new B has `-120` tris/frame and `-1.02%` p95 versus old B; p95 is `-2.02%` versus the facade baseline.
- No runtime/gameplay or 3D-B territory file changed in this iteration.
- The locked A/B is deliberately the owner's ordered `?debug&town3d` drag/drop verdict path. It does not claim that final B has replaced wave 1's separate production-pilot asset.
- Plaza/horizon work has not started. The attended owner session owns the next verdict, gate, and merge.
