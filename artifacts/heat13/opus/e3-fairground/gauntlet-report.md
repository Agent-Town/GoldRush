# e3-fairground — generation 87 (claude-opus-5, harness 2.1.257, era 09838c35)

Seed `e3-fairground-01`, trail difficulty. `worldModel: sim-import`.

## What the contract actually is (read from source, before any order)

`HeadlessContractSim.autoSecureWaveForRun` ANDs **two** fairground clauses into the gate
(`src/sim/HeadlessContractSim.ts:1466-1467`):

- `twist.fairground && ferrisWheel.diagnostics.spinning === false` → unsecurable.
  `FerrisWheel.damage()` (`src/entities/FerrisWheel.ts:82`) sets `spinning = false` on **any**
  damage at all and never restarts it mid-run. One hit on the Fair Wheel at (0,8) ends the claim
  at every later wave.
- `crowdFlocks !== null && !crowdFlocks.allCrossed` → unsecurable. Three flocks, homes at
  (−20,−30), (0,−30), (20,−30), destinations copper-pavilion (−20,10), the wheel (0,8), and
  silver-pavilion (20,10). Each launches at the first `dark` tick of a new 24-second cycle
  (`within ∈ [12,21)`, so t = 12, 36, 60 …), walks at 3.6 u/s, and **any living enemy within
  escortRadius 7 of the moving flock scatters it and voids that crossing**. A crossing is
  permanent once banked (`crossings > 0`), so 15 nights give 15 attempts per flock.

`twist.powerGrid` exists, so `MechanicsManifest` strips `turret` and `lantern_post`: the whole
arsenal is `sentry_beacon` (6, 25/35/45/55/75/95) and `palisade` (48, 10 flat).

The idle probe named the map in one run: **the wheel takes its first hit at t ≈ 21.5 and is at
0 hp by t = 32.5, before wave 1 finishes**, because `fevered_saboteur` walks to the nearest
building and with no player work standing the wheel *is* the nearest building 46 units away.

## Outcome

**NOT SECURED.** Best ride `tune-1`: **waves 6 · timeAlive 195.767 s · gold 36 · calls 229**
(`fnv1a32:85b63f92`), ended `hero_down`. **6 sim runs, 1 scored attempt.**
Tape put forward: **none** — nothing secured, so nothing is submittable. `attempt-1-tape.json`
(byte-identical to `tune-1-tape.json`) is named in `gauntlet-outcome.json` only so the record is
unambiguous; it carries `secured: false` and must not be submitted.

The more informative ride is `tune-4` (w4 / 143.333 s): it **satisfied both secure clauses at
once** — `flock-1: 1, flock-2: 1, flock-3: 4` crossings (so `allCrossed` true) with the wheel
still spinning at 240/240 — and died on hero HP eight waves short of the gate.

| run | policy | waves | t (s) | wheel | flock crossings |
|---|---|---|---|---|---|
| probe | `--policy idle` | 1 | 48.8 | **lost t≈21.5** | — |
| tune-1 | symmetric ring r≈9 at the stake, hero welded at (0,−30) | **6** | 195.8 | intact 240/240 | (not logged) |
| tune-2 | beacon-first ladder | 5 | 158.6 | **lost t≈30** | 2 / 0 / 0 |
| tune-3 | hero to the west corridor (−10,−33) | 5 | 160.2 | **lost t≈134** | 0 / 1 / 3 |
| tune-4 | v3 + never rebuild a wrecked frame | 4 | 143.3 | intact | **1 / 1 / 4 → allCrossed** |
| tune-5 | v4 + wide kiting under 82 % HP | 4 | 141.8 | intact | — |

## What the map asked

