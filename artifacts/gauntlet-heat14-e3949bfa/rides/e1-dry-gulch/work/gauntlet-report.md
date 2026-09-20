# e1-dry-gulch — heat 14, era 6 "the Re-surveyed Claims" — claude-opus-5, generation 98

Engine hash `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`, build `e3949bfad`,
seed `e1-dry-gulch-01`, difficulty `trail`, worldModel `sim-import`.

## Runs

| run | tape | secured | waves | timeAlive | gold | calls | eventLogHash |
|---|---|---|---|---|---|---|---|
| probe (idle) | `probe-idle.json` | no (`hero_down`) | 4 | 143.300 s | 0 | 0 | `fnv1a32:79712a38` |
| tune-1 (`ctrl-v1`) | `tune-1-tape.json` | **YES** | 20 | 600.000 s | **328** | 165 | `fnv1a32:afadc88b` |
| attempt-1 (`ctrl-v2`) | `attempt-1-tape.json` | YES | 20 | 600.000 s | 89 | 222 | `fnv1a32:6f9d42c2` |

Both scored rides secured. Waves (20) and `timeAlive` (600.000 s) are pinned by `twist.secureWave: 20`,
so **gold is the only axis that separates them** — `tune-1` ranks above `attempt-1` by 239 gold, and it is
the tape I put forward. It is named in `gauntlet-outcome.json`'s `"tape"` field.

Envelope, measured on the first reel that existed (ceilings from `runTapeEnvelopeForContract`:
`maxTicks` 18 002, `maxEntries` 3 601, `maxTapeBytes` **1 938 784**):
`durationTicks` 18 000, last accepted order at tick 17 980, 165 entries, 605 633 B — **all three axes clear.**

Local assay of the promoted reel reproduces all four outcome fields and the `securedSnapshot`
(`{waves: 20, gold: 328, timeAlive: 600}`), which is exactly what the door's `score_mismatch` rule compares.
The replay's own `eventLogHash` differs from the stdout outcome line's — and the **control settles it**: the
zero-order idle probe, a run I could not have influenced, shows the identical outcome-fields-match /
hash-differs shape (`fnv1a32:a45ba9ac` replayed against `fnv1a32:79712a38` on stdout, all four fields exact).
That is a property of the instrument in this build, not of my reel.

## Outcome

**SECURED.** `e1-dry-gulch` on `e1-dry-gulch-01` at trail: **waves 20 · timeAlive 600.000 s · gold 328 ·
calls 165**, hero 175/175, thirteen works standing and none wrecked at the bank.
Tape put forward: **`artifacts/heat14/opus/e1-dry-gulch/tune-1-tape.json`** (declared in
`gauntlet-outcome.json`). **3 sim runs, 2 scored attempts.**

## What the map asked

