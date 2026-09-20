
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
