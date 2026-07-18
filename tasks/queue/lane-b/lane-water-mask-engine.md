# Task lane-water-mask-engine: water mask engine (lane-b, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST, deeply: AGENTS.md · specs/gameplay-terrain (the mask laws) · src/world/Terrain.ts isWaterSourceAdjacent (the SIM water truth) · the terrain contract maskTruth tables (map-rebuild-spike) · docs/SOL-3D-D-QUEUE.md §Twin Banks (the consumer waiting on you) · the relevant storybook chapter (the canon IS the design — cite beats you implement) · src/game/Balance.ts (add a waterMask block for every tunable).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (goal-tree completeness sweep, owner 2026-07-18 "is there anything else missing?" — this is one of the last unarmed engine slices; its spec material is BANKED in the bundle)
The one engine capability gating 3D-D's Twin Banks true-braid re-sculpt: authored water masks as first-class contract data the sim AND the sculpts both read.

## Scope
1. CONTRACT WATER MASKS: contracts may declare water regions (rect/polyline bands) in their mask tables; Terrain's water queries (isWaterSourceAdjacent + sluice placement) consume the declared mask when present, falling back to today's behavior when absent (zero change for existing maps — assert byte-identical behavior on the-claim).
2. THE BRAID TEST CASE: express a two-channel braid on a scratch/dev contract and prove sluices place on BOTH channels and enemies respect both cuts.
3. Publish the mask shape in the contract docs so 3D-D sculpts to it (the interlock: sim mask first, sculpt agrees second).
4
4. Spec e2e/water-mask-engine.spec.ts (GATE-AUTHORSHIP, both projects): the numbered behaviors above + zero console + the named adjacent suites unmodified-green.
## Firewall: TOUCH-ONLY the systems you add + their Game wiring seams + Balance.waterMask + your spec. CombatSystem sole damage resolver · Economy sole gold writer · activateEpoch the only era-arming seam · sim stays planar/deterministic (render-only visuals via visualY).
## Self-check: tsc+build · your spec + adjacents green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
