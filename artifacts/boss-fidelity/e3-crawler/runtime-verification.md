# E3 Crawler runtime verification

Status: final joint-source targeted checks pass. Root reports the final build and independent source review green; the full regression is owned by root and may now run. The isolated timing sample passed and all owned browsers are closed. Earlier failures remain banked and labeled.

## Production presentation

`src/systems/CrawlerBossSystem.ts`: 11,760-triangle admission; exactly three component meshes/morphs and one source atlas. Materials are cloned per component; white mapped fill 2.0, damaged fill 2.2 with the existing component tint. Asset SHA256 `26112eaa095aa891d57c209e224e81a3a9fc89bc6f56614eb98ee6d5d5016eb6`.

Uniform scale 3.1; declared formation from the authored contract; base longitudinal shift −0.45. Ground tilt pivots at local Y 1.1 near the lower boiler so a steep slope does not displace the tall mast away from its fixed target. Four footprint samples fit pitch/roll, then 146 cached intact tread positions determine exact vertical support, for 150 bounded terrain reads. No suspension, geometry deformation or target movement. Numeric same-pose re-grounding at declared 8 wu spacing yields own-component disk coverage 73/100/77%,85/100/72%,71/100/78%; see `runtime-fit/tilt-pivot-regrounded.json`. Final live-route validation after the coherent body-clock correction is summarized below.

Collector extras, support points, two-state bounds and convex-hull vertices use asset-root coordinates. Admission transforms loaded mesh points into that space, so production quantization can rebase mesh nodes safely. Runtime applies the model matrix. Raw hull point counts are mast 52/64, tracks 59/74 and bank 140/132 (intact/broken); total 243–278. Admission rejects invalid anchors and finite-but-degenerate support footprints.

`src/entities/pools.ts` owns the existing shared health bar. Its back/fill/segments now all draw in the transparent pass with original overlay depth rules; this fixes opaque fill being overwritten by transparent world content. `src/game/Game.ts` registers one Crawler bounds callback; wrong-group/lite/failure/disposal returns no override. Cached projected hull points keep the bar above the actual silhouette. Crawler dial ring/pointer also use the transparent pass, retaining original depth and visibility rules.

## Completed checks before the route correction

All commands ran in this checkout against scratch Vite `http://127.0.0.1:5246`; existing e2e files were untouched.

- `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5246 node_modules/.bin/playwright test e2e/e3-crawler-boss.spec.ts e2e/e3-canyon-works.spec.ts --workers=1 --project=desktop-chrome --project=mobile-chrome --trace=off --reporter=line` — 12/12 pass; `e3-gameplay-tests.log`.
- Same command with `e2e/wire-crawler-3d.spec.ts` — 6/6 pass; `e3-wire-tests.log`. Includes all morphs, real deaths/wreck/disposal, LITE with no GLB request and invalid-byte fallback.
- `node scripts/check-baron-presentation.mjs http://127.0.0.1:5246` — both viewports pass; `e1-bar-regression.jsonl`.
- `node scripts/check-railcar-presentation.mjs http://127.0.0.1:5246` — three contracts × two viewports pass; `e2-bar-regression.jsonl`.
- `node scripts/check-crawler-presentation.mjs http://127.0.0.1:5246` — all eight fixed-fixture states pass; `check-receipts/final-presentation.jsonl`, empty `.stderr`, images/hashes in `final-framed/`. Actual modelBounds callback points are compared to real drawn mesh vertices, raw and optimized, across all morph states. Whole suspend state is unchanged by presentation calls except its documented `writtenAt` envelope. Material locality/atlas, scaled collector attachment, support contact, actual silhouette bounds, bar/HUD rectangles and green fill pixels are asserted.
- `node artifacts/boss-fidelity/e3-crawler/check-lifecycle.mjs http://127.0.0.1:5246` — route/act2/pinning/disposal, all three sole-survivor delayed loads, lite/invalid fallback and cache clearing pass; `lifecycle/lifecycle-report.json`. It records actual one-step model/proxy lag rather than forcing an extra render synchronization. This exposed the route-wide disk-coverage loss that motivated the subsequent clock/pivot correction.
- Controlled dial A/B: `dial-probe/report.json`; transparency reveals 267 yellow pixels, restored crop matches original exactly, camera/model/dial bounds unchanged, zero errors. Only unrelated real-time `baron.standard.dropElapsed` changed in the saved-state probe. The final source visibility proof passes: 22/64 projected ring-centerline samples contain bright yellow; the prior opaque control had 0. The final ring/needle crop is visibly present.

