# F-ASTRA-6 and F-ASTRA-2 implementation evidence

Task: `sol-open-findings-astra`; branch `sol/open-findings-astra`.
Base: `21648cdcff9cafc1a44a56eb94c15eb9bf5d2a14`.

## Final state

**READY-FOR-GATES with recorded exceptions.** Runtime batching is committed in `2d485b5fe`; the finished hero pilot is committed separately in `58fdd423c (archive: pruned by the A3 rewrite)`. The final evidence commit also corrects the new plain-boot fixture and gives the culling guard a real census caller.

- **F-ASTRA-6:** measured reductions of 2 / 2 / 3 / 2 draw calls for The Claim / town / Dry Gulch / Twin Banks. The 20-case original transparency matrix and both town comparisons pass. Four-run timing modes are similar or better in most cases, but the strict no-worse p95 condition remains **unproved**; every sample and qualification is retained. Do not mark this condition green from the draw-call result alone.
- **F-ASTRA-2:** finished diffuse 1024-square pilot, complete side/back UVs, grounded exported walk and [eight-heading comparison board](hero-eight-heading-board.png). The runtime still uses the sprite. **Robin decides promotion.**
- **Verification:** both TypeScript checks, ordinary/E1 builds, payload check, all eight plain boots, focused culling/prop/scatter checks and existing landmark-brightness checks pass (four conditional landmark calibration cases skip). The broad browser run is **185 passed / 23 failed / 4 skipped**. The node phase is **895 passed / 10 failed / 2 cancelled / 8 skipped**. Full exceptions, controls and one native retry are below; this is not an all-green gate report.

## Preflight

- Native Mac; `/opt/homebrew/bin` first on PATH. Branch and main exactly equal; no ahead commits, no discarded evidence or uncommitted work.
- `npm install --no-audit --no-fund`: passed. `npm run build`: passed (full transcript `_raw/preflight-build.log`).
- Post-build `git status --short`: empty, before this evidence directory was created.
- Read the original findings, perf-e1-r2 transparency failure, renderer/scatter/town owners, sprite Hero, GLB export contract, payload derivation and deploy budget (52,000,000 bytes).
- Census targets: The Claim, town, Dry Gulch, Twin Banks. No lane-c campaign files are in scope.

## Initial census (before runtime changes)

Fixed empty scene, full tier, seed `e1-perf-<scene>`, desktop 1280×800. Calls include shadows. Transparent includes alpha-tested sprites; categories are mutually exclusive. Raw inventory and attributed submissions: `census-initial-1280.json`.

