# F-1710-1 — complete gate-caller capture

**Slice:** `lane-d-f1710-1-gate-caller-capture.md`  
**Branch / tip:** `lane/d` / `f1af2d6a0d422bb1e6d5618bf803f96158773069`  
**Merge:** `0b5c2fe914d3d3f89c9d6978de3b115782849c00`  
**Verdict:** **MERGED — the audit test no longer depends on a truncatable `spawnSync` pipe.**

## What it does

The existing `run()` helper now redirects child stdout and stderr to tracked temporary files, closes both descriptors in `finally`, and reads the complete streams after the child exits. The returned spawn result keeps the same status, signal and error fields used by all 26 tests. No dependency or new abstraction was added.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | CLEAR |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `node --test scripts/gate-caller-audit.test.mjs` | 26/26 pass; cleanup control green |
| `node scripts/gate-caller-audit.mjs` | 22,428 bytes; 128 subjects; final PASS line present |
| `npm run test:ledger-guards` | 179/179 node tests plus every chained guard green |
| `git diff --check HEAD` | rc 0 |

Full transcript: `artifacts/f1710-1-gate-s1711.txt`.

## Merge classification

The branch changed only `scripts/gate-caller-audit.test.mjs`; main had not moved that path from the lane base. It merged without conflict after the complete detached battery.

## Findings

No blocking or follow-up finding. The prior runner exception was external: s1710 still held its ACTIVE lock and had not restored the s1709 handoff archive. s1711 restored that archive before the final ledger run, which then passed.
