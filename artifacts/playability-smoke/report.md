# Playability smoke — every board contract, plain boot

Task `tasks/playability-smoke-36.md` · branch `smoke/playability-36` · 2026-09-05
Spec: `e2e/playability-smoke.spec.ts` · runner: `npm run test:playability`
(the spec self-skips unless `GR_PLAYABILITY_SMOKE=1`, so `npm test` never pays for it)

## THE BOARD IS 42, NOT 36

The task master says "the 36 board contracts". Measured on this tree, `listBoardContracts()`
(`src/meta/ContractFamilies.ts:1004`) returns **42**. The two numbers differ by exactly the
Frontier chapter:

| chapter | contracts |
|---|---|
| epoch-1-frontier | **6** — the-claim, e1-drill-yard, e1-dry-gulch, e1-night-shift, e1-twin-banks, e1-baron |
| epoch-2-steamworks .. epoch-10-deepsky | 4 each = **36** |
| **total** | **42** |

So "36" is the nine-epoch SAGA count; the six extra are epoch 1's own contracts, which the saga
count never included. `listBoardContracts()` flat-maps every manifest that declares
`parts.contracts` in `order` sequence, and every one of the ten epochs does. Independently
corroborated: `e2e/contract-briefings.spec.ts` already asserts `expect(contracts).toHaveLength(42)`
over `assets/contracts/*/contracts.json`, and a direct count of those ten bundles gives
6 + 4x9 = 42. This spec smokes **all 42**.

## What each cell means

| cell | what has to be true |
|---|---|
| boots | the run loaded the contract that was asked for: `diagnostics.contract.activeId === <id>` **and** `fallbackReason === null` (a silent fall back to The Claim is a fail, not a pass) |
| briefing | the run card is on screen and carries THIS contract's name, geography line, goals and rules, exactly as the manifest authors them |
| HUD | gold reads a number, the wave counter reads a number, the wave line carries copy, and the pause panel repeats this contract's own objective lines |
| moves | two seconds of held WASD moves the hero more than 0.5 world units (read back off the read-only diagnostics) |
| wave 2 | the run reaches wave 2 on its own, picking a Patent Office card whenever a level-up freezes the sim. Measured on the number the PLAYER sees (`[data-hud-wave-number]`, fed by `Game.currentRunWave()`), taking the larger of that and `diagnostics.wave` — see finding F-SMOKE-1 |
| clean | zero console errors and zero page errors from navigation to the last frame |

`y` = passed, `N` = failed. Every row carries a screenshot taken at the end of that cell's run —
including the failed ones, so no cell in this report is a claim without evidence.

## How it was driven — and why there is no `?debug` (Mistake #10)

The owner's test tomorrow is a plain boot. Everything here is reachable by a player:

- **`?contract=<id>` plus the sessionStorage key `gr.contract.launch.v1`** is exactly the state the
  town board's Launch button leaves behind (`src/main.ts:230` `launchContract` ->
  `stagePlayerContractLaunch`); `activeContractSelection` honours it with no debug flag
  (`src/meta/ContractFamilies.ts:1336`). Without that key a bare `?contract=` silently falls back to
  The Claim with `fallbackReason: 'debug-disabled'` — which is why the `boots` cell checks the
  reason and not just that *a* game started.
- **`?timescale=N`** (N = 4 here) is read by `readDebugParams` OUTSIDE the debug gate; the only
  thing that disables it is a RELEASE build (`src/core/DebugParams.ts:42`). In the full-board build
  the owner is testing, a player can type it. It buys wall-clock, nothing else.
- **The save state is a progressed profile, not a seam.** `reverifyStagedContractLaunch`
  (`src/meta/ContractUnlock.ts:77`) discards a staged launch whose contract is still locked, so
  smoking the whole board means arriving as a player who has earned the whole board: every contract
  secured on the scoreboard, `gr.activeEpoch.v1` = epoch-10-deepsky, science banked, per-epoch
  research registries filled. Each contract's real unlock condition is printed in the blocker
  section so it is never confused with a bug.

⚠️ **This is the one thing the report does NOT prove:** it proves each contract is *playable once
reached*, not that a fresh profile can *reach* it from the board. Sixteen of the 42 are `default`
unlocks; the other 26 sit behind `secured:<predecessor>` chains, `science` thresholds or the era
gate. If the owner wants all 42 clickable tomorrow morning without grinding, that is a separate
seeded-profile or unlock question — flagged, not solved, here.

## Environments

- **dev** — `GR_RELEASE=` unset, `npx vite --port 5305` inside the `smoke/playability-36` worktree.
- **preview** — `https://full-board.gold-rush-3in.pages.dev/` (game at the root, not `/goldrush/`).
  Confirmed a full-board build, not the E1 release: its bundle carries `epoch-10-deepsky`,
  `e5-regatta`, `gr.contract.launch.v1` and `timescale`.
  The default config's `globalSetup` (`scripts/external-server-guard.mjs`) refuses any external
  server that is not a vite DEV server and offers no bypass, deliberately — so the preview matrix
  keeps `GR_CAPTURE_BASE_URL` on the local dev server (guard honestly satisfied) and redirects only
  this spec with `GR_SMOKE_BASE_URL`.

Both projects: `desktop-chrome` (1280x800) and `mobile-chrome` (Pixel 5, 390x844). `--workers=1`.


### dev matrix — 42 contracts x 2 projects = 84 cells

base URL: `http://127.0.0.1:5305` · run at 2026-09-05T15:34:21.575Z

