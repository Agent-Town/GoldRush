# e4-long-road — heat 14, era 6 "the Re-surveyed Claims"

rig `claude__opus-5` · generation 129 · worldModel `sim-import` · engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`

## The open question on the owner's desk — ANSWERED

My own generation 70 priced this contract as **not winnable through the door**, and named the line:
`arrived` for `kind: "convoy"` demanded `leaderDistance >= total − 1e-6` — the lead Hauler within
~0.0005 wu of (190, 0) — while `HAUL` can only drive to the hero's float position and `MOVE_HERO`
has no arrival snap. It measured the latch closing **0.359 wu short** and recommended one clause:
*latch `convoy` on `MOTOR_STOP_REACH` as `haul` and `tow` already do, or make the railhead walkable.*

**That cure has shipped.** `src/sim/MotorSocket.ts:345` now reads:

```
// The railhead itself is solid terrain; settle at its reachable edge like the other errands.
if (!convoy.arrived && after.state === 'arrived' && this.nearStop(after)) {
```

and `nearStop` (`:641`) is `Math.hypot(vehicle.x − stop.x, vehicle.z − stop.z) <= MOTOR_STOP_REACH`.
The view agrees: `objective.stopReach` publishes **2.5**. The equality is gone; the latch is a radius.

**The contract is now winnable, and this ride is the receipt:** secured w12 / 360.000 s, the convoy
latching at t = 117.3 with the Hauler resting at (192.05, −1.26) — **2.358 from the stop against a
2.5 reach.**

One honest qualifier the county should have, because it is the whole remaining margin: the cure is
load-bearing but **not generous**. The hero cannot reach (190, 0) or anything near it from the west —
walking the road at z ≈ 0 it is walled at **x = 185.26** (4.75 from the stop, still outside the reach),
and (190, ±2.1) answer `UNREACHABLE_TERRAIN` while (188.2, 0), (191.07, −0.36), (191.6, ±0.9) and
(192.2, 0) all answer `UNREACHABLE_APPROACH`. The only way in I found is to **route around the
railhead footprint**: (184, −13) → (196, −13) → (196, −2) → (191.8, −1.2), which lands the hero at
(192, −1.25). That is 2.358 from the stop — **0.142 wu inside the latch**. A rider that walks the
road straight at the railhead, as the twist's own prose invites ("walk east ahead of it"), still
misses by 2.24 wu and never learns why.

## Outcome

**SECURED** — waves **12**, timeAlive **360.000 s**, gold **30**, calls **30**, kills 246.
Errand: `convoyArrived: true`, `arrivedAt: 117.3`, `graded: ["the-long-road"]`, `tarHarvested: 9`,
`fuelDrawn: 24.386` of 36, `roadDistance: 371.25`.

Tape put forward: **`attempt-1-tape.json`** (declared in `gauntlet-outcome.json`'s `tape` field).
It is a **byte-identical copy of `tune-2-tape.json` — one ride under two filenames**; tune-2 secured,
so the stop rule ends the heat there and the securing tune is promoted by name.

**3 sim runs** (idle probe, tune-1, tune-2) · **1 scored attempt**.

Envelope, measured off the reel: `durationTicks` 10 800, last accepted order at tick **10 434**,
**30** entries, **73 963** bytes — inside every axis with room (the live ceiling from
`runTapeEnvelopeForContract`, not the charter's summary of it).
Receipt: the local assay reproduces the **tape header's** `fnv1a32:20ec99c3` and all four outcome
fields, with `securedSnapshot {waves 12, gold 30, timeAlive 360}` agreeing with the declared gold.
(The stdout outcome line's `fnv1a32:f776100f` is a different number by design.) The zero-order idle
probe was replayed first as a control and matched its own header.

Expiry check: the idle probe reproduced `assets/contracts/null-floors.json` **byte for byte** —
w4 / 134 433 ms / 0 gold / 44 kills / `fnv1a32:a7ffb1c9`. None of era 6's eight pins names this
contract. The re-survey moved this map's rendering, not its rules; what moved is the convoy latch.

## What the map asked

It asked about **distance, roads and fuel — E4's signature mechanic, live, load-bearing, and gating
the secure** — and for the first time on this contract the era's lever is answerable. `arrived` is
ANDed into the secure at every wave, so no wave count secures this claim until the town has made its
370 units. The leash is real arithmetic and it bound: three tar nodes × three tar × four fuel = **36
total** against a Hauler that burns 3/second **by the clock**, so 380 units of ungraded road costs
~123 fuel and the contract is impossible without the single free `GRADE` at the west stake — eight
units from where the hero starts, issuable in the first two seconds. Graded, the same drive measured
**24.386 fuel** (the storm stretches every second the Hauler moves; `stormMovementMultiplier` is 0.7
on a 30-second cycle). The fields that carried it were `now.motor.objective` (`kind`, `stop`,
`stopReach`, `arrived`), `now.motor.convoy.leaderDistance`/`total`, `now.motor.roads.corridors[].start/graded`
with `gradeReach` 2.5, `now.motor.fuel.nodes[].harvested` with `tar`/`stored`/`drawn`,
`now.motor.vehicle.state/x/z` and `now.motor.weather.phase`. The orders were **`MOVE_HERO`,
`GRADE`, `HAUL`** plus `HARVEST` and `PICK_UPGRADE` — **not one E4 verb, because E4 has none**; the
whole era is answered with the player's own controls, exactly as ADR-005 intended.

Distance shaped the *defence* too, and that is the second half of the ask. The map is 400 units long,
no build zone comes within 32 wu of the claim, and the hero must walk ~400 units to run the errand —
so the fort is not a thing you buy, it is a place you stand. I built nothing all run.

My notebook remembers this map from generations 18 (secured on era 5), 50 and 70. **It does not play
the way any of them remember.** Generation 50 opened from a welded hero that could not defend its own
stake; generation 70 opened from a latch that could not be hit. Both sentences are dead: the hero
walks, and the latch is a radius. Everything structural reproduced to the decimal — the 36-fuel leash,
the three tar nodes on the z = −8 line, the corridor from (−190, 0) to (190, 0), the convoy `total` of
370, the wave-12 gate, the idle floor.

## Winnability

Secured, and the margin was **wide on survival and 0.142 world-units thin on the latch**: the hero
held 92/100 from t = 90 unbroken to the bank (finishing 117/125 after the plating picks), nothing was
ever wrecked, and the errand banked 243 seconds early with 11.6 fuel spare — but the only reachable
rest is 2.358 from a stop whose reach is 2.5, and the straight road approach misses it by 2.24.

## Lessons for my notebook

- **A priced impossibility is a bug report, and this is the first time I have watched one of mine get
  fixed and then ridden the fix.** Generation 70 named the line (`leaderDistance >= total − 1e-6`),
  named the cure (latch on `MOTOR_STOP_REACH` like `haul` and `tow`), and the cure shipped with a
  source comment that states the reasoning: *"The railhead itself is solid terrain; settle at its
  reachable edge like the other errands."* Fifth heat running that an inherited **verdict** was the
  expensive clause to re-test (gens 80, 82, 97, 99, 105 — and now a "no" rather than a ceiling).
  **Re-read the latch before inheriting my own impossibility; the county reads these reports.**
- **`stopReach` in the view is the fastest possible check on a Motor map's verdict.** Generation 70
  had to trace five source lines to find the equality; one line of view 0 —
  `objective: {..., stopReach: 2.5}` — plus one grep of `settleX` says whether the latch is a radius
  or an equality. `haul`, `tow` and `deliveries` always used the reach; `convoy` was the outlier, and
  now it is not.
- **The hero has no pathfinder, so a refused approach is a ROUTING problem, not a coordinate problem.**
  tune-1 tried seven candidate rests, all within 2.5 of the stop, and every one refused — because they
  were all aimed *through* the railhead's west face from x ≈ 185. A four-leg detour around the
  footprint at z = −13 reached a point 2.358 away on the first try. **When a ladder of targets all
  refuse, stop varying the target and start varying the APPROACH** — gen 116 learned to aim off a
  marker, gen 124 learned to read `UNREACHABLE_APPROACH` as "this body is walled off"; the synthesis
  is that a walled body needs waypoints around the wall, and straight-line legs are the only tool.
- **Read `UNREACHABLE_TERRAIN` and `UNREACHABLE_APPROACH` as different instructions, and let the
  controller act on the difference.** TERRAIN retires a coordinate; APPROACH retires a *route*. My
  v2 advanced the whole route index when the terminal leg refused and only the leg index otherwise,
  which is what let five routes be tried inside one ride without a stall.
- **`HAUL` captures the hero's position at dispatch, so the hero is free the instant it fires.** That
  decouples the errand from survival completely: park, dispatch, then walk away and never stand still
  again. Gating the dispatch on `dist(hero, terminal) < 1.2` **and** the vehicle still being short of
  the stop is what stopped a later re-dispatch from dragging the Hauler back off the railhead.
- **Standing still at the east end is lethal and I had inherited the opposite belief.** Generation 70
  reported "zero damage parked at (191.07, −0.355) from t = 0 to t = 420"; tune-1 parked at (185.26, 0)
  and went **92 → 0 in five seconds** at wave 4 with 52 alive. The pocket east of the railhead wall,
  which v2 ended up trapped in, is the safe one — 92/100 held for 270 seconds there. **A predecessor's
  survival measurement is about the coordinate it actually stood on, not about the region.**
- **A `MOVE_HERO` phase chain must emit only the REMAINING legs, and the index must advance on BOTH
  arrival and refusal.** Re-emitting a completed chain walks the hero backwards (gen 70's own lesson);
  tracking `state.leg` by proximity (< 1.0) and by refusal record is four lines and it made the errand
  a state machine over the view rather than a script.
- **What I left on the table, named precisely: gold.** 30 banked of a 200 cap, because the three live
  seams sit at (−90, −14), (−30, 14) and (90, 14) — 101+ units from where the hero must end up, and
  the Prospector drifts to the hero. The errand is worth ~80 seconds of the run; everything after
  t = 117 was a hero walking in circles while a `HARVEST` tail failed at range. A rider with another
  attempt should pan `gold-seam-2` (90, 14) *on the way east* during the walk from the tar nodes, when
  the Prospector is already passing it, rather than trying to reach back for it from the railhead.
- **The runner before the probe, sixteenth heat running.** This arena refuses shell redirection and
  compound `cd`; my first two commands died to exactly that. The node runner (spawn `gr-sim`, drive
  the controller, log every view to a compact table, write `gauntlet-outcome.json` plus all three
  envelope axes on every child exit) made the intermediate-results law automatic and its per-view
  table located tune-1's wall — `v=(185.25,0)arrived` beside `arr=false` — in a single read.
