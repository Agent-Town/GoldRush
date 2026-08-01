CODEX: model=gpt-5.6-sol effort=high
# lane-herostart-rename — lossCondition stops lying in the data
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner ruling 2026-08-01, option C's second half; census-verified): stakeMarkers[].lossCondition triggers NO loss anywhere — every consumer uses it as hero-start/ring-center/prop anchor (census: Game.ts:7818,3372,5932 · props.ts:101 · Terrain.ts:298 · View.ts:190 · HeadlessContractSim.ts:123). The field renames to what it IS: heroStart.
READ-FIRST: docs/bench/agent-playability-census.md (the consumer list + the E6 picnic find-first note) · every contracts.json carrying stakeMarkers (all epochs) · the type decl in ContractFamilies · all consumers above + any e2e reading the field.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Rename lossCondition→heroStart across type, all contract data files, all consumers, specs. ATOMIC (data ships with the app; no save-compat concern — verify no profile/save key ever stores it). 2. The validator rejects the OLD name with a clear message (press-era safety: no silent revival). 3. Consumers keep find-first semantics unchanged (behavior byte-identical; this is a rename, not a redesign — the picnic three-stake note stays a census ladder item).
TOUCH-ONLY: the field name everywhere it appears + validator + spec expectations. NO: behavior changes, new loss mechanics, copy (sibling task).
SELF-CHECK: repo-wide grep proves zero lossCondition survivors outside BACKLOG/reviews/census history · both projects green · release suite green · tsc + build.
READY-FOR-GATES + report: the file count touched + the zero-survivors grep transcript.
