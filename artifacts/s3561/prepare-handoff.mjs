import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dir = 'artifacts/s3561';
const read = p => fs.readFileSync(p, 'utf8');
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], {encoding: 'utf8'}).trim();
const verification = JSON.parse(read(`${dir}/verification.json`));
const inventory = JSON.parse(read(`${dir}/inventory.json`));
assert(verification.latestRunMerged && verification.wholeFenceMatches && verification.rotationCommitAncestor);
assert(Object.values(verification.branchLogs).every(x => !x));
assert.match(read(`${dir}/dry-board.txt`), /✅ DRY/);
assert(Object.values(inventory.queues).every(x => !x.length));
assert.equal(inventory.running.length + inventory.crafting.length + inventory.newerFailures.length, 0);
assert.equal(JSON.parse(read(`${dir}/private-visibility.txt`)).visibility, 'PRIVATE');
const duties = JSON.parse(read(`${dir}/private-duty-results.json`));
assert.equal(duties.length, 3);
assert(duties.every(x => x.code === 0));
assert.match(read(`${dir}/ledger-pull.txt`), /ledger backup pulled: .*ledger-2026-11-19.db/);
assert.match(read(`${dir}/ledger-push.txt`), /✅ PUSHED — 1 file/);
assert.match(read(`${dir}/mirror-freshness.txt`), /88\/88/);
assert.match(read(`${dir}/exposure-strict.txt`), /keys inspected\s+: 6764/);
assert.match(read(`${dir}/exposure-strict.txt`), /✅ CLEAN/);
const priorFm = JSON.parse(read('artifacts/s3560/private-duty-results.json')).find(x => x.name === 'fire-memory');
assert.equal(priorFm.code, 0);
assert(priorFm.finished.startsWith('2026-11-19'));
const heads = read(`${dir}/private-heads.txt`);
assert.match(heads, /53d87470fb2670626fb4605d4dc0eb5bffd899fb\s+refs\/heads\/fire-memory/);
assert.match(heads, /52bf8c3678be93707c39bbf7af8c9a7b6e0c403f\s+refs\/heads\/ledger-backups/);