It asked its era's signature mechanic squarely — **E3, the grid under sabotage / graph reasoning
— and the graph here is a targeting graph rather than a power graph.** This is not stationary
survival wearing the era's name. The declared `twist.powerGrid` (wheel dynamo 24 W → two pavilion
lamps) is real but inert as a lever: nothing in `now` publishes node state and there is no E3
verb. What *is* load-bearing is that **the graph's root is a damageable building registered in the
targeting system** (`this.targeting.registerBuilding(wheel.target)`, `:1226`), so the whole
contract is a nearest-neighbour problem over the set {my works} ∪ {the wheel}: a wrecker at P
attacks the wheel exactly when `min_i |P − work_i| > |P − wheel|`. Because saboteurs spawn only
west and east at (±26,−30) and the wheel is 46 units away at (0,8), **any standing work in the
south midway is nearer, and the wheel is never touched.** That is the reasoning the map wants, it
is derivable from the view alone, and it is decisive: the idle probe loses the wheel in 21 seconds
and every ride of mine that kept one work standing kept the wheel at a pristine 240.

The second, better half is the escort, and it is a genuine geometry problem laid on top of the
first. The three flock lanes are the vertical lines x = −20, 0, +20; fright radius is 7; so the
rider's job is to keep the *enemy mass* out of three 14-unit-wide bands. The mass sits wherever the
rider's own works and hero are, because works pull wreckers and the hero pulls runners
(`night_runner` enters at the declared gate (−12,−4)). The corridors x ≈ ±(6…13) are exactly the
gaps between the lanes, and **moving the fort and the hero into those corridors is what turned
flock crossings from 0/0/0 into 1/1/4.** With the hero welded at (0,−30) under the old grammar
flock-2 could never leave home — everything on the claim converges on the stake, which is
flock-2's own doorstep. `MOVE_HERO` is what makes the escort solvable.

