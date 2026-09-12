# Epoch 1 Baron — prop fidelity and presentation

Branch: `sol/boss-art-fidelity-review`, base `d41ab98ce`. Reviewed 2026-09-08. No commit or deployment.

**Verdict: READY-FOR-GATES for the E1 pass.** The approved illustrated Baron body remains the reference itself. His existing 3D props now fit its worked timber/brass/iron palette more closely, the launcher clears his face and points forward, and the warning/rocket release follows the visible rack. This is an improvement of the approved prop direction, not a claim that the raw character plate depicts these later-added objects.

[Comparison gallery](../artifacts/boss-fidelity/e1-baron/index.html) · [original illustration](../assets/raw/codex-baron-e1.png) · [approved prop brief](../tasks/lane-baron-props-detail.md)

## What changed and why

The old shared atlas painted coarse stripes across every surface. A native-generated replacement supplies material-specific wood grain, engraved brass and worn iron. Separate roughness/metalness data gives these surfaces different responses. Functional teal regions carry the warning glow; a restrained 12% illustrated fill prevents deep scene shadows from erasing the props beside the unlit body sprite. The three front rocket bands now use teal so the cue remains visible after the launcher faces correctly. The body, banner and prop geometry are preserved.

The runtime previously applied the warning pulse to removed placeholder material and started flight visuals near ground level. It now pulses only the loaded launcher's material, uses the visible center rocket nose for the render-only rocket/muzzle-flash origin, and shares the sprite's existing bob. The launcher was also reversed relative to travel; its local yaw and shoulder position now keep the nose forward and the face clear. Combat continues to receive the same boss origin, target, damage and timing.

## Evidence

| Check | Result | Evidence |
|---|---|---|
| Named meshes and triangles | `launcher` 2,020; `rocket` 876; `powder_keg` 704. Positions, normals and indices unchanged. | [asset contract](../assets/pilots/baron-props-3d/baron-props-asset-contract.json), [independent asset review](../artifacts/boss-fidelity/e1-baron/asset-code-review-followup.txt) |
| Material/export contract | One GLB material, three embedded 512px maps; no cameras or animation clips. Saved blend re-exports byte-identically. | [builder log](../artifacts/boss-fidelity/e1-baron/build.log) |
| UV data-map sampling | All 20 region corners and 4,430 exported UV vertices pass linear-filter sampling. | [independent follow-up](../artifacts/boss-fidelity/e1-baron/asset-code-review-followup.txt) |
| Runtime presentation | Desktop 1280×800 and mobile 390×844: authored emission retained, separate launcher pulse, forward muzzle, unchanged combat origin, nonzero shared bob, bounded projectile pool. | [runnable check](../scripts/check-baron-presentation.mjs), [results](../artifacts/boss-fidelity/e1-baron/focused-check.jsonl) |
| Existing prop checks | 2/2 passed, unchanged specs. | [log](../artifacts/boss-fidelity/e1-baron/props-tests-final.log) |
| Existing rocket/kill-stop checks | 19 passed; one intentional mobile duplicate of a desktop deterministic proof skipped. An initial mobile fixture was interrupted by asset hot reload; the stable retry passed. | [initial suite](../artifacts/boss-fidelity/e1-baron/combat-regression.log), [stable retry](../artifacts/boss-fidelity/e1-baron/combat-retry-stable.log) |
| Independent runtime review | No actionable regression; additionally checked missing-asset fallback. | [review](../artifacts/boss-fidelity/e1-baron/runtime-review.log) |
| Production build | `npm run build` passed on final source/assets. | [build log](../artifacts/boss-fidelity/e1-baron/build-game-final.log) |
| Actual game rendering | Carried, warning and flight states on both viewports; zero captured console/page errors. | [desktop telemetry](../artifacts/boss-fidelity/e1-baron/after/desktop.json), [mobile telemetry](../artifacts/boss-fidelity/e1-baron/after/mobile.json) |

The GLB grows from 498,316 to 1,123,180 bytes. Two additional 512px RGBA maps add approximately 2.67 MiB including mipmaps. No geometry or draw call is added by the material pass; matched desktop captures retain 97 warning / 102 flight draw calls. Different mobile flight visibility can change scene counts because rockets now begin above the shoulder. These are diagnostic counts, not a hardware frame-time benchmark.

## Review findings and disposition

- **F-E1-01 — UV-edge material bleeding, fixed.** Independent review found exclusive texture fill bounds caused brass UV-edge samples to become almost nonmetallic. Four-pixel gutters and edge-clamped emission fix the actual exported samples. The builder retains corner assertions; independent follow-up found no new issue.
- **F-E1-02 — face obstruction and reversed rack, fixed.** Fresh visual review independently identified the rack crowding the lower face. Correct yaw plus an outboard/lower mount clears the mustache and chin in the final views. It is intentionally shoulder-mounted; idle illustrated hands are not a grip failure.
- **F-E1-03 — warning cue lost after turning the rack, fixed.** Rear fuses are hidden when the rack points forward. Retagging existing front bands exposes the functional teal cue without adding geometry.
- **F-E1-04 — independently timed screenshot crops, fixed in evidence packaging.** Final close-ups are extracted from their saved full screenshots. Intermediate screenshots are retained in labeled folders and do not establish the final pose.
- **F-E1-05 — remaining limits, non-blocking.** Small dark keg/stock details remain less legible than the outlined illustrated body in deep shadow. Native grain is coarser than the reference's fine ink hatching. The mobile HUD can cover the upper banner/hat edge when the boss is near the top of the screen; the warning pose keeps his face and launcher visible. These observations are not a basis for expanding this pass into body replacement or unrelated HUD work.

## Reproduce

Use a scratch Vite server on an available non-gate port, here 5246. `node scripts/check-baron-presentation.mjs http://127.0.0.1:5246` checks the final runtime. Existing tests use `GR_CAPTURE_BASE_URL=http://127.0.0.1:5246 GR_CAPTURE_EXTERNAL_SERVER=1` with `npx playwright test e2e/lane-baron-props-detail.spec.ts e2e/057-baron-rocket-cart.spec.ts e2e/055-baron-kill-stop.spec.ts --workers=1`. They write tracked historical screenshot locations; bank those outputs separately and restore only files clean before the run.

`/Applications/Blender.app/Contents/MacOS/Blender -b --python assets/pilots/baron-props-3d/build_baron_props.py` rebuilds and verifies the asset. `artifacts/boss-fidelity/e1-baron/render-props.py` creates matched neutral renders; `capture-runtime.mjs after` records diagnostic spawns rather than natural campaign progression. Native provenance and asset hashes are registered in the [layer contract](../assets/layer-contracts/baron-props.v1.json) and `assets/LEDGER.md`.

Integration scope: Baron builder/GLB/blend/maps, one native raw atlas, asset metadata, the Baron-only runtime material/mount/VFX path and one sprite-bob accessor, plus a new standalone check and review evidence. Existing e2e specs, simulation systems, STATUS, backlog, ratified specs and history are untouched. No merge or conflict resolution was performed.