| Scene | Class | Calls | Triangles | Instances off camera / total | Culling |
|---|---|---:|---:|---:|---|
| the-claim | other opaque | 27 | 9244 | — | — |
| the-claim | opaque instanced | 20 | 26504 | — | — |
| the-claim | unique landmarks / terrain | 6 | 36476 | — | — |
| the-claim | transparent / alpha tested | 32 | 40022 | — | — |
| the-claim | EnemyHandLanternBulbs (inventory) | — | 0 | 0 / 0 | disabled |
| the-claim | EnemyHandLanternCones (inventory) | — | 0 | 0 / 0 | disabled |
| the-claim | GeneratedSpriteBlobShadows.f646d18d-f2cc-4c72-bba8-66ca02c11bda (inventory) | — | 28 | 0 / 1 | disabled |
| the-claim | GeneratedSpriteBlobShadows.71d79dc6-f4c2-4773-ba74-6ece72c5c614 (inventory) | — | 0 | 0 / 0 | disabled |
| the-claim | GeneratedSpriteBlobShadows.f9bd0848-43a6-4f61-8cda-740eae3767b5 (inventory) | — | 0 | 0 / 0 | disabled |
| the-claim | GeneratedSpriteBlobShadows.5960c3fc-6384-4a15-8436-05d6c000f5e3 (inventory) | — | 28 | 0 / 1 | disabled |
| the-claim | DetailScatter.rocks (inventory) | — | 1584 | 36 / 44 | disabled |
| the-claim | DetailScatter.stumps (inventory) | — | 504 | 15 / 18 | disabled |
| the-claim | DetailScatter.dry_grass (inventory) | — | 368 | 67 / 92 | disabled |
| the-claim | DetailScatter.wagon_ruts (inventory) | — | 48 | 18 / 24 | disabled |
| the-claim | DetailScatter.claim_posts (inventory) | — | 144 | 11 / 12 | disabled |
| the-claim | DetailScatter.contactShadows (inventory) | — | 2324 | 130 / 166 | disabled |
| the-claim | DecoyShedPool (inventory) | — | 384 | 0 / 16 | disabled |
| the-claim | DecoyShedPool (inventory) | — | 192 | 0 / 16 | disabled |
| the-claim | DecoyShedPool (inventory) | — | 192 | 0 / 16 | disabled |
| the-claim | DecoyShedPool (inventory) | — | 192 | 0 / 16 | whole batch |
| the-claim | DecoyShedPool (inventory) | — | 192 | 0 / 16 | whole batch |
| the-claim | CapacitorBankPool (inventory) | — | 384 | 0 / 16 | disabled |
| the-claim | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | disabled |
| the-claim | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | disabled |
| the-claim | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | whole batch |
| the-claim | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | whole batch |
| the-claim | SparkRigBoltPool (inventory) | — | 1536 | 0 / 128 | disabled |
| the-claim | SparkRigBoltPool (inventory) | — | 12800 | 0 / 128 | disabled |
| the-claim | XpMotePool (inventory) | — | 256 | 0 / 64 | disabled |
| the-claim | GoldPickupPool (inventory) | — | 864 | 0 / 24 | disabled |
| the-claim | CombatVfx (inventory) | — | 576 | 0 / 32 | disabled |
| the-claim | CombatVfx (inventory) | — | 576 | 0 / 48 | disabled |
| the-claim | EnemyPool (inventory) | — | 1920 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 1344 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 16128 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 6912 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 6144 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 3456 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 3072 | 0 / 96 | disabled |
| the-claim | EnemyPool (inventory) | — | 1152 | 0 / 96 | disabled |
| the-claim | Terrain3dLandmarkContacts (inventory) | — | 96 | 0 / 4 | disabled |
| the-claim | **TOTAL** | **85** | **112246** | | |
| town | opaque instanced | 12 | 3900 | — | — |
| town | opaque repeated props | 5 | 3544 | — | — |
| town | unique landmarks / terrain | 15 | 75564 | — | — |
| town | background | 1 | 12 | — | — |
| town | transparent / alpha tested | 18 | 4706 | — | — |
| town | TownContactSkirts (inventory) | — | 8 | 0 / 4 | whole batch |
| town | TownWearDecals (inventory) | — | 22 | 3 / 11 | whole batch |
| town | TownParcelBoxes (inventory) | — | 216 | 0 / 18 | whole batch |
| town | TownParcelTurned (inventory) | — | 432 | 0 / 9 | whole batch |
| town | TownLanternCord (inventory) | — | 840 | 14 / 42 | whole batch |
| town | TownLanternStringBeads (inventory) | — | 2160 | 6 / 18 | whole batch |
| town | TownSurveyPegs:general_store (inventory) | — | 48 | 0 / 4 | whole batch |
| town | TownSurveyPegs:chapel (inventory) | — | 48 | 4 / 4 | whole batch |
| town | TownPropWoodInstances (inventory) | — | 372 | 19 / 31 | whole batch |
| town | TownPropCanvasInstances (inventory) | — | 0 | 0 / 0 | whole batch |
| town | TownPropWagonWheels (inventory) | — | 0 | 0 / 0 | whole batch |
| town | TownPropCacti (inventory) | — | 360 | 3 / 9 | whole batch |
| town | TownPropLanternGlow (inventory) | — | 840 | 2 / 5 | whole batch |
| town | TownAmbientDust (inventory) | — | 1440 | 12 / 48 | disabled |
| town | TownCastBlobShadows (inventory) | — | 216 | 2 / 9 | disabled |
| town | **TOTAL** | **51** | **87726** | | |
| e1-dry-gulch | other opaque | 27 | 9244 | — | — |
| e1-dry-gulch | opaque instanced | 22 | 25824 | — | — |
| e1-dry-gulch | unique landmarks / terrain | 6 | 38540 | — | — |
| e1-dry-gulch | transparent / alpha tested | 32 | 38758 | — | — |
| e1-dry-gulch | EnemyHandLanternBulbs (inventory) | — | 0 | 0 / 0 | disabled |
| e1-dry-gulch | EnemyHandLanternCones (inventory) | — | 0 | 0 / 0 | disabled |
| e1-dry-gulch | GeneratedSpriteBlobShadows.15d64217-f0ef-4f13-aa9b-0c504fb96e14 (inventory) | — | 28 | 0 / 1 | disabled |
| e1-dry-gulch | GeneratedSpriteBlobShadows.ff8e6d44-6ee6-4281-add0-d13331ac8f59 (inventory) | — | 0 | 0 / 0 | disabled |
| e1-dry-gulch | GeneratedSpriteBlobShadows.b4d076c8-c1bd-409d-9f55-7e642a0beb3c (inventory) | — | 0 | 0 / 0 | disabled |
| e1-dry-gulch | GeneratedSpriteBlobShadows.8eb68323-9b6c-4a54-a3db-6dc671ced4cb (inventory) | — | 28 | 0 / 1 | disabled |
| e1-dry-gulch | DryGulchDustDevilQuads (inventory) | — | 44 | 22 / 22 | disabled |
| e1-dry-gulch | DetailScatter.rocks (inventory) | — | 1224 | 23 / 34 | disabled |
| e1-dry-gulch | DetailScatter.stumps (inventory) | — | 56 | 1 / 2 | disabled |
| e1-dry-gulch | DetailScatter.dry_grass (inventory) | — | 92 | 16 / 23 | disabled |
| e1-dry-gulch | DetailScatter.wagon_ruts (inventory) | — | 16 | 5 / 8 | disabled |
| e1-dry-gulch | DetailScatter.claim_posts (inventory) | — | 48 | 1 / 4 | disabled |
| e1-dry-gulch | DetailScatter.cactus (inventory) | — | 392 | 11 / 14 | disabled |
| e1-dry-gulch | DetailScatter.contactShadows (inventory) | — | 1078 | 52 / 77 | disabled |
| e1-dry-gulch | DecoyShedPool (inventory) | — | 384 | 0 / 16 | disabled |
| e1-dry-gulch | DecoyShedPool (inventory) | — | 192 | 0 / 16 | disabled |
| e1-dry-gulch | DecoyShedPool (inventory) | — | 192 | 0 / 16 | disabled |
| e1-dry-gulch | DecoyShedPool (inventory) | — | 192 | 0 / 16 | whole batch |
| e1-dry-gulch | DecoyShedPool (inventory) | — | 192 | 0 / 16 | whole batch |
| e1-dry-gulch | CapacitorBankPool (inventory) | — | 384 | 0 / 16 | disabled |
| e1-dry-gulch | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | disabled |
| e1-dry-gulch | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | disabled |
| e1-dry-gulch | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | whole batch |
| e1-dry-gulch | CapacitorBankPool (inventory) | — | 192 | 0 / 16 | whole batch |
| e1-dry-gulch | SparkRigBoltPool (inventory) | — | 1536 | 0 / 128 | disabled |
| e1-dry-gulch | SparkRigBoltPool (inventory) | — | 12800 | 0 / 128 | disabled |
| e1-dry-gulch | XpMotePool (inventory) | — | 256 | 0 / 64 | disabled |
| e1-dry-gulch | GoldPickupPool (inventory) | — | 864 | 0 / 24 | disabled |
| e1-dry-gulch | CombatVfx (inventory) | — | 576 | 0 / 32 | disabled |
| e1-dry-gulch | CombatVfx (inventory) | — | 576 | 0 / 48 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 1920 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 1344 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 16128 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 6912 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 6144 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 192 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 3456 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 3072 | 0 / 96 | disabled |
| e1-dry-gulch | EnemyPool (inventory) | — | 1152 | 0 / 96 | disabled |
| e1-dry-gulch | SpringPondLiveReeds (inventory) | — | 108 | 2 / 6 | disabled |
| e1-dry-gulch | **TOTAL** | **87** | **112366** | | |
| e1-twin-banks | other opaque | 24 | 9092 | — | — |
| e1-twin-banks | opaque instanced | 17 | 26056 | — | — |
| e1-twin-banks | unique landmarks / terrain | 5 | 54154 | — | — |
| e1-twin-banks | transparent / alpha tested | 33 | 40910 | — | — |
| e1-twin-banks | EnemyHandLanternBulbs (inventory) | — | 0 | 0 / 0 | disabled |
| e1-twin-banks | EnemyHandLanternCones (inventory) | — | 0 | 0 / 0 | disabled |
| e1-twin-banks | GeneratedSpriteBlobShadows.d5206c37-e1af-4c75-aa87-c8db8332bfa4 (inventory) | — | 28 | 0 / 1 | disabled |
| e1-twin-banks | GeneratedSpriteBlobShadows.d9d152e2-f2d4-41c8-a3cc-1e74f1b47962 (inventory) | — | 0 | 0 / 0 | disabled |
| e1-twin-banks | GeneratedSpriteBlobShadows.8cc7aeb7-b52f-42a8-9ad1-b653d7b03019 (inventory) | — | 0 | 0 / 0 | disabled |
| e1-twin-banks | GeneratedSpriteBlobShadows.cee3d12c-b054-4dca-bb8e-179c5e6d7782 (inventory) | — | 28 | 0 / 1 | disabled |
| e1-twin-banks | DetailScatter.rocks (inventory) | — | 1584 | 31 / 44 | disabled |
| e1-twin-banks | DetailScatter.stumps (inventory) | — | 504 | 11 / 18 | disabled |
| e1-twin-banks | DetailScatter.dry_grass (inventory) | — | 424 | 81 / 106 | disabled |
| e1-twin-banks | DetailScatter.wagon_ruts (inventory) | — | 48 | 20 / 24 | disabled |
| e1-twin-banks | DetailScatter.claim_posts (inventory) | — | 144 | 9 / 12 | disabled |
| e1-twin-banks | DetailScatter.reeds (inventory) | — | 264 | 34 / 44 | disabled |
| e1-twin-banks | DetailScatter.reeds.contact (inventory) | — | 300 | 19 / 25 | disabled |
| e1-twin-banks | DetailScatter.contactShadows (inventory) | — | 2520 | 131 / 180 | disabled |
| e1-twin-banks | DecoyShedPool (inventory) | — | 384 | 16 / 16 | disabled |
| e1-twin-banks | DecoyShedPool (inventory) | — | 192 | 16 / 16 | disabled |
| e1-twin-banks | DecoyShedPool (inventory) | — | 192 | 16 / 16 | disabled |
| e1-twin-banks | DecoyShedPool (inventory) | — | 192 | 16 / 16 | whole batch |
| e1-twin-banks | DecoyShedPool (inventory) | — | 192 | 16 / 16 | whole batch |
| e1-twin-banks | CapacitorBankPool (inventory) | — | 384 | 16 / 16 | disabled |
| e1-twin-banks | CapacitorBankPool (inventory) | — | 192 | 16 / 16 | disabled |
| e1-twin-banks | CapacitorBankPool (inventory) | — | 192 | 16 / 16 | disabled |
| e1-twin-banks | CapacitorBankPool (inventory) | — | 192 | 16 / 16 | whole batch |
| e1-twin-banks | CapacitorBankPool (inventory) | — | 192 | 16 / 16 | whole batch |
| e1-twin-banks | SparkRigBoltPool (inventory) | — | 1536 | 128 / 128 | disabled |
| e1-twin-banks | SparkRigBoltPool (inventory) | — | 12800 | 128 / 128 | disabled |
| e1-twin-banks | XpMotePool (inventory) | — | 256 | 64 / 64 | disabled |
| e1-twin-banks | GoldPickupPool (inventory) | — | 864 | 24 / 24 | disabled |
| e1-twin-banks | CombatVfx (inventory) | — | 576 | 32 / 32 | disabled |
| e1-twin-banks | CombatVfx (inventory) | — | 576 | 48 / 48 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 1920 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 1344 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 16128 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 6912 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 6144 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 192 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 3456 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 3072 | 96 / 96 | disabled |
| e1-twin-banks | EnemyPool (inventory) | — | 1152 | 96 / 96 | disabled |
| e1-twin-banks | **TOTAL** | **79** | **130212** | | |

