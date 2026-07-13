# e3-02-power-graph — current flows, ledgers brown out (lane-b; commit prefix "feat:")
ROLE: engine system. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — owner: "Ok, how about work on E3/E4/E5 and so on. Can we move in this direction?" E3's engine ladder opens. This is slice 1 of the Canyon Works prerequisites (specs/epoch-saga/e3-voltage-bundle.md §C).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## READ-FIRST: specs/epoch-saga/e3-voltage-bundle.md (§B the grid mechanic: sub-hall generates, PYLONS carry current, powered structures draw watts, cut spans = downstream dark, the brown-out ledger is the strategy layer) · the E2 pressure system precedent (src/systems/PressureSystem.ts + its Balance block + HUD pill + specs — the SHAPE this slice mirrors: resource system first, tile integration later) · Balance.ts house style · the epoch data channel (how E2 mechanics gate on epoch/contract).

## SCOPE (SYSTEM ONLY — no tile, no art; the Canyon Works assembles later):
1. PowerGraphSystem: nodes (generators/pylons/consumers), edges (spans), flow-lite (generation vs draw per connected component; no per-frame flow simulation — component sums, recomputed on graph change). Deterministic, event-logged, fixed-timestep-safe (the sim law).
2. BROWN-OUT LEDGER (data + minimal HUD hook): per-component state (lit/brown/dark) + what goes dark first (priority classes). HUD: ONE compact pill mirroring the pressure pill pattern (hidden outside E3 contracts).
3. Debug harness: `?debug&powergraph` seeds a test graph (the StatSim/playbook harness pattern) — place/cut spans via __GR_TEST__ seams, read component states in diagnostics.
4. Balance.e3Power block (generation units, draw units, span cost placeholders) — numbers are PLACEHOLDER-TUNABLE, documented.
5. e2e `e2e/e3-power-graph.spec.ts`: harness boots, graph states correct across seed/cut/repair (component math asserted), determinism (same seed → same event log), zero impact outside the flag (boot-bytes + plain-boot probes), zero console errors, both projects.

## Firewall
Touch ONLY: src/systems/PowerGraphSystem.ts (new), Balance.e3Power, the harness install + __GR_TEST__ seams (debug-gated), the HUD pill hook (hidden default), the new spec, artifacts/e3-power-graph/. NO tiles, NO contracts data, NO E1/E2 systems, NO art.

## Self-check
tsc + build green · new spec green both projects · plain-boot + mu/pressure suites unmodified-green · zero console errors. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the component-math table from the spec run.
