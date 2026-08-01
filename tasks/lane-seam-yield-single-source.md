CODEX: model=gpt-5.6-sol effort=high
# lane-seam-yield-single-source — dry-gulch's yield stops having two truths
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (census E1-E2, owner-directed cleanup 2026-08-02): dry-gulch seam yield lives TWICE — browser path Game.ts:7255 reads Balance.contracts.dryGulch.seamYieldMult keyed on contract id, while headless reads twist.seamYieldMult (HeadlessContractSim.ts:133). Two sources = drift risk between the game and the bench; the census calls it "right by luck, not by construction". RELEASE MAP — priority.
READ-FIRST: docs/bench/agent-playability-census.md §E1-E2 finding 5 · Game.ts:7255 area · Balance.contracts.dryGulch · HeadlessContractSim.ts:133 · the twist type in ContractFamilies.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: the TWIST becomes the only source: Game reads twist.seamYieldMult (any contract declaring it, not id-keyed); Balance.contracts.dryGulch.seamYieldMult removed (grep-proves zero survivors); values identical before/after (1.4) — behavior byte-identical, proven by the dry-gulch e2e suite + a headless determinism run (same eventLogHash as the census control if the sim path is untouched — state which).
TOUCH-ONLY: Game.ts yield read · Balance (removal) · nothing else. NO: yield VALUES, other twists.
SELF-CHECK: dry-gulch suites green both projects · headless dry-gulch run outcome unchanged · tsc + build · zero console.
READY-FOR-GATES + report: the before/after read path + hash comparison.