Baseline payload script currently fails on the ordinary development build: declared `_gold-rush-release-e1-ceremony-scripts.js` is absent. Recheck on the required E1 release build. No payload declaration edits are authorized.

## Rendering implementation and interim evidence

`OpaquePropBatchPilot.ts` merges only opaque, non-alpha-tested static geometry. It retains a sphere for every original prop and compacts a fixed-size index buffer separately for the color and shadow cameras. Bounds remain conservative across clearing/restoration and camera moves. Installed three.js uploads that index after the callbacks; changing instance matrices at that point would have arrived a frame late.

Scatter batches preserve each prop's linear tint and per-vertex roughness; sidedness and metalness define separate compatible cohorts. Instanced reed sway, ruts, contact shadows, all other transparent items, and unique landmarks remain independent. The logical source meshes remain hidden and retain the original placement/clearing records. Their legacy class diagnostics describe participation in a draw, not additive draw totals; the census records actual submissions.

Town batches only repeated leaves sharing geometry, material and render state. Placement roots and emitter anchors remain intact. The three covered wagons retain per-prop color/shadow culling; the unique pan monument is separate. Negative-determinant, skinned, morphed, alpha-tested and transparent leaves are excluded.

| Scene | Initial calls → first post-change probe | Triangles before → after | Console/page errors after |
|---|---:|---:|---:|
| The Claim | 85 → 83 | 112,246 → 110,142 | 0 / 0 |
| Town | 51 → 49 | 87,726 → 87,726 | 0 / 0 |
| Dry Gulch | 87 → 84 | 112,366 → 111,126 | 0 / 0 |
| Twin Banks | 79 → 77 | 130,212 → 128,356 | 0 / 0 |

