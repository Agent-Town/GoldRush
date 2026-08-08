# Review — town-music: the town plays its era song and reaches its audio settings

**Slice:** `town-music` (`tasks/lane-town-music.md`)
**Branch:** `lane/c` · **Lane tip:** `ea5a9ed51` · **Merge base:** `721493f63a4fb6d1b50fdaeaace3fed5553839be`
**Merge commit:** `c0b80b314f185863b61af327bf9721ac5fff6ba2`
**Drained by:** s1587 fire, 2026-08-09
**Gate transcript:** `artifacts/town-music-gate.txt` (append-only, every arm ISO-stamped)

## Verdict

**MERGED.** The slice's own acceptance passes on both projects, the run-side audio firewall is
verifiably intact, and every red seen during the gate was proved pre-existing by a control run on
the pre-merge tree.

## What it does

Answers the owner's playtest of 2026-08-09 verbatim — *"I was wondering why there is no music when I
am in town, but there are no settings there to customize it when I am in town"* — by mounting the
already-complete audio system into `TownScene`, which previously mounted none of it. The town now
starts its **active era's** loop on entry at a named `TOWN_MUSIC_VOLUME = 0.7` (the town is a porch,
not a battlefield), reusing `SoundSystem`'s existing pointer/key unlock so nothing sounds before a
user gesture, and disposing the loop when the town tears down. The shared `AudioSettingsControl` is
mounted inside a native `<details>` panel in the town's existing herald-actions surface, under
town-scoped ids, writing to the **same storage keys** as in-run settings. `Escape` closes the panel
and returns focus to its summary, and settings keystrokes are stopped from leaking into town
movement — a defect the runner's own independent review found and fixed before hand-off.

## Evidence

| Arm | Result |
|---|---|
| `drain-block-check` (twice: pre-merge + on merged tree) | ✅ CLEAR — `town-music`, no policy block |
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, 1.62 s |
| `run-guards --changed-since 721493f6` (26 files) | ✅ **5/5** — `node-guards` 372 s, `power-budget` (p95 0.326 ms), `task-guards`, `citations`, `gate-callers` |
| Own spec `e2e/beauty-town.spec.ts` | ✅ **8/8** both projects (see cold-start note below) |
| Adjacent: `town-era-switch`, `task-025`, `m1-01`, `m2-01` | ✅ **46/46** both projects, 3.7 m |
| Run-side audio: `mu-02-music`, `mu-03-era-audio`, `music-survives-pause`, `050-audio-mix-and-access`, `051-audio-governor` | ✅ **all green** — the run's music path is untouched |
| `audio-integration.spec.ts` | ⚠️ 5 failed — **all pre-existing**, proved below |
| Console/page errors | ✅ zero, asserted inside the new test on both projects |
| Screenshots | `reviews/shots-town-music/settings-{desktop,mobile}-chrome.png` |

All Playwright arms ran `--workers=1` (§3.1) through `scripts/gate-battery.mjs`, in a **detached
gate worktree** on scratch port 5234 (§3.0b custody), never in main's working tree.

### The new test earns its keep (Mistake #10)

`e2e/beauty-town.spec.ts:63` boots **plain — no `?debug`** and asserts, in order: no
`era-e1-frontier-loop` resource fetched *before* the gesture (no autoplay violation); the loop
present in `__GR_AUDIO_DIAGNOSTICS__.loops` after entering town; the settings panel reachable from
the town UI; the music slider persisting to `gr.audio.music-volume.v1`; keyboard nudge not leaking
into player movement; mute removing the loop and unmute restoring it. The era-table test at `:158`
additionally pins Voltage town to `era-e3-voltage-loop`. The `__GR_AUDIO_DIAGNOSTICS__` seam
**pre-existed** on main (`src/audio/SoundSystem.ts:504`) — the slice added no new test seam.

### Every red was proved pre-existing, not inherited as an excuse

`red-inventory-lookup` returned **KNOWN-RED** for `audio-integration.spec.ts` with four of the five
fingerprints matching exactly (test, assertion text and ~40 s / ~16 s timings). Membership is not
exoneration, so a **control run on the pre-merge tree** (`c66d90f64`, its own worktree, own port
5231) was spent:

| Test | Control (pre-merge) | Merged tree |
|---|---|---|
| `settings volume and mute persist across reload` (both projects) | ✘ ✘ | ✘ ✘ |
| `legacy audio preferences migrate into profile storage` (both projects) | ✘ ✘ | ✘ ✘ |
| `first-use bursts respect the per-sound pool cap` (mobile) | ✓ (single run) | ✘ |

