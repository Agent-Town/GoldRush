# Asset diet explicit manifest

Status: **STOPPED at the task firewall. Not READY-FOR-GATES.** Scoped implementation is retained for the orchestrator; no commits were made.

## Preflight

- Started on `lane/a` at `eb79d0c127d9c525508a6c4878041a370945069b`.
- Initial status clean; `git log main..HEAD` empty. No reset or discarded evidence needed.
- `npm install --no-audit --no-fund`: exit 0, lockfile unchanged.
- Baseline `npm run build`: exit 0; post-build cleanliness check empty.
- Baseline production inventory: 413 GLBs, 235 Meshopt-compressed and 178 uncompressed. See `baseline-inventory.json` and `baseline-build.log`.
- The task's Astra review is absent in this lane; read the original at the main checkout's `docs/reviews/2026-09-05-astra-3d-review.md`, section 2.

## Change

The manifest assigns source path patterns to production GLB families. Every emitted GLB must resolve to exactly one source and exactly one policy; unknown or overlapping entries fail before conversion. The build keeps the existing Meshopt medium / WebP quality 80 settings and does not edit source assets.

`createGltfLoader(manager?)` is the shared decoder factory. Tracked loads retain their existing LoadingManager; the nine other sites change only their import and construction, preserving their callbacks, serial/disposal checks, and simulation behavior.

## Blocking couplings

The task says: “If a scope item is impossible inside the firewall, STOP with the coupling points as file:line and the measured evidence; do not widen the firewall yourself.” The independent review found these required companion changes outside the authorized paths:

1. **Replay identity must register the changed source.** `scripts/assay-replay-agent.mjs:36` includes `src` in the engine hash corpus. The loader-only edits change the hash from the registered `869f345151896ee319a959e2922763a93082fca12b944b045a2351cf80aa6aba` to `977ef6b77fd25040e7b2249d8ac1d814c1f6660a354500b98ca3e11a3cce6b58`. `scripts/engine-era-guard.test.mjs:34` fails because the new value is absent from era 5. Fresh tapes carry that value (`scripts/gr-sim.mjs:298`); verification rejects unknown pins (`scripts/assay-worker.mjs:99`), as does the viewer (`src/game/Game.ts:7069`, `:7130`). A same-era append to **`assets/engine-era.json:4`** is required; the task forbids asset-file changes. The orchestrator must compute the final merged-tree hash when registering it.
2. **Manifest policy must participate in cache invalidation.** **`vite.config.ts:23-27`** hashes only `scripts/asset-diet.mjs` and `package-lock.json`. Changing only `compress` in the new manifest changes the emitted GLB bytes but leaves the asset fingerprint and URLs unchanged. `public/_headers:2` caches assets immutably for a year. Adding the manifest to that fingerprint is outside the firewall. The supplied positive/negative fixtures prove that manifest policy controls whether the output is transformed.
3. **That fingerprint fix also requires a mirror dependency.** The droplet's positive allowlist admits the old script at **`scripts/deploy.sh:196`**, then ends closed. If Vite starts reading the manifest, the mirror must include it as well. `scripts/deploy.sh` is expressly forbidden by this task. No deployment was attempted.

Requested follow-up scope: allow `vite.config.ts`, the exact manifest include in `scripts/deploy.sh`, and the same-era pin in `assets/engine-era.json`; retain the rest of the firewall. No workaround duplicates the manifest inside JavaScript or introduces a second asset-renaming pipeline.

## Review disposition

- Independent review: `codex review --uncommitted`, log `codex-review.log`. Replay registration and cache fingerprint findings are confirmed and blocked as above.
- The review also reproduced a **rail sleeper geometry regression**: `src/game/Run3dPilot.ts:190` instances `source.geometry` while discarding the GLB node transform. Quantization changes raw X bounds from ±0.66 to ±1 and raw Y from 0..0.16 to ±0.1212; it compensates with node scale 0.66 and translation Y=0.08, which that consumer ignores. Resolved within scope by an explicit `compress:false` entry for `rail-element.glb`, including the reason. Other run props remain compressed. Fixing the instancing consumer is a separate task.
- A separate Baron baking probe found only 0.0000258 units of bounding-box drift with the existing compressed path, below its 0.0001 check; the feared integer overflow did not reproduce. No extra position-format policy or runtime changes were added.

## Validation