Raw/optimized actual-loader parity before the final pivot: maximum world morph-bound delta 0.000542 wu, support 0.000505 wu, collector 0.000165 wu. The corrected callback probe compares actual callback output rather than reimplementing the expected transform: optimized callback/drawn-vertex error ≤1.1e−14wu. Four malformed admissions rejected. Earlier fixture/measurement failures are retained in `focused-presentation-receipts/` and `check-receipts/`.

## Count receipts

The exact unchanged wire spec was copied into `count-receipts/measured-wire.spec.ts` solely to persist measured renderer values. Its first run failed only the stale triangle pins. Four numbers were then refreshed from those measured values; all other metrics, tolerances and memory deltas were retained. The unchanged original spec subsequently passed.

| Metric | Previous | Measured/current |
|---|---:|---:|
| Desktop mounted triangles |157812|157592|
| Desktop loaded-before-kill triangles |159688|159468|
| Mobile mounted triangles |154346|154126|
| Mobile loaded-before-kill triangles |154322|154102|

Calls, geometries, textures, disposal counts and every memory delta were unchanged. Originals/actual values are in `count-receipts/`. The 22 historical PNGs written by the existing specs were banked in `existing-test-output/` and restored from HEAD; `restore-receipt.json` records exact hashes. No existing test source was edited.

## Honest visual limits

The original fixed player-centroid+2Z fixture clipped the mobile toppled mast by 0.98 px and left peeled tracks within 0.71 px of the edge; the capacitor health bar overlapped Weapon by 12.20×7.14 px. These are preserved in `after/`, `active-drain/` and original failure receipts. The intermediate X−0.5/Z+1.5 fixture left 1.80 px vertical bar overlap (`active-drain-framed/`).

The final pre-route-correction review fixture uses one fixed player position, centroid X−0.5/Z+1.0, for both viewports/all states. It clears all geometry by≥15.1 px, bar/HUD by≥8.16 px and bar/model by≥10.4 px; actual green fill is≥63%. This is diagnostic player placement through the existing teleport hook under the ordinary gameplay camera. It is not a production camera fix or a guarantee against arbitrary offscreen geometry/HUD overlap. Story cards are dismissed through their actual UI handlers. Every crop is an exact extraction from a saved full screenshot.

The rigid body can bridge non-planar terrain: original route evidence measured up to1.283wu opposite-edge gap at 17.27° tilt; numeric pivot candidate raises the worst sampled bridge gap to 1.432 wu while retaining 0.025 wu nearest contact. No continuous contact/suspension claim is made. Fog and dark terrain limit visual judgment of this gap.

The active beam joins the intact lens numerically and visibly; the fallen lens geometry is unobscured in final frames. The distant relay endpoint is fogged/offscreen and the beam is partly occluded by the body/Weapon HUD, so complete visual relay contact is unproven. Existing beam style/route is unchanged. Dark mottled iron, matte brass and simplified plumbing remain art-fidelity limits.

## Final joint-source evidence

The final source/capture hashes are in `final-route-framed/provenance.json`. Crawler SHA256 is `dd2d61dcc904af9bee6e08878c9f458a1c502109b9ef3bb6293f95350706ad7b`; Game SHA256 is `5d1ea4bf63df8f16882f2c60d5c6e3549657483ba3f466066492fd06800b5944`. Movement-clock changes belong to the movement owner in Game/Headless; the Crawler geometry and combat targets remain unchanged. Their `movement-check.json` compares actual browser/headless movement with a legacy negative control.

