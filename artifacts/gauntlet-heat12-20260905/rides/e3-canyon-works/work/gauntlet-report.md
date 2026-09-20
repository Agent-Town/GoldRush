# e3-canyon-works — heat 12, generation 60 (claude-opus-5)

Seed `e3-canyon-works-01`, trail, engine `86e53f37…`. worldModel: `sim-import`.

## What I changed from my own last ride

Generations 12 and 37 both died at **wave 3, t≈100 s**, and both reported the map as an economy
wall *and* an unbeaten survival wall — gen 37 wrote "I never observed the run reach wave 6 at all."
This ride's one named change was to stop treating survival as the problem: plating-first draft
scoring, a free `BLAST_AT` every ready view, and letting the beacon ladder double as the fort.

**It worked, and it retires half of my own notebook.** `tune-1` rode to **wave 20 / 600.000 s**
(the wave ceiling) with the hero at 78/150, six beacons built, and
`now.canyonConnect` reading **`powered: 2/2` — both galleries lit**. The Canyon Works grid is
completable. It is not a survival map and it is not an unreachable objective.

The latch still failed, and now for exactly one reason: **timing**. `complete:false, failed:true`.

## The priced impossibility (constants attached)

| constant | value | source |
|---|---|---|
| relay comes online only under a standing, unwrecked `sentry_beacon` within 2.5 wu | — | `src/sim/HeadlessContractSim.ts:2370` |
| `connect.required` / `byWave` | 2 galleries / wave 6, one-way latch, `missedDeadline: run-unsecurable` | contract `twist.powerGrid.connect` |
| pylon sites needed for 2 galleries | **6** (two disjoint 3-hop chains; `maxSpanLength: 30` forbids every cross-link — 33.9 / 39 / 48 / 59) | `twist.powerGrid.wires` |
| `sentry_beacon` cost curve, `maxCount` | `[25,35,45,55,75,95]` = **330 gold**, max 6 | view `mechanics.buildables` |
| **bank cap** | **200** | `Balance.economy.bankCap` |
| seam supply | 2 live × capacity 30 / respawn 20 s; tick 5 g / 1.5 s | `Balance.goldSeam` |
| seam anchors | all four north across the river, **81 wu** from the stake, in two clusters 68 wu apart | `stablePrefix.map.seams` |
| wave clock | wave N at t = 30(N−1); **wave 7 at t = 180 s** | measured |

The wall is **the bank cap, not the income rate**, and that is the finding neither of my prior
generations named. 330 > 200, so the six beacons **cannot be bought on one descent at any income
speed**. Two descents minimum (or 120 gold of stockpiles for a 360 cap, raising the bill to 450).
Each descent is ≥ 32 s of walking that is not panning.

Lower bound, everything perfect: 330 / 2.07 g/s = 159 s panning + 17 s opening commute + 2 × 32 s
descents = **≥ 208 s against a 180 s deadline**. Measured on the real line: **180 gold panned at
t = 180**, i.e. 330 gold lands at t ≈ 330 — a **150-second** miss, closing to ~28 s only under an
income ceiling no route can actually hold.

Secondary finding for the county: the contract also fields a **baron at wave 14**
(`railcar` / `dynamo_crawler`, `hpScale 1`, `railRouteIndex 1`, `pursuitRange 0`) and the ceiling is
wave 20, so the true gate is a **three-clause conjunction** — connect-by-6 **and** wave ≥ 12 **and**
baron beaten. The rail runs straight down the west chain past (−24,−20) and (−12,−36), both inside
build zones, so the boss half looks tractable; the wave-6 latch is what nobody reaches.

Cheapest lever if the county wants this contract claimed: it is the same one that turned
`e3-fairground` from unclaimable into a first secure — **the ground, not the balance**. One or two
`harvestAnchors` south of the river (or `connect.byWave` at 8 instead of 6) closes a 150-second gap
that no policy can close.

## Outcome

**NOT SECURED.** Best ride `tune-1`: waves **20**, timeAlive **600.000 s**, gold **200**,
kills 108, calls **43**, `endReason: wave-ceiling`, `eventLogHash fnv1a32:d5528e07`.
Reel envelope clean: 18 000 ticks, 43 entries, 144 734 bytes.
Tape put forward: **none** — the run is unsecured and must not be submitted.
**3 sim runs** (idle probe, `tune-1`, pan-only probe), **1 scored attempt** (`tune-1`, declared in
`gauntlet-outcome.json`; also written to `attempt-1-tape.json` — one ride under two filenames).

## What the map asked

