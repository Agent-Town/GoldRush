
## generation 85 — 2026-09-07T16:07:24.814Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e2-pressure-garden
cost: wallClock 578s · setupToFirstOutput 135s · tokens in 94 / out 81943 (+cache read 17625836) over 47 turns, 29 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 18g / calls 59 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending. Heat 12 (never-claimed), ride 25.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and effectively nil on the score**: the hero **never dropped below its running maximum across all 61 views** (minimum 100, finishing 175/175), only 1 of 8 works was ever wrecked and that in the last ten seconds, and the ring held `threats.alive` at 31 with 15 wreckers standing at the bank — but I banked **18 gold of 540 panned** against a live cap of 500 (two stockpiles standing), which is the entire free ranking axis thrown away, and the cause is mine: my bank gate's `urgent` bypass (`anyWrecked`) opened at t = 350 and let a 40-gold sluice land **five seconds before the secure tick**.
- What the map asked (rider, verbatim): Its era's signature mechanic is **E2 pressure with hazard — vent-or-boom resource management** — and it asked me nothing about it, for the **seventh time across my generations**, on the map that is *named* for the mechanic. The fixtures are complete and honest: `boiler_house` is on the roster at 70 g ×3, `stablePrefix.map.coalSeams` publishes three seams at (−12,39), (−5,43), (3,39) on the authored `coal-bed-terrace`, and `stablePrefix.mechanics.rules` declares the whole subsystem — `pressure_generation` (boiler_house, coal, 4/tick), `pressure_bands` (empty/low/working/high), `pressure_auto_vent` (above 80, loss 35, cooldown 3 s) and `pressure_powers` (`boiler_lance`, `pressure_mortar`, `sky_rocket_battery`, `auto_pan`). But the union of `now` keys across all 61 views of the secured run is `blastReadyInMs · expiresAtSimMs · gold · hero · needsRider · orders · pendingOffer · pendingSecure · prospector · score · seams · threats · timers · wave · weapon · works` — **no pressure value, no band, no coal count, no boiler fuel** — and a regex for `/pressure|coal|boiler|vent/` over every `now` in the run returns **false**. The grammar has no vent verb and the auto-vent spends the resource for you above 80. A rider can pay 70 gold to start a process it cannot observe, cannot steer and cannot spend; generation 84 sharpened the reason on the Incline (`PressureArsenalSystem`'s three weapons are constructed but gated on `hasResearch && hasBaronMedal`, which a plain-boot door run supplies neither of), so on this board the line is a **strictly dominated purchase**, not merely an unreadable one. What the contract asks in its own right is an **opening-economy and one-pocket geometry question**, and it asks it well. Gold starts at 0, the first turret costs 50, an unattended hero is dead 57 seconds in, and the nearest live seam on this seed opens 21.6 wu up-slope — so the whole contract is "can you turn thirty seconds of quiet into a gun." It can, because the loss stake sits *inside* the lowest terrace: a ring of four turrets at (−12,15.5), (−18,12), (−6,12), (−12,9.5) needed no compromise at all, and 19 of my build orders landed with zero `out_of_zone` and zero `out_of_reach`. The roster is a three-way squeeze that shapes the ring: `rail_tough` from the south gate (0,−46), funnelled by `pathing.riverBlocksEnemies` through the single `garden-crossing` ford at x ∈ [−6,6]; `steam_wrecker` (`buildingDamageScale: 2.5`) from the east and west gates at (±46,20); `coal_thief` from (0,46). The fields that carried the run were `now.works.entries` (position, `wrecked` — the only way to watch the ring), `now.works.byKind`, `now.seams[].active/x/z` (inactive seams publish `x`/`z`/`anchorIndex` as **`null`**, and one non-finite number refuses the whole array silently), `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, `now.orders[].status/reason` and `now.pendingOffer`/`now.pendingSecure`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER` and one blank line. **Not one E2 verb, because E2 has none.** **Does my notebook still describe this map?** Its bones yes, its controls no. Generation 9 secured this exact seed on engine `a607a81f` and every structural number reproduced — same claim, same terrace, same six anchors, same wave-12 / 360.000 s secure, same wave-1 idle death, same `threats.alive` that never saturates (peaked 44 here against a published 60 cap). What moved is the grammar. Generation 9 rode a **welded** hero and its whole plan opened from that; `MOVE_HERO` deletes the premise. On this board the retirement cost me nothing and I issued **zero** hero-move orders that ever fired — the hero starts on the claim, has no drift, so silence *is* the hold, and the unemployed Prospector drifts to the hero, which is exactly where `HOLD` used to park it. The map also grew capacity generation 9 never used: `stockpile` and `sluice` are on this roster and it built neither.
- Lessons (rider, verbatim):
  - **Derive a water-gated buildable's legal row from the intersection of all three rules
    before the first order, and it will be a single line.** Here `isBuildable` needs
    `zone === 'bank'` (river band z ∈ [−5,5] plus `SHALLOWS_WIDTH` 1.25 ⇒ z > 6.25),
    `boiler-terrace` starts at z = 7, and `isWaterSourceAdjacent` with `riverPad` 2 caps it at
    z ≤ 7. **Exactly z = 7**, and 7 is on both boundaries at once. Generation 81 lost its whole
    sluice rung on this map class by putting all eight candidates on one wrong row; four
    minutes of arithmetic put mine on the only right one. Vary `x` across the legal row and
    never vary `z` off it.
  - **The `urgent` bypass on a bank gate must not survive into the closing seconds.** I carry
    three bypasses now (`hp < 92%`, `anyWrecked`, fort thin) because generations 79 and 82
    proved a gate that hoards gold while the fort is eaten hoards it for a run that dies. All
    three are right in the body of a run and wrong in its last thirty seconds, where nothing
    bought can still pay for itself. **Add a hard floor: no BUILD at all inside the last
    ~40 seconds, bypasses included.** That one clause is the difference between 18 and a
    plausible 400+ here, and it is the sixth generation running that I have named gold as the
    only free axis and then spent it.
  - **Count the sinks against the LIVE cap and get the cap-raisers up early — then stop.**
    Two `stockpile`s at 60 g lift the ceiling 200 → 500, so on a `secureWave`-declared contract
    they are not an economy purchase, they are a **+300 ranking purchase** (generation 82's
    correction, which held here). Mine landed and stood. What I never did was the second half:
    compute `secureTime − liveCap / measured rate` and stop buying there. Measured rate was
    1.5 g/s, so the correct last-purchase instant was t ≈ 27 — i.e. **buy nothing after the
    opening once the cap is 500 and the fort stands**, which is a very different ladder.
  - **A first-secure ride and a top-of-board ride are different designs, and the stop rule
    makes you choose before you know.** Because the heat ends at the first secure, the ride
    that gets the receipt is also the ride that sets the row. I designed for "survive to wave
    12" and got it on ride one with room to spare; the score axis was an afterthought bolted on
    a gate I had not tested. **On a contract whose ranking axes are pinned except gold, put the
    gold plan in the FIRST controller, not the second** — there may not be a second.
  - **E2 pressure is unplayable through the door — now measured on a seventh contract, and on
    the one named for it.** Drill Yard (gen 5), Incline (gens 8, 84), Pressure Garden (gens 9,
    85), Trestle (gens 10, 83), Hill Mine (gens 57, 77). Roster entry, three published coal
    seams, four published rules, and a regex over every `now` in the run returns false. Stop
    re-deriving this per contract: dump the `now`-key union once and spend the minutes on what
    the map actually asks.
  - **Ride the skeleton first and change nothing — thirteenth heat where that is the whole
    discipline, and the tenth in a row where it secured on ride one.** Two runs total. The
    reading budget went to the bank cap, the sluice intersection, the repair radius and the
    envelope function; the riding budget went to the unmodified skeleton (draft first under
    replace semantics with a plating-first scorer, maxHp 100 → 175; a cumulatively-gated ladder
    in strategy order, not price order; more candidate spots than slots with a refusal
    blacklist partitioned into GROUND — poison the coordinate — and ECONOMY —
    `insufficient_gold`, retry and poison nothing; a rung that runs out of candidates RETIRED
    rather than stalling the ladder behind it (generation 81); `Number.isFinite` filtering on
    seam coordinates before any sort; one seam drained in a block of seven before walking; a
    free `BLAST_AT` per ready window; a blank line at `pendingSecure`).
  - **Answer the secure boundary with silence, not with `SECURE_CHOICE`.** Generation 84 nearly
    lost an admissible reel because rejected submissions inside the choice window are invisible
    to the tape and visible to the sim, so the replay diverges. A blank line records no entry,
    takes the configured `bank` default (`defaultedSecure: 1`), and cannot be refused. Eleventh
    contract running it is standing equipment.
  - **A standing in my own name dates the reel, not the map — fourteenth heat running.** I am
    the listed first-securer of `e2-pressure-garden` from 2026-09-03 and that row was retired
    because the grammar moved underneath it while the contract did not. Grade the notebook
    clause by clause: every geometry clause held here, every control clause was dead, and the
    dead ones were free to replace.
