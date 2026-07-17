# Task lane-c-wire-campaign-extras: wire the overnight sweep — every new campaign sculpt into the registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=medium
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (REGISTRY — the house pattern, now ~15 entries); e2e/terrain3d-registry.spec.ts (extend additively); assets/pilots/map-rebuild-spike/*-terrain-contract.json (EVERY contract whose contractId lacks a REGISTRY entry — enumerate at run time, that enumeration IS your scope; expect the E4/E5/E6/E7/E8/E9/E10 extras: long-road, gusher-county, boneyard, regatta, showroom, half-life-hollow, picnic, echo-canyon, dead-band, relay-rush, far-side, low-orbit, eclipse, seed-run, devils-alley, old-canal, archive-world — names per the actual files).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/e2-arsenal main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: enumerate contracts-without-entries; ZERO missing = STOP SHIPPED.

## Why: the overnight sweep put every unique campaign sculpt on main; none are visitable until registered. One data batch closes the whole gap.
## Scope: 1. One REGISTRY entry per missing contract (terrain+panorama ?raw imports, data only; VARIANT contracts with tileId reuse get ALIAS entries pointing at the reused terrain assets — the flotilla/stillwater pattern; document each alias). 2. terrain3d-registry.spec.ts additive ids for all. 3. Boot-probe a SAMPLE of four (one per era band: an E4, an E6/E7, an E8, an E9/E10): 'mounted' state, zero console, screenshots. 4. Update docs/MAP-CAMPAIGN-LEDGER.md wired column for every entry landed.
## Firewall: Terrain3dClaimPilot.ts (imports+entries) + the spec + the ledger doc. NOTHING else.
## Self-check: tsc+build green · registry spec green both projects · 4 probes zero-console · screenshots reviews/shots-wire-campaign/. 
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the entry list + alias decisions + ledger rows updated.
