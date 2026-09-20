# e6-half-life-hollow — generation 118, heat 14 (era 6, "the Re-surveyed Claims")

rig `claude__opus-5` · model `claude-opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068` (build `abf2462ec`), seed `e6-half-life-hollow-01`, trail.

## How the heat was spent

Reading first, riding second — the discipline that has secured my last sixteen contracts on ride one.

1. **Era pins as a per-contract diff.** Grepped `assets/engine-era.json` for this contract: two hits, neither
   naming it (E4/E6 *story beats*, and an `e6-picnic` briefing-text change). This map is not on the cured list.
2. **`assets/contracts/null-floors.json`** published the remembered floor before I ran anything:
   `w17 / 521800 ms / 0 gold / 449 kills / fnv1a32:5e7517ff`.
3. **The contract JSON.** Thin twist: `clockTicks: 18000`, no `secureWave` (→ `Balance.run.secureWave` 20, a
   600-second ride), roster of three.
4. **`HollowCrossingSystem.ts`** (106 lines) end to end, and its call site.
5. **The roster flags** in `Balance.e6Roster`.
6. Only then: the runner, the idle probe, and one controller.

## The two facts that decided the ride

**The crossing is a HERO errand now.** `HeadlessContractSim.ts:2091` calls
`hollowCrossing.update(STEP, this.hero.group.position, 'hero')`, and the engine's own comment says why —
**F-RPG-3, cured 2026-09-07 (ADR-005)**: *"The crossing was walked by the PROSPECTOR here … so GR-SIM asked one
body where it stood and hurt another. The hero walks the crossing now, which is the body a human positions and
the body that pays."* My generation-24 entry rode this errand with `MOVE_TO` on the Prospector. That clause is
dead; every geometric clause in it held.

**No wrecker on the board.** `feral_toaster` and `lawn_shepherd` carry no flag; `glowjack` is `thief: true`.
Works cannot be attacked — which deleted `REPAIR_UNDER`, palisade bait and every decoy idea from the design —
and the thief flag made `stockpile` the trap, not the cap-raiser.

## The errand, computed before the first order

The three stages run **sequentially inside one `update()` call**, so the route is one draining array:

- `launch` → hero inside `south-launch-shelf` (x[−38,38], z[−54,−40]).
  I aimed **(0,−44)**, not the z = −40 edge: `MOVE_HERO` has a 0.5 arrival radius and a body resting at
  z = −39.97 fails `z <= −40`. Four units of margin against a knife-edge.
- `crossing` → hero inside a route. Walking north from (0,−44) to (0,44) at x = 0 traverses the entire
  `central-causeway` (x[−7,7], z[−40,40]), so the stage is guaranteed on the way back rather than gambled.
  The causeway is also the **radiation-free** route: the glow bridges at x[−34,−22] and x[22,34] deal
  `HOLLOW_GLOW_DAMAGE_PER_SECOND = 1`.
- `extraction` → within `HOLLOW_EXTRACTION_RADIUS` 6 of the stake (0,48). I aimed **(0,44)**, distance 4 —
  inside the tolerance and off the marker, because a marker is exactly the thing the world puts a model on.

Measured: **stage `complete` at t = 27.53, route `central-causeway`, `radiationDamageDealt: 0`** — the whole
errand in a single array, with no view needed in between, inside wave 0's quiet before the first enemy landed.

## Outcome

**SECURED — w20 / 600.000 s / 200 gold / 884 kills / 90 calls**, `defaultedPicks: 0`, `defaultedSecure: 1`.

- Runs: **2** (one idle probe, one controller). Scored attempts: **1**.
- Tape put forward: `attempt-1-tape.json` — a **byte-identical copy** of `tune-1-tape.json` (241,604 bytes,
  verified equal). One ride under two filenames: the first controller secured, so the stop rule ended the heat
  and the securing tune is promoted by name in `gauntlet-outcome.json`'s `tape` field.
- Envelope, measured on the first reel that existed: `durationTicks` 18,000 against `maxTicks` 18,002; last
  accepted order at tick **17,335** (665 ticks of slack); 90 entries; 241,604 bytes. All three axes clear.
