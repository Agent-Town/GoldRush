# Independent Lantern world reel

Task: lantern-true-world-reel-2. Implementation complete; adjacent-gate triage in progress, 2026-09-05.

Preflight: lane/c at 33999b560 (archive: pruned by the A3 rewrite), 0 ahead / 28 behind main, clean. No resets or evidence discards required. npm install --no-audit --no-fund and npm run build passed. Post-build git status --short was empty.

Implementation reuses the worker's stageReplayContract-before-dynamic-import ordering. Terrain remains page-global; the watch route must enter a fresh page when coming from an already mounted scene. Legacy input tapes retain their Game replay path.

Exploratory gate runs were interrupted for source corrections; Vite HMR caused execution-context loss in the first run. Their `gates.log` / `final-gates.log` are retained as partial evidence, not final verdicts. `verified-gates.log` is the frozen-source gate run. The focused regression also saw a transient desktop page reload immediately after source changes; both projects subsequently passed without source changes.

## Extraction and ownership

- `LanternController` owns agent replay classification, era refusal, worker lifecycle, fixed-tick pacing through the existing `Loop`, pause, speed, restart, wave skip, and LanternShow updates. Game and the independent boot use this same class. The legacy input-log replay still belongs to Game. There is still no backward scrub (the ratified TAPE-02 semantics explicitly park it).
- `LanternBoot` stages the contract with `stageReplayContract` before dynamically importing `LanternWorldStage`, matching `BrowserAgentTapeWorker`. It probes WebGL before constructing a renderer. A no-WebGL browser still mounts LanternShow and replays through the worker.
- `LanternWorldStage` constructs the game's renderer, exported painted bank/river/fords, a minimal terrain-pilot Host, LightRig, CameraRig, GeneratedSpriteBatch pools, GoldPickupPool, and Vfx float texts. The pilot owns GLB terrain, panorama, sculpt water and authored landmarks. Scatter/decorative props are not constructed. The stage never constructs Game, RunManager, input, or a simulation.
- Sprite positions interpolate between authoritative snapshots and use Terrain.visualY. Missing sprite kinds retain an explicit placeholder disclosure. The fixed camera fits the contract bounds using a small CameraRig helper.
- Shelf agent tapes cross a fresh-page boundary using a one-shot sessionStorage handoff. This also supports local-only tapes. Closing the independent view reloads town/menu after restoring replay storage, so a subsequent contract cannot inherit its captured Terrain/TileHeight globals. No Terrain or TileHeight refactor was made.
- Tactical mode survives both URL rebuilds. Lite displays the labelled tactical SVG while constructing the canonical painted fallback, with no GLB load. No-WebGL uses the same labelled SVG with no renderer. All independent-reel SVGs receive Terrain.sampleHeight. Stage-less catalog/legacy previews retain their prior analytic estimate; a descriptor-local Terrain API remains the next slice if those previews must lose that estimate too.
- The minimal pilot Host deliberately has no live rush, boiler, or night callbacks. LightRig separately receives snapshot-derived contract wave/time lighting and the available hero, beacon and lantern sources on contracts without a power grid. Missing power connectivity, rider light-duty, enemy lantern flags, rush/boiler effects and sub-wave timing are not invented from absent snapshot fields. Night keyframes advance at snapshot wave granularity; time-based cycles use the existing DayNightCycle.

## Independent review

`codex review --uncommitted` found two P2s; both are fixed and covered by a browser regression in the new spec:

- Work indexes are per family. The stage now keys each work by family plus index, so stationary sentry 0 and sluice 0 cannot interpolate from each other's coordinates or replace each other.
- Night Shift previously stayed in daylight. The stage now calls LightRig.setNightShift with contract lighting. At wave 11 the regression observes darkness 1, a zero-intensity sun and three physical light sources from the supplied hero/beacon/lantern snapshot.

The same regression verifies a moving pickup's halfway position and one floating amount. No simulation, replay worker, hash, Terrain or terrain-pilot source changed. Palette interpolation remains local to this read-only stage because the equivalent Game helper is private and moving general gameplay lighting is outside this extraction's firewall.

## Assertion changes

In `reel-deep-links.spec.ts`, the default plain-watch SVG terrain visibility assertion now requires the visible world canvas. The former water-descendant count assertion, and the SVG terrain visibility check, run after navigating to the explicit `reel=tactical` variant. The rest of that test and the other four requested adjacent suites are unchanged.

## Validation status