These are interim structural measurements, not the completed paired timing acceptance. The first desktop baseline saw p95 values from 9.6 to 330.4 ms without code changes as system load exceeded 140; its last round was stopped after a 60-second boot timeout. `census-before-1280.json` retains those partial samples. `census-initial-1280.json` is the complete initial census made before runtime edits.

- Four focused guard cases passed: transparency rejection, camera/clearing restoration, independent color/shadow visibility, original positions/UVs.
- TypeScript passed after fixing the typed-array union constructor and using material UUIDs.
- Ordinary and E1 release builds passed after batching; full transcripts under `_raw/`.
- Independent read-only Codex review (`independent-review.txt`) found no concrete regression and independently verified index uploads using installed three.js 0.184.0. It did not claim pixel/timing acceptance.

### Pixel instrument corrections (negative evidence retained)

The old perf-r2 capture procedure could not initially provide stable comparisons in the current application. Frozen baseline Vite responses referenced a dependency cache key that the new import invalidated (HTTP 504; fixed by normalizing dependency URLs only). The old optional Begin click also raced the already-started debug game's disappearing menu. GLB readiness did not guarantee a final heroine sprite, and a September story card covered about 10% of the first capture. Same-build reboot differences alone exceeded 10%; those screenshots are not evidence against or for batching. A later replay hit a page-load timeout under host load. Transcripts and incomplete images remain in `_raw/`; no threshold was increased.

The replacement pixel arm uses the same five maps, seed strings, empty/60-enemy pressure states and both viewports as perf-r2. It renders the retained original meshes and their replacements in one frozen scene, via the existing `drawCallCensus()` path (including post-processing), and reads the canvas synchronously. A repeated original draw supplies its own control. Only opaque source/batch visibility changes; all transparent items, sprites, camera, lighting and texture state are identical. This also avoids DOM overlays contaminating a canvas screenshot. Batch source IDs are inspection metadata, not a runtime flag.

## Historical checkpoint before the completed captures

At this point in the run, transparency, paired timing, browser/guard checks and the hero pilot were still pending. The sections below record their subsequent results; this paragraph preserves the ordering of the census-first work rather than describing the final state.

## Completed transparency evidence

All 20 cases passed (five original perf-r2 maps × empty/60-enemy pressure × desktop/mobile). The repeated-original control has **zero changed pixels in every case**. Treatment has at most **five changed pixels**, using `max(abs(RGBA channel delta)) > 4` as the changed-pixel predicate. Largest mean absolute channel delta is approximately **0.000031 / 255**. Source: `pixel-report-desktop-chrome.json`, `pixel-report-mobile-chrome.json`; the full raw triples remain local under `_raw/transparency/`.

