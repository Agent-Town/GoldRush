# Twin Banks run 11: braid stopped at the constructor firewall

2026-09-25. **BLOCKED; not ready for implementation gates.**

## Why no implementation changed

The task limits `src/world/Terrain3dClaimPilot.ts` to “the Twin Banks water entry”. Its required production-mask-driven source-box pool needs changes to `createChannelWater` outside that entry. AGENTS.md explicitly requires STOP when a fix lies outside TOUCH-ONLY. No partial renderer or test changes were made.

At baseline `01d2b2e52c96f1081840ae1f501a54346e2dc692`, the task's single-band description applies to the fallback Terrain surface, not the normal mounted GLB path. Source inspection establishes:

- `Terrain.ts:694,1202,1554`: fallback water still builds the extended band from visualHalfWidth 7.8.
- `Terrain3dClaimPilot.ts:342,2875-2892,3282`: the pilot hides terrain.river, terrain.ford, stepping stones and RiverGravelBar objects.
- `Terrain3dClaimPilot.ts:2895-2952`: the visible path already creates two animated polyline ribbons, a confluence mesh and a ford sheet. It reads `contract.maskTruth.waterMask`, not `Terrain.waterMask()`.
- The constructor accepts only polyline river regions and rect ford regions. The production `west-source-box` river rectangle (-30..-26, -2..2) has no region-driven pool construction; hardcoded confluence points are a separate visual approximation.
- Production and sculpt masks are semantically equal today (verified by JSON comparison). Making the production mask authoritative and rendering the source rectangle cannot be accomplished by editing only the dressing entry. No claim is made that current source-box pixels are entirely dry.

## Pre-flight and measurements

- Lane branch: sol/map-art-campaign-2; no ahead commits; initial tracked tree clean. Exempt untracked logs/guard-stats.jsonl left intact. No evidence discarded.
- `npm install --no-audit --no-fund`: exit 0. npm removed ten libc metadata arrays from package-lock.json; this run's generated churn was restored exactly before proceeding.
- `npm run build` (includes tsc, Vite and asset diet): exit 0. Post-build tracked tree clean.
- Store initially clean, detached at main `5793a967da46e8f00c0ba16f92f17dc10d36558d`. Created requested astra/hm-06-braid branch at that commit. No asset edit or new store commit; nothing to push.
- Sculpt decision: untouched at this stop. Existing contract records north bed -0.4596 m, south -0.3507 m, plait mean +0.5234 m. These are authored audit values, NOT a fresh delivered-GLB measurement; remeasure before accepting the no-sculpt decision.
- Draw counts, frame p95, plain boards, walk probes, floors check, node guards and E1 payload: not run after the firewall stop. No claimed acceptance or measured before/after delta. Runtime/asset bytes unchanged, but this is not a substitute for the requested payload or floors checks.

## REMAINING LIST IN ORDER

1. Expand the pilot firewall to permit the shared `createChannelWater` constructor and its directly required integration/diagnostics, scoped to masked water; retain all simulation and other-map prohibitions. Reconcile the brief with the already-present GLB ribbons.
2. Capture actual-source baseline boards/performance; measure delivered sculpt and gravel/ford grounding.
3. Implement production-mask-driven fallback and pilot water using existing materials, including source pool and declared shallows; preserve legacy maskless tiles and avoid duplicate ribbons.
4. Re-pin only the two named tests; retain stockpile/east-spawn corrections unchanged.
5. Run floors, node guards, both builds, both-project browser/release suites with baseline attribution; finish plain boards, walks, draw/p95 and payload deltas.
6. Update campaign evidence and commit implementation. Drain owns floors re-recording and engine pin.

READY-FOR-GATES: **NO**. This commit records the required firewall finding only.
