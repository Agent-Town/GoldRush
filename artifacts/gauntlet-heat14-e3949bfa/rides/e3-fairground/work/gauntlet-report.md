# e3-fairground — generation 126, heat 14 (era 6, the Re-surveyed Claims)

Engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`, build `e3949bfad`.
Seed `e3-fairground-01`, trail difficulty. worldModel: `sim-import`.

## Evidence trail

| run | result | note |
|---|---|---|
| `probe` (idle) | w1 / 48.800 s / 0 g, `fnv1a32:647fa993` | reproduces `null-floors.json` byte for byte — the rules have not moved |
| `tune-1` | w5 / 168.0 s / 0 g | **both secure clauses met** (allCrossed, wheel 240/240); economy froze at pan 210 |
| `attempt-1` (scored) | w4 / 136.0 s / 5 g | gating the mend on gold was a regression — the fort lost its maintenance |
| `attempt-2` (scored) | **SECURED w12 / 360.000 s / 62 g** | one build per view + a reserve; pan 210 → 600 |

Envelope on the securing reel: ticks 10 800 / 18 000, last accepted order at 10 782,
entries 269 / 3 601, bytes 454 833 / 8 658 784. All three axes clear.

## Outcome

**SECURED** — waves **12**, timeAlive **360.000 s**, gold **62**, kills 415, calls **269**.
The hero finished **175/175**, twenty works stood with two wrecked, and the Fair Wheel banked
**untouched at 240/240 hp, still spinning**. Tape put forward:
`artifacts/heat14/opus/e3-fairground/attempt-2-tape.json` (declared in `gauntlet-outcome.json`'s
`tape` field). **4 sim runs, 2 scored attempts.** This is the first secure of `e3-fairground` in
my notebook's history — generations 13 and 87 both failed it.

## What the map asked

It asked a real **E3 graph question — the grid under sabotage — and the graph here is a
*targeting* graph rather than a power graph**, so this is emphatically not stationary survival
wearing the era's name. `twist.powerGrid` is declared (wheel dynamo 24 W → two pavilion lamps)
and is inert as a lever: no node state is published and there is no E3 verb. Its weight is
second-order and large — the roster filter strips **`turret` and `lantern_post`**, so the whole
arsenal is six `sentry_beacon`s, 48 ten-gold `palisade`s, two `stockpile`s and an `assay_office`.
What *is* load-bearing is that **the graph's root is a damageable building registered in the
targeting system**: `FerrisWheel.damage()` sets `spinning = false` on any hit at all and the
dynamo never restarts, so the secure gate
(`twist.fairground && ferrisWheel.spinning === false`) is a **one-hit, irreversible latch**. The
second clause, `crowdFlocks.allCrossed`, is its opposite: fifteen retries.

The reasoning the map rewards is a geometry I could compute before writing an order, and the
consumer publishes every number. The three flock lanes are **vertical at x = −20, 0, +20**, home
at z = −30, walking to copper-pavilion / ferris-wheel / silver-pavilion; fright radius 7; a
scattered flock earns nothing, and **a flock's z is never below −30**, so anything at z ≤ −37.1
is safe from every flock at any x. The north runner gate is (−12, −4). Those two facts choose the
whole plan: **post the hero at (−10, −37)** and keep phase A's entire footprint on the x = −10
column, so besiegers stay inside |x| ∈ [7, 13] — ≥ 7.3 from both neighbouring lanes — while every
approach path crosses the lanes deep south where the flocks are not.

The idle probe showed exactly what that fixes: **with no player works, every wrecker walks to the
wheel at (0, 8) and crosses the lanes at their middle**, z ≈ −21. Flocks 2 and 3 were frightened
inside ten seconds, flock 1 lost its return leg at t = 31.4, and the wheel died at t = 32.3. One
cheap column of timber redirects all of it southward and does **both** jobs at once. Measured:
the wheel was never touched in any of my three controller rides, and all three flocks had crossed
by **t ≈ 90 (wave 3)** — after which the latch is permanent and the lanes stop mattering, which is
what let phase B build a wide fort with no escort cost at all.

Fields that carried it: `now.fairground.wheel.hp/spinning`, `now.fairground.flocks.flocks[]`
(`phase`, `x`, `z`, `crossings`, `frights`), `now.fairground.objective.allCrossed`,
`now.works.byKind`/`standing`/`wrecked`, `now.seams[].active/x/z/anchorIndex` (an inactive seam
publishes all three as `null`), `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers`, `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`, and one blank line. **There is no E3 verb.**

My notebook remembers this map from generations 13 and 87, and **it still plays the way I
remember** — same claim at (0, −30), same wheel, same six anchors, same 22-second blind opening,
same starved economy. The idle floor reproduced `null-floors.json` to the hash, and none of era
6's eight pins names this contract, so the re-survey moved its rendering and not its rules. The
one thing that *had* moved since generation 13 is the grammar, and here it was decisive: the hero
is no longer welded to the stake, and the stake is exactly where flock-2 lives.

## Winnability

Secured, and the margin was **wide on both clauses and thin only on the purse**: the objective was
discharged by wave 3 with twelve waves of slack, the wheel never took a single point of damage,
and the hero finished at its full running maximum with twenty works standing — while the banked
62 of a 200 cap is the whole margin left behind, because the ladder kept buying ten-gold timber to
the end and neither stockpile (+150 cap each, and this roster has **no thief**) was ever reached.

## Lessons for my notebook

- **A ladder of cheap rungs is a tick thief, and `goldPanned` freezing at the SAME number twice is
  how it signs itself.** `tune-1` and `attempt-1` both froze at exactly **pan = 210**. I read the
  first freeze as an empty-purse mend (generation 87's lesson) and gated the mend — which made the
  run *worse*, because the mend was the only thing keeping the fort alive. The true cause was that
  27 ten-gold rungs are affordable the instant a coin lands, so the purse never fills, the
  Prospector never completes a pan block, and the mend can never afford. **One build per view,
  emitted only when `gold >= cost + reserve`, took pan from 210 to 600 and w5 → w12.** Generation
  13 wrote this exact sentence about this exact map ("a stack of gold-gated BUILD orders is a
  commute generator") and I shipped the bug anyway.
- **Two identical failure numbers across two different controllers means the variable I changed was
  not the cause.** That is a stronger signal than either run alone, and it is free — it only needs
  the one column I already log.
- **An irreversible latch and a fifteen-retry latch want opposite policies, and the retries want
  the OPENING.** The wheel clause is bought with permanent structure; the escort clause is bought
  early, while the board is thin (6–15 alive), and once `allCrossed` latches it is permanent. That
  splits the run cleanly: phase A keeps a minimal footprint in a lane corridor, phase B ignores the
  flocks entirely and spends everything on the fort. Classify every clause of a conjunctive gate as
  *recoverable* or *unrecoverable* before designing anything — the unrecoverable one sets the floor
  and the recoverable one sets the **schedule**.
- **Read the objective consumer's coordinate derivation, not just its rule.** `CrowdFlockSystem`
  derives each lane from its landmark's x and the stake's z, so the lanes are three vertical lines
  I can write down exactly — and `advance()` never takes a flock below z = −30, which turns "keep
  the lanes clear" into the far cheaper "stay south of z = −37". One inequality chose the post, the
  fort column and the build spots.
- **The north spawn gate's x is a free gift on any map where runners chase the hero.** The gate is
  (−12, −4); a hero at x = −10 keeps every runner inside the corridor for its whole walk, while the
  mirror-image post at x = +10 drags them straight across lane 2. The asymmetry is not aesthetic —
  it falls out of one published coordinate.
- **A bait that is also the fort is the cheapest possible answer to a damageable objective.** Any
  standing work in the south midway is nearer to both saboteur spawns than the wheel is at 46
  units, so the same timber that defends the hero keeps the dynamo turning. Look for the purchase
  that discharges the era gate and the defence at once before pricing either separately.
- **Silence at `pendingSecure` did its four jobs again:** it took the `bank` default
  (`defaultedSecure: 1`), left the last accepted order 18 ticks inside `durationTicks`, held a
  271-view run to 269 entries, and — the reason that matters most — **it cannot be rejected**, so
  the replay cannot diverge the way generation 84's nearly did.
- **`null-floors.json` first, every ride — fifth heat running.** One file published this seed's
  losing floor before I ran anything and a ten-second probe reproduced it to the hash, which
  retired the whole geometry question on an era named for rebuilt maps and sent the entire reading
  budget to the two things that actually decided the contract.
- **What I left on the table, named precisely: the purse.** 600 panned, 62 banked, cap 200 and no
  thief on the roster — so two 60-gold stockpiles (+300 of ceiling, +90 net each) and a hard build
  stop around t = 300 are worth a few hundred points on an identical secure. My ladder had both
  stockpile rungs but buried them behind sixteen palisades that the run never finished buying.
