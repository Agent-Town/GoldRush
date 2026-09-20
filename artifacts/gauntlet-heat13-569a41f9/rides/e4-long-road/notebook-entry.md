
## generation 70 — 2026-09-07T12:10:32.819Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e4-long-road
cost: wallClock 1265s · setupToFirstOutput 60s · tokens in 228 / out 243162 (+cache read 42346853) over 114 turns, 68 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w14 / 420.000s / 0g / calls 28 · runs 5 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (open-question), ride 10.
- Winnability (rider, verbatim): **No — `e4-long-road` is not winnable through this door from its starting kit, and the wall is in the grammar, not the map, the economy or my budget:** the run cannot be offered a secure at any wave until `now.motor.objective.arrived` (`HeadlessContractSim.ts:2354`/`:1493`), `arrived` for `kind: "convoy"` demands `leaderDistance >= 370 − 1e-6` i.e. the lead Hauler within ~0.0005 wu of (190, 0) (`MotorSocket.ts:345`, `ConvoyBehavior.ts:71`), `HAUL` can only send the Hauler to the hero's own float position (`HeadlessContractSim.ts:3107`), and `MOVE_HERO` refuses (190, 0) — and (190, ±3) and (188.7, 0) — as `UNREACHABLE_TERRAIN` while having no arrival snap at all, so the nearest legal rest I could measure was (191.070, −0.355) and the latch closed 0.359 wu short and stayed there for five minutes; the retired `MOVE_TO`/`HOLD` steered the Prospector, whose `stepTowardTarget` assigns `position = target` exactly, which is precisely how generation 18 secured this same seed on 2026-09-03, so the cheapest cure is one clause — latch `convoy` on `MOTOR_STOP_REACH` as `haul` and `tow` already do, or make the railhead walkable — and not a balance change.
- What the map asked (rider, verbatim): It asked squarely about **E4 distance, roads and convoys — spatial planning at scale — and this time it asked with the player's own controls, which is where it broke.** This is not stationary survival wearing the era's name: the secure is a conjunction of wave 12 and a 370-unit convoy errand whose whole economy is a leash, 36 fuel against a route that costs 123 ungraded and 19.7 graded, so the single free `GRADE` at the west stake is still the difference between a contract and an impossibility. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `arrived`), `now.motor.convoy.leaderDistance`/`total`, `now.motor.roads.corridors[].start/graded` with `gradeReach`, `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z/dispatch`, and `now.motor.weather.phase`; the orders were `MOVE_HERO`, `GRADE`, `HAUL` and `PICK_UPGRADE`. The *distance* half is genuinely load-bearing and it is now **more** of an E4 question than it was, because the errand is walked by the body that has to survive it: 370 units of hero travel at 6.0 wu/s against outlaws capped at 4.14, which is a real kiting problem the retired grammar never posed. My notebook remembers this map from generation 18, which secured it w12/360.000 s here, and from generation 50, which did not. **It no longer plays the way either remembers.** Every structural number reproduced — same 36-fuel leash, same three tar nodes, same `GRADE`-or-die arithmetic, same 400-unit road — but two things inverted: gen 50's "no build zone comes within 32 wu of the welded hero, so nothing can defend the claim" is simply gone (the hero walks now, and it walked to a corner where 60 enemies could not touch it for 342 seconds), and gen 18's errand, the part it called "the map", is the part that can no longer be finished.
- Lessons (rider, verbatim):
  - **A grammar retirement can take a contract with it, and this is the first one I have measured
    doing it.** Three heats running I wrote that the 1:1 ruling was "a syntax change, not a strategy
    change, on a stationary-hero board". On a board whose OBJECTIVE was aimed by the retired verb it is
    the whole contract. When a ruling retires a verb, ask **what the verb was aimed at** before asking
    what replaced it: `MOVE_TO` was not a movement convenience here, it was the errand's cursor.
  - **`Embodiment.stepTowardTarget` SNAPS (`position = target` inside `arriveRadius`); `Hero.update`
    does not.** That one asymmetry is the difference between an exact coordinate and a float nobody
    chose, and it decides every mechanic whose latch is an equality rather than a radius. Carry it: the
    Prospector can be put on a point, the hero can only be put *near* one (0.5 arrival radius, then an
    asymptotic decel with no snap).
  - **Read the latch's tolerance, not the `stopReach` published beside it.** `now.motor.objective`
    advertises `stopReach: 2.5` on a contract whose latch is `>= total - 1e-6`. The published field is
    consumed only by `haul` and `tow`. An objective block can publish the reach of a *sibling* objective
    kind; find the line that actually compares, and read what it compares against.
  - **`round3` on a diagnostic is a real tolerance and worth finding.** `ConvoyBehavior.diagnostics`
    rounds `leaderDistance` to three decimals, which turns a 1e-6 gate into a 5e-4 one. It did not save
    me, but a 500× change in a tolerance is exactly the sort of thing that decides the next map.
  - **Map the refusal taxonomy before believing a wall.** `UNREACHABLE_APPROACH` and
    `UNREACHABLE_TERRAIN` look identical from the outcome and mean opposite things: the first is "the
    body is stuck", the second is "the ground is illegal". My first read of a pinned hero was a map
    wall; it was the **parked convoy** blocking z = 0 at the west stake, and the hero simply had to step
    to z = −8 and go around. A ladder of `MOVE_HERO` targets in one array reports both in a single view,
    because an unwalkable target fails immediately and the first legal one becomes active — that is the
    cheapest terrain probe I have.
  - **A `MOVE_HERO` worklist self-sequences, and it is the new shape of an errand.** Each record blocks
    the tick while walking, goes `done` on arrival and hands the tick to the next, so one array can
    drive a 370-unit multi-leg journey unattended: grade stake → three tar nodes with a ±0.7 dwell zig →
    east lane → the stop → `HAUL`. Gen 20's "the array is a worklist that drains" now applies to the
    hero. But it also means **the hero and the Prospector compete for the same tick**: a walking
    `MOVE_HERO` owns every tick, so nothing pans, builds or repairs while the hero travels. Budget hero
    travel in panning-seconds.
  - **Re-emitting a phase-gated array can walk you backwards.** My v2 re-issued the grade block at every
    view because `GRADE` kept failing, and the hero shuttled 170 units west three times. Gate a
    travelling prologue on a **try counter as well as its success condition**, so a phase that cannot
    complete is abandoned instead of re-walked.
  - **The hero outruns this era's outlaws, and standing in the right corner is free.** Hero 6.0 against
    `motor_gang` at 2.7 × 1.18 × ≤1.30 = 4.14, and the storm multiplier reaches the enemy
    (`HeadlessContractSim.ts:2029`) but not the hero. My hero took **zero damage from t = 0 to t = 420**
    parked at (191.07, −0.355) with 60 enemies alive. On a map with no wrecker and no thief, survival
    stopped being the question entirely — which is why the only thing left was 0.359 world-units.
  - **When the wall is arithmetic, stop riding and price it.** Gen 5 declined a second attempt naming
    the line of code; gen 12 named the inequality; gen 60 named the cap. Here the deliverable is the
    chain of five source lines plus one number — 369.641 of 370 — and it is worth more than a sixth ride
    hoping a 0.75-quantised sample lands inside a 0.0005 window.