| # | contract | name | project | boots | briefing | HUD | moves | wave 2 | clean | screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the-claim | The Claim | desktop-chrome | y | y | y | y | y | y | the-claim-desktop-chrome.png (49 KB) |
| 2 | the-claim | The Claim | mobile-chrome | y | y | y | y | y | y | the-claim-mobile-chrome.png (59 KB) |
| 3 | e1-drill-yard | The Drill Yard | desktop-chrome | y | y | y | y | N | y | e1-drill-yard-desktop-chrome.png (41 KB) |
| 4 | e1-drill-yard | The Drill Yard | mobile-chrome | y | y | y | y | N | y | e1-drill-yard-mobile-chrome.png (45 KB) |
| 5 | e1-dry-gulch | The Dry Gulch | desktop-chrome | y | y | y | y | y | y | e1-dry-gulch-desktop-chrome.png (75 KB) |
| 6 | e1-dry-gulch | The Dry Gulch | mobile-chrome | y | y | y | y | y | y | e1-dry-gulch-mobile-chrome.png (73 KB) |
| 7 | e1-night-shift | Night Shift | desktop-chrome | y | y | y | y | y | y | e1-night-shift-desktop-chrome.png (36 KB) |
| 8 | e1-night-shift | Night Shift | mobile-chrome | y | y | y | y | y | y | e1-night-shift-mobile-chrome.png (45 KB) |
| 9 | e1-twin-banks | Twin Banks | desktop-chrome | y | y | y | y | y | y | e1-twin-banks-desktop-chrome.png (45 KB) |
| 10 | e1-twin-banks | Twin Banks | mobile-chrome | y | y | y | y | y | y | e1-twin-banks-mobile-chrome.png (56 KB) |
| 11 | e1-baron | The Claim-Jumper Baron | desktop-chrome | y | y | y | y | y | y | e1-baron-desktop-chrome.png (45 KB) |
| 12 | e1-baron | The Claim-Jumper Baron | mobile-chrome | y | y | y | y | y | y | e1-baron-mobile-chrome.png (52 KB) |
| 13 | e2-hill-mine | The Hill Mine | desktop-chrome | y | y | y | y | y | y | e2-hill-mine-desktop-chrome.png (54 KB) |
| 14 | e2-hill-mine | The Hill Mine | mobile-chrome | y | y | y | y | y | y | e2-hill-mine-mobile-chrome.png (50 KB) |
| 15 | e2-trestle | The Trestle | desktop-chrome | y | y | y | y | y | y | e2-trestle-desktop-chrome.png (74 KB) |
| 16 | e2-trestle | The Trestle | mobile-chrome | y | y | y | y | y | y | e2-trestle-mobile-chrome.png (69 KB) |
| 17 | e2-pressure-garden | The Pressure Garden | desktop-chrome | y | y | y | y | y | y | e2-pressure-garden-desktop-chrome.png (40 KB) |
| 18 | e2-pressure-garden | The Pressure Garden | mobile-chrome | y | y | y | y | y | y | e2-pressure-garden-mobile-chrome.png (45 KB) |
| 19 | e2-incline | The Incline | desktop-chrome | y | y | y | y | y | y | e2-incline-desktop-chrome.png (41 KB) |
| 20 | e2-incline | The Incline | mobile-chrome | y | y | y | y | y | y | e2-incline-mobile-chrome.png (50 KB) |
| 21 | e3-blackout-ridge | Blackout Ridge | desktop-chrome | y | y | y | y | y | y | e3-blackout-ridge-desktop-chrome.png (29 KB) |
| 22 | e3-blackout-ridge | Blackout Ridge | mobile-chrome | y | y | y | y | y | y | e3-blackout-ridge-mobile-chrome.png (38 KB) |
| 23 | e3-moth-season | Moth Season | desktop-chrome | y | y | y | y | y | y | e3-moth-season-desktop-chrome.png (20 KB) |
| 24 | e3-moth-season | Moth Season | mobile-chrome | y | y | y | y | y | y | e3-moth-season-mobile-chrome.png (31 KB) |
| 25 | e3-canyon-works | The Canyon Works | desktop-chrome | y | y | y | y | y | y | e3-canyon-works-desktop-chrome.png (35 KB) |
| 26 | e3-canyon-works | The Canyon Works | mobile-chrome | y | y | y | y | y | y | e3-canyon-works-mobile-chrome.png (42 KB) |
| 27 | e3-fairground | The Fairground | desktop-chrome | y | y | y | y | y | y | e3-fairground-desktop-chrome.png (31 KB) |
| 28 | e3-fairground | The Fairground | mobile-chrome | y | y | y | y | y | y | e3-fairground-mobile-chrome.png (36 KB) |
| 29 | e4-dust-flats | The Dust Flats | desktop-chrome | y | y | y | y | y | y | e4-dust-flats-desktop-chrome.png (61 KB) |
| 30 | e4-dust-flats | The Dust Flats | mobile-chrome | y | y | y | y | y | y | e4-dust-flats-mobile-chrome.png (58 KB) |
| 31 | e4-long-road | The Long Road | desktop-chrome | y | y | y | y | y | y | e4-long-road-desktop-chrome.png (47 KB) |
| 32 | e4-long-road | The Long Road | mobile-chrome | y | y | y | y | y | y | e4-long-road-mobile-chrome.png (51 KB) |
| 33 | e4-gusher-county | Gusher County | desktop-chrome | y | y | y | y | y | y | e4-gusher-county-desktop-chrome.png (54 KB) |
| 34 | e4-gusher-county | Gusher County | mobile-chrome | y | y | y | y | y | y | e4-gusher-county-mobile-chrome.png (58 KB) |
| 35 | e4-boneyard | The Boneyard | desktop-chrome | y | y | y | y | y | y | e4-boneyard-desktop-chrome.png (52 KB) |
| 36 | e4-boneyard | The Boneyard | mobile-chrome | y | y | y | y | y | y | e4-boneyard-mobile-chrome.png (55 KB) |
| 37 | e5-deepwater-claim | The Deepwater Claim | desktop-chrome | y | y | y | y | y | y | e5-deepwater-claim-desktop-chrome.png (49 KB) |
| 38 | e5-deepwater-claim | The Deepwater Claim | mobile-chrome | y | y | y | y | y | y | e5-deepwater-claim-mobile-chrome.png (48 KB) |
| 39 | e5-regatta | The Regatta | desktop-chrome | y | y | y | y | y | y | e5-regatta-desktop-chrome.png (50 KB) |
| 40 | e5-regatta | The Regatta | mobile-chrome | y | y | y | y | y | y | e5-regatta-mobile-chrome.png (48 KB) |
| 41 | e5-stillwater | Stillwater | desktop-chrome | y | y | y | y | y | y | e5-stillwater-desktop-chrome.png (50 KB) |
| 42 | e5-stillwater | Stillwater | mobile-chrome | y | y | y | y | N | y | e5-stillwater-mobile-chrome.png (48 KB) |
| 43 | e5-flotilla | The Flotilla | desktop-chrome | y | y | y | y | y | y | e5-flotilla-desktop-chrome.png (37 KB) |
| 44 | e5-flotilla | The Flotilla | mobile-chrome | y | y | y | y | y | y | e5-flotilla-mobile-chrome.png (38 KB) |
| 45 | e6-glow-mesa | The Glow Mesa | desktop-chrome | y | y | y | y | y | y | e6-glow-mesa-desktop-chrome.png (52 KB) |
| 46 | e6-glow-mesa | The Glow Mesa | mobile-chrome | y | y | y | y | y | y | e6-glow-mesa-mobile-chrome.png (57 KB) |
| 47 | e6-showroom | The Showroom | desktop-chrome | y | y | y | y | y | y | e6-showroom-desktop-chrome.png (78 KB) |
| 48 | e6-showroom | The Showroom | mobile-chrome | y | y | y | y | y | y | e6-showroom-mobile-chrome.png (61 KB) |
| 49 | e6-half-life-hollow | Half-Life Hollow | desktop-chrome | y | y | y | y | y | y | e6-half-life-hollow-desktop-chrome.png (47 KB) |
| 50 | e6-half-life-hollow | Half-Life Hollow | mobile-chrome | y | y | y | y | y | y | e6-half-life-hollow-mobile-chrome.png (44 KB) |
| 51 | e6-picnic | The Picnic | desktop-chrome | y | y | y | y | N | y | e6-picnic-desktop-chrome.png (56 KB) |
| 52 | e6-picnic | The Picnic | mobile-chrome | y | y | y | y | N | y | e6-picnic-mobile-chrome.png (53 KB) |
| 53 | e7-relay-valley | The Relay Valley | desktop-chrome | y | y | y | y | y | y | e7-relay-valley-desktop-chrome.png (73 KB) |
| 54 | e7-relay-valley | The Relay Valley | mobile-chrome | y | y | y | y | y | y | e7-relay-valley-mobile-chrome.png (56 KB) |
| 55 | e7-echo-canyon | Echo Canyon | desktop-chrome | y | y | y | y | y | y | e7-echo-canyon-desktop-chrome.png (51 KB) |
| 56 | e7-echo-canyon | Echo Canyon | mobile-chrome | y | y | y | y | y | y | e7-echo-canyon-mobile-chrome.png (47 KB) |
| 57 | e7-dead-band | The Dead Band | desktop-chrome | y | y | y | y | y | y | e7-dead-band-desktop-chrome.png (61 KB) |
| 58 | e7-dead-band | The Dead Band | mobile-chrome | y | y | y | y | y | y | e7-dead-band-mobile-chrome.png (68 KB) |
| 59 | e7-relay-rush | Relay Rush | desktop-chrome | y | y | y | y | y | y | e7-relay-rush-desktop-chrome.png (66 KB) |
| 60 | e7-relay-rush | Relay Rush | mobile-chrome | y | y | y | y | y | y | e7-relay-rush-mobile-chrome.png (59 KB) |
| 61 | e8-mare-claim | The Mare Claim | desktop-chrome | y | y | y | y | y | y | e8-mare-claim-desktop-chrome.png (37 KB) |
| 62 | e8-mare-claim | The Mare Claim | mobile-chrome | y | y | y | y | y | y | e8-mare-claim-mobile-chrome.png (41 KB) |
| 63 | e8-far-side | The Far Side | desktop-chrome | y | y | y | y | y | y | e8-far-side-desktop-chrome.png (32 KB) |
| 64 | e8-far-side | The Far Side | mobile-chrome | y | y | y | y | y | y | e8-far-side-mobile-chrome.png (43 KB) |
| 65 | e8-low-orbit | Low Orbit | desktop-chrome | y | y | y | y | y | y | e8-low-orbit-desktop-chrome.png (31 KB) |
| 66 | e8-low-orbit | Low Orbit | mobile-chrome | y | y | y | y | y | y | e8-low-orbit-mobile-chrome.png (38 KB) |
| 67 | e8-eclipse | The Eclipse | desktop-chrome | y | y | y | y | y | y | e8-eclipse-desktop-chrome.png (35 KB) |
| 68 | e8-eclipse | The Eclipse | mobile-chrome | y | y | y | y | y | y | e8-eclipse-mobile-chrome.png (35 KB) |
| 69 | e9-dome-basin | The Dome Basin | desktop-chrome | y | y | y | y | y | y | e9-dome-basin-desktop-chrome.png (66 KB) |
| 70 | e9-dome-basin | The Dome Basin | mobile-chrome | y | y | y | y | y | y | e9-dome-basin-mobile-chrome.png (58 KB) |
| 71 | e9-seed-run | The Seed Run | desktop-chrome | y | y | y | y | y | y | e9-seed-run-desktop-chrome.png (65 KB) |
| 72 | e9-seed-run | The Seed Run | mobile-chrome | y | y | y | y | y | y | e9-seed-run-mobile-chrome.png (63 KB) |
| 73 | e9-devils-alley | Devil's Alley | desktop-chrome | y | y | y | y | y | y | e9-devils-alley-desktop-chrome.png (53 KB) |
| 74 | e9-devils-alley | Devil's Alley | mobile-chrome | y | y | y | y | y | y | e9-devils-alley-mobile-chrome.png (51 KB) |
| 75 | e9-old-canal | The Old Canal | desktop-chrome | y | y | y | y | y | y | e9-old-canal-desktop-chrome.png (58 KB) |
| 76 | e9-old-canal | The Old Canal | mobile-chrome | y | y | y | y | y | y | e9-old-canal-mobile-chrome.png (61 KB) |
| 77 | e10-ember-shore | The Ember Shore | desktop-chrome | N | N | N | N | N | y | e10-ember-shore-desktop-chrome.png (51 KB) |
| 78 | e10-ember-shore | The Ember Shore | mobile-chrome | N | N | N | N | N | y | e10-ember-shore-mobile-chrome.png (68 KB) |
| 79 | e10-archive-world | The Archive World | desktop-chrome | N | N | N | N | N | y | e10-archive-world-desktop-chrome.png (52 KB) |
| 80 | e10-archive-world | The Archive World | mobile-chrome | N | N | N | N | N | y | e10-archive-world-mobile-chrome.png (59 KB) |
| 81 | e10-last-claim | The Last Claim | desktop-chrome | y | y | y | y | y | y | e10-last-claim-desktop-chrome.png (50 KB) |
| 82 | e10-last-claim | The Last Claim | mobile-chrome | y | y | y | y | y | y | e10-last-claim-mobile-chrome.png (52 KB) |
| 83 | e10-river | The River | desktop-chrome | N | N | N | N | N | y | e10-river-desktop-chrome.png (51 KB) |
| 84 | e10-river | The River | mobile-chrome | N | N | N | N | N | y | e10-river-mobile-chrome.png (61 KB) |

