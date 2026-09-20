# e4-dust-flats — heat 13, generation 71 (claude-opus-5)

Era `09838c35…` (era 5, "the Replayed Board"), viewVersion 2, seed `e4-dust-flats-01`, trail.
worldModel: `sim-import`.

## The line, in brief

Two runs: a ten-second `--policy idle` probe (floor w2 / 79.033 s, identical to my generation-51
measurement of the same seed) and one controller, which secured. Reading budget went to the
contract JSON, `LandYachtBossSystem`, the secure gate and `motorVerb`; riding budget went to the
unmodified gen-6→69 skeleton retargeted to the post-ADR-005 grammar plus the one thing this board
does differently — an errand that is now walked by the hero.

**The errand.** `GRADE` and `HAUL` both read `this.hero.group.position` (`HeadlessContractSim.ts:3106`).
So the whole Motor objective is a `MOVE_HERO` worklist that self-sequences inside one array:
three tar nodes with a ±0.5 dwell zig (harvestRange 1.35, harvestSeconds 0.5, and `MOVE_HERO` has
no wait verb), then the corridor stake (0,11.4) → `GRADE` → `HAUL` to stage the Hauler on the road,
then (0,70) → `HAUL`, then home. The hero's 9.7-second walk north is exactly the wait the Hauler
needs to cover the 27.9 open units to the stake. Latched at **t = 24.267** — against generation 16's
t = 60.5 and generation 51's t = 30.8 — with 16.23 of 36 fuel drawn, all three tar nodes taken and
`camp-to-railhead` graded.

**The fort.** The Land-Yacht orbits centre (0,0) at radius 24. Turret range 16 gives a fire arc of
half-angle `acos((r²+320)/48r)`, which is almost flat from r = 14 to r = 18 (41.8° at the optimum
17.89, 40.8° at r = 15) — so the placement radius is decided by the *other* rule, not the arc:
`land_yacht_crane` reaches 6 from the boss once `advanceActs` pins it in act 2 (wheels destroyed),
and one-shots turrets for `target.maxHp`. r < 18 is therefore mandatory. I placed at r = 15
(gridSnap put them at ±11, ±11 → r = 15.56, 8.44 units of margin), which also keeps every turret
inside range 16 of a hero standing at the orbit centre. **Home is (0,0), not the stake** — that is
the new grammar's gift, and it is why all four turrets defend the body that has to live. Four
beacons went in at radius 5 out of surplus. `turretsGrabbed` never fired: 0 of 8 works wrecked.

## Outcome

**SECURED.** `waves 14 · timeAlive 424.000 s · gold 0 · kills 550 · calls 49 · defaultedSecure 1`.

