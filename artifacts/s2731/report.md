# s2731 — attended Holds-2 landing retains custody; Tape audit waits next

**READY-FOR-GATES — bookkeeping and verification increment, no product landing.** The attended Holds-2 landing already owns the active drain and has reached its main fast-forward wait. Starting the Tape audit drain would violate serial custody. This fire preserves the attended attribution edits and clears its lock after closing verification so that landing can finish.

## Verified state

- The process lock belongs to this invocation: launcher 73556, Codex 74042; runner 25494 is alive with PPID 1. Main-slot semaphore re-read in `scripts/lane-runner-v3.sh`: ACTIVE and no `lock CLEARED`. Lock commit `aa0f8c376`, command-derived UTC 04:17Z.
- Attended `land.sh` PID 56083 is alive. Its `sph2` receipt has candidate `2b59a24ab`, tsc/build/E1 exits 0, adjacent 26 pass / 2 fail, full Node 1035 pass / 5 skips / 0 fail, chained 87/87, `verdict: clean`, unchanged engine hash `2d180e6b…`, and candidate bookkeeping. There is no `main now`, `LAND-sph2-DONE`, or completed wrapper receipt. It remains **not landed on main** at this checkpoint; the current main leaf is not promoted by this fire.
- The two adjacent reds are the existing Tape Reel inheritance assertion on both projects. The attended review attributes them to unchanged pre-task source and tracks corrective `e7-tape-drawer-inheritance-1` under F-SPH2-2. Inherited review/config changes and generated dashboard/task statistics were preserved in `fe983df08`; this fire did not change a gate or assertion.
- Done-board has **2 real drains, 0 unknown, 13 closed/blocked, 63 merged ghosts**. Lane-a is 2 commits ahead with the completed Tape audit; lane-c is 14 ahead with Holds-2. The board is **not dry**. Attended-owned scratch worktrees are untouched. No fire queue, refill, retry, second drain, merge, deploy, or source edit.
- Latest runner log is `20260928-104617-lane-a-e7-tape-toggle-phone-hit-target-1.md.log`, ending READY-FOR-GATES. Its source verdict is an instrument artefact, no production change: reported unobscured hit tests reach the toggle. This proves control reachability under the audited fixtures, not native phone objectives or complete map playability. The inherited 18 pass / 2 controlled inheritance failures are source evidence, not fresh fire browser gates.
- No failed move is newer than the inherited 03:43Z handoff; pending crafting orders are empty. No art landing occurred. CODEX-WALL and attended sequencing remain in force.

Evidence: `processes.txt`, `attended-holds2-gates.txt`, `attended-holds2-wrapper.txt`, `latest-run-tail.txt`, `state.json`, `lane-usable.txt`, `dry-board.txt`, `health.txt`.

## Standing duties

Today's LB/FM duties were already discharged. Fresh verification of the external private ledger corpus and remote heads is saved in `ledger-freshness.txt` and `private-remote-heads.txt`; no private mirror enters this repository. September 27's ticker exists with its UTC+07 date window and busy-day control. Rotation r2026w40 opens September 28 and closes October 5; the next scheduled mint is Wednesday September 30. Fresh skillmd verification is saved in `skillmd.txt`.

No player-visible merge or engine pin changed in this fire, so no new Gazette item or deployment is due. The previous STATUS line and all three Owner's Desk items are retained verbatim.

## Remaining list in order

1. Let the already-running attended Holds-2 landing fast-forward, push, run its main checks, and record its final receipt after this fire process exits. Do not start a concurrent drain or retry native rides.
2. Drain `e7-tape-toggle-phone-hit-target-1` through strict policy, detached custody and required gates after the existing landing is complete. Preserve the inheritance control evidence and the separately authored corrective.
3. Attended sequencing owns Holds-3 and `e7-tape-drawer-inheritance-1`; this fire dispatches neither.
4. LB/FM next coverage day September 29 after 02:10 UTC; rotation mint September 30. The existing three-item Owner's Desk remains unchanged.

Closing ledger receipt and command-derived clearance are appended after verification. No gameplay success claim is added by this handoff.
