# perf-correctives-batch — the four measurements

Scratch worktree, Claude Opus 5 implementer, 2026-09-07. Branch `feat/perf-correctives-batch`,
base `e6c52b296` (current main). Ports: dev/playwright 5306, preview 5293. Node v26.4.0 for the
guards, playwright `--workers=1 --trace=off --reporter=line`, both projects.

Engine hash: base `3f86a89c6f2eb1df83007465cbe43e39a41971593e6ee8b7ddee45637cc67d0f` (which is
exactly what `assets/engine-era.json` pins today) -> this tree
`d2f03881011e54afa074efa2667a3e34cd463ee9fb494e274f0f55ebf57b1895`. `src/` moved in three files;
the drain pins the new value. No sim change: the three files are asset-table plumbing and a
diagnostics read.

## 1. F-CELL-4 — the presence-probe globs

`npm run build` (dev variant), `dist/assets`:

| Quantity | Before | After |
|---|---:|---:|
| per-cell JS modules (`*-r<row>c<col>-<hash>-diet-<fp>.js`) | **79** | **0** |
| — from `src/entities/pools.ts` (char-e6..e9 sheets) | 72 | 0 |
| — from `src/world/Terrain.ts` (`ter-rail-elements-r0c0..r0c6`) | 7 | 0 |
| JS chunks total | 424 | 345 |
| PNG assets | 2,585 | 1,347 |
| PNG bytes | 229,950,444 | 133,474,180 |

The PNG drop is F-CELL-5's doing, not this item's: 2,585 - 1,347 = 1,238 = the 1,231 un-dieted
worker duplicates + the 7 never-wired rail cells.

Release build unchanged by this item: per-cell JS was already 0 there (the release rewrites all four
pools patterns to a no-match path), and it stayed 0.

## 2. F-CELL-5 — the tape worker's second build pass

The worker build config is **`vite.config.ts`**, in a new top-level `worker: { plugins,
rollupOptions }` block. There is no worker sibling config; Vite bundles
`src/replay/BrowserAgentTapeWorker.ts` in its own Rollup pass which inherited neither `plugins` nor
`build.rollupOptions.output`.

`GR_RELEASE=e1 npm run build`, `dist/assets`:

| Quantity | Before | After |
|---|---:|---:|
| un-dieted PNGs | **1,231** | **0** |
| un-dieted PNG bytes | **96,097,301** | **0** |
| PNGs total | 2,114 | 883 |
| PNG bytes total | 176,339,200 | 80,241,899 |
| files total | 2,381 | 1,146 |
| JS chunks | 135 | 135 |
| worker chunk bytes | 2,051,610 | 1,792,886 |
| emitted families ADDED by the change | — | **0** |

Content, not just size: on the before build `npm run build:release` failed at
`scripts/assert-release-build.mjs:16` with *"later epoch manifest id in
assets/BrowserAgentTapeWorker-CNYbceCk.js"* — the E1 narrowing never reached the worker's module
graph. That failure is gone. See finding F-PERFC-1 for the second, older `build:release` failure it
was masking.

Worker still replays a tape:
- dev server (5306), both projects: `tape-01-run-tape` + `ap16-6-browser-seat` + `beauty-town` +
  `mu-02-music` + `music-survives-pause` — **30 passed**.
- release e1 bundle through `playwright.preview.config.ts` (5293), both projects:
  `tape-01-run-tape` + `ap16-6-browser-seat` — 12 passed / 2 failed, both
  `tape-01-run-tape.spec.ts:140`, and **the same two fail identically on a control build of the base
  sources** (F-PERFC-2). Green on the dev harness.

## 3. F-CELL-6 — the post-cure corpus and the allowlist

Corpus refreshed with the deploy's own instrument shape (`scripts/deploy.sh:95-110`):
`GR_PREVIEW_PORT=5293 GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1 playwright test --config
playwright.preview.config.ts e2e/asset-diet.spec.ts --workers=1 --project=desktop-chrome
--project=mobile-chrome --grep "town cue-window budget through player entry$"` — 2 passed.

| Quantity | desktop before | desktop after | mobile before | mobile after |
|---|---:|---:|---:|---:|
| cue-window responses | 473 | 270 | 475 | 270 |
| distinct families | 106 | 82 | 108 | 82 |