View fields that carried it: `now.fairground.wheel.hp/spinning`, `now.fairground.flocks.flocks[]`
(`phase`, `crossings`, `frights`, live x/z) and `allCrossed`, `now.works.entries` (position +
`wrecked` — the only way to watch the bait being eaten), `now.works.byKind/standing/wrecked`,
`now.seams[].active/x/z` (only two live, at (18,−38) and (−24,−34); an inactive seam publishes
`x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers`, `now.orders[].status/reason`. Orders used: `BUILD`, `HARVEST`,
`REPAIR_UNDER`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_HERO`. **There is no E3 verb.**

My notebook remembers this map from generation 13, which did not secure it. Its bones still hold —
same 22-second blind opening, same wheel-as-armour finding, same starved 1.4 g/s economy — but its
central sentence is dead: it rode a welded hero and could only bait with buildings, and the three
crossings it never achieved fell out of `MOVE_HERO` in one ride.

## Winnability

**Probably yes, and what stopped me was my own budget, not a wall in the map, the grammar or the
economy:** `tune-4` met *both* secure clauses by t = 143 (all three flocks crossed, wheel untouched)
and `tune-1` reached wave 6 with the wheel at 240/240, so the two hard objective latches are
demonstrably solvable on this seed — the only missing piece is keeping a 125-maxHp hero alive from
wave 6 to wave 12 against a 60-cap swarm on a measured 1.4–1.5 g/s economy that funded only two or
three of the six beacons; the levers that close it are named and untested (see below), and I ran
out of wall clock with the fort-decay problem diagnosed and unfixed.

## Lessons for my notebook

- **A contract can carry two independent secure latches with opposite retry rules, and they want
  opposite policies.** The Fairground's wheel clause is a ONE-HIT, no-retry latch; its flock clause
  is a fifteen-try latch. So the wheel gets bought with permanent structure and the flocks get
  bought with early nights and clear lanes. Read `autoSecureWaveForRun` for **every** clause your
  twist keys, then classify each one as *recoverable* or *unrecoverable* before designing anything:
  the unrecoverable one sets the floor and the recoverable one sets the schedule.
- **When an objective is a damageable building, the contract is a nearest-neighbour inequality and
  your own cheapest work is the whole answer.** With no player work standing, the idle probe loses
  the Fair Wheel at t = 21.5; a single 10-gold palisade 16 units from the spawn ring keeps it at
  240/240 for the whole run. Generation 13 wrote "your own walls are somebody else's armour"; the
  sharper form is **compute the bisector**: a work protects the objective from every point on the
  objective's side of the perpendicular bisector between them, so two flank works cover both spawn
  edges and nothing else is needed for the latch.
- **A WRECKED frame still occupies its tile, so a "rebuild the wrecked rung" rule is a collision
  generator.** My v3 un-poisoned a rung whenever its entry read `wrecked` and re-issued the BUILD:
  26 `FAILED (collision)` records, each one a full Prospector round trip, and the economy fell from
  1.4 g/s to **0.5 g/s**. Treat a wrecked work as BUILT and re-arm it with `REPAIR_UNDER` (25 % of
  cost) — the ground is not free until the frame is demolished.
- **`REPAIR_UNDER` searches only within `Balance.sparkRig.range` (10) of the PROSPECTOR** since
  ADR-005 stage 2, and the Prospector lives at the seams. On a map whose seams are 20–25 units from
  the fort, an un-placed mend order simply never finds a target and the ring decays to nothing
  (8 of 9 works wrecked in tune-4). **Put one or two bait works inside 10 units of a live seam
  anchor so the panning Prospector mends them for free** — that is now a placement rule, not a
  repair rule.
- **A failed `REPAIR_UNDER` is a commute, not a free decision point.** The verb walks first
  (`return { movement: target.position }`) and only then calls `repair()`, so a mend attempted with
  an empty purse pays the travel and buys nothing: 43 rejections in tune-1. Gate the *emission* of
  the order on gold ≥ the mend price; `REPAIR_UNDER` has no `when` clause to do it for you.
- **Where the enemy MASS sits is a rider-chosen variable, and on an escort map it is the whole
  objective.** Works pull wreckers, the hero pulls runners; both were on the flock lanes by default.
  Moving the fort and the hero into the x ≈ ±(6…13) corridors — the gaps between lanes at
  x = −20, 0, +20, each ≥ 7 from every lane — took crossings from 0/0/0 to 1/1/4 with no extra
  gold. Before designing a fort on an escort map, draw the objective's corridors and place
  everything you own in the complement.
- **Correct my generation-13 diagnosis.** It concluded the Fairground turns on the *tempo* of the
  opening (gold before the first wrecker arrives). It does not: two palisades land at t ≈ 13 and
  17 on any sane opening, which is early enough, and every ride of mine that kept one work standing
  kept the wheel. What it actually turns on is **fort persistence** — bait mass that keeps being
  re-armed for 360 seconds — and the constraint on that is the *repair radius*, not the clock.
- **Kiting is not free on a one-body map, and it did not pay here.** `MOVE_HERO` returns truthy
  while walking, so it owns the tick and the Prospector gets no work assignment; a retreat circuit
  under 82 % HP (tune-5) cost a wave versus standing still (tune-4). The hero outruns the roster
  6.0 to ~3.0, but arrival radius 0.5 means the hero *stops* between views and the shuffle buys
  less than the panning it costs. Kite only when a walk can outlast the view gap.
- **Ride the skeleton first — and I did the opposite, twice.** tune-2 changed the ladder AND the
  rebuild rule; tune-3 changed the hero position AND the retreat; each came back worse and only
  tune-4 (one change: stop rebuilding wrecked frames) produced a clean measurement. Four of my six
  runs went to my own controller's faults rather than to a hypothesis about the board. On a
  25-minute wall that is the whole heat.
- **Write the compact log against the field the view actually publishes.** I logged flocks from
  `now.crowdFlocks` (an event-log field) instead of `now.fairground.flocks`, so my best run
  (tune-1) has no flock record at all and I learned the escort was solvable only on run four.
  Fifth generation running that one wrong field name cost me a run's worth of information.
