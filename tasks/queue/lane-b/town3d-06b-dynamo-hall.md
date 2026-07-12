# town3d-06b-dynamo-hall — the Dynamo Hall in 3D (TOWN-3D slice 6b) (lane-b; commit prefix "feat:")
ROLE: Blender modeler + web wiring. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner order verbatim (2026-07-13): "Yes, this is amazing - lets hit it start the queue, let it do all the houses and all other 3D objects that we have in game." The Dynamo Hall is the E2 megaproject the owner's own town shows post-T2; "all the houses" includes it.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **OVERNIGHT LADDER NOTE (attended authorization 2026-07-13): if you STOP because the lane's previous town3d/run3d slice is done but undrained, report exactly "LADDER-STALL: waiting on drain of <slice>" — the fires drain and re-queue this master; such re-queues are pre-authorized and do NOT count toward twice-then-escalate.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## WHY: the owner's active town renders the Dynamo Hall (T2 slice, `dynamoHallGroup` in TownScene). It is a house in his town; the ladder covers it.

## READ-FIRST: specs/town-3d/RECIPE.md + README.md RULINGS · src/town/TownScene.ts dynamoHall members (how/where the hall renders + stage visuals — the 3D model mounts at the SAME anchor, visual-only, complete/active stage only) · the Dynamo Hall art (T2/e2 assets — locate via LEDGER/generated registry; bake FROM it) · sibling pattern `git show ecafb140` + landed town3d drains · e2e/town-general-store-blender.spec.ts (grammar) · e2e/schoolhouse-era-truth.spec.ts (profile-seeding pattern for the pre-T2 case).

## SCOPE: (1) Model+bake `assets/pilots/dynamo-hall-3d/dynamo-hall.blend` + .glb per RECIPE.md (≤15k tris, ONE ≤1024² material; teal glow is baked paint, NO emissive channel). Mount at the hall's existing anchor; 3D renders ONLY when the hall is complete/active (read existing state, no writes). (2) Re-export verification → artifacts/town3d-dynamo-hall/. (3) Additive ?town3dPilot wiring (one entry; 'all' mounts everything). Existing hall visuals stay LITE + fallback + flag-off. (4) e2e/town-dynamo-hall-blender.spec.ts cloned from the store grammar + a pre-T2-profile case asserting no 3D hall. (5) Tonal match ≤5% + owner contact sheet.

## Firewall
Touch ONLY: assets/pilots/dynamo-hall-3d/, e2e/town-dynamo-hall-blender.spec.ts, artifacts/town3d-dynamo-hall/, additive pilot wiring in TownScene.ts + TownTavernPilot.ts. NO megaproject/epoch state logic, NO ceremony code, NO sibling assets/specs, NO sim, NO grounding.

## Self-check
tsc + build green · your spec green both projects · tavern + store specs UNMODIFIED-green · zero console/page errors. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + numbers.
