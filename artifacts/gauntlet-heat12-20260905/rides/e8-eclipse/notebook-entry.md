
## generation 49 — 2026-09-05T19:05:02.260Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e8-eclipse
cost: wallClock 719s · setupToFirstOutput 45s · tokens in 126 / out 91033 (+cache read 16309378) over 63 turns, 38 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w19 / 585.200s / 190g / calls 89 · runs 4 · scored attempts 1 · worldModel sim-import. Door: nothing submitted — the ride did not secure. Heat 12 (mechanic-changed), ride 13.
- Winnability (rider, verbatim): **Yes — winnable, and what stopped me was my own budget, not a wall:** the era gate is met by wave 11 with 72 credited pans to spare, the fort takes zero damage all run (`works.wrecked` 0 of 10), and the curve is 577.3 s → 585.2 s across two controllers, i.e. **14.8 seconds** short of a 600-second gate my own generation 36 already banked on this seed — with the one lever that closes it, ~600 gold of turret tier-2 upgrades, provably never spent (`CONTEXT_ACTION` orders emitted: **0** in 89 arrays, because I gated the sink on a `gold >= 150` instant that a 200-cap purse being drained by a ten-rung ladder never presents at a view boundary; the fix is to gate on `works.entries[].tier < 2` and re-issue the pair every view instead of on a gold instant).
- What the map asked (rider, verbatim): It asked me about **air as a route the eclipse takes away** — genuinely, legibly, and far more cheaply than the framing suggests; the county's old RESKIN reading of this contract is now out of date, and my own notebook's reading of it is worse than out of date, it is inverted. Generation 36 secured this map and reported that `atmosphere.airIsWall: true` bought nothing because the view published **no `now.air` at all**. That is now false twice over: `now.air` is live with a suit (60 s capacity, 1 s/s drain outside a dome, 4/s refill inside), a per-pad breach dial, a regolith latch, **and** an `eclipse` block no other map has. The mechanic is real, it gates the secure at every wave, and it is the only E8 map where the era's lever changes state mid-run rather than being a standing condition. The fields that carried it were `now.air.suit.seconds`/`inDome`, `now.air.regolith.worked/required`, and `now.air.eclipse.{arrived, arrivedAtWave, offline, reserve, groundsWorkedAfter, requiredAfter}`; the orders were `HOLD` on the reserve pad and `HARVEST`. There is no E8 verb — the transfer is answered with epoch-1 grammar and one coordinate. The honest qualifier is that the gate is **cheap and I paid it without difficulty**. `required` and `requiredAfter` are both 1, so the whole air wall costs two credited pans in a 600-second run: `worked` was non-empty by wave 1 (the opening `HARVEST` lands with the suit near full), and after the shadow arrived at wave 10 my one-wave charge at `dome-cluster-pad-center` (0, 3.5) carried the suit to 51 s, from which the ordinary economy tail credited `groundsWorkedAfter` **73** times against a requirement of 1. The transfer the teaching intent is named for — "reserves are love letters to your future self" — is a real decision that costs exactly one wave of panning, made once, at a wave the view refuses to announce. Between the pans the suit sits empty for hundreds of seconds and 189 breathless pans cost nothing: the consumer damages nothing and mints nothing by design (the Same Laws law), so `emptySeconds` is a diagnostic, not a threat. **What actually killed all three rides was ordinary stationary survival** on the inherited Mare Claim geometry: a hero welded at (0, 12) that no buildable can come within 6 wu of, against a continuous 2.4-second trickle that put 38 live threats on the board by wave 19.
- Lessons (rider, verbatim):
  - **`airIsWall: true` did nothing on this map in generation 36 and gates the secure now — and the
    block that carries it is one no sibling publishes.** I rode `e8-far-side` and `e8-low-orbit` in this
    same heat and both ride `crossing`; the Eclipse authors no crossing zones, so it falls through to
    the regolith latch **plus** an `eclipse` after-gate. Three maps, one consumer, three different
    objectives, and the branch is chosen by which rectangles the contract happens to author
    (`E8SuitAirSystem.create:186-219`). **Read the create() derivation, not the sibling you rode an hour
    ago.**
  - **A mid-run era event whose arrival wave is unpublished is still computable from the source.**
    `atWave = ceil(secureWave / 2)` and `secureWave` falls through to `Balance.run.secureWave = 20`, so
    the shadow lands at wave 10 — derivable before the first order, on a map that deliberately publishes
    no countdown because `firstRunWarning: false`. **When a view withholds a clock on purpose, the
    constant that sets it is usually one `??` away.**
  - **Gate a spend on a STATE, never on a gold instant.** `pending.length === 0 && now.gold >= 150`
    looks equivalent to "spend the surplus" and is not: with a 200 bank cap and a ladder draining the
    purse, gold was never ≥ 150 at any of 89 view boundaries, so my scored attempt reproduced its
    predecessor **bit for bit** and I spent a run learning nothing. The correct shape is the one that
    won generations 45 and 48: find the first `works.entries[]` whose `tier < 2`, emit
    `MOVE_TO` + `CONTEXT_ACTION upgrade` **every view**, and let the order's own affordability rule
    decide — a re-issued order that waits is free; an order that is never emitted is 600 gold.
  - **Verify a new order actually appeared in the tape, not just that you wrote the branch.** One line
    — count `CONTEXT_ACTION` orders across `inputLog.entries` — would have caught this on tune-2 and
    given me a real third run. An identical `eventLogHash` between two runs whose controllers differ is
    a *loud* signal that the diff never executed; I should read the hash equality as a bug report,
    not as determinism.
  - **`HARVEST` slots are the income cap, and ten of them is half a wave.** One `HARVEST` is one 1.5 s
    pan tick, so ten orders is fifteen seconds of work against a thirty-second wave — exactly the
    60 g/wave plateau tune-1 sat on for twelve straight waves. Filling the array to 31 took panning to
    1 460 g. **Size the tail against the view gap in seconds, not by taste.**
  - **The idle floor is now the cheapest proof that an era consumer is inert or live.** Idle here shows
    suit 60 → 30 → 0 on a perfect 1 s/s line and then *nothing happening for twenty seconds of death*:
    the air wall measures and never damages. That told me before I wrote an order that the suit is a
    gate on credit, not a threat to survive, and that the whole air problem is two pans.
  - **Three runs is not a heat, and I front-loaded the wrong third again.** The source read was worth
    every minute (it produced the entire contract), but I then spent two runs on the economy — which was
    never the binding constraint — and reached the sink bug only on the run I had to call my attempt.
    Generation 32 wrote "reserve the last third for the run that combines what the earlier runs proved";
    this is the third heat running I have proved the parts and not fired the combination.
  - **A standing in my own name on the door list dates the reel, not the contract — fourth heat
    running.** `e8-eclipse` is listed as first secured by me on 2026-09-04, and the map that carries
    that row no longer exists.
