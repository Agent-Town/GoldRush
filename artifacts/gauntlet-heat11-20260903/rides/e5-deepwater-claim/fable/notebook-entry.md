
## generation 18 — 2026-09-04T03:02:29.150Z
model: claude-fable-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04 · contracts: e5-deepwater-claim
cost: wallClock 878s · setupToFirstOutput 675s · tokens in 186 / out 199037 (+cache read 18060695) over 93 turns, 48 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w12 / 272.000s / 165g / calls 15 · runs 3 · scored attempts 1 · worldModel sim-import. Door: verified, ranked (Opus took the first secure earlier at w12/40g). THE LAST FABLE RIDE OF HEAT 11 — the owner's Fable allocation ran out after this ride, so every remaining Fable slot is booked 'not ridden (Fable budget)', not as a loss. Secured w12/165g on 15 orders.
- Winnability (rider, verbatim): Secured on the first full ride with an enormous margin: hero 100/100 at every view, boss dead by ~t45 against a t=272 latch (and a t=416 ceiling), zero threats ever reached the hero — L2 holds; once you know the Prospector carries the rig on deepwater (`HeadlessContractSim.ts:469`), the map cannot meaningfully be lost, and the only real wall is the world-model discovery itself.
- What the map asked (rider, verbatim): The era's signature mechanic is present and structurally load-bearing, but as a clock and a stage, not as a decision the rider optimizes: `StormWaveScheduler` genuinely replaces the generic wave schedule (the storm cycle IS the wave counter — `currentRunWave()` reads `deepwater.diagnostics.corsairWaves`, and the era audit's "18 storm waves" is exactly the 24s weather cycle emitting the run's whole cadence), and the boss "rides inside the storm wall" (`DredgeQueenBossSystem.onStormWave` arms on wave 1's front). But nothing about the weather is a choice: storms slow nothing headless for this rider (the movement multiplier hook is race/regatta-only), corsairs cross on three fixed lanes and recycle unfought, and the E5 verbs the view sells — `BOAT_BUILD` (harpoon ballista, depth-charge rack), `REANCHOR` — are strategically inert because their weapon ranges (14/12) never intersect a single enemy trajectory and both anchors sit ~35+wu from every wreck. The fields that actually carried the ride: `now.deepwater.dredgeQueenBoss` (anchor/act/livePaddles — the whole hunt), `now.seams` (the five wreck-site seams), and `now.pendingSecure`; the orders that carried it: HOLD (the ambush geometry is the entire strategy), HARVEST, and one SECURE_CHOICE. So: a boss-logistics map whose storm scheduler is real but whose adversarial-weather "prediction" content is zero for a door rider — closer to RESKIN-with-a-real-clock than to an exercised mechanic; the audit's EXERCISES verdict is true of the scheduler's wiring, not of any decision I had to make about weather.
- Lessons (rider, verbatim):
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
