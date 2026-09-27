# s2706 — Retention landing verified and obsolete holds retired

WHY NO PRODUCT MERGE: the attended session already landed the retention corrective as `4615253db` and completed its ledger update in `ecc71a4df`. The done-board probe reports zero real drains and zero unknowns; all four lane branches have zero commits ahead of main. This fire reconciles stale hold descriptions and verifies the completed landing. It does not repeat a drain, dispatch run 8, or deploy.

READY-FOR-GATES — bookkeeping and standing-duty verification. The final ledger-battery result is recorded below before the lock-clearing commit.

## Current facts and changes

- Lock commit: `1168df70b`. Process ancestry proves this fire owns the fresh process lock: launcher 61051 → Node 63445 → Codex 63522 → this shell. Runner 25494 is independently parented by PID 1 and alive. Stamps come from `date -u`; the runner semaphore is `scripts/lane-runner-v3.sh:239`, ACTIVE present and lock CLEARED absent.
- Main started at `7178d48dd`, after attended landing `4615253db`, offload `9dfaa7986`, and ledger commit `ecc71a4df`. The fire preserves the original done-moves and the attended source archive. No source, tests, budgets, runtime gates, or archived evidence changed.
- Root cause of the stale state: the attended landing set both goal statuses to merged and added its landed row, while the prior F-2704-1 row, run-7/retention ladder descriptions, original review, and retention leaf's blocked fields still described the pre-archive hold. Those current descriptions now resolve the hold against verified evidence. The original review's historical report remains intact below an explicit current disposition. Historical held dates remain in the goal records.
- Full unchanged verifier: **231/231 original evidence hashes retained; 230 archived files / 86,011,222 B**, with the live helper, six specs, shared driver, manifest, report, pointer and preview preserved. `archive-verification.txt`.
- Local archive is clean and matches the remote evidence head `65f83e203bbb7d8f67c72f65d18f3db4a0f9582a`. Both credential-free remotes resolve to `Agent-Town/GoldRush-archive`; current GitHub visibility is PRIVATE. `archive-identity.json`, `duties.json`. No private rows or memory contents were copied into this public tree.
- Actual complete landed range `4615253db^1..ecc71a4df`: **7,230,021 added evidence bytes, 53 changed evidence paths, below 40,000,000 B**. `landed-budget.json`. The earlier **6,822,605 B** figure remains the local fixture measurement; it is not relabelled as this full-range result. Final runtime/drain gates remain the attended measurements in `reviews/play-proofs-evidence-retention-1.md`; this fire did not rerun or claim them.
- The six map verdicts remain one PASS (Drill Yard, both screens) and five HELD. No map defect, gameplay cure, or new proof is claimed. No Gazette item is due: this was evidence retention with no player-visible runtime change or engine pin, as the original review states.

## Board and standing duties, independently refreshed

- `lane-usable.mjs --all` completed successfully: A/B/C/D each ahead 0; four of 52 registered worktrees covered directly, 48 unreported with zero ahead or unanswerable. Older B/D run-surface drift remains informational; no refill is authorized. Newest runner log is the successful lane-a retention task, with its acceptance report and no credit-wall interruption. No new failed entry since September 20.
- `dry-board-probe.mjs`: 1,455 done-moves, 75 subjects, **0 real drains, 0 unknowns, 13 closed/blocked, 62 merged**. DRY applies to this verified snapshot of the done-board and lanes, not to completion of the product backlog.
- Health: landing/game/API **200**, runner alive, no queue or running task, no pending crafting order, no staged art. `health.txt`. No runner restart, assayer order verdict or art-staging duty was triggered. Existing log/cache/evidence churn and old untracked attended mpp1 landing files were left intact.
- Run 8's goal is marked queued by the attended session, and the predecessor landing is satisfied. The strict policy check is CLEAR (`run8-policy.txt`). No queue/running copy or new run-8 log was observed at the fire's verification. The task explicitly reserves dispatch for the attended session; this fire does not copy it into a queue or interfere with that queue job.
- LB-01: strict current freshness **35/35 coverage days**, August 24 through September 27, with today's mirror present outside the public repo. Remote ledger-backups head `9e4c2a9d4e5840189ac9ba79366814adba2c57cc` matches today's completed s2696 duty. `ledger-freshness.txt`, `duties.json`.
- FM-01: source remains **848 files**, newest modification `2026-09-25T20:26:40.486Z`; remote fire-memory head remains `53d87470fb2670626fb4605d4dc0eb5bffd899fb`, matching today's discharged duty. No redundant mirror operation.
- RT-01: r2026w40 is present and opens September 28 at 00:00 UTC; no mint owed. TK-01: September 26 digest exists; the next digest is due after 06:00 local September 28. `duties.json`.
- Exact inherited s2705 line 1, including its attended addition, is archived in STATUS. The three-item OWNER'S DESK tail is carried verbatim. Bounded archive audit passes with zero permanently absent or abridged handoffs. `predecessor.txt`, `desk-tail.txt`.

## REMAINING LIST IN ORDER

1. Attended run-8 dispatch/queue-job coordination, then the campaign's normal evidence and drain gates. The predecessor landing is complete; no fire dispatch under the task's ownership rule.
2. Next coverage-day duties; existing owner items remain account-registry deploy day, phone device verdict rows, and token revocation.

## Final verification

Pending the required unchanged `npm run test:ledger-guards`; the process lock and ACTIVE semaphore remain held until this passes and the final commit is ready. The lock-clearing commit will be the last write to main, followed by push and read-only verification.
