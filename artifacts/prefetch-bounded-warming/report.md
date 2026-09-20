# Bounded advance-stream warming

Status: **READY-FOR-GATES**. Implementation, build, typecheck, and all 28 required browser cases verified across final runs and the disclosed isolated retries. The protected adjacent specs remain unchanged; their timing sensitivity is recorded below.

## Scope and decisions

- Normal plans retain priorities 1 and 2 only. The existing destination ordering is unchanged.
- The former E1/all-board sweep requires the persisted **Warm every map** opt-in in `src/ui/menu/StartMenu.ts` (Start Menu → Settings, beside Performance). This is the single UI firewall lift. Save Data still restricts to priority 1; Lite and terrain2d still disable 3D prefetch.
- This slice implements the explicit setting alternative (scope 3a). It adds no automatic score-screen deep warming.
- Allowance: **24,000,000 bytes** for Full desktop, **12,000,000 bytes** for Balanced or a coarse-pointer/mobile device. Lite remains disabled. Decimal MB, not MiB.
- Every successfully completed fetch contributes its measured response body size, including cached responses and completion during a scene transition. The counter survives menu/profile/scene changes and reloads in the same tab through sessionStorage; blocked storage retains in-page accounting.
- The canvas publishes `assetPrefetchAllowance` and `assetPrefetchBytes`. `assetPrefetchState=budget-exhausted` means no new batch starts. At most the already-issued two-file batch can finish past the threshold; this is a scheduling allowance, not a hard response-size limit. Failed or aborted bodies do not count as completed prefetches.
- Switching the opt-in replans the active scene without resetting the counter or completed-URL set. A paused stream stays paused. Disposal removes the settings listener.

## Allowance evidence

Runtime `townPrefetchUrls` and `contractPrefetchUrls` resolved 43 target sets (Town plus 42 board contracts). `resolved-urls.json` freezes those lists. `measured-sizes.json` records 247 distinct assets, their measured dev HTTP body bytes/content-length, and stat-measured sizes in the completed, dieted build. Reproduce with `node artifacts/prefetch-bounded-warming/measure-sizes.mjs http://127.0.0.1:5176` after a build and a dev server on that port.

Town + The Claim = **7,910,892** built bytes; Town + Dry Gulch = **8,650,528**. The largest single contract is Gusher County at **5,940,192** built bytes. Thus 12 MB covers the measured initial pair and even Town plus that largest contract (10,911,380 bytes); 24 MB leaves desktop headroom for relevant later navigation. The complete unique inventory is **116,976,888** built bytes (**585,316,952** dev body bytes), so a two-at-a-time unrestricted sweep is materially larger. Shared URLs are counted once in the inventory, and once per live stream after completion.

The dev server serves undieted originals: Town alone is 18,049,588 bytes. Dev-mode budget exhaustion can therefore precede Town completion on mobile. The renamed Save Data test uses small responses and requires ready, isolating the priority filter from the byte allowance. Production asset-diet gates run on the built bundle.

The board's immediate successor after The Claim is the Drill Yard, which has no registered 3D prefetch URLs. The bounded test uses the Drill Yard run scene to exercise the next asset-bearing successor, Dry Gulch. Contract ordering and registries are outside this slice and remain unchanged.

## Measured per-target bytes

| Target | Files | Dev body bytes | Dieted build bytes |
|---|---:|---:|---:|
| town | 12 | 18049588 | 4971188 |
| the-claim | 7 | 18573344 | 2939704 |
| e1-drill-yard | 0 | 0 | 0 |
| e1-dry-gulch | 7 | 19394852 | 3679340 |
| e1-night-shift | 7 | 16433696 | 1845888 |
| e1-twin-banks | 7 | 19420128 | 3308648 |
| e1-baron | 7 | 17629212 | 2474160 |
| e2-hill-mine | 7 | 15781984 | 2790908 |
| e2-trestle | 8 | 17085544 | 2757804 |
| e2-pressure-garden | 7 | 16099364 | 2777308 |
| e2-incline | 7 | 16270360 | 3031220 |
| e3-blackout-ridge | 7 | 17281164 | 3639428 |
| e3-moth-season | 7 | 17030744 | 3323056 |
| e3-canyon-works | 7 | 17134760 | 3614996 |
| e3-fairground | 7 | 17455520 | 3635000 |
| e4-dust-flats | 7 | 18170432 | 4036408 |
| e4-long-road | 7 | 18361108 | 4432608 |
| e4-gusher-county | 12 | 25950892 | 5940192 |
| e4-boneyard | 14 | 27376196 | 5539992 |
| e5-deepwater-claim | 2 | 10095416 | 2716436 |
| e5-regatta | 10 | 22433812 | 4151984 |
| e5-stillwater | 2 | 10095416 | 2716436 |
| e5-flotilla | 2 | 10095416 | 2716436 |
| e6-glow-mesa | 7 | 21020224 | 4219904 |
| e6-showroom | 7 | 17774000 | 4438668 |
| e6-half-life-hollow | 7 | 17835036 | 4282528 |
| e6-picnic | 7 | 21020224 | 4219904 |
| e7-relay-valley | 7 | 17649012 | 4013688 |
| e7-echo-canyon | 7 | 17316260 | 3560796 |
| e7-dead-band | 7 | 17649012 | 4013688 |
| e7-relay-rush | 7 | 17649012 | 4013688 |
| e8-mare-claim | 7 | 13685268 | 2261880 |
| e8-far-side | 7 | 13685268 | 2261880 |
| e8-low-orbit | 7 | 13046252 | 2901784 |
| e8-eclipse | 7 | 13685268 | 2261880 |
| e9-dome-basin | 7 | 17793376 | 3705504 |
| e9-seed-run | 7 | 17353020 | 3386424 |
| e9-devils-alley | 7 | 17385720 | 3331348 |
| e9-old-canal | 7 | 16788996 | 3244396 |
| e10-ember-shore | 7 | 14627864 | 2493784 |
| e10-archive-world | 7 | 17013808 | 3529916 |
| e10-last-claim | 0 | 0 | 0 |
| e10-river | 0 | 0 | 0 |