**Column counts (dev):** boots 78/84 · briefing 78/84 · HUD 78/84 · moves 78/84 · wave 2 73/84 · clean 84/84

**Fully green cells:** 73/84


### preview matrix — 42 contracts x 2 projects = 84 cells

base URL: `https://full-board.gold-rush-3in.pages.dev` · run at 2026-09-05T16:03:43.912Z

| # | contract | name | project | boots | briefing | HUD | moves | wave 2 | clean | screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the-claim | The Claim | desktop-chrome | y | y | y | y | y | y | the-claim-desktop-chrome.png (50 KB) |
| 2 | the-claim | The Claim | mobile-chrome | y | y | y | y | y | y | the-claim-mobile-chrome.png (66 KB) |
| 3 | e1-drill-yard | The Drill Yard | desktop-chrome | y | y | y | y | N | y | e1-drill-yard-desktop-chrome.png (42 KB) |
| 4 | e1-drill-yard | The Drill Yard | mobile-chrome | y | y | y | y | N | y | e1-drill-yard-mobile-chrome.png (50 KB) |
| 5 | e1-dry-gulch | The Dry Gulch | desktop-chrome | y | y | y | y | y | y | e1-dry-gulch-desktop-chrome.png (76 KB) |
| 6 | e1-dry-gulch | The Dry Gulch | mobile-chrome | y | y | y | y | y | y | e1-dry-gulch-mobile-chrome.png (89 KB) |
| 7 | e1-night-shift | Night Shift | desktop-chrome | y | y | y | y | y | y | e1-night-shift-desktop-chrome.png (33 KB) |
| 8 | e1-night-shift | Night Shift | mobile-chrome | y | y | y | y | y | y | e1-night-shift-mobile-chrome.png (46 KB) |
| 9 | e1-twin-banks | Twin Banks | desktop-chrome | y | y | y | y | y | y | e1-twin-banks-desktop-chrome.png (47 KB) |
| 10 | e1-twin-banks | Twin Banks | mobile-chrome | y | y | y | y | y | y | e1-twin-banks-mobile-chrome.png (58 KB) |
| 11 | e1-baron | The Claim-Jumper Baron | desktop-chrome | y | y | y | y | y | y | e1-baron-desktop-chrome.png (46 KB) |
| 12 | e1-baron | The Claim-Jumper Baron | mobile-chrome | y | y | y | y | y | y | e1-baron-mobile-chrome.png (51 KB) |
| 13 | e2-hill-mine | The Hill Mine | desktop-chrome | y | y | y | y | y | y | e2-hill-mine-desktop-chrome.png (50 KB) |
| 14 | e2-hill-mine | The Hill Mine | mobile-chrome | y | y | y | y | y | y | e2-hill-mine-mobile-chrome.png (53 KB) |
| 15 | e2-trestle | The Trestle | desktop-chrome | y | y | y | y | y | y | e2-trestle-desktop-chrome.png (64 KB) |
| 16 | e2-trestle | The Trestle | mobile-chrome | y | y | y | y | y | y | e2-trestle-mobile-chrome.png (83 KB) |
| 17 | e2-pressure-garden | The Pressure Garden | desktop-chrome | y | y | y | y | y | y | e2-pressure-garden-desktop-chrome.png (42 KB) |
| 18 | e2-pressure-garden | The Pressure Garden | mobile-chrome | y | y | y | y | y | y | e2-pressure-garden-mobile-chrome.png (49 KB) |
| 19 | e2-incline | The Incline | desktop-chrome | y | y | y | y | y | y | e2-incline-desktop-chrome.png (37 KB) |
| 20 | e2-incline | The Incline | mobile-chrome | y | y | y | y | y | y | e2-incline-mobile-chrome.png (42 KB) |
| 21 | e3-blackout-ridge | Blackout Ridge | desktop-chrome | y | y | y | y | y | y | e3-blackout-ridge-desktop-chrome.png (28 KB) |
| 22 | e3-blackout-ridge | Blackout Ridge | mobile-chrome | y | y | y | y | y | y | e3-blackout-ridge-mobile-chrome.png (39 KB) |
| 23 | e3-moth-season | Moth Season | desktop-chrome | y | y | y | y | y | y | e3-moth-season-desktop-chrome.png (22 KB) |
| 24 | e3-moth-season | Moth Season | mobile-chrome | y | y | y | y | y | y | e3-moth-season-mobile-chrome.png (32 KB) |
| 25 | e3-canyon-works | The Canyon Works | desktop-chrome | y | y | y | y | y | y | e3-canyon-works-desktop-chrome.png (34 KB) |
| 26 | e3-canyon-works | The Canyon Works | mobile-chrome | y | y | y | y | y | y | e3-canyon-works-mobile-chrome.png (43 KB) |
| 27 | e3-fairground | The Fairground | desktop-chrome | y | y | y | y | y | y | e3-fairground-desktop-chrome.png (31 KB) |
| 28 | e3-fairground | The Fairground | mobile-chrome | y | y | y | y | y | y | e3-fairground-mobile-chrome.png (39 KB) |
| 29 | e4-dust-flats | The Dust Flats | desktop-chrome | y | y | y | y | y | y | e4-dust-flats-desktop-chrome.png (57 KB) |
| 30 | e4-dust-flats | The Dust Flats | mobile-chrome | y | y | y | y | y | y | e4-dust-flats-mobile-chrome.png (58 KB) |
| 31 | e4-long-road | The Long Road | desktop-chrome | y | y | y | y | y | y | e4-long-road-desktop-chrome.png (44 KB) |
| 32 | e4-long-road | The Long Road | mobile-chrome | y | y | y | y | y | y | e4-long-road-mobile-chrome.png (50 KB) |
| 33 | e4-gusher-county | Gusher County | desktop-chrome | y | y | y | y | y | y | e4-gusher-county-desktop-chrome.png (61 KB) |
| 34 | e4-gusher-county | Gusher County | mobile-chrome | y | y | y | y | y | y | e4-gusher-county-mobile-chrome.png (57 KB) |
| 35 | e4-boneyard | The Boneyard | desktop-chrome | y | y | y | y | y | y | e4-boneyard-desktop-chrome.png (49 KB) |
| 36 | e4-boneyard | The Boneyard | mobile-chrome | y | y | y | y | y | y | e4-boneyard-mobile-chrome.png (53 KB) |
| 37 | e5-deepwater-claim | The Deepwater Claim | desktop-chrome | y | y | y | y | y | y | e5-deepwater-claim-desktop-chrome.png (49 KB) |
| 38 | e5-deepwater-claim | The Deepwater Claim | mobile-chrome | y | y | y | y | y | y | e5-deepwater-claim-mobile-chrome.png (49 KB) |
| 39 | e5-regatta | The Regatta | desktop-chrome | y | y | y | y | y | y | e5-regatta-desktop-chrome.png (53 KB) |
| 40 | e5-regatta | The Regatta | mobile-chrome | y | y | y | y | y | y | e5-regatta-mobile-chrome.png (50 KB) |
| 41 | e5-stillwater | Stillwater | desktop-chrome | y | y | y | y | y | y | e5-stillwater-desktop-chrome.png (45 KB) |
| 42 | e5-stillwater | Stillwater | mobile-chrome | y | y | y | y | y | y | e5-stillwater-mobile-chrome.png (54 KB) |
| 43 | e5-flotilla | The Flotilla | desktop-chrome | y | y | y | y | y | y | e5-flotilla-desktop-chrome.png (42 KB) |
| 44 | e5-flotilla | The Flotilla | mobile-chrome | y | y | y | y | y | y | e5-flotilla-mobile-chrome.png (38 KB) |
| 45 | e6-glow-mesa | The Glow Mesa | desktop-chrome | y | y | y | y | y | y | e6-glow-mesa-desktop-chrome.png (50 KB) |
| 46 | e6-glow-mesa | The Glow Mesa | mobile-chrome | y | y | y | y | y | y | e6-glow-mesa-mobile-chrome.png (56 KB) |
| 47 | e6-showroom | The Showroom | desktop-chrome | y | y | y | y | y | y | e6-showroom-desktop-chrome.png (77 KB) |
| 48 | e6-showroom | The Showroom | mobile-chrome | y | y | y | y | y | y | e6-showroom-mobile-chrome.png (58 KB) |
| 49 | e6-half-life-hollow | Half-Life Hollow | desktop-chrome | y | y | y | y | y | y | e6-half-life-hollow-desktop-chrome.png (56 KB) |
| 50 | e6-half-life-hollow | Half-Life Hollow | mobile-chrome | y | y | y | y | y | y | e6-half-life-hollow-mobile-chrome.png (47 KB) |
| 51 | e6-picnic | The Picnic | desktop-chrome | y | y | y | y | N | y | e6-picnic-desktop-chrome.png (52 KB) |
| 52 | e6-picnic | The Picnic | mobile-chrome | y | y | y | y | N | y | e6-picnic-mobile-chrome.png (68 KB) |
| 53 | e7-relay-valley | The Relay Valley | desktop-chrome | y | y | y | y | y | y | e7-relay-valley-desktop-chrome.png (56 KB) |
| 54 | e7-relay-valley | The Relay Valley | mobile-chrome | y | y | y | y | y | y | e7-relay-valley-mobile-chrome.png (56 KB) |
| 55 | e7-echo-canyon | Echo Canyon | desktop-chrome | y | y | y | y | y | y | e7-echo-canyon-desktop-chrome.png (56 KB) |
| 56 | e7-echo-canyon | Echo Canyon | mobile-chrome | y | y | y | y | y | y | e7-echo-canyon-mobile-chrome.png (46 KB) |
| 57 | e7-dead-band | The Dead Band | desktop-chrome | y | y | y | y | y | y | e7-dead-band-desktop-chrome.png (56 KB) |
| 58 | e7-dead-band | The Dead Band | mobile-chrome | y | y | y | y | y | y | e7-dead-band-mobile-chrome.png (48 KB) |
| 59 | e7-relay-rush | Relay Rush | desktop-chrome | y | y | y | y | y | y | e7-relay-rush-desktop-chrome.png (64 KB) |
| 60 | e7-relay-rush | Relay Rush | mobile-chrome | y | y | y | y | y | y | e7-relay-rush-mobile-chrome.png (57 KB) |
| 61 | e8-mare-claim | The Mare Claim | desktop-chrome | y | y | y | y | y | y | e8-mare-claim-desktop-chrome.png (34 KB) |
| 62 | e8-mare-claim | The Mare Claim | mobile-chrome | y | y | y | y | y | y | e8-mare-claim-mobile-chrome.png (38 KB) |
| 63 | e8-far-side | The Far Side | desktop-chrome | y | y | y | y | y | y | e8-far-side-desktop-chrome.png (33 KB) |
| 64 | e8-far-side | The Far Side | mobile-chrome | y | y | y | y | y | y | e8-far-side-mobile-chrome.png (43 KB) |
| 65 | e8-low-orbit | Low Orbit | desktop-chrome | y | y | y | y | y | y | e8-low-orbit-desktop-chrome.png (33 KB) |
| 66 | e8-low-orbit | Low Orbit | mobile-chrome | y | y | y | y | y | y | e8-low-orbit-mobile-chrome.png (33 KB) |
| 67 | e8-eclipse | The Eclipse | desktop-chrome | y | y | y | y | y | y | e8-eclipse-desktop-chrome.png (34 KB) |
| 68 | e8-eclipse | The Eclipse | mobile-chrome | y | y | y | y | y | y | e8-eclipse-mobile-chrome.png (38 KB) |
| 69 | e9-dome-basin | The Dome Basin | desktop-chrome | y | y | y | y | y | y | e9-dome-basin-desktop-chrome.png (52 KB) |
| 70 | e9-dome-basin | The Dome Basin | mobile-chrome | y | y | y | y | y | y | e9-dome-basin-mobile-chrome.png (61 KB) |
| 71 | e9-seed-run | The Seed Run | desktop-chrome | y | y | y | y | y | y | e9-seed-run-desktop-chrome.png (54 KB) |
| 72 | e9-seed-run | The Seed Run | mobile-chrome | y | y | y | y | y | y | e9-seed-run-mobile-chrome.png (57 KB) |
| 73 | e9-devils-alley | Devil's Alley | desktop-chrome | y | y | y | y | y | y | e9-devils-alley-desktop-chrome.png (59 KB) |
| 74 | e9-devils-alley | Devil's Alley | mobile-chrome | y | y | y | y | y | y | e9-devils-alley-mobile-chrome.png (54 KB) |
| 75 | e9-old-canal | The Old Canal | desktop-chrome | y | y | y | y | y | y | e9-old-canal-desktop-chrome.png (53 KB) |
| 76 | e9-old-canal | The Old Canal | mobile-chrome | y | y | y | y | y | y | e9-old-canal-mobile-chrome.png (42 KB) |
| 77 | e10-ember-shore | The Ember Shore | desktop-chrome | N | N | N | N | N | y | e10-ember-shore-desktop-chrome.png (53 KB) |
| 78 | e10-ember-shore | The Ember Shore | mobile-chrome | N | N | N | N | N | y | e10-ember-shore-mobile-chrome.png (60 KB) |
| 79 | e10-archive-world | The Archive World | desktop-chrome | N | N | N | N | N | y | e10-archive-world-desktop-chrome.png (51 KB) |
| 80 | e10-archive-world | The Archive World | mobile-chrome | N | N | N | N | N | y | e10-archive-world-mobile-chrome.png (59 KB) |
| 81 | e10-last-claim | The Last Claim | desktop-chrome | y | y | y | y | y | y | e10-last-claim-desktop-chrome.png (52 KB) |
| 82 | e10-last-claim | The Last Claim | mobile-chrome | y | y | y | y | y | y | e10-last-claim-mobile-chrome.png (52 KB) |
| 83 | e10-river | The River | desktop-chrome | N | N | N | N | N | y | e10-river-desktop-chrome.png (51 KB) |
| 84 | e10-river | The River | mobile-chrome | N | N | N | N | N | y | e10-river-mobile-chrome.png (61 KB) |

