# e8-mare-claim — generation 111, heat 14 (era 6, the Re-surveyed Claims)

rig `claude__opus-5` · harness Claude Code CLI 2.1.272 · worldModel `sim-import`
engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`, build `e3949bfad`

## Pre-ride reading (four minutes, and it produced the whole plan)

- **Era-pin diff.** All eight era-6 pins grep to **zero** matches for `e8-mare-claim`. Pin #4
  (`playability-first-wave-e2-e6`) names `e2-trestle` and `e2-incline`; pins #6/#7 say
  "render-side only, the sim is untouched". This contract's rules did not move.
- **The door document is stale on the decisive fact.** `skill.md`'s E8 paragraph says the suit is
  "the Prospector's air". `E8PhysicsSystem`'s own header records the 2026-09-07 owner directive
  ("I want space experiences of humans to need them having air") that moved it, and view 0 says
  `now.air.suit.body: "hero"`. `notePan(anchorIndex, actorId = 0)` refuses on
  `suitForActor(0).empty` — **her lungs, its hands.**
- **Roster.** `Balance.e8Roster`: `scrap_corsair` and `sun_glare_shambler` carry neither `wrecker`
  nor `thief`. Nothing can be wrecked, nothing stolen → `REPAIR_UNDER` and palisade chaff are dead
  weight, and the `stockpile` is a *safe* +150 cap.
- **`lossStakes: []`** — the claim at (0,12) is not a loss condition; the loss is hero down.
- Twist declares no `secureWave` → `Balance.run.secureWave` 20 / 600 s; `clockTicks: 18000`.

## Outcome

**SECURED — waves 20 / timeAlive 600.000 s / gold 260 / calls 89.** 922 kills, `defaultedSecure: 1`,
`defaultedPicks: 0`, 0 of 11 works ever wrecked, `goldStolen` 0, `breathlessPans` 0.

Tape put forward: `attempt-1-tape.json` (declared in `gauntlet-outcome.json`'s `"tape"` field).
Envelope measured on the first reel that existed: `durationTicks` 18 000, last accepted order at
tick **17 681**, 89 entries, 142 125 bytes — clear on all three axes.

Receipt: the assay instrument was control-tested on the zero-order idle probe first (it replayed to
its own header `fnv1a32:a45ba9ac`), then the scored reel reproduced **`fnv1a32:ddf3c5c6`** — the
TAPE header's hash, not the stdout outcome line's `5a377f4a` — with
`securedSnapshot {waves: 20, gold: 260, timeAlive: 600}` matching the declaration exactly, which is
what the door's `score_mismatch` rule compares.

**3 sim runs, 1 scored attempt** (idle probe → `tune-1` → `attempt-1`).

## What the map asked

It asked for **air as the wall, as a two-body problem with a window clock** — so this contract
genuinely exercises E8's signature mechanic (low gravity, air as wall, transfer under changed
physics) rather than wearing its name, and the *air* half is the whole of it. `now.air` publishes
`suit` (`body: "hero"`, 60 s capacity, 4/s refill inside a dome, **5 hp/s** harm outside), a per-pad
`domes` dial, and `regolith` (`grounds` 6, `required` 4, `windowWaves` 4, `worked`,
`creditedThisWindow`, `windowHeldPans`, `breathlessPans`). No wave secures until four **distinct**
grounds are worked, at most one credited per 120-second window, each while **the hero's** suit holds
air — while the body that pans is the Prospector, 20–35 units out in vacuum. That split is the
strategy: park her inside `dome-cluster-pad-center`'s breathing ellipse (the contract declares
`pressurisedZoneShape: "ellipse"`, so the breathable region is the radius-6 disc inscribed in the
12×12 rect, not the rect) and dispatch it out. `now.seams[].anchorIndex` is the direct handle that
turns "pan a *fresh* ground this window" into a sort against `regolith.worked`. Measured: gate closed
at **t = 371.9** with 228 seconds of slack, **zero** breathless pans, and the suit never below 44 of
60. The *gravity* half (`feelG 0.6`, `floaty`, `knockbackScale 1.3`, `orbitalReturn: false`) is the
hazard rather than a lever: under low gravity a scrum can throw the hero clean out of her own air,
and the cure is to interleave re-arming `MOVE_HERO` records through the draining harvest chain —
a `done` record is skipped forever, so re-arming means *more records, not more submissions*.
There is **no E8 verb**: the era is answered entirely with `MOVE_HERO` and `HARVEST`, which is
exactly what ADR-005 intended.

My notebook remembers this map from generations 29, 39 and 61, and **its rules did not move** — on
an era named for rebuilt maps, proving that is itself the result. Claim (0,12), the three dome pads,
the six harvest anchors, `regolithRequired: 4` / `regolithWindowWaves: 4` / `harmPerSecond: 5`, the
two-id roster and the wave-20 default all reproduced to the decimal, and the idle floor came back at
**w2 / 76.033 s** against generation 61's 76.0 s. The map is not named as cured this week; its first
minute did exactly what the briefing says — the hero lands six paces *north* of the only air on the
map with `inDome: null` and a suit falling 1 s/s, so the first order is a twelve-unit walk south onto
the pad, the first pan lands at t ≈ 20, and nothing threatening happens until wave 2.

## Winnability

Secured, and the margin was **wide on survival and open on the score**: the hero never fell below
**83.1 %** of its running maximum (finishing 145.4/175), all eleven works stood unwrecked through
922 kills with `threats.alive` peaking near 32, and the era gate latched 228 seconds early with zero
breathless pans — while the banked purse, 260 of a live 350 cap, is the one number with anything
left on it, because `tune-1` had already spent my budget proving that hoarding it kills the run.

## Lessons for my notebook

- **A bank gate and a hard build floor can conspire to make the fort unreachable exactly when it is
  needed, and the per-view table dates the conspiracy to the second.** `tune-1` died at w19/587 —
  13.6 s short — with **470 gold idle**, because the last 270 gold of fort sat behind an `urgent`
  latch that armed at t = 504 while my hard floor had shut at t = 500. Generation 85's "a flat floor
  cannot be argued with" is right on a run you are winning and lethal on one you are losing.
  **Give the floor exactly one bypass — a dying hero — and arm the survival latch on pressure that
  predicts death, not on damage already taken.**
- **A dead run banks nothing, so the contingency fort belongs in the CORE ladder whenever the map's
  own income cannot fund both.** I have put the surplus fort behind a pressure latch for four
  generations (gens 98, 104, 109) and banked it every time on comfortable boards. Here the board was
  not comfortable: 990 panned against a 790-gold full ladder leaves ~200, and there is no version of
  this contract that banks 500 *and* survives wave 19. **Do the subtraction — `panned − full ladder`
  — before deciding whether the surplus is a contingency or the plan.**
- **Read the door document's era paragraph against the era system's own header, because the door can
  be stale on the one fact that decides the map.** `skill.md` says the suit is "the Prospector's
  air"; the consumer says it moved to the hero on 2026-09-07 and names the measurement that forced it
  (601 of 600 s outside pressurised ground on this map). Had I inherited the door's wording I would
  have designed a round-trip errand for a body that does not breathe. Seventh contract where reading
  the *consumer* rather than the publication decided the ride.
- **A declared `pressurisedZoneShape` changes which of your own build coordinates you can walk to.**
  The pad is a 12×12 rect and the air is the inscribed radius-6 *disc*, so a turret at (5,5) is legal
  ground and **unbreathable** ground — 7.07 from centre. That killed the tier-2 `CONTEXT_ACTION`
  sink before I wrote it (the verb does not travel, so it needs `MOVE_HERO` onto the work). **Check
  the zone's SHAPE, not just its rectangle, before planning any errand into your own fort.**
- **`now.seams[].anchorIndex` is the whole regolith objective, and `creditedThisWindow` is the
  cadence.** Fresh-ground-first while `creditedThisWindow === 0`, nearest otherwise; drain the fresh
  seam in a block of seven so the credit lands inside its window. Four credits across windows 0–3
  with a spare window in hand, and a fifth ground worked harmlessly afterwards (`windowHeldPans`
  refuses the credit and still pays the gold). Never infer the ground from coordinates when the view
  names it — and filter `Number.isFinite` first, because an inactive seam publishes `x`, `z` and
  `anchorIndex` all `null` and one non-finite number refuses the whole array silently.
- **The interleaved `MOVE_HERO` re-arm cost nothing and I still cannot prove it was needed.** The
  hero's z oscillated between −3 and +8.6 all run and `inDome` read `null` in perhaps a dozen of 91
  views — she was being nudged out and walked back, suit never below 44. Carry it (it is free when
  unneeded and the run when it is), but do not report untested insurance as a cause.
- **Ride the skeleton first, then change exactly one CAUSE — and a cause wears several faces.**
  `tune-1` → `attempt-1` changed the ladder's contents, the floor's bypass and the early-core window,
  which looks like three variables and is one: *the fort was under-bought because the gold was being
  saved for a scoreboard the run never reached.* The diff is a measurement, not a guess: w19 → w20,
  works 8 → 11, minimum HP fraction 0.00 → 0.831, gold 470-at-death → 260-banked-and-secured.
- **An era named for rebuilt maps can leave a map's rules untouched, and proving it is a result —
  ninth heat running.** Grep the pins for the contract id first, confirm the twist and geometry
  against the notebook, then one ten-second idle probe against the remembered floor. Four minutes,
  and it redirects the whole budget from geometry to whatever is actually free.
- **Silence at `pendingSecure` did its four jobs again, twentieth contract running:** it banked the
  default (`defaultedSecure: 1`), left the last accepted order 319 ticks inside `durationTicks`, held
  a 91-view run to 89 entries and 142 KB, and — the reason that matters most — **it cannot be
  rejected**, so the replay cannot diverge the way generation 84's nearly did.
- **The runner before the probe, thirteenth heat running.** This arena refuses shell redirection and
  compound `cd`, and `timeout` is not on macOS. A node runner that spawns `gr-sim`, drives the
  controller, logs every view to a compact table and writes `gauntlet-outcome.json` plus all three
  envelope axes on every child exit made the intermediate-results law automatic — a truthful row
  existed from the idle probe onward, the comparator promoted the scored tape with **no hand edit**,
  and its per-view table is the entire evidence base of this report.
