
## generation 120 — 2026-09-18T07:05:21.015Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e10-ember-shore
cost: wallClock 977s · setupToFirstOutput 150s · tokens in 178 / out 141133 (+cache read 45210369) over 89 turns, 53 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 60g / calls 56 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:d3959e47, rank 1. Heat 14 (never-claimed), ride 24.
- Winnability (rider, verbatim): Secured, and the margin was **as wide as this contract can be measured on survival and genuinely thin only where it is scored**: the hero took **zero damage across the entire run** (min HP fraction 1.000, finishing 175/175), nothing was ever wrecked, nothing was stolen, and the vent banked at a **full 100/100 with three squalls survived against one required** — while the ranked purse, **60 of a 350 live cap** (200 default + 150 for the one standing stockpile), is the whole margin I left behind, and I can name it to the coin: 12 stokes restored `warmthRestored: 299.867` warmth against an arithmetic floor of 8 stokes, so **~60 gold went into restore that the 100-cap clipped** — almost exactly the gold I banked.
- What the map asked (rider, verbatim): It asked for its era's signature mechanic — **E10 preserve, don't extract: a flipped objective over a trained habit** — squarely, and it is the most legible era gate I have ridden. This is not stationary survival wearing E10's name. The flip is in the *economy*, and it is total: on every other board gold is a score to hoard, and here **gold is fuel for keeping something alive**, so the ranking axis and the survival mechanic consume the same coins. Every 15 gold banked is 40 warmth not restored; every stoke is a point off the board. My run panned 620 and banked 60 because 180 went into the vent — and that is the contract working, not a leak. The trained habit the map flips is "build the fort, fill the purse": the vent is explicitly **not damageable** (`damages: false`, and the consumer says so in prose — "the SQUALL is the antagonist; enemies are the thing that keeps you too busy to stoke"), so no amount of fort defends the objective and no amount of banking wins it. The view carries all of it, and a rider with **no source import** could play this map from the view alone. `now.emberShore.preserve` publishes `warmth`, `maxWarmth`, `alight`, `guttered`, `decayPerSecond`, `decaying`, `warmthLost`, `warmthRestored`, `squallsSurvived`/`squallsRequired`, `objectiveMet`, and a `stoke` block carrying `goldCost`, `warmthRestore`, `radius`, `uses` and a **per-reason refusal counter** (`undeclared`/`guttered`/`out-of-reach`/`insufficient-gold`/`already-warm`). `now.squall` publishes the whole timetable — `calmSeconds`, `telegraphSeconds`, `squallSeconds`, `recoverSeconds`, `cycleSeconds`, `phase`, `secondsToNextPhase`, `secondsToNextSquall`, `squallsStarted`/`squallsCompleted`, `blowing`. And `stablePrefix.mechanics.rules` publishes `preserve_vent` and `static_squall` with `lossRule: "warmth-zero-ends-the-run"`, `secureRule: "vent-alight-and-one-full-squall-survived"`, `gatesSecure: true`, and **the exact order shape** `{verb: "CONTEXT_ACTION", action: "stoke"}`. The orders that carried it were **`CONTEXT_ACTION stoke`** (12 uses, **zero refusals of any kind**) and `HARVEST` as its clock, plus `BUILD`, `PICK_UPGRADE`, `BLAST_AT` and one blank line at the secure boundary. There is **no E10 verb** — the era is answered with the player's own confirm key, which is exactly what ADR-005 intended. Two honest qualifiers. First, the map's *other* half — the doubled mote pressure, 25 % of the field walking at the vent in calm and **50 % during a squall**, which the consumer calls "the spec's sentence about being too busy to stoke turned into arithmetic" — was **inert on this seed**: the hero's HP fraction was **1.000 at every one of 58 views**, it finished 175/175 at level 18, and 7 of 7 works stood unwrecked (`wreckers: 0`, `thieves: 0`, `goldStolen: 0` across 421 spawns). The pressure is real and correctly wired; it never made me too busy. Second, `stablePrefix.objective` is **absent** here and `now.preserve` is absent too — skill.md's "preserve contracts add `objective: "preserve"`" describes `e10-last-claim`'s mechanic, and the source is explicit that these are "two warm vents, two mechanics, no shared code". Read `now.emberShore.preserve`, never `now.preserve`, on this map. **My notebook does not remember this map.** No prior generation of mine has ridden `e10-ember-shore`; generation 28 rode `e10-last-claim`, which is a different preserve mechanic (a real structure with HP that outlaws can fell). The contract is **not** on the cured list this week — era 6's cures name `e2-trestle`/`e2-incline` (pin #4) and the render-side sprite and boss work (pins #3, #6, #7). For the record its first minute did nothing threatening: the hero stood where it landed, the Prospector walked 16.6 units to `gold-seam-3` at (−6, −24), the first 40 gold was in the purse by t = 23.5, and the vent sat untouched at 100 warmth until the first squall opened at t = 68.
- Lessons (rider, verbatim):
  - **Read the era consumer end to end when it is small enough to read — eighth generation running, and
    this time it handed me the entire contract before the first order.** `E10PreserveSystem.ts` is 438
    lines and its header derives the map in prose: decay is squall-only, the vent is not damageable, reach
    and warmth are checked **before** the purse so a refused stoke never debits, and the latch is
    `alight && squallsCompleted ≥ 1`. Four minutes there plus the contract JSON produced a first-ride
    secure on a board nobody had ever claimed.
  - **The order loop attempts exactly ONE record per tick, and that makes `HARVEST` a clock.**
    `StandingOrders.ts:406` is `for (const record …) { … if (result) return result; }` and **every**
    branch returns an object (`{}` is truthy), so a resolved record is skipped forever and an unresolved
    one owns its tick. `HARVEST` holds the tick while it walks and pans; a targetless `CONTEXT_ACTION`
    resolves in one. So `[HARVEST, STOKE, HARVEST, STOKE, …]` is a **stoke scheduled every pad-second
    without needing a view** — which is the only thing that answers squall 3, where no wave boundary
    falls between t = 270 and t = 295. **When a mechanic needs acting on between views, build the delay
    out of a travelling verb and interleave the instant one.**
  - **A collapsing pad chain self-reports instead of bursting, and that is why the design is safe.** Any
    order failure raises an `order_failure` surprise and the sim emits a view on the next tick
    (`HeadlessContractSim.ts:1614`), and only one record is consumed per tick — so a chain whose seam
    depletes gives me a view after the FIRST failure rather than firing every queued stoke at 15 gold
    each. I still capped stokes per array at 3; the cap was never the thing that saved it.
  - **Stoke in the BAND, never on a timer: `warmth ≤ 58` is the whole policy.** A stoke restores
    `min(40, 100 − warmth)`, so firing at warmth 90 buys 10 warmth for the same 15 gold as firing at 58
    buys 40. My band policy took 12 stokes with **zero refusals**, and the ~60 gold I still lost to the
    cap is the gap between 12 stokes and the 8-stoke floor. **On any capped-restore resource, the
    threshold IS the efficiency, and it should be `cap − restore`.**
  - **Compute where the objective's clock and the view clock DISAGREE before designing anything.** Wave
    boundaries land inside squalls 1 and 2 and miss squall 3 entirely. That single subtraction —
    squall windows (68–93, 169–194, 270–295) against boundaries every 30 s — is what told me a
    boundary-driven controller would secure twice and gutter on the third, and it was available from
    `now.squall`'s published cadence in view 0.
  - **A `MOVE_HERO` at a stake marker answers `UNREACHABLE_TERRAIN`, and here it did not matter.** The
    vent at (3, −10) is a building footprint the hero cannot stand on; the hero sat at (3, −12.35) all
    run, **2.35 units out, inside the radius-4 stoke disc**, so all 12 stokes landed. My knockback guard
    refused in 56 of 58 views and cost one tick each. Generation 112 lost its whole post to exactly this
    refusal and a guard that never advanced; the cheap protection is to **read the objective's RADIUS
    before assuming you must stand on its centre** — skill.md already says it of `fund` ("the centre
    itself is a building footprint the hero cannot walk onto"), and it is true of every stake.
  - **`null-floors.json` first, every ride — third heat running it set the whole budget.** One file
    published this seed's losing floor before I ran anything, and a ten-second probe reproduced it to the
    hash including `endReason`. That is simultaneously the proof that the rules did not move AND, here,
    the naming of the loss channel: `vent_guttered` with the hero at 92/100 says in one line that the
    contract is the vent and not the fight.
  - **Read the roster for what it OMITS — thirteenth contract running.** Neither `static_mote` nor
    `unraveled_machine` appears in `Balance`, so neither carries `wrecker` or `thief`: `works.wrecked` 0 of
    7 across 421 spawns and `goldStolen` 0. That deleted `REPAIR_UNDER`, palisade bait and every decoy idea
    — and, unusually, it also made the **stockpile safe**, which on a thief roster is the trap generation
    106 measured at 435 gold.
  - **Obey the stop rule and promote by name.** The first controller secured, so I stopped: copied the tape,
    verified the two files byte-identical, named `attempt-1-tape.json` in the outcome file's `tape` field,
    said plainly that they are one ride, and spent what was left on the envelope check, a control-tested
    assay and this report. **The gold I left behind is not a reason to break the rule — it is the finding**,
    and on this map it is a *measured* finding with a named cure (a tighter band and one more stockpile).
  - **What the next rider should try, named precisely.** Same controller, three edits: raise the stoke band
    to exactly `100 − warmthRestore` = 60 and add a "do not stoke above 60 even in emergency unless warmth
    < 20" clamp (saves ~60 gold); buy the **second** stockpile (the roster allows 2 at 60 each, lifting the
    cap 200 → 500, and this roster has no thief so it costs nothing to stand one); and stop all BUILD at
    about t = 300 so ~1.7 g/s of panning refills the purse. On this seed that is a plausible 300+ banked
    against my 60, on an identical secure.
