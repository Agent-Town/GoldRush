# s2720 — Run 10 direct gate continuation

This fire continues the detached Run 10 drain. No source content is on main at the start of this record. Source branch `sol/map-art-campaign-2` ends at `4cada136986ff342d1a1c8fbb0cb68b786154f7f`; the supported STATUS helper archived s2719's complete handoff and preserved its Owner's Desk while taking lock commit `e805e9b22`.

## Custody and verification

- Process ancestry identifies this fire's launcher as PID 4982, started September 27 at 19:45 UTC, through Codex PID 5049. The fresh `tasks/.fire.lock` belongs to this run. No competing lock was displaced.
- Strict live-board policy returned CLEAR before drain work. Runner PID 25494 is alive, parent 1; its main-slot semaphore remains the ACTIVE/absence-of-lock-CLEARED predicate in `scripts/lane-runner-v3.sh:239`. No runner restart or termination was needed.
- The runner's own lane probe and newest run log confirm lane-a's attended fixture-cleanup attempt 2 is running. The source Run 10 log ends with four completed evidence commits. No dispatch, re-queue or lane reset is made by this fire.
- Newer main paths since the staged candidate are documentation and evidence only. Their list is `newer-main-paths.json`. They were synchronized into the existing detached worktree, producing `fcae3063201a05268e70fe666b646bb5d445f9e3`; tracked status is clean. No executable, dependency, test, contract or art input changed from the s2719 gate receipts.
- Both main and the candidate resolve to clean art-store HEAD/main `5793a967da46e8f00c0ba16f92f17dc10d36558d`; see `store-custody.json`. No art content changed.
- There are 65 new source paths, zero non-additive paths or conflicts: four opt-in specs and 61 source evidence files. `source-classification.txt` records every path. The live evidence-budget check passes at 1.6 MB under 40 MB; the exact source total remains 1,615,430 bytes.
- All eight compact ride records were freshly compared to their retained raw records. They are equivalent after documented sample compaction, and each has zero console/page errors and an unsuccessful secure result. See `raw-equivalence.json`. The four HELD verdicts remain HELD. No new map defect or balance authorization is inferred.

## Gate state

The s2719 typecheck, normal/E1 builds, 34,350,664-byte payload, 42/42 browser checks, eight opt-in skips and plain boots retain identical executable inputs. Their original receipts are preserved; the original aggregate policy-location refusal and 900-second guard interruption are not relabeled as passes.

The missing complete Node leg ran directly through the existing gate-battery tool with Node 26.4.0 and `/opt/homebrew/bin` prepended to the child PATH. It invokes the exact `npm run test:node-guards` command without the diff wrapper's outer 900-second cutoff. No test, assertion, per-test limit or watchdog is changed. Start and completion receipts are `node-start.json` and `node-result.json`; the append-only full output is `full-node-candidate.txt`. Process observations are retained in `process-progress.jsonl`.

The fixture sweep completed **PASS, all 162 owners**, in **1,588.862 seconds**, retained in `node-after-fixture.tap`. The earlier fixture-cleanup failure did not reproduce in this sweep. Host one-minute load reached 197.104 during it, then subsided; samples show advancing child tests through the quiet interval. The remaining files and chained tail subsequently passed too; the complete command result is below. The existing 900-second outer cap is shorter than this successfully completed single sweep, which is why the direct continuation was needed. No timeout was raised.

The ACTIVE line was refreshed by the UTC-stamping helper in commit `f814511ab`. The process-lock directory heartbeat was refreshed only after re-proving the launcher-to-agent ancestry (PIDs 4982 → 5044 → 5049); `lock-heartbeats.jsonl` records it. The launcher, not this fire, removes its lock directory on exit. The long already-started gate consumes this increment; no second drain is attempted.

## Duties

Rechecked: pending assay orders zero; the private ledger series is whole/current, 35/35 days through September 27; private `ledger-backups` and `fire-memory` remote heads still match s2719. The next private coverage duty is September 28 at 02:10 UTC. September 26's ticker exists; September 27's digest is due after September 28 at 06:00 local. Week 40 is already registered for September 28 at 00:00 UTC; the next Wednesday mint is not due. Receipts: `ledger-freshness.txt`, `private-duty-refs.txt`, `duties.json`.

No player-visible runtime change or engine-era bump is proposed by this evidence drain, so it requires no Gazette item or production deploy. The three-item Owner's Desk and the attended holds-1 → holds-2 → holds-3 dispatch chain remain in place.

