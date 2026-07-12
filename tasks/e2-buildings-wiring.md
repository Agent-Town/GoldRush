# e2-buildings-wiring — the Steamworks buildings become real (art → game)
ROLE: asset wiring + build system. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (BUILD-PLAN §4 E2 ④; art drained 2026-07-12 — see assets/LEDGER.md "E2 completion batch")
Raw art exists for Boiler House / Rail Depot / Machine Shop / rail elements / icons-e2; boilers currently render placeholder boxes (e2-pressure shipped placeholder-first).

## READ-FIRST: assets/LEDGER.md (the PENDING-PROCESSING rows + THE QA-BLOCK: char-hero pose sheets are DO-NOT-WIRE) · reviews/art-sprite-production-07-newsie.md (extraction conventions) · scripts/extract-alpha.mjs + scripts/optimize-assets.mjs (600KB shipped cap) · src/assets/generated.ts + BuildSystem buildable registrations · specs/epoch-saga/e2-steamworks-bundle.md §A1/§A5/§A6.
## SCOPE
1. PROCESS: sips 384px promotions (boiler-house, rail-depot, machine-shop — the bld-* sibling convention) + extract-alpha for ter-rail-elements + icons-e2 (--key ff00ff, explicit grids per bundle) + optimize-assets pass.
2. WIRE: Boiler House buildable swaps placeholder → processed portrait; Rail Depot + Machine Shop register as E2 town/board art slots per bundle §A1 (buildable wiring only where a slice already consumes them — do NOT invent gameplay); icons-e2 cells register for the E2 research/build UI slots; rail elements feed the Hill Mine rail render.
3. NO pose-sheet wiring (QA-blocked). NO regeneration.
4. e2e: E2 boot shows the processed boiler-house art (not placeholder) + icons render; both projects.
## TOUCH-ONLY: assets/processed/*, assets/processed-full/*, src/assets/generated.ts, buildable/slot registrations, one e2e, artifacts/, LEDGER rows (PENDING-PROCESSING → done).
## NO: sim/Balance, art generation, pose sheets, town layout.
## SELF-CHECK: tsc; build; new spec + e2-pressure-in-run + e2-hill-mine + m1-01/m2-01 green BOTH projects; zero console; screenshots.
END: READY-FOR-GATES + before/after boiler shots.
