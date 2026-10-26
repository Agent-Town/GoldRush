import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = 'artifacts/s3368';
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').trim();
const initial = fs.readFileSync(`${dir}/lock.txt`, 'utf8').trim();
const desk = fs.readFileSync(`${dir}/desk-tail.txt`, 'utf8').trim();
const status = fs.readFileSync('STATUS.md', 'utf8');
if (status.split('\n')[0] !== initial || status.includes('- **s3367 handoff (line-1 archive):**')) throw Error('Ownership changed or predecessor already archived');
const summary = 'WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; all four lanes absorbed. Restored runner PID 26518 remains alive. Nine public checks healthy. October 26 private duties current, coverage 64/64; October 25 ticker complete. Next: October 27 daily duties and existing attended/owner follow-up. Evidence artifacts/s3368/report.md and ledger-result.json.';
const exclusions = previous.slice(previous.indexOf('DESK-NOT-OWED:'), previous.indexOf("🔺 **OWNER'S DESK"));
const body = `${summary} ${exclusions}${desk}`;
const active = `ACTIVE ${stamp} (s3368 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${active}\n\n- **s3368 lock (line-1 archive):** ${initial}\n- **s3367 handoff (line-1 archive):** ${previous}\n${status.slice(status.indexOf('\n') + 1)}`);
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');

const verification = `Fresh dry-board and lane probes classify 1,483 done-moves into 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. Every main..lane history is empty. Six queues, running tasks and pending crafting orders are empty; none of 118 failures is newer than s3367. Five worktrees are registered, zero unreported ahead trees. No retry is owed for the latest implementer log's historical assayer index-lock error: delivery 4fe2becb8, drain b5d6d3c32 and bookkeeping 614f84ca5 are main ancestors; assayer-sync-visibility-1 is merged in goals.json. CODEX-WALL remains in force. Future subscription capacity is unverified, and an authorized future dispatch requires a dependency-aware lane refresh.

Launcher 81427 → 81482 → 81484 owns the process lock created at 2026-10-26T07:05:41.855Z, matching 14:05:42 local FIRE START. The preceding fire ended at 13:05:31 local with rc 0. The launcher's transcript embeds earlier command output, so textual matches alone are not process proof; the live ancestor chain identifies this fire. Runner PID 26518, PPID 1, TTY ??, start 12:52:54 local remains alive, independently verified by ps and health-watch. No restart was needed. Main's semaphore is ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex; no further agent was dispatched. Launcher cleanup owns tasks/.fire.lock.

At 07:07 UTC, all nine public GETs returned HTTP 200 and all five API bodies parsed as ok:true. Canonical and direct Pages week-44 transfer standings and the week-43 control passed. Public build 299b1db5 advertises weeks 37–44. The complete eight-rotation skill fence equals the registry, and skill documentation checks passed 19/19. The preceding Wednesday mint is discharged; the next Wednesday window has not opened. These endpoint checks do not establish server runtime metadata or fresh replay acceptance.

October 26 LB-01/FM-01 execution receipts were read from s3366/s3365. Freshness independently proves 64/64 days August 24–October 26. Live archive visibility is PRIVATE; remote ledger-backups c73ab92bc8bcff05eaf4770dd73cfdaad268cfdc and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match the receipts. No duplicate daily push and no private corpus entered the public tree. October 25 ticker and its completion row were read; a91b3d9f8 is a main ancestor. Its historical day census was not repeated. No player-visible change or engine pin landed, so no Gazette item is owed. Publication remains owner-only.

The 19-file ledger corpus was read through ledger-corpus.mjs. Attended F-STO-1 storage custody is unchanged; 7b619795b is a main ancestor. Storage measurements were not repeated. Historical untracked attended files, evidence and run notes remain in place.`;
const validation = `Lock commit 93bd44906 and inherited dashboard bookkeeping 654449e19 preserve the starting state. Previous evidence harnesses were read and adapted to s3368 and the current launcher. The standalone archive audit initially omitted --limit 40 --quiet and selected a historical walk; it was stopped without a verdict by terminating only its proven-owned shell and node PIDs. The evidence is retained in archive-audit-correction.txt and status-archive.txt; status-archive-bounded.txt carries the relevant bounded check. The ledger battery had not yet started. This run changes only evidence and handoff documentation; no drain or product diff requires a build or browser battery.

Closing validation runs npm run test:ledger-guards using .nvmrc Node 26.4.0, process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools and the existing evidence-local --test-concurrency=1 adapter. Assertions, roster and timeouts are unchanged, with /usr/sbin and /sbin on PATH. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. The tested handoff remains ACTIVE until green; then only its lock/stamp envelope changes. The clearing commit is the last main write, followed by origin backup. The predecessor and initial ACTIVE line are archived, and the Owner's Desk tail is verbatim.`;
const remaining = `1. October 26 ticker after October 27 06:00 local; October 27 LB-01/FM-01 after 02:10 UTC.
2. Owner approval/publication of existing ticker drafts.
3. Existing Owner's Desk: account-registry deploy day, B1 phone verdict rows, token-revocation support follow-up.
4. Attended F-STO-1 storage follow-up; include landed assayer diagnostics in the next authorized attended deployment.`;
fs.writeFileSync(`${dir}/report.md`, `# s3368 fire — dry board and restored runner verified\n\n${stamp}. ${summary}\n\nREADY-FOR-GATES — bookkeeping and heartbeat only. Closing acceptance: [ledger-result.json](ledger-result.json).\n\n## Verification\n\n${verification}\n\n## Changes and validation\n\n${validation}\n\n## Remaining list in order\n\n${remaining}\n`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.readFileSync(handover, 'utf8');
fs.appendFileSync(handover, `\n\n### s3368 verification: restored runner remains alive and board is dry\n\n${stamp}. ${summary}\n\n${verification}\n\nLock 93bd44906; inherited bookkeeping 654449e19. Adaptations and ordered remainder: artifacts/s3368/report.md. Closing acceptance is ledger-result.json code 0 with unchanged inputs and HEAD. Ledger checks precede the clearing commit; origin backup follows.\n`);
console.log('Prepared ACTIVE handoff', stamp);