This is near-identical rasterization, including the sprites, reeds, ruts and contact shadows. It does not claim bit-for-bit equality: merging world-space geometry can move a few edge samples. All capture boots had zero console/page errors. The guard thresholds remain the original perf-r2 limits (1% changed pixels and 0.25 mean channel delta); observed differences are far smaller.

## Performance measurement caveat

Four independent frozen-module pairs completed on desktop. Mobile completed all run-map pairs except town round 3, where both arms timed out at the page `load` event; those failures remain in `census-paired-390.json`. The instrument now waits for DOM content and explicit scene readiness instead. Host load was observed above 190 during this pass (other processes were not changed). Separate-boot p95 values cannot establish a reliable treatment effect on this host. Same-scene AB/BA trials retain both original and merged meshes, changing only their visibility, to remove dependency/network/startup differences. They also retain every sample; no slow mode is silently dropped.

## Verification so far

- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0.
- `GR_RELEASE=e1 npm run build`: exit 0.
- `node scripts/first-town-payload.mjs --json`: exit 0 on E1 output; **34,645,377 bytes**, 448 files / 88 families, zero demand-paged bytes, under the 52,000,000-byte deploy budget. The ordinary development build intentionally lacks the release ceremony-script artifact, explaining the initial payload-check failure. The hero pilot is absent from the release graph.
- `node --test scripts/f-astra-6-census.test.mjs`: four tests passed.
- Independent read-only code review: no concrete correctness finding (`independent-review.txt`).
- Engine source hash before: `cc3fd5d45add762fc0878a42618af1eaec836edeee83b03954c5e75a569b71f5`.
- Engine source hash after batching: `26b681eba2646ffc46c13409069931a88e79013a31ab05f46d981dd4a90573ea`.

The engine-era pin is intentionally untouched by this task's firewall. The orchestrator must evaluate/pin the final merged engine source through its normal gate; this report does not count a stale-pin failure as a green check.

### Same-scene timing results

All four runs per arm completed for all four scenes at both widths, with zero console/page errors. Full frame and render p95 pairs are in [timing-tables.md](timing-tables.md); raw frame samples and exact draw inventories are retained in the corresponding JSON files.

The settled town mode is essentially unchanged (desktop 10.2–10.8 ms before, 10.2–10.3 ms after; mobile last pair 10.3 → 10.4 ms). Twin Banks shows comparable modes and lower render work. The Claim improves on desktop; mobile is mixed. Dry Gulch reduces draws/triangles, but its higher-load timing samples are mixed. **A strict “p95 never worse” verdict is not established on this contended host.** The measured draw/triangle and pixel acceptance is clear; the timing gate must retain this limitation rather than call all p95 values green.

Additional frozen town comparisons pass at both widths: desktop **51 → 49** calls with two changed pixels; mobile **46 → 44** with eleven changed pixels (0.00084%). Repeated-original controls remain exact. This removes wandering town sprites as a confound in its draw-call delta. No landmark or transparent prop is combined.

To reproduce the independent old-module control, serve the base commit on 5301 and run `node scripts/f-astra-6-census.mjs --freeze`; retain the resulting `_raw/*-before.js` files, return to this branch, then run the script with `--paired --rounds 4 --width 1280` and `--width 390`. The direct same-scene control needs only this checkout: `--toggle --stage same-scene --rounds 4` with each width. All dev-browser work uses the authorized external server on 5301.

## F-ASTRA-2 finished pilot

The current comparison is [hero-eight-heading-board.png](hero-eight-heading-board.png): eight headings × eight cycle phases, GLB left and the actual runtime sprite right. `compare.html` in the asset directory also provides a heading selector and live playback. The sprite is driven through `Hero.update`; all eight independent direction sheets are loaded, all eight frame indices are observed, and none of the 64 poses is mirrored. The final capture reports zero console/page errors.

| Property | Original pilot | Finished pilot |
|---|---:|---:|
| GLB bytes | 3,655,664 | 3,050,224 |
| Exported vertices | 4,370 | 4,304 |
| Triangles | 3,288 | 3,256 |
| Skin / animation | 1 / 1 | 1 / 1 |
| Atlas | 4096 × 2048 | 1024 × 1024 |
| RGBA8 + mip estimate | 42.67 MiB | 5.33 MiB |
| Material | Black base + atlas emission | Atlas base color, roughness 0.83, metalness 0, no emission |
| Complete mapped authored parts | Front projection smeared on sides/back | All 50 parts, including sides, backs and caps |

The native image-generated material sheet is retained with provenance. Its clean material swatches replace projected clothing/face illustration. The mesh's authored eyes, nose, mouth, braid, hat, coat, pan and satchel supply its features. Material tiles are deliberately reused across parts; this is not a nonoverlapping lightmap atlas. The builder checks both nonzero UV triangle area and containment inside every part's assigned material region, with eight pixels of edge padding.

The source had float-noise duplicate vertices on two bevel caps, including a satchel edge only 1.49e-8 units wide. Welding within each semantic part at 1e-7 units removes 16 vertices and 32 degenerate triangles without changing the visible silhouette or deform weights. Welding across parts is explicitly avoided. The final minimum UV triangle area is 1.7335e-5; there are zero collapsed UV triangles.

