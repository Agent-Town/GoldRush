# Gauntlet report — e1-twin-banks, seed e1-twin-banks-01, trail (heat 11, fable ride b)

Rider: claude-fable-5 · harness claude-code-cli 2.1.257 · worldModel: sim-import · generation 7.

## Working notes

- Diet discipline: prior-heat artifacts from other rigs (opus) and an unsanctioned earlier fable workspace exist under `artifacts/heat11/`; NOT read — diet class is self-memory (notebook only).
- Receipts first: winnability-receipts says e1-twin-banks unclaimed with NO disabling reason. Real target.
- Contract: secureWave 20, braided river (sim band z∈[-5,5]; the authored 7.8 half-width is visual only), south bank z∈[-30,-7], fords x=±16 halfWidth 3, hero fixed at (0,-12), spawns all four edges, twist otherwise empty.
- Source facts that shaped play: enemies cannot wade (riverBlocksEnemyCrossingAt → routed to fords); sluice legal ONLY at z=-7 on the south bank (build zone inclusive boundary AND riverPad 2 exact); seams pay 5g/1.5s while CHANNELING; enemies 25.2hp/8 contact dmg at trail.
- Runs: idle probe (null-floor hash match fnv1a32:01e5173c, determinism free), tune-1 w3 (income mystery), tune-2 w3 (hero box palisades useless, +0.6s), tune-3 w3 (income fixed ~1.3g/s but sluices preempted turrets), tune-4 w17/516s (turret-first ladder), attempt-1 SCORED w17/517.8s, attempt-2 SCORED (ford-plug palisades) — see gauntlet-outcome.json for final.

## Outcome

NOT SECURED. Best scored ride: attempt-1 — w17 of 20 / 517.767s / 75 gold / 745 kills / 73 calls (tape `attempt-1-tape.json`, hash fnv1a32:75a15eb6). Attempt-2 (ford-plug palisades) REGRESSED: w14 / 428.467s / 34g / 558 kills / 173 calls (hash fnv1a32:d69fc9b1). 7 sim runs total (1 idle probe, 4 tunes, 2 scored attempts). No tape put forward — no ride secured.

## What the map asked

This contract wears E1 honestly but its binding mechanic is not the bank cap — it is the **income–defense race under a fixed hero**. The hero stands immovable at the south stake (0,-12) and dies at 91.6s to wave-3 pressure in any ride that has not bought real defense by then; the 200g pan cap never once bound (gold peaked ~125). What carried the mechanic: `now.seams` (live positions, the channel-while-standing income engine), `stablePrefix.mechanics.buildables[].costs` (the 50/70/95/125 turret curve vs a ~1.3g/s economy), the fords in `tileParams` (the river's crossing funnel — the map's real signature), and the BUILD/`goldGte` priority array. The era's named cap mechanic (stockpiles above 200) was authored in (stockpile gates at 170 in my ladder) but the economy never reached it — this map's E1 story is scarcity, not overflow.

## Winnability

UNVERIFIED as winnable, but I believe it is: my best scored ride died at w17/20 — 85% of the distance — with the gap a ~15% mid-game economy shortfall (turret 4 never afforded; hero at 7-15hp from w15), which reads as a tuning wall in my controller rather than a wall in the map's constants, grammar, or economy — my own budget (25-min wall, 2 scored attempts) is what stopped me, and the next lever I would try is repositioning sluices/turrets so the sluices sit inside the turret ring's kill zone (less contest-pause, less repair drain), not more timber.

## Lessons for my notebook

- e1-twin-banks (trail, seed 01): hero is FIXED at (0,-12) and dies at 91.6s naked — wave 3 is the first gate. Turret1 (50g) must exist by ~wave 2.5. Idle floor w3/91.6s hash fnv1a32:01e5173c matches assets/contracts/null-floors.json bit-for-bit.
- THE INCOME LAW (verified in source, changed everything): `HeadlessContractSim.harvestTargets` feeds the HarvestSystem the prospector's position EVERY sim tick — standing within channelRange 1.6 of an active seam channels ~3.33g/s passively (5g/1.5s). The HARVEST verb is only "walk there + ONE hand-pan" (StandingOrders.ts:209 skips done records until the array is replaced). So the last standing order must be HOLD AT THE SEAM, never HOLD at home — my dry-gulch "fallback HARVEST chain" prose was hiding this; twin-banks exposed it (10g/wave vs 30g/wave).
- The affordability-first trap: in a standing array, the first AFFORDABLE build owns the moment, so a 40g sluice ahead of a 50g turret in priority builds first whenever gold crosses 40 — sequence by INCLUSION (only add the sluice order to the set once a turret stands), not by array order or gates.
- Sluice band on a river map with buildZones ending at the shallows: the legal strip can be ONE line (z=-7 here: zone boundary inclusive, riverPad 2 exact). Check Terrain.isBuildable + isWaterSourceAdjacent before assuming sluices are placeable at all.
- Enemies cannot wade a `river: true` tile without a crossing — riverBlocksEnemyCrossingAt routes them to the fords. But PLUGGING the ford exits with palisades REGRESSED the ride (attempt-2: w14 vs w17, calls 73→173): the timber+repair gold and the prospector's 16wu build/repair trips to the fords starve the turret curve, and every wall break sprays surprise views. The choke is real; exploiting it with cheap timber is net-negative under this economy. Spend the gold on turret 4 instead.
- Hero-box palisades are nearly worthless (+0.6s): enemies already in contact when walls rise, and 30g of timber delays the turret that actually shoots things.
- w17 death signature: 3 turrets chewed to 30-100hp, hero 175maxHp ground to 0 across w15-17, gold stuck 80-125 (repairs eating turret-4 savings, sluices contest-paused). The missing ~15% is mid-game income, not opening survival.
- Wall discipline: ~40s of gr-sim startup per ride (tsx transpile), then ~6s per 20 waves. Budget ~80s wall per full ride; the 25-minute wall fits ~1 probe + ~4 tunes + 2 attempts with source-reading between.
