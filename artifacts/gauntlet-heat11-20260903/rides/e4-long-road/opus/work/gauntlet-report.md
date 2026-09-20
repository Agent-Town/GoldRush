# Gold Rush Gauntlet — heat 11 — `e4-long-road` @ `e4-long-road-01` (trail)

rider: Claude Opus 5 (`claude-opus-5`) · harness: Claude Code CLI 2.1.257 · worldModel: `sim-import`
era 5, engine `49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9` · viewVersion 2
generation 18 of my notebook.

## How it went, in order

1. **Winnability receipt first.** `assets/contracts/winnability-receipts.json` carries
   `{epoch-4-motor, e4-long-road, status: "unclaimed"}` with **no `reason`** — the ten-for-ten green
   light. Rode.
2. **Contract manifest.** `twist.motorFrontier.description` states the plan outright: *"Grade the long
   road from its west stake, fuel the lead Hauler at the tar nodes by the middle way-station, then walk
   east ahead of it… 380 units of ungraded road costs far more fuel than the county owns."* The map is
   400 × 96, the road runs `(-190,0) → (190,0)`, the convoy route totals **370**, and the hero's stake
   `convoy-lead-hauler` sits at `(-180,0)`.
3. **The arithmetic that decided the ride, before any order.** 3 tar nodes × 3 tar × 4 fuel = **36 fuel
   for the whole run**; the Hauler burns **3/second** at speed 9. Ungraded, 370 wu costs
   `370/9 × 3 = 123` fuel — impossible. Graded (2.5× speed, 0.4× burn) it costs
   `370/22.5 × 1.2 = 19.7` clear, ~28 worst-case all-storm. **`GRADE` is not an optimisation on this
   map, it is the contract.** Measured: 21.557 drawn, 14.443 left in the tank.
4. **The knife edge.** `MotorSocket.ts:334-353`: the town gains `max(0, bestRemaining - remaining)` and
   arrival needs `leaderDistance >= total - 1e-6` — so the Hauler must come to rest **exactly** on
   `(190,0)`. That is reachable because the Prospector *snaps* to its MOVE_TO target
   (`Embodiment.ts:272`) and `HOLD` re-issues movement every tick (`StandingOrders.ts:336`), so a held
   Prospector sits at exactly the stop and `HAUL` dispatches the Hauler to exactly that point.
5. **Idle probe** — died w4 / 134.4s / `hero_down`. (Seventh map running where the idle curve says
   nothing.)
6. **Tune 1 (errand-first)** — solved the errand and lost the run: `convoyArrived: true` at t=120.1,
   370/370, 23.097 fuel. But the Prospector spent the whole opening walking, so the run hit wave 5 with
   **gold 0 and zero works**, and the hero died at t=164.4. It also showed the fuel-limited short final
   step (Hauler at 189.907, lead 369.907) and that a **second `HAUL` on the next view closes it for
   0.005 fuel** — the controller now always re-dispatches while `!arrived`.
7. **Tune 2 (fort-first)** — SECURED w12 on its first ride.
8. **Attempt 1** — identical re-ride, `fnv1a32:b32a1b56` both times, tapes byte-identical apart from
   the random `id`.

## Outcome

**SECURED.** waves **12** · timeAlive **360.000 s** · gold **0** · calls **34** · kills 342 ·
`eventLogHash fnv1a32:b32a1b56` · `defaultedPicks 0`, `defaultedSecure 0`.
Motor: `graded:["the-long-road"] · hauled:true · convoyArrived:true · arrivedAt 270.1 ·
roadDistance 370 · distanceTravelled 370 · fuelDrawn 21.557 · tarHarvested 9`.

Tape put forward: **`artifacts/heat11/opus/e4-long-road/attempt-1-tape.json`** (34 entries,
viewVersion 2).

**4 sim runs** (idle probe, tune 1, tune 2, attempt 1) · **1 scored attempt**. Tune 2 secured with the
identical controller and identical hash; attempt 1 is the receipt re-ride, and it is what I put forward.

## What the map asked

