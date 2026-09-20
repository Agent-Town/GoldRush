# hero-slot-clip-split — the measurements

Owner, verbatim: "now it loads veerrry slowly" (2026-09-06) and "yes, lets do 1" (2026-09-07).
Implementer: Claude Opus 5, scratch worktree `wt-hero`, branch `feat/hero-slot-clip-split`,
dev/e2e port 5305, preview port 5294. Every number below is the deploy's own instrument
(`scripts/deploy.sh:95-:110`, reproduced command-for-command) on a `GR_RELEASE=e1` release build,
or the harness in this directory against a `vite preview` of that build.

**Host caveat, stated once (F-BUDGET-4).** Four other implementers were working on this Mac
throughout. The BYTE and RESPONSE counts below are payload facts and were identical on both
projects in every run; the WALL-CLOCK numbers are host-shaped and should be read as ranges, not
constants.

## What the hero's slot is made of, and what the town plays

`node artifacts/hero-slot-clip-split/hero-window.mjs` reads the instrument's own corpus.
Reproduced the review's figure exactly before any change: **8,901,114 B in 141 responses**, both
projects, 43.7 % of the whole first-town window.

| clip group | sheet | responses | bytes |
|---|---|---:|---:|
| claim — `pan` | `char-hero-sheet-work8` | 29 | 3,552,007 |
| claim — `attack` | `char-hero-sheet-attack8` | 6 | 758,822 |
| town — walk/idle | 6 sheets (`walk8`, `walkdiag8`, `rotation`, `rotation2`, `side`, `side-actions`, `front`, `back`) | 106 | 4,590,285 |

The town plays neither claim clip. `src/town/TownScene.ts` calls `this.hero.update(delta, intents,
{...})` with no `panning` argument (so `Hero.ts:129` defaults it false) and never calls
`playAttackPose` — the only caller is `src/game/Game.ts:594`, the claim's weapon resolution. The
clip expression is `Hero.ts:192`: `attackPoseRemaining > 0 ? 'attack' : panning ? 'pan' : speed >
0.01 ? 'walk' : 'idle'`. In the town only the last two branches are reachable.

## The design

A clip carries a **group**. The contract's `clipGroups` block per slot names the default group and
moves individual clips out of it; a slot without the block behaves exactly as before.

- The **default group always loads**. It carries `walk` and `idle`, which are the fallback chain
  `pickClip` already degrades to (`requested -> walk -> idle`), so a clip whose group has not
  arrived plays the fallback and never throws, blanks, or stalls a frame.
- A **non-default group** loads when a scene declares it (`SPRITE_CLIP_GROUPS` in
  `src/assets/SpriteAnimator.ts`; the town declares `['town']`, the claim `['town','claim']`, each
  at its module's scope, which is strictly before that scene's own `new Hero()`), and otherwise
  warms on the advance stream's idle callback.
- Groups are **monotonic per slot**: a later declaration merges clips into the live `RuntimeSlot`,
  whose orientation clip Maps the animators read every frame, so a group that arrives mid-scene
  simply starts playing. Nothing is unloaded.
- A clip whose frames are **already atlased** costs nothing to add late — it is an index into
  `RuntimeOrientation.frames`. Only a clip with **its own sheets** (the hero's pose library) costs a
  fetch, and it costs exactly its own sheets. That is why `pan` and `attack` are the whole saving
  and why marking `hit`/`build`/`aim` would have saved nothing: those share the ten-cell `side`
  strip with `idle` and `walk`.

**Contract law, enforced by `scripts/hero-clip-groups.test.mjs`:** a walk sheet's clips are always
default-group. Walk sheets carry the fallback, and the merge path deliberately refuses to re-resolve
one (that would redo the hero age/skin probe and rewrite `data-hero-sheet`), so a deferred
walk-sheet clip could never arrive — and nothing downstream would report the loss.

## THE ONE THING THAT DID NOT WORK, MEASURED

The first implementation warmed the deferred groups on the first idle tick after the scene
published `assetLoadingState=ready`. It moved **nothing**: the cured build measured 20,412,264 B
and the same 8,901,114 B / 141 hero responses, all 35 claim cells still inside the window. The
window's END is observed by POLLING a DOM attribute over CDP, not taken from the page's own clock,
and 4.3 MB fits inside that observation skirt on loopback with room to spare (the F-AUDIO-3 note in
`e2e/asset-diet.spec.ts` measures 507 ms of skirt at 8 Mbps). *Deferring to a signal the probe
cannot see is not deferring.* The warm now fires when the advance stream's **plan drains** — which
is also the right order for the player, since the plan holds the map they are about to enter — and
deliberately not on `allowance`, the state that means a metered connection has spent its budget.

## Bytes and requests — the deploy's instrument, both projects

Paired run: the same command, on the same host, on release builds of the base commit and of this
branch. Corpora `before-<project>.json` / `after-<project>.json` (the instrument's own
`cueWindowResponses`, copied out of `artifacts/asset-diet/` before that churn was restored).

| | desktop-chrome | mobile-chrome |
|---|---:|---:|
| first-town window, **before** | 20,412,264 B | 20,412,264 B |
| first-town window, **after** | 16,101,435 B | 16,052,745 B |
| hero slot, **before** | 8,901,114 B / 141 responses | 8,901,114 B / 141 |
| hero slot, **after** | **4,590,285 B / 106** | **4,590,285 B / 106** |
| `char-hero-sheet-work8` (pan) | 29 responses / 3,552,007 B → **0** | 29 → **0** |
| `char-hero-sheet-attack8` (attack) | 6 responses / 758,822 B → **0** | 6 → **0** |
| other PNG families | unchanged | unchanged |

**−4,310,829 B and −35 responses from the hero, exactly and identically on both projects.** The
window totals move by roughly the same amount; they carry the host's own noise on top (F-BUDGET-4),
which is why the hero-slot figure, not the window total, is the number to read.

An earlier, separate pair of runs measured desktop 20,363,574 → 16,101,435 B, with the identical
hero figures. The hero numbers have not varied by a byte across every run of this instrument;
the window totals have.

## Timings

`timings.mjs`, three runs per cell, cold cache each run, on the page's own clock (the town's own
`loading` -> `ready` transition, not a poll). Raw: `timings-after.json` (the full cured matrix),
`timings-before.json` / `timings-after-final.json` (the paired town + cold-claim comparison).

