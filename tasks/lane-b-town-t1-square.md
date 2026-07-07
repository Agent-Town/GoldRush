# Task town-T1: the square exists (LANE-B, branch lane/m4, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/town-v1/README.md (the spec this implements — laws §1/§2/§6 are BINDING: town is a SCENE not a sim; per-profile; menu gains Enter Town)**; src/game/Game.ts scene/actor bootstrapping (M6 actors foundation — the walkable player reuses primaryActor patterns); the 044 menu. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: runs after lane-b audio-integration (queue order handles this).

## Why (spec T1; owner ratified the town model 2026-07-06; M6 merged 5de1c85 unlocked this)
The between-runs town begins: a walkable square with four building shells. Every later slice (naming, board, growth, townsfolk) mounts onto this scene.

## Scope
1. **`src/town/TownScene.ts`**: separate scene + loop mode (menu → town → back; run untouched). Ground plane (reuse terrain material family, warm), fixed intimate square ~30×30 per spec ratification-default 1.
2. **Four placeholder shells** at manifest positions (`src/town/townLayout.ts` — data file): tavern, claim office, schoolhouse, assay office. Reuse existing building-shell placeholder pattern (BT/build visuals); name plaques (ledger-styled floating labels, world-anchored per the object-frame law).
3. **Walkable player**: WASD + touch stick (reuse existing input paths) moving the hero sprite in the square; camera = gameplay camera family (feel unchanged — LAW); collision = simple shell footprints (no sim systems imported — hand-rolled AABB is fine and preferred).
4. **Approach prompts**: near each shell, a context prompt renders its name + "…opens soon" (T3/T6 wire the real interiors); prompt-stack law respected (no overlaps).
5. **Menu wiring**: "Enter Town" appears in the 044 menu between Continue and Profiles; Esc/exit button in town returns to menu. New Claim stays untouched (T3 reroutes it later).
6. Mobile: town walkable + exit reachable at 390px.

## Firewall
Touch ONLY: new src/town/**, menu entry wiring, e2e, artifacts. NO changes to: run sim/scene, CombatSystem/WaveSystem/Economy, Balance values, profile storage schema (T2 owns naming), existing e2e assertions.

## Self-check
tsc/build; new `e2e/town-t1-square.spec.ts`: menu → Enter Town → walk to each of the 4 shells (prompts assert) → exit → menu → start a normal run (regression: run unaffected); 044 menu spec + m1-01 + m2-01 unmodified green both projects; zero console/page errors; screenshots (square overview, a shell prompt, 390px) into artifacts/town-t1/. Commit on lane/m4. End: READY-FOR-GATES + results.