Visual inspection caught a first-pass selection leak that the area check alone could not detect. Later unwrap operations had overwritten earlier UV tiles. The builder now clears edge selection and uses explicit face-selection mode, and the new containment assertion prevents that regression. The rejected board remains local under `_raw/hero-board-selection-leak.png`; it is not the delivered board.

### Actual gait validation and grounding

A deformation audit found that the original walk alternated its feet and closed its loop, but the soles penetrated by 30.46 mm and both could float as high as 67.51 mm above the reference ground at the comparison scale. The pilot now bakes a vertical rig correction while preserving its horizontal stride and joint choreography. Retiming the original keys to frames 0–64 at 128 fps keeps the same **0.5-second** cycle and allows the GLB exporter to retain the correction between the original eight authored poses.

The editable blend's 65 sampled poses keep the supporting sole at 3 mm. An independent check of the **exported GLB**, using Three.js `GLTFLoader`, `AnimationMixer` and `applyBoneTransform` at **129 phases**, measures **2.633–4.660 mm** support clearance and **zero loop seam**. It stubs image decoding only for CPU skin math; the comparison board uses the real rendered diffuse texture. Both feet alternate front/back across the stride. Evidence: `hero-foot-before.json`, `hero-foot-audit.json`, `hero-export-walk-audit.json`, `hero-walk-audit.json` and `hero-after.json`.

The delivered style is visibly simpler and chunkier than the current sprite. Side and back paint no longer smears, and the walk reads in all eight directions. This is a completed, reviewable pilot, not a claim that it should replace the sprite. **Promotion remains the owner's decision.** `Hero.ts` and the runtime entry graph are unchanged; the GLB is absent from the first-town families.

Final E1 payload is **34,645,419 bytes**: 42 bytes above the earlier post-batching measurement, entirely in the `TownTavernPilot.js` family. Every asset-family byte count is unchanged; the 3 MB hero GLB contributes zero first-town bytes. The final engine hash remains `26b681eba2646ffc46c13409069931a88e79013a31ab05f46d981dd4a90573ea`.

### Gate arrangement corrections

The first broad browser attempt used the default 30-second test ceiling and was stopped after timeouts. The 120-second attempt was also stopped: creating the asset harness's TypeScript config and first loading its new GLTFLoader import forced Vite-wide reloads while the suite was running. Those interrupted results are preserved, not offered as product acceptance. The final harness reuses the application's loader, its files are frozen before browser validation, and no existing e2e assertion has been edited.

The new plain-boot fixture initially wrote scores to the old global key instead of the active profile's score key. That admitted The Claim but did not unlock Dry Gulch/Twin Banks. The fixture now uses `profileDataKey('robin', SCOREBOARD_KEY)`; it still uses ordinary staged player launches with no debug flag or preview unlock.

The default node battery reported contention with four other batteries and produced timeout failures. It was stopped using only the verified lane-a process tree. The required changed-since runner was then invoked in its existing serial mode (`CLAUDE_CONFIG_DIR` present); its npm wrapper hit the runner's fixed 900-second ceiling. The underlying serial node process continued, and its full TAP stream is being preserved through an open file handle. The first caller audit also correctly found the new culling guard unrooted. `scripts/f-astra-6-census.sh` is now the real census entry point: it runs that guard before any browser arm. The caller audit subsequently passed with untracked files included. No package roster, baseline exemption, engine pin or existing test assertion was changed.


## Quieter four-run timing follow-up

Because the first passes left the timing condition unresolved, a further **four runs per arm per scene per width** used the same-scene AB/BA instrument with five-second sample windows. Every sample is retained in `census-quiet-1280.json` and `census-quiet-390.json`, and every individual p95 is listed in [timing-tables.md](timing-tables.md). Both runs first passed all four culling guards. All 64 scene/arm trials reported zero console/page errors.

| Scene | Desktop median of run p95, before → after | Mobile median of run p95, before → after | Draw-call reduction |
|---|---:|---:|---:|
| The Claim | 10.05 → 10.00 ms | 25.45 → 16.65 ms | 2 |
| Town | 10.00 → 10.05 ms | 9.85 → 10.20 ms | 2 |
| Dry Gulch | 9.50 → 9.55 ms | 9.90 → 10.05 ms | 3 |
| Twin Banks | 10.20 → 10.40 ms | 10.10 → 10.20 ms | 2 |

These are medians **of four p95 values**, not pooled-frame p95. Desktop Twin Banks has a fast 9.1–10.3 / 9.4–10.4 ms mode and a slower 14.7 / 14.9 ms mode before/after. Desktop Claim, Town and Dry Gulch remain in roughly the same 9–10 ms mode. Mobile Claim moves from 25–26 ms in three baseline runs to 15–17 ms in the treatments. Mobile Town and Dry Gulch remain around 10 ms. Mobile Twin Banks has three treatment samples at 9.8–10.3 ms and one at 15.4 ms; its four baselines are 10.0–10.4 ms.

