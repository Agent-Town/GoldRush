# Task M6-r3a: actors-foundation attempt-3a — audit-only re-run of the parked partial (LANE-D, branch lane/perf, commit prefix "m6:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; tasks/lane-d-m6-actors-foundation.md (the master task — context + goals); docs/HANDOVER-2026-07-06.md §5.1; reviews/ for the r2 review of attempt-2 if present.

## ⚠️ Pre-flight — DIFFERENT FROM OTHER LANES, READ TWICE
The worktree at worktrees/lane-d contains the UNCOMMITTED attempt-2/3 partial (modified: src/game/Balance.ts, src/game/Game.ts, src/systems/CombatSystem.ts). **DO NOT `git reset --hard`, DO NOT `git clean` — that destroys the partial.** Instead, FIRST salvage it:
1. `git checkout -b lane/m6-partial-salvage && git add -A && git commit -m "m6: salvage parked attempt-2/3 partial (pre-r3a audit)"` — the partial is now safe on its own branch.
2. Then `git checkout lane/perf && git reset --hard main` for a clean baseline, and `npm install --no-audit --no-fund`; `npm run build` green.

## Why (owner-sanctioned 2026-07-06, orchestrator recommendation 3a executed)
Attempt-2 was REJECTED by review r2 — but that conviction was RETRACTED: the failing tripwire was main's own bug (F-028-1), since fixed on main. The parked partial may be sounder than r2 concluded. Decision 3a = audit-only re-run: judge the partial against CURRENT main before anyone writes new code.

## Scope — AUDIT, not implementation
1. Diff the salvaged partial vs current main (`git diff main lane/m6-partial-salvage -- src/`) and read it fully.
2. Re-run the original task's verification battery against (a) clean main baseline and (b) main + partial applied (cherry-pick or re-apply onto a scratch branch): tsc/build, the m6/actors tripwires from the master task, task-025 + m1-01 + m2-01 + determinism checks the master task names.
3. Verdict per file/change: SOUND (keeps working vs fixed main) / UNSOUND (real defect — name it) / STALE (superseded by main's evolution, e.g. w1 terrain or 036).
4. Deliverable: `reviews/m6-r3a-audit.md` — verdict table, exact failing evidence for anything unsound, and a MINIMAL integration plan (which hunks land as-is, which need rework, estimated as attempt-4 scope). NO new feature code in this task; small mechanical rebase fixes (imports/renames) allowed only to make the battery runnable, each labeled.

## Firewall
Working branches only (lane/m6-partial-salvage + a scratch apply branch). NO commits to lane/perf beyond the salvage/scratch mechanics; NO main integration; NO edits to sim code beyond labeled mechanical rebase fixes on the scratch branch.

Self-check: both battery runs recorded with numbers; audit review file written; salvage branch pushed nowhere but exists locally with the partial intact. End: READY-FOR-GATES + the verdict table inline + recommendation (integrate-as-is / attempt-4-scope / abandon-with-reasons).
