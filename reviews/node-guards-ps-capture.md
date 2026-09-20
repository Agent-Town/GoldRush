# s2548 — Bounded process capture drained

**Slice/branch/tip:** `lane-a-node-guards-ps-capture.md`, `feat/e10s-4-door`, `57678b024`. **Merge:** `ba5b03ebec07e45efd5c03cf6aace0d9546346a8`. **Verdict: ACCEPTED with one reproduced, unchanged-base failure (F-2541-1); the full battery is not green.**

Both readers retain complete process output up to a finite 64 MiB ceiling. The existing test uses a 1,200,009-byte fixture and the real invocation classifier. Ordinary silence, sibling counts, wrapper collapse, missing-pgrep behavior, and child failure propagation remain checked. No runtime, selector, deadline, or dependency changes.

| Gate | Result |
|---|---|
| Focused contention | 1/1, 2.5 s; full-battery instance also passes |
| TypeScript / build | rc 0, 4.7 / 19.3 s |
| Full Node 26.4.0, alone | 742 tests: 736 pass, 1 fail, 5 skipped, 0 cancelled; 922.0 s; zero ENOBUFS |
| Known failure control | Unchanged-base sources: 0/3 gold positive reels, same malformed-tape refusal |
| Fixture sweep | 20/128 visited; stopped at board-gold; remaining 108 unvisited |
| Remaining diff guards | 4/4: power p95 0.322 ms, task, citations, callers |
| Suppressed npm tail | All six commands separately completed at rc 0; desk leg explicitly SKIP during ACTIVE, to be evaluated at closing |
| Mutation evidence | Runner removed each capture limit independently: ENOBUFS / missing stamps both red, restored cure green |

Evidence: `artifacts/s2548-fire/capture-gates.txt`, `artifacts/s2548-fire/base-control.txt`, `artifacts/s2548-fire/followups.txt`, `artifacts/s2548-fire/fixture-owner-visited.txt`, `artifacts/node-guards-ps-capture/mutation-red.txt`, and `artifacts/s2548-fire/report.md`. The task explicitly waives browser/screenshot work for this process-output change.

Classification base `79893026b`; detached candidate `3cd596ef62cbbf6b2b9bb173ef4ee483e29f2304`. Both source paths are LANE-TOUCHED only: `scripts/run-node-guards.mjs` and `scripts/node-guards-contention.test.mjs`. All ten incoming artifacts are NEW. Each path and blob is recorded in `artifacts/s2548-fire/classification.json`; no conflict resolution was needed. Gates ran on clean detached sources. The atomic main merge used the FIRE §2A coexistence exception: disjoint factory logs and the completed MAIN gold source were left untouched, with all 13 gold source/evidence blobs verified before and after. No staged merge was left on main.

**F-2546-1 closed.** **F-2541-1 remains open:** fixture-teardown line 40 receives the board-gold child's three malformed-tape failures at line 330. Current unchanged-base control reproduces all three; this exact known-red is the drain skill's explicit proceed case. The already-finished MAIN corrective is preserved on `save/board-gold-current-grammar-s2547`; drain it next, then the separate chapter candidate. No new failure or owner fork was found. The buffer is bounded, not unlimited.

---

Historical diagnosis follows unchanged; its pending wording describes s2546.

# Node guard process capture — F-2546-1

Measured 2026-09-07 by s2546 on main 6e9e2f984; corrective authored, not implemented.

The quiet-board test and the real Node guard launcher both capture matching process command lines with spawnSync ps and no explicit maxBuffer. A large observer is collected before the correct shared invocation classifier can reject it. The test fails loudly with ENOBUFS; the launcher treats capture failure as advisory and drops its contention stamp.

The prior MAIN terminal snapshot (`artifacts/s2545-fire/main-node-terminal-observed.txt`, SHA256 187e3855358cbebf2deb21d0004a7182d4da02b457e98cb462ff26e3452a0099) reports 742 tests, 735 pass, two ENOBUFS failures, five skips, 1623.300 seconds. The fixture sweep stopped on its failing child; its title does not establish all subjects ran and the npm chained tail did not execute. This is neither a gold-runtime regression nor evidence of actual concurrent batteries.

`artifacts/s2546-fire/ps-capture-probe.mjs` extracts both current functions and uses PATH-local fake processes. Re-run from the repo root at 6e9e2f984 or e464d9d98 with native Node 26; this baseline reproduction is expected to change after the cure. It writes `ps-capture-probe.json`: eight short/long × original/64-MiB × quiet/stamp observations. At 1,200,000 observer characters, original capture fails quiet and returns NO_STAMP; the bounded option restores QUIET and CONTENDED — 2. Short controls are unchanged. The quiet arm fixes classification false to isolate capture; the advisory arm imports the real classifier and includes a true sibling. No real battery or large-argv process is started. This probe is evidence, not the final regression suite; the corrective requires the real classifier in its persistent check.

The live census in `process-capture.json` was only 8,926 bytes; it did not reproduce the historical overflow or identify its producer. The failure mechanism is reproduced, the historical producer is unknown. Raw argv was not retained.

Corrective: `tasks/lane-a-node-guards-ps-capture.md`, lane-a, both capture sites plus a regression in the existing test. No simulation, buffer-policy framework, battery serialization, or deadline change. The fix remains pending and has a finite capture ceiling. Dispatch only after MAIN's current full Node battery exits; do not touch or redispatch MAIN's owned gold files or the held chapter patch.

MAIN terminal run observed at 22:44:57 local: 742 tests, 735 pass, two ENOBUFS failures, five skips, 1698.991 seconds; the fixture sweep stopped at contention and the chained tail did not run. `artifacts/s2546-fire/main-node-terminal.json` records SHA256 07003cc2d28c12264920407237219c7a6b1a731ff0d6b7961eaa3ec9d7aa3c16.

A separate parent-context hypothesis was tested after that group exited. The same unchanged contention test passed direct, then passed its quiet wait under the launcher but failed its expected-two-stamps assertion (null). `contention-parent-context.json`, `contention-direct.txt`, and `contention-under-harness.txt` retain the observations. The diagnostic script itself exits 1 because its prediction that only the parent would be present was wrong: the test had advanced into its own sibling fixture. This refutes the claimed parent-quiet mechanism. The missed-stamp cause is unresolved; no new finding or cure is inferred from it. No child from either observation remained afterwards.
