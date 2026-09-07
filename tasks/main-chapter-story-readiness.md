CODEX: model=gpt-5.6-sol effort=medium
# Task main-chapter-story-readiness: wait for the story reader before judging an empty queue (MAIN, prefix "test:")

FIRE-AUTHORED s2537, 2026-09-07. Implement one test-readiness corrective for F-2537-1 in the MAIN slot. Read AGENTS.md, `specs/story-spine/README.md`, STATUS verification lessons, `reviews/chapter-evidence-opt-in.md`, and the existing story-handle waits in these same six specs.

## Evidence and scope

The complete s2537 chapter run failed the mobile `The Claim cannot load Signal beats in Frontier` case at `e2e/ss-08-e7-beats.spec.ts:164`: expected `[]`, received `undefined`. The unchanged integration base passed a focused repeat. This is an observed readiness gap, not proof of a runtime regression. `src/main.ts` installs the story runtime in an unawaited dynamic import after the first frame; `StoryRuntime.installDebugHandle` publishes `__GR_STORY__`. Contract diagnostics becoming visible therefore does not establish that the story reader exists. All six Frontier exclusion cases make the same immediate optional read; their other epoch controls already wait explicitly for the handle.

1. Confirm the ordering from the current source and a bounded browser observation. Preserve the distinction between no story reader and a reader whose queue contains no later-epoch beats.
2. Reuse the existing `await page.waitForFunction(() => Boolean(window.__GR_STORY__))` pattern before the direct queue assertion in each of the six Frontier exclusion cases. Preserve the exact `[]` assertion, DOM absence assertion, error watch, and every other test. Do not coalesce `undefined` to `[]`, add fixed sleeps, raise timeouts, alter runtime startup, or introduce a helper/framework.
3. Run all six Frontier exclusion cases on desktop-chrome and mobile-chrome, one worker, `--trace=off`; repeat the E7 mobile case three times. Use the existing test titles to select exactly those cases and assert the collection count is twelve. Run tsc and build. No full browser or Node battery is needed for this implementer task. Record exact results and any failure under `artifacts/chapter-story-readiness/` (each file under 5 MB, no traces).

Touch ONLY `e2e/ss-06-e5-beats.spec.ts`, `e2e/ss-07-e6-beats.spec.ts`, `e2e/ss-08-e7-beats.spec.ts`, `e2e/ss-09-e8-beats.spec.ts`, `e2e/ss-10-e9-beats.spec.ts`, `e2e/ss-11-e10-beats.spec.ts`, and `artifacts/chapter-story-readiness/**`. The held evidence-path patch is separate: preserve whichever SHOTS declarations are on main at dispatch; do not copy anything from the lane or save branch. The M2 placement failure is a separate unresolved finding, F-2537-2, outside this task.

MAIN preflight: verify branch main and no foreign uncommitted src/e2e/scripts changes. List and preserve disjoint factory logs/artifacts. Never reset, switch branch, clean another tree, or edit STATUS, BACKLOG, goals, specs or reviews. A task already claimed by the runner is not revoked by a later FIRE lock. Use the repo's native Node version, your own checked-free port 5315 and private Vite optimizer cache; stop only your own server. No git commit on main; the fire drains the completed output.

End READY-FOR-GATES with exact base, counts, evidence paths and limitations. If no edits are justified, retain the measured reason first; no silent no-op.
