# Dredge Queen regression handoff

E5's scoped fidelity handoff is complete with regression exceptions. The full unchanged suite ran to completion, all generated historical outputs were restored, and frozen source/asset hashes match. This is not a green full suite or a release approval.

| Evidence | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Full unchanged E5 run | 2,806 | 340 | 202 |
| Quiet selected confirmations | 38 | 19 | 0 |
| Exact two-source pre-E5 controls | 5 | 8 | 0 |
| Restored-E5 follow-up | 2 | 3 | 0 |
| Latest actual E5 outcomes across runs | 2,838 | 312 | 198 |

The latest totals use only actual E5 executions. Control-source results and supplemental diagnostic successes do not replace failed original tests. Exact identities, execution provenance and errors are retained in [latest outcomes](latest-e5-outcomes.json) and [reconciliation](final-reconciliation.json). All eight Dredge Queen encounter entries passed in the full run; the broader focused evidence is in the [E5 review](../../../../reviews/sol-boss-fidelity-e5-dredge-queen.md).

## Isolation and controls

The full run ended at 2026-09-08T19:26:05Z. Its restoration receipt records 1,422 tracked outputs restored, 40 new outputs moved into evidence and no source/asset hash changes. Every subsequent group also restored its outputs. The two-source control restored and checked all 8,493 frozen paths.

During the full run, E6 scratch work under Vite's watched root triggered five all-client TypeScript reloads and one nested-tsconfig reload. Two later crafting-queue JSON reload entries also occurred. Source freeze alone did not provide browser isolation. Sixteen tests overlapped those events; three desktop navigation errors occurred within 0.7 seconds of E6-triggered reloads. See [reload mechanism](vite-reload-interference.json), [trace correlation](desktop-navigation-reload-correlation.json) and the final overlap analysis in [comparison](full-comparison-to-e4.json). HTML-only gallery changes were path-filtered and are not counted as game-page reload proof.

The quiet sequence covered 57 unique cases: new failures/skips, changed first failure locations and every reload-overlapping case, including passing ones. No concurrent rendering, builds or watched source edits ran. Six remaining failures repeated the exact earlier E4 error text; this establishes repeated symptoms, not identical cause. Thirteen others were checked with only `Game.ts` and `DredgeQueenBossSystem.ts` replaced by verified pre-E5 bytes. Assets, configuration and test sources stayed current. This was not a complete pre-E5 checkout.

## Retained boot-time failures

Three original checks passed the two-source control but failed again on restored E5: desktop Dry Gulch diagnostics, desktop default-order boot texture errors, and mobile Twin Banks diagnostics. They remain failed in the latest outcome table.

Their traces show unfinished asset loading, Dredge Queen state `off` and no Dredge Queen GLB requests. The queue texture error occurs 174.6 ms after a navigation starts while model/terrain loading is unfinished. A [supplemental diagnostic](boot-readiness-diagnostic/report.json) reuses the exact unchanged terrain snapshot helpers, then waits for loaded terrain/buildings. Both two-boot comparisons pass after loading; three fully loaded queue navigation cycles have zero console/page errors. The original terrain failure values exactly equal the observed early and settled heights on the same E5 source ([numeric check](boot-failure-value-match.json)). This demonstrates the terrain readiness race and supports an interrupted-loading explanation for the texture error; texture ownership itself is not established. It does not relabel the original tests as passing or broadly exonerate all failures.

The earlier E4 desktop river-placement source correlation (`m1-05-sentry-beacon-build.spec.ts:80`) and all other unresolved failures remain explicit exceptions. This boss task does not repair unrelated terrain/bootstrap, story, replay, placement or startup contracts, and no existing e2e source was changed.

Future concurrent scratch work must live outside an active test server's watched root, or wait until testing finishes. E6 may proceed after the final freeze-release receipt; the full E1–E10 goal remains active.
