# Review: m6-actors-foundation — attempt 2 (slot lane-d, branch lane/perf) — s48, 2026-07-05T16:20Z

**Verdict: DEAD MID-TASK. DO NOT MERGE. DO NOT RE-QUEUE — retry law (2 deaths, Robin's call now).**

## Timeline (L = UTC+7 sandbox clock)
- 22:53L death #1: credit wall before real output (`tasks/failed/rc1-20260705-225313-lane-d-m6-actors-foundation.md`).
- 23:03:28L re-pick (retry #1, the one allowed re-queue).
- Done-move is PREMATURE/false-shaped: `tasks/done/20260705-230329-lane-d-...md` is byte-identical to the task file (mtime preserved by mv; nothing appended). Runner closed the slot while work continued detached.
- Detached work: src edits → dist build 23:06:48L → e2e run → last write 23:07:53L → silence. Mac-side process gone. Death #2.

## Work found in worktrees/lane-d (uncommitted; base b231a85 — CURRENT main content)
- `src/game/Balance.ts` +3 lines: `actors:` knob added (per spec).
- `src/game/Game.ts` ~112 changed lines: hero→actors[0] mechanical refactor, mid-flight.
- `src/systems/CombatSystem.ts` ~14 changed lines.
- `lane/perf`: 0 commits ahead of main. No commit, no READY-FOR-GATES, and NO audit report — the step-1/step-3 deliverables are entirely missing.

## Gate result: RED
- e2e `m1-01-claim-jumpers-death.spec.ts` → "stress=120 stays within pool and draw-call budget": expected 96, received 95. `test-results/.last-run.json`: status failed.
- This ran on Robin's Mac — env-family excuses do NOT apply. An off-by-one pool/draw-call delta with the knob OFF violates the acceptance core (full suite green unmodified; seeded-run equivalence). The regression hides somewhere in the 112 Game.ts lines.

## Disposition
- LEAVE the partial in `worktrees/lane-d` as reference. Unlike the `*-salvage` dirs it sits on the current base, so attempt 3 may resume from it — but every line must be re-verified, not blind-kept.
- Slot lane-d is idle. Nothing re-queued (retry law binding).

## Recommendation for attempt 3 (Robin decides)
Split the monolith — it died twice as one scary task:
1. **3a audit+report only** — read-only, cheap, un-killable: every hero-singleton touchpoint with risk notes + the 2nd-actor needs report.
2. **3b mechanical refactor** behind the knob, with the perf-04 determinism harness (seeded-hash equivalence) run FIRST, before the full suite.

---

## ADDENDUM (s49, 2026-07-05) — RED-GATE EVIDENCE RETRACTED, PARTIAL EXONERATION

The decisive finding above — m1-01 stress `expected-96-got-95` ON MAC = "knob-off equivalence broken, no env excuse" — is **retracted**. s49's 028 gate hit the same red on root, A/B'd it on pure HEAD (fails identically, no lane-d diff present), and probed the cause: main's own 024-era damage tuning lets the rig kill one-shot-spawned stress enemies inside the settle window (alive decays 96→95→94; probe logged in reviews/task-028-spark-target-leading.md). The tripwire was broken on main; it convicts nobody. Fixed as F-028-1 (`&nokill` on the stress URL).

What still stands against lane-d attempt 2: died mid-task (real partial: Game.ts mid-refactor), produced NO audit report, and its done-move was premature (done file byte-identical to task). The RETRY-LAW STOP remains, but the "broke knob-off equivalence" conviction is withdrawn. **Robin: your attempt-3 verdict (owes #6) should weigh the split recommendation (3a audit-only, 3b knob refactor behind perf-04 determinism harness) WITHOUT the equivalence-broken premise — the partial may be closer to sound than r2 concluded.**
