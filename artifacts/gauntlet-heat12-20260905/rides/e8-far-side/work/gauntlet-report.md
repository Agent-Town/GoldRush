# e8-far-side — heat 12, the mechanic-changed sweep

rig `claude__opus-5` · model `claude-opus-5` · harness Claude Code CLI 2.1.257 · generation 47
seed `e8-far-side-01`, trail · engine era `86e53f37…` (era 5, the Replayed Board) · worldModel `sim-import`

## The change, verified against the view rather than the pin prose

The era-pin says `e8-remaining-maps` "composes E8SuitAirSystem into the headless door for
e8-far-side, e8-low-orbit and e8-eclipse" and that "the three siblings' idle floors moved by
design, measured 3fe83eca->5c30efd5". My idle probe returned **`fnv1a32:5c30efd5`** — the pin's
new value exactly, so this arena is the changed engine and my notebook's memory of this map is a
hypothesis about a board that has moved.

It has moved in one place, and that place is a second secure gate:

| | generation 34 (engine `49c34f8b`) | this ride (engine `86e53f37`) |
|---|---|---|
| `now.air` | **absent from all 69 views** | **live in all 87 views**, `wall: "suit-only"` |
| secure gates | `probeRecovery.recovered` | `probeRecovery.recovered` **AND** `air.crossing.complete` |
| the crater | a walk | a walk **that must be entered with air in the suit** |

`E8SuitAirSystem.create` derives the map's one breathing dome as "the build zone that contains the
run's own start stake" — `far-side-landing-yard` (x −24..24, z −48..−30), which contains the claim
and the welded hero at (0,−36). The crossing is `probeRecoveryZones`, the same
`listening-probe-crater` rectangle (x −14..14, z 38..52) the probe sits in. `noteCrossings` credits
on an **entry**, not a step, and only while `suitSeconds > 0`; a breathless arrival is counted in
`breathlessEntries` and credits nothing, and `objectiveAllowsSecure` then refuses a secure at
**every** wave. `regolith.required` is **0** here (a crossing map skips the pan gate), so the suit's
only job is to be non-empty at the moment the body enters the crater.

That makes the whole change a round-trip air budget: 60 s of suit, draining 1 s/s outside the yard,
refilling 4/s inside it, against ~75 units of drain each way at 4.8 wu/s ≈ 15.6 s. Wide — but only
if the suit is topped up before departure, and the map quietly punishes the obvious economy: two of
the four harvest anchors, (±16,−34), sit **inside** the yard and refill the suit while you pan,
while (±9,−22) sit **outside** it and drain you. A controller that stacks on the nearest seam
without noticing which side of z = −30 it is on can arrive breathless and lose the run to a gate it
never read.

## Outcome

**SECURED.** waves **20** · timeAlive **600.000 s** · gold **200** · calls **83** · kills 923.

- Tape put forward: `/private/tmp/heat12-038cc280/artifacts/heat12/opus/e8-far-side/attempt-1-tape.json`
  — a byte-identical copy of `tune-2-tape.json`, declared in `gauntlet-outcome.json`'s `tape` field.
  **One ride under two filenames**; the rules stop the ride at the first secure, so there was no re-ride.
- **3 sim runs** (idle probe, tune-1, tune-2), **1 scored attempt**.
- Admissibility, measured off the first reel that existed rather than at the door: `durationTicks`
  **18 000**, last accepted order at tick **17 637** (363 ticks of slack), **83** entries,
  **255 350** bytes against a ~576 016-byte ceiling. All three axes clear.
- Receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own `fnv1a32:a9448c78` and all four
  outcome fields. (That is the tape header's hash, not the stdout line's `f540c405` — different
  numbers by design.)

## What the map asked

It asked me for **an air budget on a 152-unit round trip**, and on the audit question this contract
now genuinely **exercises** its era's signature mechanic where my own notebook says it did not. E8's
line is "low gravity, air as wall (transfer under changed physics)". Half of that is still theatre
and half is now the contract. The *gravity* half remains decorative: `now.gravity` publishes `feelG
0.6`, `movement: "floaty"`, `lobArcDistanceMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`, and
none of it reaches the body I move — I used the 2.4× lob only as free supplementary `BLAST_AT`
damage and never took `SET_WEAPON blast`, on generation 29's measurement that the auto-lob is ~10 dps
against the Spark Rig's 24. The *air* half is the map. The fields that carried it were
`now.air.suit.seconds/inDome/empty`, `now.air.crossing.{zones,required,reached,breathlessEntries,complete}`,
`now.air.domes[].air` (one dome, `far-side-landing-yard`) and `now.probeRecovery.recovered/zones`;
the orders were `MOVE_TO` to (0,45), **`CONTEXT_ACTION recover`** in the same draining array, and a
`HOLD` refill guard that never had to fire. Both gates shut inside one dispatch — crossing complete
at t = 255.7, probe recovered at t = 270.0, minimum suit **31.2 s of 60**, `breathlessEntries` **0**.
The honest qualifier is that the era's ask is *cheap and front-loadable*: it is one round trip out of
a 600-second contract, and the other 560 seconds are ordinary stationary survival in a generous
pocket — the yard contains the claim, so unlike its sibling `e8-mare-claim` the fort can ring the
welded hero instead of sitting six units south of it. The roster is one id with no `wrecker` and no
`thief` flag, so no work can be attacked and no gold stolen (0 wrecked of 10, `goldStolen` 0), which
deletes `REPAIR_UNDER` and palisades from the design and makes every gold a monotone investment.

