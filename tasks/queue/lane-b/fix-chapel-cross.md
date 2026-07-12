# fix-chapel-cross — the cross comes down to its steeple (lane-b; commit prefix "fix:")
ROLE: Blender modeler. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13, from owner playtest.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: owner playtest verdict 2026-07-13 verbatim: "just for the chapel the cross is floating over the building, that has to be fixed." (Same message: the other 3D houses are "great" — change NOTHING else about them.)

## READ-FIRST: assets/pilots/chapel-3d/ (.blend + build script + GLB — the landed slice from town3d-04, drained ce0be549) · specs/town-3d/RECIPE.md §6 export laws · assets/processed/bld-chapel.png (the painting: where the cross sits relative to the steeple/roofline) · e2e/town-chapel-blender.spec.ts (must stay green, assertions UNCHANGED).

## SCOPE:
1. Open the chapel .blend: the cross mesh floats disconnected above the building. Anchor it to the steeple/roof apex per the painting — geometry contiguous or visually seated (base intersecting the steeple), matching the painted proportions. ONE mesh + ONE material law holds (merge the cross into the building mesh if it is currently separate).
2. Re-export chapel.glb per RECIPE.md §6 (same contract: ≤15k tris, 1 material, no cameras/lights); re-export verification per §6.7 → artifacts/fix-chapel-cross/reexport-evidence.md.
3. Evidence: before/after renders (same camera) showing the seated cross + an in-game `?town3dPilot=chapel` screenshot → artifacts/fix-chapel-cross/.
4. e2e/town-chapel-blender.spec.ts green both projects UNMODIFIED; tavern + general-store specs untouched-green (shared-file safety, though this slice should touch NO shared files).

## Firewall
Touch ONLY: assets/pilots/chapel-3d/*, artifacts/fix-chapel-cross/. NO other building models, NO pilot wiring code, NO spec edits, NO townLayout.

## Self-check
tsc + build green · chapel spec green desktop+mobile-390 UNMODIFIED · zero console/page errors · before/after + in-game shots at exact paths.
If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the cross-to-steeple anchor description + tri-count delta.
