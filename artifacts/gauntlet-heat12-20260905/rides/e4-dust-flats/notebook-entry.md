
## generation 51 — 2026-09-05T19:32:14.387Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-dust-flats
cost: wallClock 1081s (WALL HIT at 1500s) · setupToFirstOutput 75s · tokens in 200 / out 136826 (+cache read 28330494) over 100 turns, 61 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w14 / 426.133s / 55g / calls 52 · runs 5 · scored attempts 1 · worldModel sim-import. Door: POST ok, stored, rank 1 decidedBy crown; assay slip not yet issued at the time of writing. Heat 12 (mechanic-changed), ride 15. The driver crashed before this step on a verdict-slip.json containing the literal string 'undefined'; the operator ran it by hand and cured poll-verdict.mjs so it never writes that file when there is no slip.
- Winnability (rider, verbatim): **Yes — winnable, and what stopped me was my own budget against a measured economy, not a wall in the map, the grammar or the door:** the era gate is discharged at t = 30.8 with 20 of 36 fuel unspent, the roster carries neither `wrecker` nor `thief` so no work can ever be lost, and the fort geometry is solved in closed form — the whole contract reduces to whether 397 seconds of a single Prospector can pay 340 gold for four turrets across a 42 wu seam and a 45 wu fort, and at the 0.60 g/s my best ride actually measured it pays for exactly three, which is why I died 23 seconds before the boss arrived; two of my five runs went to self-inflicted controller faults (a blacklist that poisoned all twenty build coordinates on transient `insufficient_gold` refusals, then an `active`-filtered harvest tail that emptied itself and froze the purse for 90 seconds) rather than to the one question the board was asking, and the untested lever that closes a 100-gold gap is plain — tune-1 measured **0.90 g/s** rotating across live seams against tune-3's **0.60 g/s** camping one.
- What the map asked (rider, verbatim): It asked me about **distance, road and fuel — E4's signature mechanic, live, legible and load-bearing — and then it asked the same question a second time in the shape of a boss.** This is not stationary survival wearing the era's name at either end. The errand is half the win condition, not a flourish: `now.motor.objective.arrived` is ANDed into the secure gate at every wave, and the fuel arithmetic is a real leash — the whole run holds 36 fuel and the naive open-country haul costs 27.5 clear or ~39 under a storm, so a rider that does not stage at the corridor stake and `GRADE` first can strand the objective outright and make the contract unsecurable however long it survives. The fields that carried it were `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`), `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.roads.corridors[].start/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO`, `GRADE` and `HAUL`. The boss is the second spatial question and it publishes its own counter — `land_yacht_orbit` gives centre, radius and angular speed in the view, so the fort placement is a closed-form arc problem rather than a guess, and `land_yacht_crane` (reach 6, `damage: target.maxHp`, `targets: turret`) tightens it into a two-sided inequality on the turret radius. The middle of the run — waves 3 to 13 — is ordinary stationary survival on a starved 42 wu commute. Call it two-thirds of an era, bracketed at both ends. **Does it still play the way my notebook remembers?** In its bones yes and in its margin no. Generation 16 secured this map at w14 / 437.967 s on engine `49c34f8b`, and every structural number it recorded reproduced exactly: the same claim, the same three tar nodes, the same `camp-to-railhead` stake, the same 82.5 wu naive drive, the same orbit at radius 24. What did not reproduce is the *comfort*. Gen-16 reports the errand latching at t = 60.5 and the hero holding 95/175 from wave 7 to wave 12 behind four turrets and three beacons; I latched the errand **twice as fast, at t = 30.833**, and still could not fund four turrets before the pressure curve crossed me. The idle floor is w2 / 79.033 s and the hero takes 32 damage inside wave 1. My honest reading is that the map is the same and the survival margin is thinner than my notebook's prose implies — which is exactly the correction generation 50 wrote about `e4-long-road` on this same era, on the same epoch, one ride earlier.
- Lessons (rider, verbatim):
  - **`insufficient_gold` is not a bad coordinate — never blacklist on it.** My refusal blacklist
    (gen-35's third piece: let the view tell you which candidate to strike) has been standing
    equipment for sixteen generations and it had never once met a *transient* refusal. Here a
    `when.goldGte` gate opened at the wrong price, the Prospector walked 45 wu, the build was refused
    for money, and I struck the coordinate off. Twenty candidates died that way in one run and the
    fort stopped at one turret while 200 gold sat in the purse. **Partition refusal reasons into
    GROUND (`out_of_zone`, `collision`, `out_of_reach`, `cap_reached` — poison the coordinate) and
    ECONOMY (`insufficient_gold` — poison nothing, retry).** A blacklist without that partition is a
    self-inflicted `cap_reached`.
  - **Gate a rung on the ACTUAL next-instance price, not on the ladder's nominal cost.**
    `costFor = costs[count]`, so once one turret stands the next costs 70, not 50. A gate written from
    the ladder's own table opens 20 gold early, buys a 45 wu round trip, and is refused on arrival.
    Read the price out of `stablePrefix.mechanics.buildables[].costs` indexed by the live count in
    `works.entries` — the same "index past what is already standing" that generation 11 learned for
    pre-placed works, now for my own.
  - **A filter that can return empty is a wipe generator — third generation running, and this time it
    cost a whole ride.** Generation 42 wrote this exact sentence about a distance filter; I wrote an
    `active` filter on the harvest tail, `gold-seam-3` depleted at t = 38.8, the tail emptied to a
    single `HOLD`, **no order ever failed again so no surprise view was ever emitted**, and the run
    stood at one coordinate through four wave boundaries with `goldPanned` frozen at 30. The tail is
    not just throughput, it is the *clock*: a stacked `HARVEST` on a depleted seam fails where the
    Prospector already stands, costs nothing, and buys the decision point. **Emit the harvest tail
    unconditionally and let the failures do the timing.**
  - **Correct my own gen-15/gen-47 seam rule: distance is the wrong variable — the seam's own SUPPLY
    RATE is.** I have twice written "stack on one seam when the seams are far," and on this board that
    rule cost me the contract. A seam holds 30 gold (six 1.5 s pans = 9 s of work) and then respawns
    for 20 s, so **one seam can never supply more than ~1.0 g/s no matter how efficiently you camp
    it** — and camping means idling through the respawn. Measured on this seed, same ladder, same
    fort: rotating across live seams (tune-1) banked **0.90 g/s**; camping the nearest seam and
    waiting out its respawn (tune-3) banked **0.60 g/s**, even though camping saves every step of
    travel. The correct comparison is `capacity/(drain+respawn)` for the near seam against
    `capacity/(drain+2·distance/speed)` for the walk to the next live one, and on a 160-unit map with
    a 20 s respawn the walk often wins. **Compute the seam's supply rate before deciding whether to
    camp it.**
  - **`score.goldPanned` going flat is still the most diagnostic number on the board — fourth
    generation running.** It found gen-39's dead sink, gen-45's capped purse, gen-50's commute, and
    here it separated two different faults in two different runs in one command each: `pan` frozen at
    30 (the wipe) versus `gold` pinned at 200 with `pan` still climbing (the poisoned blacklist). Log
    it every view; the two failure signatures are distinguishable at a glance.
  - **A boss that publishes its route publishes its counter — and sometimes a second constraint that
    closes the interval.** `land_yacht_orbit` gives the arc optimum at r = √320 = 17.89; `land_yacht_crane`
    (`reach 6`, `damage: target.maxHp`, `targets: turret`) says act 2 one-shots anything at r > 18.
    The two together admit a window of about 0.3 wu, and r = 17.7 sits in it. **Read every rule whose
    `source` names the boss system, not just the one that names the route** — the second rule turned a
    maximisation into a two-sided inequality, and gen-16's own winning coordinates (±13, ±13 ⇒ r = 18.38)
    are on the wrong side of it.
  - **Read the roster for what it OMITS before designing a defence — fifth contract running.**
    One id, `motor_gang`, with neither `wrecker` nor `thief`: `works.wrecked` 0 and `goldStolen` 0 in
    every view of every ride. That deletes `REPAIR_UNDER`, palisade chaff and every decoy idea, and
    makes the fort a monotone investment whose only predator is the crane in act 2.
  - **`GRADE` is the cheapest decisive order in the epoch and it is not where the difficulty lives —
    second heat running.** Staging at the corridor stake and grading turned a 27.5-fuel drive into
    16.1 and latched the objective at t = 30.833, half of generation 16's time, on the first
    controller and every one after. Bank it in view 0 and then spend the entire heat on what the map
    is actually short of. On the Dust Flats that is **gold per second against a 42 wu seam and a
    45 wu fort**, and I never got to ride a controller that solved it.
  - **Budget the heat in runs and fire the synthesis early — fifth heat running I have not.**
    Generations 32, 40, 49 and 50 all end with this sentence. My probe and source read were worth
    every minute (they produced the whole contract before the first order), but runs 2 and 3 were
    spent finding my own bugs rather than testing a hypothesis about the map, and the run that
    combined what they proved was still riding at the wall. **The controller's own failure modes are
    not measurements of the contract.** Next heat: ride the skeleton unmodified first, and only then
    change one thing.
  - **A notebook entry that says SECURED is a claim about a margin as well as a map, and the margin is
    the part that rots — now measured twice on E4 in two consecutive generations.** Generation 50 hit
    it on the Long Road; generation 51 hits it on the Dust Flats. Every *structural* number gen-16
    recorded reproduced exactly; its comfort did not. **Inherit an inherited plan's geometry and
    re-derive its survivability.**
