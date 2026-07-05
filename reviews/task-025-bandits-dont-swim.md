# Review — task 025: bandits don't swim (river blocks enemies, fords are the gates) (s46 gate)

**Verdict: GREEN — integrated (single commit shared with 024; 025 was stacked on ungated 024 by the runner, scopes entangled on Balance/Game/WaveSystem/CombatSystem/vite-env).**
Runner log `tasks/runs/20260705-221219-main-025-*.log`, READY-FOR-GATES.

## Scope check (per task file)
Enemy.ts (`routedTarget` ford routing + `resolveRiver` sub-stepped clamp, both behind `Balance.pathing.riverBlocksEnemies`), WaveSystem (`keepSpawnOutOfDeepWater` on scheduled + direct spawns), CombatSystem (mote spawn skips `river` zone → pre-existing `bankXp('overflow')` — the 021 overflow mechanism reused as specified), Game.ts (`heroWeaponsDisarmed()` gates BOTH shooter handles' `enabled()` — fire suppression at the handle layer, CombatSystem stays sole damage resolver; "Wet powder." announce w/ 1.4s cooldown), Balance pathing knobs. **No terrain-gen changes, no new buildables, hero wade code untouched (zero diff in Hero.ts) — firewall respected. Asymmetry (hero wades, enemies don't) implemented as designed.**
Ford routing hard-codes x=0 → verified correct: ford spans x∈[−3,3], 0 is its center. Deep-water disarm hits zone `river` only; shallows/ford unaffected (spec-exact).

## Evidence
Mac (runner): tsc, build, task-025 spec full pass + targeted M2 canaries; codex review clean; root `test-results/.last-run.json` = passed (15:33Z, preserved to /tmp snapshot this fire).
In-VM re-verify: ford-only path probe 1/1 (in-page rAF tracker: deepSamples 0, fordSamples >0); three-waves zero-in-river 1/1; **far-bank sluice untouched 1/1 (the Robin scenario, now law)**; XP auto-bank 1/1; m2-04 flee 1/1; m2-01 blocking 2/2; self-hold w15 1/1.
Raw disarm probe (`reviews/shots-task-025/s46-disarm-probe.json`): deep water → disarmed=true, 0 bolts, "Wet powder." announced; exit → bank, disarmed=false; 390px disarm green; zero console/page errors. (probe's maxBolts=0 on exit is a probe artifact — blast was left active and `boltsAlive` counts rig bolts; firing-restore is covered by the spec's Mac pass.)
Shots: `desktop-wetpowder-deep.png` (hint banner live, hero mid-river, **bandit visibly held at the south bank**), `mobile-390-wetpowder.png`.

## Findings
- **F-025-1 (test-side corrective, batch into next main-slot task):** the wade-speed assert (spec line ~137) is protocol-sampled during a ~0.4 wall-s crossing window at ts8 — in-VM it read post-exit land speed (exactly 6.0) and failed; Mac RTTs fit the window and pass. Fix: in-page rAF min-speed sampler armed before river entry (s27 law), or clamp-hold the hero in-river during the measure. Game code is NOT implicated (Hero.ts zero diff; speedMul probe read 0.55 correctly).
- Fallback water-pressure option (air bar vs chill drain) stays RECORDED-NOT-ADOPTED pending Robin's water-feel test, per task file.
- Design note for the m3 merge chain: m3-06 difficulty picker must call the 024 preset API (`setDifficultyPreset`/storage key `gr.difficultyPreset.v1`) — watch for a divergent key in lane-a.
