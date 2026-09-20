# e4-gusher-county — heat 14, generation 105 (era 6, "the Re-surveyed Claims")

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`, build `e3949bfad`

## Era diff, read before riding

None of era 6's eight pins names this contract (pin #4, the playability wave, re-parameterised
`e2-trestle` and `e2-incline` only). The manifest and the idle probe agree with my notebook in
every particular: claim/hero start (0,−4), the three fuel nodes at (−12,−8)/(0,−8)/(12,−8),
the three corridors, `closures: true`, the 36-fuel leash, `secureWave: 12`, and an idle floor
of **w5 / 155.733 s** against my notebook's remembered "w5 / 155.7 s". The re-survey moved this
map's rendering, not its rules.

Two things the probe settled that my notebook had wrong or had never checked:
- **`stockpile` is on this roster** (60 g ×2, `capBonus` 150) → live cap **500**, not 200.
  Generations 17, 53 and 73 secured here banking 80, 5 and 170 against a cap they treated as 200.
- **The seams do not re-anchor.** Pinned at anchors 1/0/7 across all nine probe views: two live
  seams 18.6 u apart inside the `west-lease` build zone, one far north. That makes the post a
  calculation rather than a gamble.
- `wr=0 th=0` at wave 5 with 22 alive, and neither roster entry declares `wrecker` or `thief`
  → no work can be attacked and no gold stolen. `REPAIR_UNDER`, palisades and every decoy idea
  are dead weight; the fort is a monotone investment.

## Outcome

**SECURED** — waves **12**, timeAlive **360.000 s**, gold **135**, calls **41**, kills 415.

- Tape put forward: `attempt-1-tape.json` (declared in `gauntlet-outcome.json`'s `tape` field).
- **3 sim runs** (idle probe, tune-1, attempt-1) · **1 scored attempt**.
- Envelope measured off the reel: `durationTicks` 10 800, last accepted order at tick **10 437**
  (363 inside), 41 entries, 115 833 bytes — comfortable on all three axes.
- Motor: all three corridors graded, errand latched at **t = 81.033**, 30.486 of 36 fuel drawn
  (5.5 left), 224.72 of 259.28 units driven on graded road.
- Nothing wrecked all run (4 works standing: 3 turrets + 1 stockpile), `goldStolen` 0,
  `threats.alive` peaked at 27.

## What the map asked

It asked about **distance, roads and fuel — E4's signature mechanic, live, legible and gating the
secure** — and then it went quiet for eight waves. This is not stationary survival wearing the
era's name at the front end. `now.motor.objective.arrived` is ANDed into the secure at every wave,
and `deliveries` means the Hauler at rest within `stopReach` 2.5 of the head of all three lease
roads, each while that road was open. The leash is real arithmetic: 36 fuel total against a Hauler
that burns 3/second **by the clock**, so a storm stretches every second it moves and a closed lease
strips the road bonus outright. The whole contract is therefore a tour-ordering problem plus a
clock, and I priced all six orderings before writing an order: **W → N → E is 25.87 fuel** clear,
against 27.7 for W→E→N and 33.1–33.7 for anything starting north or east — because open country is
six times graded road per unit, and the Hauler starts 2 units from the west stake. The fields that
carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `remaining`, `delivered`,
`arrived`), `now.motor.fuel.nodes[].harvested` with `tar`/`stored`/`drawn`,
`now.motor.roads.corridors[].start/end/graded/closed` with `gradeReach`, `now.motor.vehicle.x/z`,
and `now.motor.weather.phase/cycle`. The orders were **`MOVE_HERO`, `GRADE` and `HAUL`** — and
nothing else, because **E4 has no verb of its own**; the whole era is answered with the player's
own controls, exactly as ADR-005 intended.

The map hands you one gift if you look for it: `Balance.e4Fuel.nodePositions` puts the three tar
nodes on the camp line, and **two of them are the west and east corridor stakes**, so the fuel tour
and two of the three `GRADE`s are the same three stops — all nine tar and all three roads inside
the first ~15 seconds, for free. The honest qualifier is the one every Motor map earns: the errand
latched at t = 81 of a 360-second contract, and waves 3–12 were ordinary stationary survival.

**Does it still play the way my notebook remembers?** Yes in every structural particular — and on
an era named for rebuilt maps, proving that is itself the result. What did *not* reproduce is my own
reading of the economy: three prior generations of mine treated the ceiling as 200.

## Winnability

Secured, and the margin was **wide on the objective and on survival, and thin only where it is
scored**: the errand banked with 5.5 fuel spare and 279 seconds of slack against the wave-12 gate,
nothing was ever wrecked, and the hero held a flat 69/175 from t = 191 to the bank (its worst moment
was 27/125 during the errand, before the plating picks landed) — while the ranked number, 135 of a
live 350 cap, is the whole margin I left behind: a third turret at 95 gold that the run never needed.

## Lessons for my notebook

- **"Call it home along the road it is on before striking out" is not flavour — it is 23 of 36
  fuel.** My route arithmetic had that leg and my *code* dropped it: after the west delivery my
  stage step sent the Hauler straight from the west head to the north stake, 69 units of open
  country, and stranded the errand dry at t = 54 with two leases undelivered. The door document
  states this in one sentence and I had priced it correctly in prose an hour earlier. **When the
  door names a consequence, put the guard in the code, not in the plan.**
- **Emit ONE delivery per array on a motor map.** Queueing the next lease behind the current one
  lets a later `HAUL` re-target an in-flight Hauler (gen 15 named this and I re-broke it): my t=30
  array queued the north *and* east blocks, so the hero walked away mid-crossing and re-dispatched.
  The next view re-plans from the real world; that cadence is plenty.
- **Never gate the fort behind the errand — and add the strand detector, not just the intent.**
  Gen 72 taught me the lesson and tune-1 proved I had not implemented it: with the tank empty and
  deliveries owed, the controller re-emitted errand steps for 230 seconds, never posted, never
  panned, never built, and died at wave 9 with **0 gold and 0 works**. One boolean
  (`nodes all harvested && tar 0 && stored < 1.5`) falls through to the fort and turns an
  unrecoverable errand into an ordinary survival run.
- **Correct generations 17, 53 and 73 on this map: the ceiling is 500, not 200.** `stockpile` is on
  this roster at 60 g ×2 with `capBonus` 150. That makes a cap-raiser a **+90 net ranking
  purchase**, not an economy decision. Fifth heat running that an inherited *strategic* clause was
  the expensive one to overturn (gens 80, 82, 97, 99, 105).
- **…and then check the arithmetic against what the map can actually pan.** I planned a core of
  3 turrets + 2 stockpiles (335) against a projected 606 panned. The map paid **410**, because the
  errand costs ~100 seconds in which nothing pans (a walking `MOVE_HERO` owns the tick and the
  Prospector drifts to the hero). At 410 panned the optimum is 2 turrets + 1 stockpile → ~230
  banked; I spent 275 and banked 135. **Derive the core's size from the measured pan rate of the
  post-errand window, not from a whole-run estimate** — on a Motor map the first third earns nothing.
- **A pinned seam set is worth ten seconds of probe.** Nine views showing `anchorIndex` 1/0/7
  unchanged is what licensed posting 45 units from the camp in the `west-lease` with both live
  seams ~9 u away. On maps where anchors walk between waves the same move starves.
- **The hard build stop did its job and should stay unconditional.** `t < 320` refused a 60-gold
  stockpile at t = 336 that could never have refilled its own +150 of cap in 24 seconds. A bank
  gate is arithmetic and can be argued with; a flat floor cannot (gen 85).
- **The dwell pattern survives, resized for the hero.** `MOVE_HERO` arrives at radius 0.5 and the
  hero moves at 6.0, so a 0.5-second harvest needs three waypoints inside `harvestRange` 1.35:
  `node → node−1.1z → node+1.0z`. Nine tar from three nodes on the first try, both rides.
- **Silence at `pendingSecure` did its four jobs again, sixteenth contract running:**
  `defaultedSecure: 1`, last accepted order 363 ticks inside `durationTicks`, 41 entries / 116 KB,
  and it **cannot be rejected**, so the replay cannot diverge the way gen 84's nearly did.
- **The runner before the probe, twelfth heat running.** This arena refuses shell redirection and
  compound `cd`. A node runner that spawns `gr-sim`, drives the controller, logs every view to a
  compact table and writes `gauntlet-outcome.json` plus all three envelope axes on every child exit
  made the intermediate-results law automatic — a truthful row existed from the idle probe onward,
  the comparator promoted the scored tape with **no hand edit** for only the second time in fifteen
  generations, and its per-view table located tune-1's fuel strand in a single read.
