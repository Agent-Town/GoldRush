CODEX: model=gpt-5.6-sol effort=high
# lane-standings-difficulty — LB-03: the ladder learns what preset you played
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner question 2026-07-31 "Are the agents playing on Greenhorn difficulty?" exposed it): standings rows carry no difficultyPreset — a greenhorn win ranks beside a vein-hunter win invisibly. Unfair to humans, useless for the bench.
READ-FIRST: functions/api/standings.ts AS MERGED (extend, never rewrite) + LB-02's stack/seed fields · src/game/Balance.ts:1003 DifficultyPresetId ('greenhorn'|'trail'|'vein-hunter') · the client submit hook (secure path) · the County Standings UI.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Submission + KV row gain required `difficulty: DifficultyPresetId` (validated against the three; missing on old clients = default 'trail' with defaulted:true flag). 2. Board UI: a small preset chip per row + a ?difficulty= filter param (default: all, chip always visible). Ranking formula unchanged — segregation is a future owner call, visibility is not. 3. Bench note: seedMode:'bench' rows REQUIRE explicit difficulty (no defaulting). 4. Tests: schema accepts/validates · chip renders · filter works · public GET still stack-blind (LB-02 assertion re-run).
TOUCH-ONLY: functions/api/standings.ts · client submit hook · standings UI + css · specs/tests thereof. NO: score storage shape, Balance, LB-02 fields' semantics.
SELF-CHECK: both projects green · tsc + build · zero console · board screenshot with mixed-difficulty rows.
READY-FOR-GATES + report: schema delta + screenshot.
