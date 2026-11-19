import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const dir = 'artifacts/s3566';
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
assert.equal(live.filter(x => x.url.includes('r2026w47')).length, 2);
assert(live.filter(x => x.url.includes('r2026w47')).every(x => x.status === 400 && x.summary.error === 'bad_rotation'));
assert(live.filter(x => x.url.includes('r2026w44')).every(x => x.status === 200));
assert(live.filter(x => x.url.endsWith('/stats')).every(x => x.status === 200 && x.summary.statsObject && !x.summary.empty));
assert.match(read(`${dir}/health-status.txt`), /landing=200 game=200 api=200/);
assert.match(read(`${dir}/skillmd-guard.txt`), /(?:ℹ |# )pass 19/);
fs.writeFileSync(`${dir}/power.txt`, execFileSync('pmset', ['-g','batt'], {encoding:'utf8'}));

const summary = 'WHY no product landing: DRY, 95 subjects, zero eligible or unknown; four absorbed lanes, six empty queues, no pending crafting orders. November 19 private duties verified complete, 88/88 coverage and remote heads match. Health 200/200/200; week-47 standings remain bad_rotation on both hosts. Evidence artifacts/s3566/report.md and ledger-result.json. Next: attended deployment through week 48 with ASSAYER SYNCED; November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25. Seven-item desk preserved.';
const body = summary + read(`${dir}/desk-tail.txt`).trimEnd();
const line = `ACTIVE ${stamp} (s3566 fire) — ${body}`;
const status = read('STATUS.md');
assert(status.split('\n')[0].includes('(s3566 fire)'));
assert(status.includes('- **s3565 handoff (line-1 archive):** '+read(`${dir}/predecessor.txt`).trimEnd()));
fs.writeFileSync('STATUS.md', line + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, line+'\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body+'\n');

const detail = `Fresh verification at ${stamp}: the board probe read 1,483 done-moves: 95 subjects, 82 merged, 13 closed or blocked, zero eligible and zero unknown. All four main..lane logs are empty. Six queues, running tasks, pending crafting orders and failed Markdown entries newer than the predecessor are empty. Runner PID 33370 is alive under PPID 1 and runs lane-runner-v3.sh. The newest historical run ended on an index-lock failure; its goal leaf is now merged and b5d6d3c3248fdf0c4f61c853c040b651c650cf4f is ancestral to main. No retry is owed. CODEX-WALL still forbids fire refills and dispatch. The main semaphore remains ACTIVE without lock CLEARED at scripts/lane-runner-v3.sh:322.

LB-01: read s3561's successful November 19 pull and strict private-push receipts; fresh coverage is 88/88 days from August 24 through November 19. The live ledger-backups head matches 52bf8c3678be93707c39bbf7af8c9a7b6e0c403f. FM-01: read s3560's successful November 19 receipt, completed 02:10:40 UTC; live fire-memory matches 53d87470fb2670626fb4605d4dc0eb5bffd899fb. Fresh archive visibility is PRIVATE. No daily backup write was duplicated; no database bytes entered this public repo. The strict exposure result is an existing receipt, not a new strict run.

RT-01 discharged: all twelve registry entries match the whole public skill fence; week 48 opens November 23 and preparation commit 3198ba417 is ancestral. Fresh skillmd tests pass 19/19. TK-01 discharged: the November 18 ticker is present and its pinned census reports 45 updates and 45 first-parent commits, with a 136-commit busy-day control. This fire read that receipt; it did not rerun the historical census. No product change or Gazette item is owed. Next duties are listed below.

Live GETs at 09:00 UTC confirm landing/game/stats 200 and nonempty stats JSON on both hosts. Served build 299b1db5 carries weeks 37–44. Week-47 standings return 400 bad_rotation on both hosts; week-44 controls return 200. This confirms the existing deployment gap. Deployment remains attended-owned and publish-gated by scripts/fire.md §3; no deployment, ASSAYER SYNCED or browser acceptance is claimed.

Custody: launcher 12973 → Node 13023 → fire 13025 owns tasks/.fire.lock created 08:57:48 UTC. The launcher records the preceding fire ended and this fire started. STATUS was cleared on entry. Exact s3565 predecessor, both desk acknowledgements and all seven owner items are preserved. Shared vault, Gold Rush MOC and the 19-file BACKLOG corpus were consulted. Generated logs and pre-existing untracked evidence remain with their producers; no source, goal, spec, test assertion, lane or runtime configuration was changed. No drain or art gate applies.

Closing acceptance runs the complete unchanged npm run test:ledger-guards under the repository's Node 26.4.0 and direct CommandLineTools Git, with one test-file worker and process-bound idle-sleep inhibition, matching the prior passing environment mitigation. No assertion, roster, scan window or timeout is changed. Only a passing full battery with unchanged input and HEAD fingerprints permits lock CLEARED. Its commit is the final write to main.`;
const remaining = `1. Attended deployment through week 48; verify ASSAYER SYNCED, served-registry parity and week-47 standings 200 on both hosts.
2. November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.
3. Seven existing owner items, unchanged.`;

const backlog = read('tasks/BACKLOG.md');
assert(!backlog.includes('**s3566 VERIFICATION'));
fs.writeFileSync('tasks/BACKLOG.md', `✅ **s3566 VERIFICATION (${stamp}):** ${summary} Verification and inherited-receipt limits: artifacts/s3566/report.md. Closing acceptance is ledger-result.json, not anticipated by this row. No new task, dispatch, publication or owner decision.\n\n${backlog}`);
const handover='docs/HANDOVER-2026-09-06-attended.md';
fs.appendFileSync(handover, `\n\n### s3566 verification: dry board and completed November 19 duties\n\n${stamp}. ${summary}\n\nFresh verification and inherited-receipt limits: artifacts/s3566/report.md. Complete closing acceptance: artifacts/s3566/ledger-result.json. Exact s3565 line archived; all seven owner items unchanged. No product landing or dispatch.\n`);
fs.writeFileSync(`${dir}/report.md`, `# Gold Rush s3566 — Dry board and completed daily duties\n\n${summary}\n\nREADY-FOR-GATES is conditional on ledger-result.json; STATUS remains ACTIVE until acceptance.\n\n${detail}\n\nCommits: 0f1c1c55a (ACTIVE lock), 3831964b6 (exact predecessor archive). The closing receipt records the final handoff commit and matching origin main.\n\n## REMAINING LIST IN ORDER\n\n${remaining}\n`);

const noteStamp=execFileSync('date',['-u','+%Y%m%dT%H%M%SZ'],{encoding:'utf8'}).trim();
const title='Gold Rush — s3566 confirms dry lanes and completed November 19 duties';
const note=`---\nsource: codex\nproject: Gold Rush\ndate: ${stamp}\ntype: digest\n---\n# ${title}\n\n${summary}\n\nFresh board, lane, health, rotation and private-receipt verification is recorded in /Users/robin/Claude/Projects/Gold Rush/artifacts/s3566/report.md. Full ledger acceptance remains conditional on ledger-result.json. No product landing; CODEX-WALL and attended deployment custody remain in force. [[Gold Rush MOC]].\n\n${remaining}\n`;
const paths=[`/Users/robin/Obsidian/Brain/Projects/Gold Rush/${title} ${noteStamp}.md`,`/Users/robin/Obsidian/Brain/Sessions/codex/2026-11-19-s3566-dry-board-${noteStamp}.md`];
try { for(const p of paths)fs.writeFileSync(p,note,{flag:'wx'}); } catch(e) { console.log('Vault unavailable:',e.message); }
fs.writeFileSync(`${dir}/vault-paths.json`,JSON.stringify(paths,null,2)+'\n');
console.log({stamp,prepared:true,deskPreserved:true});