### The cured build, full matrix — every cell three runs

| arm | scenario | town-ready (ms) | hero sprite playable (ms) | attack cells complete (ms) | **swing stall (ms)** | claim cells in the town window |
|---|---|---|---|---|---|---|
| loopback | town | 1692 / 1967 / 2295 | — | — | — | **0 / 0 / 0** |
| loopback | claim, cold | — | 17424 / 20348 / 17188 | 17152 / 20032 / 16913 | **0 / 0 / 0** | — |
| loopback | claim, warmed by the town | — | 17089 / 20284 / 20237 | 16802 / 19954 / 17454 | **0 / 0 / 0** | — |
| 8 Mbps / 100 ms | town | 6008 / 6003 / 6217 | — | — | — | **0 / 0 / 0** |
| 8 Mbps / 100 ms | claim, cold | — | 51524 / 50748 / 54460 | 50402 / 49592 / 53417 | **0 / 0 / 0** | — |
| 8 Mbps / 100 ms | claim, warmed | — | 48278 / 47853 / 47639 | 47009 / 46576 / 46058 | **0 / 0 / 0** | — |

**The first swing does not stall, and the reason is structural rather than lucky.** On a cold claim
entry the attack cells finish BEFORE the hero sprite is playable at all — every run, both arms, by
270-1,270 ms. `src/game/Game.ts` declares `['town','claim']` at module scope, and that module is
only ever reached through `await import('./game/Game')` in `src/main.ts:166`, so the declaration
lands before the class's own `new Hero(RUN_CAST_SCALE)` field initialiser and the claim group is
part of the hero's first build, exactly as it was before this slice. The claim pays what it always
paid; only the town stopped paying.

### Paired before/after, same session, same host

| arm | scenario | quantity | **before** | **after** |
|---|---|---|---|---|
| loopback | town | town-ready (ms) | 2105 / 2092 / 2180 | 2569 / 2454 / 2480 |
| loopback | claim, cold | hero sprite playable (ms) | 21488 / 20851 / 20464 | 22447 / 25333 / 28806 |
| loopback | claim, cold | attack cells complete (ms) | 21186 / 20567 / 17654 | 22113 / 24646 / 28358 |
| loopback | claim, cold | **swing stall (ms)** | **0 / 0 / 0** | **0 / 0 / 0** |
| 8 Mbps / 100 ms | town | town-ready (ms) | 6056 / 5520 / 5937 | 5817 / 5576 / 5947 |
| 8 Mbps / 100 ms | claim, cold | hero sprite playable (ms) | 52006 / 51024 / 52226 | 59541 / 54979 / 52890 |
| 8 Mbps / 100 ms | claim, cold | attack cells complete (ms) | 50909 / 49899 / 51175 | 58440 / 53776 / 51760 |
| 8 Mbps / 100 ms | claim, cold | **swing stall (ms)** | **0 / 0 / 0** | **0 / 0 / 0** |

