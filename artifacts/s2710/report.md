# s2710 — Play proofs 8 clears the direct full Node gate

**READY-FOR-GATES — FINAL LANDING PENDING.** WHY NO PRODUCT MERGE: the required direct full Node continuation took 36.5 minutes and consumed this fire's drain window. It finished successfully. Landing would also require a second full Node command on main; the recent measured precedent took 42.1 minutes. No second long gate cycle was started. This is a completed gate increment, not a shipping claim.

Lock commit `762434518`; synchronized candidate `7910baa342b020c281454b6236bb71a3c3d40f20` at `/Users/robin/.goldrush/fire-s2709/wt-pp8`; source tip `e1b6c1ea129577a07eb8cf853d08e3c6b61d46d0`. Review: `reviews/sol-play-proofs-8.md`.

## What completed

- Direct **npm run test:node-guards: rc 0, 2191.3 seconds**, Node 26.4.0, normal fire file concurrency 1. **1040 tests: 1032 pass, 8 declared skips, zero failures**. All npm chained legs completed; final leg **87/87**. `full-node.txt`, `full-node-result.json`, `full-node-summary.txt`.
- Root cause of the earlier interruption: the outer diff wrapper caps an npm child at 900 seconds; **fixture teardown alone passed in 910.721 seconds**. Direct invocation removed that outer wrapper, without editing any timeout, watchdog, test or source. Longest TAP silence **905.3 seconds**, below the existing 2700-second watchdog. `progress.jsonl` records the advancing fixture children.
- Newer main bookkeeping merged without conflict. The complete diff from the prior tested candidate contains no executable, test, dependency or art change. The independent npm-ci checkout and landed scratch store are preserved. `input-equivalence.json`, `evidence-reuse.json`, `sync-main.txt`.
- Reused complete s2709 receipts: TypeScript, normal/E1 builds rc 0; E1 entry **34,350,664 B**; adjacent/plain-boot tests **42/42**, both projects; eight plain boots with zero browser errors; opt-in specs **12 correctly skipped** with the flag unset; fresh Regatta **2/2**, complete terminal/bank/Book/reload. All 14 original compact rows previously matched their raw evidence; the source blobs are unchanged.
- Final engine measurement: main = candidate = era **6**, pin **71**, `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`; store `5793a967da46e8f00c0ba16f92f17dc10d36558d`. No pin is justified or made. `engine-final.json`.
- The unbounded archive-audit invocation exhausted Node 23's heap (exit 134). Its stdout and launcher stderr are retained. The existing bounded ledger form, `--limit 40 --quiet`, passed under Node 26: zero lost or abridged handoffs. This was an invocation correction, not a product finding or a checker change. `archive-unbounded-result.json`, `status-archive-bounded.txt`.

## Verified inherited state and duties

This launcher's PID 11603 owns the fresh fire directory; Codex PID 11648 descends from it. The preceding launcher ended at local 20:09:14, this one started at 20:14:14. No stale lock was taken over. The process directory's mtime was renewed during the long gate; the launcher retains cleanup ownership. The main-slot semaphore is the ACTIVE-present / lock-CLEARED-absent predicate at `scripts/lane-runner-v3.sh:239`.

Fresh primary policy is CLEAR. One real done-move remains, no unknowns; lane-c has six unabsorbed commits. The implementer's newest log ended READY-FOR-GATES with 320,612 tokens, not a credit-wall interruption. Runner PID 25494 is alive and independent. Queues, in-flight work, pending assay orders and art staging were empty; health landing/game/API returned 200. CODEX-WALL still bars autonomous refill; run 9 → run 10 → holds-1 dispatch remains attended-owned. No task was dispatched, no done-move renamed, and no goal marked merged.

LB-01 is current: 35/35 coverage days, August 24 through September 27, outside this public repo. FM-01 source remains 848 files, newest modification September 25 20:26:40.486Z; private archive heads match the discharged daily duties. September 26 ticker exists; r2026w40 already opens September 28. No repeated backup write, Gazette item, rotation mint, assay, art processing or deploy was due. `duties.json`, `ledger-freshness.txt`, `health.txt` and the board probes record the checks.

The complete prior s2709 handoff was archived byte-for-byte; the three-item OWNER'S DESK tail is preserved. No new owner decision is requested. Inherited log/dashboard churn and unrelated attended files are preserved.

## REMAINING LIST IN ORDER

1. Recheck primary policy, custody and main drift; synchronize only after classifying newer bookkeeping into the preserved candidate. Reuse this complete gate and s2709 browser/build evidence only with unchanged executable/test/dependency/art inputs. Do not repeat the 900-second wrapper.
2. Complete final engine/budget verification and the drain commit set: review, goal status/mergeHash, BACKLOG and done-move rename together; fast-forward main and push. Run the full Node command on main after landing, with its own fire window. This test-only slice needs no runtime deployment or player-visible Gazette item.
3. Leave attended jobs to dispatch run 9, then run 10, then holds-1. Ten untouched maps remain in order: Half-Life Hollow, Picnic, Showroom, Dead Band, Echo Canyon, Relay Rush, Relay Valley, Mare Claim, Archive World, Ember Shore. Existing Long Road/Deepwater objective and Glow Mesa bank-driver holds retain their corrective owner; no balance defect was inferred.
4. Next daily duties when due. Existing owner items remain the account-registry deploy day, phone device verdict rows and token revocation.

## Closeout

Ledger verification and final clearing commit are pending at this report revision. The clearing commit must be the last write to main.
