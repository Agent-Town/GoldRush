# Review — task 024: blast aiming + deep-wave durability + Hard Mode presets (s46 gate)

**Verdict: GREEN — integrated (single commit shared with 025; scopes entangled, see STATUS s46).**
Runner executed on-main (Mac), READY-FOR-GATES rc=0; log `tasks/runs/20260705-213342-main-024-*.log`.

## Scope check (per task file)
Balance.ts (aimMode knob, hp-curve extension w/ NEW sluice/stockpile rows + capMult raises, wreck.maxPerEdgeWave20, preset bundles + storage), Game.ts (reticle mesh + pointer/lead aim + clamp, preset plumbing, test hooks), CombatSystem.ts (targetPoint hook on lob shooter, lastBlastDetonation diag — damage resolution untouched, sole-resolver law intact), Upgrades/Progression (preset-driven coil budget, investBonus<=0 weight guard), WaveSystem (wrecker soft-cap wave>=20; setWaveForTest for w25 probe), DebugTools (string knobs), main.ts (boot preset apply), vite-env, e2e m2-06/07/07b + NEW task-024 spec. **In scope; no firewall breach; no secrets; naming on-canon (Greenhorn / Prospector's Trail / Vein-Hunter, Robin-ordered).**

Preset semantics verified against the order: Vein-Hunter = enemyHp 28, 3 XP/kill, offer weighting OFF (investBonus 0 + Progression guard makes it real), coil budget 3. Greenhorn = thief cap 1/3, palisade +20%. `applyDifficultyPreset` is reset-then-overlay (idempotent); applied at boot (main.ts) and every `resetRun` via stored key `gr.difficultyPreset.v1` (+ `?preset=` override) = profile-sticky. Reticle radius tracks blast-radius upgrades w/ geometry disposal (codex-review fix confirmed in code).

## Evidence
Mac (runner): tsc, build, task-024 5/5, m2-06 7/7, m2-07b 4/4, self-hold w15 2/2 + w25 + TTK. Probes: **w15 11/11 standing, 3 hits; w25 11/11 standing, 20 hits resolved** — deep-wave durability is now gated evidence.
In-VM re-verify (/tmp/gr-s46 snapshot): tsc clean; vite build clean; task-024 aim trio 3/3 + storage-blocked 1/1; m2-07 self-hold w15 1/1 (22s); m2-01 blocking 2/2; raw probe: blast active + aimMode cursor + reticle rendered (shot below), zero console/page errors.
Shots: `reviews/shots-task-024/desktop-blast-reticle.png` (teal ring at aimed point, Blast Charge HUD, parchment/teal on-brief).

## Findings
- **F-024-ENV (no action):** "profile key" test in-VM hit `net::ERR_INSUFFICIENT_RESOURCES` ×27 (s26 browser-refusal family, multi-context spec on degraded VM). All value assertions passed before the console-error gate; Mac 5/5 authoritative.
- **Polish nit (queue with next UI pass):** aim reticle stays visible while hero is disarmed in deep water (025 interaction). Suggest hide/dim when `heroWeaponsDisarmed()`.
- w25 self-hold (80s test) exceeds the 43s VM wall by design — Mac-owed on this image, same class as blast-TTK (s37 precedent).
