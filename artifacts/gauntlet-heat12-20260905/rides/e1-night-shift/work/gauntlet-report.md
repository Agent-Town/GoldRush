# e1-night-shift — heat 12, generation 56 (claude-opus-5)

Seed `e1-night-shift-01`, trail, engine era 5 (`86e53f37…`). worldModel: `sim-import`.

## Pre-ride reads

- `twist.secureWave: 25` — the longest E1 board on the door. 25 waves × 30 s = **750 s**,
  where every other E1 contract I have ridden banks at wave 10–20. Envelope is fine:
  `runTapeEnvelopeForContract` gives 22 502 ticks / 4 501 entries / 736 544 bytes.
- `twist.lightRamp` — dusk wave 5, dark wave 10, dawn wave 25 — plus
  `twist.enemyLanternClasses: ["rusher","thief"]`.
- Seven `prePlacedBuildables` `lantern_post`s, **all `wrecked: true`**, `relightCost: 8`.
- Claim (0, 12); river at z ∈ [−5, 5]; six harvest anchors, nearest two at 9.3 and 10.4 wu.
- Idle floor: w4 / 147.9 s, 0 gold, hero down.

## Outcome

**NOT SECURED.** Best run: **waves 20 · timeAlive 615.400 s · gold 32 · calls 123**
(`kills` 963, `eventLogHash` `fnv1a32:94ab6114`).
**3 sim runs** (1 idle probe, 1 tune, 1 scored attempt) · **1 scored attempt**.
**Nothing is put forward** — the run died at wave 20 of a 25-wave secure, and
`skill.md` forbids submitting a run that dies.

| run | result | gold panned | notes |
|---|---|---|---|
| probe-idle | w4 / 147.9 s | 0 | orderless floor |
| tune-1 | w20 / 614.333 s / 20 g | 845→950 | ladder never retired → tier sink never fired |
| attempt-1 (scored) | w20 / 615.400 s / 32 g | 980 | ladder fixed, +2 stockpiles; **+1.1 s** |

Reel envelope on the scored tape: 18 462 ticks of 22 502, last order at 18 443,
123 entries of 4 501, 410 502 bytes of 736 544 — admissible on all three axes had it secured.

## What the map asked

It asked about **the dark**, and about its era's signature mechanic — E1 survival and the
bank cap — it asked **nothing at all**, which is the honest headline. The bank cap is 200 and
my purse never came close to it: `score.goldPanned` finished at **980** while `now.gold` sat
between 0 and 95 for the whole back half, because a 500-gold ladder and a 600-gold tier sink
consume income faster than a 1.59 g/s economy produces it. The cap is a published constant that
never once bound; what binds is *income rate against a 750-second attrition curve*. So on the
audit question this contract is **not** its era's named lever wearing its own name — but it is
also not plain stationary survival, because the light ramp is genuinely live and genuinely
load-bearing, in a way the county should have on record.

The mechanic is real and I traced it to its consumer:
`HeadlessContractSim.nightSpeedMultiplier` (`:2558`) reads
`if (!config && (!this.isNightShiftContract() || !enemy.isWrecker)) return 1;` — with no
`mothSeason` config and `twist.lightRamp` present, the guard falls through **for wreckers only**,
and any wrecker standing where `lightField.coverageAt(...)` is below
`renderVisibilityCutoff` 0.35 moves at `nightSpeedOutsideLight` **1.18×**. `syncLightState`
(`:2492`) builds the field from the hero's own 4.8 wu glow, `lantern_post`s at
`lanternPostLightRadius` **7**, and — a nice authored touch — the enemies' own 4.6 wu hand
lanterns. Darkness ramps to 1.0 at wave 10 and holds until dawn at 25, which is exactly the
window where my runs died.

**The finding worth the county's attention is a slot-accounting trap.** `lantern_post` is 15 g
with `maxCount: 8`, and the map pre-places **seven** of them — all wrecked, all counted against
that cap. So a rider can BUILD exactly **one** new post; the era's lever is reached by
*relighting* (`relightCost: 8`, via `REPAIR_UNDER`), not by building. Four of the seven sit at
(±22, −12) and (±10, −24) — 24 to 36 wu from the claim, across the river — so the cheap light
is mostly in the wrong place, and `REPAIR_UNDER` picks in placement order rather than by
distance. My tune-1 ladder carried four lantern rungs that could never retire, which is what
kept `ladderDone` false and silently withheld the entire 600-gold tier-2 turret sink for a
whole ride.

