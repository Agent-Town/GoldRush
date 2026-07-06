# Task prospector-presence: the owner couldn't find his robot (LANE-B, branch lane/m4, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; src/agent/Embodiment.ts + Game.ts prospector wiring (149/601/751/870); docs/playtests/2026-07-07-robin-playtest-02.md. Pre-flight drain-gated per LANE-SAFETY (lane/m4 0-ahead/clean, else STOP); fresh branch off main; build green.

## Owner finding (2026-07-07, mid-playtest)
"The robot is nowhere to be seen? How can I find it, activate and use it?" — the embodiment + real sprite are MERGED, yet the owner played a full session without ever seeing his companion. Whatever the mechanism, that fails m4-06's core law: presence in normal play. Also note the second half of his question: "activate AND USE it" — presence alone isn't enough; the player needs a first-contact moment that teaches what the Prospector does.

## Scope
1. **Diagnose first**: when is `group.visible` false in normal play? (Autonomy-level gating? Hidden until first receipt? Sprite/contract load failure making it invisible-but-"visible"? Spawn position outside the early-game camera?) Write the answer in the review.
2. **Unmissable presence**: the Prospector idles NEAR THE HERO at run start (offset a few units, terrain-following, never blocking), visible from frame one in a plain boot. If it has no task it hovers/bobs beside you or drifts between you and the claim.
3. **First-contact beat**: on first boot of a run (once per run, skippable), a short ledger-voice float/HUD line introduces it: name ("the Prospector"), what it can do at the current permission level, and where its chip lives. No modal, no tutorial system — one warm beat.
4. **"Use it" legibility**: the permission chip (portrait shipped in batch-008) must be visible in the HUD by default with the current level; hovering/tapping it lists the granted abilities in plain words. If the chip isn't wired to the portrait yet, wire it.
5. Voice lines (m4-04) fire on its actions — verify they're audible/visible in normal play, not debug-gated.

## Firewall
Touch ONLY: Embodiment (spawn/idle anchor + visibility), the first-contact beat (UI/vfx, once-per-run flag in run state — no meta persistence), HUD chip wiring, e2e. NO new autonomy, NO tool-surface changes, NO permission-ladder logic changes.

## Self-check
tsc/build; e2e: plain boot (NO ?debug) → embodiment visible=true within 2s AND position within camera view of hero start; first-contact beat fires once; chip present; m4-05/m4-06/m4-01 + task-027 regression green both projects; zero console errors; screenshots (idle-beside-hero, first-contact beat, chip) into artifacts/prospector-presence/. Commit on lane/m4. End: READY-FOR-GATES + the visibility root cause + results.
