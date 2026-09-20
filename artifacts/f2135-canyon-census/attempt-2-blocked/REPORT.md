# F-2135-1 — Canyon Works checkpoint is lawful, but THE VIEW drops the census trace

**Fire:** s2135 · **Date:** 2026-08-21  
**Subject:** `e3-canyon-works` sanctioned campaign census, attempt 2

## Verdict

**Law 2 STOP — no margin is reported.** The genuine checkpoint works: it activates `epoch-1-frontier`, then `epoch-2-steamworks`, then `epoch-3-voltage` through `activateEpoch()`, and the sanctioned harness accepts `e3-canyon-works` rather than returning the epoch-lock refusal. No contract unlock was stubbed or bypassed.

The new premise fails at the claimed trace lever. `HeadlessContractSim.diagnostics()` includes `canyonConnect`, but the player does not receive that raw object. `buildView()` returns only `schema`, `stablePrefix`, `appendLog`, `now`, and `almanac` (`src/agent/View.ts:202-208`), and `buildNow()` has no canyon-connect field. `HeadlessContractSim.makeTurn()` adds several contract-specific diagnostics to `view.now` but does not add `canyonConnect`, then returns that filtered view (`src/sim/HeadlessContractSim.ts:1469-1577`). The player therefore sees neither `view.canyonConnect` nor `view.now.canyonConnect`.

The first sanctioned attempt stopped before issuing an order with this verbatim exception:

```text
Error: Canyon connect diagnostics were absent from THE VIEW.
```

The task's Law 2 says to stop if the trace cannot be read. Running a second identical failure would not establish determinism of a nonexistent trace, so no second run was represented as census evidence.

## Checkpoint

`scripts/f2135-canyon-epoch3-checkpoint.mjs` uses the same progression shape as `src/meta/DebugEraSeed.ts:15-16`: each predecessor megaproject receives a completion receipt, then the next epoch is entered only through `activateEpoch()`.

Activation order:

1. `epoch-1-frontier`
2. `epoch-2-steamworks`
3. `epoch-3-voltage`

The packed checkpoint's active-epoch datum is `epoch-3-voltage`. No unlocked-contract flag was written, `contractUnlockStatus()` was not stubbed, and the contract data was not changed.

## Sanctioned command

The attempted command was:

```text
F2135_CENSUS_RUN=run-1 F2135_CENSUS_FILE=artifacts/f2135-canyon-census/census.json node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json --output artifacts/f2135-canyon-census/campaign-run-1 --checkpoint artifacts/f2135-canyon-census/campaign-checkpoint-run-1.json
```

This passed contract selection and unlock checking. It did **not** reach the expected harness exception `e3-canyon-works ended unsecured at wave N.` because the player could not observe the required trace on its first turn.

## Already-established inputs (cited, not re-derived)

The predecessor report `artifacts/f2086-canyon-census/REPORT.md` established that:

- `required: 2` counts powered `consumer`/`gallery` nodes.
- Both branches require all six authored beacon sites.
- The six-beacon route costs 330 g.
- `byWave` compares the wave index.

Those are inputs to the attempted measurement, not a substitute for its missing trace.

## What is not established

- Whether the objective completed, or its completion wave.
- The deadline margin: no trustworthy `powered` value was visible when `wave > byWave` latched failure.
- Whether the leg secured, or the expected harness `ended unsecured` text.
- Determinism across two runs; there is no trace to compare.
- Any reachability verdict or balance recommendation.
- A two-seed census. Independently, GATE C remains: the sanctioned harness selects only `benchSeeds[contract.id][0]`, so it can run `e3-canyon-works-01` but cannot select pinned seed `e3-canyon-works-02`.

The contract is byte-unchanged: `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` is silent.
