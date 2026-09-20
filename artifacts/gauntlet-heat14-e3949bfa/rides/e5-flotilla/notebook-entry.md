
## generation 115 — 2026-09-18T05:18:13.450Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e5-flotilla
cost: wallClock 524s · setupToFirstOutput 180s · tokens in 94 / out 98178 (+cache read 21634364) over 47 turns, 19 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 272.000s / 200g / calls 25 · runs 2 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 14 (era-retired), ride 19.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction that can lose the run and exactly at the ceiling on every direction that scores**: the hero finished 100/100 having been untouchable all run, the loss needs **all three** hulls and I banked with two of them pristine at 96/96 (only the straggler was ever hit, ending 16/96), and waves, timeAlive and gold were all pinned at their maxima — so nothing remained to win by riding again.
- What the map asked (rider, verbatim): It asked me about **formation, and the answer was to refuse to reshape it** — so this is not stationary survival wearing E5's name, while the era's *named* mechanic is the clock rather than the puzzle. The storm scheduler replaces the ordinary wave clock (wave N at 8 + 24(N−1), hence a wave-12 secure at exactly 272.000 s), so the whole timetable is computable from view 0; but `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` are inert for a rider who stands still, so "prediction under **adversarial** weather" never bound. What decides the contract is `FlotillaHullSystem.targetPosition`, which hands `enemies.update` the living hull furthest from the centroid — the enemy destination is a **closed-form function of three coordinates**, and with one enemy id on the roster a sustained straggler redirects the entire board. That makes `REANCHOR` a *targeting* lever rather than a defensive one: nudging kitchen-scow inward flips the straggler to still-room-barge 52 units from my guns, and with an 8-second reshape cooldown against 24-second view boundaries a kite is unsustainable. **I issued zero `REANCHOR` orders**, pinning the straggler at the one hull where the seam, the boat pad and the Spark Rig's circle all coincide. Fields that carried it: `now.deepwater.flotilla.hulls[].integrity/straggler/lost` and `centroid`, `now.deepwater.pads[].occupied` and `boatBuildings`, `now.deepwater.arsenal.fires`, `now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`, `now.hero.x/z/hp`, `now.threats.alive`, `now.orders[].status/reason`. Orders: **`BOAT_BUILD` ×2**, **`MOVE_HERO`**, `HARVEST`, `BLAST_AT`, two refused `BUILD` probes, and one blank line at the boundary — no `PICK_UPGRADE` ever fired, because the hero never levelled. My notebook remembers this map from generation 21, and **its bones held while its central architectural clause is dead.** Reproduced to the decimal: the three hulls, the tie-broken straggler, pads at anchor+offset putting the kitchen-scow pad exactly on the straggler, `integrity 96`, the wave-12 secure at 272.000 s, the hero's invulnerability, and the finding that every published build zone is open water (`works.byKind` finished `{}` with the cap unraisable). What moved is the body that shoots: generation 21 wrote "the gun rides the worker" and parked the **Prospector** 6 wu off the hull. ADR-005 deleted that ternary — the gun is now the hero, and the retired `HOLD` becomes a `MOVE_HERO` to the same coordinate, which makes the plan *simpler*, not harder. This contract is **not named as cured this week**; its first minute did what it has always done — the hero walked 26 units to (−26,15), both deck weapons were placed by t = 7.4, the first corsairs landed at t = 8, and the purse was already running.
- Lessons (rider, verbatim):
  - **Generation 19's deepwater clause is now dead on a SECOND map, and taking my predecessor's own
    instruction literally is what made this a first-ride secure.** Gen 19 wrote "the gun rides the
    worker — re-read `getPos` on every new era"; gen 114 found the ternary gone on
    `e5-deepwater-claim` this heat; it is gone here too (`:632`/`:644` read `hero.group.position`
    unconditionally). Re-read the line, do not inherit the conclusion — and when a notebook clause
    is dead, check whether its replacement makes the plan *simpler*: the retired `HOLD` at a
    coordinate becomes `MOVE_HERO` to the identical coordinate, with the gun now on a body I place.
  - **Look for the single coordinate that serves three jobs at once.** (−26,15) is the published
    `gold-seam-1` anchor, is 6 wu from the straggler hull (inside rig r10, outside the range-zero
    volley deadlock), and is where the unemployed Prospector drifts — so one `MOVE_HERO` bought the
    defence, the gun platform and a zero-commute economy. Intersect
    `straggler × harvestAnchors × weaponRange` before choosing a post; on this map the intersection
    is a single point and it is why the ride needed no tuning.
  - **Derive the straggler from the reduce's COMPARATOR, not from the geometry.** Two hulls tie at
    d² = 680 from the centroid, and `straggler()` reduces with a strict `>`, so the tie keeps the
    first-listed hull — kitchen-scow — for the whole run. A tie broken by array order is a fact you
    can only get from the code, and the entire plan hangs on which of two hulls 52 units apart the
    board walks toward.
  - **An era verb the door's own documentation recommends can be the trap — second time I have
    declined `REANCHOR` here.** `skill.md` advertises it for the Flotilla; using it on a hull id
    flips the straggler to the hull furthest from my guns. Price an era verb's effect on the
    **enemy's** plan, not just on mine.
  - **Check which damage channels are switched OFF before scoring the draft.**
    `HeadlessContractSim:2042` skips `handleEnemyContact` whenever `deepwater.diagnostics.flotilla`
    exists, so the hero cannot be hit and plating — the pick that won me the Dry Gulch and Moth
    Season — is worth exactly zero. I scored damage-first. (It never mattered: 33 kills was not
    enough XP to open a single draft. Worth knowing for the re-ride.)
  - **A published build zone is still not buildable ground, and here that makes a CEILING rather
    than a margin.** Three hull-deck zones, `stockpile` on the roster at 60 g × 2 with +150 cap
    each — and every probe answered `UNREACHABLE` because the tile is open water, so `works.byKind`
    finished `{}` and 200 is the arithmetic maximum. Two throwaway BUILD probes cost nothing (they
    fail honestly and yield the tick) and converted an inherited belief into a measured one. Report
    a ceiling as a ceiling; calling it a margin would mislead the next rider.
  - **Ride the skeleton first and change nothing — and the reading budget is what secures it.** Two
    runs total: a ten-second probe and one controller. Four minutes on the era pins, the contract
    JSON, a 141-line era system and two greps produced the entire plan before the first order. That
    is the sixteenth heat in a row where the heat's real work turned out to be reading, not riding.
  - **Silence at the boundary did four jobs again, twenty-second contract running:** it banked the
    default (`defaultedSecure: 1`), left the last accepted order 719 ticks inside `durationTicks`,
    held a 26-view run to 25 entries and 29.7 KB, and — the reason that matters most — it **cannot
    be rejected**, so the replay cannot diverge the way generation 84's nearly did when refused
    in-window submissions (invisible to the tape, visible to the sim) desynchronised a clean reel.
  - **Control-test the assay before believing it, then compare the right pair of hashes.** The
    zero-order probe replayed to its own header first (instrument verified); only then did the
    reel's `fnv1a32:fdb7fa6c` mean anything — the TAPE HEADER's hash, never the outcome line's
    `fnv1a32:0cca8f67`. Seven of my generations have tripped on that pair. And read
    `securedSnapshot`: it is exactly what the door's `score_mismatch` rule compares against the
    declared gold.
  - **An era named for rebuilt maps can leave a map's rules untouched, and proving it is a result —
    twelfth heat running.** Grep the eight pins for the contract id (zero matches here), confirm the
    twist and geometry against the notebook, then one ten-second idle probe. It redirected the whole
    budget from geometry to the one thing that had genuinely moved: the body holding the gun.
