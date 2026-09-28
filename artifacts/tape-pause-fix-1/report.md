# Paused run reels replay without freezing — tape-pause-fix-1

## Choice recorded before the code
Choose (b): ignore recorded `set_pause` only while `runTapeReplay` is active in the shared action handler. Tape ticks count active simulation time; a wall-clock player pause has no simulation event to reproduce. Old tapes retain their pause actions and must work unchanged, so a recorder-only change cannot satisfy the task. The replay guard alone covers new and old tapes, including secondary streams, without changing the recorder, multiplayer pause, simulation, or viewer pause controls.

Measured on base `3c35d5bed250427a254ab10f1fe22071da44aad2`: the report's unchanged River reel `fnv1a32:a8c5af79` has one `set_pause paused:true` at t=50 and duration 153. It stops at tick 51, paused, time 1.6666666666666685; another ten-second advance still stops at 51. Zero console/page errors. Evidence: `before/paused-river-progress.json`.

Pre-flight: lane was clean and behind main (no ahead commits); updated by the prescribed branch reset, clean discarded nothing. Both prescribed install/build rounds passed. npm 10 under Node 23 removed libc metadata from package-lock; restored only this self-generated churn after each install. Premise: riverCeremony count 2; main contains the landed river-assay-1 commits. No source change before measurements. Assays use installed Node 26.4.0.

## Progress
**READY-FOR-GATES.** Implementation and all requested gates complete.

## Five proofs
All worker runs invoke the county's unchanged `scripts/assay-worker.mjs --once --dry-run`, using the existing `artifacts/river-assay-1/instruments/worker-verdicts.mjs` local queue and `/Users/robin/.nvm/versions/node/v26.4.0/bin/node`. No requests reach the live door. The browser instrument is the county's unchanged `scripts/assay-replay.mjs`.

| Proof | Live / claimed hash | Replay / verdict | Evidence |
| --- | --- | --- | --- |
| (i) Fixed-build River, one pause/resume, desktop | `fnv1a32:abebc77c` | same, VERIFIED | `after/fresh-river-desktop.json`, `after/worker-fresh.json` |
| (i) Fixed-build River, one pause/resume, 390 px phone | `fnv1a32:2c982352` | same, VERIFIED | `after/fresh-river-mobile.json`, `after/worker-fresh.json` |
| (ii) Unchanged pre-fix River reel, pause at t=50 | `fnv1a32:a8c5af79` | same, VERIFIED | `after/worker-old-river.json`; input remains `artifacts/river-assay-1/human/paused-river-desktop.json` |
| (iii) Fixed-build Claim, three pauses/resumes | `fnv1a32:8b17af1a` | same at tick 176; worker UNASSAYABLE, no valid securedSnapshot | `after/claim-three-pauses.json`, `.run.json`, `after/replay-claim.json`, `after/worker-fresh.json` |
| (iv) Seed-run human row 0 | `fnv1a32:c218335c` | past 274, completes at 18,000; worker REJECTED, replay `fnv1a32:0827c33c` | `after/seedrun-progress.json`, `after/worker-seedrun.json` |
| (v) Heat-15 probe / r1 / r2 | `b131e18e` / `f3a9c00c` / `b92da1bf` | VERIFIED, identical before/after | `before/worker-heat15.json`, `after/worker-heat15.json`, `after/unchanged-comparison.json` |
| (v) Era-6 agent, headless arm | `fnv1a32:a45ba9ac` | same, tick 2453, byte-identical output | `before/agent-era6.json`, `after/agent-era6.json` |

The fresh River tapes carry one pause action each at t=57. The Claim carries three at t=54, 69, 85; every recorded live cycle actually became paused and resumed (`after/claim-three-pauses.run.json`). A death reel has no secured snapshot and is unassayable by county design even when its hash and score reproduce. The direct county replay output establishes the Claim hash independently of the worker's deliberately withheld replay hash on that verdict.

Heat-15 worker result rows compare byte-for-byte after excluding only wallMs (timestamps belong to the wrapper, not the verdict rows). The headless era-6 JSON files compare byte-for-byte without exclusions. Full comparisons and assertions are in `after/unchanged-comparison.json`. **83/83 null floors match**, rc 0, 370.6 s (`after/null-floors.log`). The eraStamp difference is explicitly provenance only, not a floor difference.

