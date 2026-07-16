# publish-e3-fairground-mask-table — the sculptor's manifest for the LAST unmasked map (lane-d; commit prefix "chore:")
ROLE: data extraction. WORKDIR: lane-d (worktrees/lane-d).
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-16 — map-coverage audit: 15 playable contracts, 14 masked, e3-fairground is the ONLY gap (no `assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json`). Sol 3D-D's fairground sculpt is pre-granted BEHIND this file (masks-first law: sculpts from published tables, never manifest prose).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: if `assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json` already exists on your base, STOP and report SHIPPED.

## READ-FIRST
assets/contracts/epoch-3-voltage/mask-tables/e3-moth-season.json + e3-canyon-works.json (the EXACT schema to reproduce: maskTruth{source,tileId,size,river,ford,buildZones,waterSources,lanes} + waterAgreement) · assets/contracts/epoch-3-voltage/contracts.json → the e3-fairground entry (its tileParams ARE the truth: 88×88, no river/ford, south-midway + west-pavilion + further buildZones, spawn config) · the fairground slice's landed code (grep src/ for how the fairground tile/Ferris wheel fixture places — extract any fixture footprints the tileParams carry; if the wheel's footprint lives only in code constants, record it as a fixture zone with the file:line cited in the table's "source" field).

## SCOPE
1. Extract from the SHIPPED e3-fairground tileParams (never invent): build zones, spawn edges/lanes config, water truth (river:false, ford:false, waterSources), any fixture footprints → publish `assets/contracts/epoch-3-voltage/mask-tables/e3-fairground.json` in EXACTLY the sibling tables' schema (key-for-key — format fidelity is the whole task; Sol's verifier gates on mask equality).
2. Extend the existing mask-table node check (or add a sibling `node --test`) asserting: every coordinate falls inside the 88×88 tile bounds; water truth matches the contract (no water on this tile).
3. One BACKLOG line under the mask-tables ledger: e3-fairground published → 15/15 contracts masked; 3D-D fairground sculpt UNBLOCKED (pre-granted, docs/SOL-3D-D-QUEUE.md).

## Firewall
Touch ONLY: the new mask-table json + the node test + the BACKLOG line + artifacts/.
NO changes to: contracts.json/tileParams, src/, Sol's files (assets/pilots/**), other mask tables, e2e specs.

## Self-check (evidence, not vibes)
node test green · key-schema diff vs e3-moth-season.json = identical key structure · tsc + `npm run build` untouched-green.
No-op guard: if you exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the table's zone/lane summary + any code-side fixture footprints found (with file:line).
