# e8-low-orbit — heat 13, generation 68 (claude-opus-5, Claude Code CLI 2.1.257)

era `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4` · seed `e8-low-orbit-01` ·
trail · worldModel `sim-import`

## What I measured, in order

1. **Idle floor** — w2 / 78.333 s / 0 g, `fnv1a32:e6813da3`. Identical to my generation-48 floor on
   this seed: the pressure curve has not moved.
2. **The contract has grown a secure gate my notebook does not have.** `twist.atmosphere` reads
   `{crossingRequired: 4, crossingWindowWaves: 4, suitSeconds: 60, harmPerSecond: 5,
   pressurisedZoneIds: ["claw-carcass-yard"]}`. `E8SuitAirSystem.objectiveAllowsSecure` requires
   `reached.size >= 2 && creditedCrossings >= 4`, and `E8AirWindow` credits **at most one entry per
   120 s window**. Only the carcass yard (x -18..18, z -14..14, holding the claim at (0,12)) has
   air; both outboard scaffold decks (|x| 26..48, z -10..10) are vacuum and ARE the crossing.
3. **tune-1 (ctrl-v1)** — w3 / 110.933 s / 30 g. It moved home to (-14, 2) to shorten the west dash
   and died of a route fault, not of the map: `MOVE_HERO {x:-14,z:2}` answered
   `UNREACHABLE_APPROACH` and the hero sat pinned at **(3.6, 2)** from t≈20 to death. This tile
   carries a static obstacle across z≈2 between roughly x = -14 and x = +4, and the hero has no
   pathfinder.
4. **Route probe (ctrl-probe2)** — five legs, **zero failures**: (0,12)↔(-27,2) and (0,12)↔(27,2)
   are clear in both directions, 28.8 units at a measured 4.8 u/s, and one out-and-back pair banks
   **both** crossing zones inside thirty seconds. The obstacle is the z≈2 lane across the middle of
   the yard, not the diagonals.
5. **tune-2 (ctrl-v2)** — w14 / 440.967 s / 45 g / 60 calls, 573 kills, 0 of 7 works ever wrecked,
   `fnv1a32:3705d684`. **The era gate was fully satisfied at t = 368.4** (`credited 4/4`,
   `reached 2`, `complete: true`) with **`breathlessEntries: 0`** — the suit never emptied once. The
   run still died at wave 14, and the per-view table says why: **the hero spends the back half of
   the run outside its own fort.** Hero positions on views where no sortie was ordered:
   (39.2, 24.3), (-44.0, -1.7), (-45.8, -25.0), (15.6, 24.6) — forty-to-sixty-unit excursions
   between views, with `windowHeldEntries` climbing to 9 from deck entries I never asked for.
   `goldPanned` went flat with it (455 at t=360 → 490 at t=441), because the Prospector drifts to a
   hero that is never near the seams.
6. **attempt-1 (ctrl-v3)** — one change: the come-home `MOVE_HERO` lifted to the top of the array,
   under the sortie and above the ladder, because `BUILD` returns `{movement: target}` (truthy, owns
   the tick) while the Prospector travels and was deleting the come-home order below it for whole
   views. **It regressed to w4 / 128.133 s / 70 g** (`fnv1a32:b7254a26`), and the regression is the
   finding: the hero ping-pongs — (40.6, -3.0) → (-31.9, 23.8) → (26.3, 2.3) → (-33.6, 24.5) — with
   growing amplitude. Under `feelG 0` / `movement: "free-fall"` the steering is thrust, not
   position: correcting toward home accelerates the body past home, and correcting again amplifies
   it. Chasing a drifting hero in free fall is worse than letting it drift.

## Outcome

**NOT SECURED.** Best measured ride: **tune-2 — waves 14, timeAlive 440.967 s, gold 45, calls 60**,
`fnv1a32:3705d684`, tape `artifacts/heat13/opus/e8-low-orbit/tune-2-tape.json` (envelope 13,229
ticks / 60 entries / last accepted order tick 13,054 / 244,113 bytes — comfortably admissible had it
secured). Scored attempt `attempt-1` came in at w4 / 128.133 s / 70 g and is worse.
**5 sim runs; 1 scored attempt. Nothing is put forward** — `gauntlet-outcome.json` names tune-2 as
the best row with `"scored": false` and `"secured": false`, and no reel should be submitted.

## What the map asked

It asked its era's signature mechanic — **E8 low gravity, air as wall, transfer under changed
physics** — squarely, in *both* halves, and for the first time on this contract both halves are
load-bearing. My notebook's generation 35 called the mechanic "fully implemented and structurally
optional"; generation 48 secured here at w20/200 g with the crossing discharged for free by the
harvest tail at t = 25. **Both readings are dead.** The *air* half is now a genuine secure gate with
a genuine budget: `now.air.crossing` publishes `zones`, `required: 4`, `reached`, `credited`,
`windowWaves: 4`, `window`, `creditedThisWindow`, `windowHeldEntries`, `breathlessEntries`, and
`now.air.suit` publishes `body: "hero"`, 60 s capacity, 4/s refill and 5 hp/s of harm — no wave
secures until the human has stood in both vacuum decks on air and banked four entries at one per
120 s window. That is real spatial planning (five windows, four credits, a 57.6-unit round trip
each) and I solved it: 4/4 by t = 368 with zero breathless entries and 232 seconds of slack. The
*gravity* half is what actually decided the contract, and it only became decisive because the
grammar changed underneath it: `MOVE_HERO` now positions a body that `feelG 0` and
`knockbackScale 1.75` will not let stand still, on a map where `LowOrbitSystem.controlScale` halves
thrust off the handhold spine. The fields that carried the ride were `now.air.crossing.*`,
`now.air.suit.seconds/inDome`, **`now.hero.x/z`** (a field I had never needed on this map before),
`now.works.entries`, `now.seams[].active/x/z`, `now.gold` against `now.score.goldPanned`, and
`now.orders[].status/reason`. Orders used: `MOVE_HERO`, `HARVEST`, `BUILD`, `PICK_UPGRADE`,
`BLAST_AT`, `CONTEXT_ACTION upgrade`, and one blank line — **not one E8 verb, because E8 has none.**
Does it still play the way my notebook remembers? No. Same claim, same three decks, same four
harvest anchors, same idle floor to the tenth of a second — plus a secure gate that did not exist,
to be answered with a body that could not previously be moved.

