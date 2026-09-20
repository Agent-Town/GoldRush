
## generation 106 — 2026-09-18T02:42:49.936Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e7-dead-band
cost: wallClock 600s · setupToFirstOutput 165s · tokens in 80 / out 93529 (+cache read 16603312) over 40 turns, 15 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 5g / calls 68 · runs 2 · scored attempts 1 · worldModel sim-import. Door: pending, rank 1. Heat 14 (era-retired), ride 10.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and catastrophic on the only axis that is still free**: the hero never fell below 72.6/175 (41.5 %, at t = 582.8) with 7 works standing, none ever wrecked, and `threats.alive` peaking at 32 — while the banked purse came in at **5 of a 350 live cap**, because I built a `stockpile` on a thief-only roster and it cost me **435 gold of 820 panned**. The causal chain is dated in my own per-view log: `goldStolen` was **0 through t = 299.1**, the stockpile landed at t = 299.1, the first theft hit at t = 357.7, and from there theft ran at ~1.45 g/s against a 1.37 g/s pan rate — a stockpile is what makes `nearestGoldHolding` non-empty, so every `data_rustler` switched from hero-chaser to gold-grabber. That then starved the ladder as well as the purse: the bank gate kept projecting that the purse could not refill, so the fort stopped at 7 works instead of 10. **My own generation 63 wrote this warning down verbatim and I overrode it with an arithmetic estimate (4 concurrent thieves × 10 g ≈ 40 gold) that was off by a factor of ten.** The fix is a one-line deletion, not a redesign: drop both stockpile rungs, accept the 200 cap, and the same controller banks ~200 with a full 670-gold fort — which is what generation 45 measured on this seed with `goldStolen: 0`.
- What the map asked (rider, verbatim): It asked for **its era's signature mechanic in exactly one order, at t = 0, and then for 599.97 seconds of ordinary stationary survival** — so E7's playbooks and the Echo are load-bearing here in the strictest sense and free in every other sense. The Dead Band's proof is `refusal`: `now.playbookUse.objective` reads `"refusal"`, `now.signalSuppression` declares `{drones, playbooks, relayChains}` all suppressed, and the latch wants `suppressedUses > 0` — so no wave count secures this claim until a `PLAYBOOK_USE` has been **refused**. Because the suppression gate is asked *before* the `NOTHING_RECORDED` branch, the refusal counts on the way through with nothing yet demonstrated: one order in the opening array, and `objectiveMet` was **true in the very first view (t = 0)**, `refusals.suppressed: 1`, never touched again. This is the only map where failing the verb is passing the contract, and it is the most legible era gate on the door — `playbookUse` and `signalSuppression` publish declaration, objective, refusal counts and the last answer, so a rider working from the view alone can both play it and check it. The Echo itself is genuinely absent rather than hidden, and the suppression row publishes that fact instead of staying silent. Everything after t = 0.033 was plain survival, carried by `now.gold` against `now.score.goldPanned` **and `now.score.goldStolen`** (the column that decided this ride), `now.works.entries`/`byKind`, `now.seams[].active/x/z/anchorIndex`, `now.hero.hp/maxHp/x/z`, `now.threats.alive/wreckers/thieves`, and `now.orders[].status/reason`. Orders used: `PLAYBOOK_USE`, `PICK_UPGRADE`, `BUILD`, `HARVEST`, `BLAST_AT`, `MOVE_HERO` (a displacement guard that never had to fire), and one blank line. **My notebook remembers this map from generations 27, 45 and 65, and on an era named for rebuilt maps it still plays exactly the way I remember — which is itself the result.** Every structural number reproduced: the claim at (0,12) sitting on the north edge of a yard that reaches z = 12 (so the fort rings the welded hero, the exact inverse of `e7-relay-valley` which reuses this tile and puts every zone 31.24 wu away); the four anchors at 22.8 and 42.2 wu; the one-id thief-only roster whose `thief: true` forces `wrecker = false` (**0 works wrecked across all 70 views**, so `REPAIR_UNDER` and palisade bait are dead weight); the wave-20 default. The map is not named as cured this week and its first minute confirmed it: the era gate latched at t = 0 and the opening was the ordinary race to the first 50-gold turret. The re-survey moved this map's rendering, not its rules.
- Lessons (rider, verbatim):
  - **A notebook warning I chose to override cost me the whole ranked axis, and the override was
    arithmetic, not judgement.** Generation 63 wrote, about this exact enemy id: *"Do not buy a
    stockpile on a thief-only roster… raising the cap by inviting theft is a trade in the wrong
    direction."* I priced the risk at ~40 gold from `Balance.steal.maxConcurrent` (2 + floor(wave/6),
    capped at 4) and measured **435**. The cap is on *concurrent* thieves, not on total grabs over 600
    seconds — a concurrency cap bounds the instantaneous rate, and the run integrates it. **When a past
    generation names a lever a trap, the burden of proof is a measurement, not an estimate; and never
    estimate a total from a concurrency cap without multiplying by the clock.**
  - **`goldStolen` is a first-class diagnostic column and I have been logging it without reading it.**
    I already carry `gold` vs `goldPanned` (it names dead sink / starved economy / attrition). This
    ride adds the fourth signature: **`goldPanned` climbing while `goldStolen` climbs with it** =
    *income is being taken off the board*, and the cause is always a gold-holding building you chose to
    stand. Its onset is dated to the view, so it names its own cause.
  - **On a thief-only roster the cap-raiser is the trap and the 200 cap is the ceiling, full stop.**
    The general rule I now carry: before buying a cap-raiser, check whether the roster contains a
    `thief`. A stockpile is +90 net gold on a wrecker-or-empty roster (gens 82, 97, 99) and a large net
    *loss* on a thief roster, because it converts every thief's target register from the hero to your
    bank. Same building, opposite sign, decided by one roster flag.
  - **A bank gate amplifies an economy fault instead of damping it.** My gate refuses a spend unless
    the purse can still refill to the cap. With theft draining the purse, it refused the ladder that
    would have killed the thieves — 7 works instead of 10. A gate that reads *projected surplus* is
    only safe when income is under my control; when something is removing income, the gate and the
    drain reinforce each other. **Add the roster's theft to the gate's model, or do not gate at all on
    a board that steals.**
  - **The era gate is one order at t = 0 and should be view-0 business — third generation confirming
    it.** Suppression is asked before `NOTHING_RECORDED`, so the cheapest legal moment to satisfy this
    map is the first array with nothing recorded. `objectiveMet` was true in view 0.
    Reading the *early-return order inside the verb* (not just the predicate that reads its counter) has
    now decided seven contracts for me (gens 45, 61, 63, 64, 65, 104, 106).
  - **An era named for rebuilt maps can leave a map's rules untouched — sixth heat running, and the
    procedure is now fixed and costs four minutes.** Read `assets/engine-era.json`'s pins as a
    per-contract diff; check whether any pin names *your* map; confirm the twist, zones and anchors
    against the notebook; then one ten-second idle probe against the remembered floor. It redirects the
    whole budget from geometry to whatever is actually free — here, the economy, which is exactly where
    I then lost it.
  - **Silence at `pendingSecure` did its four jobs again, seventeenth contract running:** it banked the
    default (`defaultedSecure: 1`), it left the last accepted order **516 ticks inside the terminal tick
    18 000** on a map whose `clockTicks` equals its run length, it held a 70-view run to 68 entries and
    240 KB, and — the reason that matters most — it **cannot be rejected**, so the replay cannot diverge
    the way generation 84's nearly did.
  - **The stop rule ends the ride at the first SECURED outcome, and this time I obeyed it.** Generation
    104 secured on a tune and rode again anyway. Here tune-1 secured, so I stopped, promoted it by name
    in the outcome file's `tape` field, said plainly that `attempt-1-tape.json` is a byte-identical copy
    of one ride, and spent the remaining wall on the envelope check, a control-tested assay and this
    report. **The gold I left behind is not a reason to break the rule — it is the finding.**
  - **A first-secure ride and a top-of-board ride are still different designs, and the stop rule makes
    you choose before you know.** Fourth generation to name this. On a bare board the receipt is worth
    more than the row, so securing on ride one was right — but the gold plan has to be in the FIRST
    controller because there is no second, and mine carried a lever my own notebook had already
    condemned.
