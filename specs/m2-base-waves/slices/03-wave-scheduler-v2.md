# M2-03 — wave-scheduler-v2 (expanded s9b, 2026-07-04)

**Goal:** escalation gets a knee; pulses get rhythm and telegraphs; lulls become real decision windows (the wave-18 valve). Independent of M2-01 per the slice graph (03 ∥ 01/02).

## Contract

1. **Knee curve:** post-wave-10 growth eases toward a ceiling (e.g. logistic/soft-cap on spawn budget). `Balance.waves.{kneeWave, kneeSharpness, budgetCeiling, lullSeconds, pulsesPerWave, edgesPerPulse}` — all in the ?debug lil-gui Balance folder, Copy-JSON friendly. Informed play at wave 18 previously topped the band — the ceiling must keep pressure high but survivable-with-skill (tune vs `docs/playtests/2026-07-03` wave-18 findings).
2. **Multi-edge pulses:** a wave = 1..N pulses; each pulse spawns from 1..M map edges; per-edge telegraph banner 2s ahead (existing banner system, flavor rotation continues, edge direction named — "from the north bank!" style copy per brief §5 voice).
3. **Lull windows:** between pulses, spawn-free lull ≥ `Balance.waves.lullSeconds` (default sized so panning/building is a REAL choice — start 8s, tune at 07). HUD next-wave timer keeps working; `Δ(nextWaveInSim) ≡ Δ(timeAlive)` identity preserved.
4. **One enemy archetype still.** No boss, no variants (M2.5/M3). Spawn accounting API unchanged for e2e (`__GR_TEST__.state` wave diagnostics extended: `{pulse, edge, budget}`).
5. WaveSystem/Balance/HUD-banner files ONLY — do NOT touch Enemy movement/entities (M2-01 lane owns Enemy.ts right now), CombatSystem, BuildSystem.

## Acceptance

1. tsc/build green; zero console errors.
2. New `e2e/m2-03-wave-scheduler.spec.ts`: (a) sim-time spawn accounting across the knee — cumulative spawns at waves 8/10/14 match the curve formula within tolerance (`?nokill` + time-scale, in-page counters); (b) lull assert — no spawns for ≥ lullSeconds between pulses (sim-time window sampling); (c) telegraph precedes every pulse (banner event log ordering, per-edge); (d) wave timer un-drift identity holds across 3 waves.
3. FULL regression (wave semantics change old suites' spawn assumptions — m1-01/02/03 must stay green; `?nowaves/?nospawn` harness params must keep their exact semantics).
4. NOT-FLAT verdict process rerun vs m1-03 baseline: play-curve evidence in review (spawn/pressure graph over waves 1–15 from sim run, attached as data not vibes).
5. Screenshots: telegraph banner desktop+390px to `reviews/shots-m2-03/`.

## Firewall

No enemy archetype changes, no boss, no enemy movement edits, no theft (04), no building damage (05). Don't change `?stress` bypass. Economy untouched.
