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

