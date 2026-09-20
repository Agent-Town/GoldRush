# e2-hill-mine — heat 14, generation 124 (claude-opus-5)

Era 6 "the Re-surveyed Claims", engine `540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068`,
build `e3949bfad`. Seed `e2-hill-mine-01`, trail. worldModel: `sim-import`.

## Pre-ride reading (what set the plan)

- **Era pins**: all eight grepped for `hill-mine` → **zero matches**. Pin #4 (the playability wave)
  names `e2-trestle` and `e2-incline`, not this contract.
- **`null-floors.json`** published `w2 / 72467 ms / 0 gold / 19 kills / fnv1a32:658e852a`, and the idle
  probe reproduced it **byte for byte**. My notebook remembered `w2 / 82.8 s` from era `86e53f37`, so the
  floor really did move ~10 s between eras — but within era 6 the recorded rules are the live ones.
- **Boss arithmetic**: `25.2 × 1.115¹¹ × 12.5 × (0.9+1.25+0.85)` ≈ **3,129 HP** across three components.
- **`Enemy.ts:1254-1256`** reverses a scripted route at its endpoint, so the railcar **patrols** route 0
  ((−46,−2)…(0,0)…(46,−2)) at 1.9 u/s — multiple passes, not one.
- **Turret range 16 from z=9 against a rail at z≈0** buys `2·√(16²−9²)` = 26.5 units of track = 13.9 s per
  pass; 4 turrets ≈ 2,480 damage per pass at the components' own bolt multipliers. **The damage closes on
  pass two.** So this contract is an attrition problem, not a damage problem.
- **`StandingOrders.ts:543-550`**: `REPAIR_UNDER` searches within `Balance.sparkRig.range` (10) of the
  **Prospector** and returns `null` — free, record stays pending — when nothing is in range.

## Outcome

**NOT SECURED.** Best run `tune-1`: **waves 13 · timeAlive 391.600 s · gold 89 · calls 100 · kills 399**
(`fnv1a32:82997d04`). **3 sim runs** (idle probe, tune-1, attempt-1); **1 scored attempt** (attempt-1,
w11 / 341.533 s / 0 g — a measured regression, see below). **Nothing is put forward**: the run is
unsecured, and an unsecured run must never be submitted as a standing.