## Historical seed-run and pending standings
The unchanged reel input equals `artifacts/ops/seedrun-board-backup-20260822.json` row 0's tape exactly (asserted in `after/unchanged-comparison.json`). It retains all seven pause actions. The progress probe now advances to tick 17,967 on its first duration-sized call and to 18,000 on its additional ten-second call, where playback is complete (the viewer intentionally pauses at the end), with hash `fnv1a32:8f831e36`, wave 3 and sim time 119.66666666666244. Zero console/page errors. It no longer freezes at the first pause. This historical recording predates the F-RVA1-1 axes fix and cannot recover its unrecorded full-precision diagonal inputs; a completed playback is not a verified standing. The progress probe is a diagnostic; its manual-sim frame behavior is the previously reported F-RVA1-2, so it is not substituted for the county instrument. The real worker exits 0 with REJECTED, claimed `fnv1a32:c218335c`, replayed `fnv1a32:0827c33c`, eventLogHash mismatch, no retries (`after/worker-seedrun.json`). The differing probe/worker hashes on this already-divergent historical tape are retained as observed, not claimed identical.

Pending human standings potentially rescued: **0 pending rows in the available seed-run backup fixture** (one human row, already rejected, and still unrecoverable because of the earlier axes defect). **Live pending count: untested**; no live-door query was performed. New paused River standings are demonstrated rescued by (i), and the post-F-RVA1-1 pre-fix paused reel by (ii).

## Engine hash and scope
Before: `f6084527ce4a4d1c9a02ecf84d0859c105d69f04add6316998545a790535b5b0`.
After: `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`.
Cause for the attended same-era pin: **the replay's pause handling; no sim rule, contract, floor or table moved**.
Only `src/game/Game.ts` changes among engine inputs; `assets/engine-era.json` is untouched. Reels currently carry the declared pin from that registry; the attended drain owns its update.

## Adaptations
- Chose replay-only (b); recorder and multiplayer unchanged. No `LockstepClient.ts` or `RunTape.ts` edit is necessary to make both old and new reels assayable.
- Added exactly one test row in `e2e/river-ending-score.spec.ts`, reusing its native River entry, walk, real local door and worker. Existing assertions unchanged. No `?debug` on either new live run. The row asserts actual pause, frozen clock, resume, recorded pause action, matching claimed/replayed hash, VERIFIED, and zero console/page errors, and saves the reel, verdict and screenshot in this task's artifacts.
- Reused prior evidence instruments; the task-local recorder adds a counted pause loop for Claim. Claim uses the existing instrument's debug endRunForTest solely to obtain a death tape. The River runs use plain entry.
- Used `node scripts/null-floor-anchors.mjs --check`, the report's floor instrument (no `test:null-floors` npm alias exists).
- One development tsc run found the new assertion needed a `type in action` discriminator for the existing PlaybookAction union; corrected inside the same new row, then reran tsc/build.

## Verification
| Gate | Result | Evidence |
| --- | --- | --- |
| Pre-flight install + build (both prescribed rounds) | PASS, rc 0 | `before/build.log` records second build |
| `npx tsc --noEmit` | PASS, rc 0 | `after/tsc.log` |
| `npm run build` | PASS, rc 0 | `after/build.log` |
| New pause/resume row, desktop and 390 px mobile | 2/2 PASS | `after/spec-pause.log`; final suite's reels, worker lines, errors and screenshots in `spec/` |
| `npx playwright test e2e/tape-01-run-tape.spec.ts e2e/river-ending-score.spec.ts e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts --workers=1` | 42/42 PASS, rc 0, 4.8m | `after/adjacent-suites.log` |
| `node --test scripts/river-assay.test.mjs` | 3/3 PASS, rc 0 | `after/river-assay-tests.log` |
| Plain River runs / Claim instrument / historical progress probe | zero console/page errors | `spec/proof-*.json`, `after/claim-three-pauses.run.json`, `after/seedrun-progress.json` |
| `node scripts/null-floor-anchors.mjs --check` | 83/83 PASS, rc 0, 370.6s | `after/null-floors.log` |
| `git diff --check` | PASS | checked before commit |

No adjacent reds needed a base control. The new row ran again as part of the full suite; `spec/` holds that final pass, while `after/fresh-river-*.json` freezes the first pass's reels for the explicit dry-run worker proof. These are separate live recordings and correctly have separate hashes.

Generated untracked `artifacts/056/*.png` from the existing build-menu suite were moved to `adjacent-shots/056/`, preserving them within this task's evidence rather than committing outside the firewall. No pre-existing evidence was discarded. The shared vault was readable and its MOC consulted; this task's strict TOUCH-ONLY list keeps the durable write in this report.

## Remaining list in order
No implementer items remain. Attended integration owns (1) the same-era engine pin for the hash above, then (2) drain/deploy and any re-assay of eligible pending standings. The historical seed-run axes divergence remains outside this slice and is not claimed rescued.

## Commits
Implementation and regression row: `17de886e6` (`fix: ignore recorded player pauses during run tape replay`). The accompanying `fix: record tape pause replay verification evidence` commit contains this report and all task evidence; the run's final response identifies its hash.
