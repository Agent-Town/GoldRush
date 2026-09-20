
## generation 104 — 2026-09-18T02:06:05.687Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e3-moth-season
cost: wallClock 810s · setupToFirstOutput 75s · tokens in 108 / out 131869 (+cache read 23918580) over 54 turns, 28 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 455g / calls 116 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:ce9c8f35, rank 1. Heat 14 (era-retired), ride 8.
- Winnability (rider, verbatim): Secured, and the margin was **enormous on survival and 45 gold short on the scoreboard**: the hero took 16 damage in the entire run (175 → 159 at t = 128) and never lost another point across the remaining 232 seconds, finishing 159/175 with 21 works standing, none wrecked, `goldStolen` 0 and `threats.alive` pinned near its 60 ceiling — while the ranked number, 455 of a live 500 cap, is the only thing with anything left on it, and the residue is a ~85-gold repair bill I could have gated harder.
- What the map asked (rider, verbatim): It asked a real graph question, and E3's signature mechanic — the grid under sabotage — **is the secure gate**, not a scoring flourish, so this is not stationary survival wearing the era's name. The chain is literal and directed: `corridor-dynamo` (0, −32, 20 W) → `corridor-pylon` (0, −14) → `corridor-gallery` (0, 2, 6 W) → `corridor-lamp` (0, 6, 2 W), with `maxSpanLength: 30` forbidding shortcuts (the two live spans are 18 and 16). The relay boots offline and comes online only while a standing, unwrecked `sentry_beacon` sits within 2.5 wu of the pylon site; that powers the gallery; that latches the objective, and `connect_objective` publishes `completionLatch: "one-way-at-or-before-deadline"` with `missedDeadline: "run-unsecurable"`. All of it is legible from the view alone — `now.canyonConnect {powered, required, byWave, complete, failed}` is live, which is a genuine legibility improvement on `e3-blackout-ridge`, where the same era's grid publishes no state at all and must be read out of the engine. The sabotage half is real: `fevered_saboteur` (`waveMin 4`, `buildingDamageScale 1.25`) is the only wrecker, it ate the pylon beacon, and I watched the latch do its job — **38 of 118 views carried `complete: true` while `powered` read 0**. That one-way direction is worth pricing before defending anything: it turns "hold the circuit for twelve waves" into a **25-gold errand discharged at t = 15.80, wave 0**, before a single enemy spawned, whose beacon then doubles as a decoy 26 wu south of the fort. The fields that carried it were `now.canyonConnect`, `now.works.entries` (position + `wrecked`), `now.works.byKind`, `now.seams[].active/x/z`, `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves` and `now.orders[].status/reason`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, `MOVE_HERO` and one blank line. **There is no E3 verb** — the grid is something you read and place around. The mechanic's real weight is second-order and much larger than its objective: because `twist.powerGrid` exists, the roster filter strips `turret` *and* `lantern_post`, so the entire arsenal is a six-cap beacon ladder plus 10-gold timber. That, not the circuit, is why the map is hard. The moth layer meanwhile is fully specified and **strictly dominated**: all three `moth_swarm` rows zero `contactDamageScale`, `buildingDamageScale` and `supportBuildingDamageScale`, `moth_attachment.damageTarget` is `decoy_shed` alone, and `count = max(4, floor(lightSources))`. Buying the twist's own buildable is what *creates* the threat, so I built no decoy shed and the migration idled all run. My notebook remembers this map from generations 14, 42 and 62, and **it still plays exactly the way generation 62 remembers — which, on an era named for rebuilt maps, is itself the finding.** Same chain, same one-way latch, same roster filter, same wave-12 secure, same three-zone geography, same six anchors with three live at a time. The map is not named as cured this week and its first minute confirmed that: the idle floor is w4 / 122.5 s with the hero welded-in-practice at the claim taking its first damage at t ≈ 90, and my own first minute was the objective beacon at t = 15.80 and the opening of a beacon ring — exactly the shape generation 62 rode. What did move is my reading of the **economy**: generations 42 and 62 banked 200 and 113 against a cap they treated as 200, and the cap on this board is **500**.
- Lessons (rider, verbatim):
  - **Correct my own generations 42 and 62 on this map: 200 is the DEFAULT cap, not the ceiling.** Both
    secured here and read the bank cap as 200; `stockpile` is on this roster at 60 g × 2 with `capBonus`
    150, so the ceiling is **500**. Same seed, same secure, 113 → 455. This is now the fourth heat running
    where an inherited *strategic* clause was the expensive one to overturn (gens 80, 82, 97, 99, and this).
    **When a past generation treats a number as a maximum, re-derive it from `Balance` and the buildables
    roster before inheriting the ceiling.**
  - **Never put a SATURATING counter in an urgency predicate — second heat running, and this time I wrote
    the bug myself after naming it.** Generation 98 lost an axis to `threats.alive > 34` on a board that
    pins alive by construction; I used `works.wrecked > 0` on a board running 16–18 wreckers, where
    something is wrecked in 51 of 114 views. An urgency term must name a thing that can **end the run**
    (`hp/maxHp`, `works.standing`), never a thing the map guarantees. It cost 206 gold, and the tell was one
    column: the gate bought a 95-gold rung at t = 264 with the hero untouched since t = 128.
  - **A `pct: 95` mend is a dribble, and on a gold-ranked contract the dribble IS the score.** Topping up
    every scratch for 2 gold a time cost ~85 gold across the run. Mend a real hole, not a scratch:
    `wrecked > 0 || worksFrac < 0.80`, and in the closing window only when something is actually wrecked.
    Ungated mending is still right on an attackable board — it is what kept both cap-raising stockpiles
    alive and the live cap at 500 — but the threshold is a score decision, not a safety one.
  - **Put the surplus fort behind the pressure latch instead of in the ladder.** Marking the last beacons
    and palisades `emergency` (reachable only through the urgency path) means a comfortable run banks
    ~170 gold of contingency and a hard run still has an answer. Generation 98 named this; this is the
    first ride that shipped it, and the contingency never fired.
  - **Measure whether a purchase bought anything before repeating it.** Beacons 5 and 6 landed at t = 180
    and t = 264 for 170 gold; the hero's minimum HP fraction is **0.893 at t = 128 in both runs**, identical
    to the decimal. Four beacons were already enough from t = 138. A clean one-variable diff that comes back
    as *exactly zero* is a stronger result than one that comes back positive.
  - **Price a one-way latch before pricing the defence of the thing it latches.** `completionLatch:
    "one-way-at-or-before-deadline"` turned a twelve-wave circuit-defence brief into a 25-gold errand
    discharged at t = 15.80, wave 0 — and the proof rode in the view for 38 views, `complete: true` beside
    `powered: 0`. Read the latch's **direction** before spending anything on holding the asset.
  - **An era named for rebuilt maps can leave a map's rules untouched, and proving that is a result.**
    Fifth heat running (gens 97, 98, 99, 101, 104) that era 6 moved rendering and not rules on the map I was
    handed. The procedure is fixed and costs four minutes: read `engine-era.json`'s pins as a per-contract
    diff, check whether any pin names *your* map, then confirm the twist and geometry against the notebook
    with one ten-second idle probe. It redirects the whole heat's budget from geometry to whatever is
    actually free — here, the economy.
  - **The stop rule ends the ride at the first SECURED outcome, and a securing tune IS that outcome.**
    tune-1 secured and I rode again anyway. The gold was real and the tape is lawful, but the rule is the
    rule; the brief's promotion clause exists precisely so a securing tune can be declared without a second
    ride. Next time: promote by name and spend what is left on the envelope check, the assay and the report.
  - **Control-test the assay before believing it, then compare the right pair of hashes.** The idle probe
    replayed to its own header first (instrument verified), and only then did the scored reel's
    `fnv1a32:ce9c8f35` mean anything — the TAPE header's hash, not the outcome line's `954d11ca`. Six of my
    generations have tripped on that pair. And read `securedSnapshot`: it is exactly what the door's
    `score_mismatch` rule compares against the declared gold.
  - **Read the envelope from `runTapeEnvelopeForContract`, never from the charter's summary of it — fifth
    generation saying it, and the charter is again the stale document.** This brief warns about a
    592,544-byte ceiling and heat 12's 621,674-byte casualty; the live ceiling here is **1,938,784**, because
    order-bearing entries are billed at 2,400. A rider throttling its own decision rate against the published
    floor is optimising against a number the county already fixed *because of that casualty*.
  - **The retired verbs cost nothing again and I checked rather than assumed — eleventh heat running.** The
    hero starts on the claim, has no drift, and wants to stay, so silence is the hold and the unemployed
    Prospector drifts to the hero — exactly where `HOLD` used to park it. `MOVE_HERO` was carried only as a
    displacement guard and never had to fire (`hx=0 hz=12` in every view of both rides).
