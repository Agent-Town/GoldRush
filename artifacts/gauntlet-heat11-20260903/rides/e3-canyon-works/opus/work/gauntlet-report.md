# The Canyon Works — heat 11, Claude Opus 5, generation 12

Contract `e3-canyon-works`, bench seed `e3-canyon-works-01`, trail difficulty.
worldModel: `sim-import` (read `src/sim/HeadlessContractSim.ts`, `src/systems/PowerGraph.ts`,
`src/world/Terrain.ts`, `src/game/Balance.ts`, `assets/contracts/epoch-3-voltage/contracts.json`).

## What I established before riding

`assets/contracts/winnability-receipts.json` carries `e3-canyon-works: unclaimed` with **no
`reason`** — five-for-five, that has always been the green light, so I rode.

The secure gate is a **conjunction of three conditions**, and I read all three in the source before
writing an order (`HeadlessContractSim.ts:1090-1103`):

```
autoSecureWaveForRun = MAX_SAFE_INTEGER while
     (twist.baron && !this.baronBeaten)                                    // kill the wave-14 crawler
  || (twist.powerGrid?.connect && !this.canyonConnectCompletedByDeadline)  // power both galleries by wave 6
```

plus `twist.secureWave = 12`. So the run must (1) power **both** galleries while `wave <= 6`
(`syncCanyonConnectObjective:2066`, a one-way latch — miss it and `canyonConnectFailed` makes the
run permanently unsecurable), (2) survive to wave 12, and (3) kill the Rival Dynamo Crawler at
wave 14.

The grid arithmetic (`syncContractPowerGrid:1991`): a pylon relay is `online` **only** while a
standing, unwrecked `sentry_beacon` sits within `2.5wu` of its site, and adjacency is rebuilt from
online nodes over **declared wires only** (`PowerGraph:488-492`) — there is no distance-based
shortcut. Both galleries hang off three-hop chains:

```
sub-hall(0,-44) -> west-base(-12,-36) -> west-switch(-24,-20) -> west-rim(-28,8) -> gallery-west(-28,28)
sub-hall(0,-44) -> east-base( 12,-36) -> east-switch( 24,-20) -> east-rim( 28,8) -> gallery-east( 28,28)
```

Cross-links are all too long for `maxSpanLength: 30` (rim-to-rim is 56wu, switch-to-switch 48wu), so
**six beacons are required, which is exactly `sentry_beacon.maxCount: 6`**, at
`costs [25,35,45,55,75,95]` = **330 gold**. `turret` and `lantern_post` are filtered off the roster
because `twist.powerGrid` exists, so the only other buildings are `palisade` (10g), `sluice` (40g,
and `waterSources: []`), `stockpile` (60g) and `assay_office` (80g).

## Outcome

**NOT SECURED.** Best run: **waves 3 · timeAlive 102.433s · gold 45 · calls 7 · kills 39 ·
`eventLogHash fnv1a32:6065ab6d`** (tape `tune-1.json`).
**3 sim runs · 0 scored attempts · no tape put forward** — an unsecured run must not be submitted,
and I stopped riding when the arithmetic below became certain rather than spend the wall on a fourth
doomed ride.

| run | tape | plan | result |
|---|---|---|---|
| 1 | `probe-idle.json` | `--policy=idle` | w3 / 98.267s / 0g / 0 calls |
| 2 | `tune-1.json` | grid-first, suffix-sum-gated 4+2 beacon batches | w3 / 102.433s / 45g / 7 calls |
| 3 | `tune-2.json` | palisades-first (survival), then the grid | w3 / 101.600s / 0g / 8 calls |

All three died at the same place: hero HP 0 in wave 3, between t=98s and t=102s.

## What the map asked

It asked a real graph question and I could read every part of it — this is **not** stationary
survival wearing the era's name, and unlike E2's pressure the mechanic is fully published in the
view. `now.canyonConnect: {powered, required: 2, byWave: 6, complete, failed}` is a live field, and
`stablePrefix.mechanics.rules` names its own source (`connect_objective` /
`Game.syncCanyonConnectObjective`) including `completionLatch: "one-way-at-or-before-deadline"` and
`missedDeadline: "run-unsecurable"`. The map is a genuine directed network under sabotage: two
disjoint three-hop chains from one 26W producer, `fevered_saboteur` wreckers (`waveMin: 4`,
`buildingDamageScale: 1.25`) spawning from gates at (±46,38) — i.e. **on top of the seams and the rim
pylons** — and a watt ledger that sheds by priority (galleries 10, tram 15, turrets 20, lamps 30)
against 28W of demand on 26W of supply, so the two lamps shed and the galleries stay `powered`. The
crawler-drain nodes (18W each, priority 0) boot **offline** (`HeadlessContractSim:2479`,
`online: node.role !== 'crawler-drain'`), which is the only reason the ledger balances at all.

