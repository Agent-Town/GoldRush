# first-town-audio-deferred — the measured before and after (F-AUDIO-3)

Owner, 2026-09-06: "now it loads veerrry slowly" / "are the assets optimized for size?".

**Instrument:** `e2e/first-town-audio-deferred.spec.ts`, run through the deploy's own shape —
`GR_AUDIO_LINK=<link> GR_PREVIEW_PORT=5294 GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1 npm exec -- playwright test --config playwright.preview.config.ts e2e/first-town-audio-deferred.spec.ts --workers=1 --trace=off --reporter=line --project=desktop-chrome --project=mobile-chrome`
on a `GR_RELEASE=e1 npm run build` bundle, three runs a side, both projects, loopback and an
emulated 8 Mbps (`Network.emulateNetworkConditions`, 1,048,576 B/s, 20 ms latency). Raw output per
run in `runs/`; the last run of each cell is also serialised as `timeline-<project>-<link>.json`
with every mp3 fetch, every loading-state transition, and the full response list.

The BEFORE side is the same instrument against `git show HEAD:src/audio/SoundSystem.ts` restored in
place and rebuilt, so both sides are measured by the same code on the same host within one hour.

## The two clocks, and why only one of them is asserted

| clock | what it is | fidelity |
| --- | --- | --- |
| `published` | `performance.now()` inside the page at the moment `#game-canvas[data-asset-loading-state]` flips to `ready` after the town began raising | exact |
| `observed` | when Playwright's `expect.poll` first SEES that attribute over CDP | late by up to **507 ms** at 8 Mbps |

Every assertion in this slice reads the page clock. The cue window's end is the observed one, so a
fetch released the instant the town is playable can still land "inside" a window that had already
closed — visible below as `cue-window music 2` on cured 8 Mbps runs whose `music before playable` is
0 (F-AUDIO-4).

## Loopback, release e1 bundle

| side | project | window responses | window bytes | town playable (published) | title-theme.mp3 | era-e1-frontier-loop.mp3 | music before playable |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| before | desktop | 149 / 147 / 149 | 11,912,664 / 10,739,360 / 11,912,664 | 555 / 556 / 551 ms | 223 / 215 / 212 ms | 387 / 387 / 375 ms | **2 / 2 / 2** |
| before | mobile | 149 / 155 / 149 | 11,912,664 / 11,913,372 / 11,912,664 | 533 / 558 / 540 ms | 217 / 221 / 212 ms | 377 / 392 / 380 ms | **2 / 2 / 2** |
| after | desktop | 145 / 143 / 145 | 8,910,985 / 7,737,681 / 8,910,985 | 562 / 566 / 565 ms | never fetched | 638 / 634 / 635 ms | **0 / 0 / 0** |
| after | mobile | 145 / 145 / 148 | 8,910,985 / 8,910,985 / 9,963,503 | 538 / 533 / 547 ms | never fetched | 618 / 614 / 591 ms | **0 / 0 / 0** |

## Emulated 8 Mbps, release e1 bundle

| side | project | window responses | window bytes | town playable (published) | title-theme.mp3 | era-e1-frontier-loop.mp3 | music before playable |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| before | desktop | 127 / 126 / 126 | 7,305,651 / 7,305,528 / 7,305,528 | 5,925 / 5,948 / 5,960 ms | 583 / 592 / 589 ms | 1,049 / 1,051 / 1,068 ms | **2 / 2 / 2** |
| before | mobile | 127 / 127 / 127 | 7,305,651 / 7,305,651 / 7,305,651 | 5,948 / 5,947 / 5,947 ms | 583 / 595 / 590 ms | 1,052 / 1,067 / 1,075 ms | **2 / 2 / 2** |
| after | desktop | 157 / 156 / 157 | 7,744,455 / 7,690,698 / 7,744,455 | 5,823 / 5,830 / 5,843 ms | never fetched | 5,917 / 5,860 / 5,927 ms | **0 / 0 / 0** |
| after | mobile | 157 / 157 / 155 | 7,795,561 / 7,744,455 / 7,632,879 | 5,891 / 5,853 / 5,882 ms | never fetched | 5,987 / 6,047 / 5,974 ms | **0 / 0 / 0** |

