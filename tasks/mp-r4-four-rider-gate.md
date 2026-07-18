# Task mp-r4-four-rider-gate: co-op ladder (R4) — LADDER, queue lane-c when its prereq merges (commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
**SEQUENCED: do not run before MP-R2 + MP-R3 is MERGED on main (pre-flight verifies: reconnect + per-rider arsenals green). If absent, STOP and report.**
READ FIRST: AGENTS.md · the salvage ref `origin/save/085-four-rider` (READ-ONLY logic reference via `git show origin/save/085-four-rider:<path>` — built 2026-07-11 (5-line party gate + evidence grid); main has moved: NEVER cherry-pick or merge it wholesale, it will revert shipped work — Mistake #15) · src/mp/LockstepClient.ts + RideTogether.ts (the SHIPPED chain: MP-02 lockstep + snapshot v2 + lockstep actions + MP-04) · specs/multiplayer/README.md · the relevant mp e2e specs (extend, never fork).

Pre-flight (LANE-SAFETY): standard safe-dupe rules + the sequencing check above; npm install; tsc+build green.

## Why (owner 2026-07-18, verbatim: "we don't have to park... the co-op. We are fully in the process of finishing things up. So lets also work on that.")
The tiny finale: the party gate opens 2 -> 4 riders (salvage is a 5-line LockstepClient change + the four-riders-grid evidence shot). Last because reconnect/arsenal correctness must hold at party size first.

## Scope — RE-LAND LAW: read the salvage diff, re-apply each still-valid idea against current main; SKIP what main already does (name file:line evidence per item)
1. Open the party cap to 4 per the salvage's gate change (current LockstepClient shape).
2. Extend mp-02-lockstep.spec.ts's party case to four riders (grid screenshot per the salvage's evidence pattern).
3. Balance: any per-rider-count scaling the shipped code already parameterizes (verify, don't invent).
## Firewall: TOUCH-ONLY src/mp/**, the seams the salvage touched (mapped to current main), Balance mp block if the salvage tuned one, your spec. NO reverting shipped features, NO sim-timestep changes, CombatSystem stays sole damage resolver.
## Self-check: tsc+build · your spec + mp-02-lockstep + the snapshot-chain suites green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item LANDED/ALREADY-ON-MAIN/DROPPED-STALE table.
