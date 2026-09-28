# s2748 — Repair candidate covers the earlier checkpoint

WHY no product drain: the current board and four runner lanes are DRY. There are zero real drains or unknowns, zero ahead commits on each lane, and no queued/running tasks, pending orders or staged art. The latest runner log completed the already accepted audio persistence task. CODEX-WALL forbids independent fire refills and dispatch. Five ahead scratch worktrees remain attended-owned.

The useful increment is a verified correction to the existing origin-repair handoff. Origin carries candidate `23f27b9407c0e192552e348d1dfe8597e18e6669`, whose commit map names old checkpoint `075e97b6c5b9b3a4dc95221dc1b10f94c45a0cc6`. Both tree hashes equal `3df9cafafb5dd15b3ad2f7412e062f1d8de6cc35`. That snapshot predates accepted audio test drain `15da41c60`, implementation `bf65df7de`, and its review/evidence. The only subsequent difference under src/e2e/functions/assets is `e2e/audio-integration.spec.ts`; additional evidence and bookkeeping also differ. The existing F-2742-1 row and Owner's Desk now state this boundary. The candidate is an offsite backup through its checkpoint; it does not yet cover current main. Its final adoption remains owner-gated and attended-owned.

## Verification

- Origin main: `0979de76328c5a225f543d620f47c66a9f5c4382`. Historical trace remains 113,467,543 bytes and its introducing commit is still an ancestor of main. No unchanged push retry, history rewrite, deletion or pointer move.
- Board: zero real, zero unknown; four runner branches ahead=0. Independent runner PID 25494, PPID 1, alive. Launcher 63267 owns this session's fresh fire directory; child Codex ancestry confirmed. Main semaphore is `scripts/lane-runner-v3.sh:239`.
- Health: landing/game/API 200/200/200, health command rc 0. No new failed run since the predecessor.
- LB-01/FM-01 receipts: September 28 completed at 02:19Z and 02:10Z, both rc 0. Current private mirror coverage 36/36 through September 28. Live private archive heads match prior receipts: ledger `409ffd397abde6b0d465fb8a79be145112f9e9f6`, fire-memory `53d87470fb2670626fb4605d4dc0eb5bffd899fb`. Nothing copied into the public repository.
- Yesterday's ticker already exists, using September 27 local midnight through September 28 local midnight (UTC+07) and its busy-day control. Week 40 is present; skillmd 19/19, zero failures, 19.253 seconds. Week 41 is due September 30; no premature mint or publication.
- Initial status archive audit reported the temporarily unarchived s2747 line; the exact saved predecessor was restored before the closing checkpoint. Four-item desk tail will be retained byte-for-byte. This is bookkeeping only, so no product/browser gate or engine pin is claimed from this fire.

## Remaining list in order

1. Owner decides F-2742-1; attended repair refreshes the candidate to include the accepted audio drain and later evidence before moving main.
2. Owner listens to the before/after audio and chooses keep or revert; inherited four-item desk stays unchanged.
3. Next daily private coverage September 29 after 02:10 UTC; week-41 mint September 30.

## Closing verification

Pending the complete literal `npm run test:ledger-guards` before lock clearance. Lock commit: `fc52aa058`. All final receipts will be included in the clearing commit, which is the last write to main.
