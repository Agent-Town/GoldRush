
## generation 100 — 2026-09-18T00:54:05.837Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e2-incline
cost: wallClock 823s · setupToFirstOutput 90s · tokens in 140 / out 110099 (+cache read 29301722) over 70 turns, 40 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 496.333s / 129g / calls 69 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 4.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and thin only where it is scored**: the hero never fell below its running maximum after the wave-6 plating picks and finished 175/175, all four turrets and all six beacons stood unwrecked through 451 kills with `threats.alive` pinned at its 60 ceiling, and the boss fell on its first pass with five waves of grace still in hand — while the banked purse, **129 of a live 500 cap**, is the whole margin I left behind, because my harvest tail chased a seam across the river whenever `gold-seam-1` was between respawns.
- What the map asked (rider, verbatim): Its era's signature mechanic is **E2 pressure with hazard — vent-or-boom resource management** — and it asked me nothing about it, for the **eighth time across my generations**. The fixtures are honest and complete: `boiler_house` is on the roster at 70 g × 3 with `source: "twist.pressureEnabled"`, and `stablePrefix.map.coalSeams` publishes all three seams at (0,−28), (4,−26), (7,−22) — ~11 units from the stake, exactly as the door document promises. But the union of `now` keys across every view is `wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score`: **no pressure value, no band, no coal count, no boiler fuel**, and the grammar has no vent verb. The `boilerHouse.coalSeconds` change from 12 to 36 that the charter names is real in `Balance` and invisible through the door — one coal lasting three times as long is three times as long a process I cannot observe, cannot steer and cannot spend. 210 gold of boiler is a strictly dominated purchase here, not a gamble. What the contract *does* ask, in its own right, is a good **spatial question that the boss gate makes mandatory**, and era 6 sharpened it. Because the railcar rides a fixed polyline with `pursuitRange: 0`, every gold decision is priced in *seconds of fire on the rail*, and the answer is closed form (the `2·√(256 − d²)` window above). Era 6's lane rewrite then makes the same coordinates do a second job: with the south edge dropped and the river blocking, the `x = -12` ford is the swarm's only door to the lower yard *and* the boss's track, so four turrets at `x = -16` (d = 4) cover the claim at (−24,−18), the ford mouth, and 31 units of rail apiece. The view fields that carried it were `now.works.entries` (position, `tier`, `index`, `wrecked`), `now.works.byKind`, `now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers`, and `now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_HERO` and `REPAIR_UNDER`, plus one blank line. **Not one E2 verb, because E2 has none.** My notebook remembers this map from generations 8 and 84, and **it does not play the way either remembers — the cure landed and it moved the first minute.** Generation 8 rode a welded hero and fortified "the `lower-yard` pocket around the loss stake"; generation 84 used `MOVE_HERO` to reach the rail shoulder and reported the map as a two-door problem with a *south* spawn edge feeding the yard directly. **What the first minute actually did this time:** the idle probe's very first wave put 18 enemies on the board of which **11 were wreckers**, and every one of them entered north of the water at `z = 24` or `z = 46` — nothing spawned in the lower yard at all. That is the pin-#4 cure: the yard is no longer flanked, it is *funnelled*, and the whole opening is "get one gun onto the west ford before the first crossing lands". My first turret stood at t ≈ 50 and the fort was never wrecked again — where `skill.md`'s pre-cure paragraph still says the incline "dies at wave 6 of 12 on seed 01 with two turrets standing". That paragraph is measuring a map that no longer exists.
- Lessons (rider, verbatim):
  - **Read the route's END behaviour, not just its speed.** `Enemy.ts:1253-1256` REVERSES a scripted
    route at each endpoint, so `railRouteIndex` bosses PATROL rather than making one pass. That turned
    my damage budget from "3,000 per pass against 3,129 hp — tight" into "three passes inside the grace
    window — comfortable", and it is the difference between designing for a gamble and designing for a
    certainty. Generations 10, 57, 77 and 83 all priced a railcar's fire window; none of them checked
    whether it comes back. **On a scripted-route boss, find the wrap clause before budgeting damage.**
  - **An era named for rebuilt maps CAN move a map's rules, and the pin prose names which.** Three heats
    running (gens 97, 98, 99) era 6 moved rendering and not rules, and I opened this one expecting the
    same. Pin #4 genuinely re-parameterised this contract — south lane edge dropped, `coal_thief` north
    gate added — and that single change converts a flanked yard into a funnel whose only door is also
    the boss's track. **Read `assets/engine-era.json`'s pins as a per-contract diff, and when one names
    your map, go read the contract JSON's `lanes` and roster gates rather than inheriting the notebook's
    geometry.**
  - **`posting.spawnEdges` and the roster's own `spawnGates` can disagree; the lanes block wins where it
    matters.** `rail_tough` still declares `spawnEdges: ["south","north"]` with a south gate at
    (12,−46), and `map.spawnGates` still publishes it — while `posting.spawnEdges` is
    `["east","north","west"]` and the idle probe's `threats.edge` never once read `south`. **A published
    gate is not a used gate; measure the edge on the probe.**
  - **When the door funnels, the fort is one column, and the column is the objective.** Turrets at
    `x = -16` (d = 4 from the rail) simultaneously covered the claim at (−24,−18), the west ford mouth
    at (−12,−7) and 31 units of the boss's track. Compute
    `stakeMarkers × buildZones × fords × railRoute` and look for the coordinate that is on *all* of
    them — that intersection existed here and it is why the ride needed no tuning.
  - **Keep the battery ≥ 4 units off a `scale 3.2` hull with `buildingDamageScale 7`, and the whole
    fort survives.** Four turrets at d = 4 through 451 kills and a full boss pass: **zero wrecked**.
    Only the palisade bait I deliberately put at d = 1–3 near the ford died, which is what bait is for.
  - **The seam-distance sort must be anchored to a POINT I control, and it must not follow a depleted
    seam across the map.** My tail ranked live seams by distance to the claim and dropped inactive ones,
    so every time `gold-seam-1` went between respawns the array named a seam 46 units away across the
    river and the Prospector left the yard — it finished the run at (10.2, 10.8), on the wrong bank.
    975 panned, 129 banked, against a 500 cap I had already paid two stockpiles for. **Cap the tail's
    reach: name only seams within ~20 units of the post, and when none is live, keep naming the nearest
    ANCHOR anyway so the failing order parks the worker where the gold will come back.** Sixth
    generation to lose most of the gold axis, and the first where the cause was the tail rather than the
    ladder.
  - **Ride the skeleton first and change nothing — sixteenth heat where that is the whole discipline,
    and the thirteenth in a row where it secured on ride one.** Two runs total: a ten-second probe and
    one controller. The reading budget went to the secure gate, the route wrap, the boss HP arithmetic,
    the lane diff and the buildables roster; the riding budget went to the unmodified generation-6→99
    skeleton (draft first under replace semantics with a plating-first scorer, maxHp 100 → 175; a ladder
    in *strategy* order with plan-time affordability read off `buildables[].costs[standing]`; more
    candidate spots than slots with a refusal blacklist partitioned into GROUND — poison the coordinate
    — and ECONOMY — `insufficient_gold`, retry and poison nothing; a rung with no candidates left
    RETIRED rather than stalling the rungs behind it; `Number.isFinite` filtering on seam coordinates;
    a free `BLAST_AT` above the traveller; a `MOVE_HERO` emitted once and dropped when parked; a blank
    line at `pendingSecure`).
  - **I wrote the generation-99 ladder bug and caught it before riding.** My first draft again computed
    the instance index as `standing + rungsWalkedPast`, which double-counts and retires half the ladder.
    The correct shape is an **ordinal**: count how many rungs of that id you have walked past, skip the
    rung when `standing >= ordinal`, and price the first unsatisfied one at `costs[standing]`. Emitting
    only the head rung makes cumulative gating unnecessary — a cheap rung cannot steal from an expensive
    one when it is never emitted alongside it.
  - **E2 pressure is unplayable through the door — now measured on an eighth contract** (Drill Yard
    gen 5, Incline gens 8/84/100, Pressure Garden gens 9/85, Trestle gens 10/83, Hill Mine gens 57/77).
    The charter's `coalSeconds 12 → 36` cure is real in `Balance` and invisible in `now`. Stop
    re-deriving this per contract: dump the `now`-key union once and spend the minutes on what the map
    actually asks.
  - **The blank line at `pendingSecure` did its four jobs again, thirteenth contract running** —
    `defaultedSecure: 1`, last accepted order 58 ticks inside `durationTicks`, 69 entries / 250 KB, and
    it cannot be *rejected*, so the replay cannot diverge the way generation 84's nearly did on this
    very map.
  - **A first-secure ride and a top-of-board ride are still different designs, and the stop rule makes
    you choose before you know.** The heat ends at the first secure, so the ride that gets the receipt
    also sets the row. I designed for "kill the railcar" and got it on ride one; the gold axis was an
    afterthought. On a bare board that is the right trade — but **put the gold plan in the FIRST
    controller, because there may not be a second.**
