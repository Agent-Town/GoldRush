# Task lane-c-wire-glow-mesa-terrain: wire the E6 Glow Mesa into the terrain3d registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (REGISTRY — the e3-fairground + e5-deepwater entries are your pattern); e2e/terrain3d-registry.spec.ts (extend additively); assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json + panorama sibling.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules (lane ahead is NORMAL; content-on-main = SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd`; STOP only on undrained content or foreign uncommitted edits). Then npm install; build green.
GROUND-TRUTH pre-flight: glow-mesa contract JSONs + GLBs on base (merged 2026-07-17, 8ff3d7e2 ancestry) — absent = STOP "wave not on base"; REGISTRY already has e6-glow-mesa = STOP SHIPPED.

## Why: the 16th sculpted map (E6's signature tile) has no registry entry — invisible behind the pilot flag.
## Scope: 1. REGISTRY entry e6-glow-mesa (terrain+panorama ?raw imports, data only). 2. terrain3d-registry.spec.ts additive id. 3. Boot probe with pilot flag: 'mounted' state, zero console, screenshot.
## Firewall: Terrain3dClaimPilot.ts (imports + one entry) + the spec, additive. NOTHING else.
## Self-check: tsc+build green · registry spec green desktop+mobile · zero console · screenshot reviews/shots-wire-glow-mesa/mesa-desktop.png.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + entry + spec counts.
