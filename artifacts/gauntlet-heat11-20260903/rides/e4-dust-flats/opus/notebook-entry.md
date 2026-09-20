
## generation 16 — 2026-09-03T22:37:08.722Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-dust-flats
cost: wallClock 558s · setupToFirstOutput 90s · tokens in 114 / out 97880 (+cache read 8500887) over 57 turns, 34 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w14 / 437.967s / 40g / calls 50 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:7f6cd5d3, ranked, POST rank 1 — FIRST SECURE for e4-dust-flats. Arena B. Unlike the Boneyard, GRADE genuinely pays here: staging at the corridor stake and grading camp-to-railhead turns an 82.5 wu open drive (27.5 fuel clear, ~39 under storm, against a 36-fuel run total) into 28.3 wu open plus 60 wu at 2.5x speed and 0.4x burn — about 12.6 fuel, measured 20.677 drawn with 15.3 still in the tank.
- Winnability (rider, verbatim): Secured, and the margin was **wide for thirteen waves and then a hair**: the hero held 95/175 from wave 7 to wave 12 with every work standing, and the Land-Yacht took it from 71 to **7/175 in a single view interval** at wave 14 — 64 hit points from one pass of a `scale 1.5`, `contactDamageScale 1.2` hull — so the kill and the death were about six seconds apart.
- What the map asked (rider, verbatim): It asked me about **distance, fuel, road and storm — E4's signature mechanic, live and load-bearing — and then it asked the same question a second time in the shape of a boss, so the county's RESKIN measurement of this contract is out of date on this build.** The secure is a conjunction the engine states in its own comment: the Land-Yacht's fall cannot secure a railhead the Hauler never reached (`HeadlessContractSim.ts:1886`), and `autoSecureWaveForRun` (`:1181`) keeps wave 12 shut until the boss is down. So the errand is not decoration — it is half the win condition, and it is pure spatial planning: an 82.5 wu open-country drive costs 27.5 fuel clear and about 39 under a storm (`stormMovementMultiplier 0.7`, and `Vehicle` prices fuel **by the second**), against a 36-fuel run total, so the naive single `HAUL` can strand the objective outright. Staging the Hauler at the corridor stake (0,12) and `GRADE`-ing `camp-to-railhead` first turns that into 28.3 wu of open ground plus 60 wu at 2.5× speed and 0.4× burn — about 12.6 fuel, measured at 20.677 drawn with 15.3 still in the tank and the railhead latched at t = 60.5 s. The fields that carried it were `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`, `securableAtWave`), `now.motor.fuel` (`nodes[].harvested/progress`, `stored`, `tar`, `capacity`), `now.motor.roads.corridors[].start/end/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO`, `GRADE` and `HAUL`. The second, better surprise is the boss. `mechanics.rules.land_yacht_orbit` publishes centre (0,0), radius 24 and `angularSpeed 0.5236` — the Land-Yacht **rides the ORBIT road**, 12.57 wu/s, one lap every 12 seconds, `ignoresTerrain: true` — so a fort built for the claim cannot touch it and a fort built for the circle can. Turret range 16 against a radius-24 ring makes the placement a closed-form arc problem whose optimum sits at radius ≈ 17.9, not on the ring itself; four turrets at (±13, ±13) cover ~334° of the lap and 0 of my 7 works were ever wrecked. That is genuine "spatial planning at scale" and it is the first E4 board I have ridden where the era's lever shaped **both** the errand and the fight. The honest qualifier is the middle: the haul finished at t = 60.5 s of a 438 s run, and waves 3–13 were ordinary stationary survival on a starved 42 wu commute. Call it two-thirds of an era, bracketed at both ends.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` in `winnability-receipts.json` is eight-for-eight.** Still the first
    two lines of JSON I read, still the cheapest information in the county, still never wrong.
  - **When a contract fields both a Baron and an era socket, read the AND, not the clauses.** Generation
    8 read a wave gate and missed a boss; generation 10 corrected that; generation 12 said "enumerate
    every clause." Here `HeadlessContractSim.ts:1886` ANDs the motor errand into `postBaronDefeat` and
    `:1181` shuts wave 12 until the boss falls — so `secureWave: 12` in the manifest is *false
    advertising by omission*, and a rider who plans to twelve waves plans to lose. The engine's own
    comment names the order: **haul first, then the boss.**
  - **A boss that publishes its route publishes its counter.** `mechanics.rules.land_yacht_orbit` gives
    centre, radius and angular speed in the view — no source read required. Turret range 16 against a
    radius-24 orbit is a closed-form question: a turret at radius *r* covers arc half-angle
    `acos((r²+320)/48r)`, maximised at **r ≈ 17.9 (41.8°), not on the ring**. Four turrets at (±13,±13)
    cover ~334° of the lap. Do that arithmetic *before* choosing coordinates; it took two minutes and
    the fort never lost a work.
  - **Stage before you drive, and grade before you stage.** The Dust Flats' single `HAUL` is 82.5 wu of
    open country at 3 fuel/second — 27.5 clear, ~39 under a storm, against a 36-fuel run. Staging at
    the corridor stake and grading first cost one stop the Prospector was already making and dropped it
    to ~12.6. Generation 15 wrote "the road is a real lever on this map's geometry and this errand
    routes around it"; on the Dust Flats the errand rides *straight down* the road, and grading is the
    difference between a comfortable errand and a stranded one. **Check whether the objective's stop is
    the far end of a corridor you can grade — if it is, the road is not optional.**
  - **Derive the motor phase from the view, never from your own clock.** REPLACE semantics mean every
    array re-issues the whole errand; reading `fuel.nodes[].harvested`, `roads.graded`, `vehicle.x/z`
    and `objective.arrived` and emitting only the *remaining* legs is what stopped the Prospector
    re-walking a finished tour for fourteen waves. A motor controller is a state machine over the view,
    not a script.
  - **Ten candidates for four slots.** Generation 10 lost the Trestle to one refused coordinate;
    generation 14 proved the skipper. Here all four turrets and three beacons landed with zero
    `out_of_zone`, and I never had to know which coordinate would refuse.
  - **The dwell pattern is now standard equipment.** `MOVE_TO` completes in one tick and the next order
    walks you off, so a 0.5 s harvest needs `node → +0.9x → node → +0.9z → node`. Three tar nodes, three
    first-try harvests, 9 tar. The grammar has no wait verb and probably never will; carry the pattern.
  - **Eighth contract running, the second run went to the receipt, not to greed.**
    `fnv1a32:f654d3f5` twice, 437.967 s twice, 50 calls twice. In an era that replays every reel, a tune
    that secures *is* the attempt and the re-ride is the proof.
  - **Write the outcome file the moment the run ends.** Fifth generation running I have said this; this
    is the second where I did it on the idle probe and the third where the file on disk was correct
    before the analysis existed. It has never once cost me anything and it has twice been the only thing
    that would have survived.
