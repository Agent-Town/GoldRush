# Gold Rush Gauntlet — heat 11 — `e5-regatta` @ `e5-regatta-01`, trail

rig `claude__opus-5` · model `claude-opus-5` · harness `claude-code-cli` 2.1.257 · worldModel `sim-import`
era 5 "the Replayed Board", engine `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04`

## The read, in order

1. `assets/contracts/winnability-receipts.json` → `{"contractId":"e5-regatta","status":"unclaimed"}` with **no `reason`**. Green light (twelve-for-twelve across my generations).
2. `--policy idle` probe: died at nothing — it rode to the **wave ceiling 14 / 320 s unsecured**, hero at 100/100 the whole way, `threats.alive` pinned at **3**, 39 kills, 0 gold. That is the tell: survival is not this map's problem, and something other than the clock gates the secure.
3. `now.deepwater.race` in the very first view named the gate: an out-and-back beacon course, `finished: false`, `nextGate: northwest-checkpoint (-28,38) r3`.
4. `HeadlessContractSim.ts:1097` — `autoSecureWaveForRun` returns `MAX_SAFE_INTEGER` while `tileParams.raceCourse && deepwater.diagnostics.race?.finished !== true`. So the secure is a conjunction: **wave ≥ 12 AND the course is finished.**
5. `RegattaRaceSystem.advance():40` — `if (this.finishedAt !== null || wave >= this.secureWave) return;`. The race **freezes at wave 12**, i.e. t = 272 s. Finish before then or the run is unsecurable at any wave. That is a one-way latch of the same class as the Canyon Works' connect deadline.
6. `DeepwaterSocket.ts:130` — `this.race?.advance(at, waves, [this.heroPosition(), snapshot.boat.anchor])`. **Two racers**, and `heroPosition()` on a `raceCourse` map is `this.prospector.position` (`HeadlessContractSim.ts:978`).
7. `RegattaRaceSystem.create()` — the final gate after the five beacons is `stakeMarkers.find(heroStart)` = the claim boat at **(-49, 0), default radius 6** — and the boat anchor starts on `start-line` **(-49, 0)**. The second racer is therefore already standing on the finish line. **Passing the last beacon at (49,0) ends the race outright; no return leg is needed.**

## The controller (`ctrl.mjs`, 18 accepted arrays)

Per view, in array order:

1. `SECURE_CHOICE bank` alone if `now.pendingSecure` (it accepts nothing else).
2. `PICK_UPGRADE` first if a draft is live, plating-scored (never `offer[0]`). No draft ever opened here — the hero finished level 1.
3. Free deck guns while the pads read `occupied: false`: `BOAT_BUILD bow turret` and `BOAT_BUILD port sentry_beacon`. `DeepwaterArsenal` only reads those two ids — `turret` mounts the harpoon ballista (8 dmg / 1.4 s / r14), `sentry_beacon` the depth-charge rack (r12, AoE, off the shared 12-charge stock). Zero gold, zero range check, instant.
4. The unpassed course as a chain of `MOVE_TO`: (-28,38) → (0,18) → (28,38) → (49,0). Each completes on arrival and the next takes the tick, so one array walks the whole course unattended.
5. `MOVE_TO (-49,0)` home.
6. Once `race.finished`, the remaining slots stacked with `HARVEST` on the deck's own seams (nearest-first, chained by id).
7. `HOLD (-51.5, 0)` as the anchor — west of the boat, so the travelling Spark Rig meets the west-edge corsairs before they reach the hero.

## Measured run

| t | wave | gates | hero | alive | gold |
|---|---|---|---|---|---|
| 0.0 | 0 | 1 (start, free) | 100/100 | 0 | 0 |
| 8.0 | 1 | 2 | 100/100 | 3 | 0 |
| **31.2** | 2 | **5 — `finished: true`** | 100/100 | 4 | 0 |
| 80.0 | 4 | 5 | 100/100 | 3 | 90 |
| 160.5 | 7 | 5 | 100/100 | 0 | **200 (cap)** |
| 272.0 | 12 | 5 | 100/100 | 3 | 200 |

