CODEX: model=gpt-5.6-sol effort=high
# lane-prime-env — the verifiers package: `prime eval run goldrush` becomes real
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §AP-07 + its oracle-grounded addendum (the exact API facts — READ BOTH FULLY). GR-SIM is merged and determinism-proven (reviews/gr-sim.md); the missing link is the Python env package.
READ-FIRST: §AP-07 + grounding addendum (v0 API, async law, packaging law, upload caveat — every line is binding) · reviews/gr-sim.md (the runner's real interface + NDJSON protocol as shipped) · scripts/gr-sim.mjs itself · §THE EXAMINER'S LAWS (probes to include as tests).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE — new tracked dir env/goldrush-verifiers/:
1. verifiers v0 package: `load_environment(contracts=?, difficulty=?, seeds=?) -> vf.Environment` returning a MultiTurnEnv subclass; env_response drives GR-SIM via asyncio.create_subprocess_exec + NDJSON (never sync); node>=20 checked early with a clear error.
2. Dataset: HF rows {prompt: contract briefing message, info: JSON string {contractId, seed, difficulty}} — the pinned bench seed set as eval_dataset (author a first frozen set: 5 seeds x the-claim + e1-dry-gulch, committed as data).
3. Rubric: secured weight 1.0 · waves/gold/timeMs as weight-0 metrics · num_turns free. NO shape rewards (Examiner law 2).
4. TAPE EMISSION: every rollout writes its tape (orders+views+outcome, gr-sim's log) into the rollout state/artifacts — Prime rollouts become Lantern-compatible replays.
5. Packaging per the addendum: hatchling wheel, pyproject includes itself, verifiers>=0.1.8, [tool.verifiers.eval] defaults; TESTS (fresh-venv runnable): env loads · a scripted dummy client wins/loses a stub episode · rubric passes test-the-test (one clearly-correct, one plausible-wrong — Examiner law 3) · public README states the --skip-upload law and node prerequisite.
6. Do NOT run against a real model endpoint (no keys in lanes) — deliver the exact `prime eval run` command for the attended smoke.
TOUCH-ONLY: env/goldrush-verifiers/** (new) · one BACKLOG-adjacent doc line if the gr-sim protocol needed a clarifying note. NO: gr-sim itself, src/, functions/.
SELF-CHECK: package installs in a fresh venv · its tests green (python3.10+) · tsc/build untouched-green (no repo-side changes).
READY-FOR-GATES + report: the tree, test output, and the smoke command.
