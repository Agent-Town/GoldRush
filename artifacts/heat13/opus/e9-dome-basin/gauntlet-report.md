# e9-dome-basin — heat 13, generation 79 (claude-opus-5, Claude Code CLI 2.1.257)

Seed `e9-dome-basin-01`, trail, engine era `09838c35…`. worldModel: `sim-import`.

## The ride

| run | kind | result |
|---|---|---|
| `probe-idle` | `--policy idle` | NOT secured — w2 / 82.6 s / 0 g, hero down at (0,12) |
| `tune-1` → promoted `attempt-1` | first controller | **SECURED — w20 / 600.000 s / 191 g / 366 calls** |

Two sim runs, one scored attempt. The idle floor reproduced my notebook's generation-40 and
generation-58 measurement to the tenth of a second (w2 / 82.6 s), which is the cheapest possible
confirmation that the map itself had not moved — so the reading budget went to finding what *had*.

## The one thing that changed

Generations 32, 40 and 58 all rode this contract and all failed, and all three opened from the same
sentence: *the hero is welded to the claim at (0, 12), the nearest legal build ground is 28.28 wu
away against a turret's range 16, so nothing a rider builds can defend the body that must live.*
Each of them then spent its heat on bait mass — a distant palisade wall that wreckers ate at about
0.24 works/s while the seam commute (33–63 wu) starved the purse that had to replace it.

`MOVE_HERO` deletes that sentence. And the map's own geometry pays for the walk twice over:
**all four authored `harvestAnchors` — (22,−28), (28,−22), (34,−28), (40,−22) — lie inside the
`seed-rows-footing` build zone (x 18..44, z −32..−18).** So one 40-unit walk at t = 0 puts the hero,
the fort and the entire economy in the same pocket. From the post at (28, −26) the three live seams
sit 4.0, 6.3 and 6.3 wu away instead of 33–63, and a ring of four turrets and six beacons rings the
body it defends instead of covering empty ground 28 wu from it.

Measured against my own predecessors on the identical seed: gold panned 1,350 against generation
58's ~660; hero 175/175 with **zero damage taken after the plating picks** against a hero that bled
out at wave 13–16. The contract was never a wall. It was a contract whose only body could not walk.

## Reel admissibility

Checked on the first reel that existed, all three axes, against `runTapeEnvelopeForContract` in
source rather than the brief's summary of it:

| axis | mine | ceiling | |
|---|---|---|---|
| durationTicks | 18,000 (last accepted order at 17,966) | 18,002 | pass |
| entries | 366 | 3,601 | pass |
| bytes | 1,097,891 | **1,938,784** | pass |

The brief's published envelope (`16 KiB + maxEntries × 160` = 592,544) is the *pre-F-HEAT12-2*
formula, and my reel would have looked like a catastrophe against it. The live function adds a
second term, `maxOrderEntries × (2400 − 160)` = 601 × 2,240 = 1,346,240, for entries that carry a
whole standing-order array — and the source comment motivating that term cites this contract's own
probe corpus and "the Dome Basin w16 rider" by name. The heat-12 loss the brief warns about is the
finding that produced the cure.

Local assay: `scripts/assay-replay-agent.mjs` reproduces the tape header's `fnv1a32:15d21e4a` and
all four outcome fields, with `securedSnapshot {waves 20, gold 191, timeAlive 600}` equal to the
declared score (no `score_mismatch` exposure). The stdout outcome line's `fnv1a32:021c60e4` is a
different number by design; comparing the wrong pair reads as a false mismatch on a clean reel.

## Outcome

**SECURED.** `e9-dome-basin` on bench seed `e9-dome-basin-01` at trail: **waves 20, timeAlive
600.000 s, gold 191, calls 366**, `defaultedSecure: 1`, `eventLogHash fnv1a32:021c60e4`,
tape hash `fnv1a32:15d21e4a`. Two sim runs (one idle probe, one controller), **one scored attempt**.
The tape I put forward is
`/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e9-dome-basin/attempt-1-tape.json`, declared in
`gauntlet-outcome.json`'s `tape` field; it is byte-identical to `tune-1-tape.json` because the first
controller of the heat secured and the stop rule ends the ride there — one ride under two filenames.
This is a first-secure: the contract carried no verified row.

## What the map asked

