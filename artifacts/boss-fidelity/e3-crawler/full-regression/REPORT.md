# E3 full regression evidence

Status: full default collection, direct serial controls, and complete infrastructure recovery finished. Source freeze released at 2026-09-08 10:53 UTC after all output restoration and hash verification. No tests, source, assets, pins, or tolerances were edited by this runner. Verification used the recorded working-tree hashes against base `d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d (archive: pruned by the A3 rewrite)`.

The full run is red. After replacing only the exactly selected outage executions with their completed recovery results, latest coverage is **2,819 passed, 331 failed, 198 skipped**. This is combined coverage, not a single green full run. Remaining failures are not all demonstrated pre-existing; unresolved mechanisms and mixed outcomes below are preserved as such. Exact residual identities/errors are in `remaining-failures-after-recovery.json`.

## Completed collection

The full unchanged default collection contains 3,348 tests across 462 files: 1,670 desktop Chrome, 1,670 mobile Chrome, and 8 desktop WebKit entries. The completed two-worker attempt ran from 2026-09-08 06:59:59 UTC to 09:48:51 UTC: **2,599 passed, 551 failed, 198 skipped**, no flaky results, no global runner errors, Playwright exit 1. Raw verdicts remain unchanged in `attempt-2-workers2/results.json`; exact failed test identities, assertions, timestamps, and attachments are in `attempt-2-workers2/failed-tests.json`.

The earlier six-worker attempt was explicitly interrupted after host contention made it unsuitable: 440 passed, 135 failed, 5 interrupted, 10 skipped, 2,758 not run. It is not a completed regression. Its logs, JSON, traces, host ownership receipts, and output bank remain in this directory. No unrelated process was interrupted.

## Infrastructure interruption and required recovery

The original external Vite server disappeared during the completed collection. Connection refusal and absence of a port listener were directly verified. A replacement server serving the same frozen files was ready on 127.0.0.1:5246 in 110 ms. The original process exit/cause remains unknown; no model, OOM, or external-process cause is inferred.

The conservative recovery window is 07:58:23.981–08:04:13.935 UTC. Selection includes every execution overlapping the earliest explicit refusal start through the confirmed healthy receipt, plus every explicit refusal: **345 tests**, consisting of 241 raw failures, 59 raw passes, and 45 skipped entries. Of these, 231 executions explicitly report connection refusal. Both collection preflight and final JSON reconciliation confirm exactly all 345 selected identities, zero missing and zero additional. See `attempt-2-workers2/outage-recovery-selection.json`, `outage-recovery-coverage-preflight.json`, and `recovery-reconciliation.json`.

The exact 345-test recovery ran 10:06:38–10:52:01 UTC with one worker, PID 50436, on unchanged source at port 5246: **279 passed, 21 failed, 45 skipped**, exit 1. It recovered 220 original failures; all 59 original passes and 45 skips kept their outcomes. Its command, log, final JSON, and restoration receipt are under `outage-recovery-workers1/`. `RECOVERY-FAILURES.md` lists all 21 remaining recovery failures with their exact location and first error. No connection refusal recurred. Host activity from unrelated simulator processes is recorded; timing assertions are not treated as isolated machine benchmarks.

Replacement Vite output is retained in `attempt-2-workers2/replacement-vite.log`. One tool-returned log chunk was truncated; the saved log explicitly marks that limitation. Per-test traces and full Playwright logs are separate and retained.

## Boss and changed-path results

Final full-run JSON confirms both projects passed all 22 main Baron cases, 12 Canyon/Crawler encounter cases, 8 Railcar model lifecycle cases, 4 Railcar presentation cases, and 2 shared boss healthbar cases. The Crawler LITE and invalid-byte cases also passed in both projects.

Crawler exact renderer counts failed both projects: cold textures expected 32 versus actual 33 on desktop, 30 versus 31 on mobile. The unchanged serial control reproduced both failures. Desktop trace counts are uniformly one texture above pins across all five phases; every allocation/disposal delta and nontexture metric passes its existing pin or band. Cold sampling precedes the first Crawler asset request. The trace cannot identify texture ownership.

