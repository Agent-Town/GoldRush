# Gold Rush Gauntlet — heat 11 — `e5-deepwater-claim` @ `e5-deepwater-claim-01` (trail)

rider: claude-opus-5 · harness: claude-code-cli 2.1.257 · worldModel: `sim-import` · generation 19

## How it went (chronological)

1. **Pre-ride reads.** `winnability-receipts.json`: `unclaimed`, no `reason` — green light (eleven-for-eleven).
   Manifest: `secureWave: 12`, and a `twist.baron` — the Dredge-Queen at wave 1, `hpScale: 1`,
   all three damage scales zero, `pursuitRange: 0`, four components.
2. **Idle probe** (`probe-idle.json`): survived to the **wave-18 ceiling**, 416 s, **0 kills, hero untouched**.
   Survival is not this map's problem. The storm scheduled 18 corsair waves, one per 24 s cycle.
   The boss anchored and sat in act 1 with `act2Locked: true` for the entire run.
3. **Source read.** `HeadlessContractSim:1095` — `autoSecureWaveForRun` returns `MAX_SAFE_INTEGER`
   while `twist.baron && !baronBeaten`, so **the secure is the kill, and wave 12 is only the second
   clause**. `bossKillSecuresRun` wants `eliteKind: 'railcar'` + group `e5-deepwater-claim:dredge-queen-hold`
   at `bossRemaining === 0`. `DredgeQueenBossSystem`: destroy `paddlesRequired: 2` paddles (110 hp each)
   → act 2 spawns the `hold` (140 hp) → kill it.
4. **The lever.** `heroShooter.getPos = () => this.deepwater ? this.prospector.position : this.hero.group.position`.
   On a deepwater map the Spark Rig (12 dmg × 2/s = **24 dps**, range 10) fires from the *Prospector* —
   the order actor. The gun is mobile. The boss tours the five wreck sites in reverse index order,
   dwelling two claw cycles (5 s) then repositioning at speed 10, so **parking on one site brings the
   boss into range about every 40 s**. No chase needed (Prospector 4.8 wu/s vs boss 10).
5. **Tune 1** — parked exactly on wreck site `w3-pylon-barge` (0,−22). Act 1 fell fast: claw + both
   paddles dead by wave 3, `act2Locked: false`, act 2 open. Then **everything froze**: kills stuck at 4−1=3,
   `alive` pinned at 16, the `hold` alive at the ceiling. 18 waves, unsecured.
6. **The bug I was standing in.** `CombatSystem.emitVolley` bails on `if (lenSq <= 0.0001) return false`
   — a bolt shooter cannot fire at a target at **range zero**. `advanceToAct2` does
   `spawnComponent('hold', anchor.clone())?.scriptMoveTo(anchor.x, anchor.z, 0)`, so the hold sits on
   the anchor *exactly*; `HOLD` snaps the Prospector onto its target *exactly*. Origin == target,
   no shot, and `findNearest` re-picks the same zero-range hold every tick — a permanent deadlock.
   Act 1 worked only because claw (−3.2, 0) and the paddles (−0.3, ∓2.4) carry component offsets.
7. **Tune 2 / attempt 1** — moved the park 5 wu off the site to **(0, −17)**, changing nothing else.
   **SECURED**, first ride. Re-ridden identically as the scored attempt: `fnv1a32:f96cb9f0` both times,
   13 entries, `inputLog` byte-identical.

## Outcome

**SECURED.** waves **12** · timeAlive **272.000 s** · gold **40** · calls **13** · kills 4.

Tape put forward: `artifacts/heat11/opus/e5-deepwater-claim/attempt-1-tape.json`
(`eventLogHash: fnv1a32:f96cb9f0`, outcome `secured: true`).

**4 sim runs** (idle probe, tune 1, tune 2, attempt 1) · **1 scored attempt**.
Tune 2 secured with the identical controller; attempt 1 is the deterministic re-ride, and it is the
tape I put forward. `worldModel: sim-import`.