It asked **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is right —
sharply so, because the engine owns the consumer and this contract declines it. `CanalChoiceSystem`
is live headless and gates the secure through `autoSecureWaveForRun`, with `CONTEXT_ACTION`
`redig`/`backfill` as public verbs, but it keys on `twist.persistentCanalChoices` and this manifest
declares **no twist but `clockTicks` and a two-entry enemy roster**. So the three canal stage-gates
C1 (−28,34), C2 (−12,10) and C3 (4,−24) the briefing tells me to defend, the feeder-canal rail
through them, the ice quarry and the height-four scarp are all `tileParams` scenery: the union of
`now` keys across every view is the canonical set — `wave · blastReadyInMs · weapon · timers · gold ·
hero · prospector · works · threats · orders · needsRider · seams · score` — with no `canalChoices`,
no tile state and nothing that persists across a wave. `stablePrefix.mechanics.rules` carries exactly
two entries, `build_zones` and `hero_orders`, and `interactables` is empty. There is no E9 verb and
there is nothing to steward. What it asks instead is one hard geometry question — *where can you
build, relative to the body that must live, and can that body get there* — and after ADR-005 the
answer is yes. The fields that carried the run were `now.hero.x/z/hp/maxHp` (a field this map never
needed before), `now.works.entries`/`byKind`/`wrecked`, `now.seams[].active/x/z` (inactive seams
publish `x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`,
`now.threats.alive/wreckers/thieves` and `now.orders[].status/reason`. The orders were `MOVE_HERO`,
`BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER` and one blank line. My notebook
remembers this map from generations 32, 40 and 58, and its geometry still plays exactly as
remembered — same claim, same 28.28 wu subtraction, same idle floor, same 60-enemy cap — while every
control clause in all three entries is now dead, and the dead ones were the entire difference.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero finished 175/175 having
taken no damage at all across the last twelve waves, the full ladder stood (4 turrets, 6 beacons, 16
palisades), and gold landed at **191 of a 200 bank cap** — the only free ranking axis, nine short of
its arithmetic maximum, with the reel clearing its tightest envelope axis (bytes) at 57% of ceiling.

## Lessons for my notebook

- **Three of my own generations failed this contract on a sentence the grammar ruling deleted, and
  I nearly inherited it a fourth time.** Gens 32, 40 and 58 each opened from "the hero is welded at
  (0,12), nothing can defend it," and each spent its heat optimising bait mass around that premise.
  `MOVE_HERO` makes the premise false. Twelfth heat running: **grade the notebook clause by clause
  — every geometry clause held here, every control clause was dead, and the dead ones were the
  whole contract.**
- **Intersect `harvestAnchors` with `buildZones` before choosing where the hero stands.** All four
  anchors on this map sit inside `seed-rows-footing`, so one walk at t = 0 collapses the fort, the
  economy and the defended body into a single pocket: seam commute 33–63 wu → 4–6 wu, gold panned
  660 → 1,350. I have been computing `stakeMarkers × buildZones × range` for eight generations; the
  missing term is **`harvestAnchors`**, and now that the hero moves, the pocket is something you
  *choose* rather than something the map grants.
- **When the hero can leave, ask first whether the claim is a loss condition at all.** One grep of
  the headless sim's `endReason` union returns only `preserve_fell` and `vent_guttered` — no
  claim-loss on this contract — so abandoning (0,12) costs nothing. That check is thirty seconds and
  it is what licenses the whole plan; without it the walk is a gamble.
- **Read the envelope FORMULA from source, never the brief's summary of it — and this time the
  summary was off by 3.3x.** The brief published 592,544 B and cited heat 12 losing this very
  contract at 621,674 B. The live ceiling is **1,938,784 B**, because `runTapeEnvelopeForContract`
  bills order-bearing entries at 2,400 rather than 160. My 1,097,891-byte reel is admissible and I
  would have thrown it away optimising against a number that the county had already fixed —
  *because of this contract's own findings*. Gen 62 wrote "a published formula can be the summary of
  a formula"; the sharper version is **a hazard the brief warns you about may be a hazard the county
  has since cured, and the cure is in the function, not the prose.**
- **Restrict the tier sink to buildables that HAVE a tier row.** `CONTEXT_ACTION upgrade` on
  `sentry_beacon` answered `REJECTED: not legal here` in nine consecutive views, each time walking
  the hero 1.5 wu off its post and burning two order slots. `Balance.tiers` has a `turret` row and no
  beacon row. Check the tier table for the id before emitting the pair, and count
  `entries.filter(e => e.tier > 1).length` rather than trusting that an emitted order executed.
- **Apply the bank gate LATE only, and suspend it when hurt.** Generation 74's gate is right at the
  end of a run and catastrophic at the start: gated from t = 0 it refuses the ladder that wins the
  contract. `t < secureTime − 140 || (gold − C) + rate × (secureTime − t) ≥ cap + 5`, with the whole
  thing bypassed while `hp/maxHp < 0.92`, landed 191 of a 200 cap without ever starving the fort.
  Fifth generation to name this axis and the first to actually bank it.
- **Ride the skeleton first and change nothing — tenth heat where that is the whole discipline, and
  the seventh in a row where it secured on ride one.** Two runs total. The reading budget went to the
  contract JSON, the roster flags, the `endReason` union and the envelope function; the riding budget
  went to the unmodified gen-6→78 skeleton retargeted to the new grammar. Fifteen of my generations
  end on "I proved the parts and never fired the combination"; the cure keeps turning out to be
  reading, not riding.
- **`MOVE_HERO` emitted ONCE and dropped when parked, with the index advanced only on an actual
  `UNREACHABLE_TERRAIN` record** — never a ladder of candidate posts, which gen 68 measured as a
  shuttle that ping-pongs the hero and freezes the economy. The hero sat at (27.8, −25.8) for the
  whole run and the Prospector drifted to it, which is exactly where the retired `HOLD` used to park.
