
## generation 118 — 2026-09-18T06:18:26.246Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e6-half-life-hollow
cost: wallClock 783s · setupToFirstOutput 285s · tokens in 132 / out 132150 (+cache read 30675436) over 66 turns, 30 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 90 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 22.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and at the deliberate ceiling on the score**: the hero never fell below **84.9 %** of its running maximum (148.6/175 at the bank), **0 of 10 works were ever wrecked** across 884 kills, `goldStolen` finished at **0**, `threats.alive` peaked at 35 of a 60 cap, and the reel cleared all three envelope axes with 665 ticks of slack — while the banked 200 is the arithmetic maximum of a plan that declined the only cap-raiser on the board, because `glowjack` is `thief: true` and a standing stockpile is the switch that turns every thief from hero-chaser into gold-grabber.
- What the map asked (rider, verbatim): It asked me about **decay and patience**, and E6's signature mechanic is load-bearing in the strictest sense — but the sharper finding is that this map asks about decay **twice, in opposite directions**, and only one of them is the objective. The **first** is the ordinary E6 lever and it is the economy: a machine not struck for `windDownSeconds: 8` *exhausts* — harmless, undamageable, crawling at 0.2×, and exempt from the alive cap, so the board piles up. The idle probe is the proof and it is the loudest number on this contract: **449 kills and `gold: 0` across 521.8 seconds**, with machines exhausting in plain sight and no order collecting them. `now.atomic.wrangle` publishes `captureRadius: 2.2` and the pen (`goldPerMachine: 1`, `tickSeconds: 15`), and `CAPTURE` — targetless, free, taken at **the hero** — is the only converter. Every penned machine pays for the rest of the run, so it is an opening move rather than a mid-game one. My pen reached **31 machines and granted 270 gold**. The **second** is the one the idle probe asks without meaning to: the exhausted machines are also *armour*. They are exempt from the cap precisely so they can accumulate, and they accumulate on the hero they were walking toward. So `CAPTURE` is not a free lever — every machine banked is a body taken off your own shield — and the honest reason my run could afford to bank them is that the fort held `threats.alive` at a peak of 35 against a 60 cap. The **crossing**, by contrast, is not a decay question at all: it is a static, one-way geometry latch with no clock on it, and it gates the secure at every wave (`objectiveAllowsSecure` ANDed in at `HeadlessContractSim.ts:1472`). Cheap, front-loaded, discharged in the first 28 seconds — and unskippable. Fields that carried the run: `now.hollowCrossing.stage/routeId/radiationDamageDealt` (the errand's whole state machine), `now.atomic.wrangle.{active,pen}` and `now.atomic.exhausted` (the economy), `now.works.byKind`/ `entries`, `now.seams[].active/x/z/anchorIndex` (an **inactive seam publishes all three as `null`**, and one non-finite number refuses the whole array silently), `now.gold` against `now.score.goldPanned` and `goldStolen`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, `now.orders[].status/reason`. Orders: **`MOVE_HERO`**, **`CAPTURE`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, and one blank line. There is no E6 verb beyond `CAPTURE`. **Does my notebook still describe this map?** Its geometry, exactly; its controls, not at all — and this map is **not** named as cured this week, so the first-minute question answers itself from the floor. The idle probe reproduced `null-floors.json` **byte for byte** (`w17 / 521800 ms / 0 gold / 449 kills / fnv1a32:5e7517ff`), matching my generation-24 memory of "zero gold in 522 seconds" to the tenth of a second. The claim at (0,12), the four build zones, the four harvest anchors, the causeway and both glow bridges, the wave-20 default and the 200 bank cap all reproduced. The era-6 re-survey moved this map's rendering, not its rules. What moved is the body that walks the crossing — and that change paid, because the hero travels at 6.0 against the Prospector's 4.8, so the same errand that took generation 24 until t = 29.87 landed at **t = 27.53** while also leaving the hero standing where I wanted it.
- Lessons (rider, verbatim):
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
