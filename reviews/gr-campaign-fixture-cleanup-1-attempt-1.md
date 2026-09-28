# Campaign fixture cleanup — attempt 1 stopped at a cross-lane preflight

Verdict: STOPPED, not an implementation landing. Reviewed by s2718 on 2026-09-27 UTC.

Task: `gr-campaign-fixture-cleanup-1`. Lane: `sol/open-findings-astra`.
Tip: `36d3905f6d8c3d1cabe373b83ce9ca27f229e5ae`.
Source base: `6974a5cc7900bf11e499d087a2bd463c59d0a4b9`.

WHY NO PRODUCT MERGE: the implementer stopped before changing either test script. The master incorrectly checked lane-c while assigning lane-a. Run 10 was legitimately modifying lane-c's lockfile. The attended session corrected the coordinates and prepared attempt 2; the fire closes the old board entry without claiming the corrective shipped.

| Verification | Result |
| --- | --- |
| Strict drain policy | CLEAR, exit 0; goal queued |
| Ahead commits | One, the report-only tip above |
| Diff from merge base | Four new `artifacts/gr-campaign-fixture-cleanup-1/` paths; no scripts, runtime, dependency or assertion edits |
| Source report | 36 lines; three companion receipt files are empty in the commit, so they do not independently prove the reported lockfile deletion count |
| Durable salvage | Local and origin `save/gr-campaign-fixture-cleanup-1-attempt-1` both resolve to the full tip above |
| Done-move disposition | Renamed `stopped-s2718-20260928-013750-gr-campaign-fixture-cleanup-1.md` |
| Goal disposition | Remains queued for attended attempt 2; no mergeHash because no implementation merged |

The original report and current receipts are preserved under `artifacts/s2718/`. The run log is `tasks/runs/20260928-013750-lane-a-gr-campaign-fixture-cleanup-1.md.log` (47,825 reported tokens, rc 0 with a preflight stop). Its install/build claim is inherited run evidence, not a fresh fire build. No gameplay change exists to gate or deploy; no browser, full Node or engine-pin claim is made for this bookkeeping closure. The ledger battery runs after this review and its ledger row are written; its exact result is recorded in `artifacts/s2718/report.md` before lock clearance.

Merge classification: all four source paths are NEW evidence. None is integrated into its original destination, where attempt 2 will write its own report. The original commit remains on its salvage ref; its report is copied to `artifacts/s2718/stopped-report.md` for direct review. There are no conflicts to resolve and no lane reset by this fire.

F-ATT-10 already records the root cause and the attended guard follow-up. F-2717-1 remains open for the actual cleanup and nested diagnostic changes. The corrected master retains every semantic assertion and timeout, with failure-injection and full Node checks still owed. The fire neither dispatches nor re-queues under CODEX-WALL.
