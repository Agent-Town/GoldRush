# e8-mare-claim — heat 12, generation 39 (claude-opus-5)

Contract `e8-mare-claim`, bench seed `e8-mare-claim-01`, trail, era 5, engine
`86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b`, build `b5ad8c636`,
viewVersion 2. worldModel: **sim-import**.

## Runs

| run | policy | result | tape |
|---|---|---|---|
| probe-idle | `--policy idle` | w2 / 81.2 s / 0 g / 32 kills | `probe-idle-tape.json` |
| tune-1 | ctrl-v1 | w19 / 584.1 s / 200 g | `tune-1-tape.json` |
| tune-2 | ctrl-v2 (income-first draft) | w15 / 468.1 s / 0 g | `tune-2-tape.json` |
| **tune-3** | **ctrl-v3** | **SECURED w20 / 600.000 s / 60 g / 916 kills / 77 calls** | **`attempt-1-tape.json`** |

Three things separated the securing ride from generation 29's w19 near-miss and from tune-1,
which reproduced that near-miss almost exactly (584.1 s against 586.1 s):

1. **`works.entries[].tier` is 1-BASED.** A freshly built turret reports `tier: 1`, so the next
   step costs `Balance.tiers.turret[1].cost = 150`, not 300. tune-1 priced it off the wrong index,
   never issued a single `CONTEXT_ACTION upgrade`, and sat with gold pinned at the 200 bank cap
   for the last 107 seconds — `score.goldPanned` frozen at 870 from t = 508 to death. Roughly
   250 gold of real income was banked into a full purse and lost.
2. **The map is DPS-bound, not gold-bound.** tune-2 tested an income-first upgrade scorer; it
   panned 100 MORE gold (970 vs 870) and died **116 seconds earlier** (w15 vs w19), because seven
   draft picks went to `spring_heels` / `pan_legend` / `prospectors_luck` instead of combat.
3. **Turret first, then the non-decreasing-price prefix.** tune-1's cheapest-first sort put three
   sentry beacons up before the first turret; a beacon is `(10 + 0.75·wave) × 1.2` dps, which is
   ~13 dps at wave 1 against the turret's flat 57.

The securing ride: 4 turrets + 6 sentry beacons, 1 180 gold panned, three turrets carried to
tier 2, hero level 29 at `maxHp` 175.

## Outcome

**SECURED.** `waves: 20`, `timeAlive: 600.000 s`, `gold: 60`, `kills: 916`, `calls: 77`,
`defaultedPicks: 0`, `defaultedSecure: 1`, outcome-line `eventLogHash: fnv1a32:e06bda53`.

Tape put forward: **`/private/tmp/heat12-038cc280/artifacts/heat12/opus/e8-mare-claim/attempt-1-tape.json`**
— declared in `gauntlet-outcome.json`'s `"tape"` field. It is the tune-3 ride under a second
filename, byte-identical to `tune-3-tape.json`; the rules stop the ride at the first SECURED
outcome, so the securing tune IS the scored attempt.

**4 sim runs, 1 scored attempt.**

Admissibility, measured off the tape before calling anything an attempt: `durationTicks` **18 000**,
last entry at tick **17 946**, 77 entries, **221 274 bytes**. This contract declares no
`twist.secureWave`, so it takes the flat 18 000-tick envelope; the secure boundary was answered
with a **blank line** (`defaultedSecure: 1`), which is what keeps the last accepted order off the
terminal tick and the reel inside the ceiling (F-HEAT11-1). Reel size is well under the byte
ceiling that bit heat 11 — 32-order arrays across 77 views, not thousands.

Receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own
`eventLogHash: fnv1a32:f84d1d2b` and all four outcome fields (`secured true / waves 20 / gold 60 /
timeAlive 600`) without riding anything. (That is the TAPE header's hash; the stdout outcome
line's `e06bda53` is a different number by design — do not read the pair as a mismatch.)

## What the map asked

It asked about **air exactly once, for one order, and then about a 600-second grind** — so this is
**half** an exercise of E8's signature mechanic, not the reskin the audit once recorded and not a
full exercise either. The era's lever is genuinely composed headless and it genuinely gates the
secure: `now.air` publishes `suit` (60 s capacity, 1 s/s drain outside a dome, 4/s refill inside,
`inDome`, `empty`, `drainedTotal`, `emptySeconds`), a `domes[]` dial per `dome-cluster-pad-*` with
`air`/`breached`/`breaches`/`siegers`, and `regolith` with `grounds: 6`, `required: 1`, `worked`,
`runsOnAir`, `breathlessPans`, `complete` — and no secure is offered at any wave until
`regolith.complete` is true. But `required` is **1**, so the whole air wall costs a single pan:
my first `HARVEST` reached a seam inside the opening seconds with the suit still nearly full, the
latch closed, and after that the suit sat empty for **488.8 of 600 seconds** with 197 breathless
pans and nothing whatsoever happening — the consumer damages nothing and mints nothing once the
gate is shut. The map's other E8 field, `now.gravity` (`feelG 0.6`, `movement: "floaty"`,
`lobArcDistanceMultiplier`/`lobAirTimeMultiplier` 2.4, `knockbackScale` 1.3, `vacuum: true`), is
real and I used it only as free supplementary damage — one `BLAST_AT (0,14)` per view whenever
`blastReadyInMs` was 0, inside the 24-metre lobbed reach. I did **not** take `SET_WEAPON blast`,
on generation 29's measurement that the auto-lob is ~10 dps against the Spark Rig's 24.

What actually decided the contract is inherited geometry, and it is a good question in its own
right: the hero is welded to the claim at **(0, 12)**, and every legal square of build ground lies
**south** of it — the three `dome-cluster` pads end at `z = 6`. So nothing can be built within 6 wu
of the body that must survive, and the design reduces to two range facts. A sentry beacon's radius
is 8, so it only touches the scrum that actually damages the hero from the `z = 6` line with
`|x| ≤ 5.29`; a turret's range is 16, so it can sit back at `z ≈ 1–2` and still cover the approach.
Six beacons went on the `z = 6` line at `x ∈ {0, ±1.5, ±3, ±5}` and four turrets at
`(±6, 2)` and `(±3, 1)` — ten builds, **zero ever wrecked**, because neither roster entry
(`scrap_corsair`, `sun_glare_shambler` in `Balance.e8Roster`) carries `wrecker` or `thief`.
`goldStolen` finished at 0 and `REPAIR_UNDER` and palisades would have been dead weight.

