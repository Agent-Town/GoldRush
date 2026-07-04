# Task 002: implement M2-03 wave-scheduler-v2

You are Codex, implementer for Gold Rush, running on Robin's Mac in the project folder. Claude (Cowork) orchestrates and runs final gates.

READ FIRST: `specs/m2-base-waves/slices/03-wave-scheduler-v2.md` (BINDING contract + acceptance), then `AGENTS.md`.

## Scope summary (slice spec is authoritative)

1. Knee curve on escalation: post-wave-10 growth eases toward a ceiling. `Balance.waves.{kneeWave, kneeSharpness, budgetCeiling, lullSeconds, pulsesPerWave, edgesPerPulse}` — all in the ?debug lil-gui Balance folder.
2. Multi-edge pulses with per-edge telegraph banners 2s ahead (existing banner system; edge named in copy, flavor rotation continues).
3. Spawn-free lulls ≥ `lullSeconds` between pulses; HUD next-wave timer keeps working; `Δ(nextWaveInSim) ≡ Δ(timeAlive)` identity preserved.
4. `__GR_TEST__.state` wave diagnostics extended `{pulse, edge, budget}`; `?nowaves/?nokill/?nospawn` keep their EXACT semantics.
5. NEW `e2e/m2-03-wave-scheduler.spec.ts` per acceptance §2 (spawn accounting across the knee, lull assert, telegraph-precedes-pulse ordering, timer identity ×3 waves). In-page counters/rAF trackers only — no protocol polling for timing asserts.

## FILE SCOPE (hard boundary — parallel lanes exist)

Touch ONLY: `src/systems/WaveSystem.ts`, `src/game/Balance.ts` (waves section ONLY), banner/HUD copy (`src/ui/Hud.ts` banner region), `src/systems/DebugTools.ts` (gui folder), NEW e2e file. Do NOT touch `Enemy.ts`, `BuildSystem`, `BuildButton`, `Terrain.ts`, `CombatSystem`, `Economy` — other task lanes own them right now.

The working tree may already contain sibling-lane changes (tasks/001, 003). If unrelated tests fail or files look mid-edit, NOTE it in your final message and stay in your file scope — do NOT fix other lanes' files.

## Rules

- Self-check locally: `npx tsc`, `npm run build`, your new spec green, `e2e/m1-03-wave-pressure.spec.ts` green (wave semantics regression canary).
- No git commits. No edits to STATUS.md, specs/, reviews/, or EXISTING e2e files.
- Firewall: one enemy archetype, no boss, no enemy movement changes, don't change `?stress` bypass.
- End your final message with exactly `READY-FOR-GATES` + files changed + local test results.
