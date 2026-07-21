# Task lane-locked-win: THE LOCKED-WIN LAW — secure at 10, the win is banked (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: assets/contracts/epoch-1-frontier/contracts.json (the-claim secureWave: 20 — becomes 10; NOTE other maps' secureWaves are TUNED CONTENT, untouched) · the secure/win resolution + run-result recording path (where victory writes: medal, gold banked, RunSummary) · the run HUD · e2e/e1-baron.spec.ts + the-claim suites (adjacents).

Pre-flight (LANE-SAFETY): standard safe-dupe; npm i; tsc+build green.

## Why (OWNER RULING 2026-07-21, verbatim: "I would just make the win condition 10 waves so after 6 minutes there is a feeling of accomplishment - everyone can keep playing after that. It has to be clear that the win is already locked in if they continue." — sourced from the game's FIRST external tester)
## Scope
1. THE MECHANIC (global semantics, one map's number): reaching secureWave = **THE WIN, LOCKED** — the victory result (medal, banked outcome, telemetry row) is WRITTEN AT THE SECURE MOMENT, not at run end. Continuing is free play: rewards keep accruing; a post-secure overrun ENDS THE RUN but the recorded win STANDS (the summary says both, in-world: the claim held; the rush took the rest).
2. THE CLARITY (the owner's second sentence is law): at secure — a celebration beat + the leave-or-stay choice framed as the rush; while continuing, a persistent HUD chip states the win is banked ("CLAIM SECURED ✓") until the run ends. No player may ever wonder whether dying now loses the win.
3. THE NUMBER: the-claim secureWave 20 → **10**; its card GOALS/RULES copy updated to match (in-world voice). All other contracts' secureWaves untouched.
4. Telemetry honesty: the result row records secureWave reached + deepest wave continued (the Assay Office learns what first-timers actually do).
5. Spec e2e/locked-win.spec.ts (both projects): secure at 10 → win state locked + chip visible · die at wave 12 → summary shows the WIN stands · leave at secure → full victory flow · the-claim card copy matches the datum · night-shift/baron secureWaves unchanged (probe) · zero console.
## Firewall: secure/win resolution + HUD chip + the-claim contract datum + card copy + your spec. NO wave/difficulty tuning, NO other maps' win conditions, Economy stays sole gold writer.
END: READY-FOR-GATES + a screenshot of the secured-chip mid-rush + the summary-after-death-post-secure.