**HONESTY, AND IT MATTERS: THE WALL CLOCK DOES NOT SHOW THE SAVING, AND THIS RUN'S TOWN-READY IS
NOT AN IMPROVEMENT.** Loopback town-ready reads 2126 ms before and 2501 ms after (SLOWER by 18 %);
at 8 Mbps it reads 5838 before and 5780 after (a wash). An earlier cured measurement of the same
build read 1692 / 1967 / 2295 ms on loopback — 25 % faster than this one — so the spread between
two runs of the SAME build exceeds the spread between the builds. Four other implementers were
building and running browsers on this Mac throughout, and `assetLoadingState` tracks the GLTF
LoadingManager only, not the sheets this slice removes, so a 4.3 MB PNG saving is not expected to
move that signal much even on a quiet host. **Do not read a town-ready improvement into this
slice.** What is reproducible, to the byte and on both projects in every run, is the payload:
4,310,829 fewer bytes and 35 fewer requests before the town is playable. On the owner's slow phone
that is bandwidth and round trips he no longer spends; on this host it is inside the noise.

## Guards and suites

- `scripts/hero-clip-groups.test.mjs` — new, 7/7. Proven to bite: a misspelled clip in `clipGroups`
  reds 2 tests, a walk-sheet clip put in a deferred group reds 2, a scene declaring an undefined
  group reds 1. All three restored afterwards.
- `sprite-cell-url-inlining` 3/3 · `first-town-request-families` 4/4 (against both the committed
  pre-cure corpus and the post-cure one) · `deploy-budget` 12/12 · `character-direction-assets` —
  27/27 together.
- e2e on port 5305, one worker, both projects: `task-025-bandits-dont-swim`,
  `vp-02-sprite-animation`, `tape-01-run-tape`, `beauty-town`, `hero-pose-library` — 52 passed.
  `hero-pose-library` is the load-bearing one here: it asserts the hero reaches `clip: 'pan'` on
  `char-hero-sheet-work8-*` frames and `clip: 'attack'` on `char-hero-sheet-attack8-r2*`, so the
  deferred group demonstrably arrives and is drawn.
- `e2e/asset-diet.spec.ts` gains "the first town fetches no hero claim animation", which asserts
  the claim families are ABSENT, that the town still fetches the hero it does animate (>= 60 cells,
  so absence cannot be achieved by shipping an invisible player), that the town declares only
  `town`, and that the warm later publishes `claim town`. **Proven to bite on the uncured build**,
  both projects: it fails there naming all 35 cells, with the run's own log line reading
  `heroCells: 141 bytes: 8901114 claimCells: 35`. On the cured build: `heroCells: 106 bytes:
  4590285 claimCells: 0`, passing on both.
- The whole `asset-diet` suite on the cured e1 release build through `playwright.preview.config.ts`
  (preview port 5294, the deploy's own shape): **17 passed / 1 failed in 5.7 m**, the one red being
  `dieted output keeps two terrain census views and town within screenshot tolerance` on desktop —
  the F-CELL-1 fingerprint both prior reviews document as environmental on this host.

### The one red in the e2e battery, attributed

`hero-pose-library` failed on desktop-chrome in the final battery (51 passed / 1 failed), at its
LAST step — after the `pan` and `attack` assertions both passed, waiting for the hero to return to
`walk` after the swing. Attributed by the house recipe (revert-run-reapply): with the five cured
files checked out at the base commit and nothing else changed, **the same test fails identically**.
Pre-existing and load-shaped, not this slice: the same spec passed 52/52 across both projects
earlier in the same session on this same branch, and mobile-chrome passes it now.

### Plain-boot 390 px evidence (`shots.json`)

No `?debug` anywhere; the release build never installs `__GR_TEST__`, so nothing here is driven
through a debug seam. Zero console and zero page errors in both.

- `town-390.png` — start menu -> Enter Town (`?tier=full`, menu-safe). At `ready` the canvas
  publishes `data-sprite-clip-groups="town"`: the town asked for its default group and nothing
  else. The hero then walks x 0 -> 6.43 under a held key, which is the `walk` branch of
  `Hero.ts:192`, and the shot is taken mid-stride. Framing caveat, pre-existing: at 390 px the
  town stacks an approach prompt, an info note, a bark card and a story beat over the lower ~45 %
  of the viewport and the camera keeps the hero in that band, so the hero is behind the cards. The
  frame-key-level proof that the hero animates is `vp-02-sprite-animation` (11 tests, both
  projects).
- `claim-swing-390.png` — `?contract=the-claim`, which is not menu-safe and so boots a real run
  with waves on. Shot on the first frame the hero's own diagnostics report
  `clip: "attack", frameKey: "char-hero-sheet-attack8-r2c2.png", direction: "e"` — a cell from the
  DEFERRED group, drawn, on a plain boot.

## Files

| file | what |
|---|---|
| `hero-window.mjs` | composition of the hero slot inside the window, from the instrument's corpus |
| `timings.mjs` | town-ready / hero-ready / claim-cell-arrival harness |
| `shots.mjs` | the plain-boot 390 px screenshots |
| `shots.json` | what those two shots measured while they were taken |
| `gate.config.ts` | playwright config pinned to this worktree's port (5305) |
| `before-*.json`, `after-*.json` | the instrument's cue-window corpora |
| `timings-*.json` | the timing runs |
| `town-390.png`, `claim-swing-390.png` | plain-boot evidence |