**Column counts (preview):** boots 78/84 · briefing 78/84 · HUD 78/84 · moves 78/84 · wave 2 74/84 · clean 84/84

**Fully green cells:** 74/84


## Blocker list

#### e1-drill-yard — The Drill Yard (epoch-1-frontier, unlock `default`)
- **dev / desktop-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 60.3s wall / 254.4s sim at timescale 4 (runState=playing, HUD wave reads "0", simTick=1912)
  - notes: activeId=e1-drill-yard fallbackReason=null · runState=playing diagnosticsWave=0 hudWave=0 simTick=1912 timeAlive=254.4s waited=60.3s
  - screenshot: `artifacts/playability-smoke/dev/e1-drill-yard-desktop-chrome.png`
- **dev / mobile-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 60.3s wall / 254.4s sim at timescale 4 (runState=playing, HUD wave reads "0", simTick=1919)
  - notes: activeId=e1-drill-yard fallbackReason=null · runState=playing diagnosticsWave=0 hudWave=0 simTick=1919 timeAlive=254.4s waited=60.3s
  - screenshot: `artifacts/playability-smoke/dev/e1-drill-yard-mobile-chrome.png`
- **preview / desktop-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 60.1s wall / 252.9s sim at timescale 4 (runState=playing, HUD wave reads "0", simTick=1901)
  - notes: activeId=e1-drill-yard fallbackReason=null · runState=playing diagnosticsWave=0 hudWave=0 simTick=1901 timeAlive=252.9s waited=60.1s
  - screenshot: `artifacts/playability-smoke/preview/e1-drill-yard-desktop-chrome.png`
