# Asset diet explicit manifest follow-up

**NOT READY-FOR-GATES.** The requested couplings and the panorama admission fix are retained. The all-green browser gate is blocked by an unchanged Homemaker reload crash reproduced on the pre-manifest parent in both projects. The complete adjacent battery has **not** passed.

## Preflight and scope

- Clean `lane/a`; `git log --oneline main..lane/a` contained exactly `8020915ca runner(lane-a): asset-diet-explicit-manifest.md`. That held commit is the base and was preserved. No commits, resets, merges, deployment, or main-tree edits.
- `npm install --no-audit --no-fund` and baseline `npm run build` exited 0; package lock unchanged. Post-build status showed only this new artifact directory.
- The v1 master is absent from the lane and was read at `/Users/robin/Claude/Projects/Gold Rush/tasks/asset-diet-explicit-manifest.md`; its report and implementation were read on the lane. No separate asset-diet spec exists under `specs/`.
- Baseline install/build used PATH Node 23.11.1. Subsequent builds and checks used the installed canonical Node 26.4.0.
- Production edits are limited to the five authorized paths: `vite.config.ts`, `scripts/deploy.sh`, `assets/engine-era.json`, `scripts/asset-diet.mjs`, and `scripts/asset-diet.manifest.json`. The last two fix a gate-discovered defect in the retained implementation, within v1's firewall. Existing e2e files, source GLBs/textures, simulation code, STATUS, specs, and public headers are unchanged. The task's BACKLOG row is the only bookkeeping edit.

## Implemented

1. Added the manifest bytes to the existing Vite fingerprint hash.
2. Added exactly `"--include=/scripts/asset-diet.manifest.json"` immediately after the script's include in the droplet mirror. A local rsync positive/negative fixture proves this line admits the manifest and removing it excludes it; no remote sync was attempted.
3. Appended exactly one era-5 pin and updated the top-level hash to `977ef6b77fd25040e7b2249d8ac1d814c1f6660a354500b98ca3e11a3cce6b58`. The cause names this task. All previous pins remain byte-for-byte structurally unchanged. Recompute the identity on the final merged tree before integration.
4. Preserved panorama vertex positions using explicit `quantize:false` with `compress:true`: lossless required Meshopt geometry compression plus the existing WebP texture settings. Other compressed families retain Meshopt medium quantization. The rail-element remains fully opted out, with its existing reason.

## Gate-discovered panorama regression and fix

The initial unmodified production screenshot case timed out because The Claim demoted with `pilot-install-failed:terrain contract mismatch`. `src/world/Terrain3dClaimPilot.ts:498` counts unique decoded positions; `:521` requires the authored panorama count; `:1815` rejects the whole terrain/panorama installation if either contract fails.

The real shared browser loader reproduced count collapse in **all 32 panoramas**, despite unchanged mesh and triangle counts. The Claim changed **1351 → 1344**. The old topology-only checker did not cover this runtime invariant. Evidence: `pre-panorama-fix-panorama-vertices.json`, `panorama-vertices.log`, and the initial failing run `asset-diet-gates.log`.

Lossless Meshopt preserves the position values: **32/32** browser comparisons now match original mesh, triangle, material, and unique-vertex counts. The single-model probe retained 1351 vertices while reducing 517820 → 86344 bytes. The family still saves **89%**. Both unmodified screenshot cases now pass. Evidence: `panorama-vertices.json`, `panorama-vertices-fixed.log`, `check-panorama-vertices.mjs`, and `asset-diet-gates-panorama-fix.log`.

## Validation

| Check | Result / evidence |
| --- | --- |
| `npx tsc --noEmit` | Exit 0; `typecheck.log`. Final `npm run build` also ran tsc successfully. |
| Final `npm run build` | Exit 0; `build-panorama-fix.log`. |
| Loader / engine-era / deploy-mirror guards | 7/7 passed; `node-guards-final.log`. |
| Manifest coverage / overlap / opt-out checks | 5/5 passed; `manifest-check-panorama-fix.log`. |
| Append-only pin and exact mirror line, rsync positive/negative controls | Passed; `couplings.log`, `check-couplings.mjs`. |
| Built GLB checks | 413/413 passed: manifest coverage, Meshopt/WebP, mesh names, topology, morphs, texture dimensions, exact opt-out bytes; `built-models-panorama-fix.log`. |
| Real-browser panorama metric comparison | 32/32 passed; `panorama-vertices-fixed.log`. Run while the isolated dev harness serves port 5197, after build and `check-built-models.mjs`. |
| Independent review of final production diff | No actionable regressions; `codex-review-panorama-fix.log`. Reviewer did not rerun build/browser gates. |
| `asset-diet.spec.ts`, unchanged, production, both projects | Initial corrected run: 5 passed / 1 desktop budget timeout; `preview-final-results.json`. Screenshot and cue cases passed on both projects with zero watched errors and zero suppressed GLTF blob errors. The unchanged desktop budget case then passed without tracing (1/1, 2.4m); see `desktop-budget-results.json` and `desktop-budget-retry.log`. Thus all 6 asset-diet cases passed across the recorded runs; the initial timeout remains reported. |
| Adjacent dev battery | Planned 170 cases / 23 files. Stopped after 33 completed: **25 passed / 8 failed**, 137 not completed. `dev-completed-results.json` and `dev-gates.log`. This is not full-gate evidence. |
| Parent-control Homemaker test | 2/2 failed with the same reload crash, desktop + mobile; `homemaker-control.log`, `control-results.json`. |