The repeated draw and triangle savings are established, and corresponding timing modes are generally similar or better. The residual 0.05–0.35 ms median increases and unmatched mobile Twin Banks slow sample mean the strict universal timing condition is **not proved**. No timing threshold was invented after measurement, no outlier was removed, and the earlier more contended passes remain available. The orchestrator should retain this qualification when deciding whether F-ASTRA-6 is fully cured.

The new caller audit issue is resolved: both the normal tracked-file caller audit and the `gate-caller-audit.test.mjs` real-repository positive control pass after adding the executable census entry point. The original failure remains in the complete node transcript rather than being erased.


## Complete node guard transcript

The serial node phase completed all **915 tests: 895 passed, 10 failed, 2 cancelled by test timeout, 8 skipped**, in 2,424.48 seconds. Its complete TAP is preserved as [node-guards.tap](node-guards.tap); [node-guards-summary.json](node-guards-summary.json) indexes every nonpassing record. This is a red result. The surrounding changed-since runner had already terminated its npm wrapper at its fixed 900-second ceiling; the surviving node phase was allowed to finish and was captured through an open file handle. The later npm `&&` stages were not reached.

| Cause observed | Affected checks | Disposition |
|---|---|---|
| Engine hash differs from the pinned base | `bench-seeds`, `engine-era-guard`, and the fixture-teardown wrapper around `bench-seeds` | Expected integration prerequisite from render-source changes. `assets/engine-era.json` is explicitly outside this task's firewall; not changed. |
| Sparse checkout omits tracked raw sources | Claim Boat atlas, Flotilla atlas, deploy mirror's `boss-land-yacht.png` | The files exist in the base tree but carry `S` skip-worktree markers and are absent locally. No unrelated asset was restored or edited. |
| New culling guard had no caller | `gate-caller-audit` real-repository positive control | **Fixed** by the executable census wrapper; normal audit and targeted positive control now pass. Original red retained. |
| Agent reel invalid-order CLI returns 1 | `agent-reels` line 86, with `NOPE` rejected | Existing unmodified simulation/CLI path; assertion remains unresolved. |
| 60 s and 240 s test timeouts | Agent throttle ceiling; Claim overtime across Node engines | Both recorded as cancelled. No assertion was weakened or timeout changed in the test files. |
| Uncaught `write EPIPE` | `e8-remaining-maps` | Infrastructure/pipe failure remains unresolved; not treated as a passing test. |
| Signal-only `SIGBUS` | `open-sea-water` | Retried once as a single file under Node 26, concurrency 1. One assertion passed, then the file failed again without an assertion diagnostic; exit 1. The default spec reporter did not print a retry signal. Red retained; no further retry. |

The required changed-since command ran against base `21648cdcff9cafc1a44a56eb94c15eb9bf5d2a14` with `GR_GUARD_NO_ARTIFACT=1`. Power budget (p95 0.343 ms), task guards and citations passed. Caller audit passed after its repair. The node gate remains red for the reasons above. No baseline exemption, gate assertion, engine pin or unrelated runtime code was changed.

The single native retry transcript is [node-native-retry.txt](node-native-retry.txt). Build and focused caller verification output is in [build-verification.txt](build-verification.txt). The successful caller recheck does not rewrite the historical whole-battery counts.


## Reproduction commands

Run from the repository root with `/opt/homebrew/bin` first on `PATH`. Browser checks require the normal Vite development server on **5301**, started separately with `npm run dev -- --host 127.0.0.1 --port 5301 --strictPort`. No gate/rig port is used.

```sh
npx tsc --noEmit
npx tsc --project assets/pilots/hero-3d/tsconfig.json
npm run build
GR_RELEASE=e1 npm run build
node scripts/first-town-payload.mjs --json
bash scripts/f-astra-6-census.sh --stage quiet --toggle --rounds 4 --duration 5000 --width 1280
bash scripts/f-astra-6-census.sh --stage quiet --toggle --rounds 4 --duration 5000 --width 390
```

The original perf-r2 visual matrix plus frozen town cases:

```sh
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5301 GR_CAPTURE_RUN=1 \
  npx playwright test e2e/f-astra-6-transparency.rig.ts --workers=1 \
  --project=desktop-chrome --project=mobile-chrome --trace=off \
  --output=artifacts/sol/open-findings/_raw/transparency-results
```

Final adjacent browser run (the existing assertions are unchanged):

```sh
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5301 \
PLAYWRIGHT_JSON_OUTPUT_NAME=artifacts/sol/open-findings/browser-suite-results.json \
  npx playwright test 'e2e/town.*spec.ts' e2e/e1-dry-gulch.spec.ts \
  e2e/e1-twin-banks.spec.ts e2e/w1-04-detail.spec.ts \
  e2e/landmark-brightness.spec.ts e2e/f-astra-6-plain-boot.spec.ts \
  --workers=1 --project=desktop-chrome --project=mobile-chrome \
  --timeout=120000 --trace=off \
  --output=artifacts/sol/open-findings/_raw/browser-results-final --reporter=line,json
```

Do not set `GR_CAPTURE_RUN=1` for that `.spec.ts` command: it intentionally selects only `.rig.ts` files. The serial guard mode uses the repository's existing `CLAUDE_CONFIG_DIR` **presence** predicate, not a modified runner:

