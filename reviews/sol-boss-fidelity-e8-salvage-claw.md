# E8 Salvage King's Claw — adopted fidelity pass

The adopted V10 model restores wider suspended claws, visible winch drums, a rounded lower gondola and a taller crown hierarchy. A dedicated native atlas makes steel, brass and teal surfaces readable without projecting whole-boss art across the geometry. The landed state closes all twenty windows and deploys ladders through open rail exits; broken winch pieces now settle at ground level.

## Scope and identity

Only the Claw builder, its Blend/GLB, triangle guard and asset metadata changed for E8. Gameplay anchors, damage resolution, transitions, crew descent and persisted yard behavior are unchanged. Three named meshes retain the original three landing morphs. No people or destruction state were added to the asset.

The adopted raw GLB SHA-256 is `3ae8420b44b79d4aa41d4c2305cc32da17e94cae397990671220d32f3a6b4826`: 30,844 triangles (+744), one embedded 1024-square atlas (previously 2048). Crown width stays 11.4; the intact Blender envelope is 14.493212 × 14.493212 × 12.042174 before unchanged runtime scale .78. Landed ladders extend beyond the intact envelope; targeting bounds do not expand.

The builder now imports the shared geometry kit directly. Importing E5's changing atlas builder would silently give E8 another boss's texture. The original embedded Claw atlas is preserved separately. Native generation provenance and exact source hashes are in `assets/layer-contracts/salvage-claw.v1.json` and `artifacts/boss-fidelity/e8-salvage-claw/atlas-provenance.md`.

## Verification

All evidence below is under `artifacts/boss-fidelity/e8-salvage-claw/`.

- Production rebuild and saved-Blend re-export passed; the re-export is byte-identical to the adopted GLB (`build-adopted.log`, `reexport.log`). `npm run build` exited 0 (`verification/build.log`), including the asset guard. Normal bundle-size/quantization warnings are retained.
- All four unchanged desktop/mobile E8 encounter tests passed. Generated tracked test outputs were restored with unchanged frozen hashes (`verification/adopted-encounter/`).
- Actual optimized production rendering passed ten desktop/mobile states: airborne, descending, landed, yard and persisted yard after reload. Four downloaded GLBs matched the built bytes: 894,952 bytes, SHA-256 `dd68947fcf2dfbd7d82f7b5db072d13313e65194500ee09ebe644d6037e20798`. No collected console/page errors (`production/report.json`). These use public debug hooks to accelerate the encounter, with no asset/module overrides.
- A second settled production capture also passed all ten states and four exact optimized-byte checks with no collected errors (`production-settled/report.json`); desktop and mobile persisted-yard images were inspected. Waiting for terrain/run pilot loading to settle does not fix the surrounding HUD/tile defects noted below.
- Full, lite and cancelled-load lifecycle checks passed. Reset removes the model, geometries/materials dispose once, the group empties, and a later load succeeds. The existing utility emits three disposal events for the shared texture; this pass does not claim one texture-disposal event (`lifecycle/report.json`).
- Morph-aware actual world vertices in a forced act-3 presentation were compared with `Terrain.visualY` at the sampled encounter anchor. Feet gap is 0; winch debris .078; ladder ends .0936 world units. This is sampled placement evidence, not an all-terrain proof (`grounding/report.json`).
- Blender geometry checks verified deployed ladder/winch clearance and local foot grounding (`candidate-v10/access-check.json`). V9's 92 intersections were rejected and resolved with greater outward ladder lean.
- Independent visual review found substantially better recognition and identified rail blockage/floating debris, corrected in the final iterations. Independent Codex source review found no actionable regressions (`source-review/triage.md`).

## Retained limits

This is a closer representation, not a 1:1 reconstruction. The thick articulated arms still partly read as spider legs; broad crescent blades, Gothic roof architecture, detailed galleries and the gondola remain simplified. The kept state reads as a powered-down service yard more strongly than a warm public place. People remain separate runtime actors.

Desktop/mobile framing uses the existing maximum zoom-out. HUD overlays still obscure some views; the settled desktop reload shows a missing Prospector portrait and a black-edged adjacent building tile. Those surrounding presentation defects are recorded, not silently included in this boss asset pass. Initial screenshots prove boss readiness, not universal scene readiness.

The broader game regression suite remains non-green from preceding epoch work (latest reconciliation: 2,839 expected, 311 unexpected, 198 skipped). No new full-estate run was performed for this asset-only E8 change. Existing failures are not relabeled as baseline defects. No commits, deployment, STATUS edits or existing e2e source edits.
