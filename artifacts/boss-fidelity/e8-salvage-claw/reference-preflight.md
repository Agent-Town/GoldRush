# E8 reference preflight

Inspected plate-e8-boss-salvage-kings-claw.png and the existing detail-opus5 reference comparison. The production source is detail-opus5, 30,100 triangles; the older README describes the original 10,164-triangle asset and is stale for current runtime selection.

Confirmed visual target: large suspended crescent grapples, visible hanging machinery, a stronger central crown silhouette. Current comparison instead has small three-toed feet, a dark drum underside and a broad pavilion. Preserve four anchor positions and three named production meshes/morphs; reference perspective alone does not authorize gameplay changes. Enlarging feet must not accidentally shrink the crown through export normalization.

Runtime loader uses a fixed 0.78 scale. Inspect the builder normalization separately before edits. Existing E8 tests exercise grapple removal, winch destruction, savable building drops, crew departure and persistent civic yard. Fresh runtime captures are still required. No E8 production changes made at this checkpoint.


## Current runtime and rebuild findings

The public-hook baseline completed 12 full/lite desktop/mobile state captures with zero collected errors (`baseline-position-fix/report.json`). Default airborne framing crops almost the whole GLB; these are encounter evidence, not sufficient silhouette evidence. A separate framed full-tier pass is being captured. The first failed capture expected a nonexistent diagnostics.anchor field; the harness now centers on actual component positions, preserving that failed attempt separately.

The E8 builder imports the E5 detail builder for both kit and atlas. E5 now loads its own new fidelity PNG and has changed atlas regions, so the current E8 rebuild would not reproduce the shipped E8 texture. Fix E8 to use the shared geometry kit directly and preserve its actual embedded E8 atlas with matching UV regions. This is a build dependency issue; the currently served GLB is unchanged.

Claw geometry uses six stations falling monotonically outward/down, giving a toe shape rather than a crescent. The next candidate should have a broad high shoulder, an inward-curving tip and taller open negative space under each hub, within the existing crown-driven horizontal envelope. This avoids shrinking the crown through whole-model normalization. Keep the three mesh/morph contracts and four anchors.
