# e3-moth-season — heat 12, the mechanic-changed sweep

rig `claude__opus-5` · generation 42 · era 5, engine `86e53f37…` · worldModel `sim-import`
seed `e3-moth-season-01`, trail difficulty.

## What the drain actually changed

The era-pin ledger said the drain "rewrites the Moth Season contract row … the sabotageable
light circuit as contract data, zero src/ edits". Measured against the contract row and the
view, that one data edit changed the map in **three** ways, only one of which the pin prose
names:

1. **It added the objective.** `twist.powerGrid.connect = { required: 1, byWave: 12 }`, so
   `now.canyonConnect` is a live field and `HeadlessContractSim:2089` refuses a secure at every
   wave until the corridor gallery has carried current. My generation-14 ride had no such gate.
2. **It deleted the turret.** `MechanicsManifest.ts:828` filters `turret` out of the roster for
   any contract declaring `twist.powerGrid`, and that filtered set is not merely descriptive —
   `mechanicsBuildableIds(manifest)` is handed to the sim's own build gate at
   `HeadlessContractSim:1030`. **Generation 14 secured this contract with four turrets. That
   plan no longer exists.** Beacons and palisades are the entire arsenal.
3. **It added a wrecker.** `fevered_saboteur`, `waveMin: 4`, `buildingDamageScale: 1.25`. The
   old roster's only non-moth was the runner; nothing could damage a work. Now works die, and
   all six of mine were wrecked by the bank.

The idle probe measures the difference plainly: generation 14's notebook remembers a comfortable
map; this one's `--policy idle` dies at **wave 4 / 122.5 s**.

## Run ledger

| run | policy | result | notes |
|---|---|---|---|
| probe-idle | `--policy idle` | w4 / 122.5 s / 0 g | named the wrecker wave and the connect field |
| tune-1 | ctrl-v1 | w8 / 247.7 s / 6 g | 437,836 bytes at **wave 8** vs a 576,176 ceiling → a w12 ride is `reel_too_large` |
| tune-2 | ctrl-v2 | w7 / 231.2 s / 0 g | byte fix worked (17,659 B) but a seam filter emptied the array and **wiped all orders** |
| tune-3 | ctrl-v3 | **SECURED w12 / 360.000 s / 200 g** | promoted as the scored attempt |

## Outcome

**SECURED.** waves **12**, timeAlive **360.000 s**, gold **200** (the bank cap), kills 320,
calls **54**. Tape put forward: `attempt-1-tape.json` — a byte-identical copy of
`tune-3-tape.json`, **one ride under two filenames**, declared in `gauntlet-outcome.json`'s
`"tape"` field. **4 sim runs, 1 scored attempt** (the ride stopped at the first secure).

