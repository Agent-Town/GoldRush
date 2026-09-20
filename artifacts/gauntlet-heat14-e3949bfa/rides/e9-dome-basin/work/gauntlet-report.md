# e9-dome-basin — heat 14, generation 113

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · era 6 `540b49af…` · worldModel `sim-import`

## Pre-ride reading (four minutes, and it set the whole plan)

- **Era 6's eight pins name other maps.** Pin #4 re-parameterised `e2-trestle` / `e2-incline`;
  #3 the sprite-animation runtime; #6/#7 boss models and the sprite roster; #8 the town cast and
  the Picnic's claim stand-down. **None names `e9-dome-basin`.**
- **`assets/contracts/null-floors.json` already held the answer**: `e9-dome-basin-01` →
  w2 / 82 600 ms / 0 gold / 34 kills. My idle probe reproduced **w2 / 82.600 s / 34 kills**, and my
  notebook's generation-58 memory of this map says the same to the decimal. The rules did not move.
- `twist` declares **only** `clockTicks: 18000` and a two-entry roster — no `secureWave`, so the gate
  falls through to `Balance.run.secureWave` 20 (600 s), and no `persistentCanalChoices`, so
  `CanalChoiceSystem` is never armed.
- Roster flags: `feral_terraformer` **wrecker**, `buildingDamageScale 1.4`, `hpScale 1.7`;
  `claim_jump_prospect_drone` **thief**.
- **`endReason` literals in the headless sim are only `preserve_fell` and `vent_guttered`** — there is
  no claim-loss on this contract, so the claim at (0,12) is abandonable.
- **`claimGold()` returns 0 unless `holding.kind === 'stockpile'`** — with no stockpile standing there
  is literally nothing to steal. That priced the one open question my notebook has owed for three
  generations (gens 107/109/112): the cap-raiser is the *only* thing that arms this roster's thief.
  Declined. `goldStolen` finished at **0**.

## Outcome

**SECURED** — waves **20**, timeAlive **600.000 s**, gold **12**, calls **926**, kills 883,
`defaultedSecure: 1`, `defaultedPicks: 0`, outcome hash `fnv1a32:bba2de00`.

- Tape put forward: **`attempt-1-tape.json`** (declared in `gauntlet-outcome.json`'s `tape` field),
  tape header hash `fnv1a32:142981d1`.
- **3 sim runs** (idle probe, `tune-1`, `attempt-1`) · **1 scored attempt**. Stopped at the first
  SECURED outcome per the brief.
- **Receipt:** the assay instrument was control-tested first (the zero-order probe tape replayed to
  its own header `fnv1a32:a45ba9ac`), then the secured reel replayed to **`fnv1a32:142981d1`** — the
  tape header's hash, not the stdout outcome line's `fnv1a32:bba2de00`, which are different numbers by
  design — reproducing all four outcome fields and a `securedSnapshot` of
  `{waves 20, gold 12, timeAlive 600}`, which is exactly what the door's `score_mismatch` rule compares
  against the declared gold. The reel is deterministic; its only defect is its size.

**DOOR RISK — READ BEFORE SUBMITTING.** The reel passes two admission axes and breaches the third:

| axis | measured | ceiling | verdict |
|---|---|---|---|
| ticks | `durationTicks` 18 000, last accepted order at **17 999** | `maxTicks` 18 002 | pass |
| entries | 926 | `maxEntries` 3 601 | pass |
| **bytes** | **3 230 134** | **`maxTapeBytes` 1 938 784** | **FAIL — 1.67×** |

Computed from `runTapeEnvelopeForContract` itself, not from the charter's summary of it (the charter's
`16 KiB + maxEntries × 160` is the floor term only; the live function adds
`maxOrderEntries × (2400 − 160)`, here 601 × 2 240). Expect **`reel_too_large`**.

The *play* is not what breaches — the **submission rate** is. Once the harvest tail starts failing on
depleted seams the board emits a surprise view roughly every 1.5 s, and all 926 of them were answered
with a fresh 32-order array at ~3.5 KB. The cure is one clause and changes no order: answer a view
with a blank line (`gr-sim` records no entry) unless `pendingOffer` is live, a `BUILD` is emittable,
or ~4 s of sim time has passed since the last accepted array — ~340 entries, ~1.2 MB. I did not ride
it, because the brief stops the heat at the first SECURED outcome and this run is it.

## What the map asked

It asked me **nothing at all about E9 persistent tiles**, and the county's RESKIN measurement is right
— sharply so, because the engine *owns* the consumer and this contract declines it. `CanalChoiceSystem`
is live headless and gates the secure through `autoSecureWaveForRun`, with `CONTEXT_ACTION`
`redig`/`backfill` as public verbs, but it keys on `twist.persistentCanalChoices` and this manifest
declares only `clockTicks` and a roster. So the three canal stage-gates C1 (−28,34), C2 (−12,10),
C3 (4,−24) that the briefing tells me to defend, the feeder-canal rail through them, the ice quarry
and the height-four scarp are all `tileParams` scenery: the union of `now` keys across every view is
the canonical set — `blastReadyInMs · gold · hero · needsRider · orders · prospector · score · seams ·
threats · timers · wave · weapon · works` — with no `canalChoices`, no tile state, and **nothing that
persists across a wave**. `stablePrefix.mechanics.rules` carries two entries. There is no E9 verb and
nothing to steward; the whole contract is answered with epoch-1 grammar.

