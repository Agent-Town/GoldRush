# Crack the Hill Mine — impossibility proof

## Verdict

`e2-hill-mine` cannot be secured through the current headless door on `e2-hill-mine-01` at `trail`.

The economy is not the blocker. The live order surface sells only `boiler_house`, and the headless simulation has no pressure-to-damage consumer. A read-only diagnostic pass against the same production `HeadlessContractSim` measured all three Railcar components at exactly full HP at every boundary from wave 12 through wave 18. Therefore the minimum purchasable kit capable of killing the Railcar does not exist (equivalently, its gold cost is infinite).

The task's `~756 effective HP` estimate is stale under the current trail balance. The spawned component group measured **8,374.164 raw HP** and **10,916.321 spark-effective HP** after component bolt resistances.

## Method and decisions

Command used for every scored attempt:

```sh
node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-hill-mine-01 --difficulty trail
```

The run budget stopped after four failures because the fourth run plus the component-HP diagnostic completed the impossibility proof; spending the remaining eight attempts could not create an absent order or damage consumer.

1. **Maximum-wallet arm.** Repeated six valid `HARVEST` orders for each of the two active 30-gold seams. This paid 60 gold per refill and hit the wallet cap at 200 during wave 3. No builds.
2. **Early boiler arm.** Harvested continuously and bought boilers at `(-4,12)` and `(4,12)`. Both were wrecked. The run panned 340 total: 140 spent plus 200 final.
3. **Late-placement probe.** Banked 200, then tried to place the boiler set near wave 11. With 60 live enemies, all candidate placements were rejected; no builds landed. This arm was retained as a failed run, not used as positive kit evidence.
4. **Early pressure arm.** Repeated the two proven placements and tried a non-overlapping third early. Two boilers landed and were wrecked; the third was blocked once the live field filled. This produced the best final outcome line (130 kills), but the Railcar still survived untouched.

## Scored attempts

| Attempt | Policy | Panned | Built | Final outcome line |
|---|---|---:|---:|---|
| 1 | Max harvest, no build | 200 | 0 | `{"secured":false,"waves":18,"timeMs":540000,"gold":200,"kills":125,"calls":20,"eventLogHash":"fnv1a32:a1c993ac","endReason":"wave-ceiling"}` |
| 2 | Early boilers + harvest | 340 | 2 | `{"secured":false,"waves":18,"timeMs":540000,"gold":200,"kills":126,"calls":30,"eventLogHash":"fnv1a32:4809f2ad","endReason":"wave-ceiling"}` |
| 3 | Bank, then late placements | 200 | 0 | `{"secured":false,"waves":18,"timeMs":540000,"gold":200,"kills":125,"calls":23,"eventLogHash":"fnv1a32:5bcb7bb4","endReason":"wave-ceiling"}` |
| 4 | Early pressure arm | 340 | 2 | `{"secured":false,"waves":18,"timeMs":540000,"gold":200,"kills":130,"calls":29,"eventLogHash":"fnv1a32:571b0adf","endReason":"wave-ceiling"}` |

All four runs ended normally at the boss grace ceiling: wave 18, 540,000 ms, `secured:false`, `endReason:"wave-ceiling"`.

## Economy audit

### Income the headless sim actually paid

- **Gold seams:** the only measured gold source. The maximum-wallet arm panned 200 before the wallet refused more. The build arms proved the seams refill: attempt 2 panned 340, exactly `140 spent + 200 final`.
- **Kills:** paid **0 gold**. Attempt 1 killed 125 enemies while its complete gold balance was accounted for by `goldPanned:200`.
- **Theft/reclaim:** **0** in the measured runs (`goldStolen:0`, `goldReclaimed:0`).
- **Other grants:** **0**. The deterministic first-offer upgrades through the ceiling contained no Assay Bonus; the measured upgrade set was panning, luck, range, powder, and movement.

Two ceilings matter:

1. **Maximum simultaneously spendable balance: 200 gold** (measured hard cap).
2. **Maximum purchase-relevant gross cashflow: 410 gold**: the complete advertised build roster costs `3 × 70 = 210`; after sequentially spending that, refilling to the measured 200 cap gives `210 + 200 = 410`. Repairs can consume and re-open more wallet capacity, but cannot add a new kit item or damage channel, so they do not improve the minimum damage kit.

Thus even the complete advertised roster is affordable: `210 <= 410`. Gold scarcity is not the reason the contract fails.

## Damage audit

The initial live view advertised exactly one buildable:

```text
boiler_house — 70 gold each — max 3 — feeds pressure
```

It advertised no combat buildable and no interactable. `BUILD`, `HARVEST`, movement, fallback, and repair are the only relevant order forms; none invokes `boiler_lance`, `pressure_mortar`, or `sky_rocket_battery`.

The read-only diagnostic pass used the same production sim, seed, and trail preset, advanced it to each boundary, and sampled the spawned boss group plus `damageByOwner`. No game or tracked file was changed.

| Component | Raw HP wave 12 | Raw HP wave 18 | Bolt multiplier | Spark-effective HP |
|---|---:|---:|---:|---:|
| Wheel Trucks | 2,512.249 | 2,512.249 | 0.80 | 3,140.311 |
| Boiler | 3,489.235 | 3,489.235 | 0.70 | 4,984.621 |
| Cabin | 2,372.680 | 2,372.680 | 0.85 | 2,791.388 |
| **Total** | **8,374.164** | **8,374.164** | — | **10,916.321** |

The total was unchanged at waves 12, 13, 14, 15, 16, 17, and 18. The owner map contained only `hero`; hero damage against ordinary enemies rose from 5,711.681 at wave 12 to 8,791.443 at wave 18, while boss damage remained exactly zero. No boiler, pressure, turret, lance, mortar, or rocket damage owner appeared.

The implementation explains the measurement without relying on it: the headless constructor installs `PressureSystem`, which can grant and vent the pressure resource, but it does not install `PressureArsenalSystem` or another pressure damage sink. The order surface also has no coal/pressure combat action. Boilers therefore cannot convert any amount of gold into Railcar damage.

## Impossibility arithmetic

```text
Maximum purchase-relevant gold:        410
Cost of every purchasable buildable:   210
Finite damage-capable kit:             none
Measured boss damage by purchasables:    0
Measured spark-effective HP required: 10,916.321

0 < 10,916.321  =>  the Railcar cannot be killed through this door.
```

The conclusion also holds against the task's lower estimate: `0 < ~756`. The blocker is a missing headless pressure arsenal/action path, not strategy or economy.
