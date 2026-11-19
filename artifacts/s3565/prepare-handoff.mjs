import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dir = 'artifacts/s3565';
const read = p => fs.readFileSync(p, 'utf8');
const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], {encoding:'utf8'}).trim();
const verification = JSON.parse(read(`${dir}/verification.json`));
const inventory = JSON.parse(read(`${dir}/inventory.json`));
assert(verification.latestRunMerged && verification.wholeFenceMatches && verification.rotationCommitAncestor);
assert(Object.values(verification.branchLogs).every(x => !x));
assert.match(read(`${dir}/dry-board.txt`), /✅ DRY/);
assert(Object.values(inventory.queues).every(x => !x.length));
assert.equal(inventory.running.length + inventory.crafting.length + inventory.newerFailures.length, 0);
assert.equal(JSON.parse(read(`${dir}/private-visibility.txt`)).visibility, 'PRIVATE');
assert.match(read(`${dir}/mirror-freshness.txt`), /88\/88/);
assert.match(read(`${dir}/private-heads.txt`), /52bf8c3678be93707c39bbf7af8c9a7b6e0c403f\s+refs\/heads\/ledger-backups/);
assert.match(read(`${dir}/private-heads.txt`), /53d87470fb2670626fb4605d4dc0eb5bffd899fb\s+refs\/heads\/fire-memory/);
const lb = JSON.parse(read('artifacts/s3561/private-duty-results.json'));
assert(lb.every(x => x.code === 0 && x.finished.startsWith('2026-11-19')));
const fm = JSON.parse(read('artifacts/s3560/private-duty-results.json')).find(x => x.name === 'fire-memory');
assert.equal(fm.code, 0); assert(fm.finished.startsWith('2026-11-19'));
assert.match(read('artifacts/s3561/ledger-pull.txt'), /ledger-2026-11-19.db/);
assert.match(read('artifacts/s3561/ledger-push.txt'), /✅ PUSHED/);
const live = JSON.parse(read(`${dir}/live-probe.json`));
assert(live.every(x => !x.error));
assert(live.filter(x => x.url.includes('r2026w47')).every(x => x.status === 400 && x.summary.error === 'bad_rotation'));
assert(live.filter(x => x.url.includes('r2026w44')).every(x => x.status === 200));
fs.writeFileSync(`${dir}/power.txt`, execFileSync('pmset', ['-g','batt'], {encoding:'utf8'}));