The fields that carried it were `now.canyonConnect`, `now.works.entries` (position + `wrecked`, the
only way to see which pylon sites are actually covered), `now.seams[].active/x/z`, `now.gold`,
`now.hero.hp`, and `now.threats.alive`. The orders were `BUILD` (suffix-sum gated), `HARVEST` and
`PICK_UPGRADE`. The mechanic is load-bearing exactly as the county's audit note says — it is the
*only* thing standing between this contract and an ordinary survival map. It is also, on this seed,
priced past what the map's own economy can pay.

## Winnability

**Undecided-leaning-no through the door, and the wall is the map's economy against its own deadline,
not the grammar and not my budget:** the connect latch demands 330 gold of beacons strung across six
sites spanning 80wu of gorge while `wave <= 6` (t < 210s), but the map's only income is four gold
seams at z≈30-34 — **~78wu north of the loss stake, across the river** — of which only two are ever
live, each capped at `capacity 30` on a `respawnSeconds 20` cycle (`Balance.goldSeam`), giving a
hard ceiling near 3.0 g/s that no policy can exceed; 330 gold is therefore ≥110s of pure panning
before a single step of the ~100s pylon tour or the 21s opening commute, which overruns t=210 even
with a perfect Prospector, and I measured only **0.44-0.69 g/s** actual because every build order
drags the one order-actor off the seams and back down the canyon. Underneath that sits a second,
earlier wall I never got past: the hero is a fixed gun welded to the stake at (0,-44) while its only
worker is 78wu away, and it died at wave 3 (t≈100s) in **all three** runs — idle, grid-first, and
palisades-first alike — so on this seed the run ends four waves before the connect deadline it
cannot afford anyway.

Two honest caveats on that verdict, because I did not get to test them: (a) I spent my wall on the
grid and never tried a pure fortress line — every gold into palisades and upgrades around the stake,
conceding the connect latch — which would answer whether wave 12 survival is reachable at all, and
(b) my BUILD gating misfired once (run 2 placed a beacon at 25 gold against a `goldGte: 160` suffix
gate), so one of my two controller runs was not testing the policy I wrote. Neither caveat touches
the 330g/210s arithmetic, which is manifest-level and does not depend on my controller.

## Lessons for my notebook

- **`unclaimed` with no `reason` is a green light about the *standings*, not about the map.** Six
  contracts running I have read that field as "go" and been right; here it was still correct — the
  contract is not `standings-disabled` — but it told me nothing about whether the map can be paid
  for. The receipt encodes an *authoring* wall (`secureWave: 0`, `training_ground`), never an
  *economic* one. Add a second pre-ride check next to it: **price the objective in gold and divide by
  the map's seam throughput before writing an order.** Two minutes of arithmetic
  (`maxCount × costs` vs `capacity/respawnSeconds × liveSeams × deadline`) would have told me at
  minute six what three rides told me at minute nineteen.
- **Count the order-actor's feet as a budget, not a detail.** The Canyon Works is the first map I
  have ridden where income and defence are at opposite ends of the board (78wu, across a river) and
  the objective is strung *between* them. One body cannot pan, build a six-site network, and defend a
  stake; every BUILD order is a round trip that costs ~15-40s of panning. On any map, measure
  `distance(stake, nearest live seam)` first — the Incline's 6.3wu pocket and this map's 78wu commute
  are the same field with opposite verdicts.
- **A conjunctive secure gate is the contract.** Here it is *three* clauses ANDed —
  `baronBeaten && canyonConnectCompletedByDeadline && wave >= 12`. Generation 8 read the wave clause
  and missed the baron; generation 10 corrected that; generation 12 adds: read the *whole* boolean at
  `autoSecureWaveForRun` and enumerate every clause before planning, because a one-way latch
  (`missedDeadline: "run-unsecurable"`) means one missed clause at wave 6 makes waves 7-20 worthless.
- **E3's mechanic is real, readable, and this time unaffordable.** Blackout Ridge (gen 11) published
  no grid state in `now` and I had to read the engine; the Canyon Works publishes
  `now.canyonConnect` outright, which is a genuine improvement in the door's legibility. So the E3
  finding is no longer "the mechanic is invisible" but "the mechanic is priced past the map's
  income." Those are different findings and deserve different fixes.
- **Verify a gate fires before trusting the ladder.** My suffix-sum batching — where rung *i* is
  gated on the sum of costs from *i* to the end of the batch, so a batch only opens when the whole
  trip is funded — is the right generalisation of gen-9's "truncate at the first price decrease," but
  I shipped it without a single-view check and one run built a beacon at 25 gold against a
  `goldGte: 160` gate. Log the emitted array and the resulting `works.entries` on the *first* view of
  a tune, not after three runs.
- **When the wall is arithmetic, stop riding.** Generation 5 declined a second scored attempt because
  it could name the line of code that would refuse it; here I declined a fourth run because I could
  name the inequality. Both times the right output was the finding, written carefully, rather than
  another tape. Knowing when not to ride is still worth as much as a good policy.
- **Write the outcome file before the analysis, every time.** I wrote `gauntlet-outcome.json` at
  minute 18 with two runs banked, then rewrote it. The wall arrived with the report unfinished twice
  in twelve generations; the file that exists is the row that survives.
