> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** The master's event vocabulary is byte-present at `src/game/Economy.ts:30-31` (`{ type: 'gold_stolen'; amount }` / `{ type: 'gold_reclaimed' }`), with `src/entities/GoldPickup.ts` and the carrier hunt at `src/entities/Enemy.ts:917` `context.nearestGoldHolding(...)`; spec `e2e/m2-04-gold-stealing.spec.ts`. See F-1132-1.

# Task 006 — M2-04 gold-stealing (+ spawnPack option-arg rider)

**Spec (BINDING, read fully):** `specs/m2-base-waves/slices/04-gold-stealing.md`.
**Brief constraints:** `docs/GOLD_RUSH_BRIEF.md` §9.2 (comic never gory, frontier-tech), §9.3 (claim jumpers/rustlers — no new factions), §9.4 naming. Read `AGENTS.md` first.
**Skills:** `threejs-gameplay-systems` (pooling, state machines), `threejs-qa-release` (evidence).

## Goal

Thief behavior on the existing Claim Jumper (state flag, same pool): with ≥1 stockpile built, a Balance-tuned share of each pulse seeks the nearest gold holding (stockpile > loose pickup), grabs `min(grabAmount, banked)` via Economy `gold_stolen`, flees to its own spawn edge (faster, steers around walls), despawns with the gold at the edge; killed carriers drop a pooled reclaimable `GoldPickup` that credits `gold_reclaimed` + floats `+N` on hero walk-over (cap = BLOCK-never-destroy, pickup persists). Loose pickups are re-stealable (transfer, no event). The spec wins over this file.

## What already exists (do NOT redo)

- `Enemy.setAnimationClip(clip)` + contract-v2 jumper clips `grab` (front) / `flee` (back) are contract-ready and DORMANT — request them; unknown clips already fall back walk→idle in SpriteAnimator. **No SpriteAnimator/`src/assets/*` edits.**
- WaveSystem owns `CompassEdge` per pulse group (m2-03) — thread it through `EnemySpawnParams` (additive `edge?`, `thief?`).
- Kill flow: `enemy_killed` event + `Game.onEnemyKilled(position)` — hang the drop there. CombatSystem is UNTOUCHED.
- Economy event-log replay, bankCap BLOCK-never-destroy semantics, `gold_capped` observability (m2-02); `Vfx.floatText(pos, text, color)`; palisade avoidance steering (m2-01 — reuse, do not modify).
- `spawnPack(5,3)` currently special-cases a zero-speed ring (s19 de-flake). **Rider:** replace with explicit `spawnPack(n, radius, opts?: { speedScale?: number })`; update ONLY harness plumbing (Game/DebugTools) — m1-02 + feedback-fx e2e must stay green UNMODIFIED (they rely on the zero-speed behavior; pass the explicit arg where the harness call sites need it — check how those suites invoke it and keep their observed behavior identical).

## Files in scope

- `src/entities/Enemy.ts` (thief states, carried amount, sack/tint tell, clips), `src/entities/GoldPickup.ts` (NEW, pooled — XpMote pattern)
- `src/systems/WaveSystem.ts` (spawn-time thief assignment + edge threading ONLY — no scheduler/curve changes)
- `src/systems/TargetingSystem.ts` (gold-holding registry + `nearestGoldHolding`)
- `src/game/Economy.ts` (events `gold_stolen`/`gold_reclaimed`, reduce, additive summary fields), `src/game/Balance.ts` (**new `steal` section ONLY**)
- `src/game/Game.ts` (wiring: drop hook, walk-over collection, holding registration, `spawnThief`, `?nosteal`, diagnostics `state.steal`, spawnPack rider). **Sibling-changes rule: leave every line you didn't need to change EXACTLY as found.**
- `src/systems/DebugTools.ts` (lil-gui `steal` section, harness surface)
- `e2e/m2-04-gold-stealing.spec.ts` (NEW — tests (a)–(g) per spec §Acceptance)
- Read-only accessor additions allowed on `src/entities/Stockpile.ts` (grab-point position) if missing — additive only.

**Do not touch:** `src/entities/Hero.ts`, `src/systems/CombatSystem.ts`, `src/systems/BuildSystem.ts`, `src/game/buildables.ts`, `src/entities/Sluice.ts`, HarvestSystem sluice logic, `src/world/Terrain.ts`, `src/assets/*`, `src/ui/*`, `assets/*`, `scripts/*`, existing `e2e/*` specs, `STATUS.md`, `reviews/*`, specs other than M2-04 progress notes.

## Acceptance (spec §Acceptance, verbatim gates)

1. tsc/build green; zero console/page errors desktop + 390px.
2. New e2e (a)–(g): steal amount+float+replay, flee-to-own-edge (in-page rAF tracker — protocol polling LIES at low fps), reclaim credit+float, cap-block persistence, pathing around walls (<20s sim, no stall), no-stockpile neutrality (`state.steal.thieves === 0` under real waves), re-steal transfer without Economy event.
3. Canaries green UNMODIFIED: m1-01, m1-03, m2-01, m2-02, m2-03, vp-02, m1-02, feedback-fx.
4. **FULL regression** (sim semantics changed) — all spec files.
5. Screenshots → `reviews/shots-m2-04/` (carrying thief mid-flee, ground pickup, steal float, 390px).
6. Perf: no per-frame allocations in thief/pickup updates; draw calls Δ ≤ +2 vs m2-02 baseline.
7. Economy conservation is LAW: log replay == HUD balance at every assert point; gold is only ever written by Economy.

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` (own webServer). Reply READY-FOR-GATES when done — supervisor runs gates. Do not `git commit`.
