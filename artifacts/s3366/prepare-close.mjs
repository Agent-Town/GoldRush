import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = 'artifacts/s3366';
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const status = fs.readFileSync('STATUS.md', 'utf8');
const initial = fs.readFileSync(`${dir}/lock.txt`, 'utf8').trim();
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').trim();
const desk = fs.readFileSync(`${dir}/desk-tail.txt`, 'utf8').trim();
if (status.split('\n')[0] !== initial || status.includes('- **s3365 handoff (line-1 archive):**')) throw Error('Changed ownership or already archived predecessor');

const summary = 'WHY no product landing: board DRY, 95 subjects, zero eligible/unknown; all four lanes absorbed. October 26 LB-01 complete: 64/64 days, private archive push verified. FM-01 current; October 25 ticker complete. Nine public checks healthy, including week 44 standings. Next: October 27 daily duties and existing attended/owner follow-up. Evidence artifacts/s3366/report.md and ledger-result.json.';
const exclusions = 'DESK-NOT-OWED: F-2987-1 — Option B ruled and cut over attended; no further capacity choice owed. DESK-NOT-OWED: F-2742-1 — discharged attended 2026-09-29 by 40dbcf2f8; origin backup verified.';
const body = `${summary} ${exclusions} ${desk}`;
const active = `ACTIVE ${stamp} (s3366 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${active}\n\n- **s3366 lock (line-1 archive):** ${initial}\n- **s3365 handoff (line-1 archive):** ${previous}\n${status.slice(status.indexOf('\n') + 1)}`);
fs.writeFileSync(`${dir}/tested-line1.txt`, active + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');

const backlog = fs.readFileSync('tasks/BACKLOG.md', 'utf8');
const oldRow = backlog.split('\n')[0];
if (!oldRow.includes('LB-01 OCTOBER 26 SUPPLY WINDOW OBSERVED')) throw Error('Backlog duty changed');
const row = `🗄️ **LB-01 OCTOBER 26 COMPLETE; FM-01 CURRENT (s3366, ${stamp}):** The 03:41 UTC pull obtained today's snapshot and the strict private push added one file. Coverage is 64/64 days August 24–October 26. Separate strict exposure checked 4,494 keys across 64 readable mirrors, zero unreadable mirrors and zero account-class/unrecognised rows. Archive visibility PRIVATE; live ledger-backups head c73ab92bc8bcff05eaf4770dd73cfdaad268cfdc verified. FM-01 was already discharged today by s3365; its unchanged receipt was read and live fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb verified, so no duplicate FM-01 push. No private corpus enters the public tree. Next LB-01 coverage day October 27 after 02:10 UTC. Evidence: artifacts/s3366/ledger-pull.txt, ledger-push.txt, mirror-exposure.txt, mirror-freshness.txt, private-heads.txt, private-visibility.json, execution-notes.json, report.md.`;
const retired = `🗄️ **LB-01 OCTOBER 26 SUPPLY WINDOW OBSERVED (s3365, 2026-10-26T02:29Z) — DISCHARGED by s3366 above:** The 02:28 UTC pull correctly reported NOT DISCHARGED while the source had not supplied today's snapshot, within the documented 02:00–03:00 UTC timer window. Coverage then was 63/63 through October 25, both private mirrors unchanged and FM-01 current. The 03:41 UTC s3366 pull and private push completed today's coverage. Historical evidence retained: artifacts/s3365/ledger-pull.txt, ledger-push.txt, mirror-exposure.txt, mirror-freshness.txt, fire-memory.txt, private-heads.txt, private-visibility.json, report.md.`;
fs.writeFileSync('tasks/BACKLOG.md', row + '\n\n' + retired + backlog.slice(oldRow.length));

const verification = `Fresh probes classify 1,483 done-moves into 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty. Six queues, running tasks and pending crafting orders are empty; none of 118 failures is newer than s3365. Five worktrees are registered, zero unreported ahead trees. The newest implementer log is the historical assayer index-lock failure: delivery 4fe2becb8, drain b5d6d3c32 and bookkeeping 614f84ca5 are main ancestors; assayer-sync-visibility-1 is merged in goals.json. No retry is owed. CODEX-WALL remains in force; future subscription capacity is unverified. Future authorized dispatch requires a dependency-aware lane refresh.

Launcher 5512 → 5556 → 5557 owns the process lock created at 2026-10-26T03:39:51.299Z, matching 10:39:51 local FIRE START. Its preceding fire ended at 09:39:41 local with rc 0. Runner 31360 is alive under parent 1, independently verified with ps and health-watch. Its PID helper returns exit 1 while supplying the live PID. The main-slot semaphore is ACTIVE and not lock CLEARED at scripts/lane-runner-v3.sh:322. The actual launcher uses Codex. No live predecessor was displaced.

At 03:40–03:41 UTC, nine public GETs returned HTTP 200 and all five API bodies parsed as ok:true. Canonical and direct Pages week-44 transfer standings and the week-43 control passed. Public build 299b1db5 advertises weeks 37–44; the complete eight-rotation skill fence equals the local registry. Week 44 opened October 26 at 00:00 UTC. The preceding Wednesday mint duty is discharged; the next Wednesday window has not opened. Skill documentation checks passed 19/19. Server runtime metadata and fresh replay acceptance were not tested.

October 26 LB-01 completed at 03:41 UTC. The snapshot now exists at the source, was pulled outside this repo, and the strict private push added one file. Coverage is 64/64 days August 24–October 26. Separate strict exposure checked 4,494 keys across 64 readable mirrors, zero unreadable mirrors and zero account-class/unrecognised rows. Live archive visibility is PRIVATE; ledger-backups head c73ab92bc8bcff05eaf4770dd73cfdaad268cfdc was independently verified. FM-01 had already run today in s3365: its unchanged receipt was read and live fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb matches. No duplicate FM-01 run was needed. No private corpus entered the public tree. The prior supply-window row is retired in this same handoff commit.

The 19-file ledger corpus was read through ledger-corpus.mjs. October 25 ticker and its completion row were read; a91b3d9f8 is a main ancestor. Its historical census was not repeated. No real-change merge means no new Gazette item. Publication remains owner-only. Attended storage follow-up F-STO-1 retains its custody: 7b619795b is a main ancestor; storage bytes were not remeasured. Historical untracked attended files and run notes remain in place.`;

const validation = `No product defect required repair. The prior heartbeat, private-duty and ledger harnesses were read and adapted to s3366, this launcher and today's completed private backup. Lock bb72784d7 and inherited dashboard bookkeeping df505fc70 preserve the starting state. A guessed unreported-worktree-audit filename did not exist; the documented lane-usable.mjs --unreported command then exited 0 and supplied the coverage evidence. No maintained script was changed. The protocol's dashed log spelling resolves to logs/fire-20261026.log. Product builds and browser drain gates do not apply to this bookkeeping-only increment.

Closing validation uses .nvmrc Node 26.4.0, process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools and the existing evidence-local --test-concurrency=1 scheduling adapter, retaining /usr/sbin and /sbin on PATH. No package script, test roster, assertion or timeout changes. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. Only the STATUS lock/stamp envelope changes after green. The clearing commit is the last main write, followed by origin backup. The predecessor and initial ACTIVE line are archived; the three-item Owner's Desk tail is verbatim. Launcher cleanup owns tasks/.fire.lock.`;

const remaining = `1. Next daily window: October 26 ticker after October 27 06:00 local; October 27 LB-01/FM-01 after 02:10 UTC.
2. Owner approval/publication of the existing October 25 ticker, which proposes no player headline.
3. Existing Owner's Desk: account-registry deploy day, B1 phone verdict rows, token-revocation support follow-up.
4. Attended F-STO-1 storage follow-up; include landed assayer diagnostics in the next authorized attended deployment.`;

fs.writeFileSync(`${dir}/report.md`, `# s3366 fire — October 26 private backup complete\n\n${stamp}. ${summary}\n\nREADY-FOR-GATES — bookkeeping only. Closing acceptance: [ledger-result.json](ledger-result.json).\n\n## Verification\n\n${verification}\n\nEvidence: dry-board.txt, lane-usable.txt, queue-state.json, unreported.txt, worktrees.txt, launcher.json, health-watch.txt, prior-drain-verification.json, live-probe.json, duties.json, skillmd.txt, private-duty-results.json, mirror-exposure.txt and private-heads.txt. Raw latest run-log tail remains disk-local under the retention amendment.\n\n## Changes and validation\n\n${validation}\n\n## Remaining list in order\n\n${remaining}\n`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.readFileSync(handover, 'utf8');
fs.appendFileSync(handover, `\n\n### s3366 verification: dry board and October 26 private backup complete\n\n${stamp}. ${summary}\n\n${verification}\n\nDetailed adaptations, limitations and ordered remainder: artifacts/s3366/report.md. Lock bb72784d7; inherited bookkeeping df505fc70. Closing acceptance requires ledger-result.json code 0 with unchanged tested inputs and HEAD. Ledger checks precede the clearing commit, which is the last main write; origin backup follows. Owner's Desk carried verbatim; launcher owns process-lock cleanup.\n`);

const suffix = execFileSync('date', ['-u', '+%Y%m%dT%H%M%SZ'], { encoding: 'utf8' }).trim();
try {
  const projectNote = `/Users/robin/Obsidian/Brain/Projects/Gold Rush/Gold Rush — October 26 private backup completes the supply window ${suffix}.md`;
  fs.writeFileSync(projectNote, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-26\ntype: reference\n---\n# Gold Rush — October 26 private backup completes the supply window\n\nAt 03:41 UTC s3366 pulled the October 26 ledger snapshot and pushed one file to the verified private archive. Coverage is 64/64 days August 24–October 26. Strict exposure checked 4,494 keys with zero account-class or unrecognised rows. Live ledger-backups head: c73ab92bc8bcff05eaf4770dd73cfdaad268cfdc. This discharges s3365's observed 02:28 UTC supply window; no source defect was established. FM-01's existing daily receipt and live head were verified. No private corpus entered the public tree.\n\nBoard DRY: 95 subjects, zero eligible/unknown, all four lanes absorbed. Nine public checks passed, including week 44 standings. CODEX-WALL and attended custody remain in force. Evidence: artifacts/s3366/report.md and ledger-result.json. [[MOCs/Gold Rush MOC]].\n`, { flag: 'wx' });
  fs.writeFileSync(`${dir}/vault-paths.json`, JSON.stringify({ projectNote }, null, 2));
} catch (e) { console.log('Vault unavailable:', e.message); }
console.log('Handoff prepared under ACTIVE at', stamp);
