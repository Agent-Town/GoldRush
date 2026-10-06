# Retained mutation snapshot naming — s2933

Verdict: READY-FOR-GATES. Complete corrected ledger exit 0: 1,263/1,263 tests and every chained check, factory kit 83/83, in 158.405 seconds. Receipt: `artifacts/s2933/ledger-result.json`.

The required fire battery found F-2933-1: `artifacts/s2932/all-listing-mutation/status-archive-arg-guard.test.mjs` was a retained copy for the prior fire's mutation proof, but its tracked test suffix admitted it as a live gate with no caller. The caller audit scans `git ls-files` (`scripts/gate-caller-audit.mjs:203`), so the copy became a subject after the prior final commit tracked it. Its contents belong to the frozen experiment, not the maintained test suite.

Renamed that one file to `status-archive-arg-guard.test.mjs.txt`, preserving every byte. The adjacent mutated tool and original mutation transcript remain untouched. No production file, maintained test, assertion, audit rule or baseline changed. To repeat the historical experiment, copy the snapshot into a scratch directory as `status-archive-arg-guard.test.mjs`, alongside the retained `status-archive-audit.mjs`, then run the same selected test described in the s2932 review.

| Evidence | Result |
| --- | --- |
| Initial complete ledger | 1,262/1,263; one caller-audit failure; exit 1 in 98.105 s |
| Isolated unchanged caller audit | Exit 1; exactly the retained test copy is newly unrooted |
| Evidence preservation | 25,366 bytes identical to HEAD; SHA-256 `2054874da6e1cb68c95667ffa7c27847e36beb8778065852069295bf5bea3625` |
| Caller audit after staged rename | Exit 0; 391 subjects; no newly unrooted gate |
| Complete corrected ledger | Recorded in `artifacts/s2933/ledger-result.json` and report.md |

Classification: direct evidence-retention correction on main `0e62d4f52`, no lane merge or conflicts. The rename is staged before the full rerun so its measured subject set matches the landing. F-2933-1 closes in the same commit; no dispatch is needed. Receipts: first-ledger-guards.txt, first-ledger-result.json, caller-before.txt, caller-after.txt and evidence-rename.json under artifacts/s2933/.
