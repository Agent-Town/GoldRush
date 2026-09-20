# e4-dust-flats — heat 11, generation 16 (claude-opus-5)

Rig `claude__opus-5` · harness `claude-code-cli` 2.1.257 · era 5, engine `49c34f8b…` · view schema 2
Seed `e4-dust-flats-01`, difficulty `trail`, `worldModel: sim-import`.

## The read, before the ride

`assets/contracts/winnability-receipts.json` carries `e4-dust-flats` as `unclaimed` with **no
`reason`** — the eight-for-eight green light. The manifest then said the thing that decided the ride:

- `twist.secureWave: 12`, but `twist.baron` is present (wave 14, `bossKind: railcar`,
  `variantId: land_yacht`, `hpScale: 1`, three components — wheels ×3, crane ×2, wheelhouse ×2.5).
  `HeadlessContractSim.ts:1181` returns `Number.MAX_SAFE_INTEGER` from `autoSecureWaveForRun` while
  `twist.baron && !baronBeaten`, so **surviving wave 12 secures nothing**. The only door is
  `postBaronDefeat`.
- That door is itself conjunctive. `HeadlessContractSim.ts:1886` ANDs
  `(this.motor === null || this.motor.objectiveAllowsSecure)` into the boss-kill secure, with the
  comment naming this contract: *"the Land-Yacht's fall cannot secure a railhead the Hauler never
  reached… haul first, then the boss."* So the secure is **haul ∧ boss-kill**.
- `mechanics.rules.land_yacht_orbit` publishes the fight's geometry outright: centre (0,0),
  **radius 24**, `angularSpeed 0.5236` (12.57 wu/s, a 12-second lap), `ignoresTerrain: true`.

That last line is what a fort gets designed around. Turret range is 16 and the orbit is a circle of
radius 24, so a turret at radius *r* from the origin covers a ring arc of half-angle
`acos((r²+320)/48r)`; the maximum is 41.8° at r ≈ 17.9, not at r = 24. Four turrets at
(±13, ±13) — radius 18.4, inside the `motor-camp` build zone (x ±30, z −26…24), which contains the
**entire** orbit ring — cover ~334° of the 360° the Land-Yacht rides, and two of the four also sit
within 16 of the claim at (0,8), so the same ring defends the hero for the thirteen waves before the
boss.

## The haul, priced

Hauler starts (−20,−8); the stop is the far end of `camp-to-railhead` at **(0,72)**, `stopReach` 2.5.
A single straight-line `HAUL` is 82.5 wu of open country: 82.5/9 × 3 = **27.5 fuel clear, ~39 under
storm** — against a **36-fuel run total** (three tar nodes × 3 tar × 4 fuel). That drive can strand.

Road fixes it. `Balance.e4Road`: graded is 2.5× speed and 0.4× fuel, `halfWidth` 1.5. The corridor is
the straight line (0,12) → (0,72), so a Hauler *staged at the road stake* rides the whole leg on it:

| leg | wu | fuel |
|---|---|---|
| (−20,−8) → (0,12) open country | 28.3 | 9.4 |
| (0,12) → (0,72) **graded** | 60 | 3.2 |
| **total** | 88.3 | **≈12.6** |

Measured on the ride: `fuelDrawn 20.677`, `roadDistanceAtArrival 61.408`, arrived at **t = 60.533 s**
with `stored: 15.323` still in the tank and all three nodes harvested. Grading was free in gold and
cost one stop the Prospector was already making.

## The controller

One file, `ctrl.mjs`, no per-run tuning. Skeleton carried from generations 7–15:
`SECURE_CHOICE` alone when `pendingSecure` · scored `PICK_UPGRADE` first (plating over damage) ·
motor phase derived from live state (`fuel.nodes[].harvested`, `roads.graded`, `vehicle.x/z`,
`objective.arrived`) so a REPLACE never re-walks a finished errand · five-order dwell per tar node
(`node → +0.9x → node → +0.9z → node`) because `MOVE_TO` alone cannot hold the 0.5 s inside
`harvestRange` 1.35 · price-ordered turret ladder with **ten candidate positions for four slots** so a
refused coordinate is skipped, not parked on · `REPAIR_UNDER 55` · the rest of the 32 slots stacked
with `HARVEST` on the nearest live seam (the seams here are 42 wu out, so stack-by-seam, never
rotate).

## Evidence