- `node scripts/check-crawler-presentation.mjs http://127.0.0.1:5246` — final joint source passes both viewports/all eight states, zero errors/presentation failures. Receipt: `check-receipts/final-route-presentation.jsonl` and empty `.stderr`. Full frames and exact crops: `final-route-framed/`. Minimum silhouette margin 19.71 px; health bar/model gap 10.40 px; bar/fixed-HUD gap 11.33 px; actual green fill at least 62.75%. Maximum beam-anchor error 7.33e−15 wu. Final raw/optimized world-envelope parity delta 0.000543 wu; actual callback-versus-drawn-vertex checks and full snapshot purity pass.
- `node artifacts/boss-fidelity/e3-crawler/check-lifecycle.mjs http://127.0.0.1:5246` — final source passes five actual route positions at 0/10/20/30/40 seconds, act-2 dial pixels/attachment, pinning, all three sole-survivor delayed loads, disposal/cache clearing, lite and invalid-byte fallback; zero errors. `lifecycle-final/lifecycle-report.json` preserves exact runtime transforms, targets, morphs, terrain samples and original UI screenshots. Full formation span remains 8 wu (floating-point error ≤1.4e−13). Semantic body-center lag equals one actual 30 Hz step: 0.0648 wu, or 9% of the unchanged 0.72 hit radius; moving sole survivors lag 0.06 wu, pinned zero. No extra presentation sync is forced before observation.
- `python3 artifacts/boss-fidelity/e3-crawler/measure-final-route-target-fit.py` — actual live component triangles projected onto the XZ plane cover the target disks substantially throughout the recorded route and loss cases. Uses 5,025 deterministic disk samples, actual observed transforms/morphs and the retained one-tick lag. Receipt: `lifecycle-final/target-disk-coverage.json`.

| Actual route time | Mast disk | Tracks disk | Bank disk |
|---|---:|---:|---:|
| 0 s |78.25%|100%|72.32%|
| 10 s |89.69%|100%|66.87%|
| 20 s |76.84%|100%|72.56%|
| 30 s |76.18%|100%|76.38%|
| 40 s |73.65%|100%|75.00%|

Act-2 bank coverage is 75.12%; pinned bank 80.04%; delayed sole mast/tracks/bank 74.65%/100%/77.09%. These are observed geometry-overlap measurements, not replacement collision rules or an all-world guarantee.

Every sampled support retains nearest tread clearance 0.025 wu. Largest final opposite-edge bridge gap is 1.429 wu at 17.56° tilt; the fog prevents a strong visual contact claim. Ground contact is established numerically. The movement and tilt corrections remove the earlier drift/lean-related target misses without growing the model.

Final visual review retains these limits: mobile catch-your-breath panel covers part of the right tread (approximately X248–375/Y466–505); top HUD cards overlap one another; lower drivetrain detail remains dark; capacitor damage is subtler than mast/track damage; the dial has visible rim/needle but no readable scale. These are not claimed fixed by diagnostic player placement. No additional camera/UI/VFX redesign was made.

## Timing

Final isolated timing passed; `timing/report.json` records the source/asset/shared-context hashes and each complete sample. The earlier run overlapped a small independent-review CPU probe and is retained only as preliminary under `timing/preliminary/`. The final command is `node artifacts/boss-fidelity/e3-crawler/capture-timing.mjs`, with stdout in `timing/run.jsonl` and result in `timing/report.json`. It uses the banked pre-E3 Crawler source/GLB through request fulfillment, the existing TypeScript compiler for type erasure, and only a no-op old-class bounds callback shim. Both arms share the current Game/bar/clock context. Actor positions/camera, calls/geometries/textures and exactly −220 triangles are asserted; each arm reads a complete 180-frame existing telemetry window after 10 seconds settling. This excludes initial loading/hull construction and is not a real-mobile or release-performance claim.


| Isolated steady-state sample | Before p95 | Final p95 | Draws / geometries / textures |
|---|---:|---:|---|
| Desktop 1280×800 |9.1 ms|8.6 ms|65 / 87 / 24, unchanged|
| Mobile viewport 390×844 |8.4 ms|9.1 ms|57 / 78 / 23, unchanged|

Both arms average approximately 8.33 ms in this local headless environment; every recorded window has 180 frames. Triangles decrease exactly 220 (desktop 157866→157646; mobile 154346→154126). Actor positions and camera match, zero console/page/request errors, and the final support/hull counts match the admitted caches. This small sample shows no material regression at its precision; it does not establish a speedup, real-mobile GPU performance or release FPS. The preliminary overlapped-review run is excluded from this table.
