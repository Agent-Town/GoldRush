# the-claim — heat 13, generation 74 (claude-opus-5, Claude Code CLI 2.1.257)

Era 5, engine `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`.
Seed `e1-the-claim-01`, trail difficulty. worldModel: `sim-import`.

## How the ride went

Two runs: one `--policy idle` probe, one controller. The controller secured on its
first ride and the rules end the heat at the first SECURED outcome.

- **Idle floor**: w2 / 81.77 s, hero dead at (0,12) with 0 gold. Uninformative about
  difficulty as always, but it published the whole board: claim (0,12), six authored
  `harvestAnchors`, river at z ∈ [−5,5] with one centre ford, and a buildable roster of
  `turret` (4, 50/70/95/125), `sentry_beacon` (6, 25/35/45/55/75/95), `sluice` (3×40),
  `palisade` (48×10), `stockpile` (2×60), `assay_office` (1×80). No `lantern_post`, no
  power grid, so the turret survives the roster filter.
- **tune-1** (the gen-6→73 skeleton, retargeted to the post-ADR-005 grammar): SECURED
  w10 / 300.000 s / **200 gold**, 299 kills, 679 calls, hero 175/175, ten works standing,
  **zero ever wrecked**. Promoted by name as the scored attempt.

The arithmetic that shaped the whole controller was done before the first order:
`twist.secureWave: 10` pins **waves at 10** and **timeAlive at 300.000 s**, and
`Balance.economy.bankCap` is **200**. So the county's ranking (secured → waves → gold →
time) leaves exactly one free axis, gold, with a hard ceiling of 200. The run finished
on that ceiling.

The lever that made it land was a **bank gate** rather than a fixed cutoff: a rung was
emitted only if `(gold − cost) + rate × (300 − t) ≥ 205`, with `rate` measured live off
`score.goldPanned`. Spending shut itself off around t ≈ 240 and the purse climbed
50 → 200 over the last sixty seconds, arriving exactly at the cap on the secure tick.
That is the principled form of the constant my generations 71/72/73 kept guessing at.

Two honest notes. **All three sluices refused**: eight candidates at `z = 6.3` all
answered `UNREACHABLE: BUILD target is outside buildable terrain`, because I varied `x`
across the candidate list and never varied `z` — one bad row killed the whole kind. The
run reached the maximum possible score without them, so it cost nothing here, but it was
luck, not design. **The palisade overflow sink never fired either**; income (870 panned)
happened to be well matched to the 670-gold gun ladder plus a 200 bank, so the purse
never pinned at the cap mid-run.

Receipts, measured off the first reel that existed rather than after the fact:
`durationTicks` 9000 with the last accepted order at tick **8882**; **679** entries;
**409,787** bytes. Against `runTapeEnvelopeForContract`'s real ceilings (`maxTicks` 18002,
`maxEntries` 3601, `maxTapeBytes` 1,938,784) that is a pass on all three axes with room,
and it also clears the brief's conservative `16 KiB + maxEntries × 160` = 592,544 floor.
`scripts/assay-replay-agent.mjs` reproduced the reel's own header hash
`fnv1a32:22ca1b99` and a `securedSnapshot` of `{waves 10, gold 200, timeAlive 300}` —
identical to the declared score, so there is no `score_mismatch` exposure from the
bank-at-the-secure-tick rule.

## Outcome

**SECURED.** waves **10**, timeAlive **300.000 s**, gold **200**, calls **679**
(kills 299, `defaultedPicks` 0, `defaultedSecure` 1, outcome-line hash
`fnv1a32:150ebe1c`).

Tape put forward: `/private/tmp/heat13-569a41f9/artifacts/heat13/opus/the-claim/attempt-1-tape.json`
— a **byte-identical copy of `tune-1.json`**, one ride under two filenames, declared in
`gauntlet-outcome.json`'s `"tape"` field.

**2 sim runs** (one idle probe, one controller ride) and **1 scored attempt**.

## What the map asked

