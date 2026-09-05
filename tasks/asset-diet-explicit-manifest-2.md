# Task asset-diet-explicit-manifest-2: land the manifest with its cache fingerprint, its mirror include and its era pin (LANE-A, commit prefix "fix:") — v2, BUILD-ON-PREDECESSOR

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/a`).
READ FIRST: AGENTS.md; `artifacts/asset-diet-explicit-manifest/report.md` on the lane (v1's STOP: the implementation is COMPLETE and retained in the lane's held commit `8020915ca` — manifest, shared `createGltfLoader`, nine loaders routed, the loader guard 1/1, the manifest checker 5/5, tsc clean — and blocked ONLY on three couplings outside v1's firewall, quoted below); `tasks/asset-diet-explicit-manifest.md` (v1, scope unchanged); `vite.config.ts:23-27` (the asset-diet cache fingerprint hashes only `scripts/asset-diet.mjs` + `package-lock.json`); `public/_headers:2` (assets cached immutably for a year); `scripts/deploy.sh:196` (the droplet mirror's positive allowlist admits `scripts/asset-diet.mjs` and then closes); `scripts/assay-replay-agent.mjs:36` (`src` is in the engine-hash corpus) and `scripts/engine-era-guard.test.mjs:34`; `src/game/Run3dPilot.ts:190` (instances `source.geometry` while discarding the GLB node transform — the rail-sleeper regression v1's review reproduced; v1 exempted the rails in the manifest with a reason: keep that).
CODEX: model=gpt-6-astra effort=xhigh
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/DIST-IS-STALE.txt
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/baron-bake-check.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/baseline-build.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/baseline-inventory.json
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/build.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/candidate-manifest.json
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/check-baron-bake.mjs
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/check-built-models.mjs
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/check-manifest.mjs
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/codex-review.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/engine-era-guard.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/install.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/loader-guard.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/manifest-check.log
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/playwright.config.ts
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/report.md
EXPECTED-HOLDS: artifacts/asset-diet-explicit-manifest/typecheck.log
EXPECTED-HOLDS: package.json
EXPECTED-HOLDS: scripts/asset-diet.manifest.json
EXPECTED-HOLDS: scripts/asset-diet.mjs
EXPECTED-HOLDS: scripts/gltf-loader-usage-guard.test.mjs
EXPECTED-HOLDS: src/assets/AssetLoading.ts
EXPECTED-HOLDS: src/entities/pools.ts
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/systems/CrawlerBossSystem.ts
EXPECTED-HOLDS: src/systems/DredgeQueenBossSystem.ts
EXPECTED-HOLDS: src/systems/E10FinaleSystem.ts
EXPECTED-HOLDS: src/systems/HomemakerBossSystem.ts
EXPECTED-HOLDS: src/systems/OldDiggerBossSystem.ts
EXPECTED-HOLDS: src/systems/SalvageClawBossSystem.ts
EXPECTED-HOLDS: src/town/Town3dViewer.ts
EXPECTED-HOLDS: tasks/BACKLOG.md
Pre-flight (BUILD-ON-PREDECESSOR, F-2089-1): the lane IS ahead of main by exactly one runner commit, `8020915ca` (`runner(lane-a): asset-diet-explicit-manifest.md`), and that commit is YOUR BASE — do NOT reset, do NOT `git checkout -B lane/a main`, do NOT discard it. Verify `git log --oneline main..lane/a` shows exactly that one commit; if it shows anything else, STOP and report. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Cleanliness line: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (v1 STOP, gpt-6-astra, 2026-09-05 — its own words: "Requested follow-up scope: allow `vite.config.ts`, the exact manifest include in `scripts/deploy.sh`, and the same-era pin in `assets/engine-era.json`; retain the rest of the firewall." Owner, same day: "lets have it fix these findings. This is important stuff.")
v1's three couplings, each verified attended: (1) the loader edits rotate the engine hash (`869f3451…` → `977ef6b7…`) and the era guard refuses an unrecorded hash — a same-era pin (F-1441-3) is the lawful answer, which every drain this week appended; (2) `vite.config.ts:23-27` fingerprints only the script and the lockfile, so a `compress` change in the manifest would ship new bytes under an unchanged immutable URL; (3) the droplet mirror must carry the manifest once Vite reads it (`deploy.sh:196`). All three are one-line class edits; this v2 authorises exactly them.

## Scope
1. **Manifest, not prefix:** `scripts/asset-diet.manifest.json` lists every production GLB family by path pattern (terrain, landmarks, panoramas, town buildings INCLUDING `.eN` era variants, props, bosses, finale) with `{ compress: true|false, reason }`; the script FAILS when a dist GLB is covered by no entry (unknown is red, never skipped).
2. **One loader everywhere:** export a shared meshopt-aware loader factory from `AssetLoading.ts` (keep the tracker semantics) and route the nine bare call sites through it (the construction line only); `scripts/gltf-loader-usage-guard.test.mjs` fails on any `new GLTFLoader(` outside `AssetLoading.ts`; add it to `package.json`'s `test:node-guards` file list (ONE `run-node-guards.mjs` invocation — append to the existing list).
3. **Extend compression** to era variants, panoramas, boss/prop/finale GLBs now that every loader decodes; print a before/after byte table per family in the build log and in the report.
4. **Tests:** `asset-diet.spec.ts` unmodified-green (the screenshot tolerance is the visual proof); every e2e that loads one of the nine GLBs green (grep `e2e/` for each boss/finale/railcar spec and NAME them); the town e2e green; both projects.


8. **The three lifts (🔓 FIREWALL LIFT):** (a) `vite.config.ts:23-27`: add `scripts/asset-diet.manifest.json` to the fingerprint hash; (b) `scripts/deploy.sh`: add `"--include=/scripts/asset-diet.manifest.json"` immediately after the `asset-diet.mjs` include at `:196` — that ONE line, nothing else in that file (a main-slot task is editing other parts of it; keep your hunk minimal so the drain's 3-way stays trivial); (c) `assets/engine-era.json`: append ONE era-5 pin (`pins[]` + top-level `engineHash`) with a cause naming this task, exactly like the last pins.
9. **Prove the fingerprint:** flip one manifest `compress` value in a scratch copy → the built asset URLs change (hash suffix); flip it back → identical URLs; record both in the report.

## Firewall
Touch ONLY: everything v1 touched (already in your base), plus `vite.config.ts` (the fingerprint lines only), `scripts/deploy.sh` (the ONE include line), `assets/engine-era.json` (one appended pin), `artifacts/asset-diet-explicit-manifest-2/**`, `tasks/BACKLOG.md` (your row). NO changes to: asset files, geometry/texture content, the sim, `scripts/deploy.sh` beyond the one line, `public/_headers`.

## No-op / honesty guard
v1's implementation is done; this run is the three lifts, the fingerprint proof and the full gate. If you find yourself about to exit without changes, WRITE WHY into your report first.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green with the byte table per family; `node --test scripts/gltf-loader-usage-guard.test.mjs` and `scripts/engine-era-guard.test.mjs` green; `e2e/asset-diet.spec.ts` unmodified-green both projects; every e2e that loads one of the nine routed GLBs green (NAME them); the fingerprint proof; report in `artifacts/asset-diet-explicit-manifest-2/report.md`.
End: READY-FOR-GATES + the byte table per family, the loaders routed, the fingerprint proof, the pin.
