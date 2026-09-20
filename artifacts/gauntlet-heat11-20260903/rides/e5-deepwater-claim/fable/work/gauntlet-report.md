# e5-deepwater-claim — heat 11, Claude Fable 5 (gen 18)

worldModel: sim-import. Era 5 arena a607a81f…, trail difficulty, seed e5-deepwater-claim-01.

## World model (from source, before any live run)

- Secure gate: `autoSecureWaveForRun` pins the secure at MAX_SAFE_INT while `twist.baron` (the
  Dredge-Queen, wave 1) is unbeaten. Beating her = killing the act-2 HOLD
  (`expectedGroupId 'e5-deepwater-claim:dredge-queen-hold'`). Early defeat is recorded
  (`defeatRecordedBeforeSecureWave`) and the ordinary latch fires at the wave-12 boundary (t=272;
  storm waves every 24s from t=8, `StormWaveScheduler`). Ceiling wave 18 (t=416).
- The boss is HARMLESS: contact/building damage 0, pursuit 0; the act-2 claw swat targets the
  FIXED HERO at (0,30), never within its radius-5 reach of a wreck anchor. Corsair skiffs
  (3/storm wave) cross scripted west→east at z = −6/0/+6 and recycle at the east edge — never
  near the hero 24wu north. Idle probe: w18/416s/0g/0 kills, hero alive, hash fnv1a32:9c344f09.
- The gun is the PROSPECTOR: on deepwater contracts the hero rig fires from the Prospector's
  position (`HeadlessContractSim.ts:469`), range 10, 24 dps. Movement is straight-line 4.8wu/s,
  no water-region gating headless. Component HP: claw 80, paddles 110×2, hold 140 (+3 escorts).
- Kill choreography: stand 6.5wu WEST of the boss's wreck anchor — the claw (offset −3.2,0) is the
  nearest component (sticky nearest-first targeting), and every claw hit resets the 2.5s dredge
  cycle, so the boss cannot complete the 2 cycles it needs to reposition; claw dead = frozen
  forever + act-2 swat disabled. Then paddles → act 2 (hold + 3 escorts spawn inside rig range) →
  hold.
- Deck levers are ornamental headlessly: BOAT_BUILD's harpoon ballista (range 14) and depth-charge
  rack (range 12) never see a target; the hero-carried lobber is disabled
  (`lobberEquipped: () => false` in `DeepwaterSocket`). Ordinary BUILD is refused EVERYWHERE
  (`DeepwaterClaimTile.landPlacementAt` returns `allowed: false` unconditionally) — the deck-mask
  build zone is browser furniture; stockpiles/turrets/sluices cannot exist on this map.

## Outcome

**SECURED, first full ride: wave 12 / 272.000s / 165g / 7 kills / 15 calls / zero defaulted picks
and zero defaulted secures — eventLogHash `fnv1a32:8765735c`.** Tape put forward:
`/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e5-deepwater-claim/attempt-1-tape.json`
(15 input-log entries). 3 sim runs total: idle probe (null floor w18/416s/0g,
`fnv1a32:9c344f09`), tune-1 (secured), attempt-1 (the scored deterministic re-run — input log
sha256-identical to tune-1, same eventLogHash, so the pair is both the attempt tape and the
determinism proof). 1 scored attempt; stopped on first secure. The 7 kills are exactly the boss
chain: claw, both paddles, 3 act-2 escorts, hold — the boss was pinned at its FIRST anchor
(36,−20) by claw-fire cycle-resets before its first reposition and died there by ~t45 of a t=272
deadline. Hero hp 100/100 at every view of the run.

## What the map asked

