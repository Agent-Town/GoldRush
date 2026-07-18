# Task mp-r2-reconnect-reland: co-op ladder (R2) — LADDER, queue lane-c when its prereq merges (commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
**SEQUENCED: do not run before MP-03 second-hero is MERGED on main (pre-flight verifies: real per-player units present (the mp-03 spec green on main)). If absent, STOP and report.**
READ FIRST: AGENTS.md · the salvage ref `origin/sol/mp-reconnect` (READ-ONLY logic reference via `git show origin/sol/mp-reconnect:<path>` — built 2026-07-11 (4 READY-FOR-GATES waves); main has moved: NEVER cherry-pick or merge it wholesale, it will revert shipped work — Mistake #15) · src/mp/LockstepClient.ts + RideTogether.ts (the SHIPPED chain: MP-02 lockstep + snapshot v2 + lockstep actions + MP-04) · specs/multiplayer/README.md · the relevant mp e2e specs (extend, never fork).

Pre-flight (LANE-SAFETY): standard safe-dupe rules + the sequencing check above; npm install; tsc+build green.

## Why (owner 2026-07-18, verbatim: "we don't have to park... the co-op. We are fully in the process of finishing things up. So lets also work on that.")
2,398 salvaged insertions of reconnect recovery: held-slot replay boundary, exact-tick snapshot recovery, authority self-recovery. Its park reason (snapshot prerequisite) SHIPPED (747832a0 snapshot v2); its second prerequisite (real riders) ships as MP-03.

## Scope — RE-LAND LAW: read the salvage diff, re-apply each still-valid idea against current main; SKIP what main already does (name file:line evidence per item)
1. Re-land the reconnect ladder in the salvage's own order: exact-tick snapshot recovery -> authority self-recovery -> held-slot replay boundary seal.
2. Spec e2e/mp-reconnect.spec.ts: a disconnected rider rejoins mid-run at the exact tick, holds its slot, and the worlds stay identical (hash-compare lockstep state both sides).
## Firewall: TOUCH-ONLY src/mp/**, the seams the salvage touched (mapped to current main), Balance mp block if the salvage tuned one, your spec. NO reverting shipped features, NO sim-timestep changes, CombatSystem stays sole damage resolver.
## Self-check: tsc+build · your spec + mp-02-lockstep + the snapshot-chain suites green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item LANDED/ALREADY-ON-MAIN/DROPPED-STALE table.
