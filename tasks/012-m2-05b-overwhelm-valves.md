> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27).** `src/game/Balance.ts:718-720` `maxConcurrent: 2` / `maxConcurrentPerWaves: 6` / `maxConcurrentCap: 4`, `:83` `lullFloor12: 8`, `:762` `hpWaveScale`, and `:798` `repairCostFrac: 0.3` — retuned 0.5→0.3 exactly as the master's goal 6 asked; `src/core/DebugParams.ts:11` `noping`; spec `e2e/m2-05b-overwhelm-valves.spec.ts`; review `reviews/m2-05b-overwhelm-valves.md`. See F-1132-1.

# Task 012 — M2-05b overwhelm valves (Addendum-3 directive)

**Directive (BINDING):** `docs/playtests/2026-07-04-robin-m1-visuals.md` Addendum 3.A — valves against high-wave overwhelm. Read it first. **Brief constraints:** §9.2 (comic, prosperity framing), §9.4 (naming/ledger voice). Read `AGENTS.md`.
**Context:** M2-05 is integrated (`reviews/m2-05-base-damage-and-repair.md`). This is a small valve lane, NOT a new mechanic slice. All numbers are `Balance` knobs with lil-gui sections; every default must keep pre-valve sims byte-identical where stated.

## Goal (four valves, nothing else)