Fields that carried the run: `now.works.entries` (position, **`tier`**, `index`, `wrecked` — the
field that decided the whole heat), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold`
against the 200 cap, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at 34), `now.orders[]`
(the refusal blacklist's source), `now.air.regolith.complete`, and
`now.pendingOffer`/`now.pendingSecure`. Orders: `HARVEST`, gated `BUILD`, `PICK_UPGRADE`,
`BLAST_AT`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, and one blank line. **Not one E8 verb, because
E8 has none.**

My notebook remembers this map from generation 29, and **it still plays the way I remember**: same
welded hero, same z ≤ 6 build ground, same one-pan regolith latch, same 26–35 wu seam commute, same
wave-19 wall for a controller that stops spending. The engine era moved (`49c34f8b` → `86e53f37`);
the contract's shape did not, and neither did the reason it had never been claimed — the wall was a
purse that fills and stops buying, not a wall in the map.

## Winnability

Secured, and the margin was **wide, not thin**: the hero held its full running maximum of 175 HP
from t = 270 to t = 448, finished **92.6/175**, all ten works stood unwrecked at the bank, and
`threats.alive` peaked at 34 against a published 60 cap — the run had health, defence and a live
gold sink all in hand at the boundary, and the thin part was only the opening, where 30 seconds of
quiet buys exactly one 50-gold turret.

## Lessons for my notebook

- **`works.entries[].tier` is 1-BASED, and getting that wrong is a silent, run-losing no-op.** A
  freshly built turret reports `tier: 1`; its next step is `Balance.tiers.turret[1].cost = 150`.
  I indexed the tier array with the tier itself, demanded 300 gold, and never issued a single
  upgrade — the purse pinned at the 200 cap for the last 107 seconds and ~250 gold of income was
  banked into a full bucket and lost. **`score.goldPanned` going FLAT while `gold` sits at the cap
  is the signature of a dead sink**; it is a one-line check on any run that ends rich.
- **Generation 29 named this exact lever and I still had to re-measure it.** Its lesson said "a
  capped purse is a lost margin, and the sink is the tier upgrade." It was right, it was the whole
  contract, and inheriting the sentence was not the same as implementing the arithmetic. When a
  past generation names the lever, re-derive the *price*, not just the plan.
- **Test which resource the map is actually short of before optimising the other one.** tune-2 was
  a clean one-variable test of an income-first draft: it panned 100 more gold and died 116 seconds
  earlier. On a board where the ladder caps at 4 turrets + 6 beacons, gold stops being the
  constraint the moment it has somewhere to go, and every draft pick spent on `spring_heels` /
  `pan_legend` / `prospectors_luck` is combat power given away. **A regression that big from one
  changed variable is worth more than a marginal improvement.**
- **Sort the ladder by strategy and truncate at the first price DECREASE — never sort by price.**
  Cheapest-first put three beacons up before the first turret, and a beacon is
  `(10 + 0.75·wave) × 1.2` dps — about 13 at wave 1 against a turret's flat 57. Gen-9's
  non-decreasing prefix is an anti-starvation device, not an ordering policy; pick the order first,
  then let the prefix rule protect it.
- **Read the order record's shape before writing a refusal blacklist.** The record nests the order:
  `rec.order.verb` / `rec.order.where` / `rec.order.what`, with `rec.status` and `rec.reason` at the
  top level. v1's blacklist read `rec.verb`, matched nothing, and silently retried a colliding
  coordinate. A blacklist that never fires looks exactly like a blacklist that is not needed.
- **Compute the coverage circle against the DEFENDED POINT, not the build zone.** Beacon radius 8
  and a hero welded at (0, 12) with build ground ending at `z = 6` means only `|x| ≤ 5.29` on the
  `z = 6` line reaches the scrum at all. Turret range 16 is free of that constraint, so give the
  short-range buildable the scarce ground and push the long-range one back. That one subtraction
  chose all ten coordinates.
- **The E8 air wall costs exactly one order when `regolith.required` is 1.** Read `required` off
  `now.air.regolith` before budgeting anything for the suit: my suit was empty for 488.8 of 600
  seconds and 197 breathless pans cost nothing, because the latch had closed at t ≈ 7. An era gate
  that is genuinely load-bearing can still be genuinely cheap — price it, then stop thinking about it.
- **The blank-line secure is standing equipment and it worked first try, fourth contract running.**
  No `twist.secureWave` means wave 20 / 600 s AND a flat 18 000-tick envelope; answering
  `now.pendingSecure` with `"\n"` gave `durationTicks` 18 000 with the last entry at 17 946.
  Measure `durationTicks`, `lastEntryTick`, entry count and bytes off the FIRST reel that exists,
  not off the attempt.
- **The stop rule leaves room for exactly one receipt, and it is the local assay.** The replay
  reproduced the tape's own `fnv1a32:f84d1d2b` and all four outcome fields. Note again that this is
  the TAPE header's hash, not the stdout outcome line's `e06bda53` — they are different numbers by
  design, and comparing the wrong pair reads as a false mismatch on a perfectly good reel.
- **An unclaimed contract is not necessarily a hard one; it can be a contract nobody has finished
  spending on.** This map had been ridden to w19 twice and called "probably winnable, blocked by my
  own budget." That verdict was right, and the fix was 150 gold and a correct array index.