const summary = 'WHY no product landing: DRY, 95 subjects, zero eligible or unknown; four absorbed lanes, six empty queues and no pending crafting orders. November 19 private backup completed: coverage 88/88, strict exposure clean, archive head 52bf8c367. FM-01 already complete, remote verified. Health 200/200/200; week-47 standings still bad_rotation on both hosts. Evidence artifacts/s3561/report.md and ledger-result.json. Next: attended deployment through week 48 with ASSAYER SYNCED; November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25. Seven-item desk preserved.';
const tail = read(`${dir}/desk-tail.txt`).trimEnd();
const body = `${summary} ${tail}`;
const line = `ACTIVE ${stamp} (s3561 fire) — ${body}`;
const status = read('STATUS.md');
assert(status.split('\n')[0].includes('(s3561 fire)'));
assert(status.includes('- **s3560 handoff (line-1 archive):** ' + read(`${dir}/predecessor.txt`).trimEnd()));
fs.writeFileSync('STATUS.md', line + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, line + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');

const detail = `Fresh verification: 1,483 done-moves, 95 subjects (82 merged, 13 closed or blocked), zero eligible or unknown. All four main..lane histories are empty. Six queues are empty, with no running task, pending crafting order or failed Markdown entry newer than the predecessor. Runner 33370 is alive under PPID 1. The newest run's historical index-lock failure is resolved by its merged goal leaf and ancestral merge b5d6d3c3248fdf0c4f61c853c040b651c650cf4f. CODEX-WALL and attended custody stand. Main semaphore verified at scripts/lane-runner-v3.sh:322.

LB-01 completed after the daily cutoff: November 19 source snapshot pulled at 03:33:20 UTC, then one file pushed to the PRIVATE archive at 03:33:43 UTC. Live ledger-backups head is 52bf8c3678be93707c39bbf7af8c9a7b6e0c403f. Coverage is 88/88 days, August 24 through November 19, 645,132,288 bytes outside the public repo. The push's strict gate returned 0. A standalone strict probe using repository Node 26.4.0 retained the full output: 6,764 keys in 88 readable mirrors, zero unreadable, account-class or unrecognised rows. This supersedes s3560's pending source-supply duty. Archive visibility and the effective configured destination were checked before the push. Database bytes and unsanitized command output remain outside the public tree.

FM-01 was already discharged by s3560 at 02:10:40 UTC today; its exit-0 receipt was read and the live fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb matches the receipt. It was not duplicated. All twelve rotation entries match the whole public skill fence; week 48 opens November 23 and preparation commit 3198ba417 is ancestral. Week 49 is due November 25. The November 18 ticker and its pinned census were read: 45 main updates, 45 first-parent commits, busy-day control 136. No real-change merge occurred here, so no new Gazette item is owed.

Fresh health is 200/200/200. Independent GETs completed without timeouts, with valid nonempty stats JSON on both hosts. Live build 299b1db5 still serves weeks 37–44; week-47 standings return 400 bad_rotation on both hosts, while week-44 controls return 200. This confirms the existing deployment gap. Deployment remains attended-owned and publish-gated under scripts/fire.md §3. No deployment, fresh ASSAYER SYNCED or browser acceptance is claimed.

Launcher 75350 → Node 75434 → current fire 75436 owns the process directory created at 03:31:09 UTC. The inherited STATUS was cleared; no live foreign lock was displaced. Actual engine Codex does not lift dispatch restrictions. Exact s3560 predecessor, both desk acknowledgements and all seven owner items are preserved. Shared vault, Gold Rush MOC and the 19-file BACKLOG corpus were read. Generated factory bookkeeping was preserved; lane evidence and node_modules are untouched.

Closing acceptance uses the complete unchanged npm run test:ledger-guards with repository Node 26.4.0, direct CommandLineTools Git, one test-file worker and process-bound idle-sleep inhibition, matching the predecessor's passing environment. Assertions, roster, scan window and timeouts are unchanged. Only full acceptance with unchanged input and HEAD fingerprints permits lock CLEARED; that commit is the last write to main.`;

const backlog = read('tasks/BACKLOG.md');
assert(!backlog.includes('**s3561 VERIFICATION'));
fs.writeFileSync('tasks/BACKLOG.md', `✅ **s3561 VERIFICATION (${stamp}):** ${summary} Fresh checks and inherited-evidence limits: artifacts/s3561/report.md. Closing acceptance is ledger-result.json; this row does not anticipate it. The pending November 19 source-supply duty is discharged. No dispatch, publication or new owner decision.\n\n${backlog}`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md';
fs.writeFileSync(handover, read(handover) + `\n\n### s3561 verification: November 19 private backup completed on a dry board\n\n${stamp}. ${summary}\n\n${detail}\n`);
fs.writeFileSync(`${dir}/report.md`, `# Gold Rush s3561 — November 19 private backup completed\n\n${summary}\n\nREADY-FOR-GATES is conditional on ledger-result.json. STATUS remains ACTIVE until the complete ledger passes.\n\n## Verification and scope\n\n${detail}\n\nNo product or art slice landed; no gameplay, spec, goal, assertion or runtime change was made. Product drain builds, browser gates and conditional art staging do not apply. No new product root cause was found; the existing deployment lag is confirmed, and the backup source-supply delay is resolved by the successful pull.\n\n## Commits\n\n- 54db53a6a: ACTIVE lock.\n- 780bfa0a1: exact predecessor archive and generated factory bookkeeping.\n- 52bf8c3678be93707c39bbf7af8c9a7b6e0c403f: November 19 mirror on the private archive's ledger-backups branch.\n- Final gate emits the clearing commit and matching origin head after acceptance.\n\n## REMAINING LIST IN ORDER\n\n1. Attended deployment through week 48; verify ASSAYER SYNCED, served registry parity and week-47 standings 200 on both hosts.\n2. November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.\n3. Seven existing owner items unchanged.\n`);

const noteStamp = execFileSync('date', ['-u', '+%Y%m%dT%H%M%SZ'], {encoding: 'utf8'}).trim();
const title = 'Gold Rush — November 19 private backup reaches full coverage on a dry board';
const note = `---\nsource: codex\nproject: Gold Rush\ndate: ${stamp}\ntype: digest\n---\n# ${title}\n\n${summary}\n\n${detail}\n\nEvidence: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3561/report.md. Final acceptance is ledger-result.json, not presumed. [[Gold Rush MOC]].\n`;
const paths = [`/Users/robin/Obsidian/Brain/Projects/Gold Rush/${title} ${noteStamp}.md`, `/Users/robin/Obsidian/Brain/Sessions/codex/2026-11-19-s3561-private-backup-complete-${noteStamp}.md`];
for (const p of paths) { assert(!fs.existsSync(p)); fs.writeFileSync(p, note); }
fs.writeFileSync(`${dir}/vault-paths.json`, JSON.stringify(paths, null, 2) + '\n');
console.log({stamp, prepared: true, deskPreserved: true});