1. **Thief concurrency cap:** new `Balance.steal.maxConcurrent` (default 2) + `maxConcurrentPerWaves` gentle scaling (default +1 per 6 waves, hard cap 4). WaveSystem's `thiefCount` clamps so (live flagged thieves) + (new thieves this pulse) ≤ cap. Needs a live-thief-count provider threaded like `canSpawnThieves` — spawn-time only, NO scheduler changes. Cap generous enough that m2-04's e2e windows never hit it (its tests spawn ≤2 concurrent thieves via harness — verify, don't modify).
2. **Distinct wrecker telegraph:** wrecker pulses announce a dedicated banner line (ledger voice, e.g. "Wrecking crew sighted — <edge>."), additive to the existing `waveCopy` rotation path at telegraph time. No scheduler/curve changes. §9.4 naming; no new factions.
3. **Lull floor retune at wave 12+:** using the existing m2-03 knee knobs ONLY (`Balance.waves.*`), add `Balance.waves.lullFloor12` (seconds, default chosen so waves <12 are BYTE-IDENTICAL and 12+ lulls never drop below the floor). If the current curve already respects a sane floor, implement the clamp with a default equal to current behavior and leave tuning to Robin's knob — the valve is the KNOB EXISTING.
4. **Theft alarm ping + edge-direction indicator:** on a thief grab (existing m2-04 event path), fire a short banner accent ("Gold snatched — <edge>!") + a compass-edge hint glyph near the banner (HUD-light: reuse banner surface + one small element; NO new overlay) + one audio ping via AudioSystem (existing sfx surface; skip audio if no cheap hook exists — note it). Respect `?nosteal` (never fires) and add `?noping` to the debug-param family. Auto-hide after ~3s (knob).

## Goal part 2 — wave-12 tune corrections (s9j directive, Robin live findings: "palisades break too fast, repair too expensive, bandit count high")

5. **Palisade HP wave-scaling:** `Balance.wreck.hpWaveScale` section (e.g. `{ palisade: perWave 4, startWave 6, cap 2.0× }` — defaults yours to propose, knobs Robin's to tune). GOTCHA: `buildableDefs[].hpMax` reads `Balance.wreck.hp.*` ONCE at module load — BuildSystem's `maxHpFor` must become wave-aware at PLACEMENT time (instances keep their spawn-time maxHp; no retroactive re-max). HP bars/diagnostics already carry per-entry maxHp — verify no full-hp assumption breaks.
6. **Repair cost down:** retune `Balance.wreck.repairCostFrac` default (0.5 → propose ~0.3) so repairing a wall line is meaningfully cheaper than rebuilding it. **The m2-05 e2e hardcodes amounts (grants 5, asserts sink amount 5) — fix it to DERIVE from `Balance.wreck.repairCostFrac × base cost` (ceil)** so the knob owns the number (knob-driven asserts, m1-06 pattern).
7. **Wrecker/thief interplay at waves 10–14:** with the part-1 thief cap in place, review `Balance.wreck.share`/`pulseEvery` so combined bandit pressure at waves 10–14 leaves room to act. Numbers via the probe below, all knobs.
8. **Acceptance probe (MANDATED, scripted):** new e2e scenario at wave 12 (setBalance/harness — no scheduler edits): a 6-segment palisade line survives ≥1 full wrecker pulse unrepaired (with wave-scaled hp), and repairing one wrecked segment costs strictly less than placing a new one at current count. Evidence shots of the wave-12 wall under assault → `reviews/shots-m2-05b/`.

## Files in scope

`src/systems/WaveSystem.ts` (cap clamp + telegraph line + lull clamp), `src/game/Balance.ts` (knobs; additive sections only), `src/game/Game.ts` (thief-count provider + ping wiring; sibling-changes rule — leave untouched lines EXACTLY as found), `src/systems/UiBridge.ts` + `src/ui/Hud.ts` + `src/ui/styles.css` (ping + edge glyph, additive), `src/core/DebugParams.ts` (`noping`), `src/systems/DebugTools.ts` (knob section), `src/systems/AudioSystem.ts` (ONLY if a one-liner ping fits), `src/systems/BuildSystem.ts` (wave-aware `maxHpFor` at placement ONLY — goal 5), `src/game/buildables.ts` (only if the static hpMax read must move), `e2e/m2-05-base-damage-repair.spec.ts` (ONLY the knob-derivation fix, goal 6), `e2e/m2-05b-overwhelm-valves.spec.ts` (NEW, incl. the wave-12 probe).

**Do not touch:** CombatSystem, Economy, BuildSystem, Enemy.ts, TargetingSystem, HarvestSystem, Hero.ts, `src/assets/*`, existing e2e, STATUS/reviews/specs, `tasks/010`/`tasks/011` scopes (this lane chains with them — expect their output in the tree; touch ONLY your files).

## Acceptance

1. tsc/build green; zero console/page errors desktop + 390px.
2. New e2e: (a) cap: force a wrecker-free wave with pulseBase high → flagged-thief live count never exceeds the cap (in-page rAF max-tracker, NOT protocol polling); (b) telegraph: wrecker pulse (wave ≥ wreck.minWave, buildable present) shows the wrecker line at telegraph time; non-wrecker pulses never do; (c) lull floor: with `lullFloor12` raised via setBalance, post-12 lull ≥ floor on sim-time pulse log (`lastPulseAt`); defaults → pre-valve pulse schedule byte-identical at waves < 12 (assert equality of pulse times vs a defaults run — or knob-driven asserts per the m1-06/m1-07 retro-gate pattern); (d) ping: harness thief grab → ping visible with the CORRECT edge glyph, auto-hides; `?noping` and `?nosteal` suppress; replay/HUD untouched (no Economy writes anywhere in this lane).
3. Canaries green UNMODIFIED: m2-03 (scheduler adjacency — the lull clamp must not shift pre-12 pulses), m2-04 (thief cap adjacency), m2-05, m1-03. FULL regression (wave semantics knobs added).
4. Screenshots → `reviews/shots-m2-05b/`: wrecker telegraph banner, theft ping + edge glyph, 390px frame.
5. Pre-valve neutrality: with default knobs and no thieves/wreckers active, sims are byte-identical to HEAD (except the additive telegraph line on wrecker pulses).

## Environment notes (Robin's Mac — you run there)

Run e2e via base `playwright.config.ts`. Reply READY-FOR-GATES when done — supervisor runs gates. Do not `git commit`.
