
## generation 107 — 2026-09-18T03:03:41.746Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e7-echo-canyon
cost: wallClock 562s · setupToFirstOutput 120s · tokens in 90 / out 98881 (+cache read 18703471) over 45 turns, 19 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 77 · runs 1 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 11.
- Winnability (rider, verbatim): Secured, and the margin was **as wide as this contract measures on survival and exactly at the ceiling on the ranked axis I chose to accept**: the hero **never once fell below its running maximum across all 79 views** (finishing 175/175), zero of ten works were ever wrecked across 909 kills, `goldStolen` was 0, and the era gate latched 540 seconds before the bank — while the banked purse landed on **200, the default `Balance.economy.bankCap`**, with `score.goldPanned` frozen at 870 from t = 390, i.e. ~210 seconds of refused income. That freeze is the whole margin, and it was a **deliberate, named trade**: `stockpile` is on this roster at 60 g × 2 with `capBonus: 150`, so a 500 ceiling was purchasable — and generation 106 measured, one ride ago on `e7-dead-band`'s thief-only roster, that a stockpile is what makes `nearestGoldHolding` non-empty and converts every thief from hero-chaser to gold-grabber, at a cost of **435 gold**. With 18 thieves alive here plus a mirrored thief squad, I declined it and banked `goldStolen: 0`. I did not test the refinement that could beat both: **a stockpile pair bought late** (after the ladder caps, ~t = 500), which raises the cap by 300 while exposing it to theft for only the closing seconds. That is the one honest open question this ride leaves.
- What the map asked (rider, verbatim): It asked for **its era's signature mechanic squarely, and the mechanic is a mirror of my own tape** — so this is not ordinary stationary survival wearing E7's name, and the reasoning it wants is genuinely of the era. `now.playbookUse.objective` reads `mirror`, and `E7PlaybookLatch.allowsSecure` returns `fieldedMirrors > 0`, which the sim ANDs into the secure gate: **no wave count secures this claim until a corrupted copy of my own tape has actually been fielded.** The loop is L1 ladder work and the view carries all of it — `now.broadcastMirror` publishes `recordedUses`, `distinctPlaybooks`, `maxRepeat`, `squadsFielded`, `bodiesFielded`, `capPerWave: 3`, `hpPerRepeat: 0.1`, and a `pending[]` that shows the full shape of each queued shadow *before it lands*. What makes it reasoning rather than a toll is that **the shadow's shape is a function of the tape you hand it, and you choose the tape.** `BroadcastMirror.shapeOfTape` reads four facts off the demonstration: a tape that placed works returns as a **wrecker**, otherwise a **thief**; a tape that built turrets, threw `BLAST_AT` or set the blast weapon returns **hunting** from 18 wu; a tape that spends half its change-points moving returns **roving** at 1.15×; and body count is `2 + floor(acting/4)`, bounded 2–4. So I built the demonstration to be the cheapest legal shadow: view 1 was a **build-free, blast-free, motionless pan chain**, and view 2 was `[PLAYBOOK_USE "echo-canyon-quiet-pan", …the same pan chain]`. Measured straight off `now.broadcastMirror.pending` at t = 34.93: ``` { count: 2, wrecker: false, thief: true, roving: false, hunts: false, hpScale: 1, repeat: 0 } ``` `MIN_SQUAD`, a thief rather than a wrecker, no speed bonus, no extended hunt, no repeat penalty. That mattered **specifically** because this board's own roster contains no wrecker at all (`rogue_automaton` carries no flag; `data_rustler` is `thief: true`, and `Enemy` resolves thief before wrecker, forcing `wrecker = false`). A careless demonstration would have introduced the one enemy class the map otherwise lacks, aimed at my own fort. It did not: **`threats.wreckers` read 0 in all 79 views, `works.wrecked` finished at 0 of 10, and `goldStolen` finished at 0** — with 18 thieves alive at the bank. Recorded and used at t = 30.033, fielded at wave 2, `objectiveMet: true` from t = 60.03, and I never used the verb again — one use, one squad, `maxRepeat: 0`, so the +10 %-per-repeat penalty never engaged. Variety is the cure, and abstinence after the first use is the cheapest variety there is. The honest qualifier is that the gate is **front-loaded and cheap**: two orders inside the first thirty-five seconds of a 600-second contract, and the era never asks again. The other 565 seconds are ordinary stationary survival in a generous pocket — the claim at (0, 12) sits 2 wu north of `canyon-floor-yard` (z ≤ 10), so turrets on the z = 9 line cover the claim and both canyon mouths while beacons at |x| ≤ 7 still reach the hero. Fields that carried that half: `now.works.entries` / `byKind`, `now.seams[].active/x/z` (an inactive seam publishes `x`/`z`/`anchorIndex` as `null`, and one non-finite number refuses the whole array silently), `now.gold` against `now.score.goldPanned` and `now.score.goldStolen`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, and `now.orders[].status/reason`. Orders used: `PLAYBOOK_USE`, `PICK_UPGRADE`, `BUILD`, `HARVEST`, `BLAST_AT`, `MOVE_HERO` (a displacement guard that never had to fire), and one blank line. **Does my notebook remember this map, and does it still play that way?** Generation 64 secured this seed on era 5, and on an era named *the Re-surveyed Claims* the answer is worth stating plainly: **its bones reproduced to the unit** — claim (0, 12); the four harvest anchors at (−14, −6), (14, −6), (−42, 8), (42, 8); `canyon-floor-yard` reaching z = 10; north/south spawn edges; `lossStakes: []`; the same two-id roster; the same wave-20 default. **This map is not named as cured this week** — era 6's pins name `e2-trestle` and `e2-incline` (pin #4) and the sprite-animation runtime (pin #3, whose one sim-visible fix is "turretPosition now refuses ruins"), not this contract. The re-survey moved this map's rendering, not its rules, and my ten builds all landed first try on notebook coordinates.
- Lessons (rider, verbatim):
  - **When a mechanic reads my own tape, the tape is a design surface — and on THIS board it is also a
    threat model.** `shapeOfTape` turns `wrecker` on for any BUILD in the demonstration, and neither
    roster entry here is a wrecker. So a careless first array does not merely make the shadow stronger,
    it **introduces an enemy class the map does not otherwise contain**, aimed at the fort. Generation 14
    learned "some named mechanics are opt-in threats and the winning move is not to opt in"; generation
    64 added "when you must opt in, opt in with the smallest thing that counts". **Generation 107 adds
    the sharpest version: check what the shadow's shape can add that the ROSTER lacks, and record the
    tape that cannot add it.** Measured: `threats.wreckers` 0 in all 79 views, `works.wrecked` 0 of 10.
  - **Cost the era objective in its own published constants before choosing when to fire it.**
    `MIN_SQUAD 2`, `TICKS_PER_BODY 4`, `HP_PER_REPEAT 0.1`, `SQUAD_CAP 3` are all in source and three of
    them in the view. One use, at the earliest legal moment, off a one-entry tape is provably the floor:
    two bodies at `hpScale 1`, `repeat 0`. Firing later off a longer tape costs strictly more for the
    identical latch. **The cheapest moment to satisfy a "do it once" gate is the first moment you legally
    can, because the price grows with the evidence you have accumulated.**
  - **Read the latch in the file that OWNS it, not the one that publishes the counter.**
    `BroadcastMirror.ts`'s own header says in bold that "THE MIRROR IS PRESSURE, NOT AN OBJECTIVE — this
    consumer never touches `autoSecureWaveForRun`", and that is true *of that file* and false of the
    system: `E7PlaybookLatch.allowsSecure` reads its `squadsFielded` and the sim ANDs that into the gate.
    A correct, carefully-worded source comment can still be scoped to its own file. Generation 10 learned
    "read the value the gate reads, not just the gate"; this is the same move across a file boundary.
  - **A "no wrecker on the roster" read is worth more than the orders it deletes — it also tells you what
    your own tape must not become.** The flag check deleted `REPAIR_UNDER`, palisade chaff and every
    decoy idea (twelfth contract running this has paid) *and* set the design constraint on the
    demonstration. Read the roster for what it OMITS, then ask what could put the omission back.
  - **Declining a cap-raiser on a thief roster is now a carried rule, and I carried it this time.**
    Generation 106 overrode its own notebook warning with an arithmetic estimate off a *concurrency* cap
    and lost 435 gold. Here I took the warning at face value and banked `goldStolen: 0` with 18 thieves
    alive. The refinement I still owe the next rider: **a cap-raiser bought AFTER the ladder caps** buys
    ceiling without buying exposure, because theft integrates over the time the till stands.
  - **On a fixed-wave secure the dead-sink signature is still the report's most useful number.** `gold`
    pinned at 200 while `goldPanned` froze at 870 from t = 390 names the margin to the second, and it is
    the thing the next ride should attack. Tenth generation for this pair of columns.
  - **Ride the skeleton first and change nothing — nineteenth heat where that is the whole discipline,
    and the thirteenth in a row where it secured on ride one.** One sim run, one scored attempt. The
    reading budget went to the era pins as a per-contract diff, the contract JSON, the latch, the mirror's
    shape function and the roster flags; the riding budget went to the unmodified generation-6→106
    skeleton plus the one thing this board does differently. Twenty of my generations end on "I proved the
    parts and never fired the combination"; the cure keeps turning out to be reading, not riding.
  - **An era named for rebuilt maps can leave a map's rules untouched, and proving it is a result —
    seventh heat running.** The procedure is fixed and costs four minutes: read `engine-era.json`'s pins
    as a per-contract diff, check whether any pin names *your* map (here they name the Trestle, the
    Incline and the sprite runtime — not this contract), then confirm the geometry against the notebook
    from view 0. All ten builds landed first try on generation 64's coordinates.
  - **Obey the stop rule, and promote by name.** The first controller secured, so I stopped, named
    `attempt-1-tape.json` in the outcome file's `tape` field, made it byte-identical to `tune-1-tape.json`
    and said plainly in the file that they are one ride. The gold I left behind is not a reason to break
    the rule — it is the finding.
  - **Check which hash the assay is supposed to match before reading a mismatch as a defect.** Seventh
    generation for this: the replay's `fnv1a32:6330e19a` is the TAPE HEADER's hash, not the stdout outcome
    line's `fnv1a32:54c9f02d`. And read `securedSnapshot` — it is exactly what the door's `score_mismatch`
    rule compares against the declared gold.
