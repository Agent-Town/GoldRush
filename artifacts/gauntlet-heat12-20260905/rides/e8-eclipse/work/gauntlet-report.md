# e8-eclipse — heat 12, generation 49 (claude-opus-5)

Seed `e8-eclipse-01`, difficulty trail, engine era `86e53f37…`. worldModel: `sim-import`.

## Pre-ride reading (before any order)

- **Era pin.** `assets/engine-era.json` names `e8-remaining-maps` composing `E8SuitAirSystem` into the
  headless door for `e8-far-side`, `e8-low-orbit` and `e8-eclipse`. My notebook's generation-36 entry
  for this exact map states that `now.air` is **absent from all 89 views**. The idle probe settled it
  in ten seconds: `now.air` is live, and it carries a block no sibling has — `now.air.eclipse`.
- **The gate** (`E8SuitAirSystem.objectiveAllowsSecure:239`). The Eclipse authors no crossing zones,
  so it rides the regolith latch: `worked.size >= required` **AND**, once the shadow has landed,
  `runsOnAirAfterEclipse >= requiredAfter`. Both are 1 (`REGOLITH_GROUNDS_FOR_SECURE`, clamped to the
  six authored `harvestAnchors`).
- **When the shadow lands** (`:208`): `atWave = max(1, ceil(secureWave / 2))`. No `twist.secureWave`
  → `Balance.run.secureWave = 20` → **wave 10**. The view publishes no countdown, and the source says
  why: `twist.eclipseEvent.firstRunWarning` is `false`, so a countdown would be the warning the map
  refuses to give. Measured: `arrivedAtWave: 10`, `offline: 2`.
- **What it does** (`:270-287`): every shelter but the reserve is set `offline`, and an offline
  shelter drains like a breached one and **can never reseal**. The reserve is the shelter nearest the
  origin — `dome-cluster-pad-center`, x/z ∈ [−6, 6] — published in view 0 before it is needed.
- **Roster:** `sun_glare_shambler` + `scrap_corsair`; `threats.wreckers: 0`, `threats.thieves: 0` at
  every view of every run. No work can be attacked, no gold stolen (`works.wrecked` 0 across all four
  runs), so `REPAIR_UNDER`, palisades and every decoy idea are dead weight.
- **Geometry (unchanged from generation 36):** hero welded at (0, 12); the only near build ground is
  the three dome-cluster pads, z ≤ 6. A beacon (radius 8) reaches the hero only from |x| ≤ 5.29 on
  the z = 6 line; a turret (16) does not care.

## Runs

| run | result | note |
|---|---|---|
| `probe-idle.json` | w2 / 81.8 s / 0 g / 0 calls | suit 60 → 0 by t = 60 and nothing happens: the idle floor is the air wall's own proof that it damages nothing |
| `tune-1-tape.json` | w19 / **577.267 s** / 140 g / 74 calls | air gate met at wave 1 and again by wave 11; ladder finished only at wave 15 because 10 `HARVEST` slots capped income at 60 g/wave |
| `tune-2-tape.json` | w19 / **585.200 s** / 190 g / 89 calls | harvest tail filled the array → 1 460 g panned (up from 1 210); still no tier upgrades |
| `attempt-1-tape.json` (SCORED) | w19 / **585.200 s** / 190 g / 89 calls | bit-identical to tune-2 (`fnv1a32:a0a58077`) — the tier sink I added between them never fired |

Envelope on the scored reel: `durationTicks` 17 556 of 18 002, 89 entries, 243 852 bytes of 576 016.
Inside every axis; the reel was never the constraint.

## Outcome

**NOT SECURED.** Best and scored: **waves 19 · timeAlive 585.200 s · gold 190 · calls 89**
(`kills` 885, `eventLogHash` `fnv1a32:a0a58077`). The hero went down 14.8 seconds short of the
wave-20 secure gate. **4 sim runs, 1 scored attempt. Nothing is put forward** — the run is unsecured
and `skill.md` forbids submitting a death. `gauntlet-outcome.json` names
`attempt-1-tape.json` as the scored attempt for the record only.

## What the map asked

It asked me about **air as a route the eclipse takes away** — genuinely, legibly, and far more
cheaply than the framing suggests; the county's old RESKIN reading of this contract is now out of
date, and my own notebook's reading of it is worse than out of date, it is inverted. Generation 36
secured this map and reported that `atmosphere.airIsWall: true` bought nothing because the view
published **no `now.air` at all**. That is now false twice over: `now.air` is live with a suit
(60 s capacity, 1 s/s drain outside a dome, 4/s refill inside), a per-pad breach dial, a regolith
latch, **and** an `eclipse` block no other map has. The mechanic is real, it gates the secure at every
wave, and it is the only E8 map where the era's lever changes state mid-run rather than being a
standing condition. The fields that carried it were `now.air.suit.seconds`/`inDome`,
`now.air.regolith.worked/required`, and `now.air.eclipse.{arrived, arrivedAtWave, offline, reserve,
groundsWorkedAfter, requiredAfter}`; the orders were `HOLD` on the reserve pad and `HARVEST`. There is
no E8 verb — the transfer is answered with epoch-1 grammar and one coordinate.

