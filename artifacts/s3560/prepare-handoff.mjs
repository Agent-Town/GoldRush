import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3560',read=p=>fs.readFileSync(p,'utf8');
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const v=JSON.parse(read(dir+'/verification.json')), inventory=JSON.parse(read(dir+'/inventory.json'));
assert(v.latestRunMerged&&v.wholeFenceMatches&&v.rotationCommitAncestor);
assert.match(read(dir+'/dry-board.txt'),/✅ DRY/);assert(Object.values(v.branchLogs).every(x=>!x));
assert.equal(JSON.parse(read(dir+'/private-visibility.txt')).visibility,'PRIVATE');
const duties=JSON.parse(read(dir+'/private-duty-results.json'));assert.equal(duties.length,4);assert(duties.every(x=>x.code===0));
assert.match(read(dir+'/mirror-freshness.txt'),/87\/87/);assert.match(read(dir+'/ledger-push.txt'),/✅ UNCHANGED/);assert.match(read(dir+'/ledger-pull.txt'),/NOT DISCHARGED for today/);
assert(Object.values(inventory.queues).every(x=>!x.length));assert.equal(inventory.running.length+inventory.crafting.length+inventory.newerFailures.length,0);
const tail=read(dir+'/desk-tail.txt').trimEnd();
const summary='WHY no product landing: DRY, 95 subjects, zero eligible or unknown; four absorbed lanes, six empty queues and no pending crafting orders. November 19 backup pull reached the box but today\'s snapshot was not generated yet; coverage remains 87/87 through November 18, private push unchanged. FM-01 complete unchanged. Health 200/200/200; week-47 standings still bad_rotation on both hosts. Evidence artifacts/s3560/report.md and ledger-result.json. Next: retry November 19 pull/push after source supply; attended deployment through week 48 with ASSAYER SYNCED; November 19 ticker after November 20 06:00 local; week-49 mint November 25. Seven-item desk preserved.';
const body=summary+' '+tail,line=`ACTIVE ${stamp} (s3560 fire) — ${body}`;
let status=read('STATUS.md');assert(status.split('\n')[0].includes('(s3560 fire)'));assert(status.includes('- **s3559 handoff (line-1 archive):** '+read(dir+'/predecessor.txt').trimEnd()));
fs.writeFileSync('STATUS.md',line+status.slice(status.indexOf('\n')));fs.writeFileSync(dir+'/tested-line1.txt',line+'\n');fs.writeFileSync(dir+'/handoff-body.txt',body+'\n');
fs.writeFileSync('tasks/BACKLOG.md',`✅ **s3560 VERIFICATION (${stamp}):** ${summary} Fresh checks and inherited-evidence limits: artifacts/s3560/report.md. Closing acceptance is ledger-result.json; this row does not anticipate it. Source supply delay is not a completed daily backup or a new product finding. No dispatch, publication or new owner decision.\n\n`+read('tasks/BACKLOG.md'));
const detail=`Fresh verification: 1,483 done-moves, 95 subjects (82 merged, 13 closed or blocked), zero eligible or unknown. All four main..lane histories are empty; six empty queues, no running task or crafting order, and no new failed Markdown entry. Runner 33370 is alive under PPID 1. Newest run's historical index-lock failure is resolved by its merged goal leaf and ancestral merge b5d6d3c3248fdf0c4f61c853c040b651c650cf4f. CODEX-WALL and attended custody stand. Main semaphore is scripts/lane-runner-v3.sh:322.

LB-01 ran after the command-derived 02:10 UTC cutoff. The pull exited 0 at 02:10:16 but explicitly reported NOT DISCHARGED: the source's randomized 02:00–03:00 UTC timer had not produced November 19. Do not mistake exit 0 or the advisory WHOLE AND CURRENT banner for today's completion. Strict push exited 0 unchanged, after 6,668 keys across 87 readable mirrors, zero unreadable/account-class/unrecognised rows. Coverage remains 87/87 days August 24–November 18. Archive visibility is PRIVATE; the effective configured archive matches that checked repository. Live ledger-backups head d0e7ef1b354a5671fdea99797b6d4c748d05aea2 verified. FM-01 exited 0 unchanged at 02:10:40; live fire-memory head 53d87470fb2670626fb4605d4dc0eb5bffd899fb verified. No database bytes or unsanitized tool output enter this public repo. A pre-window helper invocation refused before any duty ran; the unchanged helper ran successfully after the time boundary.

All twelve rotation entries match the whole public skill fence; week 48 opens November 23 and preparation commit 3198ba417 is ancestral. No mint is owed until November 25 for week 49. November 18 ticker and pinned census were read, not regenerated: 45 main updates, 45 first-parent commits, recorded busy-day control 136. Its single player event is week-48 preparation. No real-change merge occurred here, so no new Gazette entry is owed.

Health 200/200/200; independent GETs completed without timeouts, both stats bodies valid nonempty JSON. Live build 299b1db5 still serves weeks 37–44. Week-47 standings return 400 bad_rotation on both hosts; week-44 controls return 200. This confirms the existing registry deployment gap. Deployment remains attended-owned and publish-gated; no fresh ASSAYER SYNCED or browser acceptance claimed.

Launcher 69952 → Node 69999 → current fire 70000 owns the process directory created at 02:06:57 UTC. The predecessor's FIRE END at 08:06:50 local precedes this launch at 09:06:57. Actual engine Codex does not lift dispatch restrictions. Exact s3559 predecessor, both desk acknowledgements and all seven owner items are preserved. Shared vault and the 19-part BACKLOG corpus were read. Generated dashboard bookkeeping was preserved. Lane evidence and node_modules remain untouched.

Closing acceptance uses the complete unchanged npm run test:ledger-guards, repository Node 26.4.0, direct CommandLineTools Git, one test-file worker and process-bound idle-sleep inhibition. This reuses the predecessor's passing environment, preserving assertions, roster, scan window and timeouts. Only full acceptance with unchanged input and HEAD fingerprints permits lock CLEARED; that commit is the last main write.`;
const handover='docs/HANDOVER-2026-09-06-attended.md';fs.writeFileSync(handover,read(handover)+`\n\n### s3560 verification: dry board and November 19 backup awaiting source supply\n\n${stamp}. ${summary}\n\n${detail}\n`);
fs.writeFileSync(dir+'/report.md',`# Gold Rush s3560 — private backup awaits today's source snapshot

${summary}

READY-FOR-GATES is conditional on ledger-result.json. STATUS remains ACTIVE until the complete ledger passes.

## Verification and scope

${detail}

No product or art slice landed. No gameplay, spec, goal, assertion or runtime change was made. Product drain builds, browser gates and conditional art staging therefore do not apply. No new root cause was discovered; the existing deployment lag is confirmed and the daily backup supply delay is explicitly pending.

## Commits

- 720b5593d: ACTIVE lock.
- 26cc45435: exact predecessor archive and generated dashboard bookkeeping.
- No new private archive commit: both branches are unchanged.
- Final gate emits the clearing commit and matching origin head after acceptance.

## REMAINING LIST IN ORDER

1. November 19 private pull/push after the source snapshot appears; not discharged by this fire.
2. Attended deployment through week 48; verify ASSAYER SYNCED, served registry parity and week-47 standings 200 on both hosts.
3. November 19 ticker after November 20 06:00 local; November 20 private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.
4. Seven existing owner items unchanged.
`);
const noteStamp=execFileSync('date',['-u','+%Y%m%dT%H%M%SZ'],{encoding:'utf8'}).trim();
const title='Gold Rush — November 19 backup awaits source supply while the board is dry';
const note=`---\nsource: codex\nproject: Gold Rush\ndate: ${stamp}\ntype: digest\n---\n# ${title}\n\n${summary}\n\n${detail}\n\nEvidence: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3560/report.md. Final acceptance is ledger-result.json, not presumed. [[Gold Rush MOC]].\n`;
const paths=[`/Users/robin/Obsidian/Brain/Projects/Gold Rush/${title} ${noteStamp}.md`,`/Users/robin/Obsidian/Brain/Sessions/codex/2026-11-19-s3560-backup-awaits-source-${noteStamp}.md`];
for(const p of paths){assert(!fs.existsSync(p));fs.writeFileSync(p,note)}fs.writeFileSync(dir+'/vault-paths.json',JSON.stringify(paths,null,2));
console.log({stamp,prepared:true,deskPreserved:true});
