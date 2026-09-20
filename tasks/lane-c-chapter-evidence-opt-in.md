CODEX: model=gpt-5.6-sol effort=medium
# Task lane-c-chapter-evidence-opt-in: chapter and Moth Season tests preserve retained evidence unless explicitly refreshed (LANE-C, commit prefix "test:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c` (currently branch `feat/hero-move-verb`; verify the live mapping, never assume `lane/c`).
READ FIRST: AGENTS.md; `reviews/portraits-era-aging-2-batch.md` findings F-AGE2-3 and F-AGE2-5; `tasks/spec-hygiene-batch.md` and its landed pattern in `e2e/contract-briefings.spec.ts` and `scripts/board-tape-gold.test.mjs`; `specs/story-spine/README.md` Laws; `specs/epoch-saga/CAPABILITY-LADDER.md` section 3 L4 and section 4 S6; `specs/epoch-saga/e3-voltage-bundle.md` section B; STATUS.md verification lessons before testing.
Sequencing: verify `192ef98e208dc24a3eceb707001ae1829d345dc2` and `8480f7624cad832e084c14137cdf7dd62bfb8319` are ancestors of main. Missing dependency: STOP and report, never recreate it.

Pre-flight (LANE-SAFETY, drain-gated): resolve this slot with `git worktree list`; `main..HEAD` must be empty before any refresh. An ahead commit, undrained done-move, changed branch or uncommitted source you did not make means STOP and report. No reset, branch replacement or `git clean`. If clean and behind, use `git merge --ff-only main`. **FACTORY-CHURN EXCEPTION (F-1407-1):** `logs/**`, `artifacts/**`, `reviews/shots-*` and `.png` may contain routine generated evidence; list it, preserve it and proceed only if disjoint from this task's seven writers and retained output paths. Never discard another run's evidence. Unknown tracked dirt in `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**` or `reviews/*.md` still STOPs. Run `npm ci`, then `npm run build` before editing; record `git status --short` and the base hash.

## Why (attended findings, verified on main 2026-09-07 by s2531)

The attended review names F-AGE2-3: "rewrites a tracked ride artifact stale since" the headless tick-order correction. `scripts/moth-season-pressure.test.mjs` unconditionally writes its floor ride after the existing corridor assertions. The same review names F-AGE2-5: six chapter specs rewrite 48 tracked screenshots per run. Each has one `SHOTS` constant and one screenshot helper. The previous hygiene slice already provides the explicit `GR_REFRESH_EVIDENCE=1` convention; reuse it without a new helper or dependency.

## Scope

1. In `e2e/ss-06-e5-beats.spec.ts`, `e2e/ss-07-e6-beats.spec.ts`, `e2e/ss-08-e7-beats.spec.ts`, `e2e/ss-09-e8-beats.spec.ts`, `e2e/ss-10-e9-beats.spec.ts` and `e2e/ss-11-e10-beats.spec.ts`, route each existing screenshot helper to `test-results/evidence/<existing shots directory basename>/` by default. Only the literal `GR_REFRESH_EVIDENCE=1` selects its existing `reviews/shots-ss-*` directory. Keep screenshot names, options, calls, assertions and triggers unchanged. Do not refresh the 48 retained PNGs in this task.
2. Apply the same opt-in to the existing ride writer in `scripts/moth-season-pressure.test.mjs`: default `test-results/evidence/e3-moth-season/`, explicit refresh its existing `artifacts/e3-moth-season/` path. Keep the ride, seed, event trace, assertions, test registration and `GR_GUARD_NO_ARTIFACT` behavior (if present at dispatch) unchanged.
3. Once, run that existing Moth Season test with the explicit refresh flag to update `artifacts/e3-moth-season/ride-e3-moth-season-01.json`. Record the old/new eventLogHash, trace row counts, base commit and current engine-era pin in `artifacts/chapter-evidence-opt-in/report.md`. Attribute the original drift to `213fbc676` using the review and git diff. The review's measured `e16244f9` to `5872d6c4` is historical evidence, not a new assertion: measure today's result and explain any difference; never alter simulation code to recover an old hash.

## Firewall

Touch ONLY: the seven test files above; the single retained Moth Season JSON in scope 3; `artifacts/chapter-evidence-opt-in/**` for the report and bounded logs. NO changes to sim semantics, `src/**`, assets, engine-era pins, test assertions or registered test titles, other test files, retained chapter PNGs, package/config/ignore files, STATUS.md, specs, BACKLOG or goals. The author handles task bookkeeping; the drain handles integration. Concurrent `rider-parity-grammar` belongs to the attended session.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` and `npm run build` green. Run `node --test scripts/moth-season-pressure.test.mjs` without the refresh flag: all existing tests pass and its retained JSON stays byte-identical. Run the explicit refresh once, then the plain test again and prove that the refreshed file remains byte-identical. Retain before/after hashes and both mode verdicts.
- Run the six named chapter specs on desktop-chrome and mobile-chrome, one worker, `--trace=off`, against your own server on port 5313 with `GR_CAPTURE_BASE_URL=http://127.0.0.1:5313` and `GR_CAPTURE_EXTERNAL_SERVER=1`. Start and stop only your own server PID. Zero console/page errors. Compare the tracked screenshot bytes before/after the plain run; all 48 must remain unchanged while new scratch screenshots exist. Also inspect every opt-in branch to confirm it preserves the original path. Do not add duplicate tests for the ternaries or run the full browser/node batteries.
- Evidence logs under `artifacts/chapter-evidence-opt-in/`, no file over 5 MB; no traces or browser profiles. If a pre-existing test fails, record its exact title and `node scripts/red-inventory-lookup.mjs <spec>` result; do not weaken assertions or cross the firewall.

End: READY-FOR-GATES with the seven-writer count, default-run cleanliness, explicit-refresh result, tests and provenance. If already fixed at dispatch, report the proving commits and exit without reimplementing. If exiting without changes for any other reason, write why into the report first.
