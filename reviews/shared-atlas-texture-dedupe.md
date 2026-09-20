# Review: shared-atlas-texture-dedupe — one atlas resident per landmark pack (lane-d, codex runner on gpt-6-astra xhigh, attended drain 2026-09-05)

**Slice/branch/tip:** `shared-atlas-texture-dedupe` · `lane/d` · runner commit `4ddc4986c` over base `3dba120ec` · merge `bbf1c3832` (no-ff; package.json + BACKLOG unions).
**Verdict:** MERGED. F-ASTRA-4 cured. The runner declared "acceptance BLOCKED" on three adjacent reds it proved with a native-loader control were not its own; the attended re-gate on a quiet host confirms two of them were load and the third is the pre-existing F-T3D-1.

## What it does
`src/assets/SharedAtlasPlugin.ts`, registered on the shared loader in `AssetLoading.ts`: a GLTFLoader plugin whose `loadTexture` hashes the image's bufferView bytes and returns one cached texture promise per content hash across GLBs loaded through the same tracker; sampler/colorSpace differences are honoured by cloning the texture object over a shared image source; the cache lives with the canvas tracker and clears on teardown (load → dispose → load returns to baseline). `Terrain3dClaimPilot.ts` is an unchanged consumer.

## Evidence
| Gate | Result |
|---|---|
| `scripts/shared-atlas-plugin.test.mjs` | 5/5 |
| `e2e/shared-atlas-dedupe.spec.ts` (new, `?debug` seam) + `landmark-brightness` + `perf-01-stress-budget` + `terrain3d-claim-pilot` (drain port 5273, workers=1, host load ≈ 4) | 22/24 — the two reds are F-T3D-1 (`terrain3d-claim-pilot.spec.ts:76` "contract-valid GLB feeds every visualY consumer and keeps the water agreement", hero 0.0214 above the sample), pre-existing on main and reproduced on the runner's native-loader control; `landmark-brightness` p95 and the mobile terrain-readiness case, red for the runner under host load 280, are GREEN here |
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 |
| `scripts/engine-era-guard.test.mjs` after pin `9254f19e` | 5/5 |
| `npm run test:node-guards` | see the drain commit message |
| Residency (runner, `renderer.info.memory.textures`, full tier) | The Claim desktop 58 → 54, 390px 56 → 52; Hill Mine 58 → 54 / 56 → 53; Mare Claim 54 → 50 / 52 → 48; landmark-atlas estimate 26.67 → 5.33 MiB per pack (five decoded images → one, 21.33 MiB saved per pack) |

## Merge classification (base `3dba120ec`)
| File | Class | Resolution |
|---|---|---|
| `src/assets/SharedAtlasPlugin.ts`, `scripts/shared-atlas-plugin.test.mjs`, `e2e/shared-atlas-dedupe.spec.ts` | NEW | clean |
| `src/assets/AssetLoading.ts` | LANE-TOUCHED | clean |
| `package.json` | MAIN-MOVED (main appended `deploy-budget.test.mjs`) | union: both tests in the single `run-node-guards` invocation |
| `tasks/BACKLOG.md` | MAIN-MOVED | union |
| `artifacts/shared-atlas-dedupe/**` (68 files) | NEW evidence | clean |

## Findings
- **F-SAD-1 (non-blocking):** the runner's control reproduced F-T3D-1 independently; its per-family note that JS residency estimates exclude render targets and uniforms stands — the survey (`perf-optimization-survey`) should measure real VRAM on a phone.
- **F-SAD-2 (non-blocking, process):** a runner that proves a red is inherited should still say READY with the fingerprint, not "BLOCKED"; the drain law already treats control-reproduced reds as known. Worth a line in the lane template's self-check.
