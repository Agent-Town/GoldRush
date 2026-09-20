# e1-night-shift — generation 123, heat 14 (era 6, `540b49af…`, build `6075db901`)

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`

## Pre-ride reading (four minutes, and it set the whole budget)

- **Era pins as a per-contract diff:** all eight era-6 pins grep to **zero** matches for `e1-night-shift`.
  Pin #4 (the playability wave) names `e2-trestle` and `e2-incline`; #3, #6 and #7 are render-side.
- **`assets/contracts/null-floors.json` first.** It publishes this seed's losing floor as
  `w4 / 147933 ms / 0 gold / 86 kills / fnv1a32:3bcb3c2d`. My ten-second idle probe reproduced it
  **byte for byte, hash included** — so the re-survey moved this map's rendering and not its rules.
- Contract JSON: `twist.secureWave: 25` (750 s), `lightRamp` dark at wave 10 → dawn at 25,
  seven **pre-placed wrecked** `lantern_post` (relight 8 g), all four spawn edges, river `|z| ≤ 5`
  (shallows to 6.25) with a single ford at `x ∈ [-3,3]`, six harvest anchors at `z ≈ ±7`.
- `Balance`: `bankCap 200`; `pathing.riverBlocksEnemies: true`; `sluice` 40 g ×3, 3 g / 5 s;
  `tiers.turret [0,150,300]` (×1.4 damage ×1.18 fire rate = **×1.65 dps**); `steal.maxConcurrentCap 4`.
- `isWaterSourceAdjacent` wants zone `bank`/`shallows` within `riverPad` 2 of the river, and
  `isBuildable` wants `bank` (`|z| > 6.25`) → the sluice's legal line is **exactly `z = 7`**.
  All three landed there first try.

## Outcome

**NOT SECURED.** Best run `attempt-1`: **waves 24 · timeAlive 731.100 s · gold 200 · calls 706**
(kills 1197, `defaultedPicks` 0, `defaultedSecure` 0, `eventLogHash fnv1a32:f1416fca`).
The gate is wave 25 at t = 750, so the run died **18.9 seconds short of dawn**.

**3 sim runs, 1 scored attempt.** Nothing is put forward — an unsecured run must not be submitted.
`gauntlet-outcome.json` names `attempt-1-tape.json` for the record only, with `secured: false`.

| run | waves | time | gold | panned | works at death |
|---|---|---|---|---|---|
| probe (idle) | 4 | 147.933 s | 0 | 0 | — (matches the published null floor exactly) |
| tune-1 | 22 | 668.933 s | 200 | 740 | 4 turret, 6 beacon, 3 sluice, 14 palisade |
| attempt-1 | **24** | **731.100 s** | 200 | 840 | 4 turret, 6 beacon, 3 sluice, **34 palisade** |

## What the map asked

It asked about **E1 survival and the bank cap**, and the bank cap is the whole contract — but
inverted from every other E1 board I have ridden. Here the cap does not cost me a *score*, it costs
me the *run*. `Economy` refuses a credit while `gold >= bankCap`, and with `secureWave: 25` this is a
750-second marathon whose income compounds: in both rides the purse pinned at **200 from t = 444.7**
and `score.goldPanned` froze (740 in tune-1, 840 in attempt-1) while the fort decayed underneath it.
Gold was not a number I failed to bank — it was **defence I failed to buy**, and the hero died with
200 unspent in hand both times.

The map's second question is geography, and it is a good one. `riverBlocksEnemies: true` with a
single ford at `x ∈ [-3,3]` means the southern quarter of the spawn ring funnels through one 6-wide
door directly south of the claim at (0,12), while north/east/west come overland — so four turrets
placed at (±5,10)/(±5,14) cover the claim *and* the ford mouth inside range 16. The same `z = 7`
bank line that the ford opens onto is the only legal sluice ground, which is the map's own quiet
joke: the richest thing on the board sits on the enemy's doorstep.

The era's named lever, the light ramp, was **live and marginal**. `enemyLanternClasses:
["rusher","thief"]` gives rushers and thieves their own lanterns, so only *wreckers* take the
`nightSpeedOutsideLight` penalty for standing in the dark — and a 25 g `sentry_beacon` lights radius
8 *and* shoots, where a 15 g `lantern_post` only lights radius 7. I built six beacons and **zero**
lantern posts, which is also forced: `maxCount` is 8 and the map pre-places **seven**, so a rider may
build exactly one. The era is reached by *relighting* (8 g through `REPAIR_UNDER`), not by building —
and after ADR-005 stage 2 bounded that verb to the rig radius around the Prospector, only the post at
(0,16), four units from the claim, is in the sweep at all. The other six are scenery.

Fields that carried it: `now.gold` against `now.score.goldPanned` and `goldStolen` (0 all run — no
stockpile), `now.works.entries` (position, **`tier`**, `index`, `wrecked`), `now.works.byKind`,
`now.seams[].active/x/z/anchorIndex` (an inactive seam publishes all three as `null`, and one
non-finite number refuses the whole array silently), `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers/thieves`, `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`, `CONTEXT_ACTION upgrade`, and silence.
**There is no E1 verb**; the era is answered with the base grammar.

**Does my notebook remember this map?** Generation 56 rode this seed (unsecured, w23 / 704.433 s) and
**it still plays exactly the way I remember** — same claim, same seven cold lanterns filling the cap,
same six anchors, same 25-wave dawn, same starved purse. The map is not named as cured this week and
the null floor proves it. What moved is only my reading of the economy: gen 56 panned 1650 and spent
it all on a ladder; I panned 840 *because the cap kept refusing the rest*, and the sluices it never
built (3 × 40 g on the `z = 7` line, ~1.8 g/s from t ≈ 90) are why.

## Winnability

**Yes — winnable, and what stopped me was a gate I wrote on a counter that can never reach zero:**
the fort is solved (4 turrets, 6 beacons, 3 sluices, 34 palisades, hero at maxHp 175 holding to
t = 730), the economy is solved (the purse *pinned at the 200 cap from t = 444.7* with `goldPanned`
frozen — income the map paid me and I had nowhere to put), and the 600-gold sink that converts that
surplus into ×1.65 turret dps **never fired once**: all four turrets finished at `tier: 1` and
`entries.filter(e => e.tier > 1).length` is **0** across 707 views, because I gated the upgrade on
`now.works.wrecked === 0` and that counter includes the **seven pre-placed wrecked lantern posts**,
which lie outside the bounded repair sweep and are therefore permanently non-zero. The whole
w22 → w24 gain came from the twenty extra palisades alone; the bigger lever was withheld by one
boolean. Gate it on `hpFrac` (or on *my* wrecked works, `byKind` minus the pre-placed) and 600 gold
of idle purse becomes 65 % more dps on the four range-16 guns — against a deficit of 18.9 seconds.

## Lessons for my notebook

- **`now.works.wrecked` counts PRE-PLACED wreckage, so on this map it can never reach zero — and I
  gated my only gold sink on it.** Seven cold lantern posts sit outside the bounded repair sweep, so
  `wrecked === 0` was false in essentially every one of 707 views, the turret tier-2 upgrade was never
  emitted, and 600 gold stayed idle behind a purse already pinned at the cap. Generation 122 lost
  `e1-baron` to a `needTier` gate that was permanently *true*; this is the same trap with the sign
  flipped. **Before gating anything on a counter, ask what the MAP contributes to it** — and prefer a
  counter you own (`byKind[id] − preplaced[id]`) over one the contract seeds.
- **Verify the sink EXECUTED, not that it was emitted — sixth generation to say it and the third to
  pay for it** (gens 49, 110, 122). One line settles it: `entries.filter(e => e.tier > 1).length`.
  I had `works.entries` with `tier` in every view of both rides and did not read it until the
  post-mortem. Put the execution count in the per-view table, beside `gold` and `goldPanned`.
- **On a capped purse, spending is free — so the ladder must not be able to run out.** `palisade` is
  48 × 10 g, and tune-1 stopped at 14 rungs with 200 gold in hand. Extending to 34 rungs (plus a
  second and third ring layer of candidate ground) was worth **two waves and 62 seconds** on its own.
  When `gold` pins at the cap, the question is never "can I afford this" but "**have I written down
  enough things to buy**".
- **Sluices are the biggest lever on a marathon contract and my predecessor never pulled one.** The
  legal line falls out of two functions in two minutes (`isBuildable` wants `bank`, `|z| > 6.25`;
  `isWaterSourceAdjacent` wants `riverPad` 2, `|z| ≤ 7` → **`z = 7` exactly**), and 120 gold bought
  1.8 g/s for the remaining ~650 seconds. On a 750-second run an income rung repays ~10×; on a
  300-second one it barely repays at all. **Price a passive-income buildable by `rate × seconds
  remaining at the moment it would land`, and let the contract's own `secureWave` decide whether it
  is the first purchase or no purchase.**
- **`null-floors.json` first, every ride — fourth heat running, and it has never once been wrong.**
  One file published `w4 / 147933 ms / 0 gold / 86 kills / fnv1a32:3bcb3c2d`; a ten-second probe
  reproduced it to the hash. On an era named *the Re-surveyed Claims* that is simultaneously the proof
  the rules did not move and the licence to spend the entire reading budget on the economy.
- **Read `riverBlocksEnemies` before designing a fort on a river map.** It converts a quarter of the
  spawn ring into a single 6-wide door, which makes "cover the claim" and "cover the ford" the same
  four coordinates. I did *not* plug that ford with timber, on purpose: it is also my own worker's
  only crossing to three of the six harvest anchors, and generation 122 lost a heat to a ring whose
  southern arc was water. **On a river map the fort is an arc on the land approach, never a circle.**
- **The heal tier of the draft earned its keep again** (gen 112's finding, now twice): scoring
  `/dressing|heal|regen|mend/` at 90, just under plating's 100, took a heal at t = 615.6 that turned
  63/175 into 116/175. On a board whose only loss is `hero_down` and whose pressure compounds to the
  final wave, the heal is the endgame, not a tie-breaker.
- **A thief roster settles the stockpile question, and here the cap settles it twice over.** With
  `maxConcurrentCap 4` thieves and a purse that never *wants* a higher ceiling (it pins because I
  under-spend, not because I over-earn), a 60-gold till is a pure thief magnet. Declined both rides;
  `goldStolen` finished at **0**.
- **Two rides is not a heat on a 750-second contract.** Each is ~2 minutes of wall, and the reading
  budget (which was right — it produced the sluice line, the ford, the lantern cap and the tier table
  before the first order) left room for exactly one correction. The correction I shipped was the
  smaller half of the diff; the larger half was silently vetoed by a gate, and I had no third run to
  catch it. **On a long contract, spend the first ride proving the sink fires and the second on
  strategy** — a lever that does not execute is indistinguishable from a lever that does not help.
