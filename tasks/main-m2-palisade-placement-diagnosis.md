CODEX: model=gpt-5.6-sol effort=medium
# Task main-m2-palisade-placement-diagnosis: classify intermittent edge-touch placement (MAIN, prefix "test:")

FIRE-AUTHORED s2538, 2026-09-07. One bounded diagnostic and, only if demonstrated, test-readiness correction for F-2537-2. Read AGENTS.md, STATUS verification lessons, `reviews/main-chapter-story-readiness.md`, and the existing M2 placement helper and its callers before editing.

## Evidence and acceptance

The unchanged M2 footprint case intermittently fails at its second accepted placement: `placeSelected` expects buildable count 2 and receives 1 after 5000 ms. The s2537 complete adjacent run failed on desktop. The s2538 complete adjacent run failed on mobile; its complete unchanged-base control passed both M2 cases. Both runs reproduced the separate M1 debug-consent failures. Focused greens do not explain the M2 failure. Receipts are `artifacts/s2538-fire/browser-gates.log`, `artifacts/s2538-fire/base-controls.log`, and `artifacts/s2538-fire/base-control-state.json`.

1. Trace the existing test's teleport, rejected Enter pair, ghost publication, accepted Enter and build-count observation through their actual readers/writers. Use bounded temporary diagnostics to record frame, ghost validity/position, selected buildable, relevant input state, build count and gold around the failing second placement. Do not assume the defect is readiness rather than a real placement rule.
2. If a test-readiness defect is proved, fix it in the existing M2 helper/case with the smallest predicate for the actual precondition. Preserve exact count 2, gold 30, rejected overlap, valid edge-touch, error assertions and all placement/runtime rules. Demonstrate the missing precondition with a controlled failing arrangement, then show the corrected arrangement succeeds. Never turn a repeat-until-green run into a cure claim.
3. If the evidence instead requires a runtime change, retain the trace, exact source boundary and proposed next slice; leave runtime and test assertions untouched. A diagnostic report with a proven cause is a valid result. No speculative test edit.
4. Run the complete M2 suite on desktop-chrome and mobile-chrome, one worker, trace off; then one complete adjacent set (task-025, M1, M2) on both projects. Keep initial failures and final exit codes. Run typecheck/build if code changes. No full Node battery is required for an e2e-only result. Report cause, controls, counts, commands and remaining uncertainty under `artifacts/m2-palisade-placement-diagnosis/`; every file below 5 MB, no video/traces.

Touch ONLY `e2e/m2-01-build-menu.spec.ts` and `artifacts/m2-palisade-placement-diagnosis/**`. No runtime, physics, balance, timer, global timeout, screenshot-path, M1, chapter or fixture changes. Do not copy the held chapter waits or writer patch into main.

MAIN preflight: verify branch main and no foreign uncommitted src/e2e/scripts changes. Preserve disjoint factory logs/artifacts. Never reset, switch branch, clean another tree, commit, or edit STATUS, BACKLOG, goals, specs or reviews. An already-claimed task is not revoked by a later FIRE lock. Use `.nvmrc` Node 26.4.0 explicitly, a checked-free own port 5317 and private Vite cache; stop only your own server. Do not trust the runner's inherited Node version.

End READY-FOR-GATES with exact base, evidence, outcome and limitations. Retain evidence even if no edit is justified; no silent no-op.
