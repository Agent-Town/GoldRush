# s3403 fire — week 45 prepared and the dry board verified

READY-FOR-GATES for the RT-01 standing duty. Week 45 landed as `685bd41d9`; lock `896c7887e`, inherited bookkeeping `c0819bef4`. The rotation opens November 2 00:00 UTC and closes November 9 00:00 UTC. Production deployment remains pending for the next authorized landing. Review: `reviews/rotation-r2026w45.md`.

WHY no lane drain: the board is DRY, with 95 subjects, zero eligible drains or unknowns, and four absorbed lane histories. CODEX-WALL remains in force. No refills, dispatches, retries or scratch-tree interventions occurred.

## Measured evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Board | 95 subjects: 82 merged, 13 closed/blocked; zero eligible or unknown | dry-board.txt |
| Lanes and queues | Four empty `main..branch` logs, zero tracked lane dirt; five registered worktrees, no unreported ahead tree; all six queues, running tasks and pending crafting orders empty | lane-usable.txt, duties.json, queue-state.json |
| Failed runs | 118 historical failures, none newer than s3402; newest run's index-lock obstruction is historical, with delivery `4fe2becb8`, drain `b5d6d3c32` and record `614f84ca5` verified main ancestors; the goal is merged with that drain hash | duties.json; disk-local latest-run-tail.txt |
| Processes | Runner 26518 alive under parent 1; launcher 94440 → 94484 → 94485 owns this fire's directory lock, created 00:20:55 UTC, matching 07:20:56 local FIRE START | launcher.json, runner-scan.json, health.txt |
| Rotation | Previous week re-derived exactly, 6/6 seeds; eight historical entries unchanged; one new entry with six seeds; whole nine-rotation skill fence matches | rotation-control.json, rotation-invariants.json, rotation-guards.txt |
| Gates | Named tests 36/36; TypeScript, normal build and E1 build exit 0; E1 payload 34,355,296 B against 52,000,000 B | rotation-guard-result.json, build-receipts.jsonl, first-town-payload.json |
| Public sample at 00:21 UTC | Nine GETs HTTP 200; five API bodies `ok:true`; both stats bodies contain an object with `empty:false`; public build `299b1db5` advertises weeks 37–44 | live-probe.json |
| Private coverage | 65/65 days August 24–October 27; live PRIVATE archive heads match October 27 receipts: ledger-backups `7c35ab16200f1961f49b50ab03bdbb60bc4954fa`, fire-memory `53d87470fb2670626fb4605d4dc0eb5bffd899fb` | mirror-freshness.txt, private-heads.txt, private-visibility.json |
| News | October 27 ticker and its completion row read; `49db2f8b5` verified as a main ancestor. One week-45 Gazette draft appended. | duties.json, ledger-selection.json, marketing/outbox/gazette-queue.md |

## Verification, adaptations and limits

The nineteen-file ledger corpus was read through `scripts/ledger-corpus.mjs`, including the current duty and custody rows. Latest attended handover §13z-116 and the relevant Owner's Desk entries were read. F-STO-1 remains attended-owned; `7b619795b` is a main ancestor, but storage measurements were not repeated. The ticker's completed historical census was not repeated. Current subscription capacity is unverified: the runner probe proves branch absorption, not quota. Any later authorized dispatch needs a dependency-aware lane refresh.

The process lock belongs to this launcher; no predecessor was displaced. The runner's semaphore remains `scripts/lane-runner-v3.sh:322`: ACTIVE and not lock CLEARED. The actual launcher uses Codex under the owner switch at `scripts/fire-runner.sh:119`, despite the supplied protocol's historical Claude wording.

This is the prescribed weekly data update on main, not a lane integration. The only product files changed are the rotation registry and its documentation fence, 13 added lines each. Neither is in `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36`), so no engine pin or era change is needed. No new canon, simulation rule or renderer behavior was introduced. Browser drain gates do not apply to this data duty; gameplay, fresh replay acceptance and server runtime metadata were not tested. The HTTP samples establish point-in-time responses only.

The previous fire's read-only probe and ledger harness were adapted to s3403, the current launcher and new review. The initial rotation test shell printed a tail after the test; all 36 tests passed, and the unchanged checks were repeated once with direct exit capture (exit 0). Assertions and timeouts are unchanged. Shell wildcard/search mistakes during inspection were corrected without repository source changes. No product root cause required repair.

LB-01/FM-01 October 28 are not due before 02:10 UTC. Yesterday's execution receipts were read and their remote heads freshly checked; no duplicate pull or push occurred, and private corpus data stays outside this public repository. The closing ledger battery checks mirror exposure. The Gazette draft remains owner-only for publication.

The exact s3402 handoff and initial s3403 ACTIVE line are archived in STATUS. The Owner's Desk tail and DESK-NOT-OWED acknowledgements are preserved verbatim. This report and the ACTIVE handoff are frozen before `npm run test:ledger-guards`, run under `.nvmrc` Node 26.4.0 with process-local `DEVELOPER_DIR=/Library/Developer/CommandLineTools`, full system PATH and the evidence-local serial scheduling adapter. The maintained package command, test roster, assertions and timeouts are unchanged. Acceptance requires `ledger-result.json` code 0, unchanged true and headUnchanged true. Only the lock/stamp envelope changes after green; the clearing commit is the last main write, followed by origin backup. The final hash and remote verification go in the external vault digest and final response. Generated dashboard churn remains with its writer.

## Remaining list in order

1. Carry week 45 with the next authorized deployment before November 2 00:00 UTC; require ASSAYER SYNCED and served registry/standings verification. The standing mint does not establish production release acceptance.
2. October 28 LB-01/FM-01 after 02:10 UTC; October 28 ticker after October 29 06:00 local. Week-45 mint is discharged.
3. Existing Owner's Desk: account-registry deploy evening, B1 phone verdict rows and token-revocation support follow-up; owner publication of news drafts.
4. Attended F-STO-1 and F-CUT-1 follow-up; include the landed assayer diagnostics in the next authorized deployment.