What it asks instead is one hard geometry question — *where can you build, relative to the body that
must live, and may that body leave?* — and after ADR-005 the answer is yes. All four `harvestAnchors`
((22,−28), (28,−22), (34,−28), (40,−22)) sit **inside** the `seed-rows-footing` build zone
(x 18..44, z −32..−18), and the claim is not a loss condition, so the hero walks 40 units off the
claim and the fort, the economy and the defended body collapse into one pocket: seam commute ~4–6 wu,
`goldPanned` 1 305. The fields that carried it were `now.works.entries`/`byKind`/`standing`/`wrecked`,
`now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned` and `goldStolen`,
`now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, and `now.orders[].status/reason`.
Orders: `MOVE_HERO`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, and one silence.

**Does it still play the way my notebook remembers? Yes, in every particular I checked** — and on an
era named *the Re-surveyed Claims* that is itself the result. Generations 32, 40 and 58 failed here
and generation 79 secured it; the claim at (0,12), the 28.28 wu subtraction to the nearest build
ground, the four anchors, the pinned seam set, the 60-enemy cap and the w2/82.600 s idle floor all
reproduced to the decimal. The map is **not** named as cured this week, and its first minute
confirmed it: the hero walked to (28,−25), the first pan landed at t ≈ 12, the first turret went up
around t ≈ 35, and nothing threatening arrived until wave 2.

## Winnability

Secured, and the margin was **wide on survival and nil on the score**: the hero never fell below
**96.8 %** of its running maximum (finishing 169.4/175) and the pocket held `threats.alive` in the
40–58 band for the last six waves — while the banked purse is **12**, because the aggressive mend that
*is* the defence on this board spends the purse continuously, and the run that banks gold instead
(`tune-1`, identical but for that one clause) **died at wave 18** with 197 gold in hand and 22 of 24
works wrecked. On this contract gold and survival are the same lever pointed in opposite directions,
and only one of them secures.

## Lessons for my notebook

- **`byKind` counts WRECKED works, so on a board with a wrecker the ladder is permanently satisfied and
  `REPAIR_UNDER` is the only thing that re-arms the fort.** `tune-1` finished with
  `byKind {turret 4, sentry_beacon 6, palisade 14}` and `standing 0, wrecked 24`. My ladder correctly
  declined to rebuild (a wrecked frame still occupies its ground), which is right — and it means the
  mend is not a maintenance order, it is **the entire defence**. Check whether `byKind` is
  standing-only before deciding what your ladder is for.
- **At the cap, income is already being refused, so spending is FREE — and a score gate that does not
  know this will kill the run.** `tune-1`'s `nearCap` mend-suppression clause (my own generation-102
  lesson, written to protect the last gold on a comfortable board) fired *permanently* from t = 365,
  because the purse simply sits at the cap on this map. `pan` froze at 1 040 and `gold` pinned at 197
  for 200 seconds while the fort went 24 → 2 standing. **One cause, one fix, one measurement:** w18 →
  **w20**, peak wrecked 24 (all 24 works) → 17, pan 1 040 → 1 305, hero 141/175-and-falling → 169.4/175.
  This is the third time (gens 110, 111, 113) a score-protecting gate has made the fort unreachable
  exactly when it was needed. **Give any spend gate a hard bypass on `pinned || wrecked > 0`.**
- **`gold` pinned beside a frozen `goldPanned` is now the twelfth generation of the same diagnostic —
  and this ride adds a fourth reading of it.** The known three are dead sink, starved economy and
  attrition drain. The new one is **a suppressed mend**: pan flat *and* gold flat *and* `standing`
  falling. Log `standing` next to the economy pair; the three columns together name the cause in one
  read, and they did here on the first look.
- **Price the cap-raiser by finding the line that arms the thief, not by estimating theft.**
  `claimGold()` returns 0 unless `holding.kind === 'stockpile'`, so on this roster a stockpile is not
  merely risky — it is the *sole* switch that turns every `claim_jump_prospect_drone` from a
  hero-chaser into a gold-grabber. Declining it made `goldStolen: 0` a certainty rather than a hope.
  That closes the "buy the pair late" question I have owed the notebook since generation 107 for the
  mixed-roster case: on a map whose defence is a continuous repair bill, there is no late window in
  which the raised cap can be filled faster than the mend drains it.
- **Measure the envelope from `runTapeEnvelopeForContract`, and measure all three axes — the two that
  pass are not the answer.** Ticks and entries cleared comfortably (17 999 < 18 000 ≤ 18 002; 926 ≤
  3 601) and **bytes breached at 1.67×**. Sixth generation to say read the function not the charter,
  and the first where I read it correctly and *still* shipped a breach, because I budgeted the axes I
  had lost reels to before and never budgeted the one I had not.
- **A surprise-view storm is a byte budget, not a free decision-point windfall.** Generation 2's "an
  order that fails honestly buys a decision point" is true and it is no longer free: 926 views × a
  32-order array is 3.2 MB. The submission floor (blank-line unless an offer is live, a build is
  emittable, or ~4 s has passed) costs nothing in play and two-thirds of the bytes. **Put the floor in
  the FIRST controller on any contract whose tail is designed to fail.**
- **Ride the skeleton first, then change exactly one CAUSE — and it paid again.** `tune-1` was the
  unmodified generation-6→112 skeleton retargeted; the per-view table named a single cause on the
  first read; `attempt-1` changed that one clause and the diff is a measurement rather than a guess.
  Two rides, one scored, secured.
- **An era named for rebuilt maps can leave a map's rules untouched, and `null-floors.json` proves it
  before you ride.** Eleventh heat running. The procedure is now three files and four minutes: grep
  the era pins for the contract id, read the contract JSON's `twist`, and compare `null-floors.json`
  against the notebook's remembered floor. It redirected this whole heat from geometry to the economy.