The whole fight was over by wave 4 — act 3, `crewQuit`, `hulkPresent`, 5 loot units spilled for the
40 gold — after which eight waves were coasting at 100/100.

## What the map asked

It asked me about **the storm, and then about one number I was standing on** — and on the audit
question this contract genuinely **EXERCISES** its era's mechanic, though not in the way the briefing
advertises. The storm is not decoration: `deepwaterStormDrivesWaves` makes it the *only* wave clock, so
`now.deepwater.storm.weather.{phase,cycle,simTime}` and `corsairWaves` are the schedule itself — 18
storm waves on the idle ride, one per 24 s cycle, three corsair skiffs each, doubled to six by
`escortAct2Multiplier` once act 2 opens. Everything downstream is timed off it: the Dredge-Queen
enters on a storm front (`onStormWave`, `stormFrontWave: 1`), and wave 12 arrives at t = 272 because
the storm says so, not because a generic scheduler does. What the era's name does *not* buy is the
adversarial part — `stormMovementMultiplier: 0.72` and `stormVisibilityMultiplier: 0.58` are published
and real, but on a map where the winning play is to stand still, a movement tax is inert; I never paid
it after the opening walk. So: prediction under weather, yes, in the sense that the weather *is* the
clock and the boss rides it. Adversarial weather, no.

The load-bearing reasoning was the **boss's tour geometry**, and that is E5-shaped in its own right:
the five drowned-era wrecks are simultaneously the boss's anchor ring, the harvest anchors and the
gold seams, and `reposition()` walks it around them every two claw cycles while a paddle lives. That
turns "kill a 4-component boss 52 wu from your stake" into "pick one wreck and wait," which is a real
spatial question with a cheap answer once you notice the gun travels with the worker.

Fields that carried it: `now.deepwater.dredgeQueenBoss` (`act`, `anchor`, `livePaddles`, **`act2Locked`**,
`clawCycles`, `repositions`, `hulkPresent`, `crewQuit`), `now.deepwater.storm.weather.phase/cycle`,
`now.deepwater.corsairWaves`, `now.prospector`, `now.threats.alive/defeatedTotal`, `now.hero.hp`,
`now.pendingSecure`. Orders that carried it: **`HOLD`** — and essentially only `HOLD`. The secured reel
is 13 entries: one `HOLD` at (0,−17) resent each view, and one `SECURE_CHOICE`.

Two honest findings for the county, both about legibility rather than balance:

- **The E5 verbs are published and inert on this map.** `BOAT_BUILD` and `REANCHOR` are fully wired
  (`now.deepwater.pads`, `anchors`, `boatBuildings`) and I used neither, because the boat's two anchors
  are (0,30) and (−24,12) while the boss tours z −20…−34, and the whole deck arsenal tops out at range 14
  (`harpoonBallista` 14, `depthChargeRack` 12, `depthChargeLobber` 9). The 12 depth charges cannot reach
  the fight at all. The Claim-Boat is scenery for the objective.
- **The manifest's `engineDependencies` is stale here**, and in the dangerous direction: it declares
  `deepwater-claim-consumer: "missing"` — "these run browser-only" — while `DeepwaterSocket.ts` runs the
  tile, the storm/corsair scheduler, the arsenal and the Dredge-Queen headlessly, and publishes all of it.
  Generation 18 learned to *trust* that block; on this contract trusting it would have cost the heat.

## Winnability

Secured, and the margin was **enormous**: the hero took **zero damage across all 12 waves** (100/100 at
every one of the 14 views, still level 1, no upgrade ever offered), the fight was over at wave 4 with
eight waves of slack against the wave-12 gate, and the only wall on the map is a **range-zero firing
deadlock** that costs exactly five world-units to step out of.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is eleven-for-eleven.** Still the first
  two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **Correct generation 18: `engineDependencies` is a hint, not a receipt.** The Long Road's
  `convoy-claim-consumer: "missing"` was true and saved me a heat; this contract's
  `deepwater-claim-consumer: "missing"` is **false** — `DeepwaterSocket` runs the whole era headlessly and
  publishes pads, anchors, storm, arsenal and a complete `dredgeQueenBoss` block. Read the block, then
  **confirm it against `now`'s keys in one idle probe** before believing either polarity. A stale
  "missing" is worse than no note at all, because it argues you out of the map's best lever.
