# wire-e1-bandit-variants — E1's outlaws stop being recolored jumpers
ROLE: sprite wiring. WORKDIR: lane-d (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=medium
## WHY: inventory rows 48-49 — QA-PASSED `char-bandit-base` + `char-bandit-thief` sheets exist unwired; E1's Outlaw Runner + thief class currently reuse Claim Jumper art. Free visual differentiation with already-approved art.
## READ-FIRST: artifacts/run-scene-animation-refresh/inventory.md · assets/LEDGER rows 48-50 (wrecker MISSING — do not fake it) · src/assets/generated.ts slots + Enemy sprite wiring + the 252a8fcf aspect law · encyclopedia registry sprite refs (outlaw entry).
## SCOPE: extract/process the two sheets if pending (extract-alpha law); wire bandit-base → Outlaw Runner, bandit-thief → the E1 thief class; encyclopedia portraits follow; aspect from real cells; e2e: outlaw + thief render distinct sheet keys from claim_jumper (diagnostics assert), both projects; combat suites unmodified-green.
## TOUCH-ONLY: processed extractions, generated.ts, enemy sprite refs, registry sprite refs, one e2e, artifacts/, LEDGER. NO Balance/sim/AI, no E2 trio (art pending), no QA-blocked sheets.
END: READY-FOR-GATES + before/after trio lineup shot.
