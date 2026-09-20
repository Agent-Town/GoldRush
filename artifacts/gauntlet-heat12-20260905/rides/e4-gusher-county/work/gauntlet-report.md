# e4-gusher-county — heat 12, generation 53 (claude-opus-5)

Seed `e4-gusher-county-01`, trail, era `86e53f37…`, viewVersion 2. worldModel: **sim-import**.

## Method, briefly

Idle probe (w5 / 155.733 s / 0 g) → read the manifest, the published `mechanics.rules`, and the
closure/weather constants → one controller → **secured on its first ride**.

Numbers the ride turned on, all read off the view before an order was written:

| fact | value |
|---|---|
| secure gate | `wave >= 12` **AND** `now.motor.objective.arrived` |
| fuel in the whole run | 3 nodes × 3 tar × 4 = **36**; Hauler burns 3/s **by the clock** |
| weather cycle | 30 s: clear 6, telegraph 4, **storm 12**, clear 8 → storm is `t mod 30 ∈ [10,22)` |
| closed lease | `corridorIds[floor(t/30) % 3]` while the storm blows; carries **no road bonus and takes no delivery** |
| graded road | 2.5× speed, 0.4× fuel → 0.053 fuel/wu against open country's 0.333 (**6×**) |
| roster | `motor_gang`, `tar_sprite` — **no `wrecker`, no `thief`** → `works.wrecked` 0, `goldStolen` 0 |
| pocket | claim (0,−4) sits **inside** build zone `county-camp` (x −24..24, z −24..16) |

Route, chosen by arithmetic (all six orderings priced): **W(out, home) → cross → N(out, home) →
cross → E(out)** = 25.87 fuel clear, the cheapest of the six; every alternative pays an extra
open-country crossing at 6.67–8.0 fuel. Measured **32.952 of 36 drawn** with the storm tax paid on
three of the eight legs. All three corridors graded for free — the west and east corridor stakes
*are* tar nodes 1 and 3, so grading cost nothing but a `GRADE` order at a stop already being made.

Delivery HAULs were hard-gated on the closure schedule in closed form and parked with `HOLD` when
unsafe; that fired exactly once, at t = 60 for the north lease, and cost one wave boundary.

## Outcome

**SECURED.** `waves 12 · timeAlive 360.000 s · gold 5 · calls 39` (kills 416,
`defaultedSecure: 1`, `defaultedPicks: 0`). Errand `arrived` at **t = 114.167**; all three leases
delivered; `tarHarvested: 9`, `fuelDrawn: 32.952`, `roadDistance: 325.232` of `distanceTravelled:
359.942` — 90 % of the drive rode graded road.

Tape put forward: **`artifacts/heat12/opus/e4-gusher-county/attempt-1-tape.json`**, declared in
`gauntlet-outcome.json`'s `tape` field. It is a **byte-identical copy of `tune-1-tape.json` — one
ride under two filenames**; the controller secured on its first ride and the rules end the ride at
the first SECURED outcome, so that tune *is* the scored attempt.

**2 sim runs** (1 idle probe + 1 controller ride) · **1 scored attempt**.

Admissibility, measured off the tape: `durationTicks` **10800**, last accepted order at tick
**10717** (83 ticks of slack — clear of the F-HEAT11-1 terminal-tick case), **39 entries**,
**111,961 bytes** against a ~345 KB ceiling. Local assay (`scripts/assay-replay-agent.mjs`)
reproduced the tape's own `eventLogHash` **`fnv1a32:abfd532f`** and all four outcome fields.
(That is the *tape header's* hash; the stdout outcome line's `fnv1a32:b61647e9` is a different
number by design — comparing the wrong pair reads as a false mismatch.)

## What the map asked

It asked about **distance, road, fuel and a storm clock — E4's signature mechanic, live,
legible and gating the secure** — and then it went quiet for eight waves. This is not stationary
survival wearing the era's name at the front end. `now.motor.objective.arrived` is ANDed into the
secure at every wave, and `deliveries` means the Hauler at rest within `stopReach` 2.5 of the head
of all three lease roads, **each while that road was open**. The leash is real: 36 fuel total
against a burn priced *by the second*, so the storm is not flavour — it stretches every second the
Hauler is moving, and the closure turns one lease at a time into a 6× trap by stripping the road
bonus (the 49.66 wu west road costs **2.65 fuel graded and 23.6 driven closed-and-storming**). The
fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `remaining`,
`delivered`, `arrived`), `now.motor.fuel` (`nodes[].harvested/progress`, `tar`, `stored`, `drawn`),
`now.motor.roads` (`corridors[].start/end/graded/closed`, `closed`, `closesNext`, `gradeReach`,
`friendlySpeedMultiplier`, `friendlyFuelMultiplier`) and `now.motor.weather`
(`phase`, `cycle`, `simTime`); the orders were `MOVE_TO`, `GRADE`, `HAUL` and `HOLD`. The honest
qualifier is the one every Motor map has earned: the errand latched at t = 114 of a 360-second
contract, and waves 4–12 were ordinary stationary survival on a brutal 59–65 wu seam commute — but
unlike a reskin, the era's lever **is half the win condition** and made me do closure arithmetic
before writing an order.

My notebook remembers this map from generation 17, which secured the same seed on engine
`49c34f8b`. **It still plays the way I remember, in every particular I checked** — same three tar
nodes on the z = −8 camp line, same 36-fuel leash, same `closures: true` clock, same
`corridorIds[cycle % 3]` pick, same 25.87-fuel optimal route, same w5/155 s idle floor. On the
week's named change I can be exact rather than hopeful: `motorActions` is pushed only by
`RunTape.recordMotorAction`, whose callers are the **browser** game, and my reel carries three
accepted `HAUL`s and **no `motorActions` key at all** — the second drain's plain-boot composition
is a browser-side change the headless door does not see. What reached me is the first drain's
`MotorSocket`, which generation 17 already rode.

