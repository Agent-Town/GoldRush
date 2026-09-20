# s2518 — Deploy hardening preserved; production-probe corrective authored

No implementation was merged or published. Main's completed deploy-budget output was reviewed, preserved offsite, and held for a scoped corrective. The new hard-verdict guard passes; the available production and full-regression evidence does not support a release PASS.

## Delivered

- `91a83844d` registers `deploy-budget-production-probe` and supersedes the original main task. The review is `reviews/deploy-budget-hard-verdict-s2518.md`. This is a readiness condition the corrective can satisfy, not another owner decision.
- `save/deploy-budget-hard-verdict-s2518` = `36176d1ca93701e2f6ceb0d3d9f52df79e164443` preserves the exact four-path implementation and is pushed. A temporary index left main untouched; all four SHA-256 values were rechecked before restoring only those paths. The receipt remains under `tasks/done/rejected-20260905-103054-deploy-budget-hard-verdict.md`. The original master and run log are retained.
- Independent Node 26.4.0 checks: hard-verdict guard **13/13 passed**, shell syntax passed. The legacy deploy contract fails `strict-skip: expected rc 2, got 5` on both candidate and unchanged HEAD. That is an inherited empty-measurement fixture, not a regression introduced by this candidate. The control blocked external ssh/rsync even if it unexpectedly reached them.
- The predecessor's real dry run reports one mobile total (17,365,554 / 25,000,000 bytes) and FAIL; its full Node attempt is explicitly interrupted/inconclusive. The corrective retains the hardening, separates production measurement from debug-only cue coverage, and updates the existing fixture without changing the quantity or threshold.

## Board and custody

The runner is ALIVE and landing/game/API return HTTP 200. At the opening read lanes b/d were live; at 11:13 all four lanes had finished and were one commit ahead. Main's corrective is the sole queue copy authorised after the final strict pre-queue check. No lane is refilled or reset. Lane-a asset manifest, lane-b bounded prefetch, lane-c true-world Lantern, and lane-d shared atlas each need their own drain. Shared atlas's own report declares legacy-test blockers despite its new tests passing. No new failed run or CODEX-WALL was found. Crafting pending: zero.

The handoff prioritises the main corrective output when ready, then serial lane drains. None of their source or evidence was claimed by this fire. Regenerated screenshots/JSON and factory logs on main predate this fire or belong to attended/runner work and remain unstaged. `logs/guard-stats.jsonl` stays untracked because its writer requires that state. Local installed-skill files, the parked duplicate master and host debris remain untouched.

## Standing duties and retention

- LB-01: **13/13** coverage days, August 24 through September 5, whole and current. Exposure reads all 13 mirrors and 124 fields, **zero account-class rows**. Six unrecognised values are the three anonymous refusal records already examined in s2517. No new pull or account-policy change is needed.
- TK-01: September 4's digest already exists. RT-01: `r2026w37` exists, opens September 7; Saturday's fire owes no Sunday mint.
- GZ-01: 5,140 first-parent commits examined, 274 player-path subjects, 194 reported / 80 dismissed / **zero candidates**. Weekly budget remains 18 standalone / 14 batched. This bookkeeping fire creates no player news or gazette-pointer edit.
- Art staging: **6 areas / 1,024 files**, **AT RISK 0**, **LOCAL-ONLY 0**. These are this fire's measured header and buckets. The previous seventh area was `main-tree`, holding four then-unpushed asset blobs; it is absent after their push, while all six staging areas remain present.
- Registered-worktree sweep: **104 trees**, **100 answered by git**, **4 could-not-answer by git and handled by the shared-object fallback**. Hash count asserted **23,458 / 23,458**. At that moving snapshot, 23,453 paths were reachable from origin; AT RISK 2 and LOCAL-ONLY 3 were exclusively this fire's five evidence files, all included in its commits/push. No older untracked arena or finished-worktree evidence required salvage. This untracked sweep does not certify the pushed state of already-tracked lane commits. Stale registrations were preserved. The script inspected every registered tree, including the lanes inside the repo; dependency/build scratch was excluded from the gitless evidence walk. It is a sequential scan, not an atomic snapshot.
- Withheld evidence: 362 run logs read, five withholding runs, 112 rows / 58 distinct paths, three tracked, zero recoverable on disk, 55 historic lost paths. No new recovery claim.
- The 53-item owner's desk is carried verbatim. No owner decision, service-tier setting or permanent job was changed. s2517's full handoff was archived in the lock commit, and the archive audit reports no missing/abridged handoffs.

## Closing verification

The corrective's strict pre-queue check passes. The first closing ledger Node stage reported **1,050 tests / 1,049 passed / 1 failed / zero cancelled or skipped**. It caught this fire leaving the predecessor's READY-FOR-GATES headline in BACKLOG after superseding its goal. That headline is now explicitly superseded; its full original report is retained. The complete repeat battery **passed, exit 0**: **1,050/1,050 Node assertions**, zero failures/cancellations/skips, Node stage 71.72 seconds; every subsequent ledger leg passed, ending with **83/83** foundry assertions. All three desk legs evaluated (53 segments, no undeclared/undesked/dropped items); none skipped. The first red and second green transcripts/exits are both retained. No build/browser/full-node green is claimed for the held implementation.

## F-2518-3 — lane backup hard limit

The grouped a/b/c/d push was rejected by GitHub: lane-b contains a **186.60 MB** trace at `artifacts/prefetch-bounded-warming/asset-diet-results/asset-diet-town-byte-budge-360a8-al-and-saveData-arms-by-URL-desktop-chrome/trace.zip`, above its **100 MB** hard limit. Other traces at 51.57 and 86.30 MB drew warnings. All four refs were refused by that grouped push. A/c/d were retried separately and pushed successfully; their origin tips match exactly. Lane-b stays intact locally; no history rewrite, LFS migration or deletion was attempted. A later path-scoped drain must retain the trace in an offsite-compatible form, such as a separate chunked evidence ref with reconstruction hashes, before leaving the oversized blob out of main. Backup failure is recorded and does not block unrelated drains.

Handoff execution: commit/push this report and STATUS, then strict-check and copy the registered master into main. The s2518 save ref and lanes a/c/d are already pushed. No lane-b backup success is claimed.