It asked a real graph question and E3's signature mechanic — the grid under sabotage — **is the
contract**, not a flourish: it gates the secure, and a missed deadline makes every later wave
worthless. The reasoning is genuine and fully legible from the view alone: two disjoint three-hop
chains from one 26 W producer, relays that boot offline and come online only under a standing
unwrecked `sentry_beacon`, `maxSpanLength: 30` killing every shortcut, and a watt ledger that sheds
lamps (priority 30) so both galleries hold on 26 W against 28 W of demand. The sabotage half is real
too: `fevered_saboteur` (`waveMin 4`, `buildingDamageScale 1.25`) spawns at (±46, 38) — on top of
the rim pylons — and I watched `works.standing` fall 4 → 3 → 2 at t = 125–133 as it ate beacons off
the far end of both chains. The fields that carried it were `now.canyonConnect
{powered,required,byWave,complete,failed}`, `now.works.entries` (position + `wrecked`, the only way
to see which pylon sites are actually covered), `now.seams[].active/x/z`, `now.gold`,
`now.score.goldPanned`, `now.hero.hp/maxHp/level` and `now.threats.alive/wreckers`. The orders were
`BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and `HOLD`. There is no E3 verb — the grid is
something you read and place around, never something you do.

My notebook remembers this map from generations 12 and 37, and **it half plays the way I remember**.
Every structural constant reproduced exactly (same latch, same 330-gold price, same 81 wu commute,
same w3/≈100 s idle floor). What did **not** reproduce is the verdict's second half: my own notes
say the hero cannot get past wave 3 on this board, and it can — it rode to the wave-20 ceiling on
the first controller I wrote this heat.

## Winnability

**No — not through the door from its starting kit, and the wall is the map's bank cap against its
own one-way deadline, not the grammar, not my budget and (correcting my own two prior rides) not
survival:** the latch needs six `sentry_beacon`s worth **330 gold** while `Balance.economy.bankCap`
is **200**, so the tour cannot be bought on one descent at any income speed, and two descents at
≥32 s each plus an 81 wu opening commute plus 330 gold at the seams' hard 2.07 g/s ceiling comes to
**≥208 s against a 180 s (wave-7) deadline** — measured, 180 gold panned at t = 180 and the grid
completing 2/2 only after the latch had already failed.

## Lessons for my notebook

- **My own "this map is a survival wall" was wrong, and one heat's worth of ordinary skeleton
  disproved it.** Generations 12 and 37 both died at wave 3 / t≈100 and folded that into the
  verdict; the gen-6→58 skeleton (plating-first draft, free `BLAST_AT`, the objective's own beacons
  doubling as the fort) rode the same seed to the wave-20 ceiling at 78/150 on its **first**
  controller. A verdict that bundles two independent walls together is a verdict that will be half
  wrong. **Price each clause of an impossibility separately, and re-test the one you never actually
  reached.**
- **The bank cap can be a harder wall than the income rate, and it is rate-independent.** 330 gold
  of objective against `bankCap: 200` means "cannot be done in one trip" no matter how fast you
  pan — an argument that survives any economy tuning, where "2.07 g/s is too slow" does not.
  **When pricing an objective, check `sum(costs)` against the CAP before checking it against the
  rate.** Neither of my two prior rides on this contract did.
- **Read the contract's `twist` keys as a list before planning.** `twist.baron` sat in this manifest
  through two of my generations and neither report mentioned wave 14 or the wave-20 ceiling. The
  secure here is a three-clause conjunction and I only enumerated it on the third ride.
- **The view cadence, not the seam, was my real income cap.** A 12-deep `HARVEST` chain drains both
  live seams in ~10 s, every record goes `failed` at once, and then the array is a bare `HOLD` until
  the next 30-second wave boundary — 60 seconds of measured idle with the purse frozen at 60. Seams
  respawn in 20 s but I get a decision point every 30. **On a map whose surprises back off, size the
  worklist for the VIEW GAP, and prefer an order that keeps failing (and so keeps emitting views)
  over one that drains into silence.**
- **Seam re-anchoring across a 68 wu gap is a commute generator that nearest-first sorting cannot
  see.** The four anchors sit in a west pair and an east pair; draining the west pair activates the
  east pair, and my sort dutifully walked the Prospector 68 wu for the next 5 gold. Sort by the
  distance to the *cluster you are already in*, and stay put through a 20 s respawn rather than
  crossing to a fresh one.
- **`works.standing` falling is the sabotage clock, and on a chain objective it is the whole
  deadline.** Six beacons only count when all six stand *simultaneously*; wreckers from wave 4 eat
  the far end while you are still buying the near end. On any objective that samples a conjunction
  of standing works, **build the exposed rungs last** and time them to land inside the latch window.
- **A priced impossibility is worth more when the price is a constant than when it is a rate.** The
  honest deliverable here is `330 > 200` and `208 s > 180 s`, with the file and line for each — not
  another tape. And the cheapest fix is the same one that unlocked `e3-fairground`: the ground. Two
  seam anchors south of the river, or `byWave: 8`, closes a gap no controller can.
