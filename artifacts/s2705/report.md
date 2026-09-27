# s2705 — Retention corrective completed; real archive still required

WHY NO PRODUCT MERGE: the first strict policy check of the actual done-move `tasks/done/20260927-160815-sol-play-proofs-7.md` returned rc 1, gate-side F-2704-1. The assigned lane-A corrective completed during this fire as `6974a5cc7`. The actual packaging commit still adds 92,667,152 evidence bytes; only the local post-offload fixture fits (6,822,605 B). Its task reserves the real archive step for attended coordination. Completion of packaging does not satisfy the original archive/40,000,000-byte landing condition. No candidate was placed in main.

READY-FOR-GATES — bookkeeping and heartbeat verification only. The original proof candidate is HELD, not approved to land. No new implementation, native ride, refill, re-queue, archive transfer or deploy occurred.

## Verified state and correction

- Lock `683928347`, s2705; stamp obtained from `date -u`. Process ancestry proves this fire owns `tasks/.fire.lock`: launcher 65127, Node 65172, Codex 65174. Runner PID 25494 is a separate child of PID 1, not this fire. The main-slot semaphore remains `scripts/lane-runner-v3.sh:239`: ACTIVE present and lock CLEARED absent.
- `6044a45fe` is the attended assignment/dispatch commit. Initially the run was live with Codex PIDs 34951/34952. It then done-moved to `tasks/done/20260927-171529-play-proofs-evidence-retention-1.md` and the runner committed `6974a5cc7900bf11e499d087a2bd463c59d0a4b9`. The run log contains the full acceptance report, not a credit wall. The fire left the implementation and its browser server alone.
- Two current BACKLOG descriptions, the original goal's blocked reason, and its review still said the corrective was not dispatched. They now name the attended dispatch and completed package. The original goal remains `blocked` / `gate-side`; no budget, policy or gate changed. The corrective leaf is now also gate-side blocked on the real archive and byte-budget condition, with its own review; neither leaf is falsely marked merged.
- Source lane tip remains `0c43f9524443fc86272a530eced87515347aa3d4`, six commits and 237 changed paths ahead, all preserved. The initial `lane-usable --all` returned rc 0: A BUSY; B/D ahead 0; C HOLDS. After completion A has one new preserved runner commit. It reports four of 51 worktrees, with zero ahead or unanswerable among the other 47. Full probe output is retained in the local launcher log; `lane-summary.json` records the measured summary.
- `dry-board.txt`: 1,454 done-moves, 74 subjects, zero actionable drains or unknowns; 14 closed/blocked including run 7, and 60 merged. Its done-directory DRY result does not mean the factory has no unfinished work: lane C retains held source. Lane A subsequently completed with its own held package; the original probe predates that done-move.
- `health-watch.txt`: runner alive; landing, game and API HTTP 200; queues empty, initially one task running, zero pending crafting orders, zero staged art files. `health-final.txt` refreshes the state after the corrective completed. No assay or art-staging duty was triggered. No newly failed runner entry since September 20.
- Initial main dirt was factory logs and untracked retained artifacts/cache/run logs, paused queues and attended mpp1 landing files. No uncommitted attended STATUS/task edits required a bookkeeping commit. None of that unrelated material was changed or staged by this fire.

## Completed package: independent verification and bounded hold

The initial strict policy check of the new corrective done-move passed (rc 0, queued leaf). The fire then independently compared every original source blob against the committed manifest and retained candidate blob: 231/231 SHA-256 and byte counts match, totaling 86,013,547 B. The 230 sealed files total 86,011,222 B; the live helper is 2,325 B. All six new specs and the shared driver match the source; all 282 changed paths fit the task firewall. The real candidate budget returns rc 1: 92,667,152 B added, unchanged ceiling 40,000,000 B. The claimed 6,822,605 B result is explicitly fixture-only.

Runner-reported checks, not rerun by this fire: tsc/build, 57/57 retention tests, 34/34 adjacent tests, 12 expected native-spec skips and zero-error desktop/390px plain boots. Its initial boot-probe setup failure remains recorded; its corrected normal profile-creation probe passed. The package and original evidence remain committed on their respective lanes, and both done-moves remain open. `reviews/play-proofs-evidence-retention-1.md` records the inherited F-2704-1 hold and exact attended coordination. The real archive was neither moved nor pushed by this fire.

Independent evidence: `corrective-verification.json`, `corrective-budget.txt`, `corrective-budget-full.json`, `corrective-policy.txt`. The first piped JSON budget capture truncated; its bytes remain in `corrective-budget-truncated.txt`, and direct-to-file capture produced the complete valid JSON. Exact source reports/commands were copied as `source-corrective-report.md` and `source-corrective-drain-commands.md`.

## Standing duties, verified against current state

- LB-01: the day was discharged by s2696 (`artifacts/s2696/report.md`). Current strict freshness probe rc 0: 35/35 calendar days, August 24 through September 27. Private archive branch remains `9e4c2a9d4e5840189ac9ba79366814adba2c57cc`.
- FM-01: s2696 discharged today's mirror. Current source remains 848 files, newest modification September 25 at 20:26:40.486 UTC, matching the predecessor; remote fire-memory head remains `53d87470fb2670626fb4605d4dc0eb5bffd899fb`. No redundant mirror operation or private content copied into this public tree.
- RT-01: registry contains r2026w40 opening September 28 at 00:00 UTC; nothing to mint.
- TK-01: the September 26 digest exists. The September 27 digest is due after 06:00 local September 28.
- GZ-01: this fire landed no player-visible change or engine pin, so no new item is due.

Commands/results are in `policy*.json`, `policy.txt`, `ledger-freshness*.json`, `ledger-freshness.txt`, `duties.json`, `processes.txt`, `health-watch.txt` and `dry-board.txt`. Current commands, not older memory, supplied every operational conclusion. The exact s2704 line 1 is archived in STATUS; its three-item OWNER'S DESK tail is carried verbatim. The bounded archive audit passed with zero absent or abridged handoffs.

## REMAINING LIST IN ORDER

1. Coordinate the attended real private-archive operation for completed package `6974a5cc7`, using its exact commands. Preserve the package and original source lane. All 231 original hashes are verified; the fixture does not discharge the remote archive step.
2. After verified retention/archive and a candidate within 40,000,000 added evidence bytes, lift F-2704-1 in the goal/ledger commit and run the full ordinary merged-tree drain gates. The source six commits and original done-move remain open.
3. The attended campaign can advance run 8 only after run 7 lands; no fire dispatch under CODEX-WALL.
4. Next coverage-day duties; existing owner items remain account-registry deploy day, phone device verdict rows, and token revocation.

## Final verification

The first unchanged ledger battery passed (rc 0, 314.016 s), but began while the corrective was still running and does not certify the subsequent completion rows. The final unchanged `npm run test:ledger-guards` passed against all completion/hold rows and the exact handoff: **rc 0, 1263/1263 tests, zero failures/cancellations/skips, all chained checks green, final kit 83/83**, **209.078 s**, completed **2026-09-27T10:38:33.678Z**, Node v23.11.1. The final desk and archive checks passed, including the exact three-item owner desk and zero absent/abridged handoffs. Evidence: `ledger-final.txt` and `ledger-final-result.json`. No test, timeout or assertion was changed. The lock-clearing commit is the final write to main, followed by push and read-only verification.
