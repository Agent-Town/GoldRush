# Task lane-c-wire-fairground-terrain: wire the E3 Fairground into the terrain3d pilot registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (REGISTRY — the e5-deepwater-claim entry just landed is your exact pattern); e2e/terrain3d-registry.spec.ts (extend additively); assets/pilots/map-rebuild-spike/fairground-terrain-contract.json (+ its panorama sibling).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: the fairground contract JSONs + GLBs must exist on your base (merged 2026-07-16, e9078679 ancestry); if absent STOP "wave not on base". If REGISTRY already has `e3-fairground`, STOP and report SHIPPED.

## Why (drain follow-up, 2026-07-16)
The fairground sculpt merged (THE 15/15 SLATE COMPLETE) but has no registry entry — the last unwired map.

## Scope
1. Add the `e3-fairground` REGISTRY entry (terrain + panorama contract `?raw` imports, data only).
2. Extend e2e/terrain3d-registry.spec.ts with the id (additive).
3. Boot probe with the pilot flag: `terrain3dPilotTerrainLoadState = 'mounted'`, zero console errors, screenshot.

## Firewall
Touch ONLY: src/world/Terrain3dClaimPilot.ts (imports + one entry), e2e/terrain3d-registry.spec.ts (additive). NO changes to loader logic, assets, other specs.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. terrain3d-registry green desktop+mobile. Zero console errors in the probe. Screenshot: reviews/shots-wire-fairground/fairground-desktop.png.
No-op guard: if you exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the entry as landed + spec counts.