Harpoon ballista fired 42 times, the rack spent all 12 charges, the lobber 0. The hero never lost a hit point.

## Outcome

**SECURED.** `secured: true`, waves **12**, timeAlive **272.000 s**, gold **200** (the E1 bank cap, pinned from t=160), kills 33, calls **18**, `defaultedPicks: 0`, `defaultedSecure: 0`, `eventLogHash: fnv1a32:48836c5c`.

Tape put forward: `artifacts/heat11/opus/e5-regatta/attempt-1-tape.json` (18 input-log entries).

**3 sim runs, 1 scored attempt.** Run 1 was the `--policy idle` probe; run 2 (`tune-1.json`) secured on the first controller I wrote; run 3 was the scored attempt — the identical controller re-ridden for the receipt. Both controller runs produced `eventLogHash: fnv1a32:48836c5c` and tapes that are byte-identical apart from the random `id`.

## What the map asked

It asked me about **the storm, in exactly one way, and it was the way that mattered: the storm is the clock, and the clock is a deadline on a journey.** This is not stationary survival wearing the era's name — it is the opposite, a contract where the fort is free and the errand is everything. `deepwaterStormDrivesWaves` makes the storm scheduler the *only* wave clock (`now.deepwater.storm.waves` publishes all fourteen scheduled cycles up front, one per 24 s), and `RegattaRaceSystem.advance` reads that same wave count as its own guillotine: at wave 12 — t = 272 s, a number the storm and nothing else chooses — the course latches shut forever. So "prediction under weather" is real here in its schedule form: the whole plan is a distance-over-time budget denominated in storm cycles, and I could compute it before writing an order because the storm publishes its entire timetable in view 0. The era's *adversarial* half is weaker: `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` are published and, for a headless rider, **inert** — `HeadlessContractSim.ts:1499` multiplies the Prospector's step by `deepwater.movementMultiplier()`, which is `RegattaRaceSystem.movementMultiplierAt` and returns only the *fast-water* 1.35 or 1; the storm slowdown never touches the racer. The authored fast-water band (z 34…54) is genuinely load-bearing in the other direction — two of the four checkpoints sit at z = 38, inside it, so the daring northern line is also the quick one, which is the teaching intent working. The view fields that carried the run were `now.deepwater.race` (`nextGate`, `gatesPassed`, `finished`, `fastWaterMultiplier`), `now.deepwater.anchor`/`anchors` and `pads[].occupied`, `now.deepwater.storm.waves[].scheduledAt` (the deadline), `now.deepwater.arsenal`, `now.seams`, `now.gold`, `now.hero.hp` and `now.pendingSecure`. The orders were `MOVE_TO`, `BOAT_BUILD`, `HARVEST`, `HOLD` and one `SECURE_CHOICE` — with `MOVE_TO`, an ordinary verb, carrying the era's whole objective. Two honest qualifiers for the county. First, **`REANCHOR` is published, wired and unnecessary**: the boat's only two anchors are (-49,0) and (49,0), and because the start-line anchor already sits inside the final gate's radius 6, the shortcut it offers is one the rider gets for free by not using it. Second, and worth a fix: the manifest declares `engineDependencies: [{ dep: "regatta-race-consumer", status: "missing" }]` — "needs a checkpoint race and competing-racer loot consumer" — while `RegattaRaceSystem` runs the checkpoint race headlessly, publishes it in `now`, and **gates the secure on it**. That is the second stale "missing" I have hit in two E5 rides (gen 19's `deepwater-claim-consumer`), and it is stale in the dangerous direction: a rider who trusted it would plan around a race that does not exist and never finish the one that does.

## Winnability

Secured, and the margin was **enormous**: the course latched `finished: true` at **t = 31.2 s against a t = 272 s deadline** — 8.7× slack — the hero took **zero damage across all twelve waves** (100/100 at every one of the 19 views), `threats.alive` never exceeded 4, and gold sat pinned at the 200 cap from t = 160; the only thing that could plausibly lose this contract is not knowing the race exists.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is twelve-for-twelve.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **An idle probe that rides to the CEILING is a louder signal than one that dies.** Idle here survived all fourteen waves untouched, killed 39, and scored nothing. A map where an orderless hero cannot die but cannot win is telling you, in one ten-second run, that **the secure is an errand, not a fight** — go find the conjunction in `autoSecureWaveForRun` before writing a defence. Gen-19 saw this on the Deepwater Claim and I nearly re-learned it here; two sightings make it a rule.
- **Read the objective system's own early-return, not just the secure gate.** `RegattaRaceSystem.advance:40` opens `if (this.finishedAt !== null || wave >= this.secureWave) return;` — the objective **freezes at the secure wave**, so "survive to 12 then do the errand" is not merely slow, it is impossible. Gen-12 learned that a one-way latch (`missedDeadline: run-unsecurable`) makes later waves worthless; the sharper version is: **an objective that stops updating is a deadline even when nothing in the view is labelled `deadline`.** Grep the objective system for `return` guards on `wave`.
- **Count the racers.** `race.advance(at, wave, [heroPosition(), boat.anchor])` takes an ARRAY, and the second entry is a piece of scenery I would never have thought to check. The boat's default anchor sits inside the final gate's radius, which deleted a 98 wu return leg from my route. When a system takes a list of qualifying actors, enumerate all of them before planning the geometry — one of them may already be standing on the goal.
- **Free levers first.** `BOAT_BUILD` costs no gold, has no range check, and `DeepwaterArsenal` reads exactly two building ids — `turret` → harpoon ballista (r14), `sentry_beacon` → depth-charge rack (r12). Two orders in the opening array bought a fort that held a hero alone for four minutes while its shooter was 100 wu away. Before pricing a defence in gold, grep the socket for what it will give you for nothing.
- **Only one slot per deck weapon kind.** `DeepwaterArsenal.update` writes `deckPositions[buildingId]` in a loop, so a second `turret` MOVES the ballista rather than adding one. Reading the update loop stopped me wasting the third pad.
- **A chain of `MOVE_TO` is a route, and one array can drive an unattended journey.** Views arrive only at 24-second wave boundaries here, so the entire four-checkpoint course had to be walked with no chance to correct. Because `MOVE_TO` completes at `arriveRadius` 0.16 and the record then goes `done`, a stacked chain self-sequences exactly like gen-9's price-ordered build prefix. **The array is a worklist that drains — for movement as much as for building.**
- **The published storm multipliers were inert and the published fast-water one was not.** `stormMovementMultiplier: 0.72` never reaches the Prospector (`HeadlessContractSim:1499` applies only `deepwater.movementMultiplier`, i.e. the race system's fast-water 1.35). Gen-8's rule — grep the *consumer* of a published number, not the manifest that declares it — paid a fourth time. Two numbers in the same weather block, one real and one decorative.
- **`engineDependencies: "missing"` is now WRONG twice in two E5 rides.** The Long Road's was true (gen 18); the Deepwater Claim's was false (gen 19); the Regatta's is false again, and here the "missing" consumer is the thing that *gates the secure*. Treat the block as a stale comment: read it, then confirm it against `now`'s keys in one idle probe, and give a "missing" that contradicts a live view field exactly zero weight.
- **Twelfth contract running, the second run went to the receipt, not to greed.** `tune-1` secured; the scored attempt re-rode the identical controller for `fnv1a32:48836c5c` twice, 18 entries, tapes byte-identical apart from the random `id`. At a fixed wave-12 secure `timeAlive` is pinned at 272.000 s and gold was already at the 200 cap, so there was literally nothing left to win by gambling and a replay-proof reel to gain.
- **Write the outcome file after every run, before the analysis.** Ninth generation saying it, sixth actually doing it from the idle probe onward — the runner writes it automatically now, and every row on disk was truthful from minute six.
