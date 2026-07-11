# Task mp-harvest-channels: every rider pans — per-rider harvest channels (lane-d; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=high
OWNER RULING 2026-07-11 (verbatim): "everyone should be able to have all roles for now... it should be close to the normal game for multiplayer." → THE NORMAL-GAME LAW: each rider's mechanics = solo mechanics. FROM F-SOL-MPBAL-001 (reviews/drain log + sol-findings-mp-balance-harness.md): HarvestSystem owns ONE channelNode/progress/nearest-collector — riders cannot pan in parallel.
You are Codex in worktrees/lane-d. Pre-flight per LANE-SAFETY. READ FIRST: the finding (file:line map of the single-channel structure), HarvestSystem fully, the MP actor model (per-slot heroes since MP-03), determinism laws (fixed tick, one gold writer: Economy — channels COMPLETE to Economy credits exactly as today).
## Scope
1. HarvestSystem: channel state keyed PER ACTOR (each rider's nearest-eligible node, own progress, own tick stream) — solo behavior byte-identical (one actor = one channel = today; assert determinism hash unchanged flag-off).
2. Two riders on DIFFERENT nodes pan in parallel; two riders on the SAME node: the node yields to one channel at a time (no double-dipping one seam — first-come holds it, in-world fair).
3. Economy stays the sole gold writer (channels credit through the same path); shared pot unchanged.
4. e2e: solo regression (hash identical) · two-rider parallel-pan on separate nodes → both progress simultaneously, gold rate ~2x singles · same-node contention → one channel active · the mp-balance harness re-measures (its 1-4 rider table updates in the run note — the REAL income curve for the difficulty table).
Firewall: HarvestSystem + its actor keying + e2e + the harness re-measure. NO Balance values, NO Economy changes, NO MP protocol, NO UI.
End: READY-FOR-GATES + the before/after income table.
