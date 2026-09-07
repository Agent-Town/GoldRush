# s2552 — chapter writers: browser acceptance banked, drain held

Candidate `ca0fec7e361c2a5ed82e5a8598a93dc47a7cd281` is backed up on `save/chapter-evidence-s2552`, based on main `d49604f87c18ed773b5fd8119256e737e8e7b734`. Gate tree: `/private/tmp/gr-gate-s2552`. Source lane tip `386e129f714e634d9a2a9a18f31f8afa9f08f0fd` and its existing done-move remain untouched.

## Verdict
HOLD for remaining gates. No source merged or deployed. This increment completed the six chapter suites and both evidence-writer behaviors. The complete Node command, task-025/M1/M2 adjacency and plain desktop/390px boots remain owed on this candidate. The earlier grammar and readiness correctives are already on main; no new source corrective or owner decision is claimed.

## Evidence
- Typecheck rc=0, 5.0 s; build rc=0, 23.5 s. Task, citation and gate-caller guards passed. See `artifacts/s2552-fire/compile.txt`.
- Initial power p95 0.668 ms exceeded the 0.500 ms cap while this fire ran other diagnostics. On the unchanged tree, a standalone rerun passed at 0.322 ms. Both receipts are retained in `artifacts/s2552-fire/compile.txt` and `artifacts/s2552-fire/power-isolated.txt`; no limit or implementation was changed. The overlap is observed, not an assertion that an individual competing process caused the red.
- Chapters: 68/68 desktop and mobile, one worker, rc=0, 1304.9 s. Console-watch reported zero suppressed errors in all 52 reports. `artifacts/s2552-fire/chapters.txt` preserves the complete run. Fifty scratch PNGs were produced; all 51 retained hashes matched the starting snapshot, and their mtimes predated the candidate commit. See `artifacts/s2552-fire/chapter-default-proof.json`.
- Moth: ordinary 4/4 (47.3 s), explicit corridor refresh 1/1 (13.0 s), ordinary 4/4 again (47.0 s). Ordinary runs preserved both retained bytes and mtime and wrote matching scratch bytes; explicit refresh advanced mtime while retaining the correct current recording: 138 trace rows, `fnv1a32:f7af6739`. See `artifacts/s2552-fire/moth-proof.json` and its three transcripts. Current era 5 engine identity is `09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4`. Historical drift remains attributed to `253927e1f` by the originating review; this fire does not reinstate the old lane recording.
- Explicit chapter refresh: 1/1 desktop Deepwater, 45.8 s; five retained-path screenshots were actually written in the isolated gate tree, captured under `artifacts/s2552-fire/explicit-refresh-shots/`, then restored. All 51 retained hashes match again. `artifacts/s2552-fire/chapter-refresh-proof.json` records the writes. The first anchored selector matched no tests (rc=1); its transcript, proof and method are retained with `initial-` prefixes. Correcting the selector changed no test or runtime code.

## Classification
Seven test writers only, nine insertions and eight deletions. Six chapter files are byte-identical to their parent outside their SHOTS constants; the Moth writer changes only its output-directory choice. No assertions, triggers, source runtime, assets, pins, package/configuration or retained artifact bytes change. Exact per-path classification is `artifacts/s2552-fire/classification.json`; patch is `artifacts/s2552-fire/candidate.patch`.

## Next fire
Keep the lane and done-move held; do not redispatch. Recheck current main against the saved candidate. If only bookkeeping has moved, keep the exact tree/evidence association instead of recreating the already gated patch. Run the complete direct Node command alone on Node 26.4.0; do not route it through run-guards' 900-second wrapper. Then run task-025/M1/M2 on both projects and plain desktop/390px boots against an owned dev Vite server. Job lists are `artifacts/s2552-fire/full-node-jobs.json` and `artifacts/s2552-fire/adjacency-jobs.json`. Prior s2551 Node success is prerequisite evidence, not a pass on this writer candidate. Any source drift requires reclassification and affected gates. Merge only once the remaining gates are satisfied; then update the goal's full mergeHash and archive consumed save refs.

## Standing duties and retention
Runner alive, queue/in-flight zero, one real drain. Ten planned leaves are all priced, none fire-authorable; no refills. The 55 inherited desk items were checked: CLOSED 0, OPEN 2, BOTH 0, OPEN-DESK-ONLY 53, UNRECORDED 0, all carried. The 15-day ledger series is whole/current through September 7, zero account-class rows; 54 unknown-class rows remain advisory. Pull was idempotent. Rotation r2026w37 is already minted and open; landing ID matches. September 7 ticker is not due before 06:00 local. Gazette: 249 reported, 112 dismissed, zero candidates; W37 has three standalone and two batched headlines. No player-visible event occurred here.