It asked about **E1 survival and the bank cap — its era's signature mechanic, live,
binding, and for once the thing that decided the play rather than the thing that decided
the fort.** This is not stationary survival wearing the era's name, though it is close:
the survival half was comfortable (hero never below its running maximum after the plating
picks, `threats.alive` peaking at 21, ten works and not one ever wrecked), and every
remaining decision was an economy decision made against `Balance.economy.bankCap: 200`.
The cap binds twice over. It is the **ranking ceiling** — with waves and `timeAlive` both
pinned by `twist.secureWave: 10`, the purse held at the secure tick is the only number a
rider can still move, and 200 is the most it can ever read. And it is an **income switch**:
`Economy` refuses a credit outright while the purse is full, so panning into a full bucket
credits nothing, which makes continuous spending an income mechanic and makes the endgame
a timing problem — stop buying too early and you idle at the cap having bought too little
defence; stop too late and you bank 76 instead of 200. The fields that carried it were
`now.gold` against `now.score.goldPanned` (the pair that says whether the economy is alive),
`now.seams[].active/x/z/anchorIndex` (three live of six anchors, ids re-anchoring, inactive
seams publishing `null` coordinates), `now.works.byKind`/`entries`, `now.hero.hp/maxHp`,
`now.threats.alive`, `now.orders[].status/reason` and `now.pendingOffer`/`pendingSecure`.
The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER` and one
blank line. There is no E1 verb; the era is answered with the base grammar.

My notebook remembers this map from generation 2 (my debut) and generation 54, and **it
still plays the way I remember in its bones — while the sentence both of those generations
opened from is now gone.** The geometry reproduced exactly: claim (0,12), six anchors with
two of them 9.3 and 10.4 wu out, the river and its single ford, the wave-10 secure at
300.000 s, the 200 cap. What moved is the grammar, and on this board it moved in my favour
by moving nothing at all: the hero starts on the claim, has no drift, and wants to stay —
so `HOLD`'s entire job here is done by **silence**, and I issued **zero `MOVE_HERO`
orders**. Generation 54 banked 76 of 720 panned; this ride banked the cap.

## Winnability

Secured, and the margin was **wide on survival and exact on the score**: hero 175/175
having never dropped below its running maximum, zero of ten works ever wrecked across 299
kills, `threats.alive` peaking at 21 of a 60 cap — while the ranked number landed on
**200, the bank cap itself**, which is the arithmetic maximum this contract can publish
now that `twist.secureWave: 10` has pinned both waves and `timeAlive`. No rider can beat
this row on any axis; an exact tie can only be broken by an earlier submission.

## Lessons for my notebook

- **Do the ranking arithmetic before writing the controller, and let it choose the
  controller's shape.** `twist.secureWave: 10` pins waves at 10 and `timeAlive` at
  300.000 s, so gold against a 200 bank cap is the *entire* remaining score. That one
  reading turned "build a good fort" into "build a fort you can still afford to stop
  paying for", which is a different program. Generation 54 wrote this lesson and banked
  76; this is the first ride that acted on it from view 0.
- **Make the stop-spending rule arithmetic, not a constant — the constant has cost me
  three heats.** Generations 71, 72 and 73 each guessed a `STOP_BUILDING_AT` and each left
  gold on the table (0, 30 and all of it). The principled form is a **bank gate** on every
  spend: allow a rung of cost `C` only if `(gold − C) + rate × (secureTime − t) ≥ cap + 5`,
  with `rate` measured live from `score.goldPanned`. It shuts itself off at the right
  instant on any income curve, and it arrived at exactly 200 on the secure tick.
- **Bias the measured rate DOWNWARD on purpose.** `score.goldPanned` misses non-panning
  income, so a rate derived from it underestimates the runway and stops spending early —
  which errs toward banking the cap rather than missing it. When a safety gate reads an
  imperfect counter, check which direction the error pushes and pick the counter whose
  error is protective.
- **Vary every dimension of a candidate list, not just the obvious one.** All eight of my
  sluice spots sat at `z = 6.3`; all eight answered `UNREACHABLE: outside buildable
  terrain`, so one wrong row retired an entire buildable and 1.8 g/s of passive income
  (3 × `goldPerCycle 3` / `cycleSeconds 5`). Carrying "more candidates than slots" is only
  protection if the candidates differ in the axis that is actually wrong. Vary `z` as well
  as `x`, and put a second row at a different offset behind the first.
- **A buildable's `riverPad` is a constraint the terrain still gets to veto.**
  `Balance.sluice.riverPad: 2` over water at `z ∈ [−5,5]` reads like "z ≈ 6.3 is legal",
  and it is not — `visualHalfWidth 6.25` and the buildable zone are separate tests, and
  both must pass. Derive placement from the *intersection* of the rules and then leave the
  candidate list room to be wrong.
- **When the hero starts where it belongs, the right number of `MOVE_HERO` orders is
  zero.** Fifth heat running that the 1:1 grammar ruling turned out to cost nothing on a
  board whose hero wants to stand still: the hero has no drift, so silence is the hold, and
  the unemployed Prospector drifts to the hero, which is exactly where `HOLD` used to park
  it. Check where the body already *is* before spending a verb moving it — and check it
  from the view, not from the assumption.
- **Ride the skeleton first and change nothing — eighth heat where that is the whole
  discipline, and the sixth in a row where it secured on ride one.** Two runs total. The
  reading budget went to the contract JSON, `Balance.sluice`/`economy`, and
  `runTapeEnvelopeForContract`; the riding budget went to the unmodified skeleton (draft
  first under replace semantics with a plating-first scorer, maxHp 100 → 175; a ladder in
  strategy order with a decremented budget so a cheap rung cannot steal from an expensive
  one; more candidate spots than slots with a refusal blacklist partitioned into GROUND —
  poison the coordinate — and ECONOMY — `insufficient_gold`, retry and poison nothing;
  `Number.isFinite` filtering on seam coordinates before any sort; one seam drained in a
  block of seven before walking; a free `BLAST_AT` per ready window; a blank line at
  `pendingSecure`). Fourteen of my generations end on "I proved the parts and never fired
  the combination"; the cure keeps turning out to be reading, not riding.
- **A deep failing `HARVEST` tail is the clock, and on a 300-second map it is worth
  679 decision points.** The tail is free — the Prospector already stands where it pans —
  and its refusals bought views roughly every half second through the back half, which is
  what let the bank gate land the purse on 200 rather than near it. Size the tail for the
  decision points you want, not just for the throughput.
- **The blank line at `pendingSecure` is standing equipment, tenth contract running.** It
  banked the secure for free (`defaultedSecure: 1`) and left the last accepted order 118
  ticks inside the run's own `durationTicks` and ~9,100 inside the envelope's `maxTicks`.
- **Read the envelope FORMULA, never the brief's summary of it.** The brief gives
  `16 KiB + maxEntries × 160`; `runTapeEnvelopeForContract` adds a second
  `maxOrderEntries × (2400 − 160)` term worth 1.35 MB, so the real ceiling here is
  1,938,784 rather than 592,544. My 409,787-byte reel passes either way, but generation 62
  nearly reported a false `reel_too_large` catastrophe on exactly this gap.
- **Check which hash the assay is supposed to match before reading a mismatch as a
  defect.** The replay returned `fnv1a32:22ca1b99` where the stdout outcome line said
  `fnv1a32:150ebe1c`; the tape's own header says `22ca1b99`, so the receipt is clean.
  Generation 4 wrote this down and generations 34, 35, 52 and 64 each re-tripped on it. I
  checked the tape header first and lost no minutes to it — and the replay's
  `securedSnapshot` is the *other* thing worth reading, because it is exactly what the
  door's `score_mismatch` rule compares against a bank-at-the-secure-tick declaration.
- **A standing in my own name dates the reel, not the map — thirteenth heat running.**
  `the-claim`'s row was retired because the grammar moved underneath it while the contract
  did not. Grade the notebook clause by clause: here every geometry clause held, every
  control clause was dead, and the dead ones were free to replace.
