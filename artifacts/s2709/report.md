# s2709 — Play-proofs candidate preserved after the outer Node gate timeout

**READY-FOR-GATES — HELD, NOT LANDED.** WHY NO PRODUCT MERGE: the mandatory full Node gate was interrupted by the diff-wrapper's 900-second timeout during fixture teardown. A partial run cannot authorize landing. Browser and build gates completed; the preserved candidate needs the direct full-Node continuation documented below.

Lock commit `da85d7ea3`; detached candidate `e3375fbd10dbde323eb38e9d4ceec1d07aab0385` at `/Users/robin/.goldrush/fire-s2709/wt-pp8`; lane tip `e1b6c1ea129577a07eb8cf853d08e3c6b61d46d0`. Review: `reviews/sol-play-proofs-8.md`. No source was placed in main's working tree. No task was dispatched or re-queued, no goal was marked merged, no done-move renamed, no pin or deployment made.

## What this increment proved

- Clean detached checkout, `npm ci` rc 0, clean before merging; 103 source paths, no overlap with main, no conflicts, no blob over 50 MB. Regatta-only driver addition is isolated byte-for-byte.
- TypeScript, normal build and E1 build passed. Entry payload 34,350,664 B. Candidate evidence 4,146,186 B.
- Warmup 1/1; required adjacents plus plain boots **42/42**, both projects, workers=1. Eight plain boots have zero console/page errors. Six opt-in specs with flag unset: **12 skipped**, rc 0.
- Fresh Regatta movement proof **2/2**, full secure/bank/Book/reload journey and no errors, course finish 160.667 / 160.000 sim seconds. These are each screen's second ride, saved separately from the source evidence.
- All **14** original compact rows match the external raw rows apart from deliberate sample compaction. Source verdicts remain three both-screen passes (Flotilla, Regatta, Stillwater), Long Road and Deepwater holds, Glow Mesa partial. No map defect or balance change inferred.
- Diff-selected guards: **4/5 groups pass**, full Node child `signal:SIGTERM` at 900 s (outer gate 903.9 s), while running fixture teardown. Partial TAP contains no failing record; no full counts or chained-tail result exists. This is the known outer-wrapper class, reproduced by the exact mandated command, not a hang diagnosis. Existing recovery: `artifacts/s2693/report.md` and `artifacts/s2694/report.md`. No timeout or pipeline code changed.
- The linked-worktree policy check refused its frozen board (rc 2); the authoritative primary recheck passed. The first freshness invocation used a nonexistent script name; `ledger-mirror-freshness.mjs` was then run successfully. Both unsuccessful invocations remain in the evidence rather than being rewritten as successes.

## Verified inherited state and duties

This launcher's PID 85763 owns `tasks/.fire.lock`; Codex PID 85814 is its descendant. No stale-lock takeover. The previous s2708 handoff is archived byte-for-byte. The main-slot semaphore is the ACTIVE-present / lock-CLEARED-absent predicate at `scripts/lane-runner-v3.sh:239`.

The runner PID 25494 is alive, independent of this fire. Run 8's holder PID 21037 exited and the done-move appeared; six lane commits remain unabsorbed. The policy is clear, but the board is NOT DRY. Source run log ended READY-FOR-GATES with 320,612 tokens and no quota interruption. Other named lanes are ahead=0; all 47 unreported worktrees were ahead=0 at the probe. No refill is authorized by CODEX-WALL. The attended session's run-9/run-10/holds queue jobs retain dispatch ownership.

Health returned landing/game/API 200. All queues and pending orders were empty, art staging empty. No assay or art-staging duty triggered. Main's inherited log/dashboard churn was preserved. Attended task/handover commits arriving during the gate were left intact.

LB-01: 35/35 coverage days, August 24 through September 27; today's private mirror remains outside this public repository. FM-01: 848 source files, newest modification September 25 20:26:40.486Z, unchanged; private ledger-backups and fire-memory remote heads match the completed daily duties. No redundant push or private-row copy into the public tree. RT-01: r2026w40 already opens September 28 00:00 UTC. September 26 ticker exists; no new player-visible merge occurred, so no Gazette item is owed. `duties.json` and `ledger-freshness-corrected.txt` record the fresh checks.

All captured gate PIDs, including this fire's Vite PID 50566, are gone. The Vite was stopped by its own PID after browser gates; the wrapper ended the Node child. The candidate and its generated scratch evidence remain on disk. The drain lock is released by moving its directory intact after verification. Existing OWNER'S DESK items are preserved verbatim; no new decision requested.

## REMAINING LIST IN ORDER

1. Recheck primary policy and ownership, classify/merge newer main bookkeeping into `/Users/robin/.goldrush/fire-s2709/wt-pp8`. Keep the store at landed main. Do not reset the source lane or repeat implementation.
2. Run the DIRECT full Node command through the existing gate battery, with Node 26.4.0 and normal fire serialization. Use `resume-node-jobs.json`; do not repeat the capped diff wrapper. The full direct command took 2349.6 s in the recent s2694 precedent, so this continuation needs its own fire window. Read complete counts and all npm chained legs; control any actual red on clean main.
3. Reuse this fire's complete build/browser receipts only if executable inputs have not changed. Measure final engine identity after any cure; then land with the review, goal status/mergeHash, BACKLOG and done-move rename together, push and complete applicable post-landing gates. The unchanged engine identity here is `2d180e6b…`, era 6 pin 71; no new pin is justified by test-only changes.
4. Let the attended jobs dispatch run 9, then run 10, then `sol-play-proofs-holds-1`. The ten remaining contracts are Half-Life Hollow, Picnic, Showroom, Dead Band, Echo Canyon, Relay Rush, Relay Valley, Mare Claim, Archive World and Ember Shore, in that order.
5. Next daily coverage/ticker duties when due. Existing owner items remain the account-registry deploy day, phone device verdict rows and token revocation.

## Final verification

The full `npm run test:ledger-guards` command passed with **rc 0**, **1263/1263 tests, zero failures/skips**, all chained legs completed, in **188.483 seconds**, at 2026-09-27T13:07:45.908Z. It gated main `5aea8e594435d825c0edbde1a1faa367a9de7d7b`; the head was rechecked unchanged before clearing. Evidence: `ledger-final.txt`, `ledger-final-result.json`. The review/evidence/held-row commit is `5aea8e594`. This ledger green does not replace the incomplete gameplay Node gate. The final commit clears the lock and is the last write to main; it is then pushed. The done-board still has one real drain, zero unknowns; all queues are empty and lane-c remains six commits ahead (`final-state.json`).