const summary = 'Recovered s3564 after its model-capacity exit. WHY no product landing: DRY, 95 subjects, zero eligible or unknown; four absorbed lanes, six empty queues and no pending crafting orders. November 19 private duties already complete, 88/88 coverage and remote heads verified. Health 200/200/200; week-47 standings still bad_rotation on both hosts. Evidence artifacts/s3565/report.md and ledger-result.json. Next: attended deployment through week 48 with ASSAYER SYNCED; November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25. Seven-item desk preserved.';
const tail = read(`${dir}/desk-tail.txt`).trimEnd();
const body = `${summary} ${tail}`;
const line = `ACTIVE ${stamp} (s3565 fire) — ${body}`;
const status = read('STATUS.md');
assert(status.split('\n')[0].includes('(s3565 fire)'));
assert(status.includes('- **s3564 handoff (line-1 archive):** '+read(`${dir}/predecessor.txt`).trimEnd()));
fs.writeFileSync('STATUS.md', line + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, line+'\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body+'\n');

const detail = `Fresh verification: the board probe read 1,483 done-moves and classified 95 subjects: 82 merged, 13 closed or blocked, zero eligible or unknown. All four main..lane histories are empty. Six queues are empty, with no running task, pending crafting order or failed Markdown entry newer than the predecessor. Runner 33370 is alive under PPID 1. The newest historical run's index-lock failure is resolved by its merged goal leaf and ancestral merge b5d6d3c3248fdf0c4f61c853c040b651c650cf4f. CODEX-WALL and attended custody stand. The main-slot semaphore still tests ACTIVE without lock CLEARED at scripts/lane-runner-v3.sh:322.

November 19 LB-01 was completed by s3561, with successful pull and strict private push receipts read this fire. Fresh coverage is 88/88 days, August 24 through November 19; the live ledger-backups head matches 52bf8c3678be93707c39bbf7af8c9a7b6e0c403f. FM-01 was completed by s3560 at 02:10:40 UTC today, and its receipt matches live fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb. Archive visibility is PRIVATE. These daily writes were not duplicated. Database bytes remain outside the public repo. The predecessor's strict exposure result was read, not represented as a new strict run.

All twelve rotation entries match the whole public skill fence. Week 48 opens November 23; preparation commit 3198ba417 is ancestral. Next mint is week 49 on November 25. The November 18 ticker and its pinned census were read: 45 main updates, 45 first-parent commits, September 25 control 136. No real-change merge occurred this fire, so no Gazette item is owed. Next ticker is November 19, due after November 20 06:00 local; private duties next fall after November 20 02:10 UTC.

Fresh health is 200/200/200. Independent GETs returned valid nonempty stats JSON on both hosts without timeouts. Build 299b1db5 still serves weeks 37–44. Week-47 standings return 400 bad_rotation on both hosts while week-44 controls return 200. This confirms the existing deployment gap, not a new root cause. Deployment remains attended-owned and publish-gated under scripts/fire.md §3; no fresh deployment, ASSAYER SYNCED or browser acceptance is claimed.

Launcher 98240 → Node 98289 → this fire 98291 owns the process directory created at 07:34:44 UTC. Inherited s3564 ACTIVE at 07:28Z was stranded: the launcher records FIRE END rc=1 at 07:29:44Z after two model-capacity errors and a thread-recording error. The previous fire had committed only its lock; it did not finish ledger acceptance. Its exact ACTIVE line and the missing exact s3563 cleared predecessor were archived. No foreign live process was displaced. Actual engine Codex does not lift dispatch restrictions. Exact s3564 predecessor and s3563 last cleared handoff, both desk acknowledgements and all seven owner items are preserved. Shared vault, Gold Rush MOC and the 19-file BACKLOG corpus were read. Generated dashboard bookkeeping was preserved. The generated logs/.goal-tree.html is currently empty and remains uncommitted factory churn; no producer or lane evidence was altered. Lane node_modules remain untouched. Initial read setup hit the default child-process buffer limit on STATUS; increasing only the read buffer to 64 MB resolved it before any lock mutation. A guessed archive owner failed lookup; the configured archive remote independently reports PRIVATE.

Closing acceptance uses the complete unchanged npm run test:ledger-guards with repository Node 26.4.0, direct CommandLineTools Git, one test-file worker and process-bound idle-sleep inhibition. This reuses the predecessor's passing environment mitigation; the current Mac is on AC power, recorded in power.txt. Assertions, roster, scan window and timeouts are unchanged. Only full acceptance with unchanged input and HEAD fingerprints permits lock CLEARED; the clearing commit is the last write to main.`;

const backlog = read('tasks/BACKLOG.md');
assert(!backlog.includes('**s3565 VERIFICATION'));
fs.writeFileSync('tasks/BACKLOG.md', `✅ **s3565 VERIFICATION (${stamp}):** ${summary} Fresh checks and inherited-evidence limits: artifacts/s3565/report.md. Closing acceptance is ledger-result.json, not anticipated by this row. No new task, dispatch, publication or owner decision.\n\n${backlog}`);
const handover='docs/HANDOVER-2026-09-06-attended.md';
fs.writeFileSync(handover, read(handover)+`\n\n### s3565 verification: interrupted lock recovered; board dry and duties current\n\n${stamp}. ${summary}\n\n${detail}\n`);
fs.writeFileSync(`${dir}/report.md`, `# Gold Rush s3565 — Interrupted lock recovered; board dry and duties current\n\n${summary}\n\nREADY-FOR-GATES is conditional on ledger-result.json. STATUS remains ACTIVE until the complete ledger passes.\n\n## Verification and scope\n\n${detail}\n\nFresh skillmd guard: 19/19 passed, zero failures, cancellations or skips. Status archive audit: zero permanently missing or abridged handoffs across the latest 40 STATUS commits. No product or art slice landed. No gameplay, spec, goal, assertion or runtime change was made. Drain builds, browser gates and conditional art staging do not apply.\n\n## Commits\n\n- d830591da: ACTIVE lock.\n- 0428126a9: predecessor archive and generated factory bookkeeping.\n- The final gate emits the clearing commit and verifies matching origin main after acceptance.\n\n## REMAINING LIST IN ORDER\n\n1. Attended deployment through week 48; verify ASSAYER SYNCED, served registry parity and week-47 standings 200 on both hosts.\n2. November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.\n3. Seven existing owner items unchanged.\n`);

const noteStamp=execFileSync('date',['-u','+%Y%m%dT%H%M%SZ'],{encoding:'utf8'}).trim();
const title='Gold Rush — s3565 recovers an interrupted lock and verifies current duties';
const note=`---\nsource: codex\nproject: Gold Rush\ndate: ${stamp}\ntype: digest\n---\n# ${title}\n\n${summary}\n\n${detail}\n\nEvidence: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3565/report.md. Final acceptance is ledger-result.json, not presumed. [[Gold Rush MOC]].\n`;
const paths=[`/Users/robin/Obsidian/Brain/Projects/Gold Rush/${title} ${noteStamp}.md`,`/Users/robin/Obsidian/Brain/Sessions/codex/2026-11-19-s3565-dry-board-${noteStamp}.md`];
for(const p of paths)fs.writeFileSync(p,note,{flag:'wx'});
fs.writeFileSync(`${dir}/vault-paths.json`,JSON.stringify(paths,null,2)+'\n');
console.log({stamp,prepared:true,deskPreserved:true});