It asked me about **distance, road and fuel — E4's signature mechanic, live and load-bearing — and the
county's RESKIN measurement of this contract is out of date on this build; of the four Motor maps I have
ridden, this is the one where the era's lever mattered most.** The secure is a conjunction:
`wave >= 12` **and** `now.motor.objective.arrived`, and `arrived` for `kind: "convoy"` means the lead
Hauler has reduced its distance to `(190,0)` by a cumulative 370 units and come to rest **on** the point
— the town "gains exactly the ground the lead Hauler gains toward the stop and never the ground it gives
back," which is monotone `bestRemaining` in the code, so driving it backwards genuinely moves nobody.
That errand is not decoration and it is not cheap: the whole run holds 36 fuel and 380 wu of ungraded
road costs 123, so the single `GRADE` at the road's west stake — 8 wu from where the hero stands, free,
and issuable in the first two seconds — is the difference between a winnable contract and an impossible
one. On the Boneyard grading was nearly worthless (4.4 of 68 wu ever rode graded ground) and on the Dust
Flats it was a large saving; **here it is the map.** The storm is priced into it by the second
(`stormMovementMultiplier 0.7` on a 30-second cycle), which is why 19.7 fuel of theory measured 21.557.

Distance shaped the **defence** too, and that is the second, better half of the ask. The map is 400 units
long, the hero is welded to the stake at `(-180,0)`, and — I checked `Terrain.isBuildable` and all three
`buildZones` — **no build ground comes within 32 wu of the hero**, against a turret range of 16. So
nothing can defend the claim directly, and the real question is *which* of three way-station boxes,
40 to 180 units away, sits on the gang's line. Tune 1 answered it the expensive way. The gates are at
`(0,±46)` and everything converges on `(-180,0)`, so at the west way-station's x the south stream sits at
z ≈ −11 (inside the box, which is z −22..−6) and the graded road the gang prefers
(`enemyRouteCostMultiplier: 0.25`) runs z = 0 just north of it; turrets on the box's north edge at
z = −6.5 reach both. That is spatial planning at scale, and the map asked it in its own right.

Fields that carried the run: `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`),
`now.motor.convoy` (`leaderDistance`, `total: 370`, `members[].distance/gap`),
`now.motor.roads.corridors[].start/graded` with `roads.gradeReach: 2.5`,
`now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`,
`now.motor.vehicle.state/x/z/onRoad`, and `now.motor.weather.phase`. Orders: **`MOVE_TO`, `GRADE`,
`HAUL`, `HOLD`**, plus ordinary `BUILD`, `HARVEST`, `PICK_UPGRADE` and one `SECURE_CHOICE`.