## Preflight

- Branch `lane/b`; no ahead commits and no pre-existing edits. No reset or cleanup needed.
- `npm install --no-audit --no-fund`: passed; no tracked dependency changes.
- `npm run build`: passed before source edits (`preflight-build.log`).
- Post-install/build `git status --short`: empty. No factory churn discarded at preflight.
- The cited Astra review is absent from the lane snapshot; read F-ASTRA-5 from `/Users/robin/Claude/Projects/Gold Rush/docs/reviews/2026-09-05-astra-3d-review.md`.

## Test changes

- Renamed: “saveData keeps tier one and skips bulk contract maps” → “saveData keeps tier one with the full-map opt-in and skips bulk contract maps”. Small mocked responses keep it under budget; ready plus no contract requests proves Save Data precedence with the full-map opt-in enabled.
- Added: “normal mode stops after the successor and honours the byte allowance”; “the warm-every-map opt-in restores the sweep”; “balanced uses the smaller allowance and completed URLs are counted once across replans”.
- Lite also runs with the opt-in on. All advance-stream tests collect console/page errors.
- The launch-abort test now reaches the tavern with the existing `TownDiagnostics.teleport` helper and the live building approach, as other scene tests do. Fixed 850 ms key holds missed the tavern under host load (desktop and mobile evidence retained). Its blocked-prefetch barrier and demand-before-release assertions are unchanged. No title change for this test.
- `advance-stream-cache-reuse.spec.ts`, `advance-stream-walkthrough.spec.ts`, and `asset-diet.spec.ts` are unchanged.

## Independent review

`codex review` ran read-only, on the task model (gpt-6-astra, xhigh), and established no definite new runtime defect. It identified two test weaknesses; both were accepted and fixed:

1. Save Data previously could pass because the byte allowance stopped Town. Its fixture now uses 37-byte responses and requires `ready`, isolating the priority filter.
2. One-byte budget fixtures could mistake a file counter for a byte counter. The fixture now uses 37-byte bodies, asserts exact byte totals, and crosses the allowance 73 bytes into the final two-file batch.

Raw findings: `codex-review.log`. No findings were dismissed.

## Validation