## What the numbers say

1. **3,001,468 B of mp3 (plus 211 B of `?url` module) leave the window**, on both projects, on both
   links, in all six cured runs. `era-e1-frontier-loop.mp3` (1,800,881 B) is now fetched 26 to 195 ms
   AFTER the town publishes itself playable, and the era loop still starts.
2. **`title-theme.mp3` (1,200,587 B) is not fetched at all on this path.** Its loop is armed by
   `StartMenu`'s constructor and its SoundSystem is disposed by the entering click, one frame before
   the deferred start would have run. Before the cure those bytes were downloaded and thrown away.
3. **Town-ready is unchanged within noise on loopback** (desktop 551-556 -> 562-566 ms, mobile
   533-558 -> 533-547 ms) and **~85 ms EARLIER at 8 Mbps** (5,925-5,960 -> 5,823-5,891 ms), where the
   3 MB actually competed for the pipe.
4. **The window's byte total is not the payload, and this slice proves it again.** At 8 Mbps the
   cured window is BIGGER (7.63-7.80 MB over 155-157 responses) than the uncured one (7.31 MB over
   126-127 responses) — because the 3 MB the music is no longer using went to sprite sheets, which
   then landed before the same signal. Byte totals moved the wrong way while the actual first-town
   payload fell by 3.0 MB. This is F-BUDGET-4 restated with a second instance, and it is why both
   new assertions are about ORDER and PRESENCE, never bytes.
5. The sfx `menu-tap.mp3` (8,821 B) stays in the window on purpose: it is the sound of the click
   itself. Measured in the same runs, at 363-460 ms (loopback) and 854-1,069 ms (8 Mbps).

## Findings

- **F-AUDIO-1 (record).** `reviews/first-town-transfer-bisect.md` transposes the two file sizes in
  its recommendation 2 ("defer the two mp3s (1,800,881 + 1,200,587 B)"). On disk and in the bundle
  `title-theme.mp3` is **1,200,587 B** and `era-e1-frontier-loop.mp3` is **1,800,881 B**. The sum,
  and therefore the 3,010,289 B audio row of the composition table, is right.
- **F-AUDIO-2 (instrument).** `SoundSystem.diagnostics()` is republished only when an audio event
  occurs, so `loopElapsedSeconds` is a snapshot taken at the last event, not a clock. In a quiet town
  it reads 0 for as long as you poll it; an early draft of this spec polled it and failed on a build
  whose music was demonstrably playing. Assert `startedBySound` (incremented right after
  `source.start()`) instead. `e2e/music-survives-pause.spec.ts` polls `loopElapsedSeconds` safely
  only because a RUN generates constant audio events.
- **F-AUDIO-3 (cured).** Music was fetched at the head of the first town's own queue.
  `src/audio/SoundSystem.ts` now holds the `music` group until the scene the player is standing in
  publishes itself playable, and past the gesture's own tick. HONEST LIMIT, inherited from
  `assetLoadingState`: that signal covers the scene's GLTF LoadingManager only
  (`src/assets/AssetLoading.ts:19-37`), so it can go `ready` while character sprite sheets are still
  streaming. The hold buys the GLB half of the window for certain and the sheet tail only sometimes.
- **F-AUDIO-4 (instrument).** The cue window's END is polled over CDP, so its boundary is fuzzy by up
  to one poll interval — 507 ms measured at 8 Mbps (page published `ready` at 5,883 ms, poll saw it
  at 6,449 ms). Any request a cure releases at exactly `ready` will sometimes appear inside a window
  that had closed. Deferral assertions must use the page's own `performance.now()`.
