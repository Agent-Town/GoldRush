# s3428 fire — dry board and current private coverage

READY-FOR-GATES for bookkeeping closeout. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true.

WHY no product landing: all 95 done-move subjects resolve merged or closed/blocked, the four lane histories are absorbed, and CODEX-WALL prohibits fire dispatch. No due duty or new product defect was established. The fire preserved inherited dashboard bookkeeping and verified the heartbeat.

## Verification

- Board: 1,483 done-moves, 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty with zero tracked lane dirt. Five registered worktrees, zero unreported ahead or could-not-answer. Six queues, running tasks and pending crafting orders are empty. None of 118 historical failures is newer than s3427. Evidence: dry-board.txt, lanes.txt, queue-state.json and duties.json.
- Latest implementer log tasks/runs/20261023-085857-lane-a-assayer-sync-visibility-1.md.log was read. Its index-lock failure is historical: delivery 4fe2becb8, drain b5d6d3c32 and record 614f84ca5 are main ancestors, and the leaf is merged at that drain. No retry is due. Lane-usable establishes absorption, not future subscription capacity; an authorized dispatch needs a dependency-aware lane refresh. CODEX-WALL and attended custody remain. Evidence: latest-run-resolution.json and duties.json; raw run tail stays disk-local.
- Launcher ancestry 52755 → 53921 → 53932 matches the process lock created at 06:24:20 UTC and FIRE START 13:24:27 local. The actual launcher uses Codex despite the historical Claude heading. The predecessor ended at 12:24:16 local after its 05:23 UTC cleared handoff. Runner 26518 is alive under parent 1; ps and health-watch agree. No restart needed. The main-slot predicate is ACTIVE and not lock CLEARED, scripts/lane-runner-v3.sh:322. Launcher cleanup owns the process-lock directory. Evidence: launcher.json, runner-scan.json and health-watch.txt.
- Nine bounded public GETs at 06:26 UTC returned HTTP 200. All five API bodies parsed as ok:true; both stats objects report empty:false. Served build 299b1db5 advertises weeks 37–44. These are endpoint samples; browser gameplay, server runtime metadata and fresh replay acceptance were not tested. Evidence: live-probe.json.
- RT-01 discharged: local r2026w45 opens November 2 and closes November 9 at 00:00 UTC; mint 685bd41d9 is a main ancestor. All nine rotations match the skill fence. Skill documentation passed 19/19 with zero failures/skips under Node 26.4.0 (skillmd-tests.txt). Week 45 remains due with the next authorized attended deployment before opening, followed by ASSAYER SYNCED and served-registry parity. No deploy attempted.
- TK-01 October 28 is complete: its ticker and completion row were read. The draft records week-45 preparation and pending deployment. The completed historical census was not repeated; no duplicate ticker or Gazette item was created.
- October 29 LB-01/FM-01 were discharged by s3425. Fresh coverage is 67/67 days August 24–October 29. Both live PRIVATE archive heads match the receipts: ledger-backups 88b12b8235db77f95025a5f585e8379f5dc496bb and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. The prior strict exposure receipt (4,776 keys, zero account-class/unrecognised rows) was read, not rerun. No duplicate private pull/push. Evidence: duty-verification.json, private-heads.txt, private-visibility.json and mirror-freshness.txt; original execution receipts in artifacts/s3425/.
- The 19-file ledger corpus was accessed through ledger-corpus.mjs. Current duty/custody rows, attended handover §13z-116 and the Owner's Desk were read. F-STO-1/F-CUT-1 remain attended-owned; storage was not remeasured. Evidence: ledger-context.json.

## Adaptations and commits

Lock a28dc9f06; inherited dashboard bookkeeping 06384907d. Timestamp, elapsed-age and preceding-handoff refreshes were preserved. Later dashboard churn belongs to its live writer. Raw run tails remain disk-local under the retention amendment.

The write-docs skill guided the evidence-focused handoff. The previous fire's read-only heartbeat and ledger harness were adapted to this session's paths and launcher stamp. Tests select .nvmrc Node 26.4.0. The evidence-local node adapter adds --test-concurrency=1 only to the package ledger node --test entry; maintained scripts, assertions and timeouts remain unchanged. PATH includes /usr/sbin for lsof; DEVELOPER_DIR selects installed CommandLineTools. No source changes, drain, engine pin or art landing occurred, so drain-only build/browser gates do not apply.

The closing npm run test:ledger-guards follows the prepared report and handoff and precedes the clearing commit. Manifest inputs and HEAD must remain unchanged throughout the battery. Only the tested STATUS lock/stamp envelope changes after green. The clearing commit is the final main write, followed by origin backup. Exact predecessor and initial lock are archived; the Owner's Desk tail and acknowledgements are preserved verbatim. Find the closing hash with git log --all --grep='s3428: handoff'.

## REMAINING LIST IN ORDER

1. Carry r2026w45 with the next authorized attended deployment before November 2 00:00 UTC; require ASSAYER SYNCED and served-registry parity.
2. Execute October 30 LB-01/FM-01 after 02:10 UTC. The next ticker covers October 29, due October 30 after 06:00 local.
3. Existing Owner's Desk: account-registry deploy day, B1 phone verdict rows and token-revocation support follow-up. F-STO-1/F-CUT-1 retain attended custody; CODEX-WALL remains.