## Completion

**Full candidate Node PASS:** rc 0, **1032 pass / 8 existing skips / 0 fail**, all chained audits green and the final tail **87/87**, **3650.374 seconds**. The Node test body reports 3617.806 s and maximum TAP silence 1587.2 s under the unchanged 2700 s watchdog. Exact output: `full-node-candidate.txt`; direct exit: `node-result.json`. No control is required for this green run. The earlier failing/interrupted receipts remain unchanged.

Final engine identity is `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`, matching main, candidate and era 6 pin 71. No pin was written. `engine-final.json` was measured after gate completion.

Attended changes appeared in the handover and F-2717-1 row while the gate ran: lane-a's fixture-cleanup attempt 2 became READY. They were read and committed separately as `54db7c3d0`, never reverted. Its readiness figures are attended-reported, not this fire's drain proof. The final lane probe verifies four real commits held on both lane-a and lane-c and empty queues; `final-lanes.txt` and `final-board.json` retain the inventory. The latter's unprefixed done list includes historical files and is not a pending-drain census or DRY verdict.

WHY NO LANDING: the already-started direct gate took just over an hour and consumed this fire increment. Main still has no Run 10 source paths. Its goal remains queued, with no mergeHash, and its original done-move remains open. No second drain was started. This is a documentation/evidence checkpoint, not lane evidence or a product merge.

## Remaining list in order

1. Continue Run 10 from **verified candidate `fcae3063201a05268e70fe666b646bb5d445f9e3`**, at `/Users/robin/.goldrush/fire-s2719/wt-pp10`. Start with strict policy on `tasks/done/20260928-013750-sol-play-proofs-10.md`. Classify newer main changes, synchronize bookkeeping, and reuse the complete receipts only while executable, dependency, art and applicable gate inputs remain unchanged. Do not rerun the completed hour-long candidate gate by habit.
2. Complete the goal status/actual mergeHash, BACKLOG and review drain commit set; fast-forward main, rename the original done-move and push. Then run **full Node on main**, as required after the fast-forward, with Node 26.4.0 and the explicit PATH. Use the direct gate job below; the 900-second outer wrapper is already measured as insufficient. Attribute any actual new red by a same-spec clean-main control. Refresh final engine identity after any cure. Do not start another drain until this one is finished.
3. Re-triage the pending lane-a `gr-campaign-fixture-cleanup-1` attempt-2 done-move. Its cleanup guarantee and failure-output retention remain worth landing despite this successful sweep. Preserve the attended holds-1 → holds-2 → holds-3 dispatch chain; no fire refill or re-queue.
4. Keep the three Owner's Desk items visible. Execute the September 27 ticker after September 28 06:00 local, and the next private backup/memory coverage duty after September 28 02:10 UTC. No other scope was invented.

After the lawful fast-forward, the exact direct-main gate shape is:

```sh
/opt/homebrew/bin/node -e 'const cp=require("child_process");cp.execFileSync(process.execPath,["scripts/gate-battery.mjs","--transcript","artifacts/NEXT-FIRE/full-node-main.txt","--label","Run 10 post-landing main",JSON.stringify([["full Node on main","npm","run","test:node-guards"]])],{env:{...process.env,PATH:"/opt/homebrew/bin:"+process.env.PATH},stdio:"inherit"})'
```

Replace `NEXT-FIRE` with that fire's own evidence directory. This command is a next step, not evidence that main was tested by s2720. The final ledger result and clearing commit are recorded below before exit.


## Final ledger and handoff

Gate checkpoint: `f4171afa06627f9b7305cf8d599ad74f817b2f82`. Full ledger **rc 0, 1263/1263, zero failures or skips, every chained audit green, final kit 83/83**, in **192.888 seconds**, Node 26.4.0. HEAD remained at that checkpoint for the battery. Exact receipts: `ledger-start.json`, `ledger-final.txt`, `ledger-result.json`, `ledger-summary.json`. The bounded STATUS archive audit passed inside the battery.

The predecessor archive and the complete three-item Owner's Desk were checked byte-for-byte. The clearing commit is the last write to main; only its backup push and read-only verification follow. The launcher retains its own process-lock directory until exit. No source merge, done-move rename, goal closure, dispatch, deploy or engine pin occurred. The next action is the ordered landing procedure above, with this complete candidate proof retained.
