# Task mp-04-ride-together: multiplayer without URL surgery — invite from town, join with a short code (lane-d; commit prefix "feat:")
CODEX: model=gpt-5.5 effort=medium
FROM `specs/multiplayer/README.md` (MP-v1 ratified; MP-01 relay + MP-02 lockstep + MP-03 second-hero SHIPPED — this is the family-facing door; MP-05 = the family playtest gate after this).
You are Codex in worktrees/lane-d. Pre-flight per LANE-SAFETY. **067-mp-resync-two-actors may still be queued/running ahead of you — it owns the snapshot-restore seam; do NOT touch that seam here.** READ FIRST: `src/mp/LockstepClient.ts` (`multiplayerConfigFromSearch` — the dev door stays), the town scene surfaces (town-T6 moved surfaces home), `functions/api/multiplayer/create.ts` + `docs/api-multiplayer.md`, `e2e/mp-02-lockstep.spec.ts` env helpers.

## Scope
1. **RIDE TOGETHER card in town**: a small surface (tavern-adjacent, the board pattern) with two actions — "Open the Claim" (creates a room via the relay, shows a SHORT join word) and "Join a Ride" (enter the word). Short code: derive a 2-word frontier phrase (e.g. "COPPER-MULE") mapped to the relay's room code — the mapping lives client-side via the relay create response + a hash suffix if needed; NO relay protocol changes.
2. **Join flow**: entering a valid word connects (reuse the LockstepClient path the dev door uses); invalid/expired = a friendly in-world line ("that claim's gone quiet"), NEVER a dead freeze — surface connect failures loudly (the silent-freeze lesson, 2026-07-09).
3. **Session UX**: while connected, a rider chip row (names/towns from the roster) in town + in-run; disconnect returns to solo cleanly at the next wave boundary with a plain-words card.
4. **The dev door (`?mp=dev&...`) stays untouched** — e2e infrastructure depends on it.
5. **e2e**: extend the mp env — create via the card UI (page A), join via word (page B), both heroes present (mp-03 assertions reused), invalid-word shows the friendly line; flag-off/solo boot unchanged (m1-01).

## Firewall
Touch ONLY: the town Ride Together surface + join UI, client code-word mapping, rider chips, its e2e. **NO relay/protocol/worker changes, NO lockstep/tick/snapshot changes (067 owns that seam), NO Balance, NO save schema.**
End: **READY-FOR-GATES** + screenshots (card, join, two named riders) desktop + 390px.
