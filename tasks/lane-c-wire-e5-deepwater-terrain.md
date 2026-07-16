# Task lane-c-wire-e5-deepwater-terrain: wire the E5 Deepwater Claim into the terrain3d pilot registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (REGISTRY + the blackout/dust entries just landed — yours is the same pattern; note line ~387: landmarkMounts with `asset` filled auto-mount); e2e/terrain3d-registry.spec.ts (extend, same shape); assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json (contractId e5-deepwater-claim; 4 landmarkMounts = the drowned E4 town, assets pre-filled).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: `assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json` + `deepwater-claim-panorama-contract.json` + both GLBs must exist on your base (merged 2026-07-16, 54c52af7 ancestry). If absent, STOP and report "E5 wave not on base". If REGISTRY already has `e5-deepwater-claim`, STOP and report SHIPPED.

## Why (drain follow-up, 2026-07-16)
3D-D's E5 Deepwater Claim pair merged (54c52af7) — chain-2's first map, carrying the owner-directed drowned E4 town as four reuse-only landmarkMounts (F-3D-D-48: seabed contacts −5.98..−5.74 m). The registry has no e5-deepwater-claim entry, so none of it is visitable. Same gap-class as wire-blackout-dust (now shipped — follow its exact landed pattern).

## Scope
1. Add the `e5-deepwater-claim` REGISTRY entry in src/world/Terrain3dClaimPilot.ts wiring deepwater-claim-terrain-contract.json + deepwater-claim-panorama-contract.json via the `?raw` import pattern. Data entry only — the four drowned-town mounts load through the EXISTING landmarkMounts path (assets are pre-filled); do not add mount logic.
2. Extend e2e/terrain3d-registry.spec.ts with the new id (same assertion shape, additive).
3. Boot probe: launch e5-deepwater-claim with the terrain3d pilot flag (the deepwater board-launch pattern its own spec uses); assert the canvas reaches `terrain3dPilotTerrainLoadState = 'mounted'`, zero console/page errors, screenshot.

## Firewall
Touch ONLY: src/world/Terrain3dClaimPilot.ts (imports + one REGISTRY entry), e2e/terrain3d-registry.spec.ts (additive).
NO changes to: loader/mount logic, DeepwaterClaimTile.ts or any sim code, the contract JSONs/GLBs, mask tables, other specs' assertions, the running Dredge-Queen work (lane-b owns the boss — do not touch boss files even if you see them).

## Self-check (evidence, not vibes)
tsc + `npm run build` green. terrain3d-registry.spec.ts green desktop+mobile. Adjacent unmodified-green both projects: terrain3d-claim-pilot.spec.ts, the e5 deepwater tile spec. Zero console/page errors in the boot probe. Screenshot: reviews/shots-wire-e5-deepwater/deepwater-desktop.png (+ one 390px mobile).
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the registry entry as landed, whether the four ruin mounts visibly loaded in the probe (count them), spec counts.
