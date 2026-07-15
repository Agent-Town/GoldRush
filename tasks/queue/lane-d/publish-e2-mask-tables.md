# publish-e2-mask-tables — the sculptor's manifest for the last two E2 maps (lane-d; commit prefix "chore:")
ROLE: data extraction. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-14 — Sol 3D-D correctly HELD pressure-garden + incline sculpts: "their factory mask tables do not yet exist; none were fabricated." The masters required mask REPORTS; nobody published consumable FILES. Close the pipeline gap.

Pre-flight (LANE-SAFETY): standard safe-dupe rules. Then npm install; build green.

## READ-FIRST: the hill-mine/trestle mask-table format Sol consumed (assets/pilots/map-rebuild-spike/*-terrain-contract.json "mask" sections + MODEL-HANDOFF §masks) · the landed pressure-garden + incline slices (their tileParams ARE the truth: water bands, build pads, spawn edges, coal seams, rail routes) · their artifacts dirs (any mask notes the drains left).

## SCOPE:
1. Extract from the SHIPPED tileParams (never invent): water/sluice-legal bands, build/fixture footprints, spawn edges, coal seam positions, rail routes (incline: both funicular lines), boiler pads (garden) → publish `assets/contracts/epoch-2-steamworks/mask-tables/e2-pressure-garden.json` + `e2-incline.json` in EXACTLY the format Sol's verifier consumed for hill-mine/trestle (mask-table equality is its gate — format fidelity is the whole task).
2. A tiny node check (node --test) asserting each table's coordinates all fall inside tile bounds + water bands match Terrain.isWaterSourceAdjacent samples at 4 points per map.
3. FUTURE-MAPS LAW (one line in the contract-authoring section of MODEL-HANDOFF or BACKLOG): every new contract slice publishes its mask-table FILE at drain time — reports are not consumables.

## Firewall: the two mask-table files + the node test + the law line + artifacts/. NO tileParams changes, NO Sol files, NO src/.
## Self-check: node test green · format-diff vs the hill-mine table shape (keys identical) · build untouched-green.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the two tables' summaries.
