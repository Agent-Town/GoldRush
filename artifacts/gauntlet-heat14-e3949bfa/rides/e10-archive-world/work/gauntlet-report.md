# e10-archive-world — generation 133, heat 14 (era 6, `540b49af…`, build `e3949bfad`)

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
seed `e10-archive-world-01`, trail difficulty.

## Pre-ride reading (four minutes, and it produced the whole plan)

- **`null-floors.json` first.** It published `e10-archive-world-01` as
  `w2 / 80967 ms / 0 gold / 35 kills / fnv1a32:cb3e3f9d`. The ten-second idle probe reproduced
  that **to the hash**, so on an era named *the Re-surveyed Claims* the rules on this map had
  not moved and the whole budget could go to the objective and the economy.
- **Era pins as a per-contract diff.** Grepping all eight pins for `archive-world` returns
  **zero** matches: pin #4 names `e2-trestle`/`e2-incline`, #3 the sprite runtime, #6/#7 the
  boss models and sprite roster, #8 the town cast and the Picnic stand-down. This contract is
  not on the cured list this week. (F-MAPL-5 is real and visible: the manifest carries
  `twist.secureWave: 12` and no `twist.clockTicks`, and I read the clock off `now.squall`.)
- **The era systems end to end** (`E10SquallScheduler` 358 lines, `E10ArchiveSystem` 135) plus
  the one call site that joins them (`HeadlessContractSim.ts:2062`). That is where the contract
  actually lives, and it handed me the plan before I wrote an order.

## Outcome

**SECURED** — `waves 12 · timeMs 360000 (360.000 s) · gold 200 · kills 416 · calls 57`,
`defaultedPicks 0`, `defaultedSecure 1`.

- Tape put forward: **`attempt-1-tape.json`**, declared in `gauntlet-outcome.json`'s `tape`
  field. It is a **byte-identical copy of `tune-1-tape.json` (215,657 bytes, verified equal)** —
  **one ride under two filenames.** The first controller secured and the stop rule ends the heat
  there.
- **2 sim runs** (one `--policy idle` probe, one controller) · **1 scored attempt**.
- Envelope, measured from `runTapeEnvelopeForContract` rather than the charter's summary:
  `maxTicks 18002`, `maxEntries 3601`, `maxTapeBytes` **1,938,784**
  (= 16384 + 3601×160 + 601×2240). Mine: `durationTicks 10800`, last accepted order at tick
  **10271** (529 inside), **57** entries, **215,657** bytes — 1.6 % of the entry axis and 11.1 %
  of the byte axis.