- `npx tsc --noEmit`: passed (`tsc.log`, empty output).
- Final strengthened multi-byte checks: 4/4 passed desktop + mobile in `dev-gates.log`. The earlier one-byte run is retained in `bounded-tests.log` for provenance.
- Initial development run found a fixture assumption about the Drill Yard ordering and a host-load import timeout. The assumption was fixed. That run was interrupted after two failures; its logs remain in `advance-stream-tests.log` and `test-results/`.
- `npm run build`: passed (`build.log`); only the existing chunk-size warnings. The source implementation did not change after this build.
- Final `npx tsc --noEmit`: passed after the navigation fixture update (`tsc-final-navigation.log`). Earlier extended diagnostics are retained in `tsc-final.log`.
- Final development pass (`dev-gates.log`): 20 passed / 2 failed. All 16 changed advance-stream cases passed on both projects; both unchanged walkthrough cases and both mobile cache-reuse cases passed, with their zero-error assertions. The desktop cache dev arm missed the tavern with its unchanged 850 ms walk; production then failed because the dev result was unavailable after the worker restarted. The unchanged desktop pair then passed **2/2** in a serial retry with no build/typecheck in parallel (`cache-desktop-retry.log`, 27.2 s dev / 31.9 s production). Both original cache-reuse cases therefore passed on both projects. The timing-sensitive helper remains unchanged in this adjacent suite, as required.
- The cache-reuse suite reuses the already verified dieted build through its own per-runner `.lock.ready` cache. The temporary marker is written for that CLI PID before loading Playwright and removed on process exit. This avoids building during measurements; source, route interception policy, production headers, and assertions are unchanged. Standalone default suite invocation remains supported and performs its own build.
- Settings screenshots were inspected at desktop and mobile; the native checkbox and disclosure fit in the existing scrollable panel.
- Built asset-diet first run: **5/6 passed**, including all mobile cases, both screenshot comparisons, and both loading-cue cases (`asset-diet-tests.log`). No console/page errors; the existing watcher reported zero suppressed GLTF errors. Reused the verified build with `GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1`, `playwright.preview.config.ts`, both Chromium projects, one worker.
- The failed desktop comparison is `e2e/asset-diet.spec.ts:466`: it asserts Save Data cue-window bytes <= normal cue-window bytes. The samples stop at the first loading-ready observation (`:287–289`), separately from the settled capture. First-run desktop values: normal **9,326,887**, Save Data **16,343,695**; settled values: normal **32,042,462**, Save Data **29,457,666**. Mobile passed the same assertion with cue-window values **19,298,607 / 16,042,917**, while its settled totals were identical to desktop. The protected spec's own comments (`:457–460`) document cue-window variability. These measurements establish an early-window ordering failure, not a larger settled Save Data transfer.
- The isolated, unchanged desktop retry passed **2/2** (`asset-diet-desktop-retry.log`): cue-window normal **18,666,466**, Save Data **9,371,549**; settled totals remained **32,042,462 / 29,457,666**. The cue test itself measured **11,338,053** bytes against the 25,000,000 ceiling. All six required asset-diet cases have now passed across the original run and retry. First-run measurements remain in `asset-diet-first-run/`; latest results are in `asset-diet-final/`.
- This is not a claim of a flake-free single sweep: desktop cache navigation and the desktop asset-diet early-window comparison needed isolated retries. No protected assertion was changed or suppressed. The latter's settled totals stayed identical across the failing desktop, passing mobile, and passing desktop retry, while early-window order changed. Future gates should preserve this evidence if the timing-sensitive assertion fails again.
- The allowance counts prefetch response bodies only. Asset-diet's all-request transfer totals include foreground assets and are a different quantity.


## Final handoff

| Required checks | Final case coverage | Evidence |
|---|---:|---|
| Advance-stream behavior and byte accounting | 16/16, desktop + 390px mobile | `dev-gates.log` |
| Unchanged cache reuse | 4/4 across final mobile pass and isolated desktop pair | `dev-gates.log`, `cache-desktop-retry.log` |
| Unchanged walkthrough | 2/2 | `dev-gates.log` |
| Unchanged built asset diet | 6/6 across first run and isolated desktop retry | `asset-diet-tests.log`, `asset-diet-desktop-retry.log` |
| TypeScript | passed after the final test edit | `tsc-final-navigation.log` |
| Production build | passed, application source unchanged afterward | `build.log` |

All successful cases passed their console/page-error assertions. Screenshots: `settings-desktop-chrome.png`, `settings-mobile-chrome.png`; the unchanged asset-diet screenshot gates also passed. The independent review's two test findings were fixed; no runtime finding remains open from that review.

Changed application files: `src/assets/AdvanceStream.ts`, `src/ui/menu/StartMenu.ts`. Changed tests: `e2e/advance-stream.spec.ts`, new `e2e/advance-stream-bounded.spec.ts`. No sim, contract data, loader, STATUS, specs, reviews, or backlog edits; no commits. The one renamed test is listed above. The runner/orchestrator owns integration.

Generated cache/walkthrough outputs were preserved in `adjacent-reports/`, then the six original `artifacts/advance-stream-*.md` paths were restored. Generated asset-diet outputs were preserved in `asset-diet-final/`, then these original paths were restored to keep the task firewall clean:

- `artifacts/asset-diet/desktop-chrome-claim-throttled.png`
- `artifacts/asset-diet/desktop-chrome-town-throttled.png`
- `artifacts/asset-diet/mobile-chrome-claim-throttled.png`
- `artifacts/asset-diet/mobile-chrome-town-throttled.png`
- `artifacts/asset-diet/town-budget-desktop-chrome.md`
- `artifacts/asset-diet/town-budget-mobile-chrome.md`
- `artifacts/asset-diet/town-transfer-desktop-chrome.json`
- `artifacts/asset-diet/town-transfer-mobile-chrome.json`
