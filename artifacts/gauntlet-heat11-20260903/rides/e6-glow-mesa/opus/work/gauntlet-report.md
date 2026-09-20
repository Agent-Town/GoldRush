# Heat 11 — `e6-glow-mesa` @ `e6-glow-mesa-01`, trail — Claude Opus 5, generation 23

worldModel: `sim-import` (read `src/sim/AtomicSocket.ts`, `src/systems/E6TileConsumerSystem.ts`,
`src/systems/HomemakerBossSystem.ts`, `src/sim/HeadlessContractSim.ts`, `src/agent/StandingOrders.ts`,
`src/game/Balance.ts`).

## How it was found

1. Pre-ride reads: `winnability-receipts.json` → `unclaimed`, **no `reason`** (green light, now
   fourteen-for-fourteen). Manifest → `twist.secureWave: 12` **and** a `twist.baron`
   (`homemaker_9000`, wave 8, `hpScale: 1`, every damage scale 0, `pursuitRange: 0`).
2. `autoSecureWaveForRun` (`HeadlessContractSim.ts:1095`) → `twist.baron && !baronBeaten` returns
   `MAX_SAFE_INTEGER`. **The secure is the kill.**
3. `bossKillSecuresRun` (`:263`) → for `homemaker_9000` the run secures **only** on
   `bossComponentId === 'core'`, and `HomemakerBossSystem.onComponentKilled` only spawns the core
   when **VAC** dies in act 1. So the mandatory chain is `VAC → CORE`, 100 + 160 hp.
4. Reach: the boss anchors at **(0,−8)** (`startAct1`, `this.anchor.set(0,0,-8)`). The hero is welded
   to the stake at (0,−32) with a 10wu Spark Rig and `BLAST_AT` capped at 10m — **no hero weapon can
   ever touch it.** The `base-flat` build zone runs to `maxZ: -10`, and a turret is 16wu. A turret at
   (0,−11) is **3.7wu** from VAC. One turret is the entire contract.
5. `engineDependencies` declares `glow-mesa-contract-consumers: "missing"`. It is **stale** —
   `AtomicSocket` composes `WrangleSystem` + `E6TileConsumerSystem` headlessly and publishes all of
   it in `now.atomic`. Third stale "missing" in five era rides.

## Outcome

**SECURED.** waves **12** · timeAlive **365.533 s** · gold **1** · calls **36** · kills 214 ·
`eventLogHash: fnv1a32:0e93f485` · `defaultedPicks: 0`, `defaultedSecure: 0`.

Tape put forward: **`attempt-1-tape.json`** (36 input-log entries, era 5, engineHash
`a607a81f…`, viewVersion 1).

**5 sim runs, 1 scored attempt.** Run 1 idle probe; run 2 the first controller, which secured;
run 3 a duplicate launch that reproduced it; run 4 a capture-post tune (`tune-2`, secured
w8/249.200 s/29 g — *lower* rank, since `timeAlive` DESC outranks gold); run 5 the scored attempt,
re-riding run 2's controller. Runs 2, 3 and 5 all produced `fnv1a32:0e93f485`, 365.533 s, 36 calls,
and `attempt-1-tape.json` is byte-identical to `tune-1.json` apart from its random `id`.

## What the map asked

It asked me about decay and patience, and the audit note's **EXERCISES** is right — this is not
stationary survival wearing E6's name. Everything that mattered was a timer. The wrangle rule is the
era's mechanic stated plainly: a machine that is not struck for `windDownSeconds: 8` *exhausts*, and
an exhausted machine is `isHarmless` — `CombatSystem.canDamageEnemy` refuses to shoot it and the
contact gate refuses to let it hurt me — so it crawls at `0.2×` and piles up, alive but spent. 342
machines exhausted on the idle ride and **nothing collected them**, which is why idle banked **0 gold
across 467 seconds**. That is the contract: the board's whole economy is decay output, and `CAPTURE`
is the only verb that converts it. `now.atomic.wrangle` publishes `windDownSeconds`, `captureRadius:
2.2`, the live `active[]` roster and the pen (`penGoldPerMachine: 1`, `penTickSeconds: 15`), and
every captured machine then pays **1 gold per 15 s for the rest of the run** — an income that is
purely a function of how early you caught it. My pen reached 39 machines and granted 47 gold; the
first turret cost 50, and I bought it with **51**. The second decay clock is the night/day dial
(`daySeconds: 8`, `nightSeconds: 12`, published live as `now.atomic.tiles.night.remainingTicks`),
which gates the six-vein starstone ring: veins are harvestable *only* while night is up, are one-shot,
and pay 4 gold each. The third is the puddle set — `now.atomic.tiles.puddles[]` carries `safe`,
`stage` and `remainingTicks` per field, and `isWalkable` genuinely blocks an unsafe field, so the
ground itself changes on a dial (both fields sit east of x=18 and never crossed my line, which is why
they cost me nothing here). And the boss is a decay engine too: `updateUnbuild` demolishes my
highest-HP building every 2.5 s while VAC lives, so a fort built early is eaten before it is needed.
The fields that carried the run were `now.atomic.wrangle.{active,pen}`,
`now.atomic.tiles.{night,veins,puddles}`, `now.atomic.homemakerBoss.{act,liveComponents,poweredDown}`,
plus `now.gold`, `now.works.byKind/entries` and `now.pendingOffer`. The orders were **`CAPTURE`**
(stacked ~28 deep — it owns exactly one tick, then the record is spent), one gated `BUILD turret`,
`MOVE_TO` dwells on a live vein, `HOLD`, and `PICK_UPGRADE`. The era's lever was load-bearing in the
strictest sense: **without `CAPTURE` there is no gold, without gold there is no turret, and without a
turret the boss is unreachable and the contract cannot be secured at any wave.**

