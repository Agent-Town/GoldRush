# e4-boneyard — heat 13, generation 72 (claude-opus-5)

- rig: `claude__opus-5` · harness: Claude Code CLI 2.1.257 · worldModel: `sim-import`
- era: `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4` (era 5, the Replayed Board)
- contract `e4-boneyard`, bench seed `e4-boneyard-01`, trail difficulty

## The ride, in order

1. **Idle probe** (`probe-*`) — w4 / 124.867 s / 0 g. Read `now.motor` in view 0: the tow's two legs,
   the three tar nodes, the 36-fuel leash, the corridor stakes.
2. **`ctrl-v1` / `tune-1`** — w4 / 126.500 s / **200 g and zero works**. Three faults, all mine, all
   named by the per-view log: my single hulk standoff at `(-18,-9.5)` answered `UNREACHABLE_TERRAIN`
   (the hulk carries a landmark blocker), the fort was gated behind `objective.arrived` so it never
   built, and my seam chain re-sorted across all ten anchors and walked the Prospector 60 wu for
   5 gold.
3. **`ctrl-v2` / `tune-2`** — **SECURED w12 / 360.000 s / 200 g**, promoted by name as the scored
   attempt. `attempt-1-tape.json` is a byte-identical copy of `tune-2-tape.json`: one ride, two
   filenames.

### Receipt

`node scripts/assay-replay-agent.mjs attempt-1-tape.json` →
`{"eventLogHash":"fnv1a32:464d1a6b","outcome":{"secured":true,"waves":12,"gold":200,"timeAlive":360},
"securedSnapshot":{"waves":12,"gold":200,"timeAlive":360}}` — the **tape header's** hash, reproduced
(the stdout outcome line's `fnv1a32:2f7af13a` is a different number by design). The declared gold
equals the secure-tick purse, so the row cannot draw `score_mismatch`.

### Envelope, measured off the reel

| axis | mine | ceiling |
|---|---|---|
| durationTicks | 10 800 (last accepted order at tick 10 763) | 18 002 |
| entries | 50 | 3 601 |
| bytes | 171 351 | 1 938 784 |

(The brief's `16 KiB + maxEntries x 160` is the conservative floor;
`PlaybookFormat.runTapeEnvelopeForContract:107` adds a second `maxOrderEntries x (2400-160)` term.)

---

## Outcome

**SECURED.** `waves 12 · timeAlive 360.000 s · gold 200 · kills 321 · calls 50 · defaultedSecure 1`,
`motor: {towed: true, hauled: true, arrivedAt: 59.667, tarHarvested: 9, fuelDrawn: 26.688,
distanceTravelled: 69.469, graded: []}`.

Tape put forward: `artifacts/heat13/opus/e4-boneyard/attempt-1-tape.json` (declared in
`gauntlet-outcome.json`'s `"tape"` field; byte-identical to `tune-2-tape.json`).

**3 sim runs · 1 scored attempt.** The ride stopped at the first secure, as the rules require —
and there was nothing left to win: a fixed wave-12 gate pins `waves` at 12 and `timeAlive` at
360.000 s, and 200 is the bank cap, so both free ranking axes were already at their ceilings.

Run shape: hero **never dropped below its running maximum across all 52 views** (100/100 → 125 →
150 → finishing **175/175**), **0 of 7 works ever wrecked**, `goldStolen` 0, `threats.alive` pinned
at its 60-enemy cap from wave 9, 645 gold panned against 445 spent.

## What the map asked

It asked about **distance and fuel — E4's signature mechanic, live, load-bearing and gating the
secure** — and then it went quiet for ten waves. This is not stationary survival wearing the era's
name at the front end. The secure is a conjunction: `wave >= 12` **and**
`now.motor.objective.arrived`, and for `kind: "tow"` that means two separate rests —
`MotorSocket.settleTow` hitches when the Hauler comes to rest within `stopReach` 2.5 of
`spent-boiler-west` at (−18,−8), and delivers when it rests again within 2.5 of the gate end of
`gate-to-west-rows` at (−8,−38). `objective.stop` **moves** the instant `hitched` flips, so the
errand is two dispatches with a state flip between them and my controller branched on
`objective.hitched` rather than on its own clock. The arithmetic is a real leash and it bound: the
run holds exactly 36 fuel (three nodes × three tar × four fuel), the Hauler burns **by the second**,
and my tow measured **26.688 fuel for 69.469 units** — 0.384 fuel per unit against a clear-weather
0.333, i.e. a **15 % storm surcharge** paid because `stormMovementMultiplier: 0.75` stretches every
second the Hauler is moving. Two nodes would have been 24 fuel and would have stranded the objective
outright, which is exactly why I toured all three. The fields that carried it were
`now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`),
`now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z`
and `now.motor.weather.phase`; the orders were **`MOVE_HERO`** and **`HAUL`**, and nothing else.
**`GRADE` is worthless here and that is a finding, not an omission**: I issued none
(`graded: []`, `roadDistance: 0`), because the Hauler drives straight lines and the tow's delivery
point *is* the corridor's start stake, so the only road it could grade runs away from both legs.
Across the four Motor maps `GRADE` ranges from mandatory (the Long Road: 123 fuel ungraded against a
36-fuel tank) to inert; the arithmetic, not the epoch, says which.

The honest qualifier is the one every Motor map earns: **the errand latched at t = 59.667 of a
360-second contract**, and waves 2–12 were ordinary stationary survival at the claim against a
one-id, thief-only roster on a 40–60 wu seam commute. Call it the first sixth of the run genuinely
E4 — but unlike a reskin, the era's lever *gates the secure* and made me do fuel-and-distance
arithmetic before writing a single order.

**Does my notebook still remember this map?** Its geometry, yes; its controls, no — and the control
change is the whole heat. Generations 15 and 52 both rode this seed and every structural number
reproduced exactly: the same claim at (0,−44), the same hulk, the same moving stop, the same three
tar nodes on the z = −8 line, the same 36-fuel leash, the same `GRADE`-is-worthless verdict, the same
w4 idle floor. What moved is that **the errand's cursor changed body**. Generation 52 aimed `HAUL`
with the Prospector's `MOVE_TO`; that verb is gone, `HAUL` now reads the **hero's** ground
(`HeadlessContractSim.motorVerb:3106`), and the hero — unlike the Prospector — is refused by
`Terrain`'s landmark collision. `spent-boiler-west` carries a blocker of half-extents 1.753 × 1.179,
padded by the hero's radius to **2.333 × 1.759**, so every point my predecessor could stand on is
now `UNREACHABLE_TERRAIN`, and the walkable ring that still fits inside `MOTOR_STOP_REACH` 2.5 is
about 0.7 wu thick. That one rectangle cost me a whole run.

## Winnability

Secured, and the margin was **enormous on survival and genuinely thin on the purse**: the hero took
effectively no damage across all 52 views and finished 175/175 with all seven works standing
unwrecked, but gold reached the 200 cap only at **t = 340.1 of 360** — my last beacon spent the
purse to 0 at t = 256.7 and it took 83 seconds of panning to climb back, so ~20 seconds of slack
stood between a 200-gold row and a worse one.

## Lessons for my notebook

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
