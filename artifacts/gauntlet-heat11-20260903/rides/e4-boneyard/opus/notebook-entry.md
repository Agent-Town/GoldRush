
## generation 15 — 2026-09-03T22:24:21.190Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 49c34f8bba3d61e003d1f421398e3835e3107945f396800fa124f946b2e4b2f9 · contracts: e4-boneyard
cost: wallClock 521s · setupToFirstOutput 60s · tokens in 104 / out 94058 (+cache read 7502583) over 52 turns, 32 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 41 · runs 4 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:a5beb198, ranked, POST rank 1 — FIRST SECURE for e4-boneyard, and the first E4 reel of the heat. Ridden from ARENA B (build b118c4d2, engineHash 49c34f8b, viewVersion 2) because main had just merged the Motor Frontier slice; the tow finished at t=42.767s with 13.2 of 36 fuel unspent.
- Winnability (rider, verbatim): Secured, and the margin was **wide on the errand and thin on the fort**: the tow finished at t = 42.767 s with 13.2 of 36 fuel unspent and never came close to running dry, while the hero bottomed at 39.6/150 in wave 6, held at 55/175 from wave 6 to the end with `threats.alive` pinned at its 60-enemy ceiling, and the whole run was carried by three turrets and eight palisades bought out of a 50-wu commute — one more bad build trip and it would not have stood.
- What the map asked (rider, verbatim): It asked me about **distance, fuel and road — the E4 signature mechanic, live and load-bearing — and the county's RESKIN measurement of this contract is out of date.** The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, and the errand is a two-leg tow that is pure spatial planning. Leg one: the Hauler starts at (0, −40) and must come to rest within `objective.stopReach` 2.5 of the hulk `spent-boiler-west` at (−18, −8) — 36.7 wu of open country at `speed 9` and `burnPerSecond 3`, so 12.2 fuel. Leg two: from the hulk to `objective.stop`, which *moves* the moment `hitched` flips, to the gate end of `gate-to-west-rows` at (−8, −38) — another 31.6 wu, 10.5 fuel. Against that, the whole run holds 36 fuel: three tar nodes at (−12, −8), (0, −8), (12, −8), three tar each, four fuel per tar, a 24-unit tank. The margin is 22.8 needed against 36 available, and `weather` eats into it *by the second* — `stormMovementMultiplier: 0.75` means the same distance costs 33% more fuel under a storm, which is exactly the "a storm makes distance cost more" the door document promises. I planned to all three nodes rather than the two the arithmetic strictly needs, precisely because a storm on either leg would have stranded a two-node tank. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`), `now.motor.fuel` (`nodes[].harvested`, `stored`, `tar`), `now.motor.vehicle` (`state`, `x`, `z`), `now.motor.roads.corridors[].start/graded`, and `now.motor.weather.phase`; the orders that carried it were `MOVE_TO`, `GRADE` and `HAUL`. Two honest qualifiers. First, `GRADE` was nearly free here and nearly worthless: the Hauler drives a straight line, the delivery leg meets the road at ~19° so only 4.409 wu of 68.424 travelled ever rode graded ground — the road is a real lever on this map's *geometry* and this errand routes around it. Second, once the boiler was on the hook at t = 42.767 s the Motor layer went quiet and waves 3–12 were ordinary stationary survival — hard survival, on a starved economy, but not E4. So the fair reading is **half a reskin**: the era's mechanic is genuinely composed, genuinely gates the secure, and genuinely made me do fuel and distance arithmetic before writing an order — for the first 43 seconds of a 360-second contract.
- Lessons (rider, verbatim):
  - **The county's own era-mechanic audit can be stale, and the view settles it in one probe.** The brief
    handed me `e4-boneyard` labelled RESKIN, "no E4 system composed headless." The first idle view published
    a complete `now.motor` with a live `tow` objective, `viewVersion: 2`, and a secure gated on it at
    `HeadlessContractSim.ts:1210`. Gen-8 taught me a published *refusal* is a measurement of somebody's
    policy; gen-15 adds that a published *audit* is a measurement of somebody's build. **Dump `now`'s keys
    before you believe either.** One `--policy idle` run, ten seconds, decided it.
  - **Read the objective's `stop` as a moving target, not a coordinate.** `MotorSocket.stop()` returns the
    hulk while `hitched` is false and the corridor's `start` afterwards, and `settleTow` only latches when
    `vehicle.state === 'arrived'`. So the errand is two dispatches with a state flip between them, and a
    second `HAUL` fired before the first arrival would silently re-target the Hauler and lose the hitch. I
    split the legs across a wave boundary and branched on `objective.hitched` rather than trusting my own
    clock — the cheapest possible insurance against a one-way latch.
  - **`MOVE_TO` alone will not harvest.** `Balance.agent.arriveRadius` is 0.16 and `e4Fuel.harvestRange`
    is 1.35 with `harvestSeconds: 0.5`, but a completed `MOVE_TO` returns `{}` — truthy, so it owns the
    tick — and the next order walks you off at 4.8 wu/s. Approach plus one tick is ~0.31 s and the node
    never harvests. **A five-order dwell pattern (node → +1 → node → +1z → node) buys ~0.7 s in range and
    all three nodes landed first try.** Any "stand here for N seconds" mechanic needs an explicit dwell;
    the grammar has no wait verb.
  - **Rotating a `HARVEST` chain by distance is a commute generator.** Gen-9 told me to chain *different*
    seam ids for decision points; on a map whose seams sit 50 wu out that advice inverts and costs the
    run. Tune 1 banked one pan (5 gold) per 30-second wave and died at wave 5. Six orders on the SAME id
    empties a 30-capacity seam before the walk is paid for twice, and it was worth 4x — 200 gold pinned at
    the cap by wave 10 instead of 50 gold at wave 5. **The right rule is: chain by seam when the seams are
    near, stack by seam when they are far. Measure `distance(stake, nearest live seam)` first.**
  - **Suffix-sum gating is what makes a far economy buildable.** A build order gated at its own price fires
    the instant gold crosses it and drags the Prospector 50 wu home for one turret. Gating rung *i* on the
    sum of costs from *i* to the end of the batch means one trip buys the whole batch and spends straight
    down it. Gen-12 derived this and never got to prove it because that map's arithmetic was already lost;
    here it is the difference between wave 5 and wave 12.
  - **Do the era's errand while the board is empty.** The tow crosses the whole map to z = −8, which is
    where the west and east spawn lanes meet. Finishing it inside waves 0–1, before `threats.alive` passed
    14, cost nothing; the same trip at wave 6 against 50 rustlers would have been a different contract.
    When a secure is a conjunction of an errand and a clock, **spend the quiet on the errand and the noise
    on the fort.**
  - **`unclaimed` with no `reason` is seven-for-seven.** Still the first two lines of JSON I read.
  - **A tune that secures is the attempt; the re-ride is the receipt.** Seventh contract running:
    `fnv1a32:c87dfbd3` twice, 41 entries, tapes byte-identical apart from the random `id`. At a fixed
    wave-12 secure `timeAlive` is pinned at 360.000 s and gold ranks below it, so there was nothing to win
    by gambling and a replay-proof reel to gain.
  - **Write the outcome file after every run, before the analysis.** Fourth generation running I said it;
    this ride is the second where I actually did — the file was correct and on disk from the idle probe,
    and every later edit improved a row that already existed.
