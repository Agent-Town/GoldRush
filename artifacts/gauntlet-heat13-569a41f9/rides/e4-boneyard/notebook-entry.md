
## generation 72 — 2026-09-07T12:49:03.476Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e4-boneyard
cost: wallClock 983s · setupToFirstOutput 300s · tokens in 148 / out 162232 (+cache read 26177804) over 74 turns, 40 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 50 · runs 3 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 12 (re-ride), ride 12.
- Winnability (rider, verbatim): Secured, and the margin was **enormous on survival and genuinely thin on the purse**: the hero took effectively no damage across all 52 views and finished 175/175 with all seven works standing unwrecked, but gold reached the 200 cap only at **t = 340.1 of 360** — my last beacon spent the purse to 0 at t = 256.7 and it took 83 seconds of panning to climb back, so ~20 seconds of slack stood between a 200-gold row and a worse one.
- What the map asked (rider, verbatim): It asked about **distance and fuel — E4's signature mechanic, live, load-bearing and gating the secure** — and then it went quiet for ten waves. This is not stationary survival wearing the era's name at the front end. The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and for `kind: "tow"` that means two separate rests — `MotorSocket.settleTow` hitches when the Hauler comes to rest within `stopReach` 2.5 of `spent-boiler-west` at (−18,−8), and delivers when it rests again within 2.5 of the gate end of `gate-to-west-rows` at (−8,−38). `objective.stop` **moves** the instant `hitched` flips, so the errand is two dispatches with a state flip between them and my controller branched on `objective.hitched` rather than on its own clock. The arithmetic is a real leash and it bound: the run holds exactly 36 fuel (three nodes × three tar × four fuel), the Hauler burns **by the second**, and my tow measured **26.688 fuel for 69.469 units** — 0.384 fuel per unit against a clear-weather 0.333, i.e. a **15 % storm surcharge** paid because `stormMovementMultiplier: 0.75` stretches every second the Hauler is moving. Two nodes would have been 24 fuel and would have stranded the objective outright, which is exactly why I toured all three. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`), `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were **`MOVE_HERO`** and **`HAUL`**, and nothing else. **`GRADE` is worthless here and that is a finding, not an omission**: I issued none (`graded: []`, `roadDistance: 0`), because the Hauler drives straight lines and the tow's delivery point *is* the corridor's start stake, so the only road it could grade runs away from both legs. Across the four Motor maps `GRADE` ranges from mandatory (the Long Road: 123 fuel ungraded against a 36-fuel tank) to inert; the arithmetic, not the epoch, says which. The honest qualifier is the one every Motor map earns: **the errand latched at t = 59.667 of a 360-second contract**, and waves 2–12 were ordinary stationary survival at the claim against a one-id, thief-only roster on a 40–60 wu seam commute. Call it the first sixth of the run genuinely E4 — but unlike a reskin, the era's lever *gates the secure* and made me do fuel-and-distance arithmetic before writing a single order. **Does my notebook still remember this map?** Its geometry, yes; its controls, no — and the control change is the whole heat. Generations 15 and 52 both rode this seed and every structural number reproduced exactly: the same claim at (0,−44), the same hulk, the same moving stop, the same three tar nodes on the z = −8 line, the same 36-fuel leash, the same `GRADE`-is-worthless verdict, the same w4 idle floor. What moved is that **the errand's cursor changed body**. Generation 52 aimed `HAUL` with the Prospector's `MOVE_TO`; that verb is gone, `HAUL` now reads the **hero's** ground (`HeadlessContractSim.motorVerb:3106`), and the hero — unlike the Prospector — is refused by `Terrain`'s landmark collision. `spent-boiler-west` carries a blocker of half-extents 1.753 × 1.179, padded by the hero's radius to **2.333 × 1.759**, so every point my predecessor could stand on is now `UNREACHABLE_TERRAIN`, and the walkable ring that still fits inside `MOTOR_STOP_REACH` 2.5 is about 0.7 wu thick. That one rectangle cost me a whole run.
- Lessons (rider, verbatim):
  - **When a ruling retires a verb, re-derive the GROUND, not just the syntax — the retirement can
    move a mechanic to a body the terrain treats differently.** Four heats running I have written that
    the 1:1 grammar change was free on a stationary-hero board. Here it was not free at all:
    `HAUL` moved from the Prospector's `MOVE_TO` to the hero's `MOVE_HERO`, and the hero is refused by
    `LandmarkCollision` where the Prospector was not. Generation 52's exact standoff is now illegal
    ground. **Ask which body a retired verb was aimed at, then ask what refuses that body.**
  - **A landmark blocker is a rectangle with the hero's radius added, and it is computable before you
    ride.** `assets/pilots/map-rebuild-spike/landmark-collision-contract.json` publishes every mount's
    footprint, rotation and scale; `Terrain.sample` pads by `Balance.hero.radius + 0.08`. For
    `spent-boiler-west` that is a 2.333 × 1.759 half-extent rect, which leaves a walkable band of
    z ∈ [−10.26, −9.76] inside a 2.5 stop reach. Two minutes of arithmetic replaced a run I had
    already lost to guessing.
  - **Where an exact standoff is unknown, ship a LADDER of candidates and let the array pick.** An
    unwalkable `MOVE_HERO` fails in a single tick and yields to the next order, so six ranked
    standoffs cost at most six ticks and cannot leave the errand pinned on one bad coordinate. That is
    generation 70's terrain probe turned into standing equipment.
  - **Never gate the fort behind the errand.** `tune-1` died at wave 4 holding **200 gold and zero
    works** because my build ladder required `phase === 'fort'` and the errand never completed. The
    errand's own orders already sit above the ladder in the array and block it while they run; a
    second, explicit gate on top of that turns one failed order into a lost contract. **Let array
    position do the sequencing; never also encode it as a condition.**
  - **`now.timers` publishes `runSeconds`, not `simTimeSeconds`.** My time-based build cutoff read
    `undefined ?? 0` and sat at 0 for the entire run. A field name that reads as `0` looks exactly like
    a clock that has not started — log the raw field once on view 0 rather than trusting the name.
  - **Chain a seam's neighbour only if it is actually next door.** Ten anchors re-anchor on depletion,
    and a nearest-first sort across all live seams walked the Prospector from (−32,1) to (31,1) — 64 wu
    for five gold. Capping the chain at two seams within 26 wu of each other took panning from
    200 gold in 105 s to **645 gold in 360 s**. Generation 51 said measure the seam's supply rate;
    the complement is **measure the chain's mutual distance and refuse to leave the cluster.**
  - **On a fixed-wave secure the ladder's TAIL is the score, and I nearly lost it again.** Waves and
    `timeAlive` are pinned by the gate, so gold is the only free axis and it caps at 200. My
    `STOP_BUILDING_AT = 255` was a guess that happened to leave 83 seconds of refill for a 20-second
    margin. The principled version is arithmetic, not a constant: **stop spending at
    `secureTime − (bankCap / measured g/s)`**, read off `score.goldPanned` in the run itself.
  - **The three-order zig is the post-ADR-005 dwell pattern, and it worked first try.** `MOVE_HERO`
    completes inside 0.5 and the next order walks the hero off, so a 0.5-second `harvestSeconds` needs
    `node → node±1.3x → node∓1.3x → node±1.3x`, every point inside `harvestRange` 1.35. Nine tar from
    three nodes, first attempt, both times I ran it. The grammar still has no wait verb.
  - **Read the roster for what it OMITS — ninth contract running, and here it was half the design.**
    One id, `pipeline_rustler`, `thief: true` — which forces `wrecker = false`, so `works.wrecked` was
    0 at all 52 views. And with no `stockpile` standing, `nearestGoldHolding` is empty and every thief
    falls through to ordinary hero pursuit, so `goldStolen` was 0 too. That deletes `REPAIR_UNDER`,
    palisade chaff and every decoy idea, makes the fort a monotone investment, and is why the tail
    could be pure `HARVEST`.
  - **Stop when both ranking axes are pinned.** Waves 12 by the gate, `timeAlive` 360.000 by the gate,
    gold 200 by the cap. A second scored attempt could only have changed the reel's bytes, so the
    remaining budget went to the envelope check and the local assay instead.
  - **Write the outcome file after every run, before the analysis — and I broke my own rule once
    here.** The runner wrote a truthful `*-summary.json` on every child exit, but I did not promote it
    into `gauntlet-outcome.json` until after the securing run. Two probes went by with no row on disk
    that the operator could read. Wire the promotion into the runner's exit handler, not into my
    intentions.
