# Task prospector-presence: the owner couldn't find his robot (LANE-B, branch lane/m4, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; src/agent/Embodiment.ts + Game.ts prospector wiring (149/601/751/870); docs/playtests/2026-07-07-robin-playtest-02.md. ## Pre-flight (LANE-SAFETY, runner-auto-commit aware — the 05:44 no-op run used a stricter wrong rule; this replaces it)
The runner auto-commits lane output, so the lane branch being ahead is NORMAL. For each ahead commit: if its content is already merged to main (verify: `git log --oneline main | head -30` for the drain commit, or diff the tip vs main), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP only if an ahead commit's content is NOT on main, or the worktree holds uncommitted edits you did not make. (Known: `525e663` m4-05 auto-commit = safe dupe, drained at `0106baa`.) Then `npm install --no-audit --no-fund`; `npm run build` green.

## Owner finding (2026-07-07, mid-playtest)
"The robot is nowhere to be seen? How can I find it, activate and use it?" — the embodiment + real sprite are MERGED, yet the owner played a full session without ever seeing his companion. Whatever the mechanism, that fails m4-06's core law: presence in normal play. Also note the second half of his question: "activate AND USE it" — presence alone isn't enough; the player needs a first-contact moment that teaches what the Prospector does.

## Scope
1. **Diagnose first**: when is `group.visible` false in normal play? (Autonomy-level gating? Hidden until first receipt? Sprite/contract load failure making it invisible-but-"visible"? Spawn position outside the early-game camera?) Write the answer in the review.
2. **Unmissable presence**: the Prospector idles NEAR THE HERO at run start (offset a few units, terrain-following, never blocking), visible from frame one in a plain boot. If it has no task it hovers/bobs beside you or drifts between you and the claim.
3. **First-contact beat**: on first boot of a run (once per run, skippable), a short ledger-voice float/HUD line introduces it: name ("the Prospector"), what it can do at the current permission level, and where its chip lives. No modal, no tutorial system — one warm beat.
4. **"Use it" legibility**: the permission chip (portrait shipped in batch-008) must be visible in the HUD by default with the current level; hovering/tapping it lists the granted abilities in plain words. If the chip isn't wired to the portrait yet, wire it.
5. Voice lines (m4-04) fire on its actions — verify they're audible/visible in normal play, not debug-gated.
6. **F-0707-5a HALF-SUNK (owner screenshot 2026-07-07 ~05:43)**: the companion renders half inside the ground. `Balance.agent.groundY` (~0.05) ignores the hover sprite's center origin at `spriteScale 2.24` — compute the proper base offset (≈ half render height + hover clearance) so it FLOATS above terrain; e2e asserts embodiment y ≥ terrain visualY + minimum clearance at 3 probe points.
7. **F-0707-5b INERT (owner: "it does not do anything. No actions, nothing")**: at permission level 0 the companion has zero visible behaviors. Give it LIFE at every level: follow-the-hero drift when idle, occasional ledger-voice observations, work-bob near sluices, and — where the current permission level allows (026's collect-xp machinery) — visibly collecting nearby XP motes. The chip must show the CURRENT level AND one line on how it grows. A companion that exists but never acts reads as broken; idle-level charm is the fix.

## Firewall
Touch ONLY: Embodiment (spawn/idle anchor + visibility), the first-contact beat (UI/vfx, once-per-run flag in run state — no meta persistence), HUD chip wiring, e2e. NO new autonomy, NO tool-surface changes, NO permission-ladder logic changes.

## Self-check
tsc/build; e2e: plain boot (NO ?debug) → embodiment visible=true within 2s AND position within camera view of hero start; first-contact beat fires once; chip present; m4-05/m4-06/m4-01 + task-027 regression green both projects; zero console errors; screenshots (idle-beside-hero, first-contact beat, chip) into artifacts/prospector-presence/. Commit on lane/m4. End: READY-FOR-GATES + the visibility root cause + results.