## Winnability

**Winnable, and what stopped me was my own budget against one un-modelled physics fact — not a wall
in the map, the grammar or the economy:** the era gate discharges with 232 s to spare and zero
breathless entries, no work can ever be wrecked (the roster's one id carries neither `wrecker` nor
`thief`), and the fort was still buying at wave 12 — the run dies only because under `feelG 0` the
hero's steering is thrust rather than position, so it coasts forty to sixty units out of its own
turret ring and every naive correction overshoots (measured: chasing it home cost ten waves, w14 →
w4), and I ran out of wall clock before riding the controller that damps instead of chases.

## Lessons for my notebook

- **A notebook entry can be dead in BOTH directions on the same map in one heat.** Generation 35
  called Low Orbit's era lever "fully implemented and structurally optional"; generation 48 secured
  here with the crossing discharged for free by the harvest tail at t = 25. This heat the same
  contract carries `crossingRequired: 4` under a 120 s window, measured against **the hero**, and it
  gates the secure. Read `twist.atmosphere`'s four numbers off the contract JSON every single ride —
  the mechanic's existence, its BODY and its COUNT are three separate facts and all three have now
  moved on this one map.
- **When a ruling retires a verb, re-derive the PHYSICS, not the syntax.** Three heats running I
  wrote that the 1:1 grammar change was free on a stationary-hero board. On a `feelG 0` board it is
  the opposite. `StandingOrders`' own comment — "the hero has no drift, so hold the hero here is
  already MOVE_HERO plus silence" — is true under gravity and **false in free fall**: silence is not
  a hold where nothing decelerates, and `HOLD`, the verb that used to make standing still free, is
  gone.
- **In free fall, MOVE_HERO is a thrust order, so correcting a drift AMPLIFIES it.** Measured on one
  changed variable: letting the hero coast reached wave 14; re-issuing "come home" first in every
  array reached wave 4, with the body ping-ponging (40.6,-3) → (-31.9,23.8) → (26.3,2.3) →
  (-33.6,24.5). **Never chase a body whose controller is an accelerator.** The move I never got to
  ride is to damp: aim the correction at a point *between* the body and home, sized to the overshoot,
  or simply stop ordering movement at all once the errand is banked and let the fort come to the
  hero.
- **A corrective order below a travelling verb is a corrective order that does not exist.** `BUILD`
  returns `{movement: target}` — truthy — while the Prospector walks, and the first truthy order owns
  the tick, so four gold-gated `BUILD` rungs silently deleted my come-home order for whole views.
  Generation 65 learned "put come-home above the tail"; the sharper rule is *above the ladder*. (It
  was still the right ordering fix and still the wrong policy — two independent facts.)
- **The hero has no pathfinder, so a lane is a measurement, not an assumption.** `MOVE_HERO` walks a
  straight line and refuses `UNREACHABLE_APPROACH` after four seconds without progress. Low Orbit
  carries a static obstacle across z≈2 between x ≈ -14 and +4 that pinned tune-1's hero at (3.6, 2)
  for an entire run. **Probe the routes before designing around them:** a five-leg `MOVE_HERO` chain
  in one throwaway ride cost sixty seconds of sim and returned the whole navigable geometry — both
  diagonals clear, and one out-and-back pair banking both crossing zones in thirty seconds.
- **Read the latch's conjunction, then read what each term counts.** `reached.size >= zones` and
  `credited >= required` are different counters on different clocks: `reached` is never window-gated
  and was full after the first pair of sorties, while `credited` is one per window and took four.
  Log both — generation 67 lost minutes on the Far Side reading `reached` when the latch reads
  `credited`, and logging only `credited` here would have hidden the opposite half.
- **The window picks the hour, not your health bar.** Four credits, five windows, one each: take the
  trip at the window's first view when the wave is youngest, and take the far deck on the opening
  empty board so `reached` is banked before anything can punish it. `breathlessEntries` was 0 across
  61 views — on this map the suit was never the problem, the ballistics were.
- **`goldPanned` flat while the hero wanders is a THIRD failure signature.** I already carry "flat
  pan + capped purse = dead sink" and "flat pan + low gold = the worker is not working". The new one
  is *flat pan + a hero fifty units from home*: the Prospector drifts to the hero, so a hero that
  cannot hold its ground is also an economy that cannot pan. One column, three diagnoses.
- **Budget the heat in runs and fire the synthesis early — tenth heat running, and this time the
  reading was right and the RIDING was late.** Four minutes in `E8SuitAirSystem`, `E8AirWindow` and
  `LowOrbitSystem` produced the entire contract before the first order, and the route probe was the
  best sixty seconds I spent. What I never left room for was the run that combines tune-2's proven
  route with a *damped* hero correction and the tier-2 purse sink. That run is one edit from tune-2,
  and it is the one I would ride first next time.
