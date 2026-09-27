# Play proofs 9 — six measured holds; drain gates pending

**Verdict: HELD FOR FULL NODE GATES. Not landed.** s2715, 2026-09-27. The accepted deliverable is a measured QA record, not six successful gameplay proofs. The source task expressly permits READY-FOR-GATES with recorded holds.

Source: `sol/map-art-campaign-2`, tip `3d2baae0d750489434afeed8c589d61db21e08b8`; six map commits. Detached merged candidate: `26dc6acc63f86472900ca777d2d867527b3bedb8`, `/Users/robin/.goldrush/fire-s2715/wt-pp9`. The source evidence remains on that candidate until a completed drain lands it.

## What it does

Adds six opt-in native proof specs and a compact evidence adapter that freezes objective observations before banking. The shared driver, existing assertions and all production code are unchanged. There is no player-visible runtime change in a plain boot, no balance change and no art acceptance. With `GR_NATIVE_PROOF` unset, all twelve project cases skip.

| Map | Desktop | 390 px phone | Interpretation |
| --- | --- | --- | --- |
| Half-Life Hollow | Default and restore deaths at wave 4 | Default and restore deaths at wave 4 | Crossing complete; survival remains unproved |
| Picnic | Stakes lost at wave 2, 100 HP | Stakes lost at wave 2, 100 HP | Default works lie outside the stake protection radius |
| Showroom | Alive budget exit at wave 79; captures 0/6 | Alive budget exit at wave 78; captures 0/6 | House-aware movement and capture actions missing from the driver |
| Dead Band | Death at wave 18 | Death at wave 18 | Suppression observed; refusal objective unexercised |
| Echo Canyon | Death at wave 16 | Death at wave 19 | Playbook/mirror objective unexercised |
| Relay Rush | Death at wave 18; deadline sites 1/3 | Death at wave 19; deadline sites 1/3 | Signal objective only partly exercised |

No native ride secured, banked and reloaded successfully. All fourteen source rides report zero console/page errors; compact records were independently compared with the retained raw records. The unchanged secure assertions fail honestly in all seven paired native commands. These task-authorized holds are not relabeled as passes. No additional native rides were taken during the drain; the task's ride limits remain intact.

## Evidence on the merged candidate

| Gate | Result | Receipt |
| --- | --- | --- |
| Policy, authoritative main board | CLEAR, rc 0 | `artifacts/s2715/policy.txt` |
| Fresh arena | `npm ci` rc 0; clean before merge | `artifacts/s2715/npm-ci.txt`, `arena-clean.txt` |
| TypeScript | PASS, 5.7 s | `artifacts/s2715/build-gates.txt` |
| Normal / E1 builds | PASS, 21.5 / 9.0 s | Same transcript |
| E1 entry payload | 34,350,664 B; below 52,000,000 B | `artifacts/s2715/payload.json` |
| Warmup | 1/1, 5.6 s | `artifacts/s2715/browser-gates.txt` |
| task-025, m1-01, m2-01 and plain boots | 42/42, both projects, 199.4 s | Same transcript |
| Six specs with flag unset | 12 skipped, rc 0 | Same transcript |
| Plain boots | Eight; zero console/page errors; no debug query | `artifacts/s2715/plain-boots.json`, `plain-boot-shots/` |
| Retained native evidence audit | 14/14 raw-row equivalence; ride limits and screenshots verified | `artifacts/s2715/native-evidence-audit.json` |
| Added source evidence | 2,658,831 B; below 25 MB task and 40 MB landing limits | `artifacts/s2715/evidence-budget-complete.json` |
| Diff-selected guards | 4/5 groups PASS; full Node child SIGTERM at outer 900 s limit; 903.6 s total | `artifacts/s2715/diff-guards.txt` |
| Partial Node record | 504 top-level pass records, no failing record, no final counts or chained tail | `artifacts/s2715/node-partial.tap`, `node-partial-summary.json` |
| Identity at handoff | Main/candidate/current pin all `2d180e6b…`; no pin made | `artifacts/s2715/engine-at-handoff.json` |

## Merge classification

Common ancestor `37062bef74ea586cb280ab8962826c6c786ac47f`; main base `f366a863b1bdbe5ba08a9d8f1eb398d3aba38566`. All 91 source paths are new: six spec files and 85 files under `artifacts/sol/play-proofs/run-13/`. No path overlaps newer main changes, no conflicts, no blob over 50 MB. Full per-file classification: `artifacts/s2715/classification.json`.

The scratch art-store link points to the already clean, detached worktree at landed store main `5793a967da46e8f00c0ba16f92f17dc10d36558d`; no art changed. No engine pin is authorized by this test-only diff. Final identity is measured after the remaining gates and any cure.

## Guard interruption

The prescribed diff wrapper terminated its Node child with SIGTERM at 900 seconds during the active fixture-teardown sweep. The wrapper result is rc 1; the partial TAP is not a complete gate. Child process samples show advancing fixture subjects, not a diagnosed hang. All named gate processes exited. This is the same outer-limit class preserved in `artifacts/s2709/report.md`; no timeout, test or assertion was changed. The remaining four guard groups passed, including power-budget p95 0.330 ms. The transcript retains the nonfatal Vite WebSocket-port warning as printed.

The source budget tool initially returned truncated JSON through a pipe; that unsuccessful receipt is preserved as `artifacts/s2715/evidence-budget-candidate.partial.txt`. Running with stdout directed to a file produced the complete, parsed rc-0 receipt.

## Findings and continuation

No proven map defect and no new F-PP9 finding. Follow-up ownership is QA/native movement, objective actions and survival strategy. The existing attended `sol-play-proofs-holds-1` owns the authorized driver follow-up after run 10; survival limits do not authorize balance edits. Its bounded allowance for additional instrument holds is decided from the completed campaign.

The next drain must finish the full Node command, preserve/control any actual red, synchronize newer main only after classifying it, then land with goal status/mergeHash and BACKLOG updates, push, and complete the required full Node gate on main. The done-move and goal remain open until then. Run 10 and holds-1 dispatch stay with the attended queue jobs.
