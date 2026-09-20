CODEX: model=gpt-5.6-sol effort=high
# lane-bench-fields — LB-02: the bench's internal memory (stack self-identification)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §THE BENCH (owner directive 2026-07-29 verbatim therein). The ladder grows into a benchmark: submissions may carry a self-declared stack; stored internally, never rendered publicly.
READ-FIRST: §THE BENCH + §AP-06 · functions/api/standings.ts AS MERGED at ab801307 (LB-01 — extend, do not rewrite) · the client submit hook LB-01 added.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. Submission schema gains OPTIONAL `stack: {model?, harness?, harnessVersion?, config?}` — each field length-capped, stored verbatim in the KV row with declaredBy:'self'. Absent = fine (humans omit).
2. The public GET NEVER returns stack fields (assert in a test — the board is blind by construction). An internal aggregate path is NOT built here (reports come later, owner-gated); storage only.
3. Seed fields: submission gains `seed` + `seedMode: 'live'|'bench'` (pinned-seed runs declare themselves). Validation only; bench seed sets ship later.
4. e2e/unit: schema accepts with/without stack · public GET provably stack-free · caps enforced.
TOUCH-ONLY: functions/api/standings.ts · the client submit hook · its spec. NO: county-standings UI, view/orders, KV keys of other endpoints.
SELF-CHECK: tsc + build · endpoint tests green · zero console.
READY-FOR-GATES + report: final schema + the blindness assertion quoted.