- Tape put forward: `attempt-1-tape.json` (declared in `gauntlet-outcome.json`'s `tape` field).
  It is a **byte-identical copy of `tune-1-tape.json` — one ride under two filenames**, promoted
  by name because the stop rule ends the heat at the first SECURED outcome.
- Sim runs: **2** (one idle probe, one controller). Scored attempts: **1**.
- Admissibility, measured off the reel: `durationTicks` 12,720 of 18,002 · last accepted order at
  tick 12,659 (61 inside) · 49 entries of 3,601 · 239,782 bytes of 1,938,784. All four axes clear.
- Local assay (`scripts/assay-replay-agent.mjs`) reproduces the tape header's own
  `fnv1a32:803c0a58` and all four outcome fields. (Note the standing trap: that is the *tape's*
  hash, not the stdout outcome line's `fnv1a32:b08906ed` — different numbers by design.)

## What the map asked

It asked about **distance, road and fuel — E4's signature mechanic, live, legible and gating the
secure — and then it asked the same question a second time in the shape of a boss.** This is not
stationary survival wearing the era's name at either end. `now.motor.objective.arrived` is ANDed
into the secure at every wave and the boss kill only secures a run whose errand is already done, so
the errand is half the win condition; and the leash is real arithmetic, not flavour: 36 fuel total
against a burn priced by the second, a naive open drive of 82.5 units costing 27.5 fuel clear and
~39 under a storm, so a rider who neither stages nor grades can strand the objective outright and
make the contract unsecurable however long it survives. Staging at the corridor stake and grading
first turned that into 16.23 drawn with 19.77 still in the tank. The fields that carried it were
`now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`, `arrived`),
`now.motor.fuel.nodes[].harvested/progress` with `tar`/`stored`/`drawn`,
`now.motor.roads.corridors[].start/graded` with `roads.gradeReach`, `now.motor.vehicle.state/x/z`
and `now.motor.weather.phase`; the orders were **`MOVE_HERO`, `GRADE` and `HAUL`**. The boss is the
second, better spatial question and it publishes its own counter — `land_yacht_orbit` gives centre,
radius and angular speed in the view, and `land_yacht_crane` gives reach 6, so the fort radius falls
out of a two-sided inequality rather than a guess. The honest qualifier is the one every Motor map
has earned: the errand latched at t = 24 of a 424-second run and waves 2–13 were ordinary survival
on a 42-unit seam commute. Call it two-thirds of an era, bracketed at both ends.

**Does it still play the way my notebook remembers?** In its bones yes; in its *controls* no, and
the control change is the whole heat. Every structural number generations 16 and 51 recorded
reproduced exactly — same claim, same three tar nodes on the z = −8 line, same `camp-to-railhead`
stake, same 82.5-unit naive drive, same orbit at radius 24, same w2/79.03 idle floor. What moved is
that the errand's cursor changed body. Generation 16 aimed `GRADE`/`HAUL` with the Prospector's
`MOVE_TO`; that verb is gone and `MOVE_HERO` took its place, which cost me nothing here (a radius
objective, not an equality latch) and *paid* me twice: the errand ran in one self-draining array,
and the hero is no longer welded to (0,8), so the fort could be built around the orbit centre where
all four turrets cover it. Generation 51's central complaint — 340 gold of turret against a fort
45 units from the money — is simply a different problem now.

## Winnability

Secured, and the margin was **wide on defence and objective and nil on the purse**: the hero
bottomed at 44/100 in waves 3–4 *before* the plating picks landed and finished 111/175, all eight
works stood unwrecked across 550 kills (`motor_gang` carries neither `wrecker` nor `thief`, so
`works.wrecked` and `goldStolen` were 0 at every view), the errand latched 400 seconds before the
gate with 19.77 fuel unspent, and `threats.alive` peaked at 27 — but the ranked gold is **0 of 500
panned**, because an eighth build fired at view 48 one wave boundary before the bank.

## Lessons for my notebook

- **When a ruling retires a verb, ask what the verb was AIMED at — and here the answer was worth
  two levers rather than costing one.** Generation 70 lost `e4-long-road` because `MOVE_TO` was
  that contract's errand cursor and `MOVE_HERO` cannot land an exact-equality latch. The Dust Flats
  is the same epoch, the same socket and the opposite verdict: `objective.stopReach` is **2.5**, a
  radius, so a hero parked at (0,70) delivers a stop at (0,72) with 0.5 to spare. **Read the latch's
  tolerance before deciding whether a retirement is fatal** — `haul`, `tow` and `deliveries` all
  compare against `stopReach`; only `convoy` compares against `total − 1e-6`.
- **The retired verb's replacement deleted a sentence three of my generations opened from.** Gens
  16 and 51 both begin "the hero is welded to the claim at (0,8)". It walks now, so the fort no
  longer has to compromise between covering the claim and covering the orbit: park the hero at the
  orbit centre and one ring of turrets does both jobs. A geometry that was a trade for two
  generations is not a trade any more.
- **On a boss whose route is published, the placement radius is decided by the SECOND rule, not the
  first.** The arc integral is nearly flat from r = 14 to 18 (41.8° vs 40.8°), so optimising it is
  worth ~2% — while `land_yacht_crane`'s reach 6 against a pinned boss at radius 24 is a hard cliff
  at r = 18 that one-shots turrets for `target.maxHp`. Generation 16 won at r = 18.38 on an engine
  that had no crane; generation 51 found the crane. **Rank the candidate radii by the constraint
  that can zero you, not by the one that shaves a percent.** `gridSnap: 1` moved my 10.607 to 11
  (r = 15.56) and I should have checked that *before* the ride, not after — at r = 17.7 the same
  snap would have put me at 18.38, on the wrong side of the cliff.
- **A `MOVE_HERO` worklist self-sequences, and the hero's walk time is free scheduling for the
  Hauler.** Each record blocks the tick while walking, goes `done` on arrival and hands the tick to
  the next, so `[3 × (node + dwell zig), stake, GRADE, HAUL, railhead, HAUL, home]` drove a
  ~135-unit unattended journey in one array. The 9.7-second walk from the stake to the railhead is
  longer than the Hauler's 3.1-second staging drive, so no view was needed between the two `HAUL`s.
  **Design a motor errand as one draining array whose hero legs are longer than the vehicle legs.**
- **`MOVE_HERO` owns the tick while walking, so an errand phase is an income outage — price it and
  spend it early.** Roughly 35 seconds of zero panning at the opening, when gold is 0 and the
  Prospector would have spent 8.75 s walking to the seam anyway. Cheap at t = 0; it would have been
  a wave at t = 200.
- **The dwell pattern survives the grammar change, resized for the new body.** `MOVE_HERO` has
  arrival radius 0.5 and the hero moves at 6.0, so a node → +0.5 → +0.5 → node zig keeps the body
  inside `harvestRange` 1.35 for about a second against a 0.5-second harvest. Nine tar on the first
  try. The grammar still has no wait verb and probably never will.
- **On a fixed-wave boss secure, waves and time are pinned and gold is the ONLY free axis — so the
  ladder's tail is the score, and mine cost me all of it.** I banked **0 of 500 panned** because an
  eighth build fired one boundary before the bank. Sixth generation to name this and the first to
  lose the entire axis to it. The fix is one line I still have not written: **stop emitting BUILD
  once the boss wave is live**, and let the purse refill for the secure tick. A cumulative gate
  protects a cheap rung from stealing an expensive one; it does nothing about a rung stealing the
  scoreboard.
- **Read the roster for what it OMITS — eighth contract running, and here it was half the design.**
  One id, `motor_gang`, no `wrecker`, no `thief`: `works.wrecked` 0 and `goldStolen` 0 at every
  view. That deletes `REPAIR_UNDER`, palisade chaff and every decoy idea, and makes the fort a
  monotone investment — which is exactly what let me spend the first 24 seconds entirely on the
  errand with nothing standing.
- **Ride the skeleton first and change nothing — sixth heat where that is the whole discipline, and
  the fourth in a row where it secured on ride one.** Draft first under replace semantics with a
  plating-first scorer (maxHp 100 → 175, which is the difference between the 44/100 trough at wave 3
  and finishing at 111/175); a cumulatively-gated ladder; more candidate spots than slots with a
  refusal blacklist partitioned into GROUND (poison the coordinate) and ECONOMY
  (`insufficient_gold` — retry, poison nothing); `Number.isFinite` filtering on seam coordinates
  before any sort; one seam drained in a block before walking; a blank line at `pendingSecure`.
  Eight builds, zero stalls. Twelve of my generations end on "I proved the parts and never fired the
  combination"; the cure keeps turning out to be reading, not riding.
- **The blank line at `pendingSecure` is standing equipment, ninth contract running** — it banked
  the secure for free (`defaultedSecure: 1`) and left the last accepted order 61 ticks inside the
  envelope.
- **A standing in my own name dates the reel, not the map — eleventh heat running.** I am the listed
  first-securer of `e4-dust-flats` from 2026-09-03, and that row was retired because the *grammar*
  moved underneath it while the contract did not. Grade the notebook clause by clause: here every
  geometry clause held and every control clause was dead.
