# Task damage-orientation: damage indicators anchor to their OBJECT, not the camera (LANE-C, branch lane/polish, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the shipped correctives-0707 + combat-readability diffs (what currently renders damage/HP indicators); docs/playtests/2026-07-07-robin-playtest-02.md F-0707-8. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green.

## Owner ruling (2026-07-07 ~06:20, screenshots — SUPERSEDES the correctives task's "camera-facing" line)
"Now the damages are relative to the player camera — they should orient themselves at their object they belong to." Screenshots show damage bars floating at camera-derived angles, visually detached from their palisades — reads as debris, not status.

## Scope
1. **Palisades**: the damage/wear indicator renders IN THE WALL'S LOCAL FRAME — a strip along the wall's long axis (following its `rotationSteps`), positioned just above the top edge or ON the face as a wear band; it rotates with the wall and never with the camera. Both orientations verified (the F-0707-2 90° bug class must stay dead — e2e asserts alignment for rotationSteps 0 AND 1).
2. **Buildings (sluice/stockpile/turret/office)**: indicator anchors to the structure in world space — consistent world orientation (aligned to the building's footprint axis), fixed offset above the roofline; no camera billboarding.
3. **Legibility check at gameplay camera**: with the fixed iso-ish camera, world-aligned strips must still read — verify contrast/size at gameplay zoom desktop + 390 (screenshots both orientations, damaged states).
4. If any indicator is currently a THREE.Sprite (auto-billboard), rebuild as a quad/plane in the parent object's frame; keep the pooling (no per-frame allocs).

## Firewall
Touch ONLY: the damage/HP indicator rendering (orientation/anchoring/geometry), e2e for it. NO changes to HP math, wear thresholds, colors/styling beyond what anchoring requires, and NOTHING else in the correctives scope (black-buildings/flash decisions stay as shipped).

## Self-check
tsc/build; e2e: indicator orientation matches parent rotation for both palisade orientations + a building; damaged-state screenshots (palisade rot-0, palisade rot-1, one building) desktop+390 into artifacts/damage-orientation/; combat-readability + m2-01 + task-025 + m1-01 suites green both projects; zero console errors. Commit on lane/polish. End: READY-FOR-GATES + what the previous implementation used (sprite vs quad) + results.
