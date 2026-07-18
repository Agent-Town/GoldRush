# Task lane-e8-physics: e8 physics (LADDER — queue when its lane frees, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST, deeply: AGENTS.md · specs/epoch-saga/e8-orbital-bundle.md (the vacuum/low-g slice) · the E8 contracts + Low Orbit's zero-G flag (MAP-CAMPAIGN-LEDGER names it) · Balance movement blocks · the relevant storybook chapter (the canon IS the design — cite beats you implement) · src/game/Balance.ts (add a e8Physics block for every tunable).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (goal-tree completeness sweep, owner 2026-07-18 "is there anything else missing?" — this is one of the last unarmed engine slices; its spec material is BANKED in the bundle)
E8's signature feel: low-g movement/lob physics on orbital maps, sim-deterministic.

## Scope
1. Per the bundle's slice: a per-contract gravity/drift profile (movement + lob arcs + knockback scale) driven by contract flags (Low Orbit + Eclipse first); deterministic (fixed-timestep math only).
2. The vacuum light-law hooks the E8 arsenal already asserts stay green.
3
3. Spec e2e/e8-physics.spec.ts (GATE-AUTHORSHIP, both projects): the numbered behaviors above + zero console + the named adjacent suites unmodified-green.
## Firewall: TOUCH-ONLY the systems you add + their Game wiring seams + Balance.e8Physics + your spec. CombatSystem sole damage resolver · Economy sole gold writer · activateEpoch the only era-arming seam · sim stays planar/deterministic (render-only visuals via visualY).
## Self-check: tsc+build · your spec + adjacents green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-item table.
