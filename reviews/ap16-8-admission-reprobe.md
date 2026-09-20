# AP-16-8 — admission re-probe

**Slice:** `lane-c-ap16-8-admission-reprobe.md`  
**Branch / tip:** `lane/c` / `43c7bbd3ded2ca7620a652323d0437b3793b480e`  
**Base:** `2158148f99eb0abf8eeffb828b500b2339f35e41`  
**Merge:** `13f5881f07e1e319cfc88682fc2afbe09520db23`  
**Verdict:** **MERGED — all eight exemptions remain, now backed by the full verb-set re-probe.**

## What it does

The probe runs idle and scripted policies for both seeds twice on every admission exemption. It exercises `BOAT_BUILD`, `REANCHOR`, `CAPTURE`, upgrades, builds, harvests and hold orders, then rejects any contract without a lawful secure terminal. The register now records the measured residual blocker for each row; no contract was admitted and the public door fence stayed unchanged.

Showroom is the important negative: both seeds still report `secured` at wave 20, but idle and capture policies finish with the alive cap fixed at 60. The probe classifies that deterministic deadlock as unlawful rather than turning a false green into admission.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | CLEAR |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| focused audit/admission/skill guards | 12/12 pass |
| `npm run test:node-guards` under Node 26.4.0 | 458 total / 453 pass / 0 fail / 5 intentional skips |
| `node e2e/ap16-8-admission-probe.mjs` | 64/64 seed-policy repeats deterministic; 8/8 remain unlawful |
| E5/E6 census + task-025 + m1-01 + m2-01 + plain boot | 50/50 pass, desktop and 390px, `--workers=1` |

Full transcript: `artifacts/ap16-8-gate-s1710.txt`.

## Merge classification

All four paths were lane-touched only relative to base `2158148f9`; main moved none of them before the merge. The branch merged without conflict. Factory-generated screenshot churn in the detached worktree was excluded.

## Findings

No new blocking finding. The measured debt remains the existing railcar pressure-to-damage slice, Fairground escort consumer, Deepwater boss resolution, Stillwater noise-hunt consumer, Glow Mesa Homemaker resolution, and Showroom's alive-cap deadlock.
