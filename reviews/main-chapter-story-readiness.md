# MAIN chapter story readiness — s2540 drain

## Slice, base and tip

Task `tasks/main-chapter-story-readiness.md`; completed MAIN output `20260907-172449-main-chapter-story-readiness.md`. Saved implementation `83f1429f6ff2dc26254f0c18225466991b6454ea` was applied onto current main `e4137d435c159497ed225cd6b075d81d9b7e1815` in `/private/tmp/gr-gate-s2540`, producing `8501796fc79988c2e9fff6011e36563f8794b2ab`. The integration base includes s2539's M2 input-readiness corrective.

## Verdict

ACCEPTED — merged as `7c6ecd500810caf1a9e7255a8aea0df35b8cb695`. This supersedes the s2538 hold and s2539 pending-gates status. F-2537-1 is closed. The two unrelated M1 failures are reproduced on unchanged main and do not block this test-only drain.

## What it does

Each of the six Frontier chapter-exclusion cases now waits for `window.__GR_STORY__` before reading its queue. The existing strict empty-array assertion, DOM absence assertion and console watcher remain unchanged. `src/main.ts` schedules the story import after two animation frames; `StoryRuntime.installDebugHandle` publishes the reader when that module installs. A missing reader and an installed empty queue are different states. No runtime, timeout, screenshot writer, fixture or helper changes.

## Evidence

Native Node 26.4.0; detached tree clean after `npm ci`; one browser worker, trace off, private Vite cache and checked-free port 5330. `artifacts/s2540-fire/collection.txt` lists exactly twelve tests in six files.

- Typecheck passed in 4.9 s; build passed in 19.5 s, with the existing bundle warnings.
- All twelve Frontier exclusions passed in 83.1 s; E7 mobile repeat passed 3/3 in 23.2 s. Every selected case reported zero suppressed GLTFLoader errors.
- Full task-025/M1/M2 adjacency returned 30/32 in 133.0 s. Both failures are the same M1 test, `T spawns Claim Jumpers, contact kills hero, R restarts in place`, expecting enemiesAlive > 0 and receiving 0. All fourteen M2 cases passed.
- A current-base control restored all six touched specs and proved an empty diff across source, e2e, scripts, functions and configs. Complete M1 returned 6/8 in 41.8 s with exactly the same two errors. The candidate files were then restored byte-identical.
- Plain desktop and 390px boots passed in 8.6 s: zero console errors, warnings and page errors. Power p95 was 0.319 ms against a 0.500 ms cap. Main's task guard read 1,325 masters with zero invisible; citation and caller audits passed.
- A bounded browser observation held the story module response, observed `undefined`, then released it and observed the installed reader with an empty later-epoch queue. This establishes the reader distinction; it does not claim town diagnostics can advance while their imported story module is withheld.

Receipts: `artifacts/s2540-fire/gates.txt`, `artifacts/s2540-fire/followups.txt`, `artifacts/s2540-fire/base-control.json`, `artifacts/s2540-fire/ordering.txt`, `artifacts/s2540-fire/main-checks.txt`. Candidate/base failure screenshots and generated M2 images are retained under `artifacts/s2540-fire/browser-evidence/` and `artifacts/s2540-fire/generated-m2/`; they do not replace main's retained images.

## Merge classification

Every path was SAVED-ONLY: main had not changed it since the saved commit's parent. The six paths are `e2e/ss-06-e5-beats.spec.ts`, `e2e/ss-07-e6-beats.spec.ts`, `e2e/ss-08-e7-beats.spec.ts`, `e2e/ss-09-e8-beats.spec.ts`, `e2e/ss-10-e9-beats.spec.ts`, and `e2e/ss-11-e10-beats.spec.ts`. Each receives one existing-pattern wait. No conflict resolution was needed. Exact classification and patch: `artifacts/s2540-fire/classification.json`, `artifacts/s2540-fire/candidate.patch`.

## Findings and limits

F-2537-1 CLOSED by this drain. F-2533-1 remains non-blocking here with a fresh base reproduction; its completed lane-a corrective awaits its own drain. F-2537-2 was closed by s2539, and both M2 projects pass here. The lane-c evidence-writer patch remains a separate unmerged slice; none of its changes or old gate claims is accepted by this review.

Measurement failures are retained: the first boot invocation refused because the server process was launched from main despite its explicit Vite root pointing to the detached candidate; restarting the same server from the candidate directory satisfied the ownership guard. The first task-guard command named a nonexistent script; the real npm entry then correctly skipped in the linked worktree, so it was run against main for an actual verdict. The first extra ordering control incorrectly waited for town frames while withholding a module TownScene itself imports; it timed out before testing its claim. The corrected control observes only the declared reader boundary and passed. None of these refused arrangements is counted as a passing test.

No full Node or full browser suite was run: the master explicitly excludes them for this e2e-only change, and FIRE requires the full Node battery for simulation/system/entity changes. The six identical barriers add no new algorithm requiring a separate implementation review. Factory telemetry and foreign artifacts were left outside the merge. No deployment is owed for this test-only drain.