`npx tsc --noEmit`, `npm run build` (including asset diet), and `git diff --check` pass. The unchanged-source full browser run finished **36 passed / 6 failed**. All nine new mobile tests passed; the one new desktop failure was its performance measurement during the concurrent production build. An isolated rerun of that exact test passed with no code changes. The new spec therefore has passing evidence for **18/18** desktop/mobile cases. Production preview on port 5294 also passed: Signal contract/tile, mounted GLB, actual sprite instances, no Game chunk requested, zero console/page errors (`production.json`, `production.log`, `production-signal.png`).

| Reel budget | Mounted game p95 | Reel p95 | Reel / game | Limit |
| --- | ---: | ---: | ---: | ---: |
| Desktop, isolated rerun | 10.8 ms | 11.0 ms | 101.9% | 115% |
| 390px Chromium | 21.2 ms | 8.7 ms | 41.0% | 115% |

The failed overlapping desktop measurement (17.3 / 32.6 ms, 188.4%) remains in `verified-gates.log` and `build-overlap-desktop-perf.json`; it is not silently replaced. The isolated pass is in `isolated-perf.log` and `desktop-chrome-perf.json`. All new functional tests collect console/page errors and passed those assertions. The unchanged stress and worker-hash suites passed on both projects, and all deep-link tests passed on both projects.

The remaining full-run failures are in unmodified tests. The HEAD comparison finished **3 passed / 3 failed**: both old terrain-budget tests time out identically, the desktop terrain-consumer assertion differs by 0.0214 in height, both legacy shelf cases pass, and the mobile terrain-consumer case passes. A fresh candidate server then passed both mobile legacy/consumer cases; its desktop legacy case still emitted a blob-texture error and its desktop consumer case timed out after teleport. These mixed results are retained; this task does **not** claim an all-green adjacent battery. HEAD source bytes were compared to git in `baseline-source.json`; the archive shares unchanged assets/dependencies and uses an isolated Vite cache. The temporary harness's serving-path/config setup attempts are retained separately and are not baseline evidence. No assertions were relaxed.

### F-LTW2-1 — inherited terrain-budget harness deadlock (confirmed)

`e2e/terrain3d-claim-pilot.spec.ts:169` replaces one `release` closure every time a matching request arrives. On both HEAD and the candidate, two requests for `the-claim-terrain.glb` are held. Line 173 releases only request 1; request 0 stays blocked, so line 174 cannot observe `ready`. The bounded `readiness-probe.mjs` reproduces this on each source tree: one remaining held request, state `loading`; release the remainder, state `ready`. See `readiness-probe.json` and `.log`.

The next slice should let that harness release every held match (and later matches) or distinguish the renderer request from prefetch. That existing test is explicitly immutable here. Neither the original test nor AdvanceStream/terrain loading was changed to manufacture a green.

### F-LTW2-2 — timing-sensitive pre-existing consumer/texture gates

The unchanged terrain-consumer test is red on HEAD at a height assertion and red on the candidate at a teleport wait, but each also has passing runs. Its assertions observe rendered/interpolated coordinates on a live simulation. The shelf test completes its playback/hash/storage/control assertions before failing its final console-error assertion on blob texture loads. The same class of aborted-on-unload texture failure is already recorded as F-2320-1 in STATUS.md; the candidate's mobile case passed on a fresh-server rerun, while HEAD's two shelf cases passed. A traced desktop comparison remains pending. This is not evidence that those races are fixed, nor permission to weaken their assertions.

Screenshots were inspected: `desktop-chrome-{claim,signal,no-webgl}.png`, `mobile-chrome-{claim,signal,no-webgl}.png`, and the production Signal shot. The 390px canvas is 62% of the viewport height and the framing disclosure starts closed.

Reproduce the requested browser gates on a dev server at an unreserved port (this run uses 5189):

```sh
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5189 npx playwright test e2e/lantern-true-world.spec.ts e2e/reel-deep-links.spec.ts e2e/tape-02-lantern-show.spec.ts e2e/true-reel-harness.spec.ts e2e/terrain3d-claim-pilot.spec.ts e2e/perf-01-stress-budget.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --trace=off
```

The mobile project is 390 × 844 Chromium emulation. Test tapes are the existing Claim control (`artifacts/eh3-fixture/tape.json`, expected `fnv1a32:5df74748`) and Signal's Relay Rush recording (`artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json`). As in the existing deep-link test, only their in-memory engine-era metadata is stamped for the current build; orders, recorded hashes and on-disk fixtures stay unchanged. The Claim hash is checked through both the independent watch boot and Game's shared controller.

The remaining contract-locality boundary is explicit: `Terrain.ts:78` / `:80` and `TileHeight.ts:4` still capture a single page-global contract/tile. The independent route stages before import and changes pages when necessary. Simultaneously showing multiple contracts in one JS realm would require a later descriptor-local Terrain/TileHeight API; it is not emulated here by changing globals after import.
