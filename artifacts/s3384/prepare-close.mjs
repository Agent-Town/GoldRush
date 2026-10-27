import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = 'artifacts/s3384';
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').trim();
const initial = fs.readFileSync(`${dir}/lock.txt`, 'utf8').trim();
const status = fs.readFileSync('STATUS.md', 'utf8');
if (status.split('\n')[0] !== initial || !status.includes(`- **s3383 handoff (line-1 archive):** ${previous}`)) throw Error('Ownership or predecessor archive changed');
const dispositions = previous.slice(previous.indexOf('DESK-NOT-OWED:'));
const ownerTail = fs.readFileSync(`${dir}/desk-tail.txt`, 'utf8').trim();
if (!dispositions.endsWith(ownerTail)) throw Error('Owner desk tail changed');

const results = JSON.parse(fs.readFileSync(`${dir}/private-duty-results.json`, 'utf8'));
if (results.length !== 6 || results.some(r => r.code !== 0)) throw Error('Private duties incomplete');
const heads = fs.readFileSync(`${dir}/private-heads.txt`, 'utf8');
if (!heads.includes('7c35ab16200f1961f49b50ab03bdbb60bc4954fa') || !heads.includes('53d87470fb2670626fb4605d4dc0eb5bffd899fb')) throw Error('Private heads differ');
const live = JSON.parse(fs.readFileSync(`${dir}/live-probe.json`, 'utf8'));
if (live.length !== 9 || live.some(r => r.status !== 200 || (r.summary && !r.summary.ok))) throw Error('Heartbeat claim not supported');

const summary = 'October 27 LB-01/FM-01 complete; private coverage 65/65. WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; four lanes absorbed. Runner 26518 alive; nine public checks healthy. October 26 ticker complete. Next: October 27 ticker after 06:00 local, October 28 RT-01 and private duties. Evidence artifacts/s3384/report.md and ledger-result.json.';
const body = `${summary} ${dispositions}`;
const active = `ACTIVE ${stamp} (s3384 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${active}\n\n- **s3384 lock (line-1 archive):** ${initial}\n${status.slice(status.indexOf('\n') + 1)}`);
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');

const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8');
const row = `🗄️ **LB-01 + FM-01 OCTOBER 27 COMPLETE (s3384, ${stamp}):** Today's snapshot was pulled after 02:10 UTC and the strict private push added one file. Coverage is 65/65 days August 24–October 27. Separate strict exposure inspected 4,588 keys across 65 readable mirrors, zero unreadable mirrors and zero account-class or unrecognised rows. Archive visibility PRIVATE; live ledger-backups head 7c35ab16200f1961f49b50ab03bdbb60bc4954fa verified. FM-01 unchanged at 53d87470fb2670626fb4605d4dc0eb5bffd899fb, its live head verified. No private corpus enters the public tree. Next coverage day October 28 after 02:10 UTC. Evidence: artifacts/s3384/ledger-pull.txt, ledger-push.txt, mirror-exposure.txt, mirror-freshness.txt, fire-memory.txt, private-heads.txt, private-visibility.json, private-duty-results.json, report.md.`;
if (backlog.includes('LB-01 + FM-01 OCTOBER 27 COMPLETE')) throw Error('Duty row already exists');
fs.writeFileSync('tasks/BACKLOG.md', row + '\n\n' + backlog);

const verification = `The fresh dry-board probe read 1,483 done-moves and classified 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty. Six queues, running tasks and pending crafting orders are empty; none of 118 historical failures is newer than s3383. Five registered worktrees, zero unreported ahead trees. The newest implementer log's index-lock failure is historical: delivery 4fe2becb8, drain b5d6d3c32 and bookkeeping 614f84ca5 are main ancestors; assayer-sync-visibility-1 is merged in goals.json. No retry is owed. CODEX-WALL and attended custody remain. Future authorized dispatch needs a dependency-aware lane refresh; future subscription capacity was not tested.

Launcher 79338 → 79384 → 79385 owns the process lock created at 2026-10-27T02:11:11.748Z, matching the anchored 09:11:12 local FIRE START. The actual launcher uses Codex. s3383 had cleared STATUS; no stale takeover was needed. Runner 26518 is alive, PPID 1, started October 26 12:52:54 local. Main's semaphore is ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. No restart, dispatch or refill was needed. Launcher cleanup owns tasks/.fire.lock.

At 02:13 UTC, nine public GETs returned HTTP 200 and five API bodies parsed as ok:true, including canonical/direct Pages week-44 transfer standings and a week-43 control. Public build 299b1db5 advertises weeks 37–44. The complete eight-rotation skill fence equals the local registry; skill checks passed 19/19. RT-01 is discharged for the preceding Wednesday by r2026w44, opening October 26. Next mint window: October 28 00:00 UTC. These are point-in-time reads, not sustained-health, server-runtime or fresh-replay acceptance.

October 27 LB-01 ran at 02:13 UTC and pulled today's snapshot. The strict private push added one file; coverage is 65/65 days August 24–October 27. Separate strict exposure inspected 4,588 keys in 65 readable mirrors, zero unreadable mirrors and zero account-class/unrecognised rows. Archive visibility is PRIVATE. Live ledger-backups head 7c35ab16200f1961f49b50ab03bdbb60bc4954fa and unchanged fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb are verified. The private corpus stays outside this public repo. All six duty commands exited 0.

The October 26 ticker and completion row were read; e8d7cc488 is a main ancestor. Its historical census was not repeated. No player-visible change or engine pin landed, so no Gazette item or deployment is owed. Publication remains owner-only. The 19-file ledger corpus was read through ledger-corpus.mjs, with duty/custody rows and the newest handover and desk. Attended F-STO-1 custody remains; 7b619795b is a main ancestor, storage measurements were not repeated. Existing evidence and run logs remain in place.`;