Struck from the allowlist (23 rows): the twenty `char-*-sheet-*.js` cell-URL families,
`rolldown-runtime.js`, `title-theme.js`, `title-theme.mp3`.

| Guard run | Corpus | Result |
|---|---|---|
| `first-town-request-families` | refreshed (committed) | **4/4 pass** |
| `first-town-request-families` | pre-cure copy (`town-transfer-*-precure.json` here) | **1 fail** — 23 unpinned families per project |

Not struck, with the measurement replacing the prediction in the file: `era-e1-frontier-loop.js` +
`.mp3` are still inside the RECORDED window on both projects (the window's end is CDP-polled with
~500 ms of skirt, F-AUDIO-4, and the loop lands 26-195 ms after playable); the advance-stream
residue pair likewise; `scripts.js` left only because the virtual ceremony module changed chunk name.

## 4. F-AUDIO-2 — the loop clock, and mu-02's red

`SoundSystem.diagnostics()` now defines `loopElapsedSeconds` as an enumerable getter reading the
audio context at read time. Chosen over "assert `startedBySound` instead": ~5 lines of code against
~4 lines of deletion, and the deletion would remove the only evidence either spec has that the
loop's clock advanced while leaving every other reader of `window.__GR_AUDIO_DIAGNOSTICS__` frozen.

| Run | Before | After |
|---|---:|---:|
| `mu-02-music` + `music-survives-pause`, both projects, port 5306 | 6 passed / **2 failed** | **8 passed / 0 failed** |

The new assertion in `music-survives-pause.spec.ts` holds ONE published object across a 600 ms wait.
Control: with the getter frozen at publish time (the old behaviour) it fails —
`expect(clock.second).toBeGreaterThan(clock.first)` — so it bites.

mu-02's `Received array: []` red (2 of 2 projects) was **NOT the snapshot and NOT the F-AUDIO-3
music hold**. Probe (`probe.spec.ts` here, 24 samples over 10 s): frame 908, `runState "playing"`,
`audio.unlocked false`, `audio.requests 0`, `window.__GR_AUDIO_DIAGNOSTICS__` never published at
all. `SoundSystem` attaches its `pointerdown`/`keydown` unlock listeners in its CONSTRUCTOR
(`src/audio/SoundSystem.ts:114-115`), and the test clicked one frame after `goto`, before the Game
existed — the gesture landed on nothing. Waiting for a frame first (what the sibling test at :46
has always done) is the fix.

## Gate summary, final tree

| Gate | Where | Result |
|---|---|---|
| `npx tsc --noEmit` | worktree | clean |
| `npm run build` (dev) | worktree | green |
| `GR_RELEASE=e1 npm run build` | worktree | green |
| `first-town-request-families` + `deploy-budget` + `sprite-cell-url-inlining` | node v26.4.0 | **22/22** |
| e2e `tape-01-run-tape` + `ap16-6-browser-seat` + `beauty-town` + `mu-02-music` + `music-survives-pause` | dev 5306, both projects | **30/30** |
| e2e `asset-diet` on the release e1 build | preview 5293, both projects | 15 passed / 1 failed (F-PERFC-2, controlled) |
| e2e `tape-01-run-tape` + `ap16-6-browser-seat` on the release e1 build | preview 5293, both projects | 12 passed / 2 failed (F-PERFC-2, controlled) |

## Findings

- **F-PERFC-1 (real, pre-existing, out of firewall).** `npm run build:release` is STILL red on this
  branch and was red on main before it, for a second and older reason the worker leak was masking:
  49 `townsfolk-<role>-e<2..10>-*.png` portraits are emitted into the E1 release by the MAIN pass
  (`scripts/assert-release-build.mjs:54-55`). Identical file set before and after this slice (0
  families added). The deploy has never seen either failure because `scripts/deploy.sh:80` runs
  `npm run build`, which does not call that assertion. Two things worth an owner/fire decision: give
  the townsfolk portraits an E1 narrowing, and decide whether the deploy should run
  `build:release`.
