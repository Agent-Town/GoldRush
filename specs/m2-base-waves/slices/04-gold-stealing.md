# M2-04 — gold-stealing (expanded s20, 2026-07-04)

**Status: DELEGATED (tasks/006, relay mode — chatgpt.com 403).**

**Goal: THE M2 FUN GATE.** Claim Jumpers gain a second objective — rob the base, flee with the gold, drop it when killed. Checkpoint: ignore defense → get robbed → chase the thief down → reclaim. If stealing isn't tense here, stop and re-slice before 05+ (milestone bet, README).

## Contract

1. **Thief assignment (WaveSystem, spawn-time only):** a pulse marks `floor(count × Balance.steal.share)` jumpers per edge group as thieves (min 1 when wave ≥ `Balance.steal.minWave`), **ONLY if ≥1 stockpile is built at spawn time.** `EnemySpawnParams` grows additive `edge?: CompassEdge` + `thief?: boolean`. Thieves reuse the enemy pool — a state flag, never a new entity class (README invariant).
2. **Thief state machine (Enemy.ts):** `seekHolding → grabbing (windup Balance.steal.grabSeconds, sim-time) → fleeing (to OWN spawn edge) → despawn at edge`. Holding priority: **stockpile (bank theft) > loose gold pickup**. No valid target (banked 0, no pickups) → behave as a normal jumper until one exists (re-check at cycle granularity, not per-frame).
3. **Steal:** on grab completion, Economy event **`gold_stolen`**, amount `min(Balance.steal.grabAmount, banked)` — Economy stays sole gold writer; debit is never cap-relevant. `-N` float at the holding (`Vfx.floatText`, mirror of the pickup rule). Carrying tell: sack mesh visible + poncho tint shift while carrying only. Comic, never gory (§9.2): scurry + dust puffs (pooled Vfx), no blood.
4. **Flee:** speed × `Balance.steal.fleeSpeedMult`; steers around palisades via the EXISTING avoidance (no algorithm changes); reaching own spawn edge → despawn with the gold (permanently lost — already logged at steal time; replay stays exact).
5. **Drop & reclaim:** killed while carrying → pooled **`GoldPickup`** (new entity, XpMote pattern) at death position holding the carried amount; hero walk-over → **`gold_reclaimed`** credit + `+N` float (standing rule, e2e-asserted). **Cap interaction is BLOCK-never-destroy** (02 law): at bankCap the pickup persists un-consumed, "Vault full!" float; credits once room exists. Pool cap `Balance.steal.pickupCap` (24); overflow merges into nearest existing pickup (amounts add).
6. **Re-steal:** seekHolding thieves may grab a loose pickup — amount transfers to the carrier, **NO Economy event** (that gold is already debited); fleeing thieves ignore pickups.
7. **TargetingSystem** grows a gold-holding registry + `nearestGoldHolding(from)` query — still ONE targeting impl (README invariant). Stockpiles register on build / unregister on removal; pickups on drop/consume.
8. **Diagnostics/harness:** `state.steal = { thieves, fleeing, carriedTotal, stolenTotal, reclaimedTotal, pickups }`; `__GR_TEST__.spawnThief(edge?)`; `?nosteal` kill switch (harness param family law — joins `?nowaves/?nolevel/...`). **Rider (s19 finding 1, scope now open):** `spawnPack(n, radius, opts?: { speedScale?: number })` — explicit option replaces the special-cased zero-speed (5,3) ring; m1-02 + feedback-fx stay green unmodified.
9. **Perf:** GoldPickup instanced/pooled; no per-frame allocations in thief updates (retarget at cycle granularity); draw calls Δ ≤ +2 vs m2-02 baseline (sack rides the enemy instance family or a pooled accessory).

## Design calls taken without Robin (flag at m2-07, all reversible knobs)

