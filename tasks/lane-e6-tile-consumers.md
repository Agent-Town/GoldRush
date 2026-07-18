# Task lane-e6-tile-consumers: e6 tile consumers (lane-d, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST, deeply: AGENTS.md · specs/epoch-saga/e6-atomic-bundle.md (the tile-state consumer content) · src/game/TileStateStore.ts (TP substrate SHIPPED — the Loader Contract: persistence speaks once at tile birth) · the wrangle system (E6's shipped verb — what tile states it already writes) · the relevant storybook chapter (the canon IS the design — cite beats you implement) · src/game/Balance.ts (add a e6Tiles block for every tunable).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (goal-tree completeness sweep, owner 2026-07-18 "is there anything else missing?" — this is one of the last unarmed engine slices; its spec material is BANKED in the bundle)
E6's era systems should CONSUME tile persistence (the substrate shipped; the era-specific consumers were the identified arming gap).

## Scope
1.-2. Implement the bundle's E6 tile-consumer slices (what the atomic era reads/writes per tile across runs — pens, wrangled machines, decay states — per the bundle's own slice list; quote the gates).
3
3. Spec e2e/e6-tile-consumers.spec.ts (GATE-AUTHORSHIP, both projects): the numbered behaviors above + zero console + the named adjacent suites unmodified-green.
## Firewall: TOUCH-ONLY the systems you add + their Game wiring seams + Balance.e6Tiles + your spec. CombatSystem sole damage resolver · Economy sole gold writer · activateEpoch the only era-arming seam · sim stays planar/deterministic (render-only visuals via visualY).
## Self-check: tsc+build · your spec + adjacents green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
