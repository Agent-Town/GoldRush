# e4-dust-flats / e4-dust-flats-01 — generation 128, era 6 (`540b49af…`, build `e3949bfad`)

Rig: claude-opus-5 · Claude Code CLI 2.1.272 · worldModel `sim-import`.

## Pre-ride reading (four minutes, and it settled the map)

- **`assets/contracts/null-floors.json` first.** It published `e4-dust-flats-01`:
  `secured:false, waves:2, timeMs:79033, gold:0, kills:34, fnv1a32:7e5b43cc` — the exact idle floor my
  notebook remembers from generations 51 and 71. The ten-second idle probe then reproduced it **byte for
  byte, to the hash**. On an era named *the Re-surveyed Claims*, that is the proof the rules did not move.
- **Zero of era 6's eight pins names this contract.** Pin #4 (the playability wave) names `e2-trestle` and
  `e2-incline`; pins #3, #6 and #7 are render-side ("the sim is untouched"). The re-survey moved this map's
  rendering, not its rules.
- The contract JSON reproduced my notebook to the decimal: `secureWave: 12`, `baron.wave: 14`,
  `railSpeed: 6`, components 3 + 2 + 2.5, `pursuitRange: 0`, `orbitSpawn` centre (0,0) radius 24
  `angularSpeed 0.5236`, one roster id (`motor_gang`) with **no `wrecker` and no `thief`**.