- **preview / mobile-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 60.0s wall / 251.7s sim at timescale 4 (runState=playing, HUD wave reads "0", simTick=1891)
  - notes: activeId=e1-drill-yard fallbackReason=null · runState=playing diagnosticsWave=0 hudWave=0 simTick=1891 timeAlive=251.7s waited=60.0s
  - screenshot: `artifacts/playability-smoke/preview/e1-drill-yard-mobile-chrome.png`

#### e6-picnic — The Picnic (epoch-6-atomic, unlock `default`)
- **dev / desktop-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 3.1s wall / 29.7s sim at timescale 4 (runState=dead, HUD wave reads "0", simTick=228)
  - notes: activeId=e6-picnic fallbackReason=null · runState=dead diagnosticsWave=0 hudWave=0 simTick=228 timeAlive=29.7s waited=3.1s
  - screenshot: `artifacts/playability-smoke/dev/e6-picnic-desktop-chrome.png`
- **dev / mobile-chrome** — failed: wave 2
  - `wave 2`: reached wave 1 after 5.6s wall / 37.9s sim at timescale 4 (runState=dead, HUD wave reads "1", simTick=303)
  - notes: activeId=e6-picnic fallbackReason=null · runState=dead diagnosticsWave=1 hudWave=1 simTick=303 timeAlive=37.9s waited=5.6s
  - screenshot: `artifacts/playability-smoke/dev/e6-picnic-mobile-chrome.png`
