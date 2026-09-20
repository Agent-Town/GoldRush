
## generation 12 — 2026-09-03T21:28:38.358Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e3-canyon-works
cost: wallClock 591s · setupToFirstOutput 75s · tokens in 96 / out 101593 (+cache read 6615064) over 48 turns, 27 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): NOT SECURED — w3 / 102.433s / 45g / calls 7 · runs 3 · scored attempts 0 · worldModel sim-import. Door: not secured, nothing put forward (0 scored attempts — it stopped when the arithmetic became certain rather than spend the wall on a fourth doomed ride). All three runs died at hero HP 0 in wave 3, t=98-102s: idle, grid-first and palisades-first alike.
- Winnability (rider, verbatim): **Undecided-leaning-no through the door, and the wall is the map's economy against its own deadline, not the grammar and not my budget:** the connect latch demands 330 gold of beacons strung across six sites spanning 80wu of gorge while `wave <= 6` (t < 210s), but the map's only income is four gold seams at z≈30-34 — **~78wu north of the loss stake, across the river** — of which only two are ever live, each capped at `capacity 30` on a `respawnSeconds 20` cycle (`Balance.goldSeam`), giving a hard ceiling near 3.0 g/s that no policy can exceed; 330 gold is therefore ≥110s of pure panning before a single step of the ~100s pylon tour or the 21s opening commute, which overruns t=210 even with a perfect Prospector, and I measured only **0.44-0.69 g/s** actual because every build order drags the one order-actor off the seams and back down the canyon. Underneath that sits a second, earlier wall I never got past: the hero is a fixed gun welded to the stake at (0,-44) while its only worker is 78wu away, and it died at wave 3 (t≈100s) in **all three** runs — idle, grid-first, and palisades-first alike — so on this seed the run ends four waves before the connect deadline it cannot afford anyway. Two honest caveats on that verdict, because I did not get to test them: (a) I spent my wall on the grid and never tried a pure fortress line — every gold into palisades and upgrades around the stake, conceding the connect latch — which would answer whether wave 12 survival is reachable at all, and (b) my BUILD gating misfired once (run 2 placed a beacon at 25 gold against a `goldGte: 160` suffix gate), so one of my two controller runs was not testing the policy I wrote. Neither caveat touches the 330g/210s arithmetic, which is manifest-level and does not depend on my controller.
- What the map asked (rider, verbatim): It asked a real graph question and I could read every part of it — this is **not** stationary survival wearing the era's name, and unlike E2's pressure the mechanic is fully published in the view. `now.canyonConnect: {powered, required: 2, byWave: 6, complete, failed}` is a live field, and `stablePrefix.mechanics.rules` names its own source (`connect_objective` / `Game.syncCanyonConnectObjective`) including `completionLatch: "one-way-at-or-before-deadline"` and `missedDeadline: "run-unsecurable"`. The map is a genuine directed network under sabotage: two disjoint three-hop chains from one 26W producer, `fevered_saboteur` wreckers (`waveMin: 4`, `buildingDamageScale: 1.25`) spawning from gates at (±46,38) — i.e. **on top of the seams and the rim pylons** — and a watt ledger that sheds by priority (galleries 10, tram 15, turrets 20, lamps 30) against 28W of demand on 26W of supply, so the two lamps shed and the galleries stay `powered`. The crawler-drain nodes (18W each, priority 0) boot **offline** (`HeadlessContractSim:2479`, `online: node.role !== 'crawler-drain'`), which is the only reason the ledger balances at all. The fields that carried it were `now.canyonConnect`, `now.works.entries` (position + `wrecked`, the only way to see which pylon sites are actually covered), `now.seams[].active/x/z`, `now.gold`, `now.hero.hp`, and `now.threats.alive`. The orders were `BUILD` (suffix-sum gated), `HARVEST` and `PICK_UPGRADE`. The mechanic is load-bearing exactly as the county's audit note says — it is the *only* thing standing between this contract and an ordinary survival map. It is also, on this seed, priced past what the map's own economy can pay.
- Lessons (rider, verbatim):
  - **`unclaimed` with no `reason` is a green light about the *standings*, not about the map.** Six
    contracts running I have read that field as "go" and been right; here it was still correct — the
    contract is not `standings-disabled` — but it told me nothing about whether the map can be paid
    for. The receipt encodes an *authoring* wall (`secureWave: 0`, `training_ground`), never an
    *economic* one. Add a second pre-ride check next to it: **price the objective in gold and divide by
    the map's seam throughput before writing an order.** Two minutes of arithmetic
    (`maxCount × costs` vs `capacity/respawnSeconds × liveSeams × deadline`) would have told me at
    minute six what three rides told me at minute nineteen.
  - **Count the order-actor's feet as a budget, not a detail.** The Canyon Works is the first map I
    have ridden where income and defence are at opposite ends of the board (78wu, across a river) and
    the objective is strung *between* them. One body cannot pan, build a six-site network, and defend a
    stake; every BUILD order is a round trip that costs ~15-40s of panning. On any map, measure
    `distance(stake, nearest live seam)` first — the Incline's 6.3wu pocket and this map's 78wu commute
    are the same field with opposite verdicts.
  - **A conjunctive secure gate is the contract.** Here it is *three* clauses ANDed —
    `baronBeaten && canyonConnectCompletedByDeadline && wave >= 12`. Generation 8 read the wave clause
    and missed the baron; generation 10 corrected that; generation 12 adds: read the *whole* boolean at
    `autoSecureWaveForRun` and enumerate every clause before planning, because a one-way latch
    (`missedDeadline: "run-unsecurable"`) means one missed clause at wave 6 makes waves 7-20 worthless.
  - **E3's mechanic is real, readable, and this time unaffordable.** Blackout Ridge (gen 11) published
    no grid state in `now` and I had to read the engine; the Canyon Works publishes
    `now.canyonConnect` outright, which is a genuine improvement in the door's legibility. So the E3
    finding is no longer "the mechanic is invisible" but "the mechanic is priced past the map's
    income." Those are different findings and deserve different fixes.
  - **Verify a gate fires before trusting the ladder.** My suffix-sum batching — where rung *i* is
    gated on the sum of costs from *i* to the end of the batch, so a batch only opens when the whole
    trip is funded — is the right generalisation of gen-9's "truncate at the first price decrease," but
    I shipped it without a single-view check and one run built a beacon at 25 gold against a
    `goldGte: 160` gate. Log the emitted array and the resulting `works.entries` on the *first* view of
    a tune, not after three runs.
  - **When the wall is arithmetic, stop riding.** Generation 5 declined a second scored attempt because
    it could name the line of code that would refuse it; here I declined a fourth run because I could
    name the inequality. Both times the right output was the finding, written carefully, rather than
    another tape. Knowing when not to ride is still worth as much as a good policy.
  - **Write the outcome file before the analysis, every time.** I wrote `gauntlet-outcome.json` at
    minute 18 with two runs banked, then rewrote it. The wall arrived with the report unfinished twice
    in twelve generations; the file that exists is the row that survives.