```sh
CLAUDE_CONFIG_DIR=/Users/robin/.claude-fires GR_GUARD_NO_ARTIFACT=1 \
GR_GUARD_STATS_PATH=artifacts/sol/open-findings/_raw/guard-stats.jsonl \
  node scripts/run-guards.mjs --changed-since 21648cdcff9cafc1a44a56eb94c15eb9bf5d2a14
```

This required command was measured to hit its 900-second npm-wrapper ceiling. The full node phase then took about 40 minutes. For a future full battery run without that outer ceiling, the equivalent direct command is `CLAUDE_CONFIG_DIR=/Users/robin/.claude-fires npm run test:node-guards`; do not launch it alongside another owned battery. Hero rebuild, live comparison, capture and exported-walk validation commands are in `assets/pilots/hero-3d/README.md`.


## Completed adjacent browser run

The final run, with application source held unchanged, executed **212 tests in 28 files**, serially on desktop and mobile: **185 passed, 23 failed, 4 skipped**, in 36.26 minutes. No Vite reload or dependency reoptimization occurred during that run. [browser-suite-summary.md](browser-suite-summary.md) lists every file/project and the complete failing assertions; [browser-suite-results.json](browser-suite-results.json) preserves the original runner result.

| Required area | Final result |
|---|---|
| Plain boots, four scenes × both viewports | **8 passed**, each with zero console and zero page errors; `plain-*.json` records the ordinary launch URL and viewport. |
| Dry Gulch | **12 passed**. |
| Twin Banks | 4 passed, **6 failed**: center terrain sample is `bank` instead of expected `river`; old sluice placement positions are invalid; old ford-routing expectation times out. |
| Existing scatter detail tests | **6 passed**: density/mobile reduction, placement clearance and deterministic seeding. |
| Landmark brightness | **4 passed**, 4 pre-existing conditional calibration skips. Assertions unchanged. |
| Town plaza props | **6 passed**: lazy/one-fetch mounting, LITE and failed-load fallback/disposal. |
| Town Tavern pilot | **6 passed**. Other building-pilot families also pass in both projects. |
| Wider town flows | **17 failed**: portrait fallback (2), old Tavern prompt copy (2), profile/founding controls (6), one desktop board approach (1), story priority (2), one desktop speaker expectation (1), sparse-checkout concept source (2), and one mobile actor-motion/frame observation (1). |

The naming failures show the current **Create Profile** form while the tests wait for Enter Town or older profile controls. Growth expects a growth story but receives `first-boot`. The concept comparison needs `assets/raw/concept-town-square.png`, which is tracked in the base but absent here with a skip-worktree marker. These are recorded exceptions, not waived assertions. No existing e2e file was edited.

Selected Twin Banks and town failures are also checked against the frozen pre-batching rendering modules. The first baseline instrument incorrectly required a `Scatter` request during town-only boots; its evidence is retained in `_raw/baseline-initial-*`. The corrected instrument requires the appropriate original module for the scene and leaves every existing test assertion intact. [baseline-control-provenance.json](baseline-control-provenance.json) records the frozen/source hashes and confirms the copied source test files match the base.


### Frozen controls and focused recheck

The corrected baseline run completed all **12 selected cases**: **3 passed, 9 failed**. Both original modules were captured before runtime edits; only their Vite dependency-cache query strings are normalized. `baseline-control-hits.jsonl` proves that every Twin Banks case loaded the original Scatter and every town case loaded the original TownTavernPilot. The existing source tests match the base byte-for-byte.

All six Twin Banks failures and both Tavern-copy failures reproduce on the original modules. Mobile portrait fallback also reproduces. Desktop portrait fallback passes in that control run, despite failing in the complete treatment run; its result is intermittent. Both original-module cast checks pass. See [baseline-browser-summary.md](baseline-browser-summary.md) and [baseline-browser-results.json](baseline-browser-results.json).

A single targeted recheck on the changed branch then ran the cast and portrait tests at both widths: **2 passed, 2 failed**. Both cast checks pass; portrait fallback still fails on both. This resolves the cast observation as nonreproducible in that focused rerun, while preserving the original full-suite failure. It does not turn the wider town suite green. [targeted-recheck-summary.md](targeted-recheck-summary.md) records the exact outcomes. The remaining broader failures were not all rerun on the old modules and remain explicitly unresolved rather than being declared unrelated by assumption.

### Handoff boundary

The branch is ready for orchestrator review of the implementation and its evidence. F-ASTRA-2 is a reviewable completed pilot. F-ASTRA-6 satisfies the measured draw and transparent-order conditions; its strict timing condition remains qualified. The orchestrator still needs to disposition the red broader gates and compute/pin the **final merged** engine identity through the normal process. No finding/backlog state was edited, no existing assertion was weakened, and no hero promotion, merge, push or deployment was performed.

Raw captures, failed trials, temporary baseline specs and full local tool logs remain under `_raw/` and are excluded from Git. The delivered boards and compact/full machine-readable result artifacts are outside `_raw/`. Generated evidence outside this task's folder is restored after the browser checks; the path list is retained as `restored-generated-evidence.txt`. Expected `logs/task-stats.jsonl` factory churn is left uncommitted.

Readable Markdown, text and TAP evidence trims trailing whitespace and extra blank lines at EOF. Original JSON error strings and local `_raw/` logs preserve the exact messages. This normalization does not remove test records or change verdicts.