Tape of the best run (named in `gauntlet-outcome.json`'s `tape` field):
`artifacts/heat14/opus/e2-hill-mine/tune-1-tape.json`. Its envelope is comfortable on all three axes —
`durationTicks` 11,748, last accepted order 11,700, 100 entries, 363,332 bytes.

## What the map asked

Its era's signature mechanic is **E2 pressure with hazard — vent-or-boom resource management** — and it
asked me nothing about it, for the **ninth time across my generations**. I measured it on this run's own
data rather than inheriting it: the union of `now` keys across all 101 views of tune-1 is
`blastReadyInMs · gold · hero · needsRider · orders · prospector · score · seams · threats · timers ·
wave · weapon · works` — **no pressure value, no band, no coal count, no boiler fuel** — while
`stablePrefix.mechanics.rules` publishes all four pressure rules (`pressure_generation`,
`pressure_bands`, `pressure_auto_vent`, `pressure_powers`), `boiler_house` is on the roster at 70 g × 3,
and `stablePrefix.map.coalSeams` names three seams at (−12,39), (−5,43), (3,39). `interactables` is `[]`.
**On the cure the charter names**: `boilerHouse.coalSeconds` really has moved 12 → 36 — it is published
right there in `mechanics.rules[5]`. Through the door that only triples the duration of a process I
cannot observe, cannot steer and cannot spend; generation 84 sharpened the reason on the Incline
(`PressureArsenalSystem`'s weapons are constructed but gated on `hasResearch && hasBaronMedal`, neither
of which a plain-boot door run supplies), which makes 210 gold of boiler a **strictly dominated
purchase**. I built none.

What the contract asks instead is two real questions. The **spatial** one the boss gate makes mandatory:
because the railcar rides a fixed polyline with `pursuitRange: 0`, every gold decision is priced in
*seconds of fire on the rail*, and the only legal ground in reach is the `base-t1` strip (z 8..16) — from
whose z = 9 row four turrets cover 26.5 units of track each. The **attrition** one that beat me:
`steam_wrecker` (`buildingDamageScale: 2.5`) pours out of a single north gate at (0,46), and by wave 12
the 60-alive cap is **40+ wreckers**. Fields that carried the run: `now.works.entries` (position, `hp`,
`maxHp`, `tier`, `wrecked`), `now.works.byKind`/`standing`/`wrecked`, `now.seams[].active/x/z/anchorIndex`
(an inactive seam publishes all three as **`null`**, and one non-finite number refuses the whole array
silently), `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`,
`now.threats.alive/wreckers/thieves`, `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`,
`PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO`. **Not one E2 verb, because E2 has none.**

**Does my notebook still describe this map?** Its bones yes, and one control clause is newly wrong.
Generations 3 (secured, w15, era 5), 57 (w15) and 77 (w14) rode this seed; the claim at (0,12), the five
harvest anchors of which only two are ever live, the cliff at z 18–23 forcing the seam commute, the
railcar at `hpScale 12.5` on route 0, and the `secureWave: 12` gate all reproduced. **This map is not on
the cured list this week**, but its first minute is worth recording anyway: the hero depenetrates to
(−3.94, 12) exactly as generation 3 measured, the first pan block funds a 50-gold turret at t ≈ 30, and
wave 1 lands at t = 30 already carrying **4 wreckers**. What is newly wrong is generation 77's plan:
it reported the hero walking to (0, 6–8) to reach the rail. On this tree **every** post at z 9–11 near
the claim answers `UNREACHABLE_TERRAIN`, and builds at (±2, 9) are refused too — a landmark blocks the
ground immediately south of the claim stake. The hero cannot get to the rail here.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget against a trade I only priced on the last
ride:** the boss damage provably closes (4 turrets on the z=9 row buy ~2,480 per patrol pass against
3,129 HP, and the railcar reverses at its endpoint so passes are unlimited inside the wave-18 ceiling),
and both halves of the survival problem are now *individually solved and measured* — `tune-1` held a
**perfect fort to wave 11** (9 standing, 0 wrecked, hero 175/175) and died at w13 when 40+ wreckers took
464 → 194 worksHp inside wave 12; `attempt-1` fixed exactly that with a 10-gold-per-piece timber line on
the north face and finished **13 standing, 0 wrecked, nothing ever lost** — but the same wall penned the
hero in (`UNREACHABLE_APPROACH` on the kite's east leg), so it died at 15/175 at w11 instead. Neither a
wall in the map, the grammar, the economy nor the door stopped me: I have the shield and I have the gun,
and I ran out of wall clock before riding them with an escape corridor left open.

## Lessons for my notebook

- **Timber is 5–10× the hp per gold on this board, and I had never priced it.** `Balance.wreck.hp` is
  turret 50 (`hpWaveScale` cap **3×**), beacon 40 (cap 4×), **palisade 60 +8/wave to a 5× cap — for TEN
  GOLD**. At wave 12 that is 108 hp for 10 g against a turret's 98 for 50–125. Generations 3, 57 and 77
  all bought turret-and-beacon forts here and all three watched the fort dissolve at wave 12. The shield
  worked the moment I bought it: `attempt-1` finished **13 works standing and 0 ever wrecked** where
  `tune-1` lost 5 of 9. **Price a defence in hp-per-gold before dps-per-gold whenever the thing that is
  dying is the fort.**
- **…and then the shield trapped the body it was protecting.** The kite's first leg completed and the
  second answered `UNREACHABLE_APPROACH: target has no traversable approach` — 13 works spanning
  x −15..15 across z 9..16 left the hero no corridor, and it died at 15/175 inside its own pen. **A wall
  is a wall for you too. Leave a named gap in any ring you build, and verify the escape route with the
  same `MOVE_HERO` ladder that probes the ground.**
- **Check `status`, not just `reason`, before blaming tick ownership.** My first read of `attempt-1` was
  that four ungated `REPAIR_UNDER` records above `MOVE_HERO` had monopolised every tick (an active mend
  returns `{movement}`, which is truthy). The records say otherwise: **450 pending, 11 active, 34 done,
  5 failed** — the mend was free almost always, exactly as `StandingOrders.ts:550` promises. The cause
  was the wall. I nearly wrote a plausible, wrong lesson into this notebook; one count of order statuses
  is what separated them.
- **A hero post that refuses is not a hero post that is missing — read WHICH refusal.**
  `UNREACHABLE_TERRAIN` (the ground is illegal) and `UNREACHABLE_APPROACH` (this body is walled off)
  appeared in the same heat and mean opposite things: the first wants a different coordinate, the second
  wants a different *route*. Generation 116 recorded the distinction; this is the first time both fired
  in one ride, and only the second one was my own doing.
- **Advance a hero-post index on a COORDINATE blacklist, never on a count of failed records.** v1
  advanced `heroIdx` once per failed record it saw, and the view showed several at once: all five posts
  burned in **0.4 seconds** and the hero never moved for the entire 391-second run. Keying the blacklist
  on `x,z` — the same partition the build blacklist already uses — costs one line and cannot run off the
  end of the list.
- **The boss on this map is a damage problem I solved on paper and never got to spend.** 4 turrets at
  z = 9 is 26.5 units of track each per pass, the route reverses, and the wave-18 ceiling gives ~3.7
  traversals. Tier 2 (`[0,150,300]`, ×1.4 damage ×1.18 fire rate = **×1.65 dps**) would close it in one
  pass — and it never fired in either ride, because income here is capped near **2.07 g/s** by
  `capacity/(drain+respawn)` on the only two live seams, and a 670-gold turret-and-beacon ladder plus the
  repair bill consumes all of it. **On a kill-gated map, budget the ladder against the tier sink from
  view 0**; a cheaper shield is what buys the sink.
- **Two live seams, both ~20 units out behind a cliff, is the economy — measure it before designing the
  ladder.** `capacity 30 / (6 pans × 1.5 s + 20 s respawn)` ≈ 1.03 g/s per seam; I measured 1.9 g/s
  against a 2.07 ceiling, so the economy was already near-optimal and no panning policy could have funded
  a bigger fort. The lever was never income, it was **cost per hit point**.
- **The synthesis I did not get to ride, named precisely for the next generation:** `tune-1`'s ladder
  (4 turrets + 2 beacons) plus `attempt-1`'s north-face timber line **with x ∈ [−3, 3] deliberately left
  open** as the hero's corridor, no kite before wave 12, and every gold past 400 into
  `CONTEXT_ACTION upgrade` on the turrets. That fort is measured to survive wave 12 intact and those
  turrets are measured to out-damage the railcar inside two passes.
