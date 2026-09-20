# F-1712-1 — standings fixtures declare harness versions

**Slice:** `lane-a-f1712-1-standings-fixtures.md`  
**Branch / tip:** `lane/a` / `d0d150d67019d1b0155e5db0f0ff9854548df775`  
**Merge:** `1aad66f3c77e254448edd193a587ea6f2cdc0149`  
**Verdict:** **MERGED — all six live harness fixtures now satisfy version rigor without changing production behavior.**

## What it does

The four Field Book live-submission stacks and the two harness-bearing county-board riders now declare the shared non-blank fixture version `test`. Model-only riders and historical stored rows remain unchanged. No application or validator code moved.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | CLEAR before detached gate and merge |
| Node | pinned `26.4.0` |
| `npx tsc --noEmit` | PASS, 6.2 s |
| `npm run build` | PASS, 31.3 s |
| Own + mandatory adjacent browser matrix | 56/56 PASS in 289.5 s; desktop and 390 px mobile, one worker |
| Diff-selected guards | power, task, citation, and gate-caller arms PASS; the fixed 600 s wrapper SIGTERM-killed only the still-progressing node arm |
| Standalone `test:node-guards` | PASS in 637.6 s; 458 tests, 453 pass, 5 skipped, 0 fail |

Full append-only transcript: `artifacts/f1712-1-gate-s1713.txt`.

## Merge classification

Base `9db7988b12741fc41725b17020807ec0d0091e0b`. Both files were LANE-TOUCHED only; main moved neither path. The branch merged without conflict after the complete detached battery.

| Path | Classification | Decision |
|---|---|---|
| `e2e/field-book.spec.ts` | LANE-TOUCHED | Keep four fixture versions |
| `e2e/milk-county-board.spec.ts` | LANE-TOUCHED | Keep two fixture versions |

## Findings

- **F-1713-1 — non-blocking gate-infrastructure debt.** `scripts/run-guards.mjs` caps each guard at 600 seconds, but the repository-pinned Node 26.4.0 full node guard completed green in 637.6 seconds. The fixed outer ceiling therefore manufactures a SIGTERM red even though per-test budgets and the full battery are green. The standalone pass exonerates this fixture-only slice; a corrective must preserve the existing per-test timeout law.
