# Review: asset-diet-explicit-manifest (v1 + v2) — compression by manifest, one decoder everywhere (lane-a, codex runner on gpt-6-astra xhigh, attended drain 2026-09-05)

**Slice/branch/tip:** `asset-diet-explicit-manifest` v1 (`8020915ca`, an honest STOP with the implementation complete) + `asset-diet-explicit-manifest-2` (`a9b65b929`, BUILD-ON-PREDECESSOR: the three lifts) · base `eb79d0c12` · merge `3ef81a3a0` (no-ff; four unions).
**Verdict:** MERGED. F-ASTRA-3 cured: production GLBs 846,134,176 → 122,590,004 bytes (86% cut across 412 manifest GLBs; era variants 112.1 MB → 17.9 MB, props 64.2 → 2.3, bosses 38.7 → 5.7, panoramas 28.7 → 3.1, town buildings 17.9 → 2.6, finale 7.8 → 0.6; the rail element exempt with a reason).

## What it does
`scripts/asset-diet.manifest.json` assigns every emitted GLB to exactly one family and policy (unknown, uncovered or overlapping → the build fails before conversion); `scripts/asset-diet.mjs` selects by manifest, not prefix; `AssetLoading.createGltfLoader(manager?)` is the one meshopt-aware factory and the nine bare `new GLTFLoader()` sites (Town3dViewer, Game Baron props, six boss systems, the finale, the railcar pool) construct through it — `scripts/gltf-loader-usage-guard.test.mjs` refuses any other bare construction; the tracked loader keeps main's `SharedAtlasPlugin` registration on top of the factory (the merge union). v2's lifts: `vite.config.ts` fingerprints the manifest (proof `1408f6b4 → 528a29dc → 1408f6b4`), `deploy.sh` mirrors `scripts/asset-diet.manifest.json` to the droplet (one include line), and the era pin. v2 also fixed a panorama admission regression its gate found (count collapse in all 32 panoramas under the real shared loader; The Claim 1351 → 1344) — the old topology-only checker did not cover it.

## Evidence (merged tree `3ef81a3a0` + era pin `c552efe0`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` / `npm run build` | rc 0 / rc 0 (build prints the per-family byte table) |
| `scripts/gltf-loader-usage-guard.test.mjs` / `engine-era-guard` after the pin | 1/1 / 5/5 |
| `bash scripts/deploy.sh --dry-run` on the merged tree | rc 0: budget PASS, desktop 21,560,679 / mobile 20,266,688 of 25,000,000 (headroom 3.4 / 4.7 MB); top files the E1 loop mp3 1.80 MB, title theme 1.20 MB, Claim terrain 0.97 MB, town plate 0.88 MB, kit-era-1 png 0.51 MB; device verdict WARN |
| The 23 loader-family browser suites (drain port 5273, workers=1, quiet host) | 141 passed / 15 failed / 11 skipped (16.1 min). A CONTROL run of the eight red suites on `142e58215` (main immediately before this merge) fails the SAME tests (16 failed / 50 passed): nothing red is caused by this slice. Attribution: `e2-enemies` :113 (HP formula) and :314 (same-seed hash) + `town-t1-square` :74 + `mp-02-lockstep` @slow cases — inventory KNOWN-RED since 2026-08-11; `wire-crawler-3d` :115 and `wire-railcar-3d` :63 — exact renderer texture counts (40→39, 39→37, 37→35) moved by the shared-atlas dedupe → F-SAD-3; `town-stamp-mill-blender` :148 ("normal connections prefetch both bulk town halls") — moved by the bounded prefetch → F-PBW-2; `e6-boss-homemaker` :126 — the AD2-B1 reload crash (F-ADM-1); `e10-static-boss` :153 (`bank-secured-claim` never visible) — red on the control too and NOT in the 08-11 inventory → F-E10-1 |

## Merge classification (base `eb79d0c12`)
| File | Class | Resolution |
|---|---|---|
| `src/assets/AssetLoading.ts` | MAIN-MOVED (shared-atlas restructure) | union: main's tracker + atlas plugin, built on the lane's `createGltfLoader` |
| `package.json` | MAIN-MOVED | union of the single `run-node-guards` list (+ `gltf-loader-usage-guard.test.mjs`) |
| `assets/engine-era.json` | MAIN-MOVED | main's pins kept; merged-tree pin `c552efe0` appended in the drain commit |
| `tasks/BACKLOG.md` | MAIN-MOVED | union |
| `scripts/deploy.sh`, `src/game/Game.ts` | MAIN-MOVED, auto-merged | the one include line sits at `:264` after main's `asset-diet.mjs` include; Game's loader line applied cleanly beside the Lantern extraction |
| manifest, `asset-diet.mjs`, `vite.config.ts`, the nine loader sites, the guard, artifacts | LANE-TOUCHED / NEW | clean |

## Findings
- **F-ADM-1 (fire-authorable, bug on main):** AD2-B1 — Homemaker kept-state reload calls an uninitialized `WaveSystem`: `Game.ts:1095` constructs the Homemaker in a field initializer; `restorePersistentKept()` (`HomemakerBossSystem.ts:481`) calls `suppressBossSpawn()` (`:490`) whose callback reaches the not-yet-constructed wave system. Reproduced by the runner on the pre-manifest parent `eb79d0c12` in both projects (`homemaker-control.log`). Player-facing on a reload with kept state; fix the initialization order in its own slice.
- **F-ADM-2 (non-blocking):** four worker-emitted GLB copies (crawler, Dredge Queen, Homemaker, railcar) use Vite's worker naming and carry no diet suffix; unchanged here.
- **F-ADM-3 (non-blocking, watch):** the first-town cue-window bytes rose from 15.4/17.0 MB (probe run, before the manifest and bounded prefetch) to 21.6/20.3 MB on this tree; headroom under the 25 MB verdict is now 3.4 MB on desktop — the survey should say which of the two changes moved it.
