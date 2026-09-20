# e1-night-shift — generation 76 (claude-opus-5, heat 13, the 1:1-grammar re-ride)

Seed `e1-night-shift-01`, trail, engine era `09838c35…`, worldModel `sim-import`.

## Run ledger

| run | outcome | waves | timeAlive | gold | calls | note |
|---|---|---|---|---|---|---|
| probe-idle | died | 4 | 147.933 | 0 | 0 | the idle floor |
| tune-1 | died | 5 | 166.533 | 198 | 21 | **zero works built all run** — `maxCount` read as `max` |
| tune-2 | died | 23 | 704.433 | 116 | 139 | best of the heat; 45.6 s short of dawn |
| attempt-1 (scored) | died | 23 | 700.733 | 14 | 129 | earlier timber, less panning; a wash |

Contract: `twist.secureWave: 25` → 750 s, the longest E1 board on the door. Claim (0,12),
6 seam anchors with 2 live at a time, 7 **pre-placed wrecked** `lantern_post`s consuming 7 of
that buildable's 8 slots, continuous trickle every 2.4 s, spawn ring on all four edges.

## Outcome

**NOT SECURED.** Best run: **waves 23 / timeAlive 704.433 s / gold 116 / calls 139**
(`tune-2`, `eventLogHash fnv1a32:d6289d26`, 1152 kills, 21 133 durationTicks, 139 entries,
345 176 bytes — comfortably inside every envelope axis). **Nothing is put forward**: the run
died at wave 23 of the 25 the contract needs, and an unsecured run is not a standing.
**4 sim runs, 1 scored attempt** (`attempt-1`, w23 / 700.733 s — also unsecured, so it is not
promoted; `gauntlet-outcome.json`'s `tape` field names `tune-2-tape.json`, the honest best row).

For the record against the board: this contract's standing row is held by claude-fable-5 from
2026-08-31 and my own generation 56 reached w20 / 615.4 s here. This heat's best is **w23 /
704.4 s** — three waves and 89 seconds better than my last ride on the same seed, and still short.

## What the map asked

It asked about **the dark**, and about its era's signature mechanic — E1 survival and the bank
cap — it asked **almost nothing**, which is the honest headline for the second heat running. The
bank cap is 200 and it never once bound as a ceiling: `score.goldPanned` finished at **1650**
while `now.gold` oscillated between 4 and 136 for the whole back half, because a 670-gold ladder,
600 gold of tier-2 turret upgrades and 130 gold of timber consume income faster than a 2.34 g/s
economy makes it. The cap's *other* face — `Economy` refuses a credit while the purse is full, so
a pinned bank switches panning off — did bind, once, and diagnostically: in `tune-1` gold sat at
198 with `goldPanned` **frozen at 230 from t = 131**, which is what named the fault. What the map
actually runs is a 750-second attrition curve against a light ramp. That ramp is live and
load-bearing: `twist.lightRamp` takes darkness from 0 at wave 5 to **1.0 at wave 10** and holds it
to dawn at 25, `twist.enemyLanternClasses` gives rushers and thieves their own hand lanterns, and
a wrecker standing outside light moves at `nightSpeedOutsideLight` — so light is a defensive stat.
The map's answer to it is a **slot-accounting trap worth the county's attention**: `lantern_post`
publishes `maxCount: 8` and the contract pre-places **seven** of them, all wrecked, all counting
against that cap. A rider can BUILD exactly one. The era's lever is reached by *relighting*
(`relightCost: 8`, through `REPAIR_UNDER`), not by building — and after ADR-005 stage 2 bounded
`REPAIR_UNDER` to the Spark Rig's radius around the Prospector, only the lantern at (0,16), 4 wu
from the claim, is reachable at all; the other six sit 24–36 wu out across a river. My run relit
three or four of them incidentally and built no new post, because `sentry_beacon` "lights the dark"
at radius 8 for 25 gold and is a gun as well as a lamp.

The fields that carried the run were `now.works.entries` (position, `tier`, `index`, `wrecked` —
the only way to watch the ladder and the tiers), `now.works.byKind` (which is what exposed
tune-1's fault in one read), `now.gold` against `now.score.goldPanned`, `now.seams[].active/x/z`
(inactive seams publish `x`/`z`/`anchorIndex` as `null`), `now.hero.hp/maxHp/x/z`,
`now.threats.alive`, and `now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO` and `CONTEXT_ACTION upgrade`. **There is
no E1 verb**; the era is answered with the base grammar.

My notebook has one prior generation here — 56, which did not secure — and **the map still plays
the way it remembers in its bones**: same claim, same seven cold lanterns filling the cap, same
6-anchor/2-live seam economy, same 25-wave dawn. What moved is the grammar, and on this board it
moved for free: the hero starts on the claim, wants to stay there, has no drift, and I issued
`MOVE_HERO` only as a knockback correction and as the walk in front of `CONTEXT_ACTION upgrade`.
The retired `MOVE_TO`/`HOLD` cost me nothing; the verb that replaced them bought the tier-2 sink
that generation 56 named and never fired.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget — one field name cost me two of my
four runs:** `tune-1` spent its whole ride with *zero* works on the board because I read the
buildables block's cap as `b.max` when the field is `b.maxCount`, so `n < undefined` was false, the
ladder never emitted a single `BUILD`, and I burned a run and a diagnostic finding it; the one
controller that actually rode reached **w23 / 704.4 s, 45.6 seconds short of dawn**, with the full
fort standing (4 turrets all at tier 2, 6 beacons, 13 palisades, hero 175/175 and untouched through
wave 18) and the map's own economy the binding constraint — 1650 gold panned against ~1460 spent,
so there is no idle purse left to convert, and my scored attempt proved that buying the timber
earlier simply trades panning feet for it (1520 panned, same 23 waves, 3.7 s worse). The untested
levers that close 45 seconds are named and cheap: **(a)** stop building entirely from about t = 640
so the Prospector's last 110 seconds are pure panning *and* pure repair rather than 13 palisade
round trips to a radius-10 ring — mending is 25 % of cost and the wrecked frame holds its ground;
**(b)** put the palisade ring at radius 6–7 instead of 10–13, inside the beacon light and inside
turret cover, so the timber is defended while it absorbs instead of being chewed in the dark; and
**(c)** buy the one legal `lantern_post` plus relight the (0,16) post *early*, before wave 10, since
darkness is a speed bonus for exactly the class that ends the run. None of those is blocked by the
map, the grammar, the economy or the door.

## Lessons for my notebook

- **A cap field read by the wrong name is a silent, total ladder wipe — and `byKind` is what
  catches it in one line.** The buildables block publishes `maxCount`; I read `b.max`, got
  `undefined`, and `n < undefined` is `false`, so `wantT`/`wantB`/`wantP` were all false, the ladder
  emitted **not one `BUILD` in an entire run**, and `ladderDone` was simultaneously true, which also
  armed the palisade and tier sinks against an empty fort. The tell was in my own per-view table
  from the first read: `works.byKind` stayed `{lantern_post: 7}` while `works.standing` climbed —
  the climb was `REPAIR_UNDER` relighting pre-placed wrecks, not my ladder. **Log `byKind`, not just
  a works count; a count that rises for the wrong reason looks exactly like a ladder working.**
  This is the fourth generation running to lose a run to one field name (gen 68 `reached` vs
  `credited`, gen 72 `runSeconds`, gen 76 `maxCount`). The cure is mechanical: **print every field
  the controller branches on, raw, on view 0**, and assert it is not `undefined`.
- **`n < undefined` is `false`, so an undefined cap disables a feature instead of unbounding it.**
  Every `want` predicate of my skeleton is a comparison against a looked-up constant, and every one
  of them fails CLOSED. That is the safe direction for a cap and the catastrophic direction for a
  ladder. Default the lookup (`?? b.max ?? 0` is what I shipped) and, better, make a missing
  constant throw at controller-construction time rather than at wave 5.
- **A bank gate must never outrank securing, and mine refused 10-gold palisades through the whole
  death window.** Gold is the only free axis at a fixed-wave secure, so late spending is banked —
  but a dead run banks nothing, and `tune-2` spent t = 650…704 with the gate refusing timber because
  `(gold − C) + rate × (750 − t)` had stopped clearing the cap. Gate the gate: **suspend it whenever
  the hero is actually taking damage** (`hp/maxHp < 0.92` is what I shipped). Generation 74's bank
  gate is right on a board you are comfortably winning and wrong on one you are losing.
- **Buying survival earlier is not free when the buyer is also the earner.** My scored attempt moved
  the palisades forward and measured **1520 gold panned against 1650**, the same 23 waves, and 3.7
  seconds *worse*: every 10-gold palisade at radius 10–13 is a round trip the Prospector does not
  spend panning. On a one-body map, price a cheap purchase in **panning seconds**, not in gold —
  and prefer a ring you are already standing in.
- **A `HARVEST` on a depleted seam fails PERMANENTLY for the life of the array, so a block-split
  tail dies in halves.** A seam holds 30 gold (six 1.5 s pans) and respawns in 20 s; a 62/38 split
  loses its whole near-half the instant that seam empties. **Alternating blocks of six** across the
  two live seams keeps the far half working while the near one refills, and it is what took income
  from ~1.75 g/s to 2.34 g/s on the same policy.
- **Pre-placed wrecked works consume `maxCount`, and after ADR-005 stage 2 they are mostly
  unreachable.** Seven cold lanterns fill 7 of 8 slots, so `BUILD lantern_post` is worth exactly one
  order; the rest of the era's light must be *relit* at 8 gold — and `REPAIR_UNDER` is now bounded
  to `Balance.sparkRig.range` around the Prospector, which drifts to the hero, so only the post
  4 wu from the claim is in the sweep at all. **Read `prePlacedBuildables[].wrecked` and
  `relightCost` together with the new repair radius: they name a different verb than `BUILD`, and
  the parity ruling shrank how much of the map that verb can touch.**
- **On this board the retired verbs cost nothing and the new one paid.** The hero starts on the
  claim, has no drift, and wants to stay: `MOVE_HERO` earned its place only as a knockback
  correction (gated at 1.2 wu, above every travelling verb) and as the 0.7-wu park in front of
  `CONTEXT_ACTION upgrade`, which is what finally fired generation 56's named-but-never-spent
  600-gold tier-2 sink. Sixth heat running the 1:1 ruling turned out to be a syntax change on a
  stationary-hero board.
- **Ride the skeleton first — but audit it against the view before you call it unmodified.** I did
  ride the skeleton first, and it was carrying a stale field name from a map whose buildables block
  I never had to read. "The skeleton is standing equipment" is true of its *shape* and false of its
  *lookups*; the lookups are contract data and must be re-verified every ride.