The first four are deterministic and identical on both trees — **pre-existing, unrelated to this
slice** (they concern `start-menu-*` controls and legacy-preference migration, which the slice never
touches).

The fifth reproduced twice on the merged tree and passed on the control, which single runs made look
like a regression. It is not. Timing the **innocent** neighbours refuted a load ceiling (they held:
2.4 s vs 2.9 s, 2.3 s vs 2.7 s), so the test was repeated in isolation on both trees:

**`--repeat-each=7`, mobile-chrome, pool-cap alone: MERGED 4 failed / 3 passed (36.0 s) · CONTROL
4 failed / 3 passed (34.3 s).** Identical failure rate, identical wall time. The test is a
pre-existing **~57 % bimodal flake**; the single-run difference was sampling noise. The assertion
that trips is `expect(started - before).toBeLessThanOrEqual(4)` receiving `5` — one extra start,
caught by a poll that reads a value still settling.

## Merge classification

Base `721493f63a4fb6d1b50fdaeaace3fed5553839be`. `lane/c` was **2 ahead**: `ea5a9ed51` (this slice)
and `fcbbee1ae` (f1584-1, already drained to main at `706fb8239`).

| File | Class | Resolution |
|---|---|---|
| `src/town/TownScene.ts` | LANE-TOUCHED only | clean apply — main never moved it since base |
| `src/town/town.css` | LANE-TOUCHED only | clean apply |
| `e2e/beauty-town.spec.ts` | LANE-TOUCHED only | clean apply |
| `reviews/shots-town-music/*.png` (2) | NEW | free |
| `reviews/f1584-1-banked-master-banner-vocabulary.md` | **BOTH-MOVED** (add/add conflict) | **took main's copy** — a strict superset: the lane's 64 added lines plus the 51-line drain verdict s1585 appended. `git diff --cached HEAD` on the path returned empty, confirming byte-identity with main. |
| `scripts/master-shipped-classifier.{mjs,test.mjs}` | absorbed residue | byte-identical between main and lane; merged silently |

The one conflict was **predicted by the classification before the merge ran** — the lane and main had
each added the f1584-1 review file. This is the your-own-drain-append shape: s1585 appended its
verdict to the very file the lane still carried.

## Findings

**F-1587-1 — the red inventory under-records the pool-cap flake's blast radius (non-blocking).**
`logs/suite-red-inventory.md` records `first-use bursts respect the per-sound pool cap` as
**DESKTOP-ONLY**. Measured s1587 on two independent trees, it fails **4/7 on mobile-chrome** while
passing desktop in the same batteries — i.e. the project attribution is at best incomplete and the
snapshot (2026-07-28) has rotted. A drainer trusting the project column would read a mobile failure
as a NEW red and could revert a sound merge, or spend a control run rediscovering this. The row
needs its blast radius re-measured with `--repeat-each` on **both** projects rather than a single
sampling. Not blocking this merge — the flake is proved pre-existing either way.

**F-1587-2 — the first Playwright test to hit a cold vite dev server can time out, and it reads as
a tree red (non-blocking, gate hygiene).** `beauty-town.spec.ts:14` failed at **41.8 s** on
desktop-chrome as the first test against a freshly booted scratch server, timing out in
`saveEraLightShot`'s `waitForFunction(() => town.elapsed > 4)` (30 s cap). The same test on the same
tree passed in **5.0 s** warm, and mobile-chrome passed it at 5.6 s later in the same run. The wait
is for four seconds of *simulated town time*, which starves while vite compiles the town scene on
first request. Nothing distinguishes this red from a real one in the reporter output. Cheap
mitigations exist (warm the server with one request before the battery, or raise that single
timeout); filing rather than fixing, since the fix touches a spec outside this slice's firewall.

Neither finding blocks. No corrective task is spawned: F-1587-1 is a ledger re-measurement and
F-1587-2 is a gate-harness nicety, and both are recorded on the board for an attended ruling.

## Firewall audit

Declared TOUCH-ONLY was `src/town/TownScene.ts` (+ its css), the town e2e spec, and — only if
genuinely needed — `src/audio/SoundSystem.ts` or `src/game/Game.ts`. **Neither escape hatch was
used:** the merged diff touches exactly `src/town/TownScene.ts`, `src/town/town.css`,
`e2e/beauty-town.spec.ts` and two new screenshots. No audio manifest change, no new assets, no
`AudioSettingsControl` internals, no run-music behaviour change — the last confirmed green by the
five run-side audio specs above rather than by assertion.
