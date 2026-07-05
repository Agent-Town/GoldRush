# Lane D / M6-F1: multi-actor foundation audit + safe refactor (worktree lane-d, prefix "m6:")
The road to recruited agents (M6) AND family co-op (ladder rung 3) runs through one scary refactor done safely: hero-singleton -> actors array.
1. AUDIT: every `hero` singleton touchpoint (Game/systems/camera/input/HUD/targeting) — list with risk notes.
2. MECHANICAL refactor: internal `actors[0]` plumbing behind Balance.actors.enabled=false knob-guard where behavior could shift; ZERO gameplay change — full suite must pass UNMODIFIED (that is the acceptance: 100% green, no test edits).
3. REPORT (for the M6 spec + co-op ladder): what a 2nd actor needs (camera framing options, input source abstraction, HUD duplication, targeting fairness) with effort estimates.
e2e: full regression green untouched + a knob-off equivalence probe (seeded run hash identical pre/post refactor — the determinism harness from perf-04 finally earns its keep). READY-FOR-GATES + audit report.

## SALVAGE NOTE (s9aq): a previous run of this task completed on BROKEN git; its output survives at worktrees/<your-slot>-salvage/ (stale main base). You MAY read it as reference to move faster — NEVER blind-copy files from it (stale base contamination). Implement fresh against current main.