const remaining = `1. October 27 ticker after October 28 06:00 local (October 27 23:00 UTC).
2. RT-01 week 45 mint on/after October 28 00:00 UTC; October 28 LB-01/FM-01 after 02:10 UTC.
3. Owner approval/publication of ticker drafts; existing desk: account-registry deploy day, B1 phone verdict rows, token-revocation support follow-up.
4. Attended F-STO-1 storage and F-CUT-1 follow-up; include landed assayer diagnostics in the next authorized attended deployment.`;

fs.writeFileSync(`${dir}/report.md`, `# s3384 fire — October 27 private backup complete\n\n${stamp}. ${summary}\n\nREADY-FOR-GATES — documentation and heartbeat increment. Closing acceptance: [ledger-result.json](ledger-result.json).\n\n## Verification\n\n${verification}\n\n## Changes and validation\n\nLock 5882552a5; inherited dashboard bookkeeping and predecessor archive d39260192. No product defect required repair. No source, existing assertions, test roster or timeout changed; product builds and browser gates do not apply to this increment. The daily completion row and its evidence land together in the final handoff commit.\n\nThe prior evidence harness was read and adapted for s3384, this launcher and today's duties. Closing validation runs npm run test:ledger-guards under .nvmrc Node 26.4.0 with process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools and the retained evidence-local --test-concurrency=1 scheduling adapter; assertions and timeouts are unchanged. /usr/sbin and /sbin remain on PATH. The bounded status archive audit is retained in status-archive-audit.txt.\n\nClosing acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. This report, the duty row and ACTIVE handoff are frozen before the battery. After green, only STATUS line 1's lock/stamp envelope changes. The clearing commit is the last main write, followed by origin backup. The predecessor and initial ACTIVE line are archived; the Owner's Desk tail and DESK-NOT-OWED dispositions remain verbatim. Final commit and live origin receipt are reported in the session digest and final response.\n\n## Remaining list in order\n\n${remaining}\n`);

const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.readFileSync(handover, 'utf8');
fs.appendFileSync(handover, `\n\n### s3384 verification: October 27 private backup complete\n\n${stamp}. ${summary}\n\nVerification: 82 merged / 13 closed or blocked / zero eligible or unknown; four lane histories absorbed; six queues, running and pending orders empty; no new failed run. Latest run delivery 4fe2becb8 and drain b5d6d3c32 are main ancestors. Runner 26518 alive; launcher 79338 → 79384 → 79385 owns this process lock. Nine HTTP 200s and five ok:true API bodies; build 299b1db5, weeks 37–44. Whole local skill fence equals registry; skill checks 19/19. Today's private duties exited 0: coverage 65/65, 4,588 keys clean, one new private backup, FM-01 unchanged, PRIVATE archive heads verified. October 26 ticker read and e8d7cc488 is an ancestor; its historical census was not repeated. No product or engine change; no Gazette item or deployment owed. CODEX-WALL, attended custody and Owner's Desk remain.\n\nLock 5882552a5; bookkeeping d39260192. Full evidence, adaptations, limits and ordered remainder: artifacts/s3384/report.md. Closing acceptance requires ledger-result.json code 0 with unchanged inputs and HEAD. Ledger checks precede the final clearing commit; origin backup follows.\n`);
console.log('Prepared ACTIVE handoff and daily completion row at', stamp);
