# Deploy budget — readiness HOLD, preserved for corrective

The hardening is not merged. Its focused guard passes, but the release probe has no successful production measurement and the full Node battery did not finish. This is a gate-side readiness hold, not an owner fork or a finding that the new fail-closed branch is wrong.

The main-slot done-move is retained as `tasks/done/rejected-20260905-103054-deploy-budget-hard-verdict.md` after this hold. The runner's report is in the matching main run log; its four output paths are preserved verbatim at `save/deploy-budget-hard-verdict-s2518`, commit `36176d1ca93701e2f6ceb0d3d9f52df79e164443`, pushed to origin. The save commit adds only those paths over `295740553`. The temporary-index save left main's index and working tree unchanged. Before restoring the four paths to HEAD, their SHA-256 values were checked against `artifacts/s2518-fire/deploy-salvage.json`; other working-tree dirt was left alone.

## F-2518-1 — the deploy contract fixture cannot reach its own assertions

`scripts/test-deploy-contract.sh` stubs npm to return success without a budget line or per-file report. On both the proposed deploy script and unchanged HEAD, the first case prints `strict-skip: expected rc 2, got 5`. This is an inherited fixture defect, independently reproduced on a temporary copy of HEAD. The control supplied refusing ssh/rsync stubs, so even unexpected progress could not reach those external services. Preserve all existing deploy, alias and strict-mode assertions while giving the fixture a valid under-budget measurement and fully isolating publication.

Evidence: `artifacts/s2518-fire/deploy-budget-checks.txt`, `artifacts/s2518-fire/deploy-contract-control.txt`.

## F-2518-2 — release readiness still needs a production-compatible probe

The runner's real E1 dry run built `af0425c6`, then exited 5 with `Budget: FAIL (probe rc=1; measured projects=1; report failures=0)`. Mobile measured 17,365,554 / 25,000,000 bytes; that one under-budget number is not a passing two-project probe. The runner reported a missed transient town cue on desktop and a missing Claim cue on mobile. Reading the selected test confirms that it combines town measurement with a `/?debug&era=1&contract=the-claim` entry, while `src/main.ts` strips debug in E1 releases. That source dependency explains the mobile report; this fire did not repeat the costly production browser run while other lanes were gating.

The deploy needs a production-compatible town measurement, separated from debug-only claim-cue coverage, with existing cue-window semantics and the 25 MB boundary unchanged. F-1625-4's choice of measurement quantity remains the owner's. Do not switch to settled bytes, waive a failed probe, weaken cue behavior, or pretend desktop Chromium proves a physical iPhone verdict.

Evidence: `artifacts/s2518-fire/runner-dry-run.txt`; the original run log retains the detailed browser and full-battery report. The runner's full Node attempt reported 654 tests, 633 passed, 15 failed and 6 cancelled before interruption; it is INCONCLUSIVE, never green. Its independent review reported no actionable implementation defects.

## Disposition

Fresh fire verification on Node 26.4.0: new deploy guard 13/13 passed, shell syntax passed, existing deploy contract failed exactly as unchanged HEAD. No build, full regression, release PASS or public deployment is claimed by this fire. Main's original four output paths were restored only after the salvage ref was pushed. The successor `tasks/deploy-budget-production-probe.md` re-lands that exact diff and repairs the two verification gaps before another drain. The original goal is superseded by that registered corrective, with the gate-side reason retained. Archive the save branch only after the successor merges.
