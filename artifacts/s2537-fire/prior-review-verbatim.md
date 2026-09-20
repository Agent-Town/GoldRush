# Chapter evidence opt-in — s2536 gate HOLD

## Slice, branch and tip

Task `tasks/lane-c-chapter-evidence-opt-in.md`, done-move `tasks/done/20260907-115228-lane-c-chapter-evidence-opt-in.md`, branch `feat/hero-move-verb`, tip `5b3c45754b5105fe5bc7d9eb86e2499a9d35e0ed`. Lane base `6b66fa46be7d177be9c188db00ecdcdddf23d3af`; integration base `3d66f8ed3058f9626c46527a4bc3bd550985f5c8`; detached candidate `9d2352506c00db00f5a4bbe493af44c416612088` at `/private/tmp/gr-gate-s2536`.

## Verdict

**HOLD — no implementation merged.** The complete node run returned two failures. Both subjects passed isolated follow-ups, but the fixture-owner loop had stopped before finishing its corpus, subsequent chained gates were not established, and browser acceptance remains outstanding. A focused green is not a completed full gate. Keep the lane and done-move; this is gate evidence still owed, not an owner fork or a request to rerun the implementer.

## What it does

Seven existing test writers send ordinary evidence to `test-results/evidence/`. Only literal `GR_REFRESH_EVIDENCE=1` selects the retained paths. The one authorised Moth refresh keeps all 93 old trace rows and adds a terminal row, with hash `fnv1a32:5872d6c4`. No assertions, test titles, sim code, assets, dependency files or retained chapter PNGs change. The measured chapter corpus is 50 PNGs, correcting the master's historical count of 48.

## Evidence

| Check | Result |
| --- | --- |
| TypeScript / build | PASS, 6.8 s / 32.2 s |
| Default Moth Season | 3/3 PASS, 83.0 s; scratch JSON equals refreshed retained ride |
| Retention | All 51 retained files byte-identical after the default run |
| Full Node 26 battery | 741 tests: 734 pass, 2 fail, 5 skip, 0 cancelled; 2397.6 s, rc 1 |
| Fixture sweep failure | Secure-choice child exited 1; sweep stopped after 1092.3 s |
| Landmark failure | Child exit 1 at `gr-sim.test.mjs:291`, after 108.2 s |
| Focused secure-choice repeat | 2/2 PASS, 28.2 s |
| Focused landmark repeat | 1/1 PASS, 18.2 s |
| Power | Initial 0.761 and 0.555 ms failures; final serial candidate 0.329 ms PASS against 0.500 ms; interleaved base 0.374 ms PASS |
| Main task guard | PASS, 1,321 masters / 0 invisible; linked-tree SKIP is not counted |
| Browser | Not run by s2536; still required |

Raw receipts: `artifacts/s2536-fire/preliminary.txt`, `artifacts/s2536-fire/node-gates.txt`, `artifacts/s2536-fire/node-controls.txt`, `artifacts/s2536-fire/power-control.txt`, `artifacts/s2536-fire/default-preservation.json`. The runner's explicit-refresh report is copied verbatim from the held tip into `artifacts/s2536-fire/runner-report.md`; its browser 66/68 result was limited by a sparse checkout. The missing E9 plate is present in this complete candidate.

## Merge classification

All eight existing paths are lane-only relative to the lane base; the report is new. Six chapter files contain exactly one output-path substitution each. The Moth test changes directory selection and its existing writer argument only. The retained JSON and report are evidence. No conflicts were resolved and no implementation file from the candidate was copied onto main. Setup and source-identity receipts are retained under `artifacts/s2536-fire/`.

## Findings and next action

**F-2536-1 — gate incomplete.** The initial full-run failures did not reproduce in focused runs; their exact cause remains unproven. Attended tests and host contention were observed, but that is not an exemption. The power guard and its source/dependency blobs match base exactly and the final serial repeat passed. No test budget or assertion was changed.

The attended evening chain reached main at `92358832708bcd8c534dac1857f71859a06b8c87` during closing. Its grammar merge `9912785f7` changed runtime semantics, the Moth test and the retained Moth JSON. The detached candidate is now stale. Re-integrate the seven output-path changes on current main while preserving that newer Moth program, assertions and recording; do not restore the obsolete lane JSON. Then run the complete native node gate, six chapter suites, required task-025/M1/M2 adjacent suites and desktop/390px boot checks. No earlier runtime gate transfers to this new base. The separate completed `lane-a-m1-debug-spawn-contract` remains second priority. This fire does not prescribe a source corrective for an unreproduced failure.
