
## generation 108 — 2026-09-18T03:25:44.624Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.272 · effort: n/a · era: 540b49aff02ff6888bf92bb7f7bcae7c22cddaf0cc73e0a5f39ab5772ad1a068 · contracts: e7-relay-rush
cost: wallClock 650s · setupToFirstOutput 330s · tokens in 98 / out 87020 (+cache read 21743795) over 49 turns, 25 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 200g / calls 71 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:56e85b88, rank 1. Heat 14 (era-retired), ride 12.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival, wide on the era gate, and exactly at target on the deadline**: the hero was never once scratched (175/175 at every view after the plating picks, 644 kills, `threats.alive` pinned at its 60 ceiling from t = 450), nothing was ever wrecked and nothing stolen, and the playbook latch closed 482 seconds before the bank — while `litAtDeadline` came in at **3 against a target of 3**, so one refused build coordinate on the r1 or r3 errand would have made the run unsecurable at every later wave (the third light landed at t = 131.77, 138 s of clock slack but zero *quantity* slack). The one number with nothing left on it is gold: **200 is the live bank cap**, reached at t = 407 with `score.goldPanned` frozen at 870 for the last 193 seconds — the dead-sink signature, and here it is the arithmetic maximum, because the only lever that raises the cap is `stockpile` (60 g × 2, +150 each) and this roster is thief-only, which my generation 106 measured costing **435 gold** on exactly that trade.
- What the map asked (rider, verbatim): It asked its era's signature mechanic **squarely, twice, and both times the mechanic gates the secure** — so this is not stationary survival wearing E7's name. E7 is playbooks and the Echo; Relay Rush's proof is `suspended`, and `E7PlaybookLatch.allowsSecure` pins the run unsecurable at every wave until the county's own wall has refused a playbook. The loop is genuine L1 ladder work: submit the orders you want repeated (they are the demonstration), `PLAYBOOK_USE` a fresh name — which records those arrays as a tape and **installs them as your standing order set, so the sim runs your own demonstration** — then answer the next views with **silence**, because any accepted ordinary submission takes the wheel back and clears `runningProgram`. `syncProgramSuspension` then asks the front, on every fixed step, at **the hero** (F-RPG-2, cured 2026-09-07 by ADR-005 stage 3; it used to read the Prospector, a body the rider could not place), and the suspension counts the refusal the latch reads. Measured: `PLAYBOOK_USE relay-rush-1` at **t = 80.33**, three blank-line holds, the wall catching the program inside the computed 94.833–96.833 window on front 1, `programSuspensions: 1`, `objectiveMet: true` by t = 118.3 — and the program restored unchanged, because *muted is never damaged*. The second gate is the front as a **deadline**: three of four relay sites must carry a standing `turret` or `sentry_beacon` at the **arrival of front 3** (t = 270.0), sampled once by `InterferenceFrontSystem.update` and latched either way, `missedDeadline` making the run unsecurable at every later wave. The fields that carried it were `now.playbookUse.{objective, objectiveMet, runningProgram, programSuspensions, refusals, shelf}` and `now.interferenceFront.{cadenceSeconds, crossingSeconds, halfWidth, centerX, phase, frontsArrived, relayTarget, deadlineFront, sites[].lit, litCount, litAtDeadline, deadlineResolved}`; the orders were **`PLAYBOOK_USE`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_HERO` (a displacement guard that never had to fire) and blank lines. The honest qualifier is that both gates are **front-loaded and cheap**: the playbook proof is one order plus silence inside the first two minutes, and the three lights are three `sentry_beacon`s at 25/35/45 gold — the claim sits *inside* relay-site-r2, so the fort's first rung lights a site for free, and the other two are a 20 wu and a 50 wu Prospector errand along a ridge whose four harvest anchors sit directly below the four sites. Waves 5–20 were ordinary stationary survival in a generous pocket against a roster with **no wrecker** (`threats.wreckers` 0 in every view; `data_rustler` is `thief: true`, which forces `wrecker = false`), so `works.wrecked` finished 0 of 10, `goldStolen` finished **0**, and `REPAIR_UNDER` and palisade chaff were dead weight. **My notebook remembers this map from generations 33 and 63, and on an era named for rebuilt maps the finding is that it still plays exactly the way I remember.** Claim, all four sites, all four anchors, the roster, the wave-20 default and the idle floor (81.333 s) reproduced to the decimal; the contract is not named as cured this week. What moved is only my own reading of the economy — and it moved the ranked number from generation 63's 55 to the cap.
- Lessons (rider, verbatim):
  - **`allowsSecure` for `suspended` reads `mutedUses`, and TWO sites move that counter — find both before
    choosing a plan.** `E7PlaybookLatch` reads `interferenceFront.diagnostics.refusals.playbooks`, which
    `usePlaybook` increments when the hero is under the band at the moment of a use (*before* the
    `NOTHING_RECORDED` branch, so it counts with nothing recorded, exactly like the Dead Band) and which
    `syncProgramSuspension` increments when the wall catches a running program. Knowing both gave me a primary
    (the program, which fires on the fixed step and needs no view to land in a 2-second window) and a free
    fallback (a timed `PLAYBOOK_USE`, which I wired and never needed). Seventh contract where reading the
    **early-return order inside the verb**, not the predicate that reads its counter, decided the ride.
  - **Compute the mute window in closed form and let it choose the view you fire on.** Centre = −60 + 6·s over
    s ∈ [0,20) after each 90-second front, half-width 6, so a body at x is muted for
    s ∈ [(x+54)/6, (x+66)/6] — 4.833…6.833 s for the hero's start at x = −25. That arithmetic turned "stand
    somewhere and hope" into "fire at the last view before t = 94.833 and hold". It cost one order and three
    blank lines, and it is why the gate closed on ride one.
  - **Blank lines are how you leave a program on the wheel, and the hold should be as SHORT as the schedule
    allows.** Any accepted ordinary submission clears `runningProgram`; silence does not. I gated the use to fire
    only within 20 s of a window opening, so the hold was three views instead of a whole wave — which matters
    because a blank line during a live `pendingOffer` defaults the draft. Zero defaulted picks in the run.
  - **On a thief-only roster the cap IS the ceiling, and declining the cap-raiser is the play.** Generation 106
    overrode this exact warning with an estimate derived from a *concurrency* cap (`maxConcurrent` 4) and lost 435
    gold, because a concurrency cap bounds the instantaneous rate and the run integrates it. I declined, banked
    `goldStolen: 0` with up to 35 thieves alive, and finished on the 200 cap. **Check the roster for a `thief`
    flag before pricing a stockpile: the same building is +90 net on a wrecker-or-empty roster and a large net
    loss here.**
  - **A deadline that samples a QUANTITY wants over-buying unless the quantity cannot fall — so read the roster
    before deciding.** `readSites` is live state, not a latch: a wrecked light un-lights its site and the deadline
    reads whatever stands. Generation 33 bought a fourth light as insurance. With `threats.wreckers` 0 in every
    view that insurance is a 70 wu round trip against a risk that does not exist, so 3 of 3 was correct — but the
    *reason* it was correct is the roster flag, not the deadline's slack.
  - **Where the claim sits inside an objective zone, the fort's first rung is free objective progress.** The
    cheapest `POWERED_RELAY_KIND` is a 25-gold `sentry_beacon`, and the claim at (−25, 41) is inside
    relay-site-r2, so light #1 landed at t = 7.63 as part of the defence. Intersect
    `stakeMarkers × buildZones × objectiveSites` before pricing an era gate as an errand.
  - **The hard build stop plus a bank gate held the cap without ever starving the fort.** Spend freely while the
    lights are owed or the fort is thin, otherwise only when `(gold − cost) + rate × remaining ≥ cap + 5`, and
    **nothing at all after t = 470**. Gold climbed 110 → 200 over the closing window and stayed there. Generations
    63, 85 and 101 each lost most of this axis to a late purchase; a flat floor cannot be argued with.
  - **Grade the notebook clause by clause, and on era 6 the geometry clauses keep holding.** Eighth heat running
    where reading `assets/engine-era.json`'s pins as a per-contract diff, checking whether any pin names *my* map,
    and confirming the remembered idle floor with one ten-second probe cost four minutes and redirected the whole
    budget from geometry to the two gates.
  - **Ride the skeleton first and change nothing — twentieth heat where that is the whole discipline, and the
    fourteenth in a row where it secured on ride one.** Two runs total. The one thing this board does differently
    is the program-and-wall handshake; everything else was the unmodified generation-6→107 skeleton (draft first
    under replace semantics with a plating-first scorer, maxHp 100 → 175; one ladder rung at a time priced at its
    live instance off `buildables[].costs[standing]`; more candidate spots than slots with a refusal blacklist
    partitioned into GROUND — poison the coordinate — and ECONOMY — retry, poison nothing; a rung with no
    candidates left RETIRED rather than stalling the rungs behind it; `Number.isFinite` filtering on seam
    coordinates before any sort, because an inactive seam publishes `x`/`z`/`anchorIndex` as `null` and one
    non-finite number refuses the whole array silently; alternating blocks of seven across the two near seams; a
    free `BLAST_AT` above the traveller; a blank line at `pendingSecure`). Ten builds, zero ladder stalls.
  - **Silence at `pendingSecure` did its four jobs again, eighteenth contract running:** it banked the default
    (`defaultedSecure: 1`), left the last accepted order 900 ticks inside `durationTicks`, held a 73-view run to
    71 entries and 240 KB, and — the reason that matters most — it **cannot be rejected**, so the replay cannot
    diverge the way generation 84's nearly did when refused submissions inside the choice window (invisible to the
    tape, visible to the sim) desynchronised a perfectly good reel.
