# Task 009 — M2-05 base-damage-and-repair

**Spec (BINDING, read fully):** `specs/m2-base-waves/slices/05-base-damage-and-repair.md`.
**Brief constraints:** `docs/GOLD_RUSH_BRIEF.md` §9.2 (comic never gory, frontier-tech, prosperity framing), §9.3 (wreckers are Claim Jumpers with crowbars — no new faction), §9.4 naming. Read `AGENTS.md` first.
**Skills:** `threejs-gameplay-systems` (pooling, state machines, instancing), `threejs-qa-release` (evidence).

## Goal

Buildables get HP and can be wrecked and repaired. A spawn-time-flagged wrecker subset of pulse jumpers (only when ≥1 buildable is built; thief flag wins; same pool, state flag) seeks the NEAREST buildable via TargetingSystem `nearestBuilding`, melee-pulses it through CombatSystem (sole damage resolver — additive `building_damaged`/`building_wrecked` events), never seeks the hero. At hp 0 the instance becomes a ruin: function off (per-instance ShooterHandle unregister, cap source removed, sluice income stops), blocking off (real breach), rubble placeholder, footprint reserved. Hero repairs by dwelling in radius: ring fills, completion atomically debits `gold_spent` sink `repair_<id>` (50% base cost), floats `-N`, restores full hp/function/blocking. HP bars pooled, damaged-only. The spec wins over this file.

## What already exists (do NOT redo)

- `BuildableDef.hpMax: number | null` is ALREADY in the def type (m2-01) — all currently null. Flip to values read from new `Balance.wreck.hp.*`.
- `CombatSystem.handleEnemyContact` is the resolution pattern to mirror for building hits; `registerShooter` returns an unregister fn — but BuildSystem currently only bulk-clears them (~line 285). Build the per-(family,index) tracking the wreck lifecycle needs.
- TargetingSystem gold-holding registry + `nearestGoldHolding` (m2-04) — building registry + `nearestBuilding(from)` follows the same shape.
- WaveSystem thief assignment at spawn time + `EnemySpawnParams.edge?/thief?` (m2-04) — add `wrecker?: boolean` the same way; spawn-time assignment ONLY, no scheduler/curve changes.
- Thief state machine in Enemy.ts (m2-04) — wrecker states are a sibling; re-acquire at cycle granularity; tint-shift tell pattern (thief poncho) for the wrecker bandana; jumper `grab` clip = swing placeholder (unknown-clip fallback exists; **no SpriteAnimator/`src/assets/*` edits**).
- HarvestSystem's RingGeometry progress ring — copy the pattern for the repair ring (pooled, world-space). **Do not extend HarvestSystem.**
- Palisade avoidance steering (m2-01) — blockers feed Enemy steering; wreck removes, repair re-adds; do NOT modify the algorithm.
- Economy: `gold_spent` with `sink: BuildSink` — widen the union additively with `repair_${BuildableId}`; BLOCK-never-destroy cap semantics + `removeCapSource` (m2-02); `Vfx.floatText(pos, text, color)`; spend floats use sienna `#a0522d`.

## Files in scope

- `src/systems/BuildSystem.ts` (per-instance hp storage, wreck/ruin/repair lifecycle, per-index shooter unregister, rubble + HP-bar + repair-ring pooled visuals, repair dwell update — hero position passed in)
- `src/entities/Enemy.ts` (wrecker states, tell, swing clip request)
- `src/systems/WaveSystem.ts` (wrecker pulse cadence + spawn-time flagging ONLY)
- `src/systems/CombatSystem.ts` (building-hit resolution + `building_damaged`/`building_wrecked` events — additive; existing bolt/contact paths byte-identical)
- `src/systems/TargetingSystem.ts` (building registry + `nearestBuilding`)
- `src/game/buildables.ts` (hpMax values via Balance), `src/game/Balance.ts` (**new `wreck` section ONLY**), `src/game/Economy.ts` (BuildSink union widening + additive summary fields ONLY)
- `src/game/Game.ts` (wiring: hero pos → repair dwell, `spawnWrecker`/`wreck` harness, `?nowreck`, diagnostics `state.wreck`, float hooks). **Sibling-changes rule: leave every line you didn't need to change EXACTLY as found.**
- `src/systems/DebugTools.ts` (lil-gui `wreck` section, harness surface)
- `e2e/m2-05-base-damage-repair.spec.ts` (NEW — tests (a)–(h) per spec §Acceptance)
- Allowed additive-only: read-only wrecked-gate where sluice income ticks (HarvestSystem or Game — implementer's call, minimal diff); banner flavor line for wrecker pulses (no scheduler changes).

**Do not touch:** `src/entities/Hero.ts`, HarvestSystem panning logic, `src/entities/Sluice.ts` internals, `src/world/Terrain.ts`, `src/assets/*`, `src/ui/*` (world-space visuals only — no HUD/menu changes), `scripts/*`, `assets/*`, existing `e2e/*` specs, `STATUS.md`, `reviews/*`, specs other than M2-05 progress notes.

## Acceptance (spec §Acceptance, verbatim gates)

1. tsc/build green; zero console/page errors desktop + 390px.
2. New e2e (a)–(h): hit cadence + `building_damaged` + damaged-only HP bar; wreck → ruin + REAL breach (in-page rAF tracker — protocol polling LIES at low fps) + beacon stops firing + stockpile cap drop with banked>cap surviving; repair debit exact (sink `repair_palisade`) + float + function/blocking restored + replay == HUD; dwell interrupt = no debit; no-funds = no start + one float; nearest-buildable targeting with hero ignored; neutrality (no buildables → zero wreckers; `?nowreck` works); no-orphan wreck/repair ×3 (draw calls, shooter registrations, geometry counts return to baseline).
3. Canaries green UNMODIFIED: m1-01, m1-03, m1-05, m2-01, m2-02, m2-03, m2-04, m2-06, vp-02, vp-02b. If a canary's real-wave window can reach a wrecker pulse, the release valve is `Balance.wreck` defaults (minWave up) — NEVER editing the canary; report as a finding.
4. **FULL regression** (sim semantics changed) — all spec files.
5. Screenshots → `reviews/shots-m2-05/`: wrecker mid-swing (dust puffs), damaged HP bar, ruin + breach with enemies pathing through, repair ring mid-dwell, 390px.
6. Perf: no per-frame allocations in wrecker/repair/bar updates; draw calls Δ ≤ +2 vs m2-04 baseline; all new visuals pooled.
7. Conservation is LAW: log replay == HUD at every assert point; hp mutates ONLY inside CombatSystem resolution (harness `wreck()` routes through it); gold only via Economy.

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts` (own webServer). Reply READY-FOR-GATES when done — supervisor runs gates. Do not `git commit`.
