# e5-deepwater-claim — heat 14, generation 114

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
era 6 "the Re-surveyed Claims" · engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`
seed `e5-deepwater-claim-01`, trail

## How the ride went

Two runs: a ten-second idle probe and one controller. The reading budget went to the era pins as a
per-contract diff, the contract JSON, the boss system read end to end, and the secure gate; the
riding budget went to the skeleton plus the one thing this board does differently.

**The idle probe reproduced my notebook exactly** — w18 / 416.000 s / 0 gold / 0 kills /
`wave-ceiling`, against generation 19's "the idle probe reached w18 unsecured" on era 5. Hero
untouched at the claim for 392 seconds with `alive` pinned at 9, boss stuck in act 1 for the whole
run (`act2Locked: true`, 160 claw cycles, 80 repositions). An orderless hero here cannot die and
cannot win, because the objective is a kill it never attempts.

The controller secured on its first ride.

| | |
|---|---|
| act 1 (boss anchors) | t = 18.5 |
| act 2 unlocked (both paddles down) | t = 57.2 |
| act 3 — crew quits, boss beaten | **t = 69.6, wave 3** |
| secure banked at the wave-12 gate | t = 272.000 |
| act-2 swats that hit me | **0** |
| hero HP, minimum across all 24 views | **100/100 — zero damage all run** |

## Outcome

**SECURED** — waves **12**, timeAlive **272.000 s**, gold **200**, calls **22**, kills 4.
Runs: **2** (one idle probe, one controller). Scored attempts: **1**.

Tape put forward: `attempt-1-tape.json`, named in `gauntlet-outcome.json`'s `tape` field. It is a
byte-identical copy of `tune-1-tape.json` — **one ride under two filenames**. The first controller
secured and the stop rule ends the heat at the first SECURED outcome, so I stopped riding and
promoted the securing tune by name rather than re-riding for a tidier filename.

Envelope, measured off the first reel that existed: `durationTicks` 8160 with the last accepted
order at tick **7441** (719 ticks of slack), **22** entries against a 3601 cap, **60,203** bytes.
Comfortable on all three axes.

Receipt: the local assay reproduced the reel's own `fnv1a32:217967af` with
`securedSnapshot {waves 12, gold 200, timeAlive 272}` matching the declaration. That is the **tape
header's** hash, not the stdout outcome line's `fnv1a32:9be76ab1` — different numbers by design. I
control-tested the instrument on the zero-order idle probe first; it failed there ("tape ran out
with the run still alive"), which localises that failure to zero-order ceiling tapes rather than to
this reel.

## What the map asked

It asked me about **the storm as a schedule, and then about one boss's geometry** — and on the audit
question this contract genuinely **exercises** its era's signature mechanic, though not in the way
the ladder's phrase implies. E5's line is "storms schedule the waves", and here the storm *is* the
only wave clock: `deepwater_storm_track` declares `replacesScheduledWaves: true`, and
`currentRunWave()` reads `deepwater.diagnostics.corsairWaves` rather than the ordinary scheduler. So
the whole timetable is published in view 0 on a 24-second cycle, wave 12 lands at exactly
**272.000 s**, and the secure instant is a number I could compute before writing an order. What the
era's name does *not* buy is the adversarial half: `stormMovementMultiplier` 0.72 and
`stormVisibilityMultiplier` 0.58 are published and real, and on a map whose winning play is to stand
still they are inert — I paid the movement tax once, on the opening walk, and never again. Prediction
under weather, yes, in the sense that the weather is the clock. Adversarial weather, no.

The load-bearing reasoning was the **boss's structure**, and it is legible and genuinely spatial.
The Dredge-Queen zeroes `contactDamageScale`, `buildingDamageScale`, `supportBuildingDamageScale`
and `pursuitRange`, so it is a puzzle rather than a fight, and the fight is a two-stage arithmetic
problem: two paddles at 110 HP each unlock act 2 (`paddlesRequired: 2`), then the hold at 140 HP
ends it — **360 HP total, and the claw at 80 is optional because `advanceToAct2` recycles it for
you**. In act 1 the boss tours five wreck sites at speed 10 against a hero at 6.0, dwelling ~5 s and
repositioning every two claw cycles, so it is unchaseable; the answer is to compute the dwell rather
than the intercept and park on the ring. Once both paddles die the boss stops repositioning entirely
and the hold is a sitting target.

The one real hazard is the act-2 swat — 12 damage every 2.5 s in radius 5 — and it has a published
geometric exemption I used deliberately: `DredgeQueenBossSystem:315` fires only when
`dz = hero.z − anchor.z <= 0`, i.e. the southern half-disc. My post sat 5.3 units **north** of the
anchor, so the swat was exempt by construction: **`swats: 0` across the whole run**, and the hero
finished having taken zero damage. The same 5-unit offset also clears the range-zero volley deadlock
and keeps every component inside the rig's range 10.

The fields that carried it were `now.deepwater.dredgeQueenBoss` (`act`, `act2Locked`, `anchor`,
`livePaddles`, `clawCycles`, `repositions`, `crewQuit`), `now.deepwater.storm`, `now.seams[]`
(`active`/`x`/`z`/`anchorIndex`), `now.gold` against `now.score.goldPanned` and `goldReclaimed`,
`now.hero.x/z/hp`, and `now.orders[].status/reason` — which is the field that diagnosed the whole
economy. The orders were `MOVE_HERO`, `HARVEST`, `BLAST_AT`, `BUILD` and one blank line. **I used no
E5 verb.** `BOAT_BUILD` and `REANCHOR` exist and are real, and I declined both: the arsenal tops out
at range 14 while the boat's two anchors (0,30) and (−24,12) sit 40+ units from every wreck site, so
the Claim-Boat cannot reach the fight.

**Does my notebook remember this map, and does it still play that way?** Generation 19 secured this
exact seed on era 5, and the answer is that **its geometry held to the unit and its central
architectural clause is dead**. Reproduced exactly: the same 5 wreck sites doubling as seams and the
boss's anchor ring, the same wave-12 secure at 272.000 s, the same w18 idle ceiling, the same
360 HP of components, the same 40-gold loot spill. What moved is the body that shoots. Generation 19
wrote that on a deepwater map `heroShooter.getPos` was a ternary putting the gun on the Prospector
while the hero stayed welded to the stake as a damage sink. **That ternary is gone** — both shooters
now read `this.hero.group.position` unconditionally (`:632`, `:644`), which is ADR-005's parity
ruling. The gun and the steerable body are now the same body, so the retired `HOLD` at (0,−17)
becomes a `MOVE_HERO` to the same coordinate and the plan gets *simpler*, not harder. This contract
is **not** named as cured this week: era 6's pins name the Trestle and the Incline (pin #4) and the
sprite runtime and boss models (pins #3 and #6, both render-side, "the sim is untouched"). Its first
minute did what it has always done — the hero walked 47 units south, the first pan landed at t ≈ 12,
and the boss anchored at t = 18.5.

## Winnability

Secured, and the margin was **enormous on survival and exactly at the ceiling on the ranked axis**:
the hero took **zero damage across all 24 views** (100/100 throughout, `swats: 0`, peak
`threats.alive` 10), the boss was beaten at wave 3 with nine waves of slack against the wave-12
gate, and the banked purse of **200 is the arithmetic maximum this contract can publish** —
`Balance.economy.bankCap` is 200, the only cap-raiser is `stockpile`, `economy.addCapSource()` is
called **only** from `BuildSystem`'s placement path, and this map's single published build zone
(`claim-boat-deck-mask`) refused all six coordinates I tried with `UNREACHABLE: BUILD target is
outside buildable terrain`, leaving `works.byKind` empty for the whole run. `goldPanned` 160 plus
`goldReclaimed` 40 is 200 exactly, and from t = 69.63 every `HARVEST` answered `FAILED` with
`goldPanned` frozen for the last 202 seconds — the cap switching the economy off, measured live.

## Lessons for my notebook

- **Generation 19's central clause on this map is DEAD, and the grammar ruling is what killed it.**
  It wrote "on a deepwater map the gun rides the worker — `heroShooter.getPos = deepwater ?
  prospector.position : hero.group.position`" and told me to re-read `getPos` on every new era. I
  did, and the ternary is **gone**: both shooters now read `this.hero.group.position`
  unconditionally. The gun and the body `MOVE_HERO` steers are the same body, so the retired `HOLD`
  at (0,−17) becomes a `MOVE_HERO` to the identical coordinate and the contract gets *simpler*.
  Taking my predecessor's own instruction literally — re-read the line, do not inherit the
  conclusion — is what made this a first-ride secure.
- **A boss with a published damage rule usually has a published exemption; find the inequality
  before you choose a coordinate.** The act-2 swat is 12 damage every 2.5 s in radius 5 and it fires
  only where `dz = hero.z − anchor.z <= 0` (`DredgeQueenBossSystem:315`) — the southern half-disc.
  Posting 5.3 units NORTH of the anchor made it exempt by geometry rather than by luck: `swats: 0`,
  zero damage taken. One `<=` decided the whole survival question, and the same offset also clears
  the range-zero volley deadlock and keeps the rig in range. **Read the damage rule's sign, not just
  its radius.**
- **Read what the act transition does FOR you before budgeting HP.** `advanceToAct2` recycles the
  claw itself (`:299`), so the 80-HP claw never has to be killed and the real bill is
  110 + 110 + 140 = **360**. My notebook has priced boss HP on five maps and this is the first time
  the engine handed a component back; the arithmetic that matters is what the gate *requires*, not
  what the roster *lists*.
- **A dredge_queen kill before the secure wave is RECORDED but does not secure** — one clause,
  `:2390`, keyed on this variant alone. The boss dies at wave 3 and the run then banks at the
  wave-12 boundary because `baronBeaten` is already true. That pins waves at 12 and `timeAlive` at
  272.000 s, which means **gold is the only free ranking axis** and the whole design question is the
  purse. Knowing that before writing an order is what made the economy the plan rather than an
  afterthought.
- **A published build zone is still not buildable ground — and this time it made a cap permanent.**
  Generation 21 learned this on the Flotilla; here the sole zone `claim-boat-deck-mask` refused all
  six coordinates with `outside buildable terrain`. Because `addCapSource` fires only from
  `BuildSystem`'s placement path, no boat pad can substitute, so **200 is the ceiling and not a
  margin I left behind**. The distinction is worth the care: a ceiling is a finding, a margin is a
  mistake, and reporting one as the other would mislead the next rider.
- **Cumulative gating can hide a coordinate from its own refusal.** My six build spots were gated
  `goldGte 60 × (owed − placed)`, so the FIRST spot sat at `gte 120` while gold was 90 — never
  actionable, therefore never refused, therefore never blacklisted, and it held a slot for 26
  seconds while the cheaper alternates burned through one per view. The anti-starvation gate and the
  refusal blacklist are both right and they interact: **a rung that cannot fire cannot teach you
  anything.** Probe placement with the CHEAPEST gate first, then let the cumulative gate order the
  real purchase.
- **`live.slice(0, 2)` silently collapses to one seam, and the tape shows it.** Six of my 22 arrays
  chained a single seam because only one was finite at that instant, and one array carried *no*
  harvest tail at all because every seam was inactive — the array became two BUILDs and the economy
  stopped. My `Number.isFinite` filter correctly refused the published `null` coordinates, but a
  filter that can return empty still needs a floor: **when no seam is live, name the nearest ANCHOR
  anyway so the failing order parks the worker where the gold will come back.**
- **Control-test the assay before believing OR fearing it — and the control failing is itself
  information.** The instrument failed on the zero-order idle probe ("tape ran out with the run still
  alive") and then verified the securing reel cleanly. Running the thing that cannot be wrong first
  is what turned "my instrument is broken" into "that failure belongs to ceiling tapes", in one
  command.
- **Obey the stop rule and promote by name.** The first controller secured, so I stopped, copied the
  tape to `attempt-1-tape.json`, named it in the outcome file's `tape` field and said plainly that
  the two filenames are one ride. Fifteenth heat in a row where riding the skeleton unmodified and
  spending the budget on *reading* secured on ride one; the cure keeps turning out to be reading,
  not riding.
