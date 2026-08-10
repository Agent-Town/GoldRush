# e1-baron trail report

## Verdict

**Not secured.** I stopped after the permitted six failed simulator runs. The best honest outcome was run 5:

```json
{"secured":false,"waves":23,"timeMs":604133,"gold":5,"kills":978,"calls":326,"eventLogHash":"fnv1a32:eedfbe03"}
```

`outcome.json` contains that best line plus `"runsSoFar":6`.

## Approach

The standalone `player.py` launches the required deterministic door command, reads NDJSON views, emits replacement standing-order arrays, records each transcript, and atomically updates `outcome.json` immediately on receiving an outcome.

Source inspection exposed useful legal mechanics beyond the contract-signature roster:

1. Repeated exact HARVEST orders drain active seams quickly; MOVE_TO the claim precedes BUILD because construction uses the Prospector's position.
2. The policy rapidly fills the four-turret/six-beacon caps and keeps repeated repairs before HOLD.
3. Public-grammar palisades are accepted on this map. A staggered north-bank line carried the rider past the previous wave-18 ceiling.
4. A fresh wave-20 palisade at `(0,11)` has 180 HP. `REPAIR_UNDER 30` selects it after the Baron's 128-damage hit (52/180 HP) while ignoring ordinary scratches, suppressing rocket volleys during melee.
5. Two accepted stockpiles raise the wallet cap from 200 to 500. That extended the boss fight to wave 23, but remote wreck repairs still exhausted the bank before the Baron fell.

The retained player is the deterministic run-5 policy, which produced the best measured outcome. `NOTEBOOK.md` contains the per-run lessons; `run-N.jsonl` and stderr logs contain the evidence.

### Source anchors

- Hidden buildable mismatch: `src/game/StandingOrders.ts:356-431`, `src/game/HeadlessContractSim.ts:290-303`, and `src/game/MechanicsManifest.ts:375-411`.
- Wave-scaled wall HP and repair behavior: `src/game/BuildSystem.ts:1455-1503,1957-1965,2491-2502`.
- Baron palisade interception and strike cadence: `src/game/Enemy.ts:944-975,1050-1099`.
- Repair selection/diversion: `src/game/StandingOrders.ts:200-208` and `src/game/BuildSystem.ts:264-275,1968-1989`.
- Stockpile cap lifecycle: `src/game/BuildSystem.ts:1803-1841` and `src/game/Economy.ts:261-269`.

## Runs

| Run | Secured | Waves | Time ms | Gold | Kills | Calls | Hash | Main change |
|---:|:---:|---:|---:|---:|---:|---:|---|---|
| 1 | false | 18 | 483500 | 166 | 746 | 60 | `10872c2f` | 4 turrets + 6 beacons, generic repairs |
| 2 | false | 18 | 477233 | 178 | 723 | 64 | `089b6543` | Wide gun ring + first palisade line |
| 3 | false | 21 | 552767 | 38 | 896 | 165 | `9dee686c` | Concentrated guns + fresh boss tank |
| 4 | false | 22 | 577433 | 7 | 944 | 235 | `77f5f147` | Boss repair threshold reduced to 30% |
| 5 | false | **23** | **604133** | 5 | **978** | 326 | `eedfbe03` | Two stockpiles; 500-gold repair reserve |
| 6 | false | 20 | 542800 | 0 | 848 | 186 | `2586bc03` | Sluice hybrid: only 1 built; boss wall never landed |

## Decision count

Best run: **326** accepted order submissions (`calls`). Across all six runs: **1,036** calls.

## Playtester observations

- The derived mechanics view advertises only sentry beacons and turrets, while the live public grammar/BuildSystem accepts palisades and stockpiles on this contract. That availability mismatch materially changes achievable strategy.
- `REPAIR_UNDER` cannot target a building family or instance. Wrecked remote works always qualify regardless percentage, so late-game replacement turns repeatedly pull the Prospector away from the intended boss wall and consume expensive repair gold.
- No transport rejection or simulator crash was observed.
- Run 6 was only the failed one-sluice hybrid: the central seventh palisade never landed. It did not test the separate far-south bait proposal.
- A post-budget source calculation found that only three of the best run's six beacons could reach the wall-stopped Baron. Repositioning the other three is promising but unmeasured and was not presented as a result.
