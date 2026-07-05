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