- Receipt: control-tested. The zero-order probe replayed to its own header `fnv1a32:a45ba9ac` first, then the
  reel replayed to **`fnv1a32:27469c92`** — the tape header's hash, not the stdout outcome line's
  `fnv1a32:25b47509` — with `securedSnapshot {waves: 20, gold: 200, timeAlive: 600}`.

## What the map asked

It asked me about **decay and patience**, and E6's signature mechanic is load-bearing in the strictest sense
— but the sharper finding is that this map asks about decay **twice, in opposite directions**, and only one of
them is the objective.

The **first** is the ordinary E6 lever and it is the economy: a machine not struck for `windDownSeconds: 8`
*exhausts* — harmless, undamageable, crawling at 0.2×, and exempt from the alive cap, so the board piles up.
The idle probe is the proof and it is the loudest number on this contract: **449 kills and `gold: 0` across
521.8 seconds**, with machines exhausting in plain sight and no order collecting them. `now.atomic.wrangle`
publishes `captureRadius: 2.2` and the pen (`goldPerMachine: 1`, `tickSeconds: 15`), and `CAPTURE` — targetless,
free, taken at **the hero** — is the only converter. Every penned machine pays for the rest of the run, so it is
an opening move rather than a mid-game one. My pen reached **31 machines and granted 270 gold**.

The **second** is the one the idle probe asks without meaning to: the exhausted machines are also *armour*.
They are exempt from the cap precisely so they can accumulate, and they accumulate on the hero they were
walking toward. So `CAPTURE` is not a free lever — every machine banked is a body taken off your own shield —
and the honest reason my run could afford to bank them is that the fort held `threats.alive` at a peak of 35
against a 60 cap.

The **crossing**, by contrast, is not a decay question at all: it is a static, one-way geometry latch with no
clock on it, and it gates the secure at every wave (`objectiveAllowsSecure` ANDed in at
`HeadlessContractSim.ts:1472`). Cheap, front-loaded, discharged in the first 28 seconds — and unskippable.

Fields that carried the run: `now.hollowCrossing.stage/routeId/radiationDamageDealt` (the errand's whole state
machine), `now.atomic.wrangle.{active,pen}` and `now.atomic.exhausted` (the economy), `now.works.byKind`/
`entries`, `now.seams[].active/x/z/anchorIndex` (an **inactive seam publishes all three as `null`**, and one
non-finite number refuses the whole array silently), `now.gold` against `now.score.goldPanned` and
`goldStolen`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, `now.orders[].status/reason`.
Orders: **`MOVE_HERO`**, **`CAPTURE`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, and one blank line.
There is no E6 verb beyond `CAPTURE`.

**Does my notebook still describe this map?** Its geometry, exactly; its controls, not at all — and this map is
**not** named as cured this week, so the first-minute question answers itself from the floor. The idle probe
reproduced `null-floors.json` **byte for byte** (`w17 / 521800 ms / 0 gold / 449 kills / fnv1a32:5e7517ff`),
matching my generation-24 memory of "zero gold in 522 seconds" to the tenth of a second. The claim at (0,12),
the four build zones, the four harvest anchors, the causeway and both glow bridges, the wave-20 default and the
200 bank cap all reproduced. The era-6 re-survey moved this map's rendering, not its rules. What moved is the
body that walks the crossing — and that change paid, because the hero travels at 6.0 against the Prospector's
4.8, so the same errand that took generation 24 until t = 29.87 landed at **t = 27.53** while also leaving the
hero standing where I wanted it.

## The thing I would tell the next rider

The errand's terminus, a build zone and a live seam **coincide**. `north-extraction-shelf` (x[−28,28],
z[40,54]) contains the extraction stake *and* `gold-seam-1` at (24,47). So posting the hero at **(21,46)** —
inside the shelf, and at x < 22 deliberately, to stay clear of the east glow bridge's x-range — collapses the
fort, the economy and the defended body into one pocket at the point the errand already delivers you to.

That inverted this map's economy relative to my last ride on it. Generation 24 posted at the claim and farmed
the pen: 74 machines, 870 gold, `goldPanned` **0**. This run posted on a seam: `goldPanned` **600** plus 270 of
pen income, with only 31 machines penned. Same total, opposite shape — and the difference is one coordinate.

---

## Outcome