## Winnability

Secured, and the margin was **wide on the errand and thin on the purse**: the errand banked at
t = 114 with 3.05 fuel of 36 unspent and 246 seconds of slack against the wave-12 gate, and the
hero finished 75.8/175 with four turrets and a beacon that could never be wrecked — but the fort
was still buying its last rung at wave 11, and I banked 5 gold of 370 panned, which is the whole
margin left on the table.

## Lessons for my notebook

- **A notebook entry that says SECURED is a claim about a margin as well as a map — and this time
  the map, the margin AND the plan all reproduced.** Generations 50 and 51 both found E4 geometry
  that held and comfort that had rotted; Gusher County is the counter-example, and saying so
  plainly is as useful a result as finding that a map moved. The era-pin ledger, read as a diff
  against the notebook, remains the cheapest document in the county.
- **Follow the era-pin's named drain down to its CALLERS before believing it moved your board.**
  `motorActions` looked like a live change to the reel format; `grep recordMotorAction` returns
  browser-only call sites and my reel carries no such key. Two minutes turned "the tape format
  changed under me" into a verified "the headless door never sees it." Second heat running that
  this exact check paid on an E4 map (generation 52 made it on the Boneyard).
- **Price EVERY route ordering before writing an order; on a Motor map the tour order is the
  contract.** Six orderings, six numbers: W→N→E is 25.87 fuel and W→E→N is 27.67 while N-first is
  33.5 — against a 36-fuel run with a ~1.18× expected storm tax, the difference between the best
  and the worst ordering is the difference between securing and stranding. The rule that generates
  it: open country is 6× graded road per unit, so **minimise open crossings between stakes, and
  give the last lease no return leg.**
- **Grade where you are already standing.** The west and east corridor stakes ARE tar nodes 1 and
  3, so all three corridors were graded inside the first 18 seconds for the cost of three `GRADE`
  orders at stops the Prospector was making anyway. Intersect `fuel.nodes × roads.corridors[].start
  × harvestAnchors` before routing phase 0 — the same "derive placement from the intersection of
  the rules" move, solved for an errand instead of a fort.
- **Let the Prospector walk on while the Hauler drives.** `HAUL` captures the Prospector's position
  at dispatch and drives to that fixed point, so the worker does not have to wait for the arrival.
  Deriving the errand index from `vehicle.target ?? vehicle.{x,z}` (not from `vehicle` at rest)
  means the next view sends the Prospector to the *next* waypoint while the current drive is still
  in flight. That parallelism is free and it is most of why the errand latched at t = 114 instead
  of t = 160.
- **Gate hard on the disaster, softly on the tax — and terminate the gated chain with `HOLD`.**
  A closed lease takes no delivery AND strips the road bonus (6×); a storm on an open lease is a
  1.43× tax worth paying. My closure gate fired exactly once and cost one wave boundary. Critically,
  a gated chain must end in `HOLD` at that waypoint: falling through to the harvest tail would have
  sent the worker 60 wu away and lost the whole window (generation 17 learned this; inheriting the
  *shape* of the fix, not just the sentence, is what made it work first try).
- **Compute the closure schedule in closed form from the published constants, and never sample it.**
  `cycleSeconds 30 / clearSeconds 6 / telegraphSeconds 4 / stormSeconds 12` plus
  `picks: corridorIds[weather.cycle % 3]` gives `closedAt(t)` exactly, which lets a gate reason
  about a *projected* dispatch time several seconds in the future. `roads.closed` only tells you
  about now, and now is not when the drive happens.
- **Read the roster for what it OMITS — sixth contract running.** Neither `motor_gang` nor
  `tar_sprite` carries `wrecker` or `thief`, so `works.wrecked` was 0 and `goldStolen` 0 for the
  whole run. That deletes `REPAIR_UNDER`, palisade chaff and every decoy idea, and makes the fort a
  monotone investment — which is what let me spend the first 114 seconds entirely on the errand
  with nothing standing.
- **The opportunistic pan is a route property, not a policy.** This seed's only two neighbouring
  live seams, (−40,−48) and (−56,−36), sit 7 and 13 wu from the WEST LEASE HEAD — the errand walks
  the Prospector into the middle of the map's only good economy for free. Intersect
  `objective.stops × seams` before designing the economy; it bought the opening turret out of a
  trip I was making regardless.
- **What I left on the table, named precisely for next time: the purse.** I finished with 5 gold of
  370 panned and the ladder still buying at wave 11, because the harvest tail re-sorted seams by
  distance from the *Prospector* every view and the two-seam west pair (20 wu apart, 30 capacity,
  20 s respawn ⇒ ~2.27 g/s) kept getting abandoned for whichever seam happened to be nearest after
  a build trip. Pin the chain to the best *pair* by mutual distance and hold it; gold is the only
  free ranking axis once waves and `timeAlive` are pinned by a fixed-wave secure.
- **Measure the envelope on the first reel that exists.** 10800 ticks with the last accepted order
  at 10717, 39 entries, 111,961 bytes — all three axes read before I called anything an attempt. The
  blank line at `pendingSecure` did both its jobs again (banked the secure for free, kept the last
  order 83 ticks inside the envelope); seventh contract running it is standing equipment.
- **Hand-write the final row.** Ninth generation where the best-so-far comparator cannot know which
  run I chose to *call* my scored attempt, nor that the promoted tape lives under a second filename.
  The brief is explicit that the operator reads the `tape` field, never the filename; I wrote both,
  made the two files byte-identical, and said plainly in the outcome file that they are one ride.
