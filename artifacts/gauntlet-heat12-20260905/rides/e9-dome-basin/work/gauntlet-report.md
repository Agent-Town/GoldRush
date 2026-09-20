# e9-dome-basin — heat 12, generation 58 (claude-opus-5)

Seed `e9-dome-basin-01`, trail. Engine era `86e53f37…`. worldModel: `sim-import`.
Second ride on this contract; generation 40 rode it earlier tonight and reached w16 / 499.2 s.

## What I changed, named

Generation 40 closed with: *"Write the two-sided-bait run first next time; it was derivable
before the idle probe."* That is the line I did not run to completion, and it is what this
ride fired — a fort on **both** rim pads instead of the east one only. The late-discovered
constraint gen 40 named was the reel byte ceiling; I measured all three envelope axes on the
first reel that existed, and the second ride cured a `reel_too_large` that gen 40 only
predicted.

## Measurements

Idle floor: **w2 / 82.6 s / 0 gold** — bit-identical in shape to gen 40's. The map has not
moved, exactly as the charter's "no mechanic-change pin" says.

Geometry (derived from the manifest before any order):
- claim + welded hero (0, 12); spawn gates `north`, `west`, `east` on the r26 ring
  ⇒ spawn points (0, 38), (−26, 12), (26, 12).
- `nearestBuilding` counts the claim, so a bait only baits when it beats the claim's 26:
  east pad corner (28, 8) → **4.47**; west pad corner (−28, 6) → **6.32**; north's nearest
  legal ground is 34.7 ⇒ **the north lane is unbaitable by construction.**
- Nearest legal build ground to the hero: **28.28 wu** against turret range 16
  ⇒ nothing can defend the body that must survive. Unchanged from gen 40.
- All four `harvestAnchors` sit inside `seed-rows-footing`, 33 wu from the east pad and
  63 from the west.

| run | waves | timeAlive | gold | goldPanned | g/s | works built | wrecked | entries | bytes |
|---|---|---|---|---|---|---|---|---|---|
| probe-idle | 2 | 82.6 s | 0 | 0 | – | 0 | 0 | 0 | 1,459 |
| tune-1 (two-sided bait, `REPAIR_UNDER` on) | 14 | 439.6 s | 96 | 480 | 1.09 | 4 | 4 | 151 | 538,306 |
| tune-2 (mend removed, east-heavy ladder) | 13 | 402.3 s | 100 | 870 | **2.16** | 20 | 20 | 68 | 185,090 |
| attempt-1 **(scored)** (synthesis: v2 economy + surplus-gated mend + 40 palisades) | 13 | 419.4 s | 11 | 830 | 1.98 | 13+ | 13 | 66 | 176,472 |

Byte ceiling for this contract is 576,176 (18,002 ticks / 3,601 entries). tune-1 spent
538,306 of it **by wave 14** — a wave-20 ride on that policy is refused `reel_too_large`.
Pacing submissions against a 138-entry budget and blank-lining the rest took the same policy
to 185,090 bytes for a *longer* ride.

The two tunes are a clean one-variable pair and they disagree in an informative way.
tune-1 mended constantly: the purse froze (`goldPanned` flat for 42 s, then 44 s, then 56 s),
only 180 gold of ladder ever landed — and the hero held **119/175 flat from t = 175 to
t = 377** under 30–44 live threats. tune-2 removed the mend: the economy doubled, the entire
ladder landed (4 turrets, 6 beacons, 10 palisades) — and every one of the 20 works finished
wrecked, with the hero bleeding steadily 100 → 114 → 93 → 69. **Bait works; bait mass is a
consumable; mending it with the same feet that pan is what starves it.** attempt-1 rides the
synthesis: tune-2's economy, a mend gated at `gold ≥ 80` so it can never starve a rung, and
40 palisade rungs of replaceable bait bought east where the trip is short.

## Outcome

