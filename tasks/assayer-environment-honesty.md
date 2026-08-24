# Task assayer-environment-honesty: the hill-mine divergence + the commit-pin fragility (lane-a, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; **the divergence evidence: artifacts/gauntlet-heat5-20260824/e2-hill-mine/ (winning-tape.json + local-assay.json — the Mac replay reproduces exact hashes) versus the droplet journal's `instrument_retry`: "assay replay failed: the run ended before tick 12561 of the order stream" — SAME tape, SAME commit tree, different termination**; scripts/assay-replay-agent.mjs + src/sim/HeadlessContractSim.ts (the replay path both environments run); scripts/assay-worker.mjs (the c6 ASSAY_BUILD_ID prefix comparison — the single-pin the ops runbook now re-choreographs on EVERY deploy: three times today).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template + F-1407-1 churn exception; npm install; build green.

## Why (two coupled honesty gaps, both measured today)
① A tape that verifies byte-exact on the Mac fails on the droplet (run ends early ~tick 12561 of an E2 pressure-heavy stream) — cross-environment nondeterminism in the ONE engine, which is the assay's whole foundation. E1 tapes verify fine everywhere; the divergence is E2-content-correlated. ② The worker's build identity is a single commit-prefix pin that must be hand-re-choreographed on every deploy; a doc-only deploy (today's skill.md fix) changes the commit without touching the engine, forcing pin churn and skew-rejecting freshly-recorded honest tapes.

## Scope
1. **Diagnose the divergence to a mechanism, not a suspicion**: replay the hill-mine tape under controlled variation — node version (the droplet runs 26.4.0 via the service; the Mac's paths run 23/26), platform (darwin vs linux), and the vite/ssr transform — instrument the first divergent tick (state snapshot hash per N ticks; bisect). The deliverable is the NAMED mechanism (e.g. a Math function differing across platforms/versions, an iteration-order dependence, a float accumulation) with a minimal reproducer.
2. **Fix it in the sim if it is a sim defect** (a determinism leak violates the county's core law — cite the fixed-timestep/event-log laws); if it is environmental (node built-in behavior differing), pin the environment law instead: the runbook + worker declare the CANONICAL replay environment (node version exact), and the worker refuses to start on a non-canonical node with a clear message.
3. **Engine identity replaces commit identity**: derive an `engineHash` — a content hash over the sim-relevant sources (define the set honestly: src/sim/**, the contracts data, Balance; read what the replay actually loads) — stamped into tapes alongside buildId (additive, c6's pattern) and compared by the worker in preference to the commit pin when present. A doc-only deploy then changes nothing; an engine-touching deploy changes the hash truthfully. ASSAY_BUILD_ID stays as the legacy fallback.
4. Tests: the engineHash stability across a doc-only commit (manufacture one in a scratch worktree) + instability across a Balance edit; the worker's preference order; the canonical-environment refusal path.
5. The hill-mine row: after the cure, the stranded tape re-verifies (or the mechanism report explains exactly why it never can, and the row's unassayable state stands documented).

## Firewall
Touch ONLY: scripts/assay-worker.mjs, scripts/assay-replay-agent.mjs (instrumentation only unless the defect lives there), src/sim/** ONLY if the diagnosis proves a sim determinism defect (then the fix + a regression pin, floors re-checked), scripts/gr-sim.mjs (engineHash stamp), functions/api/standings.ts (accept the additive field), docs/ops/agenttown-server.md (the environment law), tests, BACKLOG row. NO balance changes, no ranking changes.

## Self-check (evidence, not vibes)
tsc + build green; floors `--check` byte-clean unless a proven sim defect moved them (then the review carries the attribution); the divergence reproducer + mechanism named; engineHash tests green; worker suites green. End: READY-FOR-GATES + report: the mechanism, the fix class chosen, the engineHash source-set, the hill-mine tape's final disposition.

## No-op / honesty guard
Do not paper over the divergence with a wider tolerance — hash equality IS the product. If the mechanism resists diagnosis within a serious effort, the instrumented bisection evidence is the deliverable and the row stays honestly unassayable.