| | |
|---|---|
| runs | 3 (1 idle probe, 1 tune, 1 scored) |
| idle probe | died wave 2, t = 79.0 s |
| tune-1 | **secured** w14 / 437.967 s / 40 g / 50 calls / `fnv1a32:f654d3f5` |
| attempt-1 (scored) | **secured**, identical: w14 / 437.967 s / 40 g / 50 calls / `fnv1a32:f654d3f5` |
| works at the secure | 4 turrets + 3 beacons, **0 wrecked**, 490/490 hp |
| hero | 7/175, level 22, `tinkers_plating ×3` |
| economy | 485 gold panned, 0 stolen, 7 buildings |
| threats | 599 spawned / 590 defeated, peak `alive` 26 |
| motor | graded `camp-to-railhead`, hauled, arrived t = 60.533 s, 9 tar, 20.677 fuel drawn |

---

## Outcome

**SECURED.** waves **14**, timeAlive **437.967 s**, gold **40**, calls **50**, kills 590,
`eventLogHash: fnv1a32:f654d3f5`, `defaultedPicks 0`, `defaultedSecure 0`.
Tape put forward: `artifacts/heat11/opus/e4-dust-flats/attempt-1-tape.json`.
**3 sim runs, 1 scored attempt.** `tune-1` secured on the first controller ride; `attempt-1` is the
byte-identical re-ride and reproduced the same hash, the same 437.967 s and the same 50 calls, so the
reel the operator submits is proven-deterministic before it reaches the assayer. Stopped on the first
secured outcome, as the brief requires. This is a first secure for `e4-dust-flats`.

## What the map asked

It asked me about **distance, fuel, road and storm — E4's signature mechanic, live and load-bearing —
and then it asked the same question a second time in the shape of a boss, so the county's RESKIN
measurement of this contract is out of date on this build.** The secure is a conjunction the engine
states in its own comment: the Land-Yacht's fall cannot secure a railhead the Hauler never reached
(`HeadlessContractSim.ts:1886`), and `autoSecureWaveForRun` (`:1181`) keeps wave 12 shut until the
boss is down. So the errand is not decoration — it is half the win condition, and it is pure spatial
planning: an 82.5 wu open-country drive costs 27.5 fuel clear and about 39 under a storm
(`stormMovementMultiplier 0.7`, and `Vehicle` prices fuel **by the second**), against a 36-fuel run
total, so the naive single `HAUL` can strand the objective outright. Staging the Hauler at the
corridor stake (0,12) and `GRADE`-ing `camp-to-railhead` first turns that into 28.3 wu of open ground
plus 60 wu at 2.5× speed and 0.4× burn — about 12.6 fuel, measured at 20.677 drawn with 15.3 still in
the tank and the railhead latched at t = 60.5 s. The fields that carried it were
`now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`, `securableAtWave`),
`now.motor.fuel` (`nodes[].harvested/progress`, `stored`, `tar`, `capacity`),
`now.motor.roads.corridors[].start/end/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z`
and `now.motor.weather.phase`; the orders were `MOVE_TO`, `GRADE` and `HAUL`. The second, better
surprise is the boss. `mechanics.rules.land_yacht_orbit` publishes centre (0,0), radius 24 and
`angularSpeed 0.5236` — the Land-Yacht **rides the ORBIT road**, 12.57 wu/s, one lap every 12 seconds,
`ignoresTerrain: true` — so a fort built for the claim cannot touch it and a fort built for the circle
can. Turret range 16 against a radius-24 ring makes the placement a closed-form arc problem whose
optimum sits at radius ≈ 17.9, not on the ring itself; four turrets at (±13, ±13) cover ~334° of the
lap and 0 of my 7 works were ever wrecked. That is genuine "spatial planning at scale" and it is the
first E4 board I have ridden where the era's lever shaped **both** the errand and the fight. The
honest qualifier is the middle: the haul finished at t = 60.5 s of a 438 s run, and waves 3–13 were
ordinary stationary survival on a starved 42 wu commute. Call it two-thirds of an era, bracketed at
both ends.

## Winnability

Secured, and the margin was **wide for thirteen waves and then a hair**: the hero held 95/175 from
wave 7 to wave 12 with every work standing, and the Land-Yacht took it from 71 to **7/175 in a single
view interval** at wave 14 — 64 hit points from one pass of a `scale 1.5`, `contactDamageScale 1.2`
hull — so the kill and the death were about six seconds apart.

## Lessons for my notebook

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
