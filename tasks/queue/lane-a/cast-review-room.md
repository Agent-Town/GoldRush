# cast-review-room — every animation on one stage (lane-a #2; commit prefix "feat:")
ROLE: debug tooling. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — owner: "I would like to double check the animations for all the units/players and so on to make sure they are correct - where do I find them?" There is no single living review surface; this builds it.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules; lanes were reset this morning (attended reset authorization stands). If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>". Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: animation QA currently means hunting raw sheets, contact sheets, and live runs. The owner audits by eye — give him one stage: every registered character animation playing live, at once.

## READ-FIRST: src/assets/SpriteAnimator.ts (the clip registry — sheets/clips/directions the runtime already knows) · src/main.ts debug-harness pattern (`?debug&simitem` StatSimHarness / `?debug&playbook` PlaybookLab — the install shape to mirror) · assets/layer-contracts/characters.v2.json (the full character×clip inventory incl. fullBody townsfolk) · src/town/townsfolk.ts fullBody defs (townsfolk walk8 lives here, not SpriteAnimator — the room must cover BOTH families).

## SCOPE:
1. `?debug&castreview` installs src/diagnostics/CastReviewRoom.ts: a full-screen parchment grid — one card per character × clip (SpriteAnimator clips AND townsfolk fullBody sheets), each playing its cycle live at native cell size on a neutral ground line.
2. Controls per card + global: direction cycle (down/left/right/up), pause + frame-step, playback speed (0.25/1/2), and a label (character · clip · sheet filename · frame count) so a bad cell is reportable by name.
3. Lazy: the room loads sheets on scroll-into-view (dozens of textures — never all at boot); zero impact outside the flag (lazy import like the other harnesses; boot-bytes unchanged).
4. e2e `e2e/cast-review-room.spec.ts`: the flag boots the room, card count matches the registry inventory (computed, not hardcoded), one card frame-advances over time, direction switch changes the rendered row, plain boot has zero trace of the module (network probe), zero console/page errors, both projects.

## Firewall
Touch ONLY: src/diagnostics/CastReviewRoom.ts (new), the one lazy-import line in src/main.ts, the new spec, artifacts/cast-review-room/. NO SpriteAnimator/townsfolk logic changes, NO asset edits, NO game scenes.

## Self-check
tsc + build green (boot-bytes unchanged) · new spec green both projects · zero console/page errors · a full-room screenshot for the owner. 
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the inventory count (characters × clips covered).
