---
source: codex
project: Gold Rush
date: 2026-07-13
type: digest
---

# Lantern Post 3D gate

- Model: 284 triangles, one primitive/material, one embedded 512×512 image, 158,300-byte GLB.
- Bounds: 0.8212w × 0.36d × 1.38h; base-center origin; no cameras, lights, animations, or emissive channel.
- Re-export: byte-identical and semantic-identical (`model-contract.json`).
- Runtime: 15 live instances from one lantern GLB request; demolished instance unmounted; authored quarter-turn rotations mirrored.
- Fallbacks: flag-off, LITE, and invalid bytes retain the existing lantern renderer.
- Performance: desktop p95 ratio 1.1469; mobile-390 p95 ratio 1.1256 (both ≤1.15).
- Browser gate: `e2e/run3d-lantern-post.spec.ts` 8/8, desktop + mobile-390, zero captured console/page errors.
- Regression: unmodified `run3d-sluice` 8/8 and `m1-01-claim-jumpers-death` 8/8 across desktop + mobile-390.
- Art source note: `assets/processed/` had no lantern post and `assets/LEDGER.md` marks processing pending, so the approved raw painting was resized in-memory to 512px and packed directly into the model without adding an out-of-firewall processed asset.
