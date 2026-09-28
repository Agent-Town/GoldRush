# s2704 — Play proofs finish, but their evidence exceeds the landing budget

WHY NO PRODUCT MERGE: `sol-play-proofs-7` completed during this fire's triage. Its first strict policy check passed, but the candidate adds 86,013,547 evidence bytes against the unchanged 40,000,000-byte ceiling. The existing offload plan marks all 231 files MUST-STAY. Main never received the candidate.

READY-FOR-GATES — blocker recorded, corrective authored, source preserved. This is a held drain, not a successful product landing. No deploy, refill, re-queue, archive move, native replay or balance change occurred.

## Verified factory state

- Lock commit `988c186e7`, s2704, UTC stamp from `date -u`. Launcher 40699 started September 27 at 17:02:13 local, Node 40743 and this Codex process 40744 below it. The lock directory has that start time; the preceding launcher ended at 16:57:13. This fire owns the launcher lock.
- `health-watch.txt`: runner alive, landing/game/API HTTP 200, queues/running/orders zero. Runner PID 25494 is under PID 1, not this fire; it was left alone. The main-slot semaphore is `scripts/lane-runner-v3.sh:239` (ACTIVE present, lock CLEARED absent).
- `dry-board.txt`: 1,454 done-moves, 74 subjects, 1 real drain, zero unknown. The source lane is six commits ahead. The board was not declared DRY.
- Source tip `0c43f9524443fc86272a530eced87515347aa3d4`; base `1ddb5f4537cf2765cfc384605e106bf40679c952`. Six new specs and 231 new evidence files, no shared-driver or runtime diff, no main-moved overlap and no new blob over 50 MB. Every path is in `classification.json`.
- Source-run verdicts, not independently replayed by this fire: Drill Yard PASS both screens; Dry Gulch, Night Shift, Hill Mine, Trestle and Moth Season HELD; 22 rides with zero reported console/page errors; no proven map defect. Full details remain on the source lane and in its local run log.
- No new failed runner entry since September 20. No pending crafting order or art-store output required an assay or staging audit.
- The attended session committed `01d9ea182` during this fire: run 8 authored and held until run 7 lands. That work was preserved; it does not authorize fire dispatch under CODEX-WALL.

## F-2704-1 and the bounded corrective

`evidence-budget-result.json` captures rc 1 and the exact base/tip. `offload-plan.json` records 231/231 files kept, zero movable bytes. The derived `artifacts/sol/play-proofs` pattern includes the existing driver output root, other live proof consumers and the new board-entry imports. The conservative archive policy is working as written; no scanner defect is claimed.

`reviews/sol-play-proofs-7.md`, its BACKLOG row and original goal leaf now record the gate-side hold. The done-move and six source commits remain intact. Corrective `tasks/play-proofs-evidence-retention-1.md` and its goal leaf were authored together: separate the frozen record from live imports/output paths, keep all bytes and verdicts, verify the existing archive flow, then land within the unchanged ceiling. No guard or law was changed. The corrective is not dispatched and the existing owner desk is unchanged.

The full 6 MB reader census was moved intact to `~/.goldrush/fire-s2704/offload-plan-full.json`; the committed evidence contains only the relevant derivation and counts. No evidence was deleted. The older Obsidian/memory notes were used for orientation only; current repository law and commands supplied the reported state.

## Standing duties, rechecked

- RT-01: `r2026w40` exists, opening September 28 at 00:00 UTC; no mint due.
- TK-01: September 26 digest exists; September 27 digest is due after 06:00 local September 28.
- LB-01: s2696 recorded today's completed pull/push. The strict freshness check now confirms 35/35 coverage days, August 24 through September 27, without gaps. Private archive head `9e4c2a9d4e5840189ac9ba79366814adba2c57cc` was rechecked.
- FM-01: s2696 recorded the day's discharge. Source remains 848 files, latest modification September 25 at 20:26:40.486 UTC; private archive head `53d87470fb2670626fb4605d4dc0eb5bffd899fb` was rechecked. No redundant mirror push and no private contents copied into this repository.
- GZ-01: no player-visible merge or engine pin, so no news item due.

`duties.json`, `ledger-freshness.txt` and `processes.txt` retain the current probes. The exact s2703 handoff was restored as a line-1 archive bullet, and its three-item OWNER'S DESK tail is retained verbatim for the final handoff. The bounded archive audit reports zero absent or abridged predecessors.

## REMAINING LIST IN ORDER

1. Assign and complete the bounded evidence-packaging corrective, then satisfy the original goal's size/retention condition and lift its gate-side hold in the same commit.
2. Gate run 7 on the merged candidate and land only if its normal gates pass. No fire refill under CODEX-WALL; run 8 is already authored and waits for this landing.
3. Continue the 16 untouched maps in the order preserved in the source run note and review; the five new holds are driver/QA follow-ups, not proven balance defects.
4. Next coverage-day backup duties and the September 27 ticker; inherited owner items remain account-registry deploy day, B1 device verdict rows and token revocation.

## Final verification

The ledger battery runs after the new rows/master/review are present and before the final lock-clearing commit. Exact results are appended below before that commit; push and read-only verification follow it.

The prescribed `npm run test:ledger-guards` passed unchanged: **rc 0, 1263/1263**, zero failures, cancellations or skips, all chained guard and shell legs green including the final kit **83/83**. Elapsed **190.160 s**, completed **2026-09-27T10:16:11.847Z**, Node v23.11.1. No retry, assertion change or timeout adjustment. Evidence: `ledger-guards.txt`, `ledger-result.json`.

Finding/master/goal/review commit: **27c6fe73f**. The final handoff commit is the last write to main; it preserves the exact three-item owner desk. Push and read-only verification follow.
