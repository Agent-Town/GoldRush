# town3d-15-plaza-props — wagons, trough, pan monument (TOWN-3D slice 15, props batch) (lane-d; commit prefix "feat:")
ROLE: Blender modeler + web wiring. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner order verbatim (2026-07-13): "Yes, this is amazing - lets hit it start the queue, let it do all the houses and all other 3D objects that we have in game." — "all other 3D objects" includes the plaza props.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **OVERNIGHT LADDER NOTE (attended authorization 2026-07-13): if you STOP because the lane's previous town3d/run3d slice is done but undrained, report exactly "LADDER-STALL: waiting on drain of <slice>" — the fires drain and re-queue this master; such re-queues are pre-authorized and do NOT count toward twice-then-escalate.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## WHY: the plaza's covered wagons, water trough, and the Pan Monument (src/town/townLayout.ts props list) are primitive-built set dressing beside increasingly real buildings; one batched slice brings the three prop FAMILIES to the same bar. Batched because each is small (RUN-RECIPE budgets: ≤4k tris, ≤512² material EACH).

## READ-FIRST: specs/town-3d/RECIPE.md + RUN-RECIPE.md budgets · src/town/townLayout.ts props list (positions/rotations/scales per instance — DO NOT change) · how props currently render in TownScene (the primitive builders — these remain LITE/fallback) · the landed town pilot pattern + sibling drains · e2e/town-general-store-blender.spec.ts grammar · plate-arsenal-e1 (the brass pan lineage for the monument).

## SCOPE: (1) Model covered_wagon.glb, water_trough.glb, pan_monument.glb (+ .blend each) under assets/pilots/plaza-props-3d/, baked from the town's painted style. (2) Re-export verification. (3) Additive ?town3dPilot wiring: 'all' (and 'props') mounts every prop INSTANCE from townLayout with its position/rotation/scale; primitive props remain flag-off/LITE/failure default. Instancing per RUN-RECIPE R5 (3 fetches max). (4) e2e/town-plaza-props-blender.spec.ts: flag-off zero-GLB; flag-on mounts all instances (count matches townLayout), single fetch per model, lite, invalid-bytes, disposal, p95 ≤115%, zero errors, both projects. (5) Owner contact sheet of the dressed plaza.

## Firewall
Touch ONLY: assets/pilots/plaza-props-3d/, e2e/town-plaza-props-blender.spec.ts, artifacts/town3d-plaza-props/, additive pilot wiring. NO townLayout values, NO building GLBs/specs, NO sim, NO grounding.

## Self-check
tsc + build green · your spec green both projects · tavern + store specs UNMODIFIED-green · zero errors. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + per-prop tri counts + instance-count proof.
