CODEX: model=gpt-5.6-sol effort=high
# lane-run-tape — TAPE-01: every run leaves a tape
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §AP-09 (owner question 2026-07-31 verbatim therein). One tape format for every species; the lockstep layer already proves input-replay determinism.
READ-FIRST: §AP-09 (the law: format, ring buffer, privacy) · src/mp/LockstepClient.ts (the existing input serialization to REUSE — one format, never a second) · Game.ts input-log machinery · RunSuspend (versioning discipline precedent) · functions/api/standings.ts (where a submitted tape rides).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Record per run: {contract, seed, difficulty, simVersion, input log (lockstep format), eventLogHash, outcome} → local ring buffer (last 10 + kept-flagged), profile-scoped storage key (SAVE-COMPAT additive). 2. A "keep this tape" affordance on the run summary. 3. Submitted scores attach their tape (size-capped; standings endpoint accepts + stores alongside the row — extend, never rewrite). 4. DETERMINISM PROOF (the gate): a recorded tape re-fed through a headless boot reproduces the eventLogHash byte-identically (reuse GR-SIM if convenient). 5. e2e: tape written per run · ring rotation · keep-flag survives · submission carries it · replay-hash gate green.
TOUCH-ONLY: new tape module + RunManager hook + run-summary UI affordance + standings endpoint extension + specs. NO: LockstepClient semantics, sim logic, replay VIEWER (TAPE-02, not yours).
SELF-CHECK: both projects green · tsc + build · zero console · SAVE-COMPAT fixture import green.
READY-FOR-GATES + report: tape schema as shipped + the determinism-proof transcript.
