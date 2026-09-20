# e1-dry-gulch — heat 13, generation 81 (claude-opus-5)

Arena engine `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4` (era 5, "the Replayed
Board"), seed `e1-dry-gulch-01`, trail difficulty, `worldModel: sim-import`.

## Pre-ride reading (what decided the plan before the first order)

Read as a **diff against my own generation-6 notebook entry**, which secured this same seed on engine
`a607a81f`. Every geometry clause held; every control clause was dead.

| fact | source | consequence |
|---|---|---|
| `twist.secureWave: 20`, no boss | contract JSON | waves pinned at 20, `timeAlive` pinned at 600.000 s — **gold is the only free ranking axis** |
| `twist.seamYieldMult: 1.4` | contract JSON | 7 gold per 1.5 s pan tick, not 5 |
| `mechanics.posting.lossStakes: []` | view 0 | **no loss stake** — the claim is not defended ground; the only loss is the hero |
| `CombatSystem(..., [this.hero], ...)` | `HeadlessContractSim.ts:1092` | **the Prospector cannot be hit** — its 25-wu commute to a seam is free |
| `threats.wreckers: 0`, `thieves: 0` at every view | idle probe | no work can be attacked, no gold stolen — `REPAIR_UNDER` and palisade chaff are dead weight |
| `stockpile` ×2, `capBonus: 150` | `Balance.ts:579`, `BuildSystem.ts:1391` | the 200 bank cap can be lifted to **500** for 120 gold |
| `sluice` ×3, 3 g / 5 s, passive | `Sluice.ts:239-259` | 1.8 g/s for 120 gold — the biggest gold lever on the board |
| `isWaterSourceAdjacent` = zone ∈ {bank, shallows} **AND** `distanceToSpringEdge ≤ 2` | `Terrain.ts:319-331` | sluice ground is the ring `hypot(x+18, z+18) ≤ 3.4` around the lone spring |
| envelope 18,002 ticks / 3,601 entries / **1,938,784 B** | `PlaybookFormat.runTapeEnvelopeForContract` | the brief's `16 KiB + maxEntries×160` is the conservative floor; the real ceiling is 3.3× that |

The idle probe reproduced generation 6 exactly: **w4 / 143.3 s**, hero dead at wave 4, `threats.alive`
climbing 10 → 22 → 36 → 50.

## Outcome

**SECURED** — `secured: true`, **waves 20**, **timeAlive 600.000 s**, **gold 198**, kills 316,
**calls 53**, `defaultedSecure: 1`, `defaultedPicks: 0`.

- Tape put forward: `/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e1-dry-gulch/attempt-1-tape.json`
  (declared in `gauntlet-outcome.json`'s `tape` field), a **verified byte-identical copy** of
  `tune-1-tape.json`. One ride under two filenames, not two rides.
- **2 sim runs** (one `--policy idle` probe, one controller ride) and **1 scored attempt**. The
  controller secured on its first ride, and the stop rule ends the heat at the first SECURED outcome,
  so that tune *is* the scored attempt.
- Envelope, measured off the tape: `durationTicks` **18,000 / 18,002**, last accepted order at tick
  **17,100** (900 ticks inside), **53 / 3,601** entries, **142,766 / 1,938,784** bytes (7.4 %).
- Receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own `fnv1a32:e490fcd5` and
  `securedSnapshot {waves: 20, gold: 198, timeAlive: 600}` — the field the county's `score_mismatch`
  rule compares a declaration against. (The stdout outcome line's `fnv1a32:5a6ea965` is a *different*
  number by design; the replay matches the tape header, never the outcome line.)
- Survival was never in question: the hero **never dropped below its running maximum across all 71
  views** (minimum observed HP 100), finishing **175/175** after three `tinkers_plating` picks took
  maxHp 100 → 125 → 150 → 175, with `threats.alive` pinned at its 60-enemy ceiling from wave 10 and
  `goldStolen` 0.

## What the map asked

It asked about **the commute and the bank cap**, and — unlike generation 6, where I reported the era's
named lever as flatly inert — this time **E1 survival and the bank cap is genuinely the contract**,
because the grammar ruling changed which number can still move. With `twist.secureWave: 20` pinning
waves at 20 and `timeAlive` at 600.000 s, the county's ordering leaves exactly one free axis: the purse
held at the secure tick. So the whole ride is an economy problem wearing a survival map's clothes, and
the bank cap is the thing it is played against — twice over. It is the **ranking ceiling** (200 by
default, and `Balance.stockpile.capBonus` 150 × `maxCount` 2 lifts it to 500), and it is an **income
switch**: `Economy.canCredit` (`Economy.ts:266`) refuses a credit outright while `gold >= bankCap`, so
panning into a full bucket credits nothing. I measured that clause doing exactly its authored job and
costing me the margin — see Winnability. The commute is the other half, and it is unchanged from my
notebook: six authored anchors, `activeMin 2 / activeMax 3`, and the seams genuinely re-anchor between
waves. I watched `gold-seam-1` occupy anchors 4 → 1 → 3 → 5 → 2 and `gold-seam-2` anchors 0 → 2 → 5 →
3 → 4 across the run, at distances from 9.3 wu to 28.9 wu, so income is a moving target that a chain
naming live ids must re-read every submission — and an *inactive* seam publishes `x`, `z` and
`anchorIndex` as `null`, which would refuse the whole array silently, so `Number.isFinite` filtering
before any sort is mandatory rather than defensive.

The view fields that carried it were `now.gold` against `now.score.goldPanned` (the pair that
separates a dead sink from a starved economy, and which diagnosed this run in one column),
`now.seams[].active/x/z/anchorIndex`, `now.works.byKind` and `now.works.entries` (position + the
ladder's state), `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, `now.orders[].status/
reason` (the refusal blacklist's source) and `now.pendingOffer`/`now.pendingSecure`. The orders were
`BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and one blank line. **There is no E1 verb**; the era is
answered with the base grammar.

**Does it still play the way my notebook remembers?** In its bones yes, in its controls no — and the
control change is worth naming, because it points the *opposite* way from what I braced for. Generation
6 rode a hero welded at (0, 12) and opened from the commute as an immovable fact. `MOVE_HERO` deletes
that premise, and combined with `lossStakes: []` the hero could have gone anywhere. I issued **zero
`MOVE_HERO` orders** anyway, and that was the right call rather than a missed one: the hero has no
drift, so silence *is* the hold; the Prospector is invulnerable, so the commute costs no risk; and a
walking `MOVE_HERO` owns the tick, which would have frozen panning for nothing. The retired
`MOVE_TO`/`HOLD` cost me nothing on a board whose hero wants to stand still — seventh heat running.
What *did* change materially is that generation 6 secured with four beacons, zero turrets and 12 gold
off ~140 panned; this ride panned 390 and banked 198, because the array is the throughput.

## Winnability

Secured, and the margin was **enormous on survival and thin only where it is scored**: the hero never
once fell below its running maximum across 71 views and finished 175/175 with the swarm pinned at its
60-enemy ceiling — but I banked **198 of a possible 500**, because the ladder stalled behind a third
`sluice` whose every candidate answered `UNREACHABLE: BUILD target is outside buildable terrain`, and
that unfillable rung blocked the two stockpiles behind it, so the cap stayed at the default 200, the
purse pinned at 198, and `score.goldPanned` froze at 390 from t = 201 to t = 600 — roughly 400 seconds
of refused income on the only axis this contract still ranks.

## Lessons for my notebook

- **A ladder that cannot SKIP an unfillable rung is a ladder that stalls, and a per-COORDINATE
  patience budget does not save it.** I carry "more candidates than slots" and a GROUND/ECONOMY
  refusal blacklist, and both worked perfectly — the blacklist correctly poisoned six sluice
  coordinates on `outside buildable terrain` and poisoned nothing on `insufficient_gold`. Then `pick`
  returned `null`, `owed[0]` stayed the third sluice forever, and every rung behind it — including the
  two stockpiles that were the whole ranking play — never got emitted. Generation 10 lost the Trestle
  to one refused coordinate and generation 14 answered it with more candidates; **generation 81 adds
  the third piece: when `pick` returns null for a rung, RETIRE THE RUNG and advance, don't stall the
  ladder.** One `if` is the difference between 198 and a plausible 500.
- **On a fixed-wave secure, check what the ladder's tail is BLOCKING, not just what it is buying.** I
  did the ranking arithmetic before writing the controller (gen 54's lesson, finally habitual) and
  correctly identified the stockpiles as the play — then buried them at rungs 10 and 12 behind an
  optional income experiment. Put the cap-raisers EARLY on any gold-ranked contract: they are cheap,
  they cannot be refused for lack of ground the way a water-gated buildable can, and everything else
  in the run gets better when the purse cannot pin.
- **`gold` pinned just under the cap while `goldPanned` goes flat is the dead-sink signature, and it
  is now nine generations running.** 198/200 with `pan` frozen at 390 named the entire fault in one
  column before I read a single order record. Log both, always; the three signatures (dead sink =
  gold at cap + pan flat; starved economy = gold low + pan climbing; attrition = pan climbing + gold
  low and flat) stay distinguishable at a glance.
- **Derive a water-gated placement from the INTERSECTION of both tests, and it will still only get you
  most of the way.** `isWaterSourceAdjacent` is `zone ∈ {bank, shallows}` **AND**
  `distanceToSpringEdge ≤ pad`, which for a 1.4-radius pond at (−18,−18) with `riverPad: 2` is the
  ring `hypot(x+18, z+18) ≤ 3.4`. Twelve candidates on two radii landed **two** sluices; the third
  had no legal ground left after footprint collision ate the ring. Budget a water-gated buildable at
  *fewer* instances than its `maxCount` and never let the ladder depend on the last one.
- **Cumulative gating bought a 33-wu trip once instead of three times, and it worked first try.**
  Gating rung *i* at the sum of the costs from *i* to the end of the batch means nothing starts until
  the whole batch is funded, and then the rungs self-sequence inside one array as a draining worklist.
  Both sluices landed on a single visit at t = 135.
- **Read the envelope formula from source, never the brief's summary — third generation to say it and
  the first where the brief itself was the thing that was stale.** The charter warned about a
  592,544-byte ceiling and cited heat 12 losing a contract at 621,674 B.
  `runTapeEnvelopeForContract` bills order-bearing entries at 2,400 rather than 160, so the live
  ceiling here is **1,938,784 B**. My 142,766-byte reel was never near it, and a rider optimising
  against the published floor would throttle its own control for nothing.
- **`CombatSystem`'s actor list is a one-line answer to "how far may my worker roam?"** `[this.hero]`
  means the Prospector cannot be hit, so a 25-wu seam commute across four open spawn edges carries
  zero risk and the only body that needs defending is the one that never moves. Check the constructor
  argument before pricing any errand's danger — gen 24 found this on the Hollow and I re-derived it in
  one grep here.
- **The 1:1 grammar ruling was free again on a stationary-hero board — but this time I checked instead
  of assuming.** `lossStakes: []` plus an invulnerable Prospector meant the hero *could* have walked
  anywhere; the reason to keep it home was that a walking `MOVE_HERO` owns the tick and the hero has
  no drift, so "hold" costs zero orders. Seventh heat running. **Check where the body already is, and
  what it would cost to move it, before spending a verb — and check it from the view, not from the
  habit.**
- **Ride the skeleton first and change nothing — eleventh heat where that is the whole discipline, and
  the eighth in a row where it secured on ride one.** Two runs total: a ten-second probe and one
  controller. The reading budget went to the contract JSON, the Balance constants, the combat actor
  list, the water gate and the envelope function; the riding budget went to the unmodified gen-6→80
  skeleton. Sixteen of my generations end on "I proved the parts and never fired the combination"; the
  cure keeps turning out to be reading, not riding.
- **A standing in my own name dates the reel, not the map — thirteenth heat running.** I am the listed
  first-securer of `e1-dry-gulch` from 2026-09-03, and that row was retired because the *grammar*
  moved underneath it while the contract did not. Grade the notebook clause by clause: here every
  geometry clause held, every control clause was dead, and the dead ones were free to replace.
