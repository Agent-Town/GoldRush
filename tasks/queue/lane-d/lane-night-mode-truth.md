# Task lane-night-mode-truth: MQ-10 — night mode works, reads, and threatens under 3D (LANE-D after night3d-perf, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
**SEQUENCED: run AFTER lane-night3d-perf merges (same lighting territory; its Balance.render/night knobs are your substrate). If its commit is undrained on the lane, STOP per safe-dupe.**
READ FIRST: AGENTS.md · the night rig + hero/agent light-pool implementation (LightRig, the "beyond your light the night owns the claim" mechanic — how light pools rendered on the PAINTED ground vs what the 3D mesh receives) · night enemy visuals (the lantern-cone composition) · night threat/AI gating (what enemies do beyond light; wall-assault behavior — wreckers/siege on night maps) · e2e night specs (dusk ramp, lantern pools).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm install; tsc+build green.

## Why (OWNER PLAYTEST 2026-07-19, Night Shift under 3D, verbatim)
1. "The prospectors light does not work on the night map" — the hero/agent light pools don't illuminate the sculpted terrain (the pool effect belonged to the painted-ground pipeline; the mesh never joined).
2. "The bandits did not try to destroy the walls and I was able to shoot them from afar" — night pressure collapsed: no wall assault, enemies holdable at range; the map was beatable trivially.
3. (shot 219) "they look like this. walking penises of light. it is funny but maybe not the final version." — the night enemy read (head-blob + light-cone body) composes into unintended anatomy at gameplay zoom.

## Scope
1. LIGHT POOLS ON THE MESH: hero + agent (+ lantern posts) illuminate the 3D ground exactly where the SIM says their radius is (one light-truth source; visual pool = sim radius; works with the perf task's shadow budget — pools may be cheap decals/unlit rings rather than real lights, choose by measurement).
2. NIGHT PRESSURE TRUE: investigate why walls drew no assault (visibility gating? pathing vs sculpt? wrecker spawn table on night maps?) and restore the map's law — "beyond your light, the night owns the claim" must be a THREAT: name the found cause with the line in your report, fix at the mechanism.
3. THE NIGHT ENEMY READ, recomposed: silhouettes at gameplay zoom read as FIGURES CARRYING LIGHT (lantern held beside, cone from the lantern not the body, head distinct) — warm, family-safe, era-true; Balance-tunable cone params. Screenshot pair before/after into reviews/shots-night/.
4. Spec e2e/night-mode-truth.spec.ts (both projects): hero light pool brightens mesh pixels within sim radius (dataset/probe seam) · a night run's walls RECEIVE assault events by wave N (sim assertion) · zero console · dusk/lantern suites unmodified-green.
## Firewall: TOUCH-ONLY night lighting/visual composition + the found assault-gating cause + Balance.night + your spec. CombatSystem sole damage resolver; no era/mechanic redesign; the night MECHANIC's numbers (radii, waves) stay unless the found cause demands a tuned value (cite it).
## Self-check: tsc+build · your spec + night suites green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the assault-gating root cause + the before/after shots.
