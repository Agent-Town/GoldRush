# Task lane-c-wire-e8-e9-e10-terrain: wire the final three maps into the terrain3d registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (REGISTRY — glow-mesa/relay-valley entries are the pattern); e2e/terrain3d-registry.spec.ts (extend additively); the three contract JSON pairs in assets/pilots/map-rebuild-spike/: mare-claim-*, dome-basin-*, ember-shore-*.

Pre-flight (LANE-SAFETY): standard safe-dupe rules (content-on-main = SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd`; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: all six contract JSONs + GLBs on base; REGISTRY lacks e8-mare-claim/e9-dome-basin/e10-ember-shore. Any present = wire only the missing; all present = STOP SHIPPED.

## Why: the last three sculpted maps (E8/E9/E10) complete THE FULL SAGA REGISTRY — every run tile in ten eras visitable behind the pilot flag.
## Scope: 1. Three REGISTRY entries (terrain+panorama ?raw imports each, data only). 2. terrain3d-registry.spec.ts additive ids ×3. 3. Boot probe each with the pilot flag: 'mounted', zero console, screenshot each.
## Firewall: Terrain3dClaimPilot.ts (imports + three entries) + the spec, additive. NOTHING else.
## Self-check: tsc+build green · registry spec green desktop+mobile · zero console ×3 probes · screenshots reviews/shots-wire-final-three/{mare,basin,ember}-desktop.png.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the three entries + spec counts — the registry's completion evidence.
