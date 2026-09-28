# s2719 — Run 10 detached gate record

This fire holds main with lock commit `cb9674529`. Source Run 10 is `sol/map-art-campaign-2` at `4cada1369`, detached candidate `a4ac5b583` at `/Users/robin/.goldrush/fire-s2719/wt-pp10`. Main has not received the source diff. The current gate state is in `reviews/sol-play-proofs-10.md`.

## Custody and inherited claims verified

- The fresh `tasks/.fire.lock` belongs to this process: tool process ancestry leads through Codex PID 77782 to launcher PID 76804, started at 2026-09-27 19:06 UTC. It is not a stale lock takeover. The predecessor is s2718 lock CLEARED and was archived verbatim with the supported STATUS helper.
- Runner PID 25494 is alive, parent 1, not this fire's child. Its main-slot semaphore is the `ACTIVE` / absence-of-`lock CLEARED` predicate in `scripts/lane-runner-v3.sh:239`. No runner restart or termination was needed.
- CODEX-WALL was read in full. The runner's own probe and newest run-log tail show the implementer serves. Run 10's four commits are real, with four new opt-in specs and 61 new evidence files. The strict live-board policy is CLEAR. The full lane probe is `lane-probe.txt`; the run tail is `source-run-tail.txt`.
- Attended `holds-3` authorship at `f0bf54515` was already committed before this fire took ACTIVE. Its ownership and the holds-1/-2/-3 queue chain are retained. The fixture-cleanup attempt-2 master is queued on lane-a; lane-a's earlier report-only commit remains preserved and attended-owned. No fire dispatch or re-queue occurs.
- Only generated logs were dirty on main. No attended document, task or implementation edits were reverted. The new review and this evidence are this fire's work.

## Completed measurements

All 65 source paths are new, no main overlap, no merge conflict, no blob above 50 MB. `npm ci` passed and the arena was clean before merge. An initially changed art symlink was caught by that check, preserved outside the arena, and replaced with the original relative link resolving through the scratch sibling to the clean store at landed main `5793a967d`. No art content changed.

tsc passed in 7.1 s; normal and E1 builds passed in 39.4 and 12.1 s. E1 payload is 34,350,664 B. The policy job in the build wrapper correctly refused its frozen linked-worktree board; the authoritative-root recheck returned CLEAR. Consequently the original wrapper aggregate remains rc 1, while all build/payload jobs are rc 0. No receipt was overwritten.

Serial Playwright: warmup 1/1; task-025, m1-01, m2-01 and plain boots 42/42 in 224.9 s; four new specs give eight opt-in skips with the flag unset. Eight plain boots have no debug query and zero console/page errors, including 390px mobile. The one Vite server started by this fire was stopped by its numeric PID and its drain-lock directory moved aside after the browser jobs.

Eight compact source rides match their retained raw records after documented sample compaction. All have zero browser errors and fail the unchanged secure assertion. Four inspected loss screenshots agree with waves 17, 2, 20 and 3. Source evidence is 1,615,430 B. The campaign table has exactly one row per contract: 42 total, seven PROVED both screens, three one screen, two PARTIAL, 29 HELD and one corrected historical defect. These are scoped historical verdicts, not 42 successful journeys.

Production, contracts, art and shared native driver are unchanged. No new map defect or balance authorization is inferred. The four new holds are already assigned to attended `sol-play-proofs-holds-3`.

## Duties checked

Pending assay orders: zero. No art raws or store slices landed. Private ledger freshness passed, 35/35 coverage days through September 27; the `ledger-backups` and `fire-memory` remote tips are identical to s2718. The next LB-01/FM-01 window is September 28 at 02:10 UTC, later than this fire. September 26 ticker exists; the September 27 digest is due after September 28 at 06:00 local. Week 40 is already registered, opening September 28 at 00:00 UTC; the next Wednesday mint is not due. No runtime merge, engine-era bump or player-visible change means no new Gazette item or deploy is due from this gate staging.

