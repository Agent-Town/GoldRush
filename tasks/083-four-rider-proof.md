# Task 083-four-rider-proof: four browsers, one claim, identical hashes (lane-b; commit prefix "test:")
CODEX: model=gpt-5.6-sol effort=medium
OWNER QUESTION 2026-07-11 ("tested with two players, how about more?") — the engine is N-player by design (relay maxPlayers=4; per-slot actors since MP-03) but every browser gate runs pairs. This task makes FOUR proven.
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ FIRST: e2e/mp-02-lockstep.spec.ts (openPair + relay env + the both-riders-build case — extend, don't fork) + the MP_ACTION_QUERY params.
## Scope (test-only + any small render fix it exposes)
1. An `openQuad` helper (4 contexts, one room) + ONE new case: four riders join, all four hero actors present in all four windows (names/tints distinct), all move simultaneously, two place buildings, one picks an upgrade → 200+ ticks hash-identical across ALL FOUR + shared credit recorded ×4.
2. A 4-rider desync-recovery case: inject on one client → it resyncs → all four hash-equal again.
3. If four actors expose render/UI issues (name-chip overlap, camera edge cases), fix ONLY render-side smalls in this task; anything sim-side = a finding, not a fix.
4. Timeouts sized honestly (4 headless contexts on one machine — serial-friendly; mark the case @slow if >90s).
Firewall: the mp-02 spec + helpers + render smalls ONLY. NO engine/relay/protocol changes, NO Balance.
End: READY-FOR-GATES + the 4-window screenshot grid + tick/hash evidence.