- **A shooter cannot hit a target at range zero.** `CombatSystem.emitVolley`: `if (lenSq <= 0.0001) return
  false`, and `findNearest` keeps re-electing that same zero-range target, so it is a *permanent* stall,
  not a missed tick. Combined with two facts I already knew — the Prospector snaps exactly onto its
  `HOLD`/`MOVE_TO` target (gen 18), and a boss part can be `scriptMoveTo`'d exactly onto its anchor —
  this is a live trap. **Never park exactly on a coordinate you intend to shoot; offset by ~5 wu.**
  Fifteen minutes of my heat died on that one inequality, and the fix was one number.
- **Diagnose a frozen board by what is NOT changing.** Act 2 froze with `kills` stuck at 3 and `alive`
  pinned at 16 while `corsairsSpawned` kept climbing (102) and `corsairsRecycledAtExit` tracked it (90).
  That arithmetic — 12 in transit + 3 reinforcements + 1 hold = exactly 16 — *proved the hold had spawned*
  and therefore that the bug was in my firing, not in the boss's state machine. Reconcile the counters
  against each other before theorising; they localise the fault for free.
- **On a deepwater map the gun rides the worker.** `heroShooter.getPos = deepwater ? prospector.position
  : hero.group.position` — the hero stays welded to the stake as a damage sink while the Spark Rig
  (24 dps, range 10) travels with the order actor. That single ternary inverts the fixed-gun/free-worker
  split I have carried since generation 7, and it is what makes a boss 52 wu from the claim killable at
  all. **Re-read `getPos` on every new era; the body that shoots is not a constant.**
- **When the boss patrols on a timer, park on its route instead of chasing it.** The Dredge-Queen tours
  five sites at speed 10 against my 4.8, dwelling 5 s each — unchaseable, but it returns every ~40 s, and
  I only needed ~15 s of contact for 360 hp of components. Gen-16 solved the Land-Yacht's orbit with an
  arc computation; the patrol version is simpler still: **compute the dwell, not the intercept.**
- **A wave-18 idle survival is as uninformative as a wave-1 idle death.** Seventh map running where the
  idle curve told me nothing about the real problem. Here idle rode to the *ceiling* untouched and still
  scored zero, because the objective was a kill it never attempted. Read the idle probe for the *clock and
  the state machine* — it showed me `act2Locked: true` for 18 straight waves, which was the whole contract
  — never for the difficulty.
- **A boss with every damage scale zeroed is a puzzle, not a fight.** `contactDamageScale`,
  `buildingDamageScale`, `supportBuildingDamageScale` and `pursuitRange` are all 0 on the Dredge-Queen, and
  the one thing that *could* hurt me — the act-2 swat — is gated behind `if (this.destroyed.has('claw'))
  return`, so killing the claw in act 1 disarms act 2 entirely. Gen-14's "when an enemy's roster entry
  zeroes every damage channel, go find the special-cased callback" paid again: read the callback, and the
  fight collapses to positioning.
- **Eleventh contract running, the second run went to the receipt, not to greed.** Tune 2 secured;
  attempt 1 re-rode it for `fnv1a32:f96cb9f0` twice, 13 entries, `inputLog` byte-identical. At a fixed
  wave-12 secure `timeAlive` is pinned at 272.000 s and gold ranks below it, so there was nothing to win by
  gambling and a replay-proof reel to gain. I also dropped `HARVEST` entirely once I saw the seam sat on
  the deadlock coordinate — and still banked 40 gold, because the hold's own loot spill (5 units × 8) pays
  more than panning would have. **Check whether the objective pays before building an economy for it.**
- **Write the outcome file after every run, before the analysis.** Eighth generation saying it, fifth
  actually doing it from the idle probe onward — the runner writes it automatically now, and every row on
  disk was truthful from minute nine.
