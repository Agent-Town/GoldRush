import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = 'artifacts/s3371';
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const initial = fs.readFileSync(`${dir}/lock.txt`, 'utf8').trim();
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').trim();
const desk = fs.readFileSync(`${dir}/desk-tail.txt`, 'utf8').trim();
const status = fs.readFileSync('STATUS.md', 'utf8');
if (status.split('\n')[0] !== initial || !status.includes(`- **s3370 handoff (line-1 archive):** ${previous}`)) throw Error('Ownership or predecessor archive changed');
const notOwed = previous.slice(previous.indexOf('DESK-NOT-OWED:'), previous.indexOf("🔺 **OWNER'S DESK")).trim();
if (!notOwed.includes('F-2987-1') || !notOwed.includes('F-2742-1')) throw Error('Missing inherited desk dispositions');
const summary = 'WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; all four lanes absorbed. Runner PID 26518 remains alive. Nine public checks healthy. October 26 private duties current, coverage 64/64; October 25 ticker complete. Next: October 27 daily duties and existing attended/owner follow-up. Evidence artifacts/s3371/report.md and ledger-result.json.';
const body = `${summary} ${notOwed} ${desk}`;
const active = `ACTIVE ${stamp} (s3371 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${active}\n\n- **s3371 lock (line-1 archive):** ${initial}\n${status.slice(status.indexOf('\n') + 1)}`);
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');

const verification = `Fresh dry-board and lane probes classify 1,483 done-moves into 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty. Six queues, running tasks and pending crafting orders are empty; none of 118 historical failures is newer than s3370. Five worktrees are registered, zero unreported ahead trees. The newest implementer log's index-lock error is historical: delivery 4fe2becb8, drain b5d6d3c32 and bookkeeping 614f84ca5 are main ancestors, and assayer-sync-visibility-1 is merged in goals.json. No retry is owed. CODEX-WALL and attended custody remain in force. Future subscription capacity is unverified; any authorized future dispatch needs a dependency-aware lane refresh.

Launcher 30804 → 31785 → 31852 owns the process lock created at 2026-10-26T10:45:13.828Z, matching 17:45:14 local FIRE START. The preceding actual fire ended at 16:45:11 local with rc 0. The live ancestor chain establishes ownership; embedded transcript text alone does not. Runner PID 26518, PPID 1, TTY ??, start 12:52:54 local remains alive, independently verified by ps and health-watch. No restart was needed. Main's semaphore is ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex; no additional agent was dispatched. Launcher cleanup owns tasks/.fire.lock.

At 10:46 UTC, nine public GETs returned HTTP 200 and all five API bodies parsed as ok:true. Canonical and direct Pages week-44 transfer standings and the week-43 control passed. Public build 299b1db5 advertises weeks 37–44. The complete eight-rotation skill fence equals the registry; skill documentation checks passed 19/19. The preceding Wednesday mint is discharged; the next Wednesday window has not opened. These reads do not establish server runtime metadata or fresh replay acceptance.

October 26 LB-01/FM-01 execution receipts were read from s3366/s3365. Freshness independently proves 64/64 days August 24–October 26. Live archive visibility is PRIVATE; remote ledger-backups c73ab92bc8bcff05eaf4770dd73cfdaad268cfdc and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match the receipts. No duplicate daily push and no private corpus entered the public tree. October 25 ticker and its completion row were read; a91b3d9f8 is a main ancestor. Its historical day census was not repeated. No player-visible change or engine pin landed, so no Gazette item is owed. Publication remains owner-only.

The 19-file ledger corpus was accessed through ledger-corpus.mjs, with current duty and custody rows read. Attended F-STO-1 storage custody remains unchanged; 7b619795b is a main ancestor. Storage measurements were not repeated. Historical untracked attended files, evidence and run notes remain in place.`;
const validation = `Lock commit bfd7b801b and inherited dashboard bookkeeping 7f9736e59 preserve the starting state. Previous evidence harnesses were read and adapted for s3371 and this launcher. No product defect required repair; no source, assertion, roster or timeout changed. This bookkeeping-only increment does not require product build or browser gates.

Closing validation runs npm run test:ledger-guards on .nvmrc Node 26.4.0, with process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools and the existing evidence-local --test-concurrency=1 adapter; /usr/sbin and /sbin stay on PATH. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. The tested handoff remains ACTIVE until green, then only its lock/stamp envelope changes. The clearing commit is the last main write, followed by origin backup. The predecessor and initial ACTIVE line are archived; the Owner's Desk tail and inherited DESK-NOT-OWED dispositions are preserved verbatim.`;
const remaining = `1. October 26 ticker after October 27 06:00 local; October 27 LB-01/FM-01 after 02:10 UTC.
2. Owner approval/publication of existing ticker drafts.
3. Existing Owner's Desk: account-registry deploy day, B1 phone verdict rows, token-revocation support follow-up.
4. Attended F-STO-1 storage follow-up; include landed assayer diagnostics in the next authorized attended deployment.`;
fs.writeFileSync(`${dir}/report.md`, `# s3371 fire — dry board and current heartbeat duties\n\n${stamp}. ${summary}\n\nREADY-FOR-GATES — bookkeeping and heartbeat only. Closing acceptance: [ledger-result.json](ledger-result.json).\n\n## Verification\n\n${verification}\n\n## Changes and validation\n\n${validation}\n\n## Remaining list in order\n\n${remaining}\n`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.readFileSync(handover, 'utf8');
fs.appendFileSync(handover, `\n\n### s3371 verification: dry board, live runner and current duties\n\n${stamp}. ${summary}\n\n${verification}\n\nLock bfd7b801b; inherited bookkeeping 7f9736e59. Adaptations and ordered remainder: artifacts/s3371/report.md. Closing acceptance requires ledger-result.json code 0 with unchanged inputs and HEAD. Ledger checks precede the clearing commit; origin backup follows. Owner's Desk carried verbatim.\n`);
console.log('Prepared ACTIVE handoff', stamp);