- Receipt: the zero-order probe was replayed first as a control and matched its own header
  (`fnv1a32:a45ba9ac`); only then did the scored reel's replay mean anything. It reproduced the
  **tape header's** `fnv1a32:3c90f43d` and all four outcome fields, with
  `securedSnapshot {waves 12, gold 200, timeAlive 360}` — exactly what the door's
  `score_mismatch` rule compares against the declared gold, and it agrees.
  (The stdout outcome line's `fnv1a32:d05bd4b5` is a different number by design.)

## What the map asked

It asked for its era's signature mechanic — **E10 preserve, don't extract: a flipped objective
over a trained habit** — and the flip here is *keeping a light on* rather than taking anything,
with the extraction economy demoted to the thing that pays for the light. This is not stationary
survival wearing E10's name: `E10ArchiveSystem.objectiveAllowsSecure` is `completedHolds > 0`
and `HeadlessContractSim.ts:1521` ANDs it into the secure at every wave, so **no wave count
secures this claim until a wing has been re-inked.**

The view publishes the entire law, so a rider with no source import can play it. `now.squall`
carries `phase`, `cycle`, `phaseProgress`, `secondsToNextPhase`, `secondsToNextSquall`,
`squallsStarted`/`squallsCompleted` and the full `transitions` log; `now.archive` carries
`holdingWingId`, `completedHolds`, `restoredWingIds` and `objectiveAllowsSecure`; and
`stablePrefix.mechanics.rules` states the hold verbatim — *"Keep a living, powered sentry beacon
within the next light site radius throughout telegraph and squall. An interruption retries next
cycle"* — beside the cadence (`60/8/25/8`, `cycleSeconds 101`) and the pressure rule (*"During
squalls Static Motes steer toward lit sites; Unraveled Memories pursue the Prospector"*).

The reasoning it wants is a **schedule against a geometry**, and both halves are real:

- **The schedule.** Telegraph opens at t = 60, 161, 262, 363 and a hold takes 8 + 25 = 33 s of
  unbroken light, latching on the squall→recover edge. Wave 12 lands at t = 360, so there are
  exactly **three** chances and the first is free. My beacon stood at **t = 19.17**,
  `holdingWingId: west-stacks-wing` latched at **t = 60.03** — the telegraph tick itself — and
  `completedHolds` was 1 by the next view. 41 seconds of slack on the only irreversible clock.
- **The geometry, which is where the contract nearly refused me.** `litSiteIds` is
  `build.hasPoweredBeaconWithin(site.x, site.z, 4)`, so the whole objective is one 25-gold
  `sentry_beacon` inside a radius-4 disc at (-28, -6). **Eleven of my twelve candidates in that
  disc answered `UNREACHABLE: BUILD target is outside buildable terrain`** — every one at
  z ≤ −4, including the stake's own centre — and the twelfth, **(-28, -3)**, landed. The
  declared `west-stacks-wing` zone is z −30…18; the ground actually accepts the beacon only from
  z ≈ −3. Against a disc that reaches z ≤ −2, the legal band is about **two units deep**. Carrying
  more candidates than slots and varying *both* axes is the only reason this ride has a receipt.

Two honest qualifiers. First, the era's ask is **cheap and front-loaded**: 25 gold and one build
trip in the first twenty seconds of a 360-second contract, after which the mechanic never asks
again (a lit beacon cannot be put out here — see below). Second, the pressure half was a **gift
rather than a cost**: `pressureTarget` steers every `static_mote` at the lit site during a
squall, and my beacon sat 54 units north of the hero, so for 25 seconds of every 101-second
cycle the mote population walked *away* from the body that had to survive. Everything else was
ordinary stationary survival in the entry-hall pocket — carried by `now.works.byKind`/`entries`,
`now.seams[].active/x/z/anchorIndex` (an inactive seam publishes all three as `null`, and one
non-finite number refuses the whole array silently), `now.gold` against `score.goldPanned` and
`goldStolen`, `now.hero.hp/maxHp`, `now.threats.alive/wreckers/thieves` and
`now.orders[].status/reason`. Orders used: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, and
one blank line. **There is no E10 verb**; `mechanics.interactables` is empty and the era is
answered with the base grammar.

My notebook has no prior generation on this map (generation 120 rode `e10-ember-shore`, which
shares the squall scheduler but runs a *warmth* mechanic and a `stoke` verb; generation 121 rode
`e10-last-claim`, a different preserve mechanic with a damageable vent). The contract is not
named as cured this week, but for the record its first minute did this: the hero stood where it
landed at (0, −52), the Prospector panned the entry-hall seams, the objective beacon went up at
t = 19.17, the first turret at t = 75, and the telegraph at t = 60 found the light already on.

## Winnability

Secured, and the margin was **enormous on survival, thin on one coordinate, and openly left on
the table where it scores**: the hero never fell below **68 %** of its running maximum (68/100 at
t = 42, before the plating picks; finishing **143/175 at level 18**), **0 of 7 works was ever
wrecked** and `goldStolen` finished at **0** across 416 kills — because neither roster entry
declares `wrecker` or `thief` — while the objective latched 300 seconds before the gate. The
genuinely thin thing was the objective's *ground*: eleven of twelve candidate coordinates inside
the light disc are unbuildable, and a rider offering only the stake's own centre would report
this contract unwinnable. The ranked number, **200 of a 200 default cap**, is the margin I left
behind and I can name it to the second: the purse pinned at 200 at **t ≈ 312** and
`score.goldPanned` froze at **645** for the last 48 seconds, because the two `stockpile` rungs
(60 g each, +150 cap, safe on a thief-free roster) were emitted **once**, at t = 265.7, **both at
the same coordinate (-2,-53)** — my spot chooser reads standing works and does not reserve a spot
already chosen *in the same array* — and were then wiped 4.3 seconds later by my own
`t > secure − 90` hard build floor, before the Prospector could walk the 28 units to place the
first one. A stockpile landing at t ≈ 250 lifts the ceiling to 350 and turns the frozen tail into
roughly 250–300 banked on an identical secure.

## Lessons for my notebook

- **`null-floors.json` first, then grep the era pins for the contract id — eleventh heat running,
  and it has never once been wrong.** One file published this seed's losing floor before I ran
  anything and the ten-second probe reproduced it to the hash, which simultaneously proved the
  rules had not moved, verified the instrument, and freed the entire reading budget for the two
  things that decide the map. Four minutes, and it is the cheapest document in the county.
- **A published build zone is not buildable ground, and on an objective disc that can be the
  whole contract.** `west-stacks-wing` is declared z −30…18 and refuses every coordinate at
  z ≤ −4, including the light stake's own centre; the radius-4 disc's legal band is about two
  units deep at z ∈ [−3, −2]. Eleven `UNREACHABLE` refusals fired in **0.4 seconds** (t = 4.33 →
  4.70, a refusal yields the tick) and the twelfth landed. Generation 21 learned that a declared
  zone can be refused by terrain and generation 98 learned to vary **both** axes; **generation
  133 adds the case where the refused ground is the OBJECTIVE, so the candidate ladder is not
  insurance — it is the only thing standing between a first secure and a "not winnable" report.
  Offer ten-plus candidates spanning the disc's full extent in x AND z before concluding a
  site cannot be lit.**
- **Reserve a spot in-array, not just against standing works.** My chooser skips coordinates
  within 1.7 of an existing `works.entries` position, which is correct and insufficient: two rungs
  emitted in the SAME array both picked `(-2,-53)`, so the second was a guaranteed collision.
  Track the spots chosen this tick as well as the ones already built.
- **A hard build floor must never cancel a build already IN FLIGHT.** A `BUILD` implies travel;
  mine was emitted at t = 265.7 with the Prospector 28 units away (≈6 s of walking) and my
  `t > secure − 90` floor replaced the array at t = 270 with one that carried no build. Four
  point three seconds of a six-second errand. Generations 110, 111, 113, 128 and 131 all record a
  score-protecting gate making the fort unreachable exactly when it was needed; **this is the same
  family's sixth face — once a BUILD is emitted, keep re-emitting it until `works.byKind` shows it
  standing or the view shows it refused, regardless of any clock.**
- **A cumulative gate and a late floor interact, and the interaction is invisible in either one.**
  The stockpile sat `pending` from t = 170 to t = 207 gated at `goldGte 185` (its own 60 stacked
  behind a 125-gold turret ahead of it in the same array), then never became the head rung until
  t = 265 — by which time the floor was 4.3 seconds away. Anti-starvation gating is right; it just
  means a rung's *effective* first-fireable moment is much later than its price suggests. Compute
  that moment before deciding where the spend floor goes.
- **Read the pressure rule for who it steers and where.** `pressureTarget` returns a site only
  for `static_mote` and only while a squall blows, so lighting the objective 54 units from the
  hero converts 25 % of every cycle into a board that walks away from the body that must live.
  I priced the lit site as a cost and it was a gift. **On any map that steers enemies at a thing
  you choose to place, the placement is a crowd-control decision as well as an objective one.**
- **Read the roster for what it OMITS — fifteenth contract running, and here it decided the
  shape.** `static_mote` and `unraveled_machine` appear in no `Balance` table and declare neither
  `wrecker` nor `thief` on THIS contract (the same two ids DO declare `wrecker: true` on
  `e10-last-claim`, one file away). So: works cannot be attacked, gold cannot be stolen, a lit
  beacon can never be put out, `REPAIR_UNDER` and palisade bait are dead weight, and the
  cap-raising stockpile is safe rather than the 435-gold trap generation 106 measured on a thief
  roster. Compare the roster against its siblings, not against the epoch.
- **Ride the skeleton first and change nothing — twenty-seventh heat where that is the whole
  discipline, and the twenty-second in a row where it secured on ride one.** Two runs total: the
  reading budget went to the null floor, the era pins, the contract JSON and two era systems read
  end to end; the riding budget went to the unmodified generation-6→132 skeleton (draft first
  under replace semantics with a plating-then-heal scorer, maxHp 100 → 175; ONE ladder with ONE
  ordinal per id priced at `costs[standing]`; a rung with no candidates left RETIRED rather than
  stalling the rungs behind it; a refusal blacklist partitioned into GROUND and ECONOMY;
  `Number.isFinite` seam filtering; alternating blocks of six across the nearest live seams; a
  free `BLAST_AT` above the traveller; a blank line at `pendingSecure`) plus the one thing this
  board does differently. **The heat's real work is reading the contract, not riding it.**
- **Zero `MOVE_HERO` was correct and I checked rather than assumed — tenth heat running on a
  stationary-hero board.** `now` publishes no `gravity`, so movement is `normal`: the hero has no
  drift, silence is the hold, and the unemployed Prospector drifts to the hero — exactly where
  the retired `HOLD` used to park it. The hero sat at (0, −52) in all 59 views while the
  Prospector made the 54-unit objective trip on the `BUILD` order's own travel.
- **Silence at `pendingSecure` did its four jobs again, twenty-ninth contract running:** it took
  the `bank` default (`defaultedSecure: 1`), left the last accepted order 529 ticks inside
  `durationTicks`, held a 59-view run to 57 entries, and — the reason that matters most — **it
  cannot be rejected**, so the replay cannot diverge the way generation 84's nearly did when
  refused in-window submissions (invisible to the tape, visible to the sim) desynchronised a
  clean reel.
- **Obey the stop rule and promote by name.** The first controller secured, so I stopped: copied
  the tape, verified the two files byte-identical, named `attempt-1-tape.json` in the outcome
  file's `tape` field, said plainly there that they are one ride, and spent what was left on the
  envelope arithmetic, a control-tested assay and this report. **The gold I left behind is not a
  reason to break the rule — it is the finding, and it is named to the second above.**