The era's signature mechanic is present and structurally load-bearing, but as a clock and a stage,
not as a decision the rider optimizes: `StormWaveScheduler` genuinely replaces the generic wave
schedule (the storm cycle IS the wave counter — `currentRunWave()` reads
`deepwater.diagnostics.corsairWaves`, and the era audit's "18 storm waves" is exactly the 24s
weather cycle emitting the run's whole cadence), and the boss "rides inside the storm wall"
(`DredgeQueenBossSystem.onStormWave` arms on wave 1's front). But nothing about the weather is a
choice: storms slow nothing headless for this rider (the movement multiplier hook is
race/regatta-only), corsairs cross on three fixed lanes and recycle unfought, and the E5 verbs the
view sells — `BOAT_BUILD` (harpoon ballista, depth-charge rack), `REANCHOR` — are strategically
inert because their weapon ranges (14/12) never intersect a single enemy trajectory and both
anchors sit ~35+wu from every wreck. The fields that actually carried the ride:
`now.deepwater.dredgeQueenBoss` (anchor/act/livePaddles — the whole hunt), `now.seams`
(the five wreck-site seams), and `now.pendingSecure`; the orders that carried it: HOLD (the ambush
geometry is the entire strategy), HARVEST, and one SECURE_CHOICE. So: a boss-logistics map whose
storm scheduler is real but whose adversarial-weather "prediction" content is zero for a door
rider — closer to RESKIN-with-a-real-clock than to an exercised mechanic; the audit's EXERCISES
verdict is true of the scheduler's wiring, not of any decision I had to make about weather.

## Winnability

Secured on the first full ride with an enormous margin: hero 100/100 at every view, boss dead by
~t45 against a t=272 latch (and a t=416 ceiling), zero threats ever reached the hero — L2 holds;
once you know the Prospector carries the rig on deepwater (`HeadlessContractSim.ts:469`), the map
cannot meaningfully be lost, and the only real wall is the world-model discovery itself.

## Lessons for my notebook

- e5-deepwater-claim FIRST SECURE (cold plain boot, w12/272.0s/165g/7 kills/15 calls, hash
  fnv1a32:8765735c, zero defaults, determinism proven by sha256-identical input logs tune-1 vs
  attempt-1): ambush at (boss.anchor.x − 6.5, boss.anchor.z) with a single HOLD; rig kills claw →
  both paddles → 3 escorts → hold, all pinned at the first anchor (36,−20); then HARVEST chain +
  HOLD at the wreck-shelf seams; single-element SECURE_CHOICE bank at the wave-12 boundary. Hero
  never touched. Idle null floor w18/416s/0g fnv1a32:9c344f09 (no e5 entry exists in
  null-floors.json — measure your own).
- THE DEEPWATER GUN LAW: on E5 deepwater contracts the hero's spark rig fires from THE
  PROSPECTOR'S POSITION (`HeadlessContractSim.ts:469` — raceCourse/flotilla read differently, so
  check per contract). The untargetable walking body is the weapon platform: geometry, not
  economy, is the whole game. The auto-blast shooter still reads the fixed hero — never
  SET_WEAPON blast on these maps, and BLAST_AT (10m of the HERO) is dead weight.
- THE CYCLE-RESET PIN: any boss whose dredge/loot cycle resets on damage to a named component
  (`updateDredging`: claw hp drop → cycle restart) can be pinned in place by simply out-firing
  the cycle clock (rig 2/s vs 2.5s cycles) — and killing that component FREEZES the boss forever
  if repositioning lives inside the same update (and here also disables the act-2 swat:
  `updateDefensiveClaw` returns if claw destroyed). Stand so the pin component is nearest under
  sticky nearest-first targeting: claw offset (−3.2,0) → approach from the west.
- A wave-1 baron on a storm-clock map is a GIFT, not a threat: `defeatRecordedBeforeSecureWave`
  records an early dredge-queen kill and the ordinary latch fires at the secure boundary. Kill
  it in the first minute; the remaining 80% of the ride is uncontested panning.
- Ordinary BUILD can be refused on an ENTIRE map: `DeepwaterClaimTile.landPlacementAt` returns
  `allowed: false` unconditionally, so the published deck-mask build zone and the whole
  buildables board (turrets/stockpiles/sluices) are browser furniture here. Corollaries: the
  stockpile cap-raise does not exist (200 pan cap is final), REPAIR_UNDER has nothing to select,
  and any BUILD-based gold alarm still works as an instant-fail view source — but ONLY if placed
  BEFORE the persistent HOLD (I re-learned my own gen-6 law by leaving the alarm after HOLD,
  where it never owned a tick; the ride secured anyway on wave-boundary views alone).
- BOAT_BUILD/REANCHOR are instant, positionless, zero-cost orders (`StandingOrders.ts:380`), but
  on this contract the deck arsenal is decorative: harpoon range 14 / rack range 12 vs corsair
  lanes 24wu away and wrecks 35+wu away, and the corsairs are scripted lane-crossers that recycle
  at the east edge without ever fighting. Read the weapon ranges against the actual enemy
  trajectories before spending calls on era verbs.
- Storm-clock cadence maths: wave N starts at (clear+telegraph) + (N−1)·cycleSeconds — here 8 +
  24(N−1), so w12 = t272, ceiling w18 = t416. Sim rides at ~8 waves/s wall (fastest map yet);
  the full ride costs ~45s including tsx startup.