- Baseline install/build/cleanliness: green, logs retained.
- `npx tsc --noEmit`: exit 0, `typecheck.log` empty.
- `node --test scripts/gltf-loader-usage-guard.test.mjs`: 1/1 green.
- `node artifacts/asset-diet-explicit-manifest/check-manifest.mjs`: 5/5 green after the rail exemption. Unknown prefix-like output, uncovered source, and overlap fail before mutation; explicit opt-out preserves bytes for both main and worker filename forms.
- Factory/LoadingManager runtime probe: passed custom-manager identity, Meshopt decoder identity, shared tracker identity, loading/ready counters, and stale-tracker isolation.
- Candidate `npm run build`: exit 0, `build.log`. It read the manifest at 10:45:23 local, before the rail exemption saved at 10:45:43. Consequently **this is not a build of the final manifest**, and `dist/` must not be reused for gates. `candidate-manifest.json` records its input policy. The final exemption is covered by the selector/opt-out checks but has not been rebuilt.
- `node --test scripts/engine-era-guard.test.mjs`: exit 1, 4 passed / 1 failed; the new source hash is unregistered. See `engine-era-guard.log`.
- `check-built-models.mjs` is provided for the follow-up and has not been run against a current build. It verifies topology, names, morphs, dimensions, compression, and opt-out byte identity.
- Browser gates **not run** after the task's explicit STOP condition. No screenshot, desktop/mobile, or zero-console claim is made.

## Browser gate inventory for the follow-up

Grepped `e2e/` for every boss/finale/railcar/Baron loader and Town3dViewer. The directly relevant existing specs are:

- `lane-baron-props-detail.spec.ts`
- `wire-railcar-3d.spec.ts`, `fix-e2-railcar-read.spec.ts`, `e2-enemies.spec.ts`, `e2-trestle.spec.ts`, `e2-incline.spec.ts`
- `wire-crawler-3d.spec.ts`, `e3-crawler-boss.spec.ts`
- `e5-boss-dredge-queen.spec.ts`, `tp01-w6-migration.spec.ts`
- `e6-boss-homemaker.spec.ts`, `e6-roster.spec.ts`
- `e8-boss-salvage-claw.spec.ts`, `e9-boss-old-digger.spec.ts`
- `e10-finale-staging.spec.ts`
- The wider launch/restore paths in `contract-briefings.spec.ts` and `mp-02-lockstep.spec.ts` also appeared in the grep and should be included when gating the resumed change.
- Town and compression coverage: unmodified `asset-diet.spec.ts`, `town-t1-square.spec.ts`, `town-era-switch.spec.ts`, `town-stamp-mill-blender.spec.ts`, `town-dynamo-hall-blender.spec.ts`; the last two base buildings are newly compressed.
- No existing Town3dViewer drop-in spec was found. `ap16-4-contract-admission` and the `er01-e*-census` matches are headless census/registry references; the ceremony match names boss audio, not GLB loading.

Use both `desktop-chrome` and `mobile-chrome` (390px). `artifacts/asset-diet-explicit-manifest/playwright.config.ts` preserves the preview harness on isolated port 5196 and uses the existing snapshots without editing e2e files.

## Routed loaders

`Town3dViewer`, `Game` (Baron props), `SalvageClawBossSystem`, `HomemakerBossSystem`, `CrawlerBossSystem`, `E10FinaleSystem`, `OldDiggerBossSystem`, `DredgeQueenBossSystem`, and `entities/pools` (railcar). The existing town/terrain/run tracked loads also delegate through the shared factory.


## Candidate build byte table (provisional; pre-exemption)

These are measured output bytes from the completed all-compress candidate, **not final-manifest gate evidence**. Source GLBs total 846,169,224 B; candidate output totals 122,044,900 B (86% smaller). The old selector's built output was 346,843,012 B, so this candidate saves another 224,798,112 B. Boss count 10 includes four worker-emitted copies of the six distinct models.

| Family | GLBs | Before bytes | After bytes | Cut | Policy |
| --- | ---: | ---: | ---: | ---: | --- |
| terrain | 32 | 263541092 | 37455104 | 86% | compress |
| landmarks | 196 | 313187204 | 53025380 | 83% | compress |
| panoramas | 32 | 28727380 | 2552972 | 91% | compress |
| town-buildings | 9 | 17901452 | 2573016 | 86% | compress |
| town-era-variants | 73 | 112127592 | 17922008 | 84% | compress |
| props | 59 | 64258892 | 2288252 | 96% | compress |
| bosses | 10 | 38653740 | 5651116 | 85% | compress |
| finale | 2 | 7771872 | 577052 | 93% | compress |

The final manifest separates `rail-element` as one uncompressed model from the props row. Rebuild before quoting a final transfer total or running the preview config. Source models, geometry, textures, existing e2e specs, `STATUS.md`, specs, and git history were not changed.

## Resume order

1. Resolve the three out-of-firewall companion changes described above; do not use this lane hash as the final merged-tree pin without recomputing it.
2. Run `npm run build` from a clean Vite output, then `node artifacts/asset-diet-explicit-manifest/check-built-models.mjs` and the focused guards.
3. Run the named browser specs on desktop and 390px, including the unchanged asset-diet screenshot/cue/budget suite with `GR_ASSET_DIET_BUNDLE=1`. The existing artifact config serves the rebuilt bundle on port 5196.
4. Record the final byte table and browser results before marking READY-FOR-GATES.
