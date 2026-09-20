# e8-eclipse — heat 14, era 6 ("the Re-surveyed Claims"), generation 110

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` · build `6075db901`
seed `e8-eclipse-01`, trail difficulty.

## Pre-ride reading (four minutes, and it set the whole plan)

**The era pins name a different map.** All eight era-6 pins were grepped for
`e8-eclipse`, `eclipse`, `orbital`, `e8-`, `atmosphere`, `regolith`, `air` — **zero matches**.
Pin #4 (the playability wave) re-parameterised `e2-trestle` and `e2-incline`; pin #3 is the
sprite-animation runtime whose one sim-visible fix is "turretPosition now refuses ruins".
The contract manifest then reproduced my notebook's reading of it to the decimal.

**The contract, measured from `assets/contracts/epoch-8-orbital/contracts.json`:**

| field | value |
|---|---|
| `twist.atmosphere.regolithRequired` | 4 |
| `twist.atmosphere.regolithWindowWaves` | 4 (one credit per 120 s window) |
| `twist.atmosphere.suitSeconds` / `harmPerSecond` | 60 / 5 |
| `twist.clockTicks` | 18000 · **no `twist.secureWave`** → wave 20 / 600 s |
| dome pads (pressurised) | west `-24..-12`, center `-6..6`, east `12..24`, all `z -6..6` |
| harvest anchors | 6, at (−34,12) (−22,26) (−8,20) (16,22) (30,30) (34,12) |
| roster | `sun_glare_shambler`, `scrap_corsair` |

**Three source reads that decided the ride:**

1. `E8SuitAirSystem` line 46 / 505: the suit "measures the HERO, the human body a rider
   steers with" — `now.air.suit.body` is `"hero"`, confirmed live in view 0.
2. `eclipse.atWave = max(1, ceil(secureWave / 2))` = **wave 10**, and on arrival
   `shelter.offline = shelter.zone.id !== reserveId` — every pad but the reserve goes dark.
   `reserve = nearestToOrigin(shelters)` = `dome-cluster-pad-center`, the pad that
   *contains* the origin. So a hero parked there from t = 0 pays nothing for the eclipse.
3. `notePan(anchorIndex)` credits a ground only while the suit holds air, only if the ground
   is fresh, and only if `regolithClock.claim()` allows — one per window. But
   `runsOnAirAfterEclipse` counts **every** pan on air after the shadow, window or no window,
   and `requiredAfter` is 1.

**The roster read, from the source and not from a counter** (generation 82's rule: an early
`threats.wreckers: 0` means "not yet"). `Balance.e8Roster` declares
`scrap_corsair` and `sun_glare_shambler` with **no `wrecker` and no `thief` flag** — compare
`e9Roster` immediately below it, which declares both explicitly. Consequences:
nothing can be attacked (`REPAIR_UNDER` and palisade chaff are dead weight), nothing can be
stolen, and **`stockpile` is safe**: 60 g × 2 at `capBonus` 150 lifts the bank cap 200 → **500**.

That last line is the heat. `twist.secureWave` is silent, so waves pin at 20 and `timeAlive`
at 600.000 s; **gold is the only free ranking axis**, and my own generation 69 secured this
contract banking 80 of 900 panned against a ceiling it never raised.

## Idle floor

`w2 / 76.733 s`, hero dead at `hp 0`. The suit falls 60 → 30 → 0 on a perfect 1 s/s line with
`inDome: null`, then 5 hp/s finishes her. The probe is not a difficulty rating; it is the
contract stated in five rows — **the hero lands six paces north of the only air on the map.**

## tune-1 — the measurement that set the attempt

`NOT SECURED — w18 / 548.500 s / 500 g / 81 calls`, hero down.

What it got right: the era gate closed cleanly (`worked` 4 of 4, `done: true` at **t = 412.1**,
`breathlessPans` 0), the eclipse landed at **wave 10** exactly as `ceil(secureWave/2)` predicts,
and the hero held a flat **175/175 through t = 403** in the reserve dome.

What killed it is one column. `works.byKind` reached
`{turret: 3, sentry_beacon: 4, stockpile: 2}` at **t = 290 and never moved again**, while gold
hit the 500 cap at t = 460 and `score.goldPanned` **froze at 995** for the last 88 seconds — the
income switch doing its authored job on a purse with nothing to buy. The board went on
escalating to 31 alive and the hero fell from 145 to 0 between t = 516 and t = 548.

Two distinct causes, both mine:

1. **The ladder was exhausted, not gated.** I offered ten rungs (~620 g) against ~1,200 g of
   income, and stopped there. `sentry_beacon` caps at **6** and I only ever offered 4.
2. **Turret #4 was silently deleted by my own ordinal accounting.** I kept a second rung list
   whose `seen` counter restarted at 1, while `byKind.turret` already read 3 from the first
   list — so `standing >= ordinal` skipped that rung on every view, forever. `turret: 3` at the
   end is the proof. This is the third distinct way I have broken a ladder in four heats
   (gen 81 stalled on an unfillable rung, gen 99 double-counted the instance index, gen 102 let
   the map's own furniture retire my rungs).

## attempt-1 — the scored ride

`NOT SECURED — w19 / 586.400 s / 500 g / 90 calls`, hero down **13.6 seconds short** of the
wave-20 secure at 600.000 s.

The one change worked. The unified ordinal filled the fort to **every roster cap** —
`{turret: 4, sentry_beacon: 6, stockpile: 2}`, twelve works, complete at t = 360 — and the hero
held a flat **175/175 through t = 524.9** where tune-1 was already bleeding from t = 412.
Both era gates closed early: regolith 4/4 `complete` at **t = 365.1** with `breathlessPans` 0,
eclipse at **wave 10 / t = 300** on the reserve pad as computed.

What still beat me is the same column, one rung further along: gold reached the raised **500**
cap and `score.goldPanned` **froze at 1,290** for the last ~150 seconds, because once the roster
caps are full there is nothing left to buy — and the turret tier-2 sink I wrote for exactly that
purse **never executed a single upgrade** (gold sat at exactly 500 from t = 510 to death; no
`tier` ever moved). I could not resolve why before the wall: the field name is right
(`works.entries[].position`, View.ts:186), the reach arithmetic is right (standoff 0.7 + arrival
0.5 = 1.2 against `interactRadius` 1.6), and the gate had a live window. The two candidates I
did not get to separate are (a) the standoff lands *inside* the turret's own footprint, so
`MOVE_HERO` answers `UNREACHABLE_TERRAIN` and the untravelled `CONTEXT_ACTION` then fires out of
reach, and (b) my `!needHome` guard suppressed the pair on the ~half of views where knockback had
pushed the hero out of the dome. **The next rider should log `now.orders[].reason` for the
`CONTEXT_ACTION` record before changing anything** — generation 65 lost a ride reading
"not legal here" as a claim about the contract when it was a claim about the body's position.

## Outcome

**NOT SECURED.** Best and scored: `waves 19 · timeAlive 586.400 s · gold 500 · calls 90 ·
kills 895`, `eventLogHash fnv1a32:ee785f32`.

- **Tape put forward: none.** The run died; a run that is not secured must not be submitted.
  `attempt-1-tape.json` is named in `gauntlet-outcome.json`'s `tape` field as the best reel on
  disk and is declared `secured: false` — it is evidence, not a standing.
- **Sim runs: 3** (idle probe, tune-1, attempt-1). **Scored attempts: 1.**
- Envelope, measured off the reel: `durationTicks 17592`, last accepted order at tick **17100**,
  90 entries, 253,460 B — comfortably inside every axis (the live ceiling from
  `runTapeEnvelopeForContract` is 1,938,784 B, not the charter's 592,544 summary).
- Assay instrument control-tested on the zero-order idle probe first: it replayed to its own
  header `fnv1a32:a45ba9ac`, so the instrument is sound.

## What the map asked

It asked me for **air as a wall, and it asked twice** — so this contract genuinely exercises
E8's signature mechanic (low gravity, air as wall, transfer under changed physics) rather than
wearing its name. The *air* half is the contract and it is a real two-body problem.
`now.air` publishes `suit` (`body: "hero"`, 60 s capacity, 4/s refill inside a dome, **5 hp/s**
harm outside), a per-pad `domes` dial, `regolith` (`grounds` 6, `required` 4, `windowWaves` 4,
`worked`, `creditedThisWindow`, `breathlessPans`) and an `eclipse` block no sibling map
publishes. No wave secures until four **distinct** grounds are worked, at most one per
120-second window, each while **her** suit holds air — and `notePan(anchorIndex)` reads the
hero's lungs while the **Prospector's** hands do the panning, 20–35 units out in vacuum. So the
winning shape is a body split: park her in the dome, dispatch it to a fresh ground.
`now.seams[].anchorIndex` is the direct handle that turns "pan a fresh ground" into a sort.
Then the second ask: at **wave 10** (`ceil(secureWave/2)`, derivable before the first order on a
contract that declares `firstRunWarning: false` and publishes no countdown) the shadow takes
every pad offline but `nearestToOrigin(shelters)` — the centre pad, the one that *contains* the
origin. A hero posted there from t = 0 pays nothing for the eclipse, and after it lands
`requiredAfter` is 1, satisfied by any pan on air. The *gravity* half stayed decorative
(`feelG 0.6`, `floaty`, `orbitalReturn: false`); I used the 2.4× lob only as free supplementary
`BLAST_AT` damage, on generation 29's measurement that the auto-lob is ~10 dps against the
Spark Rig's 24. **There is no E8 verb** — the whole era is answered with `MOVE_HERO` and
`HARVEST`, which is exactly what ADR-005 intended.

**My notebook remembers this map from generations 36, 49 and 69, and its rules did not move.**
Era 6 is named for rebuilt maps, and I opened braced for moved ground: all eight pins grep to
**zero** matches for this contract, and the manifest, the claim at (0,12), the three pads, the
six anchors, the roster and the wave-20 default all reproduced to the decimal. The map is **not**
named as cured this week. Its first minute: the hero lands six paces *north* of the only air on
the map with `inDome: null` and a suit falling 1 s/s — so the first order is a six-unit walk
south onto the reserve pad, the first pan lands ~t = 20, and nothing threatening happens until
wave 2. The idle floor reproduced at **w2 / 76.733 s** against generation 69's w2 / 76.0 s.

## Winnability

**Yes — winnable, and what stopped me was my own budget, not a wall in the map, the grammar, the
economy or the door:** both era gates close with 235 seconds to spare, the full roster-cap fort
(4 turrets, 6 beacons, 2 stockpiles) holds the hero at an untouched 175/175 through t = 524.9,
and the run died **13.6 seconds short** of the secure with **500 gold idle and `goldPanned`
frozen at 1,290 for the last 150 seconds** — a purse that was already refusing income while a
tier-2 sink worth ×1.65 dps on four turrets sat un-executed for reasons I ran out of wall clock
to separate.

## Lessons for my notebook

- **A second rung list restarts the ordinal and silently deletes a rung.** tune-1 split the
  ladder into CORE and SURPLUS arrays, each with its own `seen` counter; `byKind.turret` already
  read 3 from the first list, so SURPLUS's turret rung tested `3 >= 1` and was skipped on every
  view, forever — `turret: 3` at the end is the proof. **One ladder, ONE ordinal, always.** This
  is the third distinct way I have broken a ladder in four heats (gen 81 stalled on an unfillable
  rung, gen 99 double-counted the instance index, gen 102 let the map's own furniture retire my
  rungs), and each time the symptom was "the ladder looks like it is choosing not to buy."
- **Read the roster caps and treat them as the fort's ceiling before sizing the economy.**
  `turret` 4 + `sentry_beacon` 6 + `stockpile` 2 = twelve works and ~815 gold is *everything*
  this board sells. Against ~1,290 panned that leaves ~475 gold with nowhere to go, on a contract
  where the purse refuses credit at the cap. **A fort that is capped out and a purse that is
  pinned are the same fact, and the only remaining sinks are tiers and palisades.**
- **`goldPanned` frozen beside a pinned purse named the fault in both rides, eleventh generation
  running** — and this heat adds the sharpest reading of it: *at the cap, income is already being
  refused, so spending is free.* I encoded that as the `pinning` clause and it correctly bought
  the whole fort; what I failed to do was give it anything to buy afterwards.
- **Verify a new order actually EXECUTED, not just that it was emitted.** Generation 49 lost a
  ride to this exact shape on this exact map and wrote the cure down: count the successful
  executions (`entries.filter(e => e.tier > 1).length`), not the emissions. I wrote the sink,
  shipped it, and cannot say from my own log whether it was ever refused or never reached,
  because I logged neither the `CONTEXT_ACTION` record nor a tier count. **Log the field the
  latch reads, and log the refusal reason of any order you are relying on.**
- **A one-cause change with several faces is still one interpretable diff, and it paid.**
  tune-1 → attempt-1 changed the ordinal, the ladder length and the sink — all descending from
  "the purse pinned while the fort stood still" — and the result is a measurement, not a guess:
  w18 → w19, works 9 → 12, hero's flat-175 window 403 s → 525 s, pan 995 → 1,290.
- **The era gate on this map is cheap and front-loaded; the survival curve is the contract.**
  Regolith 4/4 by t = 365 and the eclipse neutralised by a post chosen at t = 0. Everything that
  decided the ride happened in the last 60 seconds of a 600-second run, against a board that
  reaches 34 alive. **Budget the heat against waves 17–20, not against the objective.**
- **Era 6 left this map's rules untouched, and proving it is a result — third heat running.**
  Grep the pins for the contract id first (four minutes), confirm the manifest against the
  notebook, then one ten-second idle probe against the remembered floor. It redirected the whole
  budget from geometry to the economy, which is where the contract actually lives.
- **`timeout` is still not on macOS and this arena still refuses shell redirection** — third and
  eleventh generation respectively. The node runner (spawn `gr-sim`, drive the controller, log
  every view to a compact table, write `gauntlet-outcome.json` plus all three envelope axes on
  every child exit) made the intermediate-results law automatic: a truthful row existed from the
  idle probe onward, the comparator promoted the scored tape with **no hand edit**, and its
  per-view table is the entire evidence base of this report.
- **Two rides is not a heat on a 600-second contract.** Each ride is ~90 s of wall plus analysis,
  and the reading budget (which was right — it produced the whole plan before the first order)
  left room for exactly one correction. The synthesis I never fired is one line: a working gold
  sink. **On a map whose fort caps out, write the sink into the FIRST controller and verify it
  executes on the first view it is legal.**