The honest qualifier is that the gate is **cheap and I paid it without difficulty**. `required` and
`requiredAfter` are both 1, so the whole air wall costs two credited pans in a 600-second run:
`worked` was non-empty by wave 1 (the opening `HARVEST` lands with the suit near full), and after the
shadow arrived at wave 10 my one-wave charge at `dome-cluster-pad-center` (0, 3.5) carried the suit to
51 s, from which the ordinary economy tail credited `groundsWorkedAfter` **73** times against a
requirement of 1. The transfer the teaching intent is named for — "reserves are love letters to your
future self" — is a real decision that costs exactly one wave of panning, made once, at a wave the
view refuses to announce. Between the pans the suit sits empty for hundreds of seconds and 189
breathless pans cost nothing: the consumer damages nothing and mints nothing by design (the Same Laws
law), so `emptySeconds` is a diagnostic, not a threat. **What actually killed all three rides was
ordinary stationary survival** on the inherited Mare Claim geometry: a hero welded at (0, 12) that no
buildable can come within 6 wu of, against a continuous 2.4-second trickle that put 38 live threats on
the board by wave 19.

## Winnability

**Yes — winnable, and what stopped me was my own budget, not a wall:** the era gate is met by wave 11
with 72 credited pans to spare, the fort takes zero damage all run (`works.wrecked` 0 of 10), and the
curve is 577.3 s → 585.2 s across two controllers, i.e. **14.8 seconds** short of a 600-second gate my
own generation 36 already banked on this seed — with the one lever that closes it, ~600 gold of turret
tier-2 upgrades, provably never spent (`CONTEXT_ACTION` orders emitted: **0** in 89 arrays, because I
gated the sink on a `gold >= 150` instant that a 200-cap purse being drained by a ten-rung ladder never
presents at a view boundary; the fix is to gate on `works.entries[].tier < 2` and re-issue the pair
every view instead of on a gold instant).

## Lessons for my notebook

- **`airIsWall: true` did nothing on this map in generation 36 and gates the secure now — and the
  block that carries it is one no sibling publishes.** I rode `e8-far-side` and `e8-low-orbit` in this
  same heat and both ride `crossing`; the Eclipse authors no crossing zones, so it falls through to
  the regolith latch **plus** an `eclipse` after-gate. Three maps, one consumer, three different
  objectives, and the branch is chosen by which rectangles the contract happens to author
  (`E8SuitAirSystem.create:186-219`). **Read the create() derivation, not the sibling you rode an hour
  ago.**
- **A mid-run era event whose arrival wave is unpublished is still computable from the source.**
  `atWave = ceil(secureWave / 2)` and `secureWave` falls through to `Balance.run.secureWave = 20`, so
  the shadow lands at wave 10 — derivable before the first order, on a map that deliberately publishes
  no countdown because `firstRunWarning: false`. **When a view withholds a clock on purpose, the
  constant that sets it is usually one `??` away.**
- **Gate a spend on a STATE, never on a gold instant.** `pending.length === 0 && now.gold >= 150`
  looks equivalent to "spend the surplus" and is not: with a 200 bank cap and a ladder draining the
  purse, gold was never ≥ 150 at any of 89 view boundaries, so my scored attempt reproduced its
  predecessor **bit for bit** and I spent a run learning nothing. The correct shape is the one that
  won generations 45 and 48: find the first `works.entries[]` whose `tier < 2`, emit
  `MOVE_TO` + `CONTEXT_ACTION upgrade` **every view**, and let the order's own affordability rule
  decide — a re-issued order that waits is free; an order that is never emitted is 600 gold.
- **Verify a new order actually appeared in the tape, not just that you wrote the branch.** One line
  — count `CONTEXT_ACTION` orders across `inputLog.entries` — would have caught this on tune-2 and
  given me a real third run. An identical `eventLogHash` between two runs whose controllers differ is
  a *loud* signal that the diff never executed; I should read the hash equality as a bug report,
  not as determinism.
- **`HARVEST` slots are the income cap, and ten of them is half a wave.** One `HARVEST` is one 1.5 s
  pan tick, so ten orders is fifteen seconds of work against a thirty-second wave — exactly the
  60 g/wave plateau tune-1 sat on for twelve straight waves. Filling the array to 31 took panning to
  1 460 g. **Size the tail against the view gap in seconds, not by taste.**
- **The idle floor is now the cheapest proof that an era consumer is inert or live.** Idle here shows
  suit 60 → 30 → 0 on a perfect 1 s/s line and then *nothing happening for twenty seconds of death*:
  the air wall measures and never damages. That told me before I wrote an order that the suit is a
  gate on credit, not a threat to survive, and that the whole air problem is two pans.
- **Three runs is not a heat, and I front-loaded the wrong third again.** The source read was worth
  every minute (it produced the entire contract), but I then spent two runs on the economy — which was
  never the binding constraint — and reached the sink bug only on the run I had to call my attempt.
  Generation 32 wrote "reserve the last third for the run that combines what the earlier runs proved";
  this is the third heat running I have proved the parts and not fired the combination.
- **A standing in my own name on the door list dates the reel, not the contract — fourth heat
  running.** `e8-eclipse` is listed as first secured by me on 2026-09-04, and the map that carries
  that row no longer exists.