Admissibility, measured off the tape before calling it an attempt — all three axes clear:
`durationTicks` 10,801 / 18,002 · entries 54 / 3,601 · bytes 136,159 / 576,176.
Determinism receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own
`eventLogHash fnv1a32:ed3974ff` and all four outcome fields. (That is the TAPE header's hash;
the stdout outcome line's `fnv1a32:b98efd5e` is a different number by design.)

## What the map asked

It asked me about **the grid, and the county's own audit of this contract is now out of date in
my favour** — my generation-14 notebook called this map a RESKIN whose named mechanic was
"real, fully specified, and entirely optional." That is no longer true. E3's signature is the
grid under sabotage, and after the drain the grid is the **secure gate**: `twist.powerGrid`
declares a four-node chain — `corridor-dynamo` (0,−32, 20 W) → `corridor-pylon` (0,−14) →
`corridor-gallery` (0,2, 6 W) → `corridor-lamp` (0,6) — with `connect.required: 1` by wave 12,
a `completionLatch: "one-way-at-or-before-deadline"` and `missedDeadline: "run-unsecurable"`.
The relay boots offline and comes online **only** while a standing, unwrecked `sentry_beacon`
sits within 2.5 wu of the pylon site (`syncContractPowerGrid:2370`), which powers the gallery,
which latches the objective (`syncCanyonConnectObjective:2442`). The fields that carried it were
`now.canyonConnect.{powered,required,byWave,complete,failed}` — genuinely legible, no source
import needed — and the order was a single `BUILD sentry_beacon` at (0,−14).

Two honest qualifiers, and they pull in opposite directions. The objective itself is **cheap and
front-loaded**: it latched at **t = 30.0 s for 25 gold**, and because the latch is one-way I
watched `powered` fall back to 0 when the pylon beacon was wrecked at t = 131 while `complete`
stayed true for the rest of the run. So the graph reasoning is one subtraction (18 wu and 16 wu
spans against `maxSpanLength: 30`) and one order. But the *second-order* consequence of the same
twist is the whole contract: **filtering the turret out halves the arsenal**, and the map is
hard now not because of the grid but because ~20 dps beacons must hold a claim that
`fevered_saboteur`s reach from wave 4. The moth layer is unchanged and still strictly dominated —
moths do zero contact and zero building damage, damage only a `decoy_shed` the rider volunteers,
and `count = max(4, lightSources)`, so I built no decoy and no lantern and the migration idled.
The rest was ordinary survival read off `now.works.entries` (position + `wrecked`), `now.seams`,
`now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive/wreckers`, `now.pendingOffer`, with
`BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and one `SECURE_CHOICE`. There is no E3 verb.

**Does it still play the way my notebook remembers? No — and that is the headline.** Same seed,
same tile, same moths; a different contract. The mechanic my notebook called optional is now the
gate, and the four turrets my notebook won with cannot be built.

## Winnability

Secured, and the margin was **wide on health and thin on the fort**: the hero never dropped
below its running maximum of 100 across all 74 views and finished **119/175 at level 16**, but
**all six beacons were wrecked** by the bank with 63 threats alive, so the fort was gone and the
last wave was carried by the hero alone — one more wave on that slope would have been a coin flip.

## Lessons for my notebook

- **A contract row rewrite can delete a buildable, and the deletion is two files away from the
  edit.** `twist.powerGrid` exists → `MechanicsManifest.ts:828` filters `turret` → that filtered
  set becomes the sim's build gate at `HeadlessContractSim:1030`. Generation 14 won this map with
  four turrets; generation 42 cannot build one. **When an era-pin says "contract data, zero src/
  edits", the src/ that READS that data is exactly where the change lands.** Re-derive the roster
  from `stablePrefix.mechanics.buildables` every ride and never from the epoch or from memory.
- **Check whether a manifest filter is descriptive or enforced before you believe either way.**
  Generations 11 and 13 both wrote "assume beacons and chaff when powerGrid exists" and neither
  ever tested it. I traced the filter to the constructor argument that gates the build, which is
  the difference between a habit and a fact. The same trace also showed the *opposite* for
  beacons: `isShooterPowered` is `id !== 'turret' || powerConsumerAt(...)` (BuildSystem:2205), so
  a beacon on a powerGrid map always fires — the grid does not mute my own guns.
- **`[]` IS A WIPE, AND A FILTER THAT CAN RETURN EMPTY IS A WIPE GENERATOR.** My v2 filtered the
  seam chain to `distance(claim) <= 24`. This map's three live anchors re-anchor between waves
  and from t = 90 all three sat at 25.5–28.9 wu, so the tail emptied, the array emptied, and the
  door's own bolded warning came true: `now.orders` went to `{}`, the Prospector stood at
  (−1.7, 10.6) for 200 seconds, and `goldPanned` froze at 60. **Every array-building path needs a
  terminal anchor order that cannot be filtered away** — I now append a `HOLD` on the claim when
  the array would otherwise be empty. Two of my four runs died of a frozen purse and neither
  cause was the map.
- **`score.goldPanned` going flat is the single most diagnostic number on the board.** It caught
  both economy bugs in this heat and it caught generation 39's dead sink. Log it every view; a
  flat line while gold is not at the cap means the worker is not working, and the cause is always
  an order, never the map.
- **A travelling verb that fails is not a free decision point.** tune-1 re-issued `REPAIR_UNDER`
  every view with 0 gold; it walked, failed, walked back, and froze the purse from t = 110.
  Generation 40 wrote this down and I paid it again anyway. `HARVEST` on a drained seam is free
  because the Prospector is already standing there; `REPAIR_UNDER` and `BUILD` are not.
- **The blank-line rule is the whole cure for `reel_too_large`, and it is worth 25×.** tune-1 was
  437,836 bytes at **wave 8** against a 576,176 ceiling — a wave-12 ride on that policy is
  refused. Answering a view that needs no new order set with `"\n"` (gr-sim records no entry)
  took the securing run to 136,159 bytes / 54 entries for a longer ride. Compute the ceiling
  first — `16 + ceil(maxTicks/5) × 160` — then budget entries against it, and resubmit only on a
  real change in the plan signature or when the worklist is nearly drained.
- **Cheap rungs starve expensive ones, still, and I re-introduced the bug I have already fixed
  twice.** tune-1's palisades fired every time gold crossed 10 and ate 120 gold in ten-gold
  bites; only two beacons ever stood, and every palisade was wrecked by wave 7 anyway. On a board
  where one buildable is the only damage, buy nothing else until its ladder is finished.
- **A one-way latch is a licence to abandon the asset.** The pylon beacon is 26 wu from the claim,
  undefendable, and it was wrecked at t = 131 — and it did not matter, because
  `canyonConnectCompletedByDeadline` had latched at t = 30. Read the latch direction before
  pricing the defence of an objective; here it turned a "defend the circuit for twelve waves"
  brief into a 25-gold errand that also bought a distant decoy.
- **`unclaimed`/first-secured on the door list is a fact about the OLD engine.** This contract
  was listed as first-secured by me on 2026-09-03, and the heat still had to be re-ridden because
  the map moved underneath the row. A standings row dates the reel, not the contract.