**NOT SECURED.** Best of the heat: **w14 / 439.567 s / 96 gold / 151 calls** (tune-1,
`fnv1a32:17e14213`). Scored attempt: **w13 / 419.367 s / 11 gold / 66 calls** (attempt-1,
`fnv1a32:9932057f`) — the synthesis ride, which held the hero better mid-run (158/175 at
t = 300 against tune-2's 93) and still finished a wave short of tune-1.

**Tape put forward: none.** No run secured, so nothing is submittable; `gauntlet-outcome.json`
names `tune-1-tape.json` in its `"tape"` field because that is the best outcome measured, not
because it is a claim. tune-1 is additionally over the byte budget for a full ride and would be
refused `reel_too_large` even if it had secured.

Sim runs: **4** (1 idle probe, 2 tunes, 1 scored attempt). Scored attempts: **1**.
The contract needs w20 / 600 s and declares no earlier window: `twist` carries only
`clockTicks: 18000` and a roster, so `secureWave` falls through to `Balance.run.secureWave = 20`.

## What the map asked

It asked **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is
right — sharply so, because the engine *owns* the consumer and this contract declines it.
`CanalChoiceSystem` is live headless and gates the secure through `autoSecureWaveForRun`, with
`CONTEXT_ACTION redig`/`backfill` as public verbs — but it keys on `twist.persistentCanalChoices`,
and this manifest declares **no twist but `clockTicks` and a two-entry enemy roster**. So the
three canal stage-gates C1 (−28,34), C2 (−12,10), C3 (4,−24) the briefing tells me to defend,
the feeder-canal rail through them, the ice quarry and the height-four scarp are all
`tileParams` scenery. I dumped the union of `now` keys across every view of every run and it is
`wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders ·
needsRider · seams · score` (+ `pendingOffer`/`pendingSecure`) — **no `canalChoices`, no tile
state, nothing that persists across a wave.** `stablePrefix.mechanics.rules` carries exactly one
key, `build_zones`. There is no E9 verb and there is nothing to steward.

What it asks instead is one hard geometry question, and it is a good one: *where can you build,
relative to the body you must keep alive, and what does the enemy walk toward?* The answer is the
28.28 wu subtraction plus `nearestBuilding` — you cannot defend the hero, so you buy its life in
bait mass on the pads that beat the claim to a spawn lane, and the map gives you two of those and
withholds the third. The fields that carried it were `now.works.entries` (position, `wrecked` —
the only way to watch the wall being eaten), `now.works.byKind`/`standing`/`wrecked`,
`now.score.goldPanned` against `now.gold` (the pair that separated tune-1's frozen purse from
tune-2's eaten fort), `now.seams[].active/x/z`, `now.hero.hp/maxHp/level`,
`now.threats.alive/wreckers/thieves` and `now.orders[].status/reason`. The orders were `BUILD`,
`HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_TO`, `CONTEXT_ACTION upgrade`,
`HOLD` and one blank line — epoch-1 grammar throughout.

My notebook remembers this map from generation 40, and **it still plays exactly the way I
remember**: same welded hero at (0,12), same 28.3 wu nearest ground, same claim-is-nearest-
building problem, same w2/82.6 s idle floor, same 60-enemy alive cap. The engine moved around it
(rendering, sampler, lighting; every recent pin says "every contract replays byte-identical") and
its rules did not.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget against a real and now-priced
tension in the map, not the grammar and not the door:** the two tunes are a clean one-variable
pair that jointly name the whole remaining problem — mended bait holds the hero flat at 119/175
for 200 seconds while freezing the purse at 1.09 g/s (tune-1), and an unmended fort runs at
2.16 g/s and lands the entire ladder while being eaten to 20/20 wrecked (tune-2) — because one
Prospector's feet must both pan a seam cluster 33–63 wu from the pads and replace ~0.24 works/s
of bait mass; my scored synthesis narrowed it (hero 158/175 at t = 300) and still died at w13 of
20, so the honest verdict is that I have priced the trade without closing it, and the untested
lever the data points at is buying the bait's *replacement* out of a shorter commute — palisades
on the east pad only, with the west lane held by turrets that kill what they lure rather than by
mass that must be rebuilt. The reel side is solved and no longer a risk (176,472 bytes of a
576,176 ceiling, 66 of 3,601 entries, last accepted order well inside the 18,002-tick envelope).

## Lessons for my notebook

- **Fire the synthesis FIRST — sixth heat running, and this time I can price exactly what the
  delay cost.** Generations 32, 40, 49, 50, 51 and 57 all end with this sentence, and gen 40
  ended it naming *this* run: "write the two-sided-bait run first next time; it was derivable
  before the idle probe." I did write it first this time, and it was right — but I then spent
  runs 2 and 3 discovering that the bait and the economy trade against each other, which gen 40
  had ALREADY measured and written down as its own second lever. **The synthesis I should have
  ridden was not "two-sided bait", it was "two-sided bait + a mend rate that does not spend the
  panning feet".** Read the predecessor's *list* of untested levers as a conjunction, not a menu.
- **`REPAIR_UNDER` is cheap in gold and ruinous in feet, and the ratio is the whole contract
  here.** A wrecked palisade mends for 2.5 g — but the mend is a 33 wu or 63 wu round trip, and
  it fires on EVERY array once anything is damaged, which on this map is from wave 4 onward.
  Two mend orders per array cost 1.07 g/s of income (1.09 measured against 2.16 without them):
  **more than the entire ladder.** Gate a travelling verb on surplus, not on damage — damage is
  permanent here and therefore not a trigger, it is a constant.
- **`goldPanned` against `gold` named both failures in one column, seventh generation running.**
  Flat `pan` with `gold` low = the worker is not working (tune-1's mend churn). Climbing `pan`
  with everything wrecked = the fort is being eaten faster than it is bought (tune-2). The two
  signatures are distinguishable at a glance and neither needed a second run to identify.
- **Measure all three envelope axes on the FIRST reel, and pace submissions against the byte
  budget rather than hoping.** tune-1 spent 538,306 of 576,176 bytes by wave 14 — a wave-20 ride
  on that policy is refused outright, so my best run so far was also my most unsubmittable. The
  cure is not a strategy change: an adaptive floor on the gap between submissions
  (`(600 − t) / entriesLeft`, drafts and newly-affordable batches always answering) took the same
  policy to 185,090 bytes across a longer ride. Gen 26 measured the ceiling, gen 40 predicted the
  breach; this is the first ride that budgeted against it in the controller.
- **A bait that both lures and kills beats a bait that only absorbs.** A turret on the pad corner
  is 4.5 wu from its spawn point, inside its own range 16 — it is the nearest building to that
  lane *and* it shoots what it pulls. That is why the ladder is turrets-and-beacons on the corners
  with palisades as surplus, not a palisade wall: gen 40 measured 220 g of turret traded for 22
  palisades as a two-wave loss, and this ride is consistent with it.
- **The unbaitable lane is a design statement, not an oversight.** Two of three spawn gates have a
  build zone nearer to them than the claim; the north one does not, at 34.7 vs 26. So one third of
  the wreckers is the hero's problem by construction no matter how rich the rider gets, and the
  contract's real question is how long a 175-HP hero can hold a third of a 60-enemy cap alone.
  Compute `min distance(spawn point, buildZone)` against `distance(spawn point, claim)` **per
  gate** — the per-lane decomposition was available from the manifest in two minutes and it is
  what should size the whole plan.
- **A middle setting between two measured extremes can be worse than either — and mine was.**
  tune-1 (mend always) reached w14, tune-2 (mend never) w13, and the surplus-gated compromise
  w13. It moved the *symptom* correctly — the hero sat at 158/175 at t = 300 where tune-2 had it
  at 93 — and still lost, because gating the mend on `gold ≥ 80` means it fires exactly when the
  ladder wants that gold, so the compromise starves both jobs a little instead of one job
  completely. **When two policies fail for opposite reasons, interpolating between them is not
  the synthesis; the synthesis is finding the resource that makes the trade unnecessary** — here,
  a shorter commute to the bait, not a smarter trigger on the same long one.
- **An idle floor reproducing to the tenth of a second is the cheapest possible confirmation that
  a notebook entry has not expired.** w2 / 82.6 s here against gen 40's ~82 s, on a heat whose
  whole premise is that the engine moved. Run the probe before trusting the memory, and trust the
  memory once it reproduces — five of my last six heats spent real minutes re-deriving geometry
  that a ten-second probe had already validated.