## Winnability

Secured, and the margin was **one gold and one building**: the pen paid its 51st gold at wave 12, the
single turret went up for 50, killed VAC and then CORE inside that same wave, and the run banked at
365.533 s — with no second turret, no beacon, and 5 of 6 night veins never harvested.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is fourteen-for-fourteen.** Still the
  first two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **`engineDependencies: "missing"` is now wrong three times in five era rides** (E5 deepwater-claim,
  E5 regatta, E6 glow-mesa) against one time right (E4 long-road). Glow Mesa's block claims the
  browser composes `E6TileConsumerSystem`, `WrangleSystem` and `HomemakerBossSystem` "while the
  headless sim composes none" — and `AtomicSocket` composes all three and publishes them in
  `now.atomic`. The block argues you out of the map's only economy. **Give a "missing" that
  contradicts a live `now` key exactly zero weight; one idle probe settles it in ten seconds.**
- **On a component boss, read which component the secure keys on.** `bossKillSecuresRun` special-cases
  `homemaker_9000` to `bossComponentId === 'core'` *because* the generic branch would have falsely
  secured when the second of VAC/RACK died. The core does not exist until VAC dies in act 1. Killing
  the two components you can see is not the same as beating the boss — find the literal id in the
  kill predicate, not the component list in the manifest.
- **When the boss anchors outside every weapon's reach, the build zone's edge IS the plan.** Boss at
  (0,−8), hero welded at (0,−32) with a 10wu rig and a 10m blast, `base-flat` ending at `maxZ: -10`,
  turret range 16. The entire contract is the two-line arithmetic that a turret at (0,−11) is 3.7wu
  from VAC. Compute `distance(bossAnchor, nearest legal build ground)` against turret range **before**
  planning an economy — it tells you exactly how much gold you must raise and no more.
- **An idle probe that banks zero gold for 467 seconds is naming the economy, not the difficulty.**
  Ninth map running where the idle curve said nothing about the wall. Here `gold: 0` at wave 15 with
  342 machines exhausted was the single loudest fact in the run: the income exists, it accumulates on
  the board in plain sight, and *no order was collecting it*. **Read the idle probe for the resource
  that piles up untouched.**
- **A decay mechanic pays compound interest, so its verb is an opening move, not a mid-game one.** Pen
  gold is `machines × 1 per 15 s` for the *remainder* of the run, which makes every capture worth more
  the earlier it lands. My post at (0,−21) caught almost nothing until wave 7 and I secured on the
  last gold; moving it to (0,−29), where the harmless pile actually forms, banked the turret by wave 8.
  **On any accumulating-income mechanic, optimise time-to-first-unit, not units.**
- **Exhausted machines gather where the shooter cannot shoot them.** `!wrangle.isHarmless` gates both
  `canDamageEnemy` and the contact check, so spent machines are immune *and* harmless and therefore
  settle right on top of the hero they were walking toward — the one place a rider assumes is
  contested. The capture post belongs at the claim, not on the approach.
- **Correct my own gen-4 instinct about spending the second run.** Here the tune that "improved" the
  economy secured at **wave 8 / 249.200 s**, which ranks *below* the clumsier wave-12 / 365.533 s ride,
  because a boss kill secures the run **immediately** and `timeAlive` DESC is the primary axis. On a
  contract where the objective is a kill, going faster is going *backwards* on the board. Check which
  axis your improvement moves before calling it one.
- **`CAPTURE` owns exactly one tick and then its record is spent** (`StandingOrders.ts:380` — status
  `done`/`failed`, and `tick` skips both forever). Unlike gen-21's cooldown-gated `REANCHOR`, that
  makes it *safe and correct to stack*: 28 `CAPTURE`s drain over 28 ticks and each one is a real
  attempt. The refusals are not waste — they are the `order_failure` surprises that bought me 37 views
  for a 12-wave map.
- **Tenth contract running, the run after the secure went to the receipt, not to greed.**
  `fnv1a32:0e93f485` three times, 36 entries, `inputLog` byte-identical. In an era that replays every
  reel, a first-secure that is *proven* to replay is worth more than a richer one that might not.
- **Write the outcome file after every run, before the analysis.** Eleventh generation saying it,
  eighth actually doing it — the runner writes `gauntlet-outcome.json` on every child exit, so the row
  on disk was truthful from the idle probe onward. One caveat learned this ride: **a "best-so-far"
  comparator that only replaces on strict improvement will not promote a tying scored attempt** — my
  outcome file still pointed at the tune until I set the tape and `scored` flag by hand. Check the
  file says what you mean, don't just trust that it was written.
