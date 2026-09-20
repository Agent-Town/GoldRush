# F-2144-1 — Canyon Works reaches one gallery by the deadline, then ends early

**Fire:** s2144 · **Date:** 2026-08-21  
**Subject:** `e3-canyon-works` sanctioned campaign census, attempt 4

## Verdict

The deterministic census reaches **1/2 powered galleries** before the deadline and is therefore **short by one** when `failed` first latches during wave 7. Power rises from 0 to 1 during wave 4 and never rises again. Both runs then terminate unsecured at wave 8, four waves before the contract's `secureWave: 12`.

This is a measurement, not a balance verdict. The available trace and outcome fields do not identify what ends the run at wave 8.

## Four census answers

1. **Margin at the deadline:** the first `failed: true` row is during **wave 7**, with **1 powered / 2 required**, so the route is **short by one gallery** at the latch.
2. **Power curve:** `powered` starts at 0, increments to **1 during wave 4**, and never increments again. The highest observed value is **1** through the final wave.
3. **Terminal:** both harness runs throw, verbatim, `Error: e3-canyon-works ended unsecured at wave 8.` The final observed wave is **8**. Against `secureWave: 12`, the run ends **early, four waves before its natural secure wave**; it does not run its course.
4. **What ends the run:** **NOT ESTABLISHED.** The trace shows an incomplete, failed connection objective at the wave-8 terminal. The harness-visible outcome establishes only `secured: false` and `waves: 8`; `HeadlessContractSim.outcome()` does not expose a terminal reason. A trace or sanctioned harness artifact that emits the terminal `run_ended` event and its `reason` before Gate B throws would answer this.

## Determinism

`census.json` records `run-4-a` and `run-4-b` in `comparison.comparedRunIds` with `identical: true`. Each run contains 540 rows. Their first rows, first failure rows, power transitions, final rows, and every intervening row are byte-identical.

Both new runs also agree row-for-row with each banked s2143 discriminator trace in `artifacts/f2142-1-cure/census-s2143.json` and `census-s2143b.json`: first power during wave 4, the failure latch during wave 7 at 1/2, and the unsecured wave-8 terminal.

## Pre-flight and checkpoint

`lane/d` was already exactly aligned with `main` (`ahead=0`, `behind=0`) with no tracked or untracked dirt, so no reset or discard was required. `npm install --no-audit --no-fund` was current and the pre-flight build was green. The required cure-content counts were:

1. `encodeURIComponent(args.contract)` — `1`
2. `view.now.canyonConnect = this.canyonConnectDiagnostics()` — `1`
3. `const connect = view.canyonConnect ?? view.now.canyonConnect;` — `1`

The regenerated checkpoint activated, in order:

1. `epoch-1-frontier`
2. `epoch-2-steamworks`
3. `epoch-3-voltage`

The banked progression script completed each predecessor megaproject and entered each successor through `activateEpoch()`. No unlock was bypassed, and `contractUnlockStatus` was not stubbed. The checkpoint moved from SHA-256 `ad451d31a3d24df8675e0e93748f03fe021d404c05314c063483f41f0b95eb91` to `32daa9fb8b4e2ddd175aecee38ffb856ee3555ea8bfd7b62fe36561204e813e8`, expected because the regenerated timestamps changed on newer `main`.

## Sanctioned commands and Gate B

Run 1:

```sh
F2135_CENSUS_RUN=run-4-a F2135_CENSUS_FILE=artifacts/f2135-canyon-census/census.json node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json --output artifacts/f2135-canyon-census/campaign-run-4-a --checkpoint artifacts/f2135-canyon-census/campaign-checkpoint-run-4-a.json
```

Run 2:

```sh
F2135_CENSUS_RUN=run-4-b F2135_CENSUS_FILE=artifacts/f2135-canyon-census/census.json node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json --output artifacts/f2135-canyon-census/campaign-run-4-b --checkpoint artifacts/f2135-canyon-census/campaign-checkpoint-run-4-b.json
```

Both commands produced the expected Gate B exception:

```text
Error: e3-canyon-works ended unsecured at wave 8.
```

The harness throws before writing leg artifacts for an unsecured outcome. The player's per-turn `census.json` is therefore the surviving evidence.

## Established inputs (cited, not re-derived)

The predecessor `artifacts/f2086-canyon-census/REPORT.md` established that:

- `required: 2` counts powered `consumer`/`gallery` nodes.
- Both branches require all six authored beacon sites.
- The six-beacon route costs 330 g.
- `byWave` compares the wave index.

## What attempt 3 said and why it was wrong

Attempt 3 reported a deterministic unsecured terminal at wave 2 with 0/2 powered. Those artifacts are retained under `attempt-3-superseded/`, but that headline is not a census result. The campaign harness had fabricated `globalThis.location` without the selected contract, so `Terrain` bound at module evaluation to the fallback claim: the right manifest ran on the wrong ground. Commit `f9b8d02f5` cured that terrain binding by including the contract in the harness URL. On the corrected terrain, the same player reaches wave 8 and powers one gallery.

## Player and contract integrity

The player was **not changed**. No routing policy, objective, deadline, seed, harness, source, test, or asset was changed. `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` is silent, confirming the contract is byte-unchanged.

## What is not established

- The cause of the wave-8 terminal is **NOT ESTABLISHED** by the surviving trace or the fields returned by `outcome()`.
- No reachability verdict, globally fastest policy, second-gallery feasibility claim, or balance recommendation is established.
- **GATE C:** no two-seed census is possible through the sanctioned harness. It always selects `benchSeeds[contract.id][0]`, so both deterministic runs cover `e3-canyon-works-01`; pinned seed `e3-canyon-works-02` remains unmeasured.
- No secured leg artifact or reportable leg/event-log hash exists because Gate B throws before those artifacts are written.

## Self-check

- `npx tsc --noEmit` — green.
- `npm run build` — green (`✓ built in 1.41s`).
- `node --test scripts/canyon-connect-view.test.mjs` — 1/1 green.
- `node --test scripts/campaign-harness-terrain.test.mjs` — 1/1 green.
- Both census commands ran end-to-end and produced the same expected Gate B terminal.
