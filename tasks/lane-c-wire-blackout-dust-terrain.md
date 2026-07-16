# Task lane-c-wire-blackout-dust-terrain: wire Blackout Ridge + Dust Flats into the terrain3d pilot registry (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/world/Terrain3dClaimPilot.ts (the REGISTRY at ~line 57 and the existing `?raw` import pattern at the top — follow it EXACTLY); e2e/terrain3d-registry.spec.ts (the assertion pattern you will extend); reviews/sol-3d-d-findings.md §"Blackout Ridge + Dust Flats wave" (what the assets are and their gate state).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: the four asset files MUST exist on your base (merged to main 2026-07-16, merge 5e18b981 ancestry): `assets/pilots/map-rebuild-spike/{blackout-ridge,dust-flats}-terrain-contract.json` + `{blackout-ridge,dust-flats}-panorama-contract.json` (plus their .glb siblings). If absent, STOP and report "3D-D wave not on base". If REGISTRY already contains `e3-blackout-ridge` or `e4-dust-flats` (grep it), STOP and report SHIPPED.

## Why (drain follow-up, 2026-07-16)
3D-D's Blackout Ridge + Dust Flats terrain/panorama pairs merged to main (READY-FOR-GATES eeefa02a, gated tsc+build, masks-exact per F-3D-D-42) — but `Terrain3dClaimPilot.ts` REGISTRY has NO entries for `e3-blackout-ridge` / `e4-dust-flats` (verified 2026-07-16: grep blackout|dust returns nothing in that file). Both are playable contracts (`assets/contracts/epoch-3-voltage/contracts.json` id `e3-blackout-ridge`; DustFlatsTile exists for `e4-dust-flats`). The sculpts are banked but invisible in play — Mistake #10 territory (user-facing work a player can't see) unless wired.

## Scope
1. Add REGISTRY entries for `e3-blackout-ridge` and `e4-dust-flats` in src/world/Terrain3dClaimPilot.ts, each wiring its terrain-contract + panorama-contract via the existing `?raw` import pattern. NO changes to the loader's logic — data entries only, exactly like the eleven existing ones.
2. Extend e2e/terrain3d-registry.spec.ts to assert the two new ids resolve (same assertion shape as the existing entries — extend, do not rewrite existing assertions).
3. Boot-probe evidence: launch each contract with the terrain3d pilot flag (the URL grammar the existing terrain3d-claim-pilot.spec.ts uses), assert zero console/page errors, and capture screenshots.

## Firewall
Touch ONLY: src/world/Terrain3dClaimPilot.ts (registry data + imports), e2e/terrain3d-registry.spec.ts (additive).
NO changes to: loader logic/heightfield code, Terrain.ts, DustFlatsTile.ts or any tile/sim code, mask tables, contracts.json, the pilot GLB/JSON assets themselves, any other spec's assertions.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. e2e/terrain3d-registry.spec.ts green desktop+mobile. Adjacent unmodified-green both projects: terrain3d-claim-pilot.spec.ts, terrain-seamless.spec.ts. Zero console/page errors in both contract boot probes. Screenshots: reviews/shots-wire-blackout-dust/{blackout-desktop.png, dust-desktop.png, dust-mobile.png}.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the two registry entries as landed, spec counts, and any asset-side surprise (wrong path casing, contract-id mismatch) as findings — report, don't fix asset files.
