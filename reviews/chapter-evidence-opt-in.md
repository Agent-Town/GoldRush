# Chapter evidence opt-in — s2537 gate HOLD

## Slice, branch and tip

Master `tasks/lane-c-chapter-evidence-opt-in.md`; done-move `tasks/done/20260907-115228-lane-c-chapter-evidence-opt-in.md`; lane `feat/hero-move-verb`, tip `386e129f714e634d9a2a9a18f31f8afa9f08f0fd`, base `b10b52514cbf7e460f0f22f69bda3c376d21bf9a`. Current integration base `818223c97606423f0e08d2e95c7377ae5adc1302`; candidate `fee574e47be6eb813c73fecd4a5357e973a34a29` at `/private/tmp/gr-gate-s2537`, backed up to `origin/save/chapter-evidence-s2537`.

## Verdict

**HOLD — no implementation merged.** The complete chapter run returned one failure; adjacency returned three. Two are the already documented M1 debug-consent failures. The new E7 and M2 failures passed focused repeats on both unchanged base and candidate, which does not turn the failed complete runs green. Full Node verification on the newer grammar remains outstanding. Keep both original done-moves and lane tips; do not re-queue the evidence task or restore its obsolete ride recording.

## What it does

Seven existing writers use `test-results/evidence/` by default and their original retained paths only for literal `GR_REFRESH_EVIDENCE=1`. The candidate preserves main's newer four-test Moth program, order fixture and retained recording. No gameplay, assertion, dependency or art change is included.

The earlier runner refresh (`253927e1f` introduced the original retained recording) changed 93 trace rows to 94 and hash `e16244f9` to `5872d6c4`; that history is retained verbatim in `artifacts/s2536-fire/runner-report.md`. The later grammar changed the program and recording. On today's candidate, ordinary and explicit writer runs both produce 138 rows, terminal lamp dark, hash `fnv1a32:f7af6739`, byte-identical to today's retained file. No historical hash was chased.

## Evidence

| Check | Result |
| --- | --- |
| TypeScript / build | PASS, 5.7 / 31.9 s |
| Complete Moth test file | 4/4 PASS, 71.7 s |
| Ordinary and explicit Moth writer | 1/1 each, 12.7 s each; identical scratch/retained bytes |
| Six chapter suites, both projects | 67/68, 1313.0 s, rc 1; new E7 mobile failure below |
| task-025 / M1 / M2, both projects | 29/32, 143.9 s, rc 1; two known M1 failures and new M2 failure |
| E7 mobile focused controls | Unchanged base 1/1 (8.8 s); candidate 1/1 (7.7 s) |
| M2 desktop focused controls | Unchanged base 1/1 (4.8 s); candidate 1/1 (3.3 s) |
| Plain boot desktop / 390px | 2/2 PASS, 8.4 s; zero console warnings/errors and page errors |
| Power / citations / gate callers | PASS; power p95 0.341 ms against 0.500 ms |
| Evidence preservation | All 50 scratch chapter PNGs observed; all 50 retained PNGs plus the retained Moth JSON stayed byte-identical |
| Full Node battery | Not rerun on this candidate; still required. Prior s2536's 734 pass / 2 fail / 5 skip is historical, not a verdict on this tree |

Receipts: `artifacts/s2537-fire/preflight.log`, `artifacts/s2537-fire/browser.log`, `artifacts/s2537-fire/base-controls.log`, `artifacts/s2537-fire/followups.log`, `artifacts/s2537-fire/retained-before.json`, `artifacts/s2537-fire/retained-after-browser.json`, `artifacts/s2537-fire/scratch-observed-during-chapters.json`, `artifacts/s2537-fire/moth-preservation.json`. The successful chapter error watches reported zero suppressed GLTF errors; the failing assertion ran before its final error-watch assertion, so no global zero-error claim is made for that failed case. Adjacent failure images and context are retained under `artifacts/s2537-fire/browser-evidence/`; the first chapter failure image was cleared by the subsequent Playwright invocation, while its full stack remains in the transcript.

## Merge classification

`artifacts/s2537-fire/classification.json` records all nine lane paths. Six chapter files are LANE-TOUCHED only: apply their one output-path substitution. Moth test and JSON are MAIN-MOVED too: preserve main's program and JSON, graft only the writer's directory selection and argument. The runner report is NEW, already retained verbatim by s2536. The candidate changes seven files, 9 insertions / 8 deletions. Integration and controls never placed the undecided code on main. The only remaining candidate setup dirt is its dependency symlink and untracked guard statistics; generated adjacent screenshots were copied to the fire's evidence and restored in the private candidate.

## Findings and next action

- **F-2537-1 — story reader readiness:** E7 mobile, `The Claim cannot load Signal beats in Frontier`, `e2e/ss-08-e7-beats.spec.ts:164`, expected `[]`, received `undefined`. NOT-IN-INVENTORY; snapshot is 27 days old. The same immediate optional read appears in all six Frontier exclusion cases. `src/main.ts` imports story asynchronously after the first frame; `StoryRuntime.installDebugHandle` publishes the reader separately from contract diagnostics. This supports a readiness-gap diagnosis, not a proved runtime regression. Registered corrective `tasks/main-chapter-story-readiness.md` reuses the explicit readiness wait already used by the neighboring epoch cases, keeping the absence assertion strict.
- **F-2537-2 — unresolved M2 placement:** desktop, `palisade footprint rejects overlap while allowing edge-touch chaining`, `placeSelected` at `e2e/m2-01-build-menu.spec.ts:87`, called from line 197: expected count 2, received 1 after 5000 ms. Both focused controls passed; cause is unproven. Do not weaken the assertion, increase its budget or call the full run green. Classify this before a drain can pass.
- **F-2533-1 — known M1:** the T-spawn positive case fails on both projects because it does not opt into debug. The separate completed `lane-a-m1-debug-spawn-contract` remains undrained.
- **F-2536-1 — full gate still owed:** prior Node failures passed focused repeats but their full-suite cause was not established. Run the full native battery alone after checking current-base validity; do not transfer old runtime gates across the grammar change.

Next fire: drain the readiness corrective when the runner finishes, classify M2, then re-integrate/gate the held writer patch on the verified current tree. `artifacts/s2537-fire/resume.md` retains the exact candidate and full-Node command. No owner approval is needed for these gate-side obligations.