- **preview / desktop-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 3.7s wall / 29.9s sim at timescale 4 (runState=dead, HUD wave reads "0", simTick=231)
  - notes: activeId=e6-picnic fallbackReason=null · runState=dead diagnosticsWave=0 hudWave=0 simTick=231 timeAlive=29.9s waited=3.7s
  - screenshot: `artifacts/playability-smoke/preview/e6-picnic-desktop-chrome.png`
- **preview / mobile-chrome** — failed: wave 2
  - `wave 2`: reached wave 0 after 2.6s wall / 27.2s sim at timescale 4 (runState=dead, HUD wave reads "0", simTick=217)
  - notes: activeId=e6-picnic fallbackReason=null · runState=dead diagnosticsWave=0 hudWave=0 simTick=217 timeAlive=27.2s waited=2.6s
  - screenshot: `artifacts/playability-smoke/preview/e6-picnic-mobile-chrome.png`

#### e10-ember-shore — The Ember Shore (epoch-10-deepsky, unlock `default`)
- **dev / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-ember-shore, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Ember Shore"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-ember-shore-desktop-chrome.png`
- **dev / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-ember-shore, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Ember Shore"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-ember-shore-mobile-chrome.png`
- **preview / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-ember-shore, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Ember Shore"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-ember-shore-desktop-chrome.png`
- **preview / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-ember-shore, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Ember Shore"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-ember-shore-mobile-chrome.png`

