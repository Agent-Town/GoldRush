# RUN-3D 13 — Assay Bench

- Runtime id: `assay_office`; model asset: `assay-bench.glb`.
- Source painting: `assets/processed/bld-claim-office.png`, matching the existing Assay Office fallback.
- Asset contract: 292 triangles, one mesh/primitive/material, one embedded 512×512 image, 1.84×1.2436 footprint inside the 2×1.5 placement footprint, 1.2289 height, base-center origin.
- Re-export: checked and headless re-export SHA-256 both `08ff6640a27c223b8fbc54fdbe74c34ecbdc3b4a2446d8e37036438782d29647`.
- Lifecycle: one GLB request; one mounted mesh; demolish reduces the marker to zero; invalid bytes and LITE retain the fallback; the existing Enter interaction opens the Assay Bench.
- Frame p95: desktop 16.8→17.0 ms (1.0119×); mobile 16.9→17.3 ms (1.0237×). The sim permits one Assay Office (`maxCount: 1`), so a 12-instance run would require an out-of-scope sim change and was not fabricated.
- Evidence: `asset-contract.json`, `p95-*.json`, same-camera `assay-bench-sprite-vs-3d-contact-sheet.png`, and desktop/mobile sprite/3D captures.
