# M2-05 — base-damage-and-repair (expanded s24, 2026-07-04)

**Status: DELEGATED (tasks/009, relay mode — chatgpt.com 403).**

**Goal:** buildables become mortal. A wrecker subset of pulses attacks the NEAREST buildable (never seeks the hero); wrecked buildings become repairable ruins; you triage repairs mid-wave. Checkpoint: a wall line takes a beating, a breach opens, you repair under pressure. (README contract; M1 note honored — beacons lose `indestructible`.)

## Contract

1. **HP (BuildSystem owns storage, defs own values):** every `BuildableDef.hpMax` goes non-null, values read from new `Balance.wreck.hp.{sentry_beacon,palisade,sluice,stockpile,turret}` (defaults §Design calls). BuildSystem tracks per-instance hp; placement spawns at full hp. HP is NEVER mutated outside the CombatSystem path (§4).
2. **Wrecker assignment (WaveSystem, spawn-time only — mirrors 04 §1):** a pulse is a wrecker pulse when `pulseIndexInWave % Balance.wreck.pulseEvery === 0`, wave ≥ `Balance.wreck.minWave`, **AND ≥1 buildable is built at spawn time** (no base → zero wreckers → pre-05 sims byte-identical; 04's stockpile-gate precedent). On wrecker pulses, `floor(count × Balance.wreck.share)` (min 1) jumpers per edge group spawn flagged `wrecker` — additive `EnemySpawnParams.wrecker?: boolean`. **Thief flag wins:** wreckers are drawn from the non-thief remainder; one enemy is never both. Same pool, state flag, never a new entity class (README invariant).
3. **Wrecker behavior (Enemy.ts):** `seekBuilding (nearestBuilding via TargetingSystem) → swinging (in reach Balance.wreck.reach: melee hit every Balance.wreck.hitCooldown, sim-time)`. Target wrecked or removed → re-acquire nearest at cycle granularity (04 §2 pattern); none left → behave as a normal jumper until one exists. Wreckers NEVER target the hero (contact damage on touch stays — unchanged law — but pathing/objective is buildings only). Tell: crowbar/pick prop + bandana tint shift (placeholder tint, thief-poncho pattern); swing uses jumper `grab` clip as placeholder (no attack clip exists; unknown-clip fallback covers the rest). Comic, never gory (§9.2) — hits spark dust puffs (pooled Vfx), same faction (§9.3 — a wrecking crew of Claim Jumpers, no new faction).
4. **Damage resolution (CombatSystem — sole damage resolver, README invariant):** Enemy requests the hit; CombatSystem resolves `Balance.wreck.damage` onto the instance via a BuildSystem handle (mirror of `handleEnemyContact`), emits additive events `building_damaged` (family, index, hp, maxHp, sourceId) and `building_wrecked`. Enemy/BuildSystem never mutate hp directly.
5. **Wreck → ruin (BuildSystem lifecycle):** at hp 0 the instance becomes a RUIN: function OFF (ShooterHandle unregistered **per-instance**, stockpile cap source removed, sluice income stops), steering/blocking OFF (the breach is the point — enemies path through), low rubble placeholder mesh (flattened, tinted, pooled), HP bar hidden. Footprint stays RESERVED (nothing can be built on a ruin; repair is the only recovery — no demolish in 05). Stockpile wreck with banked > new cap = **BLOCK-never-destroy** (02 law): banked stands, credits block until room.
6. **Repair (dwell verb — panning consistency, no new input surface):** hero inside `Balance.wreck.repairRadius` of a ruin → progress ring fills over `Balance.wreck.repairSeconds` (HarvestSystem ring pattern, pooled — do NOT extend HarvestSystem); leaving radius resets progress. Completion debits `ceil(baseCost × Balance.wreck.repairCostFrac)` ATOMICALLY via Economy `gold_spent`, sink literal `repair_<buildableId>` (BuildSink union widened additively), floats `-N` sienna at the ruin, restores FULL hp + function + blocking + re-registers shooter/cap source. Insufficient gold → ring shows blocked state + one "Need gold!" float (Vault-full pattern), progress does not start. `baseCost` = def cost at count 1 (flat — repair never compounds with costCurve).
7. **HP bars:** pooled world-space quads above buildables, visible ONLY when `0 < hp < hpMax` (never at full, never on ruins). No per-frame allocation; bars ride a pooled batch.
8. **TargetingSystem** grows a building registry + `nearestBuilding(from)` (README-named query) — register on place/repair, unregister on wreck/removal. Still ONE targeting impl.
9. **Diagnostics/harness:** `state.wreck = { wreckers, ruins, hitsResolved, wrecked, repairs, repairGold }`; `__GR_TEST__.spawnWrecker(edge?)`; `__GR_TEST__.wreck(family, index)` (direct-wreck for repair tests without combat); `?nowreck` kill switch (joins `?nosteal/?nowaves/...` family).
10. **Perf:** rubble/bars/rings pooled; no per-frame allocations in wrecker updates (retarget at cycle granularity); draw calls Δ ≤ +2 vs m2-04 baseline.

## Design calls taken without Robin (flag at m2-07, all reversible knobs)

- **Repair = dwell** (stand near ruin, ring fills), not a new interact key: reuses the panning verb the player already knows, touch-native (M1 mobile-UX debt law), zero input-surface growth. Overrule → corrective task adds a key/button.
- **Ruins stop blocking.** A wrecked wall that still blocks would make wreckers pointless — the breach IS the siege. Reserved footprint keeps the layout decision intact.
- **Repair cost = 50% of base cost, flat** — not costCurve-indexed (repairing your 4th wall shouldn't cost like building a 5th).
- **Full-restore repair** (no partial). Partial/pro-rated is a 07 tune candidate.
- Defaults: hp beacon 40 / palisade 60 / sluice 40 / stockpile 80 / turret 50; damage 8; hitCooldown 0.9; reach 1.1; share 0.34; pulseEvery 2; minWave 4; repairSeconds 1.2; repairCostFrac 0.5; repairRadius 1.4 — all `Balance.wreck`, lil-gui section (DebugTools).

## Acceptance criteria

1. `npx tsc` + `npm run build` green; zero console/page errors desktop + 390px.
2. New `e2e/m2-05-base-damage-repair.spec.ts`: **(a)** damage: build palisade, `spawnWrecker` → hp drops by exactly `damage` per hit at `hitCooldown` cadence (sim-time), `building_damaged` logged, HP bar appears only after first hit; **(b)** wreck: hp→0 → `building_wrecked`, ruin visual, breach real (rAF tracker: enemy crosses the former wall cell), wrecked BEACON stops firing (per-instance ShooterHandle unregistered — diag shooter count), wrecked STOCKPILE drops bankCap with banked > cap surviving un-destroyed; **(c)** repair: dwell → exact debit via `gold_spent` sink `repair_palisade`, `-N` float, full hp, function+blocking restored (beacon fires again), replay == HUD; **(d)** interrupt: leave radius mid-dwell → no debit, no hp change; **(e)** no funds: progress does not start, no debit, "Need gold!" float once; **(f)** targeting: two buildables at different distances → wrecker hits the NEAREST; hero standing closer is ignored (never retargets hero); **(g)** neutrality: NO buildables + real-wave window → `state.wreck.wreckers === 0`, no `building_damaged`; `?nowreck` respected with buildables present; **(h)** no-orphan: wreck/repair ×3 on a beacon → draw calls, shooter registrations, and renderer geometry counts return to baseline (m1-01 geometry-growth pattern).
3. Canaries green UNMODIFIED: m1-01, m1-03, m1-05 (beacon def), m2-01 (blocking/menu), m2-02 (economy/cap), m2-03 (scheduler — WaveSystem touched), m2-04 (thief flag adjacency — Enemy/WaveSystem touched), m2-06 (turret/ShooterHandle adjacency — CombatSystem touched), vp-02/vp-02b (Enemy.ts touched).
4. **FULL regression** — sim semantics changed (all spec files, per-file ≤45s batches, fresh vite per call).
5. Screenshots → `reviews/shots-m2-05/`: wrecker mid-swing at a wall (dust puffs), damaged-HP bar, ruin + breach with enemies pathing through, repair ring mid-dwell, 390px frame.

## Firewall (do NOT)

- No enemy ranged attacks; no auto-repair buildable; no demolish/refund; no theft-alarm charm (07); no new buildable defs; no repair UI in HUD/menus (world-space ring only).
- Wreckers never damage the hero beyond existing contact law; thieves (04) never damage buildings — flags stay mutually exclusive.
- Economy: sole gold writer; NO new event types — repair rides `gold_spent` with new sink literals only; replay/summary compat untouched (summary MAY gain repair fields additively).
- HP mutation only inside the CombatSystem resolution path (harness `wreck()` included — it routes through CombatSystem at damage = remaining hp).
- No edits: `src/entities/Hero.ts`, `src/systems/HarvestSystem.ts` panning logic (a read-only wrecked-gate on sluice income is allowed if income ticks there), `src/entities/Sluice.ts` internals, `src/world/Terrain.ts`, `src/assets/*`, SpriteAnimator, existing e2e, STATUS/reviews/other specs.

## Notes for implementer

- BuildSystem's shooter unregisters are currently a BULK array (clear-all on reset, lines ~285) — per-instance wreck needs per-(family,index) unregister tracking. This is the invariant the no-orphan e2e exists for.
- Palisade steering/avoidance from m2-01 lives with Enemy — find where blockers feed it; wreck must remove, repair must re-add. Do not modify the algorithm.
- Wrecker pulse telegraph: banner flavor rotation (m2-03) MAY gain a wrecker line ("Wrecking crew…") — additive flavor only, no scheduler changes.
- If a canary suite's real-wave window can legitimately reach a wrecker pulse (buildables built, wave ≥ 4), the release valve is knob defaults (minWave up), NEVER editing the canary. Report it as a finding either way.
- e2e movement/breach asserts: in-page rAF trackers ONLY (headless fps floor is a fiction; protocol polling lies).
- Conservation law: replay == HUD at every assert point; when in doubt, add observability events at amount 0, never mutate gold outside Economy.
