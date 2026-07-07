# Task town-polish-01: the square gets dressed — real art onto the shells (LANE-B, branch lane/m4, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; specs/town-v1/README.md; **`assets/raw/concept-town-square.png` if batch-013 has landed — it is THE art-direction reference for every choice in this task**; the PROCESSED town art that already exists (assets/processed: bld-tavern, bld-claim-office, bld-schoolhouse, bld-general-store, bld-chapel + townsfolk from batch-009); src/town/TownScene.ts + townLayout.ts (T1's shells); the claim's building-sprite rendering pattern (how bld-* processed art becomes world sprites — reuse it). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after town-T3 in this lane's queue (T2/T3 edit the same scene surfaces).

## Why (owner verdict on T1, 2026-07-07 ~19:20: "quite rudimentary from the graphics and design point of view… But a big step forward!")
The wardrobe exists; the town wears boxes. Dress it.

## Scope
1. **Building sprites replace the shells**: tavern/claim office/schoolhouse from their processed art (assay office reuses its existing in-game sprite family); scale to the concept plate's proportions; plaques stay (they carry the T2 name + prompts).
2. **Plaza ground**: ter-plaza-ground texture (batch-013; processed if fire-side extraction has run, else defer this item with a note) replacing the flat plane; boardwalk runs align to the building entrances per the concept.
3. **Dressing props**: hitching post, trough, barrels, notice-post, well from prop-town-dressing — placed per townLayout data (additive manifest entries), collision-marked where walk-blocking (well, trough).
4. **Warm light pass**: golden-hour key consistent with the claim's light rig; buildings receive the same lit-material family as the claim's fixed buildings (the black-buildings lesson — verify light response explicitly).
5. **Townsfolk placement upgrade**: if T5 hasn't landed yet, place TWO batch-009 townsfolk as static dressing (tavernkeeper by the tavern, elder by the schoolhouse) with NO barks (T5 owns behavior) — the square should not feel empty; if T5 IS merged, skip (its roster owns them).
6. Mobile: readable at 390px; draw calls within the town's budget (state before/after).

## Firewall
Touch ONLY: src/town scene rendering/layout data, processed-asset wiring, e2e, artifacts. NO changes to: town logic (naming/board/prompts), run/claim scene, sim, batch processing (fire-side), T2/T3 features.

## Self-check
tsc/build; town-t1 (+t2/t3 if present) specs unmodified green both projects; new visual assertions (buildings textured not placeholder — sprite-source check; light response non-black probe); m1-01 + m2-01 canary green; zero console errors; screenshots (square dressed desktop + 390px, dusk shot) into artifacts/town-polish-01/ — **side-by-side with the concept plate in the report**. Commit on lane/m4. End: READY-FOR-GATES + concept-fidelity notes (what matched, what the engine can't do yet).