Two honest qualifiers, both worth the county's attention. First, the errand latched at t = 270 of a
360-second run and waves 9–12 were ordinary stationary survival — though the Prospector was on errand duty
from wave 5 to wave 9, a longer bite of the run than any other Motor map took from me. Second, and more
substantive: **the contract's headline fiction is not what the engine runs.** The manifest's own
`engineDependencies` declares `convoy-claim-consumer: "missing"` — no Hauler-only basing, no moving
claim, no loss tied to the lead Hauler. The claim is a static stake and the loss is `hero_down` (the idle
probe's appendLog says `rider-down`, surprise `hero_down`). The authored `restStops` with their
45-second anchorage windows are published in the manifest, appear in **no** view field, and have **no**
verb — the same class of finding as E2's pressure, and the "brief goodbye the map makes you practice" is
not practisable through the door. The convoy's `members[].gap` is published and, for a rider, inert: all
three haulers report the same distance and nothing I can do changes their formation. So: the E4 lever is
real, readable and decisive here, while the *convoy-as-town* conceit the map is named for is still a
browser-side promise.

## Winnability

Secured, and the margin was **wide**: the hero never fell below 92 of its running maximum across all 35
views and finished **127/175 at level 16**, all four works (2 turrets, 2 sentry beacons) stood at the end
having never been wrecked, `threats.alive` plateaued at its 60-enemy ceiling from wave 10, and the errand
banked at t = 270 with 14.443 of 36 fuel unspent and three waves of slack against the wave-12 gate — the
one genuinely thin thing was the purse, 180 gold panned all run, which bought the fort exactly and
nothing more.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is ten-for-ten.** Still the first two
  lines of JSON I read, still the cheapest information in the county, still never wrong.
- **When the twist's own `description` names the plan, believe it and then price it.** The Long Road's
  manifest says in plain words: grade from the west stake, fuel at the tar nodes, walk east ahead of the
  Hauler. It was exactly right, and it took two minutes to confirm with arithmetic (36 fuel total, 3/s
  burn, 123 fuel ungraded vs 19.7 graded). Generation 17 taught me to read fuel off the *view* rather
  than the manifest; the complement is that the twist's prose is often the intended solution — verify it
  with the view's numbers instead of ignoring it.
- **`GRADE` ranges from worthless to mandatory across one epoch, and the fuel arithmetic tells you
  which.** Boneyard: 4.4 of 68 wu ever graded, the errand routed around the road. Dust Flats: a large
  saving. Long Road: 123 fuel against a 36-fuel run — impossible without it. Compute
  `distance × burn / (speed × roadMultiplier)` against the tank *before* deciding whether the road is
  optional. It is a different answer on every map.
- **A convoy arrival is an EXACT-POSITION latch, and the Prospector's snap is what makes it reachable.**
  `MotorSocket:345` wants `leaderDistance >= total - 1e-6`, i.e. the Hauler at rest on the point.
  `Embodiment.ts:272` snaps the Prospector exactly onto its MOVE_TO target and `StandingOrders:336` has
  `HOLD` re-issue movement every tick, so a held Prospector never drifts (drift is 0.093 wu per tick,
  which would miss the latch by five orders of magnitude). Park with `HOLD`, verify
  `now.prospector == stop` on the next view, *then* `HAUL`.
- **Re-dispatch a `HAUL` that lands short — it is nearly free.** A fuel-limited final step left the
  Hauler at 189.907 for a lead of 369.907/370. A second `HAUL` on the next view cost **0.005 fuel** and
  latched it. Because `bestRemaining` is a running minimum, extra hauls can only ever help. Make
  "re-issue while `!arrived`" a standing part of any motor controller rather than a fix you discover.
- **When nothing can defend the claim, the fort question becomes "which distant box is on the line."**
  No build zone here comes within 32 wu of a hero with a 16 wu turret. Tune 1 died proving that the hero
  cannot hold alone. The answer was geometric: enemies converge from `(0,±46)` on `(-180,0)`, so the
  west way-station's north edge covers both the south stream (z ≈ −11, inside the box) and the graded
  road they prefer at z = 0. Compute where the streams actually *pass* before choosing a box —
  `spawnGates × claim × buildZones`, the same intersection move that found the Incline's pocket, but
  solved for a line rather than a point.
- **Order the errand against the hero's HP curve, not against tidiness.** My generation-15 lesson — "do
  the era's errand while the board is empty" — is *contract-conditional* and it cost me tune 1 here. On
  a map where the errand takes 125 seconds of the Prospector's feet and the hero cannot be defended, the
  opening belongs to the economy and the fort; the errand goes in the middle, once works stand. Read
  which resource is scarcer: the quiet board, or the worker's time.
- **The manifest's `engineDependencies` block is a legibility gift — read it.** It said
  `convoy-claim-consumer: "missing"` outright, which told me before I rode that the "town IS the convoy"
  framing, the Hauler-only basing and the lead-Hauler loss condition do not exist, and that the loss is
  an ordinary static stake. That saved me from planning around a moving claim. Along with
  `winnability-receipts.json`, it belongs in the pre-ride read.
- **Ninth contract running, the second run went to the receipt, not to greed.** Tune 2 secured; attempt 1
  re-rode it for `fnv1a32:b32a1b56` twice, 34 entries, tapes byte-identical apart from the random `id`.
  At a fixed wave-12 secure `timeAlive` is pinned at 360.000 s and gold ranks below it, so there was
  nothing to win by gambling and a replay-proof reel to gain.
- **Write the outcome file after every run, before the analysis.** Seventh generation running I have said
  it; this is the fourth where I actually did it from the idle probe onward, and every edit since has
  improved a row that already existed on disk.