#### e10-archive-world — The Archive World (epoch-10-deepsky, unlock `secured:e10-ember-shore`)
- **dev / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-archive-world, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Archive World"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-archive-world-desktop-chrome.png`
- **dev / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-archive-world, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Archive World"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-archive-world-mobile-chrome.png`
- **preview / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-archive-world, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Archive World"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-archive-world-desktop-chrome.png`
- **preview / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-archive-world, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The Archive World"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-archive-world-mobile-chrome.png`

#### e10-river — The River (epoch-10-deepsky, unlock `secured:e10-last-claim`)
- **dev / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-river, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The River"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-river-desktop-chrome.png`
- **dev / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-river, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The River"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/dev/e10-river-mobile-chrome.png`
- **preview / desktop-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-river, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The River"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-river-desktop-chrome.png`
- **preview / mobile-chrome** — failed: boots, briefing, HUD, moves, wave 2
  - `boots`: requested e10-river, got activeId=the-claim fallbackReason=unavailable-contract
  - `briefing`: expect(locator).toHaveText(expected) failed |  | Locator:  getByTestId('contract-briefing-name') | Expected: "The River"
  - `HUD`: skipped: boot failed
  - `moves`: skipped: boot failed
  - `wave 2`: skipped: boot failed
  - notes: activeId=the-claim fallbackReason=unavailable-contract
  - screenshot: `artifacts/playability-smoke/preview/e10-river-mobile-chrome.png`

#### e5-stillwater — Stillwater (epoch-5-deepwater, unlock `default`)
- **dev / mobile-chrome** — failed: wave 2
  - `wave 2`: reached wave 1 after 11.2s wall / 59.2s sim at timescale 4 (runState=dead, HUD wave reads "1", simTick=457)
  - notes: activeId=e5-stillwater fallbackReason=null · picked 2 upgrade card(s) · runState=dead diagnosticsWave=1 hudWave=1 simTick=457 timeAlive=59.2s waited=11.2s
  - screenshot: `artifacts/playability-smoke/dev/e5-stillwater-mobile-chrome.png`


## Findings, classified

### F-SMOKE-1 — BLOCKER — three epoch-10 contracts cannot be launched at all; the engine silently opens The Claim instead

