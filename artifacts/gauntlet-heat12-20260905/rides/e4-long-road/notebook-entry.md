
## generation 50 — 2026-09-05T19:14:13.568Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-long-road
cost: wallClock 551s · setupToFirstOutput 90s · tokens in 106 / out 87341 (+cache read 13511620) over 53 turns, 33 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w5 / 157.600s / 35g / calls 15 · runs 3 · scored attempts 0 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (mechanic-changed), ride 14.
- Winnability (rider, verbatim): **Yes, winnable — this same rig secured it at w12 on the previous engine and the gate arithmetic is unchanged — and what stopped me was my own budget, not a wall: three runs against an 18-minute wall, spent on an economy that never funded the fort in time.** The proximate cause is measurable: the six harvest anchors are strung 60 units apart along a 400-unit road, so when the seam nearest the claim (−150, 14) depletes on its 20-second respawn the next live one is 90–150 units away, my nearest-first chain walked the Prospector to x = −30 for five gold, panning ran ≈ 1.0 g/s, and the fourth rung was still unbought when the wave-4 pulse landed on an undefendable hero. The fix is one line I did not get to ride — when no seam within ~40 wu of the claim is active, `HOLD` on that anchor and wait out the respawn instead of walking the map — plus buying plating over damage harder, because on a stake nothing can cover, the draft is the only defence that exists.
- What the map asked (rider, verbatim): It asked me about **distance, road and fuel — E4's signature mechanic, live, legible and decisive** — and then it asked a second, harsher spatial question that I did not answer. The era lever is real and it is not decoration: the secure is a conjunction of `wave >= 12` and `now.motor.objective.arrived`, and `arrived` for `kind: "convoy"` means the lead Hauler has cut its distance to (190,0) to essentially zero, monotonically, out of a 36-fuel run that would need 123 fuel to cross ungraded. That makes the single free `GRADE` at the road's west stake the difference between a winnable contract and an impossible one, and it is issuable in the first two seconds. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `arrived`), `now.motor.convoy` (`leaderDistance`, `total: 370`), `now.motor.roads.corridors[].start/graded` with `roads.gradeReach`, `now.motor.fuel.nodes[].harvested/progress`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `GRADE`, `MOVE_TO`, `HOLD` and (planned, never reached) `HAUL`. The *second* question is the one that beat me and it is also spatial: the map is 400 units long, the hero is welded to the convoy-lead stake at (−180, 0), and **no build zone comes within 32 wu of it** — `west-way-station` is x −148…−124, z −22…−6, whose nearest legal corner (−148, −6) sits 32.6 wu from the hero against a turret's range 16 and a beacon's radius 8. So nothing a rider builds can shoot at the thing that must survive; the works are an interdiction line 40 units up the road, and `works.wrecked` was 0 in every view because `motor_gang` carries no `wrecker` flag, so they cannot bait either. Survival, not the errand, is this contract's real content, and the errand's 380-unit round trip is spent out of the same Prospector's feet that pay for the fort. My notebook remembers this map from generation 18, which secured it w12/360 s on engine `49c34f8b`. **It still plays the way I remember in its bones and not in its margin.** Same convoy latch, same 36-fuel leash, same GRADE-or-die arithmetic, same undefendable stake, same harvest anchors 60 units apart along the road. What did not survive the re-ride is generation 18's comfort: it reports a hero that "never fell below 92" behind four works, and the same fort shape here — three of those four works, up by t=126 — had the hero dead at t=157.6. The memory was a good hypothesis about the map and an over-confident one about the margin.
- Lessons (rider, verbatim):
  - **A notebook entry that says SECURED is a claim about a margin as well as a map, and the margin
    is the part that rots.** Generation 18's geometry, fuel arithmetic and GRADE-first opening all
    reproduced exactly; its "hero never fell below 92 behind four works" did not. Re-derive the
    *survivability* of an inherited plan, not just its shape — I inherited a fort layout and assumed
    it inherited a hero that lives.
  - **Compute `distance(defended point, nearest legal build ground)` against weapon range BEFORE the
    idle probe, and let the null case set the whole plan.** 32.6 wu against turret range 16 was
    available from the manifest in ninety seconds and it says plainly: *no build defends the hero*.
    Generation 26 wrote that the null case IS the finding; I did the subtraction after two rides
    instead of before one, and then spent both of them buying a fort that the arithmetic had already
    told me could not defend the stake.
  - **A seam-depletion fallback is not optional on a map whose anchors are 60 units apart.** My
    "nearest live seam" rule is correct on a compact board and pathological on a 400-unit road: a
    20-second respawn at 33 wu is worth waiting for, a 5-gold pan at 120 wu is not. `HOLD` on the near
    anchor when nothing near is live — the wait is strictly cheaper than the walk, and the whole heat
    turned on ~1.0 g/s where ~2.0 was available.
  - **Two runs that differ in their tails but land the same works are a reproduction, not a
    control.** I changed the ladder and the seam filter and got an identical HP curve and death tick,
    which felt like a strong negative result and is actually only evidence that gold ran out at the
    same place both times. Design the second run so its *first* divergence is the variable under
    test, not its last.
  - **On a map where nothing can defend the hero, the fort is not the survival budget — the draft
    is.** Both runs took plating (maxHp 100 → 150) and still lost 100 hp in twenty seconds at wave 4.
    Generation 6 learned "when the economy is starved, the free lever is the draft"; the sharper
    version for an undefendable stake is that the draft is the *only* lever, so it should have
    outranked the third and fourth rung of a ladder that was shooting at empty road.
  - **`GRADE` remains the cheapest decisive order in the epoch, and it is not where the difficulty
    is.** Both tunes graded the road inside 15 seconds and the terminal outcome confirms it; 123 fuel
    became 19.7 for one order issued 10 wu from the hero's start. When an era lever is that cheap,
    bank it in view 0 and spend the whole rest of the heat on whatever the map is *actually* short
    of — here, hit points.
  - **Budget the heat in runs and fire the synthesis early.** Fourth heat running I have proved the
    parts and not fired the combination (gens 32, 40, 49). Probe, one diagnostic, then the synthesis —
    and the synthesis should be launched before I am sure, because at eighteen minutes a wall arrives
    whether or not the hypothesis is finished.
  - **The intermediate-results law paid again and cost nothing.** The runner writes
    `gauntlet-outcome.json` on every child exit, so a truthful row existed from the idle probe
    onward and the wall could take the session without taking the result.
