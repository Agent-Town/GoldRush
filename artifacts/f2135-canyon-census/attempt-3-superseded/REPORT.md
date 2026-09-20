# F-2141-1 — Canyon Works route terminates before the connection deadline

**Fire:** s2141 · **Date:** 2026-08-21  
**Subject:** `e3-canyon-works` sanctioned campaign census, attempt 3

## Verdict

**Law 2 STOP — no deadline margin is reported.** Both sanctioned runs produced an identical ten-row trace covering waves 0 and 1, with `powered: 0`, `required: 2`, `complete: false`, and `failed: false` throughout. The harness then terminated each run with the same exception at wave 2, before either objective completion or the `wave > byWave` failure latch could be observed.

The leg did not secure. The objective did not complete, so there is no completion wave. It also never reached the deadline latch, so there is no honest “powered at deadline” margin: the last observed value was **0/2 powered during wave 1**, not a wave-6 margin. Adding a defensive routing policy merely to keep this unproved player alive would invent policy to manufacture a number, which the task firewall forbids.

## Pre-flight and checkpoint

The lane was **merged with `main` rather than reset**. `git merge --no-edit main` completed cleanly. The three required content counts were all exactly `1`:

1. `view.now.canyonConnect = this.canyonConnectDiagnostics()` — `1`
2. `const orders = await player(turn.view` — `1`
3. `const connect = view.canyonConnect ?? view.now.canyonConnect;` — `1`

The regenerated checkpoint activated, in order:

1. `epoch-1-frontier`
2. `epoch-2-steamworks`
3. `epoch-3-voltage`

It used the banked progression script, completed each predecessor megaproject, and entered each successor only through `activateEpoch()`. No unlock was bypassed, no unlocked-contract flag was written, and `contractUnlockStatus` was not stubbed. The regenerated checkpoint changed only export/profile timestamps relative to the banked bytes (SHA-256 `7a98b773…` → `ad451d31…`), which is expected after merging newer `main`.

## Sanctioned commands and harness result

Run 1:

```sh
F2135_CENSUS_RUN=run-1 F2135_CENSUS_FILE=artifacts/f2135-canyon-census/census.json node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json --output artifacts/f2135-canyon-census/campaign-run-1 --checkpoint artifacts/f2135-canyon-census/campaign-checkpoint-run-1.json
```

Run 2:

```sh
F2135_CENSUS_RUN=run-2 F2135_CENSUS_FILE=artifacts/f2135-canyon-census/census.json node scripts/gr-sim-campaign.mjs --player scripts/f2135-canyon-census-player.mjs --contract e3-canyon-works --resume artifacts/f2135-canyon-census/epoch3-checkpoint.json --output artifacts/f2135-canyon-census/campaign-run-2 --checkpoint artifacts/f2135-canyon-census/campaign-checkpoint-run-2.json
```

Both commands exited with the harness's expected Gate B exception, verbatim:

```text
Error: e3-canyon-works ended unsecured at wave 2.
```

Because `scripts/gr-sim-campaign.mjs` throws before writing leg artifacts for unsecured outcomes, neither campaign directory nor campaign checkpoint contains a reportable leg. The per-turn trace in `census.json` is the surviving evidence.

## Determinism

`census.json` compares `run-1` with `run-2` and records `identical: true`. Each run has the same ten rows in the same order: four wave-0 rows followed by six wave-1 rows, all at 0/2 and with neither latch set. The identical early terminal is deterministic; it does **not** turn the absent deadline observation into evidence.

## Established inputs (cited, not re-derived)

The predecessor `artifacts/f2086-canyon-census/REPORT.md` established the inputs used here:

- `required: 2` counts powered `consumer`/`gallery` nodes.
- Both branches require all six authored beacon sites.
- The six-beacon route costs 330 g.
- `byWave` compares the wave index.

## Player changes

**None.** The banked attempt-2 player already issues the established six-site route with real movement, harvesting, and paired beacon purchases. No objective, deadline, seed, contract, harness, or routing policy was changed.

## What is not established

- No completion wave and no powered-at-deadline margin: the run terminated at wave 2, before `wave > 6` could latch `failed`.
- No reachability verdict, globally fastest policy, defensive routing policy, or balance recommendation.
- **GATE C:** no two-seed census. The sanctioned harness always selects `benchSeeds[contract.id][0]`, so these deterministic runs cover `e3-canyon-works-01` only and cannot select pinned seed `e3-canyon-works-02`.
- No secured leg or leg/event-log hash, because Gate B throws before those artifacts are written.

Attempt 2's false-now `status: blocked` artifact and its report were moved, not deleted, to `attempt-2-blocked/`. The contract is byte-unchanged: `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` is silent.
