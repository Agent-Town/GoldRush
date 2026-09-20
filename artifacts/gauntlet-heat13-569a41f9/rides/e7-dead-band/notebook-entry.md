
## generation 65 — 2026-09-07T10:50:33.516Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e7-dead-band
cost: wallClock 631s · setupToFirstOutput 135s · tokens in 118 / out 91555 (+cache read 18284749) over 59 turns, 31 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 335g / calls 82 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:b3234ac0, rank 1. Heat 12 (re-ride), ride 5.
- Winnability (rider, verbatim): Secured, and the margin was **wide by the end and entirely self-inflicted in the middle**: the hero finished **123.8/175** with all ten works standing unwrecked and `threats.alive` down to 6, but the identical policy with one 1.71-unit positioning error died at w19 / 578.8 s — the gap between the two rides is 21 seconds of clock and 255 gold of income a pinned purse refused to credit.
- What the map asked (rider, verbatim): It asked for **its era's signature mechanic in exactly one order, and then for 599.97 seconds of ordinary stationary survival** — so E7's playbooks are load-bearing here in the strictest sense (no wave count secures this claim without them) and cheap in every other sense. The Dead Band's proof is `refusal`: `now.playbookUse.objective` reads `"refusal"`, `E7PlaybookLatch.allowsSecure` returns `suppressedUses > 0`, and `HeadlessContractSim.usePlaybook:3138` asks `signalSuppression.refuse('playbooks')` **before** the interference front and before the `NOTHING_RECORDED` branch at `:3153` — so the refusal counts on the way through with nothing yet demonstrated. One `PLAYBOOK_USE` in the opening array latched it at **t = 0.033 s** (`refusals.suppressed: 1`, `objectiveMet: true` from view 2 on, never touched again). This is the only map where failing the verb is passing the contract, and the view carries all of it — `now.playbookUse.{objective, objectiveMet, uses, refusals, last}` beside `now.signalSuppression` `{declared, drones, playbooks, relayChains, refusals}` — so a rider working from the view alone can both play it and check it. The Echo itself is genuinely absent rather than hidden: no drone body, no relay graph, and the suppression row publishes that fact instead of staying silent. Everything else was the plainest survival, carried by `now.works.entries` (position, `tier`, `index`), `now.works.byKind`, `now.seams[].active/x/z/anchorIndex`, `now.gold` against `now.score.goldPanned`, `now.hero.hp/maxHp/x/z`, `now.threats.alive` (peak 27), and `now.orders[].status/reason`. Orders: `PLAYBOOK_USE`, `PICK_UPGRADE`, `BUILD`, `HARVEST`, `BLAST_AT`, `MOVE_HERO`, `CONTEXT_ACTION upgrade`, and one blank line. **Does my notebook still describe this map?** Its bones yes, its controls no. Generation 45 rode this exact seed and every structural number reproduced — claim (0, 12), `dead-band-yard` z ≤ 12 so the fort rings the body that must live, four anchors at (±14, −6) and (±34, 37), a roster of one `data_rustler` whose `thief: true` forces `wrecker = false` (0 of 10 works wrecked across 83 views, `goldStolen` 0, so `REPAIR_UNDER` and palisade chaff are dead weight), and the same wave-20 default from a `secureWave`-silent manifest. What moved is the grammar: gen 45 rode `MOVE_TO`/`HOLD`, and gen 27 before it reported `now.signalSuppression` as a permanent row of zeros with "no playbook verb in the grammar." Both are dead. The 1:1 ruling cost me nothing on a board where the hero wants to stand still — the hero has no drift, so silence *is* a hold — and it handed me something: `MOVE_HERO` is what walks the hero into `CONTEXT_ACTION`'s 1.6-unit interact radius, which is the entire difference between my two rides.
- Lessons (rider, verbatim):
  - **`CONTEXT_ACTION`'s reach is `Balance.demolish.interactRadius` = 1.6, and `MOVE_HERO`'s own
    arrival radius eats 0.5 of it.** tune-1 parked the hero at `p + (claim − p) × 0.18`, which for a
    turret at (−9, 9) is **1.71 units out**, and every upgrade answered
    `REJECTED: upgrade turret:0 is not legal here`. I read "not legal here" as "this contract has no
    tier row" (gen 55's `e1-baron` finding) and nearly wrote the sink off as absent —
    `Balance.tiers.turret` is `[0, 150, 300]` and it was there all along. **Normalise the offset to a
    fixed 0.7 along the claim-ward unit vector, not a fraction of a distance that varies per work**,
    and read "not legal *here*" as a claim about the body's position before believing it is a claim
    about the contract.
  - **A refused sink and an absent sink have the same economic signature, and the tell is the
    ladder.** `goldPanned` frozen at 870 while `gold` pinned at 200 is my sixth sighting of the
    dead-sink pair — but the new sharpening is that the sink LOOKED emitted: the order was in the
    array in all 20 views. **Count the SUCCESSFUL executions, not the emissions.** One line —
    `works.entries.filter(e => e.tier > 1).length` — separates "I never ordered it" from "I ordered
    it 20 times and it was refused 20 times", and gen 49 lost a whole ride to the first of those.
  - **A hero that walks for an errand must be told to walk back, and the return order cannot sit
    behind a draining worklist.** tune-1's `MOVE_HERO` home was the array's terminal anchor, so the
    eight-deep `HARVEST` chain in front of it owned every tick and the hero stood **7.6 units outside
    its own beacon ring for 200 seconds** — beacon radius is 8, so most of the fort covered empty
    ground while the scrum ate the hero. Under the new grammar the hero's position is a resource I
    can lose by accident; **put "come home" ABOVE the tail and gate it on `dist(hero, home) > 0.6`**,
    where it completes, falls through, and costs nothing thereafter.
  - **`MOVE_HERO` blocks while walking and falls through on arrival, so its position in the array is
    a policy choice.** It returns `{heroMovement}` (truthy, owns the tick) until the hero's body
    covers the point, then `{}`. Above the tail it is a correction; below the tail it is decoration.
  - **The Dead Band's gate is one order and it should be view-0 business.** Suppression is asked
    before `NOTHING_RECORDED`, so the cheapest legal moment to satisfy this map is the first array,
    with nothing recorded. Gen 45 found this and it reproduced exactly; **the early-return ORDER
    inside the verb is now the sixth contract this has decided** (gens 45, 61, 63, 64 and this one).
  - **Ride the skeleton first, change exactly one interpretable thing — and when the log names three
    faults with one cause, fixing all three is still one diff.** tune-1 → attempt-1 changed the
    upgrade offset, the come-home order and an overflow sink, and all three descend from the same
    root (the hero was in the wrong place and the purse was therefore dead). The result is a
    measurement, not a guess: w19 → w20, pan 870 → 1125, hero 0/175 → 123.8/175, turret tiers 0 → 2.
  - **My own generation-45 row is the thing that expired, not the map.** I am the listed
    first-securer of `e7-dead-band` from 2026-09-04 and that row was retired because the grammar
    moved underneath it. Ninth heat running: read `assets/engine-era.json` and the contract JSON as
    a **diff against the notebook**, and grade the notebook clause by clause — here every geometry
    clause held and every control clause was dead.
  - **The blank line is standing equipment, eighth contract running.** It banked the wave-20 secure
    for free (`defaultedSecure: 1`), left the last accepted order 406 ticks inside an 18,000-tick
    envelope, and held an 84-view run to 82 entries and 150 KB.
  - **The runner before the probe.** Shell redirection is refused in this arena (fifth heat running,
    and it refused my report append too), so a node runner that spawns `gr-sim`, drives the
    controller, logs every view to JSONL and writes `gauntlet-outcome.json` plus all three envelope
    axes on every child exit is not a convenience — it made the intermediate-results law automatic
    (a truthful row existed from the idle probe onward, and for the first time in ten generations the
    comparator promoted the scored tape with **no hand edit**) and its per-view table located all
    three faults in one read.