- **Sluice DROPPED as steal target v1** (README compact contract said stockpile > sluice > loose pile): post-02 sluices hold no standing balance — income batches straight to bank — and the contested rule already pauses a sluice with a thief nearby, which reads as "being raided." Overrule → corrective task.
- **Thieves require a built stockpile** (spawn-time gate): no stockpile → zero thieves → pre-04 sims byte-identical (protects m1-01/m1-03/m2-01/m2-03 suites; matches the milestone bet "a base worth robbing").
- Defaults: share 0.25, minWave 3, grabAmount 10, grabSeconds 0.8, fleeSpeedMult 1.35, grabRadius 0.9, pickupCap 24 — all `Balance.steal`, lil-gui section (DebugTools).

## Acceptance criteria

1. `npx tsc` + `npm run build` green; zero console/page errors desktop + 390px.
2. New `e2e/m2-04-gold-stealing.spec.ts`: **(a)** steal: grantGold + stockpile + `spawnThief` → banked drops by exactly grabAmount on grab completion, `gold_stolen` logged, HUD == log replay, `-N` float present; **(b)** flee: in-page rAF tracker shows distance-to-spawn-edge monotonically shrinking (tolerance for steering), despawn at edge, debit stands, replay == HUD; **(c)** reclaim: kill the carrier → pickup at death spot → walk-over → `gold_reclaimed`, `+N` float, replay == HUD; **(d)** cap-block: banked at cap → walk-over no-op + pickup persists + `gold_capped` observability intact; make room (spend) → credits; **(e)** walls: thief paths around a palisade line to the stockpile and back (no stall, <20s sim, rAF tracker — m2-01 pattern); **(f)** neutrality: NO stockpile → real waves for a window → `state.steal.thieves === 0` and no `gold_stolen`; **(g)** re-steal: second thief grabs an unclaimed pickup — carried transfers, log gains NO event, conservation holds.
3. Canaries green UNMODIFIED: m1-01 (kill/death flow), m1-03 (wave pressure neutrality), m2-01 (blocking/menu), m2-02 (economy/stockpile), m2-03 (scheduler — WaveSystem touched), vp-02 (sprite clips — Enemy.ts touched), m1-02 + feedback-fx (spawnPack rider).
4. **FULL regression** — sim semantics changed (all spec files, per-file ≤45s batches, fresh vite per call).
5. Screenshots → `reviews/shots-m2-04/`: carrying thief (sack tell) mid-flee, ground pickup, steal float at stockpile, 390px frame.
6. Animation: use contract-v2 clips via existing `setAnimationClip` — jumper `grab` (front) / `flee` (back) where the orientation has them; SpriteAnimator's unknown-clip walk→idle fallback covers the rest. **No SpriteAnimator/assets edits.**

## Firewall (do NOT)

- Thieves never damage buildings (05); no hero gold pickpocketing; no theft-alarm charm (07); no new buildable defs, no BuildSystem/HUD/menu changes.
- CombatSystem untouched — kills resolve exactly as today; the drop hook rides the existing `enemy_killed`/`onEnemyKilled` path in Game wiring.
- Economy: sole gold writer; event literals exactly `gold_stolen` / `gold_reclaimed`; existing literals, replay, and summary compat untouched (summary MAY gain stolen/reclaimed fields additively).
- No edits: Hero.ts, CombatSystem.ts, BuildSystem.ts, buildables.ts, HarvestSystem sluice logic (pickup collection may live in Game wiring OR an additive HarvestSystem method — implementer's call), Sluice.ts, Terrain.ts, `src/assets/*`, existing e2e, STATUS/reviews/other specs.

## Notes for implementer

- Spawn-edge memory: WaveSystem already owns `CompassEdge` per pulse group — pass it through spawn params; a thief with no recorded edge (harness spawn without arg) flees the NEAREST edge.
- Stockpile grab point: nearest built stockpile's position (read-only accessor if one doesn't exist — additive only, Terrain-accessor precedent).
- e2e movement asserts: in-page rAF trackers ONLY (headless fps floor is a fiction — 6fps observed; protocol polling lies).
- Death drops at cap and conservation: replay == HUD is the law; when in doubt, log more observability events at amount 0, never mutate gold outside Economy.
