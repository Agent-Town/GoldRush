# Task 078-ux-hygiene: the swarm's accepted UX/meta smalls, one pass (lane-b; commit prefix "fix:")
CODEX: model=gpt-5.5 effort=medium
FROM `reviews/swarm-triage-2026-07-10.md` §accepted-low/medium + `reviews/swarm-48h-confirmed.json` (READ each finding's evidence entry FIRST — file:line + fix sketches are there).
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY.
## Scope (five findings, each its own commit)
1. **Dead onNewClaim wiring** (StartMenu.ts:41 + main.ts): remove the dead interface member + closure (contracts launch via the town board; three e2e specs already assert the button's absence — keep them green).
2. **Story-beat seen-key migration** (beats.ts:182): board-unlock beats honor the legacy `board-unlock-generic:<contractId>` seen keys (or one-time migrate) so existing profiles don't see duplicate unlock cards.
3. **Encyclopedia forward-compat** (encyclopedia/state.ts:40): discovered-set write-back preserves ids unknown to the running build (never drop future/foreign ids).
4. **Ledger modal a11y** (reader.ts:34 + :182): real focus trap + focus restore on close + aria-modal honesty; Escape closes ONLY the ledger, not the schoolhouse beneath it.
5. **Board focus order** (TownScene.ts:840): board open focuses the LAUNCH button (or the page container), not Back.
## Gates
tsc/build · en-01/en-02 + town-t3-board + story-loop + 044-start-screen green · a new focused spec asserting: no dup unlock card for a legacy-key profile, Escape layering, focus-on-open, unknown-id survival · zero console.
Firewall: exactly the files named + the new spec. NO sim, NO MP (LockstepClient.ts:177 is EXCLUDED — Sol owns that seam tonight), NO Balance.
End: READY-FOR-GATES + per-finding commit list.
