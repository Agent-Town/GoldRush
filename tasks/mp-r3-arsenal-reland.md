# Task mp-r3-arsenal-reland: co-op ladder (R3) — LADDER, queue lane-c when its prereq merges (commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
**SEQUENCED: do not run before MP-03 second-hero is MERGED on main (pre-flight verifies: real per-player units present). If absent, STOP and report.**
READ FIRST: AGENTS.md · the salvage ref `origin/sol/mp-arsenal` (READ-ONLY logic reference via `git show origin/sol/mp-arsenal:<path>` — built 2026-07-11 (parked on prereq merges); main has moved: NEVER cherry-pick or merge it wholesale, it will revert shipped work — Mistake #15) · src/mp/LockstepClient.ts + RideTogether.ts (the SHIPPED chain: MP-02 lockstep + snapshot v2 + lockstep actions + MP-04) · specs/multiplayer/README.md · the relevant mp e2e specs (extend, never fork).

Pre-flight (LANE-SAFETY): standard safe-dupe rules + the sequencing check above; npm install; tsc+build green.

## Why (owner 2026-07-18, verbatim: "we don't have to park... the co-op. We are fully in the process of finishing things up. So lets also work on that.")
362 salvaged insertions: PER-RIDER ARSENALS — each rider carries their own loadout/mods instead of sharing one. Prereq (real riders) ships as MP-03; the era arsenals (E5-E9 wave, merging now) multiply what riders can differ IN.

## Scope — RE-LAND LAW: read the salvage diff, re-apply each still-valid idea against current main; SKIP what main already does (name file:line evidence per item)
1. Per-rider loadout state through the lockstep bundle (inputs carry rider identity — the MP-03 promotion is your seam).
2. Owner ruling law (2026-07-09, in the mp-03 master): "both get credited. shared achievements are still achievements."
3. Spec e2e/mp-arsenal.spec.ts: two riders with DIFFERENT weapons fire; each shot resolves under its owner's stats; credit lands per rider; determinism holds (state-hash equal across clients).
## Firewall: TOUCH-ONLY src/mp/**, the seams the salvage touched (mapped to current main), Balance mp block if the salvage tuned one, your spec. NO reverting shipped features, NO sim-timestep changes, CombatSystem stays sole damage resolver.
## Self-check: tsc+build · your spec + mp-02-lockstep + the snapshot-chain suites green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item LANDED/ALREADY-ON-MAIN/DROPPED-STALE table.
