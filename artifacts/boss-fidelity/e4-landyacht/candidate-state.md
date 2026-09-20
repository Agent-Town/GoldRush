# Land Yacht — focused verification complete; broad regression pending

Updated 2026-09-08 after the E3 regression runner released its source freeze. E3's handoff retains explicit regression exceptions; it does not claim a green full suite. E4's candidate is now integrated into production source and asset paths for verification. E5–E10 remain pending.

## Current asset and runtime

The GLB is **9,613 triangles**, **2,803,828 bytes**, SHA-256 **1a7c743b7df30d18d5d8709fa2e9919cc681fec30dcc6a83630e03722fd7592f**. It retains three original component meshes/morphs and one embedded 1024-square atlas/material, with a 9.4-unit length and grounded identity transforms. The native source atlas is now at `assets/raw/land-yacht-atlas-fidelity-e4.png`; the layer contract is `assets/layer-contracts/land-yacht.v1.json`.

Geometry restores the flared hull and raised deck, armored wheel faces, framed observation glazing, seated crane with suspended open grab, and attached lamps/rivets. Damage includes splayed/flattened wheels, recessed bow armor, broken/slack cables, lowered grab and a missing glass pane. Native image generation supplied the atlas; geometry uses the existing shared kit, which remains unchanged.

The runtime loads the GLB lazily and establishes a coherent rotating formation for new encounters. It preserves saved legacy routes, falls back when formation cannot safely align, derives pose from surviving targets, grounds the rigid mesh from its wheels, and keeps damaged assemblies through salvage. Game render interpolation and health-bar bounds use the same pose. Full save envelopes now include the encounter's counters, deadlines, destruction positions and formation state; their future-state projection includes the new payload.

## Verified so far

- The production-path builder reproduces the inspected candidate GLB byte-for-byte. Production verifier and saved-Blend re-export pass. TypeScript passes with the actual three source files installed. Receipts/logs: `production-handoff/`.
- Seven neutral renders and six exact crops match the candidate bytes. Independent visual reviews found no established floating parts, z-fighting or broken shading, while recording remaining fidelity/readability gaps.
- Three fresh candidate source builds are identical. Candidate contract checks retain original bindings, grounded damaged wheels and at least 0.13335 asset units between the damaged grab and highest deck/rail vertex.
- Isolated source checks cover 80,000-step rotating routes at four headings and JSON resume, state/deadline validation, future-state hash inclusion, loader cancellation/failure, actual GLB admission and 120 synthetic pose cases. Indexed geometry coverage minima are wheels 99.05%, crane 97.48%, wheelhouse 100%. These are not browser/camera acceptance claims.
- Independent static reviews found and resolved buried hull rivets and the omitted future-state hash payload. Review snapshots remain immutable under their respective review directories.

Original files and hashes are preserved in `production-handoff/before/`. The production builder changes only the inspected candidate's root/atlas paths; its output identity is verified. The candidate verifier now uses the immutable original GLB as its baseline. Native source and embedded map hashes are recorded in the layer contract.

## Actual runtime results

Production build, optimized GLB admission and 18 captures pass (`runtime-optimized`, 461,844-byte model). Final raw evidence is `runtime-final-2`; UV-only proof and source/re-export checks are in `roof-seam-fix`. All 22 unchanged E4 boss/census/story tests pass, historical outputs restored. All six desktop death orders, two mobile orders and fresh-page full-envelope resume pass (`runtime-resume-1`). Real loader, lite/invalid fallback, delayed admission with each survivor, in-flight restart and loaded resource disposal pass (`runtime-lifecycle-3`). Those mechanics checks used the prior UV rectangle; final geometry/morph/atlas identity is explicitly proved.

Fresh visual review caught roof texture slashes, now fixed by excluding a painted atlas border. Side-angle damage views reveal the missing pane and broken hoist, though damage remains subtle. Desktop default zoom fits; mobile whole-ship views require the existing 1.6 zoom-out and retain some HUD overlap. Final receipts separate browser errors from response-body capture failures; successful final raw/optimized runs have neither.

Broad regression for the movement/save change is next, with E3's existing exceptions retained. See `reviews/sol-boss-fidelity-e4-landyacht.md` and `index.html`. E5–E10 remain pending.

Neutral review still notes compact hull/superstructure, simplified crane mechanics, obscured wheel mounts, dark/mottled material separation and subtle damage at full-view scale. The rejected lower-profile experiment hid portholes and weakened the crane. Production-camera evidence must guide further changes; neutral renders alone are insufficient.

Detailed implementation/check scopes are in `candidate-runtime/README.md`, visual critiques in `candidate-critique-current.md`, fit measurements in `candidate-fit-conclusion.md`, and the original before-state in `preflight.md`. Earlier iteration directories are historical evidence, not the current production asset.