`e10-ember-shore`, `e10-archive-world`, `e10-river` — 6 failed cells (both projects, both environments).

- **Measured:** `diagnostics.contract.activeId = 'the-claim'`, `fallbackReason = 'unavailable-contract'`.
  The run card that appears is The Claim's, carrying the substituted geography line
  "*&lt;name&gt; is not ready for a direct claim; The Claim opened instead.*"
- **Suspected cause, corroborated in the data:** `src/meta/ContractFamilies.ts:1349` refuses any
  requested contract whose `tileParams.harvestAnchors?.length === 0` and swaps in the fallback
  contract at `:1351-1356`. A direct count of `assets/contracts/*/contracts.json` finds **exactly
  three** contracts of 42 with `harvestAnchors: []` — and they are exactly these three. (Four more
  omit the key entirely — `e1-drill-yard`, `e1-dry-gulch`, `e1-twin-banks`, `e3-moth-season` — and
  the `?.` short-circuit lets those through, which is why they boot fine.)
- **What the owner sees tomorrow:** he clicks The Ember Shore on the board and plays The Claim. The
  board still lists all four Deepsky contracts; only `e10-last-claim` actually opens.
- **Not fixed here** (firewall: no `src/**`). Either the three tiles get harvest anchors, or the
  board stops offering what the engine will refuse.

### F-SMOKE-2 — BLOCKER — `e6-picnic`: the hero is dead before wave 2, on both viewports, with no error

- **desktop-chrome:** `runState=dead` at **29.7 sim-seconds**, wave 0, simTick 228, zero console and
  page errors.
- **mobile-chrome:** `runState=dead` at **37.9 sim-seconds**, wave 1, simTick 303.
- Boot, briefing, HUD and movement are all green; the run simply ends. The Picnic's twist carries
  `clockTicks` + `picnicHold` + `enemyRoster` and **no `secureWave`**
  (`assets/contracts/epoch-6-atomic/contracts.json`), and its card promises "Hold the caprock meadow
  against waves from three sides."
- **Suspicion:** pressure arrives at the meadow with no ramp, so a player who has not yet built
  anything dies inside the first half-minute. Start at the picnic-hold pressure source and the
  contract's `enemyRoster` `waveMin`/spawn gates, then `WaveSystem.waveInterval()`
  (`src/systems/WaveSystem.ts:838`) for how cadence behaves on a `clockTicks` contract.

### F-SMOKE-3 — MARGINAL, reproduced once of two — `e5-stillwater` died at wave 1 on 390px in the dev matrix

- **dev / mobile-chrome:** `runState=dead` at 59.2 sim-seconds, wave 1, after picking two Patent
  Office cards. **dev / desktop-chrome: green.** **preview / mobile-chrome: green** (wave 2 reached).
- So it is NOT deterministic: one of the two mobile runs died, the other did not, on the same seed
  and timescale. Recorded as a marginal outcome rather than a hard blocker — Stillwater sits close
  enough to the edge that an unbuilt player on a phone-sized viewport can lose the run before wave 2.
  Re-run it a few times before spending engineering on it.

### F-SMOKE-4 — BY DESIGN, not a bug — `e1-drill-yard` has no waves at all

- 254 sim-seconds at `runState=playing`, `diagnosticsWave=0`, `hudWave=0`, zero errors, every other
  cell green. Its twist is `{"secureWave": 0, "clockTicks": 18000}` — this is the training yard, and
  its own card says "Try every Frontier building / Practice on the straw men and rolling logs."
- The wave-2 cell simply does not apply. It is left RED on purpose rather than special-cased, so the
  exception stays visible in the matrix instead of hiding inside the instrument.

### F-SMOKE-5 — DIAGNOSTICS DIVERGENCE (harmless to the player, a trap for every harness)

`__THREE_GAME_DIAGNOSTICS__.wave` is **not** the run's wave on deepwater storm contracts.

- `Game.publishDiagnostics` publishes `wave: this.waveSystem.diagnostics.wave`
  (`src/game/Game.ts:5400`), but the number the HUD prints is `Game.currentRunWave()`
  (`src/game/Game.ts:6210`), which returns `deepwaterCorsairWavesSpawned` whenever
  `deepwaterStormDisablesScheduledWaves(contract)` is true (`src/world/DeepwaterClaimTile.ts:174`) —
  i.e. whenever the storm drives the corsairs and the scheduled wave system is switched off
  (`src/game/Game.ts:1483`).
- **Measured on `e5-regatta`:** HUD wave number read "1" about five seconds in while
  `diagnostics.wave` was still **0 after 263.7 sim-seconds**. A harness that gates on
  `diagnostics.wave` sees a permanent zero and reports a working map as broken — this smoke did
  exactly that on its first pass, and the first 84-cell run was discarded because of it.
- This spec now takes `max(diagnostics.wave, [data-hud-wave-number])`. A cure would publish
  `currentRunWave()` in the diagnostics beside the scheduler's own number.

## What this means for tomorrow morning

- **39 of 42 contracts launch, brief, show their HUD and accept the keyboard** on both desktop and
  390px, on the deployed preview as well as on main.
- **3 of 42 are untestable** until F-SMOKE-1 is cured: the board offers them, the engine refuses
  them, and the substitution is quiet.
- **1 more ends early, every time**: The Picnic kills an unbuilt player in ~30 seconds on all four
  cells (both viewports, both environments). Stillwater did the same once of four (see F-SMOKE-3).
- **Zero console errors and zero page errors** across all 168 cells (84 dev + 84 preview) — the
  failures above are gameplay and content-availability failures, not crashes.
- **Reaching them from the board is a separate question.** This smoke arrives with a fully
  progressed profile. A fresh profile sees 16 `default` contracts and 26 behind unlock chains.
