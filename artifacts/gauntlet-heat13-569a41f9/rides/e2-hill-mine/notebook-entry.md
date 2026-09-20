
## generation 77 — 2026-09-07T14:18:32.954Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e2-hill-mine
cost: wallClock 583s · setupToFirstOutput 90s · tokens in 110 / out 88434 (+cache read 19117361) over 55 turns, 31 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w14 / 426.800s / 0g / calls 103 · runs 4 · scored attempts 2 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (never-claimed), ride 17.
- Winnability (rider, verbatim): **Undecided-leaning-yes, and what stopped me was my own budget, not a wall in the map, the grammar or the economy:** the fort is solved (four turrets, six beacons, `0` wrecked through wave 11, hero at 175/175 to t = 284) and the boss is reachable by hero weapons for the first time in this contract's history, but my two scored attempts went to finding my own controller's faults — a gold-gated repair that never fired, then a `MOVE_HERO` ladder that shuttled the hero between posts and froze panning and repair — so the run that combines what they proved (parked hero + ungated repair + the ~600 g tier-2 turret sink that 2.3 g/s income now supports, worth ×1.65 dps on the only works whose 16 wu range reaches the rail) was never ridden; on the arithmetic that remains, ~3,100 boss HP against four tier-2 turrets' ~13-second rail windows plus a hero at ~24 dps rig and ~28 dps blast closes inside the six-wave grace window, and I finished 4 waves short of the ceiling rather than short of the damage.
- What the map asked (rider, verbatim): It asked about **the rail and the wreckers, and it asked nothing at all about its era's signature mechanic.** E2's named lever is pressure with hazard — vent-or-boom — and for the fifth time across my generations it is published and unplayable: `boiler_house` is on the roster at 70 g × 3 and `stablePrefix.map.coalSeams` publishes three seams at (−12,39), (−5,43), (3,39), but the union of `now` keys across all 83 views of `attempt-1` is `wave · blastReadyInMs · weapon · timers · gold · hero · prospector · works · threats · orders · needsRider · seams · score` — **no pressure value, no band, no coal count, no boiler fuel** — and the grammar has no vent verb. A rider can pay 70 gold to start a process it cannot observe, cannot steer and cannot spend. What the map asks instead is two real questions: a **spatial** one the boss gate makes mandatory (the railcar rides a fixed line at z ≈ 0 with `pursuitRange: 0`, so distance from each work to that *polyline* — not to the claim — is what buys damage, and the only legal ground in reach is the `base-t1` strip at z 8..16, from whose z = 9–10 row a 16 wu turret covers ±12.5 of rail, about 13 seconds of fire per pass at 1.9 wu/s), and an **attrition** one that beat me (`steam_wrecker`, `buildingDamageScale: 2.5`, entering at (0,46) onto the fort's north face). The fields that carried the run were `now.works.entries`/`byKind`/`wrecked`, `now.seams[].active/x/z` (inactive seams publish `x`/`z`/`anchorIndex` as `null`), `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive` (saturating at 60 from wave 8) and `now.orders[].status/reason`. Orders: `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `REPAIR_UNDER`, **`MOVE_HERO`**. Not one E2 verb, because E2 has none. **Does my notebook still describe this map? Its bones yes, its controls no — and the control change is the whole heat.** Generation 3 secured this seed at w15/454.2 s and generation 57 reached w15/470.6 s unsecured; every structural number reproduced (same claim at (0,12), same cliff, same five harvest anchors of which two are live, same 12.5×-scaled three-part railcar, same idle floor at w2/82.8 s). What is dead is the sentence **both** of those generations opened from: *"the railcar sits 12.16 wu away against blast range 10 — no hero weapon can ever touch it."* `MOVE_HERO` deletes it. In `attempt-1` the hero walked off the welded claim to (0, 6–8) at t = 334, six units from the rail and inside both the Spark Rig's range 10 and `BLAST_AT`'s reach 10. The hero can now fight the boss; that lever did not exist when the map was last measured.
- Lessons (rider, verbatim):
  - **A `MOVE_HERO` ladder is a shuttle, not a fallback — emit ONE post and drop it once the
    hero is parked.** Gen 72 taught me to ship a ladder of candidate standoffs so an unwalkable
    one fails in a tick and yields. That is right for a *one-shot* errand and catastrophic for a
    *standing* post: every candidate completes on arrival, marks `done`, and hands the tick to
    the next, so the hero walks (0,6)→(0,5)→(0,7)→… forever. And a walking `MOVE_HERO` owns the
    tick, so panning, building and repair all stop. `pan` frozen at 660 from t = 377 while the
    hero oscillated between z 5.6 and 7.8 is the signature. **Advance the post index only on an
    actual refusal record, and omit the order entirely once `dist(hero, post) < 1`.**
  - **`REPAIR_UNDER` should carry no gold gate now that ADR-005 bounded it to the rig radius.**
    Mending is 25 % of cost — 12.5 g for a turret, 6.25 g for a beacon — and the verb can no
    longer walk the Prospector across the map, which was the whole reason my generations 11, 40
    and 58 feared it. tune-1 gated it on `gold >= 30` against a purse that sat at 10–40 and the
    fort went **0 → 8 wrecked inside a single wave**; ungating it (and stacking a `pct: 95` above
    a `pct: 60`) held **0 wrecked through eleven waves** on the identical fort. That one change
    was worth three waves. **Re-check which of my standing warnings a ruling retires; carrying a
    dead warning costs runs.**
  - **On a boss whose gate is a KILL, the era ruling that moved a BODY can move the whole
    contract.** Two prior generations of mine wrote that no hero weapon can reach this railcar,
    and both were right under the welded hero. The parity ruling did not merely re-word the
    grammar here: it opened a damage source on a map whose only failure mode was insufficient
    boss damage. **When a ruling retires a verb, ask what the replacement makes REACHABLE, not
    just what it costs.**
  - **Compute the boss's HP from the manifest before choosing a plan.** `enemy.hp` ×
    `hpScalePerWave^(wave−1)` × `twist.baron.hpScale` × Σ`components[].hpScale` is four numbers
    and two minutes, and it turns "can four turrets grind a 12.5× railcar" from a vibe into
    ~3,100 against a measurable dps × window product. Two of my generations rode this map
    without ever writing that number down.
  - **Spread and cluster are EQUAL for boss damage on a fixed rail, and unequal for survival.**
    Total damage is dps × turret-seconds-in-window, and four turrets each with their own 27.7 wu
    window along the rail give the same 58 turret-seconds as four sharing one window. So the
    placement decision is settled entirely by the second job — holding the claim — which is what
    gen 57 measured (cluster w15, spread w13) and which I should have inherited as a *conclusion*
    rather than re-deriving the arithmetic that does not discriminate.
  - **Two runs of budget is not a heat on a boss map, and the door publishes the cure I again
    did not use.** `--resume <tape> --to-tick <n>` replays a reel to any recorded tick. Wave 11
    is ~tick 9,900; resuming there would have bought me half a dozen boss-phase experiments in
    the wall I spent riding two 400-second approaches. Generation 55 wrote this sentence, gen 75
    wrote it again, and this is the third heat running I have paid ~330 seconds of sim per run to
    re-prove waves 1–11 that were never in doubt. **On a boss map: get one tape to the horn, then
    resume from it for every experiment after.**
  - **E2 pressure is unplayable through the door — now measured on a fifth contract.** Drill Yard
    (gen 5), Incline (gen 8), Pressure Garden (gen 9), Trestle (gen 10), Hill Mine (gens 57 and
    77). `boiler_house` on the roster, three coal seams published in `stablePrefix.map`, and no
    pressure field in any view. Stop re-deriving this per contract: dump the `now`-key union once
    and spend the time on what the map actually asks.
  - **The runner before the probe, eighth heat running.** This arena refuses shell redirection,
    compound commands and env-prefixed invocations, so a node runner that spawns `gr-sim`, drives
    the controller, logs every view to a compact table and writes `gauntlet-outcome.json` plus all
    three envelope axes on every child exit is not a convenience — it made the intermediate-results
    law automatic and its per-view table located both faults in one read each.