- **F-PERFC-2 (attributed by same-host control).** Two reds on the preview/release harness are not
  this slice's: (a) `asset-diet.spec.ts:234` *"dieted output keeps two terrain census views and town
  within screenshot tolerance"*, desktop, `town.png` at ratio **0.16** vs a 0.15
  `maxDiffPixelRatio` — control build of the base sources on this host: **0.16, 158,066 px**; cured:
  **0.16, 158,173 px**; this is the F-CELL-1 fingerprint two prior reviews already record. (b)
  `tape-01-run-tape.spec.ts:140` times out on the FIRST `waitForFunction` under
  `playwright.preview.config.ts`, both projects — control build: identical failure, both projects.
  It is green 30/30 on the dev harness, so it is the F-1296-3 / F-1457-1 class (a spec whose harness
  that config cannot provide), not a regression.
- **F-PERFC-3 (gap, no mechanism).** `scripts/sprite-cell-url-inlining.test.mjs` pins `eager: true`
  for `src/assets/SpriteAnimator.ts` and `src/assets/generated.ts` only. The four pools probes cured
  here are unguarded: dropping `eager` from them restores 72 dead modules and nothing reds. The
  guard's `CELL_GLOB_SOURCES` is outside this task's firewall; extending it is a one-line
  fire-authorable follow-up (the pools call shape differs — no `<string>`-typed `char-*.png` literal
  — so the guard needs a second, pattern-parameterised source list rather than a new array entry).
- **F-PERFC-4 (correction to a merged review).** `reviews/sprite-cell-manifests.md` F-CELL-4 says
  `src/world/Terrain.ts:634` globs sheets "WITHOUT `?url`". It does use `query: '?url'` and it is a
  real lazy loader with a dated do-not-make-eager law above it (s11), not a presence probe. Only its
  `'../../assets/processed/ter-*.png'` entry was dead, and it was dead by NARROWING (nothing looks
  those seven cells up), which is what this slice did. The `pools.ts` half of the finding was exact.

## Files in this directory

`MEASUREMENTS.md` (this file) · `probe.spec.ts` + `probe.config.ts` (the F-AUDIO-2 diagnosis probe) ·
`town-transfer-<project>-precure.json` (the pre-cure corpus the guard is proven red against) ·
`dist-{dev,e1}-{before,after}.txt` (emitted-file listings) ·
`build-*.log` (build transcripts, including the base-source control build).

## The dev-server harness these gates ran on

Deliberately NOT committed (a scratch config is not in this task's firewall). It lived at the repo
root as `playwright.perfc.config.ts`; recreate it verbatim to reproduce the dev-harness rows:

```ts
import baseConfig from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: 'http://127.0.0.1:5306', trace: 'off' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5306 --strictPort',
    url: 'http://127.0.0.1:5306',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
```

Playwright owned every server it started and stopped them itself; no process on this shared host was
killed by pattern.

## Citation drift this slice causes (for the drain, and for any later reader)

`scripts/citation-title-guard.mjs` PASSES on this tree (684 citations scanned, 0 new bare
`spec:line`), because it gates `tasks/**` and the drifted citations there carry titles. But three
line-number pointers written against the base tree have moved, and a reader following the number
lands on the wrong line:

| Cited as | Cited in | Now at | Content |
|---|---|---|---|
| `e2e/mu-02-music.spec.ts:69` | `tasks/perf-correctives-batch.md`, `reviews/first-town-audio-deferred.md` (F-AUDIO-2, "mu-02:69") | **:80** | the `loopElapsedSeconds` poll |
| `src/audio/SoundSystem.ts:297` | the same two | **:321** | `this.releaseVoice(voiceId)` in `playLoaded` |
| `src/audio/SoundSystem.ts:338` | the same two | **:362** | `const gain = context.createGain()` in `startLoop` |

`e2e/music-survives-pause.spec.ts:22` did NOT drift: the new clock assertion goes in below it, so
:22 is still `loop,` inside the same `read()` closure.

Net deltas: `SoundSystem.ts` 656 -> 680 lines (+24, all inside `diagnostics()`, above both cited
sites); `mu-02-music.spec.ts` 100 -> 111 (+11 at :66); `music-survives-pause.spec.ts` 45 -> 58
(+13 at :30).
