# s2711 — Play proofs 8 lands and passes the full main gate

**READY-FOR-GATES — LANDED, main verification complete; final ledger closeout follows below.** One evidence/test drain. Original merge `e3375fbd1`; synchronized merge `018c814afb23b4d683964c0be502d33d39021b5a`; metadata landing `9fafd73e624d9644007045a5a040a0ceaef1a3b6`, fast-forwarded and pushed. Source tip `e1b6c1ea1`; all six source commits are ancestors of main. Review: `reviews/sol-play-proofs-8.md`.

## Gates and evidence

- **Full Node on main: npm rc 0, 2529.827 s (42.2 minutes), 1032 pass / 8 skips / zero failures**, every chained leg including final **87/87**. Node 26.4.0, normal fire file concurrency 1. `main-node.txt`, `main-node-result.json`, `main-node-summary.txt`.
- Fixture teardown passed in **1001.698 s**; longest TAP silence **995.3 s**, below the unchanged 2700 s watchdog. This one required command exceeded the approximate drain window; no second drain was started and no timeout or test was changed. `progress.jsonl` records advancing child suites throughout.
- The copied scratch launcher errored AFTER the gate because it assigned the whole `runBattery` object to `process.exitCode`. The npm exit and battery overall are both **0**, preserved before the wrapper error; wrapper exit **1** is recorded separately in `launcher-result.json`. The final ledger launcher uses `result.overall`. This is an invocation/reporting correction, not a product failure, and does not justify repeating a complete 42-minute gate.
- Reused complete unchanged-input receipts: tsc, normal/E1 builds rc 0; E1 payload **34,350,664 B**; adjacents/plain boots **42/42**, both projects, workers=1; eight plain boots with zero console/page errors; six opt-in specs correctly skipped in 12 default projects; fresh Regatta **2/2**, full bank/Book/reload. Candidate full Node **1032 pass / 8 skips**, tail 87/87.
- Final synchronization changed **34 bookkeeping/evidence paths**, no executable/test/dependency/art inputs. Post-landing drift is STATUS and attended handover bookkeeping only (`b1ad4db5a`, preserved). `input-equivalence.json`, `final-state.json`.
- Engine identity remains era **6**, pin **71**, `2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d`; main and scratch store `5793a967da46e8f00c0ba16f92f17dc10d36558d`. No pin made. Source evidence **4,146,186 B**, under 25 MB task and 40 MB landing limits.

## Verdict and root causes

Flotilla, Regatta and Stillwater pass the terminal/bank/Book/reload journey on both screens. Long Road is HELD because its convoy was not engaged; Deepwater Claim is HELD because the driver did not engage deck construction/the boss. Glow Mesa is PARTIAL because its authored early ending did not satisfy the driver's wave-12 bank filter. These are proof-driver limits, not established balance/map defects. `sol-play-proofs-holds-1` already owns the corrective after runs 9 and 10. No new product finding or scope was invented.

The goal's status/mergeHash and the BACKLOG row closed in the drain metadata commit. `tasks/done/` is ignored local runner state: the original was copied to tracked `done-move.md`, then renamed to `tasks/done/drained-s2711-20260927-184043-sol-play-proofs-8.md` after fast-forward. `landing.json` preserves both paths.

## Verified inherited state and duties

The process lock belongs to launcher **87208** and Codex **87257**, not another fire. The ACTIVE-present / lock-CLEARED-absent main-slot semaphore is `scripts/lane-runner-v3.sh:239`. The independent runner **25494** is alive. Lock renewal during the long gate is recorded; the launcher retains cleanup ownership. No stale lock takeover. Main's unrelated log/dashboard churn and attended files were preserved.

Final board probes: **zero real drains, zero unknowns; all four lanes ahead=0**, no unreported ahead worktree, empty queues/in-flight/pending orders, no staged art; landing/game/API **200**. The original runner log ended READY-FOR-GATES with **320,612 tokens**, not a credit-wall interruption. CODEX-WALL still prohibits autonomous refills. Attended jobs **26814 / 80971 / 48041** are alive; run 9 waits for this process directory to disappear. `attended-jobs.json`, `health-final.txt`, `dry-board-final.txt`, `lanes-final.txt`.

LB-01: **35/35** days through September 27, outside the public repo. FM-01 unchanged at **848 files**, newest September 25 20:26:40.486Z; private remote heads match the discharged duty. September 26 ticker exists; r2026w40 opens September 28. No duplicate backup/mint, assay or art work was due. This test-only landing changes no player-visible runtime and owes no deployment or Gazette item. `duties.json`, `ledger-freshness.txt`.

The s2710 handoff is archived byte-for-byte; the three-item OWNER'S DESK tail is preserved verbatim. Bounded archive audit: **zero permanently absent or abridged handoffs**. No new owner decision. `status-archive.txt`, `final-state.json`.

## REMAINING LIST IN ORDER

1. Attended run-9 job dispatches after this fire exits: Half-Life Hollow, Picnic, Showroom, Dead Band, Echo Canyon, Relay Rush.
2. Attended run 10: Relay Valley, Mare Claim, Archive World, Ember Shore.
3. Attended holds-1 corrective: objective engagement and early-ending bank/snapshot instrumentation. Existing survival-ceiling holds stay with their current owner.
4. Next daily duties when due. Owner items remain account-registry deploy day, phone device verdict rows and token revocation.

## Closeout

Final ledger battery is run after these row/report changes and before the clearing commit. Its actual result is appended here before the last write to main.
