# F-1713-1 — run-guards outer child budget

**Slice:** `lane-d-f1713-1-run-guards-outer-budget.md`
**Branch / tip:** `lane/d` / `9f5903a0701eb009d56e2f148733d2e09745307d`
**Merge:** `b49ec5cf07ef4e85e8b0a58417c4d59f25c43b81`
**Verdict:** **MERGED — each guard may now use up to 15 minutes without changing any per-test budget or guard behavior.**

## What it does

The existing `spawnSync` outer ceiling moves from 10 to 15 minutes. One static contract test pins the new value and rejects the old literal. No product, simulation, configuration, dependency, helper, package script, or per-test timeout changed.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | CLEAR before detached gate and again before merge |
| Runtime | pinned Node `26.4.0` |
| Focused `run-guards` contract | 12/12 PASS in 8.3 s, including signal-kill behavior and the new 15-minute ceiling |
| `npx tsc --noEmit` | PASS in 4.9 s |
| `npm run build` | PASS in 16.5 s; Vite built in 1.51 s; asset diet green |
| Diff-selected guards | 5/5 PASS; node guards 484 s, power p95 0.392 ms, task/citation/gate-caller arms green |
| `git diff --check` | PASS |

The first detached `test:ledger-guards` arm reached only the expected live-fire archive red while `STATUS.md` still held `ACTIVE`; the binding post-bookkeeping run is performed after the s1714 handoff is restored. Full append-only transcript: `artifacts/f1713-1-gate-s1715.txt`.

## Merge classification

Base `2f246864e3d7ef87b5ef649d3767a980a8b537de`. Both files were LANE-TOUCHED only; main moved neither path. The branch merged without conflict after the detached battery.

| Path | Classification | Decision |
|---|---|---|
| `scripts/run-guards.mjs` | LANE-TOUCHED | Keep the single outer ceiling change from 10 to 15 minutes |
| `scripts/run-guards.test.mjs` | LANE-TOUCHED | Keep the one static contract test |

## Findings

None. The interim archive red is a known property of the live `ACTIVE` state and is closed by the mandatory handoff restoration, not by changing the candidate.