**Does it still play the way my notebook remembers?** No — and that is the headline. Generation 34
secured this map having reported that `atmosphere.airIsWall: false` meant "`now.air` is simply absent
from all 69 views… the whole apparatus that made `e8-mare-claim` an E8 map is switched off by one
boolean." That sentence is now false: `airIsWall: false` no longer means no air, it means no
*breachable* dome (`breachable = atmosphere.airIsWall === true`), and a separate id-scoped consumer
supplies a suit and a crossing latch anyway. The walk my notebook remembers is the same walk; what is
new is that you must arrive still breathing.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero **never dropped below its
running maximum across all 87 views** (minimum 100, finishing 139/175 at level 29), all ten works
stood unwrecked with **every one of the four turrets at tier 2**, gold finished pinned at the 200
cap off 1 470 panned, and the era gate closed with 31.2 s of suit still in hand and not one
breathless entry — the only thing with a thin margin was tune-1's economy, which is what the ride
was actually spent fixing.

## Lessons for my notebook

- **`airIsWall: false` no longer means "no air" — re-read the consumer, not the boolean.** My
  generation-34 self wrote that one manifest flag "turns E8's signature mechanic off completely" on
  this map. `E8SuitAirSystem` now arms off an **id list** (`SUIT_AIR_CONTRACT_IDS`) plus the mere
  presence of an `atmosphere` block, and `airIsWall` survives only as `breachable` — whether a
  sieger can breach a dome. The flag I generalised from changed meaning underneath me while keeping
  its name and value. **A boolean's consumer is the fact; the boolean is a hypothesis.**
- **Two contracts in the same epoch really are different games, and now so are two engines of the
  same contract.** Generation 34's ride and this one are the same map, the same seed and the same
  terrain, and one has a suit gate the other cannot see. `assets/engine-era.json`'s pin prose named
  the drain, and the *idle floor hash it quotes* is the cheapest possible confirmation that you are
  on the changed board: one ten-second probe, one hash comparison, and my notebook's authority was
  correctly demoted before I wrote an order.
- **When an era system is small, read it end to end — it will hand you the whole contract.** Fifth
  generation running this has paid (gen 22 `NOISE_HUNT_RULES`, gen 29 `E8PhysicsSystem`, gen 34
  `ProbeRecovery`, gen 45 `usePlaybook`). `E8SuitAirSystem` is ~420 lines and its header comment
  derives, in prose, which zones become shelters and which become crossings for each of the three
  siblings. That told me the dome is the landing yard and the crossing is the crater *before* the
  probe ran.
- **Find out which side of the shelter your economy stands on.** The map's real trap is not the walk,
  it is that half the harvest anchors are inside the breathing dome and half are outside. Panning at
  (±16,−34) refills the suit; panning at (±9,−22) drains it. I gated the seam sort on
  `crossPending` so the in-yard seam is preferred only while a run-losing gate is still open, and
  distance takes over once it shuts. **When a mechanic reads the worker's position, audit every
  routine errand that moves the worker.**
- **Round-robin panning is a commute generator, and I paid generation 15's lesson a third time.**
  tune-1 alternated two seams 26 units apart with `ranked[i % n]`, buying a 5.4 s walk per 5-gold
  tick: 670 gold at **1.29 g/s** against a ~1 175-gold ladder, so the fort never finished and the
  hero died three waves short. Draining one seam in a block of 7 before walking to the next took the
  same policy to **1 470 gold** and a wave-20 secure. Gen 15 wrote "chain by seam when the seams are
  near, stack by seam when they are far" — 26 units is *far* against a 1.5 s pan tick, and I should
  measure that ratio rather than eyeball "near".
- **Ascending-price gates are the starvation bug wearing a fix's clothes.** I re-derived the ladder
  by dps-per-gold (turret 50 g → 1.14 dps/g, beacon 25 g → ~1.0, turret 70 g → 0.81 …), which on this
  price curve is simply cheapest-next — and then nearly shipped it as per-rung gates in ascending
  order, where a 35-gold beacon fires on gold a 50-gold turret is still waiting for. **Cumulative
  gating** (rung *i* gated at the sum of costs 0..*i*) makes the theft unreachable by construction
  instead of by a truncation rule. Interleaving cheap beacons with turrets is what put dps on the
  board early; tune-1's turrets-first ladder had **one** turret at wave 4 and a hero at 45/175 by
  wave 7.
- **The blank line did three jobs again and cost one line of controller.** It banked the wave-20
  secure for free (`defaultedSecure: 1`), left the last accepted order 363 ticks inside the envelope,
  and — answering unchanged views with `"\n"` — held an 87-view run to 83 entries and 255 KB against
  a 576 KB ceiling. Sixth contract running. It is standing equipment, not a trick.
- **Measure the envelope on the first reel that exists.** Ticks, entries and bytes are three
  independent ceilings and the runner now prints all three on every child exit, so tune-1 was already
  audited before tune-2 existed. Securing and producing a submittable reel are still different
  achievements.
- **The node runner is the cure for a blocked shell, and it makes the intermediate-results law
  automatic.** Redirection was refused in this arena exactly as generation 45 found. A runner that
  spawns `gr-sim`, drives the controller, logs every view to JSONL and writes `gauntlet-outcome.json`
  on every child exit gave me the per-view table that diagnosed the economy in one command — and a
  truthful row on disk from the idle probe onward.
- **Hand-write the final row.** Seventh generation where the best-so-far comparator could not know
  which run I had chosen to *call* my scored attempt, nor that the promoted tape lives under a second
  filename. The brief is explicit that the operator reads the `tape` field, not the filename; I wrote
  both and said plainly in the file that they are one ride.
