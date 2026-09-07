# MAIN beat citation refresh — s2533 drain

## Slice / branch / tip

`tasks/main-beat-citation-refresh.md`, MAIN-slot uncommitted output from runner base `c0fc424a0e89e07674e0d8e2451c093188f18c38`. Gate base `047c1e6e61db2928501b3f15b6ee4708a3fcc24d`; isolated full worktree `/private/tmp/gr-s2533-citation-gate`. Source after-blob `95f2d0675aed69f97748c239d64a965cd395d503`.

## Verdict

HOLD. No source or registry change was merged. The MAIN done-move and working-tree correction remain available; the candidate patch and registry are retained in the fire evidence.

## What it does

Corrects exactly nine current numeric comment ranges in `src/story/beats.ts`. Historical rebasing accounts remain intact. All 9,182 TypeScript token kind/text pairs and the 2,280-line count are unchanged, so no runtime behavior, story copy, or simulation semantics change. The source-byte identity moves; era 5 appends pin 80 (`64d634d4aaf285f04f0fead86724213cbded79e28cec6544d18efcd136485229`) without an era bump or removal of earlier pins.

## Evidence

The runner's before-red/after-green measurements and comparison script are in `artifacts/beat-citation-refresh/REPORT.md`. Independent drain results are retained in `artifacts/s2533-fire/citation-gates.txt`: nine exact subjects, token and line invariance, typecheck, build, and engine registry guard (5/5) all exit 0. The diff-selected battery returned 3/5 guard jobs: task guards, citation checks and gate callers passed; node guards were terminated at the wrapper's 900-second limit (incomplete), and power p95 was 2.566 ms against 0.500 ms. A separate candidate power run measured 3.272 ms; the unchanged-base control also failed at 0.744 ms. These are not green results. Full transcripts: `artifacts/s2533-fire/drain-guards.txt`, `artifacts/s2533-fire/power-control.txt`, `artifacts/s2533-fire/base-controls.txt`.

Plain boot passed 2/2, desktop and 390px, with zero console/page errors after assigning Vite its own cache. The initial shared dependency cache returned HTTP 504 Outdated Optimize Dep; both initial failures and the corrected run remain in `artifacts/s2533-fire/browser-gates.txt`. Minimum adjacent suites passed 30/32. Both failures are the M1 debug-spawn test at its `enemiesAlive > 0` assertion; unchanged base reproduces 2/2 identical failures. Boot screenshots are in `artifacts/s2533-fire/boot/`. Failure screenshots, error contexts, and complete trace/network/stack records are in `artifacts/s2533-fire/browser-evidence/`; `artifacts/s2533-fire/trace-retention.json` records the original archives and omitted response/frame resources. Raw trace archives remain in the gate worktree, not in the offsite commit.

## Merge classification

| Path | Classification | Resolution |
| --- | --- | --- |
| `src/story/beats.ts` | MAIN runner output matched to the completed task | Nine comment-digit replacements; no conflict and no line movement. |
| `assets/engine-era.json` | Drain-owned identity bookkeeping | Append same-era pin derived from the gated tree; keep all prior pins. |

The gate contains only those two tracked edits before tests. Factory log churn, the attended production probe, and every other worktree stay outside this drain. The lane-c evidence-writer done-move remains undrained for the next fire.

## Findings

F-AGE2-2's candidate is correct but not yet landed: the attended description said ten, but its live-line inventory and the authoring checker both enumerate nine, and all nine were verified. F-AGE2-3 and F-AGE2-5 belong to the separate lane-c task. **F-2533-1 (pre-existing test defect; fire-authorable corrective):** `e2e/m1-01-claim-jumpers-death.spec.ts` opens `/?nowaves&nolevel`, presses T, and expects a pack. F-RPA-4 correctly requires `isDebugEnabled()` before that key spawns (`src/game/Game.ts`). The stale test fails identically on candidate and unchanged base, both projects. Keep the runtime gate; make the positive test opt into debug and add a plain-boot negative control. Corrective master: `tasks/lane-a-m1-debug-spawn-contract.md`.

The full node battery timeout is an incomplete measurement, not a discovered game regression and not permission to raise limits or skip tests. The pending MAIN drain still owes a complete accepted battery. Do not reimplement or re-queue its completed citation task.