## Gate disposition and remaining list in order

WHY NO LANDING: the mandatory diff-selected guard wrapper stopped its full Node child with SIGTERM at the fixed 900-second outer limit. Its direct exit is 1, with four of five groups green. The partial TAP contains 504 top-level passes and no failure record; final totals and the chained tail are absent. The active fixture-owner sweep changed child processes during sampling, so this is an interrupted gate, not a diagnosed hang. All sampled gate processes exited. The power-budget p95 was 0.350 ms. No assertion, timeout, runtime or script was changed.

1. Continue full Node on candidate `a4ac5b583` at `/Users/robin/.goldrush/fire-s2719/wt-pp10`, with Node 26.4.0 and the verified PATH. The job file below bypasses only the outer wrapper by invoking the exact full npm command directly; it changes no test or limit. If newer main has executable changes, classify and merge them before trusting prior receipts. Attribute any actual red by a same-spec clean-main control.
2. After complete gates, measure final engine identity, synchronize bookkeeping, update goal status/mergeHash and the BACKLOG/review in the drain commit set, fast-forward main, rename the done-move, push and complete main verification. Until then, the goal remains queued and the original done-move stays open. Source content has not entered main.
3. The fixture-cleanup attempt-2 queue and holds-1 → holds-2 → holds-3 chain remain attended-owned. No fire dispatch, re-queue or source reset is authorized by this record.
4. Keep the existing three-item Owner's Desk visible; execute ticker and private backup/memory duties when their next windows arrive.

Resume from the primary checkout after taking the next fire lock:

```sh
/opt/homebrew/bin/node -e 'const fs=require("fs"),cp=require("child_process");cp.execFileSync(process.execPath,["scripts/gate-battery.mjs","--cwd","/Users/robin/.goldrush/fire-s2719/wt-pp10","--transcript","artifacts/s2719/full-node-continuation.txt","--label","Run 10 direct Node continuation",fs.readFileSync("artifacts/s2719/resume-node-jobs.json","utf8")],{env:{...process.env,PATH:"/opt/homebrew/bin:"+process.env.PATH},stdio:"inherit"})'
```

Do not repeat the completed browser/build gates without changed inputs or a new concern, and do not repeat the already measured capped wrapper as the full-Node continuation. Retained TAP snapshots, command exit and process history are under this directory. The generated plain-boot JSON records were moved here before restoring their candidate paths; the candidate has no tracked dirt.

Final engine identity, measured after all gate work, is unchanged on main and candidate at era 6 pin 71, `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`. The earlier receipts have not been relabeled as a full pass. The final ledger result follows before lock clearance.

The staging record and review were committed on main as `ff5d99126`; this is a documentation/evidence checkpoint, not a product merge or lane evidence. An extra `status-archive-audit.mjs` invocation accidentally selected the unbounded 6,001-commit historical walk. Its warning and partial output are preserved, and only its verified own PID 63631 was stopped with TERM (exit 143). No verdict is claimed from it. The correct `--limit 40 --quiet` regression audit remains in the complete ledger battery. The predecessor archive and unchanged Owner's Desk tail were also directly checked byte-for-byte.

## Final ledger and handoff

Full ledger **rc 0, 1263/1263 tests, zero failures or skips, all chained audits green and final kit 83/83**, in **210.712 s**, Node 26.4.0. HEAD remained `ff5d991265fe7a5cea24b9bfacab9fdf3a415fe0` throughout. The bounded STATUS archive audit passed inside the battery. Exact receipts: `ledger-start.json`, `ledger-result.json`, `ledger-final.txt`, `ledger-summary.txt`.

The final board still has Run 10 queued, its original done-move present and all four source commits ahead of main; no new failed runs. Lane-a holds the attended fixture-cleanup attempt 2 queue; all other queues are empty. This is not a dry-board claim. The last commit writes lock CLEARED with the predecessor archive and Owner's Desk preserved; the launcher keeps its process directory until exit. No main work follows that commit except the backup push and read-only verification.
