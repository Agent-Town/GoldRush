# Task e2-hill-mine: THE HILL MINE — Epoch 2's flagship tile (LANE-D, branch lane/perf, commit prefix "e2:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/epoch-saga/e2-steamworks-bundle.md §B (THE HILL MINE — the ASCII layout, the GT elevation table, gates, the boss rail-route: BINDING)**; the full GT stack NOW COMPLETE (TileHeight data, slope movement+resolver, enemy elevation, GT-04 sightlines, GT-05 water depth — this tile is their first real consumer); the `?contract=` loader + tile descriptors (identity-pass patterns); the rail entity (spurs on the terraces); ter-hillmine-atlas art (batch-010, LEDGER state — placeholder-first if unprocessed). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (the era needs its ground; every GT rung was built for this)
E2's map: a terraced hillside — switchback levels climbing to the mine mouth, rail spurs on the terraces, elevation as TACTICS (GT-04 sightlines: terraces block bolt LOS; high turrets see far), flooded lower galleries (GT-05 wade/deep). The first tile where the whole terrain ladder plays at once.

## Scope
1. **The tile descriptor** per the bundle's §B ASCII + elevation table: terrace heightfield (hand-authored analytic per the gt-test-basin pattern, tuned to the bundle's values), the mine-mouth plateau, switchback ramps (wade-free paths), the flooded lower gallery (deep water ring per GT-05), rail spurs per terrace (the rail entity), build zones per the bundle, spawn lanes (upper rim + valley mouth).
2. **Contract manifest** `e2-hill-mine`: board row (locked: "awaits the Steamworks era" — epoch-gated unlock, the FIRST epoch-2 contract card, visible-but-locked as the era's poster on the board), briefing block (goals/rules per bundle), dev access `?debug&contract=e2-hill-mine` regardless of epoch (test door).
3. **Terrain-tactics proof e2e**: turret on terrace-2 acquires valley targets beyond flat range (high-ground bonus asserted) · terrace face blocks LOS both ways · bandits route the switchbacks (never through faces — GT-03) · the flooded gallery blocks all (GT-05 deep) · hero wades the gallery edge (wade slow asserted) · determinism seeded two-run identical · 200-enemy stress in envelopes.
4. **Placeholder-first visuals**: hillmine atlas if processed, else the existing sand family + the TR-01 mesh flag verified compatible (run its suite flag-on here, report).
5. Board: the locked card renders with epoch-unlock copy (T3 board suite extended count-aware — SIX cards? Count assertions updated in the same breath, the lesson learned).

## Firewall
Touch ONLY: the hill-mine descriptor + manifest data, terrace-authoring helpers (data-side), e2e, board count updates, artifacts. NO GT/engine changes (consume, don't modify — gaps = findings), NO epoch activation logic, NO E2 enemies (separate task), NO default-claim anything.

## Self-check
tsc/build; new `e2e/e2-hill-mine.spec.ts` per scope-3 (all six tactics asserted); board suite updated+green; gt-01..05 + task-025 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (the terraces wide, the mine mouth, the flooded gallery, a high turret firing long) into artifacts/e2-hill-mine/. Commit on lane/perf. End: READY-FOR-GATES + the elevation table as shipped + results.