All 106 registered trees were visited, including the gitless fallback; the 6,775 gitless evidence files are remote-safe. Eight quiet-file exception identities match the preceding verified record; all 23 chunks behind six large trace blobs were checked at their offsite refs. No foreign content was touched. See `artifacts/s2552-fire/retention-judgment.md` and `artifacts/s2552-fire/standing-duties.json`. This fire's gate tree and ignored scratch outputs remain available for the next gate; only its own server is stopped before exit.

---

# s2541 — chapter evidence writer drain

**Slice:** `lane-c-chapter-evidence-opt-in.md`; lane `feat/hero-move-verb` at `386e129f714e634d9a2a9a18f31f8afa9f08f0fd`. **Candidate:** `44fd2661f345f25c9d9099359ff405eabd6b641e`, pushed to `save/chapter-evidence-s2541`, based on main `c03903e3a1905e26d91914532154fc014b699781`.

**Verdict: HOLD — not merged.** The seven writer changes preserve main's current readiness fixes and Moth program. The full Node command fails on a separate, reproduced stale-fixture defect. No runtime, historical recording, lane branch or done-move was changed.

Ordinary chapter screenshots and Moth trace output go to ignored scratch storage; the literal `GR_REFRESH_EVIDENCE=1` flag selects the retained destination. The candidate retains all current assertions and all six story-reader waits.

| Gate | Current evidence |
|---|---|
| Full Node command | rc 1; first group 742 tests, 736 pass / 1 fail / 5 explicit skips, 818.1 s. Chained tail **not run**. `artifacts/s2541-fire/full-node.log` |
| Failure control | Unchanged base: all three headless board-gold cases fail with the same malformed-tape refusal, 0/3, 4.06 s. `artifacts/s2541-fire/base-board-gold.txt` |
| Typecheck and build | Both rc 0. `artifacts/s2541-fire/compile.txt` |
| Moth ordinary writer | Executed in the full Node run; scratch trace 138 rows, `fnv1a32:f7af6739`. All four Moth tests pass in that group. |
| Moth explicit refresh | 1/1, 12.5 s; retained write reproduces the scratch bytes. `artifacts/s2541-fire/explicit-moth.txt` |
| Retained evidence | All 51 starting artifacts remain byte-identical. `artifacts/s2541-fire/writer-proof.json` |
| Browser gates | Complete six-chapter run, task-025/M1/M2 adjacency, plain desktop/390px boot, and chapter explicit-refresh proof remain owed on this candidate. No current browser acceptance is claimed. |

The five Node skips are two owner-ruled Baron cases and three fire-shell cross-engine checks. They are not coverage. The fixture-owner sweep stopped at its failing board-gold child; its title's 128 subjects does not mean all 128 were visited.

## Classification

All seven paths also moved on main after the lane base: six `e2e/ss-06` through `ss-11` specs and `scripts/moth-season-pressure.test.mjs`. Apply only their writer destination changes from the saved s2537 patch. Main's six readiness barriers, newer four-test Moth program, and 138-row retained recording win. The runner's older JSON and report do not overwrite them. Exact per-path history and patch: `artifacts/s2541-fire/file-classification.json`, `artifacts/s2541-fire/candidate.patch`, `artifacts/s2541-fire/classification.json`.

## Findings and next gate

- **F-2541-1 — reproduced on unchanged base, gate-side corrective registered.** `scripts/fixture-teardown.test.mjs:40` asserts its board-gold child succeeded. The child instead fails at `scripts/board-tape-gold.test.mjs:330`: all three banked headless tapes are invalid under the landed ADR-005 grammar. Direct validation identifies Mare Claim `MOVE_TO` at tick 0, Moth Season `HOLD` at tick 1820, and Relay Rush `HOLD` at tick 0. The validator and assay door are behaving as intended. `artifacts/s2541-fire/tape-diagnosis.json` records exact input hashes and refusals. `tasks/main-board-gold-current-grammar.md` restores positive held-purse coverage with current recordings while preserving historical tapes and strict validation. This is not an owner fork and not a contention finding.
- The s2537 readiness and M2 prerequisites have since merged, at `985db2d33b22121a3a6d2b47628666e05116031e` and `0eac2a9bec302665ab3483ec0413eca2e7469992`. Their completion does not discharge this writer patch's remaining gates.
- Preserve both existing done-moves. Do not re-dispatch the chapter task or refill its held lane. Resume instructions: `artifacts/s2541-fire/resume.md`.

---

## Historical s2537 report — retained verbatim; current verdict is above

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