The corrected cue-window transfer readings were **10488378 B desktop** and **13789335 B mobile**, both below the existing 25000000 B ceiling. These are individual run measurements, not a stable transfer benchmark. The reported settled windows were 39401027 / 40940103 B and both reached the cap.

## Fingerprint proof

`node artifacts/asset-diet-explicit-manifest-2/check-fingerprint.mjs` uses scratch inputs and the real Vite config/application. It changes only the panorama `compress` boolean, then restores the exact manifest bytes; the lane manifest and production dist are untouched by the proof.

- Original **1408f6b4** → flipped **528a29dc** → restored **1408f6b4**.
- Every one of the **409 GLBs with a diet suffix** receives a new URL in the flipped arm. Restoration produces the identical **413-GLB URL list**.
- Four worker-emitted copies use Vite's separate worker naming and have no diet suffix: crawler, Dredge Queen, Homemaker, railcar. They remain unchanged in this proof. This inherited worker naming boundary is not covered by the authorized fingerprint-lines-only lift; no claim of universal worker-asset cache rotation is made.
- The first exploratory proof also reformatted the manifest; it is superseded. A boolean-only run exposed nondeterministic JS chunk names on one attempt, so the durable assertion targets GLB URLs; raw observations remain in the logs. Final inputs and URLs: `fingerprint-proof.json`, `fingerprint-proof-panorama-fix.log`.

## Final byte table

Source/emitted input **846169224 B** → final output **122625052 B** (413 GLBs). Compared with the old selector's 346843012 B output recorded by v1, this saves another **224217960 B**. Boss count 10 includes four worker copies of the six distinct models. Panorama geometry is lossless; no source asset is edited.

| Family | GLBs | Before bytes | After bytes | Cut | Policy |
| --- | ---: | ---: | ---: | ---: | --- |
| terrain | 32 | 263541092 | 37455104 | 86% | compress |
| landmarks | 196 | 313187204 | 53025380 | 83% | compress |
| panoramas | 32 | 28727380 | 3106360 | 89% | compress |
| town-buildings | 9 | 17901452 | 2573016 | 86% | compress |
| town-era-variants | 73 | 112127592 | 17922008 | 84% | compress |
| props | 58 | 64223844 | 2279968 | 96% | compress |
| rail-element | 1 | 35048 | 35048 | 0% | skip: Run3dPilot instances raw geometry without the node transform required by Meshopt quantization; preserve sleeper size and grounding until that consumer is fixed. |
| bosses | 10 | 38653740 | 5651116 | 85% | compress |
| finale | 2 | 7771872 | 577052 | 93% | compress |

## Retained shared loader routes

`Town3dViewer`, `Game` (Baron props), `SalvageClawBossSystem`, `HomemakerBossSystem`, `CrawlerBossSystem`, `E10FinaleSystem`, `OldDiggerBossSystem`, `DredgeQueenBossSystem`, and `entities/pools` (railcar). Existing tracked town/terrain/run loads also use `createGltfLoader(manager?)`; tracker behavior remains unchanged. These source edits are in the held predecessor, not newly reimplemented here.

## Explicit firewall blocker

**AD2-B1 — Homemaker kept-state reload calls an uninitialized WaveSystem.** `Game.ts:1095` constructs Homemaker in a field initializer. Its `restorePersistentKept()` at `HomemakerBossSystem.ts:481` calls `suppressBossSpawn()` at `:490`; the supplied callback at `Game.ts:1107` calls `this.waveSystem.suppressBaronForRun()`. The assignment to `waveSystem` occurs later in the constructor at `Game.ts:1476`. Saved Homemaker state therefore aborts game initialization with `TypeError: Cannot read properties of undefined (reading 'suppressBaronForRun')`, and `e6-boss-homemaker.spec.ts:227` times out waiting after reload.

The detached control is the exact pre-manifest parent **eb79d0c127d9c525508a6c4878041a370945069b**, recorded in `control-tree.json`, with unchanged source and the same unmodified test. It reproduces the same stack on both projects. This is independent of the GLB loader/fingerprint. Fixing game initialization or persistence callbacks is outside the task's construction-line-only source firewall. No workaround, simulation edit, or test weakening was applied.

The following eight failures were observed before the stop; **they are not all claimed to be inherited** because parent attribution was only completed for Homemaker:

- `e2e/contract-briefings.spec.ts:326` — every current contract launch shows manifest briefing goals and rules.
- `e2e/e10-static-boss.spec.ts:153` — recession hands the secured claim to the existing T10 re-inking finale.
- `e2e/e2-enemies.spec.ts:113` — wave pulses spawn Rail Toughs, Steam Wreckers, and Coal Thieves from E2 data.
- `e2e/e2-enemies.spec.ts:314` — same seed keeps the E2 roster wave deterministic.
- `e2e/e2-enemies.spec.ts:321` — E2 enemies survive the 200-stress draw-call envelope.
- `e2e/e2-trestle.spec.ts:60` — The Trestle unlocks after Hill Mine and runs the shipped crossing systems.
- `e2e/e6-boss-homemaker.spec.ts:126` — unbuilds, tidies, makes one chair, and remains kept without ever hurting the player.
- `e2e/e6-roster.spec.ts:79` — Lawn-Shepherd herd drive produces one same-seed toaster path.

## Named browser inventory and honest completion state

Re-grepped `e2e/` for all nine loader families. The inherited inventory was extended with `e10-static-boss.spec.ts` (loads Ark staging) and `run-cast-scale-up.spec.ts` (spawns a railcar). Census-only, ceremony audio, gazette copy, and the beauty file's comment-only finale matches do not exercise these loaders. No existing Town3dViewer drop-in test was found.

| Spec | Desktop | Mobile |
| --- | --- | --- |
| `e2e/lane-baron-props-detail.spec.ts` |  |  |
| `e2e/wire-railcar-3d.spec.ts` |  |  |
| `e2e/fix-e2-railcar-read.spec.ts` |  |  |
| `e2e/e2-enemies.spec.ts` | 3 passed, 3 failed, -6 not completed |  |
| `e2e/e2-trestle.spec.ts` | 1 failed, -1 not completed |  |
| `e2e/e2-incline.spec.ts` | 1 passed, -1 not completed |  |
| `e2e/wire-crawler-3d.spec.ts` |  |  |
| `e2e/e3-crawler-boss.spec.ts` | 4 passed, -4 not completed |  |
| `e2e/e5-boss-dredge-queen.spec.ts` | 4 passed, -4 not completed |  |
| `e2e/tp01-w6-migration.spec.ts` |  |  |
| `e2e/e6-boss-homemaker.spec.ts` | 1 failed, -1 not completed |  |
| `e2e/e6-roster.spec.ts` | 2 passed, 1 failed, -3 not completed |  |
| `e2e/e8-boss-salvage-claw.spec.ts` | 1 passed, -1 not completed |  |
| `e2e/e9-boss-old-digger.spec.ts` |  |  |
| `e2e/e10-finale-staging.spec.ts` | 1 passed, -1 not completed |  |
| `e2e/e10-static-boss.spec.ts` | 3 passed, 1 failed, -4 not completed |  |
| `e2e/run-cast-scale-up.spec.ts` |  |  |
| `e2e/contract-briefings.spec.ts` | 6 passed, 1 failed, -7 not completed |  |
| `e2e/mp-02-lockstep.spec.ts` |  |  |
| `e2e/town-t1-square.spec.ts` |  |  |
| `e2e/town-era-switch.spec.ts` |  |  |
| `e2e/town-stamp-mill-blender.spec.ts` |  |  |
| `e2e/town-dynamo-hall-blender.spec.ts` |  |  |

The dedicated town specs and several direct loader specs remain not completed because the inherited initialization defect triggered the task's explicit firewall STOP. The 170-case collection is preserved in `dev-collection.txt`; selectors are in `dev-specs.json`. Both harness configs use isolated, non-reserved ports (preview 5196, dev 5197; parent control 5198), and snapshots were never updated.

## Resume

Authorize/land the Homemaker initialization-order correction in its own scope, attribute the other observed reds, then rerun all 170 named adjacent cases and the unchanged asset-diet suite on the final merged tree. Preserve the lossless panorama policy and rail opt-out. Recompute the merged-tree era pin. **Do not treat the retained implementation as an all-green gate or deploy approval.**

Raw browser traces and intermediate captures are preserved under the existing ignored `test-results/` convention inside this artifact directory. `artifact-paths.json` maps original reporter paths to their retained locations; report JSON and logs retain their original test outcomes.

Gate-generated files outside this task folder were preserved under `generated/`, with original tracked bytes restored. `generated-evidence.json` records paths, sizes, and SHA-256 hashes. No prior evidence was discarded. The final rebuilt dist and fingerprint `1408f6b4` supersede the v1 stale-dist warning; the held v1 artifacts remain unchanged.

Final scope audit passed (`final-scope-audit.log`): retained lane HEAD, exactly the six authorized tracked paths including the task row, unchanged rail policy, current fingerprint/engine pin, and all 413 output sizes matching the final inventory.
