# M4 agent UX — the Prospector Panel (spec-lite, unblocks M4-07)

Status: designed 2026-07-07 from the owner's direct questions mid-playtest ("how do I interact with it? How do I change the permissions? What are the buttons?") — which ARE the owner input the s100 PIPELINE-DRY flag was waiting for.
Verified current state (2026-07-07): HUD chip is display-only ("the Prospector · L0 · suggest-only" + one-line feed, `Hud.ts:74-78`); NO input bindings, NO permission controls anywhere; level derives from meta `tracks.agent` (victory-fed). L0 has no behaviors → the companion reads as dead (F-0707-5b, being fixed in prospector-presence).

## Design law: ceiling vs consent (the Founders Plot pattern, brief §6.2/§6.3)
- **Meta progression sets the CEILING**: victories feed the agent track; each whole level unlocks a ladder rung. Earned, never bought mid-run.
- **The player sets the CONSENT**: within the earned ceiling, every rung has a grant/revoke toggle and every ability a checkbox. Autonomy is always chosen, never imposed — and revocation is instant.

## The panel
Open: **G key** or click/tap the HUD chip. Close: G/Esc/outside-tap. Pauses nothing (it's a ledger page, not a menu — glanceable mid-wave).
Contents, ledger-styled:
1. Portrait (batch-008) + name + current level in plain words.
2. **The ladder**, four rungs, each one line: L0 suggest-only (watches, comments) · L1 collect & carry (XP motes, dropped gold) · L2 tend & repair (walls, buildings) · L3 work the claim (pan, haul to stockpile). Earned rungs show a grant/revoke toggle; unearned show "earned at agent level N" + how the track grows (victories).
3. **Abilities at your level**: checkboxes (auto-collect / auto-repair / auto-pan …) — these are the SAME policy switches BT-04's homestead automation consumes; build once.
4. **Receipts, readable**: the feed becomes stacked lines (newest first, ~8 visible): time · verb · outcome in ledger voice ("02:14 — panned the east sluice: +6 gold"). Replaces the run-on `agentFeed` sentence.
5. Mobile: chip tap opens the same panel full-width bottom-sheet; 44px targets.

## Slices
- **M4-07 (now authorable)**: the panel + toggles/checkboxes wired to PermissionLadder + readable receipts + G binding. GATE: after prospector-presence merges (same chip/HUD surface).
- M4-08 (still a separate owner call): agent-vs-player attribution in run summaries — the panel's receipts make it FEEL answerable; the economy-event plumbing question stands.

## Canon/voice
Panel copy in ledger voice (§5); the Prospector is never commanded like a tool in the UI copy — it is granted trust ("Let the Prospector tend the walls"), matching the agent-as-partner brand thesis (§3.2).