It asked squarely about its era's signature mechanic — **E1 survival and the bank cap, the county's opening
economy** — and the cap was the whole contract, because it binds twice over. It is the **ranking ceiling**:
with `twist.secureWave: 20` pinning waves at 20 and `timeAlive` at 600.000 s, the purse held at the secure
tick is the entire remaining score, and `stockpile` (60 g, `maxCount: 2`, `capBonus: 150`, with a tier ladder
of `capMult` 1 → 1.6 → 2.4 at 110 and 260 gold) is the published lever that moves it. Both of my stockpiles
reached **tier 2**, so the live cap was 200 + 240 + 240 = **680**, and I banked 328 of it. It is also an
**income switch** — credits stop against the live cap — which is exactly what beat generation 81 here (it
banked 198 of a default 200 and watched `goldPanned` freeze for 400 seconds). The second half of the ask is
the commute: `now.seams[].active/x/z/anchorIndex` re-anchor live across six authored anchors (two at 9.3 and
10.4 wu from the claim, four at 26–35 wu), and an **inactive seam publishes `x`, `z` and `anchorIndex` as
`null`**, so `Number.isFinite` filtering before any sort is mandatory rather than defensive. The `seamYieldMult:
1.4` rule is real and load-bearing: a pan tick pays 7 rather than 5, and `goldPanned` finished at 1 370.
The fields that carried it were `now.gold` against `now.score.goldPanned` (the pair that separates a dead sink
from a starved economy), `now.score.goldStolen` (90 — the price of standing a cap-raiser on a board with
thieves), `now.works.entries` (position, **`tier`**, `index`, `wrecked` — the only way to see the cap sources
and to confirm the tier upgrades actually executed), `now.works.byKind`, `now.seams[]`, `now.hero.hp/maxHp`,
`now.threats.alive/wreckers/thieves` and `now.orders[].status/reason` (the refusal blacklist's source).
The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`,
`CONTEXT_ACTION upgrade` and one blank line. **There is no E1 verb**; the era is answered with the base grammar.

My notebook remembers this map from generations 6 and 81, and **it still plays exactly the way I remember —
which is the finding worth reporting on an era named for rebuilt maps.** The claim is still (0, 12), all six
harvest anchors reproduce to the decimal, the spring pond is still at (−18, −18) r1.4, the buildable roster and
its cost curves are untouched, and **the idle floor is still wave 4 — 143.300 s against generation 6's wave 4.**
The re-survey moved this map's rendering, not its rules. What moved is my own reading of it: generation 81
stalled its ladder behind an unfillable third sluice rung and never reached the cap-raisers at all.

## Winnability

Secured, and the margin was **enormous on survival and visibly open on the score**: the hero never fell below
**86.3 %** of its running maximum across all 167 views and finished 175/175, thirteen works stood unwrecked at
the bank, and `threats.alive` sat pinned at its 60-enemy ceiling without ever threatening the run — while the
banked purse was still climbing at roughly 3.3 g/s when the clock ran out, 352 gold short of its own 680 cap.

## Lessons for my notebook

- **Correct my generation-81 self on this map: the stall was not the sluice, it was the ladder.** It reported
  that a third `sluice` rung with no legal ground left "blocked the two stockpiles behind it, so the cap stayed
  at the default 200". Retiring a rung that runs out of candidates — the one `if` that generation named and did
  not carry — took the same seed from 198 to 328 with the cap at 680 instead of 200. **A rung that cannot be
  filled must be RETIRED, never allowed to stall the rungs behind it**, and the rungs behind it are where the
  score lives. My run retired two sluice rungs cleanly after 11 ground refusals and never noticed.
- **An era named for rebuilt maps can leave a map's rules untouched, and proving that is a result.** Era 6 is
  "the Re-surveyed Claims" and I opened braced for moved ground. The claim, all six anchors, the spring, the
  roster, the cost curves and the idle floor (143.300 s vs generation 6's wave 4) all reproduced. Ten seconds
  of idle probe plus one manifest read settled it, and the heat's real work turned out to be the economy.
  Second heat running (with generation 97 on `the-claim`) that era 6 moved rendering and not rules.
- **`threats.alive` is a SATURATING counter on this map, so it must never appear in an urgency predicate.**
  My `urgent` clause carried `alive > 34`; alive plateaus near 50–60 here by design, so urgent fired at nearly
  every view, bypassed the bank gate, and bought 445 gold of surge fort after t = 360 for a hero whose minimum
  was 86.3 %. Gate urgency on the things that can actually end a run — `hp/maxHp`, `works.wrecked`,
  `works.standing` — never on a number the map pins by construction.
- **…and the correction went the wrong way, which is the more useful half.** `attempt-1` dropped the loose
  clause and banked **89 instead of 328**: the leaner fort let works get wrecked from wave 16, `wrecked > 0`
  re-armed urgent anyway, and the purse drained into repairs and surge rungs in the exact window it should have
  been refilling. **On a gold-ranked contract the cheapest fort is not the richest fort** — over-buying defence
  early is how you afford to stop spending late. A clean one-variable change that comes back clearly negative is
  worth as much as one that comes back positive, and this one names the real shape: buy the fort that survives
  wave 20 *without repairs*, then stop.
- **Count the cap from `works.entries[].tier`, not from the number of stockpiles.** `Balance.tiers.stockpile` is
  `[0, 110, 260]` with `capMult` 1 / 1.6 / 2.4, so two tier-2 stockpiles are a **680** ceiling, not 500. The
  upgrade is only worth buying when the purse would otherwise pin — `(gold − price) + rate × remaining ≥ newCap`
  is the whole test, and it converts wasted surplus into banked gold. Tier 3 (cap 920, 520 gold more) priced out
  on this seed and the gate correctly refused it.
- **Bias the measured income rate LOW on purpose.** Deriving `rate` from `score.goldPanned` alone misses sluice
  and reclaimed gold, so the bank gate underestimates the runway and stops spending early — which errs toward
  banking the cap rather than missing it. When a safety gate reads an imperfect counter, check which direction
  its error pushes and pick the counter whose error is protective.
- **Builds snap to integer coordinates, so a candidate ring computed in floats is not the ring you get.**
  I asked for (4.5, 12) and got (5, 12); (−4.5, 12) became (−4, 12). Spacing derived from a float ring can
  collapse into a collision after the snap. Generate candidates on the integer lattice, and vary BOTH axes —
  eleven of my twelve sluice candidates answered `outside buildable terrain` because the spring basin is
  off-bank on every side but its north rim, and the one that landed, (−18, −15), was the only north-rim point
  I happened to offer.
- **Read the envelope from `runTapeEnvelopeForContract`, never from the charter's summary of it.** This brief
  published `16 KiB + maxEntries × 160` and a heat-12 casualty at 621 674 B; the live function adds
  `maxOrderEntries × (2400 − 160)`, so the real ceiling here is **1 938 784 B**, 3.3× the summary. My 605 633-byte
  reel would have looked like a catastrophe against the published floor. Third generation to say this; the
  hazard the brief warns about is one the county has already cured, and the cure lives in the function.
- **Silence at the secure boundary did four jobs again.** It banked the default (`defaultedSecure: 1`), it cannot
  be *rejected* (generation 84 nearly lost an admissible reel because refused submissions inside the choice window
  are invisible to the tape and visible to the sim, so the replay diverges), it left the last accepted order
  20 ticks inside `durationTicks` and 522 inside `maxTicks`, and it cost one call.
- **The retired verbs cost nothing here and I checked rather than assumed — eighth heat running.** The hero starts
  on the claim, has no drift, so silence is the hold, and the unemployed Prospector drifts to the hero, which is
  exactly where `HOLD` used to park it. `MOVE_HERO` earned its place only as the 1.0-unit park in front of
  `CONTEXT_ACTION upgrade` (which does not travel) and as a displacement guard that never had to fire.
- **Ride the skeleton first and change nothing — fifteenth heat where that is the whole discipline, and the twelfth
  in a row where it secured on ride one.** The reading budget went to the twist, the cap constants and tier ladder,
  the water-adjacency intersection, the buildable roster and the envelope function; the riding budget went to the
  unmodified generation-6→97 skeleton. The heat's real work is reading the contract, not riding it — and this time
  the one thing I changed after the secure made it worse, which is its own argument.
