
## generation 123 — 2026-09-18T08:07:00.904Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e1-night-shift
cost: wallClock 1501s (WALL HIT at 1500s) · setupToFirstOutput 120s · tokens in 114 / out 120483 (+cache read 27991012) over 57 turns, 29 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w25 / 750.033s / 200g / calls 699 · runs 4 · scored attempts 2 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 27.
- Winnability (rider, verbatim): **Yes — winnable, and what stopped me was a gate I wrote on a counter that can never reach zero:** the fort is solved (4 turrets, 6 beacons, 3 sluices, 34 palisades, hero at maxHp 175 holding to t = 730), the economy is solved (the purse *pinned at the 200 cap from t = 444.7* with `goldPanned` frozen — income the map paid me and I had nowhere to put), and the 600-gold sink that converts that surplus into ×1.65 turret dps **never fired once**: all four turrets finished at `tier: 1` and `entries.filter(e => e.tier > 1).length` is **0** across 707 views, because I gated the upgrade on `now.works.wrecked === 0` and that counter includes the **seven pre-placed wrecked lantern posts**, which lie outside the bounded repair sweep and are therefore permanently non-zero. The whole w22 → w24 gain came from the twenty extra palisades alone; the bigger lever was withheld by one boolean. Gate it on `hpFrac` (or on *my* wrecked works, `byKind` minus the pre-placed) and 600 gold of idle purse becomes 65 % more dps on the four range-16 guns — against a deficit of 18.9 seconds.
- What the map asked (rider, verbatim): It asked about **E1 survival and the bank cap**, and the bank cap is the whole contract — but inverted from every other E1 board I have ridden. Here the cap does not cost me a *score*, it costs me the *run*. `Economy` refuses a credit while `gold >= bankCap`, and with `secureWave: 25` this is a 750-second marathon whose income compounds: in both rides the purse pinned at **200 from t = 444.7** and `score.goldPanned` froze (740 in tune-1, 840 in attempt-1) while the fort decayed underneath it. Gold was not a number I failed to bank — it was **defence I failed to buy**, and the hero died with 200 unspent in hand both times. The map's second question is geography, and it is a good one. `riverBlocksEnemies: true` with a single ford at `x ∈ [-3,3]` means the southern quarter of the spawn ring funnels through one 6-wide door directly south of the claim at (0,12), while north/east/west come overland — so four turrets placed at (±5,10)/(±5,14) cover the claim *and* the ford mouth inside range 16. The same `z = 7` bank line that the ford opens onto is the only legal sluice ground, which is the map's own quiet joke: the richest thing on the board sits on the enemy's doorstep. The era's named lever, the light ramp, was **live and marginal**. `enemyLanternClasses: ["rusher","thief"]` gives rushers and thieves their own lanterns, so only *wreckers* take the `nightSpeedOutsideLight` penalty for standing in the dark — and a 25 g `sentry_beacon` lights radius 8 *and* shoots, where a 15 g `lantern_post` only lights radius 7. I built six beacons and **zero** lantern posts, which is also forced: `maxCount` is 8 and the map pre-places **seven**, so a rider may build exactly one. The era is reached by *relighting* (8 g through `REPAIR_UNDER`), not by building — and after ADR-005 stage 2 bounded that verb to the rig radius around the Prospector, only the post at (0,16), four units from the claim, is in the sweep at all. The other six are scenery. Fields that carried it: `now.gold` against `now.score.goldPanned` and `goldStolen` (0 all run — no stockpile), `now.works.entries` (position, **`tier`**, `index`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z/anchorIndex` (an inactive seam publishes all three as `null`, and one non-finite number refuses the whole array silently), `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`, `CONTEXT_ACTION upgrade`, and silence. **There is no E1 verb**; the era is answered with the base grammar. **Does my notebook remember this map?** Generation 56 rode this seed (unsecured, w23 / 704.433 s) and **it still plays exactly the way I remember** — same claim, same seven cold lanterns filling the cap, same six anchors, same 25-wave dawn, same starved purse. The map is not named as cured this week and the null floor proves it. What moved is only my reading of the economy: gen 56 panned 1650 and spent it all on a ladder; I panned 840 *because the cap kept refusing the rest*, and the sluices it never built (3 × 40 g on the `z = 7` line, ~1.8 g/s from t ≈ 90) are why.
- Lessons (rider, verbatim):
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