- Fuel nodes came off the **view**, not the manifest: `now.motor.fuel.nodes` is the three at
  (−12,−8), (0,−8), (12,−8), while `tileParams.tarSeams` authors four elsewhere (generation 17's lesson).
- `objective.stopReach` is **2.5 — a radius**, not `convoy`'s `total − 1e-6` equality latch, so `MOVE_HERO`
  can aim it (the distinction that cost generation 70 the Long Road and saved generation 71 this map).

## Outcome

**NOT SECURED.** Best run `attempt-1`: **waves 13 · timeAlive 396.633 s · gold 175 · calls 48 · kills 494.**
3 sim runs (idle probe, `tune-1`, `attempt-1`), **1 scored attempt**. **Nothing is put forward** — the run
died, and an unsecured run must not be submitted.

The era gate was discharged cleanly and early in both controller rides: `arrivedAt: 25.6 s`, road graded,
9 tar harvested, **16.279 of 36 fuel drawn**, 87.94 units driven of which 60.64 rode graded road.

| run | result | note |
|---|---|---|
| probe (idle) | w2 / 79.033 s / 0 g | reproduced the published null floor to the hash |
| `tune-1` | w2 / 69.633 s / 60 g | errand perfect, **zero works built** — fort gated behind the errand |
| `attempt-1` | **w13 / 396.633 s / 175 g** | beacon-first ladder riding during the errand; died one wave short of the boss |

Reel envelope on the scored tape, all three axes: `durationTicks` 11,899 · last accepted order tick 11,700
· 48 entries of 3,601 · **178,465 bytes** against a live ceiling near 1.94 MB (computed from
`runTapeEnvelopeForContract`, not the charter's 592,544-byte summary — that number is stale).

## What the map asked

It asked about **distance, road and fuel — E4's signature mechanic, live, legible and gating the secure** —
and then it asked the same question a second time in the shape of a boss. This is not stationary survival
wearing the era's name at either end. `now.motor.objective.arrived` is ANDed into the secure at every wave,
and the boss kill only secures a run whose errand is already done, so the errand is half the win condition.
The leash is real arithmetic: three tar nodes × three tar × four fuel = **36 total** against a Hauler that
burns 3/second **by the clock**, so the naive 82.5-unit open drive costs ~27.5 fuel clear and about 39 under
a storm and can strand the objective outright. Staging the hero at the corridor stake (0,12), `GRADE`-ing
`camp-to-railhead` first, and only then walking to the railhead turned that into **16.279 drawn with 19.7
left in the tank**, latched at t = 25.6 of a 600-second ceiling.

The boss is the second, better spatial question and it publishes its own counter: `orbitSpawn` gives centre,
radius 24 and angular speed, and `land_yacht_crane` gives reach 6 — so the turret ring radius falls out of a
**two-sided inequality** rather than a guess. A turret at radius *r* covers arc half-angle
`acos((320 + r²) / 48r)`, maximised at `r = √320 = 17.889`; the crane one-shots any turret it can reach,
i.e. any `r ≥ 18`. With `gridSnap` 1 the integer point **(12,13) gives r = 17.692** — 41.8° of half-arc each
(~334° of the lap across four) with 6.308 of crane margin. All four ring spots sit inside the `motor-camp`
build zone. I never got to test the ring against the boss: the run died at wave 13 and the Land-Yacht
arrives at wave 14.

The fields that carried it were `now.motor.objective` (`kind`, `corridorId`, `stop`, `stopReach`,
`arrived`), `now.motor.fuel.nodes[].harvested` with `tar`/`stored`/`drawn`,
`now.motor.roads.corridors[].start/graded` with `gradeReach`, `now.motor.vehicle.state/x/z`,
`now.motor.weather.phase`, plus `now.works.byKind`, `now.seams[].active/x/z/anchorIndex` (an inactive seam
publishes all three as `null`, and one non-finite number refuses the whole array silently), `now.gold`
against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z` and `now.orders[].status/reason`. The orders were
**`MOVE_HERO`, `GRADE`, `HAUL`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT` — **not one E4 verb,
because E4 has none**; the whole era is answered with the player's own controls.

My notebook remembers this map from generations 16, 51 and 71, and **it still plays the way I remember** —
same claim, same three tar nodes, same `camp-to-railhead` stake, same 36-fuel leash, same orbit at radius
24, same w2/79.033 s floor. It is **not** named as cured this week.

## Winnability

**Yes — winnable (I secured it here on era 5 at generation 71, and every gate constant reproduced), and
what stopped me was my own budget: one usable ride against a 25-minute wall, spent on a fault my own
notebook had already named twice.** `tune-1` proved the errand (t = 25.6, 19.7 fuel spare) and died at wave
2 with **zero works**, because the ladder only existed in the post-errand phase — generation 72's "never
gate the fort behind the errand", re-broken. `attempt-1` fixed exactly that and went w2 → **w13**, but died
one wave short of the boss with **175 gold idle** and only three of four turrets standing, because my hard
build floor at t = 330 (sized for a wave-14 bank) refused the 125-gold fourth turret when gold reached 145
at t = 362 — generation 111's "a bank gate and a hard build floor conspiring to make the fort unreachable
exactly when it is needed", third sighting. The fix is two lines and is not a strategy change: **bypass the
build floor whenever the hero is below ~60 % or the core ladder is unfinished**, and drop the floor to the
surplus rungs only. The hero bled 175 → 0 across waves 9–13 with the emergency beacons behind that same
shut floor.

## Lessons for my notebook

- **`null-floors.json` first, every ride — seventh heat running, and it has never once been wrong.** One
  file published `w2 / 79033 ms / 0 gold / 34 kills / fnv1a32:7e5b43cc` before I ran anything, and the
  ten-second probe reproduced it to the hash. On an era named for rebuilt maps that is simultaneously the
  proof the rules did not move, the licence to spend the whole reading budget elsewhere, and a verified
  instrument. Pair it with one grep of the era pins for the contract id (zero matches here).
- **I re-broke generation 72's "never gate the fort behind the errand" by STRUCTURE rather than by a
  condition.** I carried no explicit gate — the ladder simply lived in the phase-B branch, and phase A
  returned early. A phase that returns early is a gate you did not notice writing. **Emit the ladder and
  the tail unconditionally in every phase and let array order do the sequencing** (the errand's own
  `MOVE_HERO` records own the tick while they walk, which is all the ordering that is needed). One
  structural edit took the same seed from w2 to w13.
- **A hard build floor needs exactly one bypass, and "the core ladder is unfinished" is it.** Generation 85
  taught me a flat floor cannot be argued with the way an `urgent` clause can, and that is right on a run
  you are comfortably winning. On a run you are losing it is lethal: my floor shut at t = 330 and then
  refused the fourth turret at t = 362 and every emergency beacon after, while the hero bled to nothing
  with 175 gold in hand. Generations 110, 111 and 113 each recorded this; generation 128 is the fourth, and
  the first where I wrote the floor knowing the lesson. **Gate the floor on `coreComplete`, not on the
  clock alone.**
- **Size a build floor against the thing that ENDS the run, not against the bank tick.** I set 330 from
  "wave 14 banks at t ≈ 424, so leave ~90 s of refill". That arithmetic is only valid if the run reaches
  t = 424. On a boss contract whose kill IS the secure, there is no partial credit for a full purse — a
  dead run banks nothing, and the gold axis ranks *below* waves anyway.
- **The crane is the constraint that can zero you; the arc is the one that shaves a percent.** The arc
  integral is nearly flat from r = 14 to r = 18 (40.8°–41.8°), while `land_yacht_crane`'s reach 6 against a
  radius-24 orbit is a hard cliff at r = 18 that one-shots a turret for `target.maxHp`. Rank candidate
  radii by the constraint that can zero you: (12,13) at r = 17.692 is 99.9 % of the optimal arc with
  0.308 of margin, where generation 16's (13,13) at 18.38 sits on the wrong side.
- **Turret range 16 against a ring radius 17.7 does not cover the ring's own centre.** No point on x = 0 is
  inside 16 of all four ring turrets (the two far ones are ≥ 25 away), so the hero post is a real choice,
  not a default. (0,14) is covered by the two north turrets at 12.04 each, keeps 10 units of orbit
  clearance, and cuts the Prospector's round trip to the only near seam from 99 to 65 units. The centre
  (0,0) is covered by **nothing**.
- **On a far-seam map the seam's own supply rate is the ceiling and the hero's post is the throttle.**
  One seam is `capacity/(drain + respawn)` = 30/(9 + 20) ≈ 1.03 g/s, and the three live anchors sit 49, 71
  and 71 units from the ring centre. Measured 450 panned over 396 s ≈ 1.13 g/s — essentially the seam's own
  ceiling, so no panning policy could have funded a bigger fort. The lever was never income; it was **cost
  per standing gun**, and a 25-gold beacon lands ~20 seconds before a 50-gold turret can.
- **Declining the cap-raiser was right and the reason is the income, not the roster.** This roster has no
  thief, so a `stockpile` is safe here (unlike generation 106's 435-gold lesson) and is +90 net *when the
  surplus would otherwise exceed the cap*. At ~450 panned against a 340-gold turret ladder the surplus
  never approaches 200, so both stockpiles would have been pure loss. **Check whether the purse can FILL
  the cap you are about to raise before buying the raise.**
- **Check the outcome file says what you mean — the comparator cannot know which run you meant.** Mine
  promoted the *idle probe* over a w13 run, because its "better" test was written for securing rides.
  Eleventh generation to hit this exact caveat; I hand-wrote the final row again. The runner still earned
  its place: it made the intermediate-results law automatic (a truthful row existed from the probe onward),
  printed all three envelope axes on every child exit, and its per-view table located both faults in one
  read each.
