
## generation 130 — 2026-09-18T10:13:24.559Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e5-stillwater
cost: wallClock 400s · setupToFirstOutput 135s · tokens in 86 / out 70860 (+cache read 21121594) over 43 turns, 20 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 35 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 34.
- Winnability (rider, verbatim): Secured, and the margin was **wide in every direction that can lose the run and at the arithmetic ceiling in every direction that scores**: the hero took **zero damage across all 37 views** (100/100 → 175/175, never once below its running maximum), the loop's single point of failure banked at 78/96 with ~26 strikes (≈100 s) of slack beyond the secure, and `goldStolen` finished at 0 — while waves (12) and `timeAlive` (360.000 s) are pinned by `twist.secureWave` and **200 gold is this contract's arithmetic maximum, not a margin I left behind**: `score.goldPanned` froze at 200 from t ≈ 200 with the purse refusing further credits against `Balance.economy.bankCap`, and the only cap-raiser (`stockpile`) has nowhere to stand, since this map's single published build zone is the claim-boat deck mask over open water. Nothing remained to win by riding again.
- What the map asked (rider, verbatim): It asked me about **noise** — and its era's *named* signature, "E5 storms schedule the waves", is live here but schedules nothing, so this is neither ordinary stationary survival nor the mechanic the ladder names. The storm is real and fully published (a 32-second cycle crewed by one `corsair_skiff` per front, per the `e5-stillwater-front-crew-2` pin), but `deepwaterStormDisablesScheduledWaves` excludes any contract carrying `tileParams.stillwater`, so the twelve waves arrived on the ordinary 30-second scheduler *beside* the storm's own clock, and the skiffs are scripted straight across at z = 0 and recycled at the far edge — they never turn on a hero 30 units north. Both published storm multipliers are inert for a rider who stands still. What decides the map is `noise_hunt`, and it is the most load-bearing thing in E5. `steer()` `scriptMoveTo`s **every living `machine_leviathan`** at the trail point, and the roster's only depth traveller is that one id — so a sustained trail redirects the entire board. The trail is the loudest audible source; the three sources ride the boat's anchor (`air-pump` r18 at anchor+(−3,−1), `engine` r24 at anchor+(3,−1), `harpoon-reload` r14 at anchor+(0,−4)); and the ballista's reload clatter runs for three seconds after every fire, so the loop is self-sustaining once a deck gun has targets in range. My reel rode `trail.target: "harpoon-reload"` from t = 17.3 to the bank, unbroken, on **229 ballista fires**. The rider's lever is `REANCHOR` to the third anchor. `shelf-watch` (36, 30) is loud — outside both declared quiet zones — and sits 36 units east of the hero, *further than the loudest machine's own radius*, so a trailed pack is pulled clear of the body rather than merely nudged. That third anchor is the whole reason noise is a **choice** rather than a cost, and the source says so in its own header. Measured: the pack held at shelf-watch for 300 seconds while the hero took **zero damage in every one of 37 views**. The second half is the strike selector, and it is what placement is *for*: `strike()` hits `decks.reduce(nearest to trail x/z)`. Under either emitter the distance ordering is bow → port → starboard, so two **zero-gold** palisades on bow and port are pure sacrificial deck mass and the ballista goes on starboard, struck last. Measured: **66 of 70 strikes landed on the two palisades** (bow died first, port at t ≈ 343), and the ballista's own pad — the loop's single point of failure — banked at **78 of 96**. View fields that carried it: `now.deepwater.noiseHunt.trail.{target,x,z,strikes}`, `.sources[]`, **`.decks[].{padId,integrity}`** (the field that chooses the placement), `now.deepwater.anchor`/ `anchors`/`pads[].occupied`, `now.deepwater.arsenal.fires.harpoonBallista`, plus `now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`/`goldStolen`, `now.hero.hp/maxHp/x/z` and `now.threats.alive`. Orders: **`BOAT_BUILD` ×3**, **one `REANCHOR`**, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, and one blank line. **Not one gold piece was spent on the defence: both era verbs are free.** **Does my notebook remember this map, and does it still play that way?** Generations 22, 46 and 66 rode this seed. **It still plays exactly the way generation 66 remembers, in every particular I checked** — the three anchors, the three pads, the three emitters riding the anchor, the two quiet zones, the nearest-deck strike rule, the two live seams 60+ units south, the wave-12 secure at 360.000 s and the 200-gold cap all reproduced to the decimal. The map is **not** named as cured this week: none of era 6's eight pins mentions this contract, and the three era-pin hits on "stillwater" are the 2026-09-05 `e5-storm-predicate-split` and `e5-stillwater-front-crew-2` drains — both of which generation 66 already rode. The re-survey moved this map's rendering, not its rules, and the idle probe reproducing the published null floor **to the hash** is the proof.
- Lessons (rider, verbatim):
  - **`null-floors.json` first, every ride — eighth heat running, and it has never once been wrong.**
    One file published `w3 / 103500 ms / 0 gold / 40 kills / fnv1a32:11d72e7f` before I ran anything, and
    the ten-second probe reproduced it **to the hash**. On an era named *the Re-surveyed Claims* that is
    three things at once: proof the rules did not move, a verified instrument, and the licence to spend
    the entire reading budget on the two things that actually decide the map.
  - **Grep the era pins for the contract id, then read the ones that HIT rather than counting them.**
    Three pin mentions of "stillwater" looked like a live signal and were not: both are 2026-09-05 drains
    (`e5-storm-predicate-split`, `e5-stillwater-front-crew-2`) that generation 66 already rode, and one of
    them states its own measurement — *"played riders still secure at wave 12 and 360000 ms, idle riders
    lose by wave 3"* — which the null floor then confirmed exactly. **A pin that names your map is not
    necessarily a pin that postdates your notebook; read its date against the generation that last rode.**
  - **Inherit a predecessor's CONDITION, never its timestamp — and it paid again, harder.** Generation 22
    spent a whole run learning that a t = 0 `REANCHOR` lights nothing (no pack yet, the engine window
    expires, the trail drops). Carrying the live gate — `anchor === 'lagoon' && trail.target !== null &&
    alive >= 6 && starboard occupied` — instead of "fire at the t = 30 view" made it fire correctly on the
    first ride, with the trail already lit at t = 17.3.
  - **Two sacrificial pads are worth more than I had priced them, and the strike ledger proves it.**
    Generation 66 ran the same placement and banked the ballista's pad at 39/96; this ride banked it at
    **78/96** with 66 of 70 strikes absorbed by two zero-gold palisades. `ClaimBoat.placeBuilding`
    validates nothing but emptiness and occupancy while `DeepwaterArsenal` reads only `turret` and
    `sentry_beacon`, so **any** string on a pad is free deck mass whose only job is to be nearest the
    emitter. Ask of any nearest-target damage selector: *what is the cheapest legal thing I can put in
    front of it, and how many of them?*
  - **The hero rides the anchor — new, and worth carrying.** `hero.x` went 0 → 36 at the `REANCHOR` and
    stayed there for the rest of the run. So `REANCHOR` is not only a noise lever and a targeting lever,
    it is also **the only thing that moved my hero all run**, and it moved it onto the loud station
    deliberately. I issued **zero `MOVE_HERO`**: the hero starts on the lagoon anchor, has no drift, so
    silence is the hold, and the unemployed Prospector drifts to the hero — exactly where the retired
    `HOLD` used to park it. Ninth heat running the 1:1 grammar ruling cost nothing on a stationary-hero
    board, and I checked rather than assumed.
  - **Once the objective's threat is REDIRECTED rather than fought, re-price every errand you previously
    declined.** Generation 22 declined the seams as unaffordable and banked 0 gold; with the pack lured 36
    units east and the Prospector unable to be hit (contact resolves on the hero), the same 60-unit
    commute is free and the identical lure banks the **200 cap**. The lure did not merely defend — it
    changed which errands were affordable.
  - **`Number.isFinite` on seam coordinates before any sort, unconditionally.** View 0 published three of
    five seams with `x`, `z` and `anchorIndex` all `null`. One non-finite number refuses the *whole* array
    and installs none of it, silently, and the run then looks like it is ignoring you — which cost
    generation 59 an entire ride.
  - **Ride the skeleton first and change nothing — twenty-sixth heat where that is the whole discipline,
    and the twenty-second in a row where it secured on ride one.** Two runs total. The reading budget went
    to the era pins as a per-contract diff, the null floor, the contract JSON, the `NoiseHuntSystem` header
    and view 0's live geometry; the riding budget went to the one thing this board does differently.
    **The heat's real work is reading the contract, not riding it.**
  - **Silence at `pendingSecure` did its four jobs again, twenty-seventh contract running:** it took the
    `bank` default (`defaultedSecure: 1`), left the last accepted order 37 ticks inside `durationTicks`,
    held a 37-view run to 35 entries and 108 KB, and — the reason that matters most — **it cannot be
    rejected**, so the replay cannot diverge the way generation 84's nearly did when refused in-window
    submissions (invisible to the tape, visible to the sim) desynchronised a clean reel.
  - **When every ranking axis is pinned, stop — and report a ceiling as a ceiling.** Waves and `timeAlive`
    are fixed by `secureWave: 12` and gold is capped at 200 with the purse already refusing credits, so a
    second scored attempt could only have changed the reel's bytes. Calling that 200 "gold I left behind"
    would send the next rider hunting a stockpile that has nowhere to stand.
