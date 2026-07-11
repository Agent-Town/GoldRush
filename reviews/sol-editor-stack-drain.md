# Drain — THE EDITOR STACK: B5 authored grid + B6 brush + ED-03 validator → main (2026-07-11) — VERDICT: MERGED, 24/24
Branches: sol/terrain-authored-grid@a0e49a96 · sol/ed-02-brush-v2@e5eed887 (stacked on B5) · sol/ed-03-placement-validator@9f357937. Implementer: Sol Session B. ZERO merge conflicts across the stack — the territory grants held perfectly.
## What the owner gets (T1 complete but gizmos)
The bounded, versioned AUTHORED TERRAIN LAYER with its strict decoder (069-boundary pattern, unknown-field byte-stability) · the session-staged editor document with reload-safe undo/redo · the bilinear VISUAL sampler (render-only; sim untouched, hash asserted) · THE BRUSH: raise/lower/smooth + zone/water/lane paint compiling to existing descriptor shapes, byte-identical export round-trips · THE VALIDATOR: placement controls committing valid descriptors atomically, with structured Assayer-style in-world rejection reasons through the ONE canonical boundary (the ED-03 seam grant).
## Evidence
Combined battery 24/24 (4.1m): ed-01 inspector · ed-02-authored-grid-substrate · ed-02-terrain-brush (paint→reload→snapshot-restore→reimport byte-identical) · ed-03-placement-validator (valid commits + atomic in-world rejections) · 044 · m1-01 · sim-fixed-step 6/6. tsc+build green. Two prior honest refusals (B1, ED-03 seam) became the architecture.
## Consequences
The editor ladder proceeds to THE TWO PILLARS (ED-04 gizmos → ED-05 palette → ED-06 start-fresh → ED-07 chat). B7 + PG-02 reading = next in the conveyor. DEPLOYED with this drain.
