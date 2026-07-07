# Task gt-03: the bandits learn the hills — enemy movement respects elevation (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; specs/gameplay-terrain/README.md (GT-03 = this rung); the GT-02 hero constraint/resolver (+ gt-02b slide resolver — REUSE the same functions for enemies; one movement law, two consumers); enemy movement/routing (WaveSystem/Enemy velocity integration); task-025 (the river precedent: terrain the enemy respects). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-02b (this lane's queue — its resolver is this task's dependency).

## Owner finding (2026-07-07 ~19:40, gt-test-basin): "the bandits are not following the hills, they just walk through them"
CORRECT diagnosis, expected state: GT-02 gave elevation to the HERO only; this rung gives it to everyone. NOTE the two-layer law for the report: on the DEFAULT claim the "hills" are render-only drama (sim planar BY LAW — bandits walking over visual bumps there is correct forever); real elevation gameplay exists ONLY on GT tiles (basin now, the Re-survey and epoch tiles later).

## Scope
1. **Enemies consume the same heightfield constraints as the hero**: impassable cliff faces block (slide-along via the gt-02b resolver), steep slopes apply the same speed factor, on GT tiles only (flat tiles = zero change, planar fast-path preserved).
2. **Routing awareness v1 (local, cheap)**: blocked-by-cliff enemies steer along the cliff toward the goal side (the resolver's tangent + goal bias) — NO full pathfinding graph yet (that's GT-04+ if tiles demand it); the basin's simple shapes must read correctly: bandits pour AROUND the ridge and THROUGH the bowl, never through the cliff.
3. **Determinism**: identical seeded runs hash-identical on the basin (extend the gt determinism probe to include enemy positions).
4. **Perf**: height/constraint sampling per-enemy per-tick budgeted — reuse GT-02's sampling cache; stress (200 enemies on basin) stays in frame envelope; flat-tile fast path proven zero-cost (bench delta <2%).
5. Diagnostics: per-enemy grounded/slope state sample exposed.

## Firewall
Touch ONLY: enemy movement integration (GT-tile branch), the shared resolver consumption, gt e2e + determinism probe, artifacts. NO changes to: flat-claim enemy behavior (byte-identical — m1-01/task-025/046 regression-asserted), CombatSystem, spawn/wave logic, hero movement.

## Self-check
tsc/build; new `e2e/gt-03-enemy-elevation.spec.ts`: cliff blocks (no enemy position inside cliff band, dense sampling) · slope slowdown measured · around-the-ridge routing (spawn behind ridge → arrives via the pass, not through it) · seeded determinism incl. enemies · 200-enemy basin perf in envelope · flat-tile fast-path bench; task-025 + m1-01 + m2-01 + task-046 unmodified green both projects; zero console errors; screenshots (bandits filing around the ridge) into artifacts/gt-03/. Commit on lane/perf. End: READY-FOR-GATES + results.
