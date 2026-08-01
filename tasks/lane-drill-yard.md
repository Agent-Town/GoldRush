CODEX: model=gpt-5.6-sol effort=high
# lane-drill-yard — PC-01: the gym at the edge of town
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/practice-claim/README.md (RATIFIED as THE DRILL YARD, owner 2026-08-01). A standing tavern-board card where nothing is at stake: the county lends practice gold, all E1 buildables available, straw targets, a drill bell that rings one small wave on demand, nothing persists.
READ-FIRST: the spec (all five laws + PC-01 slice) · the tavern board card rendering (special always-available card pattern — the welcome-gating for its appearance) · BuildSystem availability gating (temporarily-unlock-all mechanism, LOCAL to this contract only) · Economy (the faucet must go through the sole gold writer — a diegetic grant action, never a parallel writer) · WaveSystem (drill bell = one on-demand small wave; reuse the existing wave machinery with a manual trigger) · canon: straw men / rolling log dummies only (no fevered folk practiced upon).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. Contract entry `e1-drill-yard` (small mask reuse, no waves by default, spawnEdges declared for the drill bell, no scores submitted, no meta progression, no run history row, no standings submit — assert each OFF).
2. Board card: always present once the welcome has run; house copy ("The Drill Yard — the county lends the gold; the straw men lend their patience.").
3. THE FAUCET: a top-up lever at the assay tent granting practice gold THROUGH Economy with a practice flag; all E1 buildables available locally regardless of research.
4. STRAW TARGETS: 4-6 static dummies (straw man + rolling log) that take damage, fall, respawn after a beat; DRILL BELL: rings one small wave (6-10 basic jumpers) on demand, ends cleanly.
5. Exit anytime; full state reset on re-entry (nothing persists — including tapes: drill-yard runs are NOT recorded to the ring buffer).
6. e2e: card present post-welcome · faucet grants · build-all works without research · dummies damageable+respawn · bell wave spawns and ends · nothing persists across re-entry · no standings/tape/meta writes (assert absence) · zero console, desktop+390px screenshots.
TOUCH-ONLY: contract data entry + drill-yard module (new) + board card hook + BuildSystem/Economy/WaveSystem minimal hooks behind the contract flag + one e2e spec. NO: Balance rebalancing, meta systems, other contracts, cosmetics.
SELF-CHECK: both projects green · adjacent board/economy suites unmodified-green · tsc + build · release build: the Drill Yard SHIPS in E1 (it is release content — verify it appears in the release build's board).
READY-FOR-GATES + report: screenshots (card, yard with dummies, bell wave) + the practice-flag assertion list.
