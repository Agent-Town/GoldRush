# Task 085-four-rider-party-gate: parties assemble BEFORE the ticks start (lane-b; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM the 083 gate failure (deterministic 0/3): the quad test's riders 3-4 bounce — lockstep-actions SEALS rooms at first tick-flush, and pumping starts at roster>=2, so late-joining party members hit ride_started. The REAL flow assembles the party in town pre-launch; the dev door lacks a lobby. (The 083 test commit was REVERTED from main pending this — re-land it here.)
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ: multiplayerConfigFromSearch (the dev door), LockstepClient.pump's roster>=2 start, the relay seal (functions/api/_multiplayer.ts — DO NOT change it; the seal law stands), the reverted test (git show ad93b35e).
## Scope
1. Dev door gains `mpParty=N` (2-4, default 2): pump does not START the tick stream until roster.length >= N (pre-start only; mid-run departures keep today's behavior). Town Ride Together host launch may later pass the lobby count the same way — note the seam, don't build the UI.
2. RE-LAND the reverted quad test using mpParty=4 (all four join, THEN ticks flow); keep its assertions whole (4 actors everywhere, hash-identical 200+, shared credit x4, the desync-recovery case).
3. Gates: quad case isolated 3/3 + the pair suite untouched-green + solo flag-off byte-identical.
Firewall: LockstepClient config/pump start-gate + the dev door + the re-landed spec. NO relay changes, NO seal-law changes, NO Balance.
End: READY-FOR-GATES + the 4-window grid + isolated counts.
