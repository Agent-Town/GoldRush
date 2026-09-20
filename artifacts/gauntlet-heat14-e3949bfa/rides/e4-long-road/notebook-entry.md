
## generation 129 — 2026-09-18T10:05:27.275Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e4-long-road
cost: wallClock 551s · setupToFirstOutput 150s · tokens in 98 / out 116124 (+cache read 24108432) over 49 turns, 22 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 30g / calls 30 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:20ec99c3, rank 1. Heat 14 (open-question), ride 33.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and 0.142 world-units thin on the latch**: the hero held 92/100 from t = 90 unbroken to the bank (finishing 117/125 after the plating picks), nothing was ever wrecked, and the errand banked 243 seconds early with 11.6 fuel spare — but the only reachable rest is 2.358 from a stop whose reach is 2.5, and the straight road approach misses it by 2.24.
- What the map asked (rider, verbatim): It asked about **distance, roads and fuel — E4's signature mechanic, live, load-bearing, and gating the secure** — and for the first time on this contract the era's lever is answerable. `arrived` is ANDed into the secure at every wave, so no wave count secures this claim until the town has made its 370 units. The leash is real arithmetic and it bound: three tar nodes × three tar × four fuel = **36 total** against a Hauler that burns 3/second **by the clock**, so 380 units of ungraded road costs ~123 fuel and the contract is impossible without the single free `GRADE` at the west stake — eight units from where the hero starts, issuable in the first two seconds. Graded, the same drive measured **24.386 fuel** (the storm stretches every second the Hauler moves; `stormMovementMultiplier` is 0.7 on a 30-second cycle). The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `arrived`), `now.motor.convoy.leaderDistance`/`total`, `now.motor.roads.corridors[].start/graded` with `gradeReach` 2.5, `now.motor.fuel.nodes[].harvested` with `tar`/`stored`/`drawn`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`. The orders were **`MOVE_HERO`, `GRADE`, `HAUL`** plus `HARVEST` and `PICK_UPGRADE` — **not one E4 verb, because E4 has none**; the whole era is answered with the player's own controls, exactly as ADR-005 intended. Distance shaped the *defence* too, and that is the second half of the ask. The map is 400 units long, no build zone comes within 32 wu of the claim, and the hero must walk ~400 units to run the errand — so the fort is not a thing you buy, it is a place you stand. I built nothing all run. My notebook remembers this map from generations 18 (secured on era 5), 50 and 70. **It does not play the way any of them remember.** Generation 50 opened from a welded hero that could not defend its own stake; generation 70 opened from a latch that could not be hit. Both sentences are dead: the hero walks, and the latch is a radius. Everything structural reproduced to the decimal — the 36-fuel leash, the three tar nodes on the z = −8 line, the corridor from (−190, 0) to (190, 0), the convoy `total` of 370, the wave-12 gate, the idle floor.
- Lessons (rider, verbatim):
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
