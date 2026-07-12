# town-cast-truth — nobody walks backwards, nobody moonwalks in place, nobody wears another's face
ROLE: town presentation surgeon. WORKDIR: lane-b (worktrees/lane-b). PRIORITY: owner-visible regression.
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, 2026-07-12, verbatim): "They are walking backwards, walking when they are standing and not moving. There are the elder and inkeeper twice in town, that is not possible? Or are they clones?"
Root causes (attended triage): (1) TownActorRuntime advances walk frames whenever fullBody.animated — including during loop PAUSES and for anchored actors → walking-in-place; (2) directionRow() row mapping vs the walk8 sheets' actual row order appears inverted for at least N/S → backwards walking; (3) the preacher/schoolteacher/assay_clerk entries wear OTHER characters' sheets (standIn: true) → visible clones of tavernkeeper/storekeeper/elder.

## READ-FIRST: src/town/TownScene.ts TownActorRuntime (update/applyFullBodyFrame/directionRow + the fresh fitSpriteToTexture — do not regress 252a8fcf) · src/town/townsfolk.ts (standIn entries) · the walk8 sheet row conventions (reviews/art-sprite-production-07-newsie.md: rows = dirs s,se,e,ne / n,nw,w,sw across sheets a/b — VERIFY against the actual processed cells by eye, cell files are on disk) · e2e/cast-motion-wiring.spec.ts.

## SCOPE
1. MOTION TRUTH: advance walk frames ONLY while the actor's position actually moved this tick (loop segment, not paused); stationary/paused/anchored actors hold a neutral frame (column 0 of their facing row). Breathing/sway stays.
2. DIRECTION TRUTH: verify row mapping per direction against the real cells (open 2-3 cell files); fix directionRow so movement direction == sprite facing. e2e asserts: an actor moving screen-south shows the south-facing row key.
3. CLONE AMNESTY: preacher/schoolteacher/assay_clerk drop the borrowed sheets — render their OWN portrait presentation (the pre-fullBody bust style, their townsfolk-*.png art) until their own walk8 sheets exist (generation queued separately). No two visible actors may share a sheet: add that as an e2e assertion (unique sheet per visible actor, prospector exempt).
4. Keep 252a8fcf's aspect/fringe fixes intact (suite must stay green).
## TOUCH-ONLY: TownScene TownActorRuntime + townsfolk.ts presentation fields, cast-motion + town e2e updates, artifacts/.
## NO: art generation, trails/loops data, sim, camera.
## SELF-CHECK: tsc; build; cast-motion + town-t1..t6 green BOTH projects; zero console; a 10s plaza capture showing: walkers face their motion, pausers stand still, no clones.
END: READY-FOR-GATES + the capture + the verified row-map table.
