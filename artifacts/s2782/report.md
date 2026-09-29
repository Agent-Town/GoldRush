# s2782 — Dry board and current heartbeat coverage

WHY no product drain: the board has **0 real drains and 0 unknowns**. All four runner lanes have **0 ahead commits and 0 tracked dirt**. Queues, running tasks and pending crafting orders are empty; staged art is zero. The five ahead worktrees outside the runner fleet remain attended-owned. CODEX-WALL still prohibits independent fire dispatch and refill.

## Verification at 2026-09-29T00:19Z

- This fire owns the process lock: agent 76644 descends through wrapper 76643 from launcher 76598, all started at 07:16:42 local. The lock directory matches that launch. The launcher is running Codex under the September 26 owner ruling in `tasks/BACKLOG.md:109` and `scripts/fire-runner.sh:119`. Runner 25494 is alive, PPID 1, independent of this fire. The main-slot semaphore is the ACTIVE-without-lock-CLEARED predicate at `scripts/lane-runner-v3.sh:239`.
- Lock commit `beeb85e92` archived the exact s2781 predecessor; `ad5332dd3` preserved inherited dashboard bookkeeping. Further generated log changes belong to the runtime writer. The four-item Owner's Desk tail is saved for exact restoration.
- Ledger read through `scripts/ledger-corpus.mjs`: 19 files. Board: 88 subjects, 13 closed/blocked and 75 merged ghosts. No new failed run; newest failed-entry mtime is September 20. Latest runner output ended READY-FOR-GATES at 147,262 tokens; accepted audio-test drain `15da41c60` is an ancestor of main and its goal is merged. No implementer model call was made.
- Health: landing/game/API **200/200/200**. No pending order needs an assayer verdict, and no art landing requires a staging audit.
- Private coverage: `node scripts/ledger-mirror-freshness.mjs --strict` passed, **36/36 days**, August 24 through September 28, outside the public repository. Live archive heads match the completed s2727 receipts: ledger-backups `409ffd397`, fire-memory `53d87470f`. September 29 coverage becomes due after **02:10 UTC**; no early pull was made.
- TK-01 is already discharged by `marketing/outbox/ticker-digest-2026-09-28.md`; publication remains owner-only. RT-01: r2026w40 opens September 28; week 41 is due September 30 after **00:00 UTC**, for the October 5 opening.
- F-2742-1: live origin main/candidate remain `0979de763` / `23f27b940`. The historical trace remains **113,467,543 B** and its introducing commit remains reachable from main. Repair is owner-gated and attended-owned. No unchanged rejected push was retried. Candidate coverage remains the dated s2748 receipt, not a fresh tree comparison; the repair must preserve `15da41c60` and later evidence.
- Bounded status archive audit: **0 permanently absent, 0 abridged**. No source, existing assertions, goal, BACKLOG row, law, deployment or history repair changed. No player-visible merge requires Gazette news.

Evidence: `dry-board.txt`, `lane-usable.txt`, `health.txt`, `freshness.txt`, `status-archive.txt`, `inventory.json`, `latest-run-tail.txt`, `runner.txt`, `process-custody.txt`, `origin-heads.txt`, `private-heads.txt`. Prior backup receipts: `artifacts/s2727/`.

## Remaining list in order

1. Owner decision on F-2742-1, then attended repair refreshed against current main and preserving the accepted audio-test drain and subsequent evidence.
2. Owner audio listen and keep/revert decision; inherited Owner's Desk remains verbatim.
3. Owner approval of the September 28 ticker; publication remains owner-only.
4. September 29 private coverage after 02:10 UTC; week-41 mint September 30 after 00:00 UTC.

Closing `npm run test:ledger-guards` runs under Node 26.4.0, including child PATH, before the final lock-clearing commit. Its receipt follows below.
