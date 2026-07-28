CODEX: model=gpt-5.6-sol effort=high
# lane-m3-05b-run-ledger — the Run Ledger page: write and read gr.history.v1 at last
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner "yes", 2026-07-28, on F-1131-1): ProfileStorage.ts:24 registers RUN_HISTORY_KEY 'gr.history.v1' — carried across profiles, wiped on reset — and NOTHING has ever written or read it. The Run Ledger page its master promised never landed.
READ-FIRST: tasks/BACKLOG.md §F-1131-1 (the gap + the re-scope law) · tasks/lane-a-m3-05-run-history.md (the original design — governs page placement/shape EXCEPT where the re-scope below overrides) · src/game/RunManager.ts summarizeRun + the claim-office surface (:365 area) · src/game/ProfileStorage.ts:24/:37 · SAVE-COMPAT LAW (docs/HANDOVER-2026-07-20.md §3).
RE-SCOPE (overrides the 2026-era master): summarizeRun now carries the m4-08 per-actor split (EconomyActor gold-panned split) — the ledger row RENDERS that split (player vs Prospector), it does not recompute it.
PRE-FLIGHT (LANE-SAFETY, invariant not manifest): any dirty tracked blob must be reachable in git, else STOP. `.wrangler/tmp/**` exempt.
SCOPE:
1. On run end, append a bounded entry to gr.history.v1 (cap: newest 50; additive schema, tolerate/ignore unknown fields on read — imports of ledgers WITHOUT the key must remain silently valid: SAVE-COMPAT).
2. The Run Ledger page per the original master's placement (claim-ledger surface), rendering: date, contract, outcome, waves, gold (with per-actor split), duration. Empty state: a warm one-liner, house voice.
3. New e2e spec proving: write on run end · render with split · cap honored · profile-reset wipes · ledger-import without the key stays valid.
TOUCH-ONLY: src/game/RunManager.ts (append + summary surface) · new src UI file for the page · src/game/ProfileStorage.ts ONLY if a read/write helper is genuinely needed (the key is already registered — do NOT touch the registry) · new e2e spec file. NO: Economy, MetaProgress, meta tracks, existing specs.
SELF-CHECK: new spec green desktop AND mobile · adjacent m3-01 + claim-office specs unmodified-green · tsc + build · zero console/page errors · SAVE-COMPAT: import a pre-change exported ledger fixture, boot clean.
READY-FOR-GATES + report: where the player finds the page in a plain boot, screenshot desktop+390px.
