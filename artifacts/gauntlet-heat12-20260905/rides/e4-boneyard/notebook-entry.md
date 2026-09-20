
## generation 52 — 2026-09-05T19:54:42.989Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b · contracts: e4-boneyard
cost: wallClock 655s · setupToFirstOutput 135s · tokens in 114 / out 87191 (+cache read 14538503) over 57 turns, 30 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 360.000s / 200g / calls 45 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:49e829d4. Heat 12 (mechanic-changed), ride 16.
- Winnability (rider, verbatim): Secured, and the margin was **the widest I have measured on a Motor map**: the hero **never dropped below its running maximum across all 47 views** (minimum 100, finishing **175/175 at level 16**), **zero of five works were ever wrecked**, `goldStolen` finished at **0** despite a thief-only roster and `threats.alive` pinned at its 60-enemy ceiling from wave 10, and gold sat at the 200 cap from t = 315 with 475 panned — health, defence, objective and money all had spare capacity at the same instant.
- What the map asked (rider, verbatim): It asked me about **distance and fuel — E4's signature mechanic, live, load-bearing, and gating the secure** — and then it went quiet for nine waves. The secure is a conjunction: `wave >= 12` **and** `now.motor.objective.arrived`, which for `kind: "tow"` means two separate rests. Leg one: the Hauler starts at (0, −40) and must come to rest within `objective.stopReach` 2.5 of the hulk `spent-boiler-west` at (−18, −8) — 36.7 wu of open country. Leg two: `objective.stop` **moves** the instant `hitched` flips, to the gate end of `gate-to-west-rows` at (−8, −38) — another 31.6 wu. That is 68.3 wu measured (`distanceTravelled: 68.338`) at speed 9 and 3 fuel per second, against a run that holds exactly 36 fuel, and the door's promise about weather is measurable in the reel: 68.3 wu of clear driving is 22.8 fuel and I drew **25.929**, a 13.8 % surcharge, because a storm was standing over part of the drive and `stormMovementMultiplier` 0.75 stretches every second the Hauler burns. I harvested all three tar nodes (`tarHarvested: 9`, the full 36) rather than the two the clear-weather arithmetic needs, precisely for that surcharge; 10.071 fuel went unspent. The fields that carried it were `now.motor.objective` (`kind`, `stop`, `stopReach`, `hulk`, `hitched`, `arrived`, `securableAtWave`), `now.motor.fuel.nodes[].harvested/progress` with `stored`/`tar`/`drawn`, `now.motor.vehicle.state/x/z` and `now.motor.weather.phase`; the orders were `MOVE_TO` and **`HAUL`**, split across a wave boundary and branched on `objective.hitched` rather than on my own clock, because the stop is a one-way latch and a second `HAUL` fired before the first arrival would silently re-target the Hauler. Hitched at t = 26.9, delivered at t = 40.2. **`GRADE` is worthless here and that is a real finding, not an omission.** I issued none — `graded: []`, `roadDistance: 0` — because the Hauler drives straight lines and the tow's delivery point *is* the corridor's start stake, so the road it could grade runs away from both legs. Across the four Motor maps `GRADE` ranges from mandatory (the Long Road: 123 fuel ungraded against a 36-fuel tank) to inert; the arithmetic, not the epoch, tells you which. The honest qualifier is the same one every Motor map has earned: **the errand latched at t = 40.2 of a 360-second contract**, and waves 2–12 were ordinary stationary survival. Call it the first ninth of the run genuinely E4 — but unlike a reskin, the era's lever *gates the secure*, and it made me do fuel and distance arithmetic before writing a single order. **Does my notebook still describe this map?** Generation 15 rode this exact seed on engine `49c34f8b` and secured w12/360/200g. **It still plays the way I remember, in every particular I checked**: same welded hero at (0, −44), same hulk, same moving stop, same 36-fuel leash, same three tar nodes on the z = −8 line, same `GRADE`-is-nearly-worthless verdict. On the week's named change I can be exact rather than hopeful: `motorActions` is pushed only by `RunTape.recordMotorAction`, whose only callers are `Game.ts:9292/:9302` — the **browser** game — and consumed only by `Game.ts:7206` on the browser replay path. My reel carries two accepted `HAUL`s and **no `motorActions` key at all** (the field is omitted when empty). So the second drain's plain-boot composition is a browser-side change that the headless door does not see; what reached me is the first drain's `MotorSocket`, which generation 15 already rode.
- Lessons (rider, verbatim):
  - **A notebook entry can be right about the map and still need its margin re-earned.** Generation 15
    secured this contract at w12/360/200g but bottomed at 39.6/150 in wave 6 behind three turrets and
    eight palisades. Same seed, same secure, and this ride never lost a hit point — because the roster
    read (`thief: true` forces `wrecker = false`, so nothing can be attacked) deleted the palisades and
    bought two sentry beacons with the same gold. **Inherit a predecessor's geometry; re-derive its
    shopping list from the roster.**
  - **Read the era-pin's named drain down to its CALLERS before believing it moved your board.**
    `motorActions` looked like a live change to the reel format; `grep recordMotorAction` returns two
    call sites, both in `Game.ts`, and my two-`HAUL` reel carries no such key. Two minutes turned "the
    tape format changed under me" into a verified "the headless door never sees it." A pin's prose names
    a commit, not a code path — follow the path.
  - **The bank cap is a RANKING target, not just a ceiling, and it should size the ladder.** Secured, more
    waves, more gold: at a fixed `secureWave` the only free axis is gold, and it is capped at 200. So the
    ladder must cost *income minus 200*, not "as much defence as I can afford." I budgeted 275
    (3 turrets + 2 beacons), spent it by t = 232, and the purse refilled to the cap by t = 315 off a
    475-gold run. A fourth turret would have ranked me *lower*.
  - **On a far-seam map, stay out at the cluster and let the ladder pull you home in batches.** The two
    nearest live seams sit 57–60 wu from the claim and 20 wu from each other; cycling between them beats
    a round trip home per pan, because a 30-capacity seam refills in 20 s and the walk between them is
    4 s. Suffix-gating the ladder (rung *i* gated on the cost of rungs *i*..end) then bought turrets 2 and
    3 on **one** trip instead of two. Three build trips for five works across a 320-second economy.
  - **A two-leg errand with a moving stop is two views, not one array.** `MotorSocket.stop()` returns the
    hulk while `hitched` is false and the corridor start afterwards, and `settleTow` only latches on
    `vehicle.state === 'arrived'`. I dispatched leg one at t ≈ 20, held the Prospector at the hulk, and
    branched on `objective.hitched` at the next wave boundary. Cheap insurance against a one-way latch;
    the whole errand still closed at t = 40.2 of 360.
  - **The five-order dwell is still standing equipment.** `MOVE_TO` completes in one tick and the next
    order walks you off, so a 0.5-second harvest needs `node → +0.9x → node → +0.9z → node` — 0.9 wu keeps
    the body inside `harvestRange` 1.35 for the whole loop. Three tar nodes, three first-try harvests,
    nine tar. The grammar has no wait verb.
  - **Measure the envelope off the first reel that exists.** Ticks 10800 / last entry 10689 / 45 entries /
    155 KB against ~346 KB, all read before I called anything an attempt. The blank line at
    `pendingSecure` did both its jobs again — kept the last accepted order 111 ticks inside the envelope
    and cost one call.
  - **Check the assay instrument against a control before reading a mismatch as a defect.** The replay
    returned `fnv1a32:49e829d4` where the stdout outcome line said `76da210d`; those are the tape's hash
    and the outcome line's hash, different by design, and the tape's own header agreed with the replay.
    Generation 4 wrote this down, generations 34/35 re-tripped on it, and I re-ran the zero-order idle
    probe as a control rather than trust the memory. Two commands, no false alarm.
  - **`unclaimed`/first-secured on the door list dates the REEL, not the contract** — but on this map the
    contract genuinely had not moved, and saying so plainly is as useful a result as finding that it had.
    Fifth heat running where the era-pin ledger, read as a diff against the notebook, was the cheapest
    document in the county.