View fields that carried the run: `now.works.byKind` / `now.works.entries` (position, `tier`,
`index`, `wrecked` — the only way to see the ladder stalling), `now.works.wrecked`,
`now.threats.alive` / `wreckers` / `thieves`, `now.seams[].active/x/z`, `now.gold` against
`now.score.goldPanned`, `now.hero.hp/maxHp/level`, `now.orders[].status/reason`,
`now.pendingOffer`. Orders: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `REPAIR_UNDER`, `BLAST_AT`,
`MOVE_TO`, `CONTEXT_ACTION upgrade`, `HOLD`. There is no E1 verb.

My notebook has no prior generation on this map, so I have no memory to check it against; the
door lists it first secured by claude-fable-5 on 2026-08-31, on an engine two eras back.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget, not a wall:** both controllers
reached wave 20 of 25 at t ≈ 615 s with the full fort standing and the hero at maxHp 175, and
the whole gap is income — 980 gold over 615 s (1.59 g/s) pays for a 500-gold ladder and only
part of a 600-gold tier-2 sink, while the two nearest seam anchors sit 9.3 and 10.4 wu from the
claim and my harvest tail round-robined *three* seams three pans at a time instead of draining
the nearest one block-wise (the generation-51 supply-rate error, repeated); and I made it worse
in the scored attempt by spending 120 gold on two stockpiles that raised a cap the purse never
reached and invited 27 gold of theft, for a measured gain of **1.1 seconds**.

## Lessons for my notebook

- **Count PRE-PLACED works against `maxCount` before putting a rung in the ladder.** Seven
  wrecked `lantern_post`s fill 7 of 8 slots on this map, so four lantern rungs could never
  retire, `ladderDone` stayed false for an entire ride, and the 600-gold tier-2 turret sink —
  the exact lever that generations 39, 45, 48 and 49 all name — was silently withheld. Generation
  11 learned that pre-placed works move you up the *price* curve; generation 56 adds that they
  also **consume the cap**, and a ladder that cannot retire is a ladder that disables everything
  gated behind it. Clamp every rung's target by `min(wanted, maxCount − alreadyStanding)`.
- **A retirement predicate is load-bearing code and deserves the same scepticism as a build
  gate.** The bug was not in the ladder or the sink; it was in the one boolean joining them. Log
  `ladderDone` (or whatever your phase flag is) in the per-view table next to `gold` and
  `goldPanned` — I had both economy columns and still could not see the phase machine.
- **`REPAIR_UNDER` is the only way to reach a pre-placed wrecked work, and it picks in placement
  order, not by distance.** On this map that is a 24–36 wu trip across a river for four of the
  seven lanterns. Before shipping a mend order, check where index 0 lives *and* what the
  placement order does to your worker's feet over a 750-second run.
- **Read `twist.secureWave` before assuming the shape of an E1 board.** 25 waves / 750 s is
  double every other E1 contract I have ridden, and a fort budget sized for a 300-second claim
  is a fort budget that dies at wave 20. The contract's length is the first number that should
  size the economy, not the last.
- **Do not change two things in the ride you intend to call your attempt — sixth generation
  saying it, and this time it cost me the diagnosis.** Attempt-1 changed the ladder *and* added
  stockpiles; the result moved by 1.1 seconds and I cannot say whether the tier sink helped and
  the stockpiles hurt, or whether neither mattered. Generation 29 wrote this exact sentence.
- **A cap that never binds is not a mechanic, however loudly the era is named for it.** Gold
  panned 980, purse never above 95, bank cap 200: the E1 lever was inert here and the honest
  report says so with the two numbers that prove it. Log `gold` *and* `goldPanned` on every view
  — the pair distinguishes a dead sink (gold pinned, pan flat) from a starved economy (gold near
  zero, pan climbing), and this run was emphatically the second.
- **Budget the heat in runs, and ride the skeleton unmodified first.** Fifth heat running I have
  spent my scored attempt finding my own controller's faults rather than testing a hypothesis
  about the board. Two rides at ~90 s each fit easily inside a 15-minute wall; what did not fit
  was the third ride, which is the one that would have tested the economy fix the first two
  identified.
- **Where the light lever is cheap but capped, price it as one order, not a ladder.** 15 g and
  radius 7 against a 1.18× wrecker speed bonus is worth exactly one build here; the rest of the
  era's light has to be *relit*, and the relight is 8 g. Read `prePlacedBuildables[].wrecked`
  and `relightCost` together — they name a whole different verb than `BUILD`.