**SECURED.** w20 / timeAlive 600.000 s / gold 200 / 884 kills / **90 calls**. Tape put forward:
`attempt-1-tape.json` (byte-identical copy of `tune-1-tape.json`, promoted by name in `gauntlet-outcome.json`'s
`tape` field). **2 sim runs** (one idle probe, one controller); **1 scored attempt**. Assay control-tested and
clean: reel replays to its tape header `fnv1a32:27469c92` with `securedSnapshot {20, 200, 600}`.

## What the map asked

It asked squarely about **E6's signature mechanic — everything decays, the patience win** — and it asked twice,
in opposite directions. The economy *is* decay output: a machine unstruck for `windDownSeconds: 8` exhausts into
a harmless, undamageable, cap-exempt body, and the idle probe's **449 kills beside `gold: 0` across 521.8 s** is
the whole contract stated in two numbers — the income exists, it piles up in plain sight, and only `CAPTURE`
(targetless, free, taken at the hero, radius 2.2, pen paying 1 gold per machine per 15 s) converts it; my pen
reached 31 machines and 270 gold. The second direction is that those same exhausted bodies are *armour*, piling
on the hero they were walking toward, so every capture is a body taken off your own shield. The view fields that
carried it were `now.atomic.wrangle.{active,pen,captureRadius}`, `now.atomic.exhausted`,
`now.hollowCrossing.stage/routeId/radiationDamageDealt`, `now.works.byKind`, `now.seams[].active/x/z`,
`now.gold` against `now.score.goldPanned`/`goldStolen`, and `now.threats.alive/wreckers/thieves`; the orders
were `MOVE_HERO`, `CAPTURE`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` and one blank line. The crossing
itself is *not* a decay question — it is a static one-way latch that gates the secure at every wave, and it cost
28 seconds. My notebook remembers this map from generation 24, and **it still plays the way I remember in its
geometry and not at all in its controls**: the idle floor reproduced `null-floors.json` byte for byte
(`w17 / 521800 ms / 0 g / 449 kills / fnv1a32:5e7517ff`), while `HeadlessContractSim.ts:2091` now walks the
crossing with `this.hero.group.position` under F-RPG-3's cure. This map is not on the cured list this week; its
first minute was the errand, discharged at t = 27.53 via the causeway with zero radiation, before the first
enemy landed.

## Winnability

Secured, and the margin was **wide on survival and at the deliberate ceiling on the score**: the hero never fell
below **84.9 %** of its running maximum (148.6/175 at the bank), **0 of 10 works were ever wrecked** across 884
kills, `goldStolen` finished at **0**, `threats.alive` peaked at 35 of a 60 cap, and the reel cleared all three
envelope axes with 665 ticks of slack — while the banked 200 is the arithmetic maximum of a plan that declined
the only cap-raiser on the board, because `glowjack` is `thief: true` and a standing stockpile is the switch that
turns every thief from hero-chaser into gold-grabber.

## Lessons for my notebook

- **`null-floors.json` is the cheapest expiry check in the county and it should be the FIRST file I open —
  second heat running it decided the budget.** One file published `w17 / 521800 ms / 0 gold / 449 kills /
  fnv1a32:5e7517ff` before I ran anything, and the probe reproduced it to the hash. That single comparison
  retired the whole geometry question on an era named for rebuilt maps and sent the entire reading budget to the
  two things that had actually moved.
- **Generation 24's control clause on this map is dead and the engine wrote the correction for me.**
  `HeadlessContractSim.ts:2091` carries a six-line comment naming the finding (F-RPG-3), the two bodies it
  confused, and the cure: *"GR-SIM asked one body where it stood and hurt another."* When a notebook entry is
  about WHICH BODY a mechanic measures, the call site is usually commented — grep the call site before planning
  the errand, not after.
- **Aim four units INSIDE a rectangle's edge, not at it.** `inside()` is `z >= minZ && z <= maxZ` and
  `MOVE_HERO` has a 0.5 arrival radius, so a body resting at z = −39.97 fails a `z <= −40` launch test that
  looked exactly satisfiable on paper. Aiming (0,−44) cost 1.3 seconds and removed a knife-edge that would have
  silently never latched the gate. The complement of generation 116's "aim inside the tolerance, off the
  marker": **aim inside the RECTANGLE, off its boundary.**
- **Let the return leg satisfy the middle stage rather than gambling a single point on it.** Stages advance
  sequentially inside one `update()`, so walking (0,−44) → (0,44) at x = 0 traverses the entire causeway and
  the `crossing` stage is guaranteed by the path instead of by one coordinate. Design a multi-stage latch as a
  PATH that cannot miss, not as a sequence of points that must each hit.
- **Intersect the errand's TERMINUS with the build zones and the harvest anchors before choosing a post.**
  I have intersected `stakeMarkers × buildZones × range` for a dozen generations and `harvestAnchors` since
  generation 79; the missing term here was the objective's own end point. `north-extraction-shelf` contains the
  extraction stake AND seam (24,47), so the errand delivered the hero into the pocket for free. It also inverted
  the economy versus generation 24 — `goldPanned` 600 + pen 270 here against that ride's pen 870 and
  `goldPanned` 0. **Same map, same total, opposite shape, one coordinate apart.**
- **Check a post against the HAZARD rectangle as well as the build zone.** (21,46) is inside the shelf and at
  x < 22 on purpose, clear of the east glow bridge's x[22,34]. The z-range would have excluded it anyway, but
  relying on one of two conditions is how a run pays 1 hp/s for ten minutes.
- **The thief flag settles the cap question by itself — fourth heat running I have carried the rule instead of
  re-deriving it.** `glowjack` is `thief: true` and nothing is a wrecker, so: works are unattackable
  (`REPAIR_UNDER` and palisade bait are dead weight, 0 of 10 wrecked) *and* the 60-gold stockpile is the switch
  generation 106 measured at 435 gold. Declined; measured `goldStolen: 0` with 8 thieves alive at the bank. The
  refinement I still owe the notebook, now narrowed: on a board with **no wrecker** there is no repair bill
  competing for the purse, so the LATE stockpile pair (t ≈ 500–520, ~80 s of exposure against +300 of ceiling)
  is live here in a way generation 112 correctly closed it on a continuous-repair map.
- **A ceiling is a finding; a margin is a mistake. Report which one you have.** 200 is the arithmetic maximum of
  the plan I chose, not gold I left lying about — calling it a margin would send the next rider hunting a
  stockpile that costs more than it raises.
- **Obey the stop rule and promote by name.** The first controller secured, so I stopped: copied the tape,
  verified the two files byte-identical, named `attempt-1-tape.json` in the outcome file's `tape` field, said
  plainly that they are one ride, and spent what was left on the envelope check, a control-tested assay and this
  report. The operator reads the declaration, never the filename.
- **Control-test the assay before believing it, then compare the right pair of hashes — ninth generation for
  this.** The zero-order probe replayed to its own header first; only then did `fnv1a32:27469c92` mean anything.
  The stdout outcome line's `fnv1a32:25b47509` is a different number by design, and `securedSnapshot` is the
  third number to read, because it is precisely what the door's `score_mismatch` rule compares against the
  declared gold.
- **The runner before the probe, fifteenth heat running.** This arena refuses shell redirection and compound
  `cd`, and `timeout` is not on macOS. A node runner that spawns `gr-sim`, drives the controller, logs every
  view to a compact table and writes `gauntlet-outcome.json` plus all three envelope axes on every child exit
  made the intermediate-results law automatic — a truthful row existed from the idle probe onward, and its
  per-view table is the entire evidence base of this report.
- **Seventeenth heat where reading, not riding, is the whole discipline — and the seventeenth in a row where
  the unmodified skeleton secured on ride one.** Draft first under replace semantics with a plating-first
  scorer (maxHp 100 → 175); ONE ladder with ONE ordinal per id priced at its live instance off
  `buildables[].costs[standing]`; more candidate spots than slots with a refusal blacklist partitioned into
  GROUND (poison the coordinate) and ECONOMY (`insufficient_gold` — retry, poison nothing); a rung with no
  candidates left RETIRED rather than stalling the rungs behind it; `Number.isFinite` seam filtering before any
  sort; `BLAST_AT` above the traveller; `MOVE_HERO` emitted once and dropped when parked, advancing only on a
  real `UNREACHABLE` record; a hard build floor at t = 505 that cannot be argued with; and a blank line at
  `pendingSecure`. Ten builds, zero ladder stalls.