Root's matched resource census identifies the extra texture as the existing GeneratedHeroHomesteader atlas, with its original map retained. Verified HEAD starts at 32 and changes to 33 after one explicit normal 1/30-second simulation tick; geometry stays at 81, no Crawler asset is requested, and no errors occur. Served animation modules/contracts match between arms. This demonstrates an existing atlas-application timing dependency in the absolute cold pin, not an observed Crawler model leak. The census is identity evidence rather than a gate because instrumentation and the explicit step affect timing. Raw exact-count failures and exact pins remain unchanged. See `../cold-texture-census-comparison/conclusion.md` and `resource-transition.json` for root's complete analysis.

The older Baron southwest direction test failed on desktop and passed on mobile in the full run. Its unchanged desktop serial control reproduces the same timeout. Relevant sprite, animator, orientation, spawn, and teleport blocks match HEAD; the failure trace does not expose which predicate conjunct fails. The same unchanged desktop test passes against the fully verified isolated HEAD browser runtime (10.34 seconds). A bounded instrumented current run also passes: 37.5 ms after spawn/teleport, all three original predicate conjuncts are true, all eight southwest row requests return 200, props are ready, and no errors occur. The prior current failure remains unexplained; an instrumented pass does not prove flakiness or exonerate the current changes. Exact run identities and observations are in `triage/baseline-control/head-direction-control/` and `triage/baron-direction-observation/`.

All eight desktop fixed-step tests were in the server outage window and passed in recovery, including Baron ceremony cadence. The 30/60/144 fps arms produce the same 300-tick economy hash `fnv1a32:0f6f2150`, with seven events. Their mobile counterparts passed in the full run. Baron gait/stride also passes recovery. These results are confirmed from final JSON, not inferred from progress headers.

## Bounded failure mechanisms

Read-only evidence under `triage/` distinguishes observed mechanisms from unexecuted baseline claims:

- Replay fixtures contain retired MOVE_TO/HOLD verbs and are rejected before simulation composition. E3 Moth parity specifically stops at malformed-tape admission before comparing engines.
- E3 census asserts CONNECT by wave 6 while the unchanged contract specifies wave 8. The test, contract, and metadata builder match HEAD.
- E2 roster determinism changes balances while realtime simulation is running, then enables manual stepping without clearing prior enemies. Trace snapshots differ after unequal setup windows. Test and stepping paths match HEAD; this E2 contract does not enable changed Crawler night movement.
- Multiplayer balance harness passes repeated-run equality, then differs from its saved report only in balanceFingerprint and enclosing stableHash. Its independent stationary-rider model never invokes changed headless/Crawler movement. Test, model, dependencies, and fixture match HEAD.
- CP04 compares a staged charter name to a canonical Baron name. Unchanged locked-launch clearing is a supported static path; the clearing branch was not captured in the trace.
- Canyon escort sabotage spawns a generic harness wrecker, rather than the inspected fevered-saboteur roster variant. The expected rim hit is absent. Its contact/target/spawn blocks match HEAD and the generic enemy cannot enter the new Crawler variant speed override; the missing hit remains unexplained.
- Shared-atlas production lifecycle fails before loading or disposal: historical census paths end `diet-a9d5c9a0`, while current and HEAD fingerprint inputs produce `1408f6b4`. All five counterpart GLB images exactly match the census image hashes and byte sizes. The three separate residency/dedupe cases pass recovery; no resource-lifetime assertion is reached by the stale filename case.

These observations do not constitute a complete clean-base rerun. Unrelated failures are retained precisely without out-of-scope fixes or relaxed assertions.

## Output preservation

The full attempt preserved and restored 1,314 changed tracked historical outputs and moved 40 new outputs into its evidence bank. Serial Crawler preserved/restored 8 outputs; serial Baron restored 1; outage recovery preserved/restored 134. Every restoration rehashed tracked non-output source/assets: zero changes from the frozen manifest. All four intentional Crawler/Railcar count JSON files remain at their pre-run hashes. Boss evidence and isolated E4 candidate paths are excluded from restoration.

Run-local `restoration.json`, `changed-outputs.json`, `before-status.porcelain`, and `after-restoration.porcelain` are the authoritative receipts. Source files are never restored by the output finalizer; any discrepancy would be reported instead.

All test/browser processes are terminal. Isolated HEAD Vite PID 30544 was gracefully closed with its shutdown receipt preserved. Current-source Vite PID 97589 on port 5246 remains available to the root task; no further runtime work is planned by this runner.
