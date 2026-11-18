import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3548', read=p=>fs.readFileSync(p,'utf8');
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const v=JSON.parse(read(dir+'/verification.json'));
assert(v.latestRunMerged&&v.wholeFenceMatches&&v.rotationCommitAncestor);
assert(Object.values(v.branchLogs).every(x=>!x));
assert.match(read(dir+'/dry-board.txt'),/✅ DRY/);
assert.match(read(dir+'/mirror-freshness.txt'),/87\/87/);
assert.equal(JSON.parse(read(dir+'/private-visibility.json')).visibility,'PRIVATE');
assert(v.privateDutyReceipt.every(x=>x.code===0));
const counts=JSON.parse(read(dir+'/board-counts.json'));
assert(Object.values(counts.dirs).every(x=>x.length===0));
assert.equal(counts.newerFailures.length,0);
const summary='WHY no product landing: DRY, 95 subjects, zero eligible or unknown; four absorbed lanes, six empty queues and no crafting orders. November 18 private coverage 87/87; backup, FM-01, week 48 and November 17 ticker already complete. Runner 33370 alive. Live week-47 standings still 400 bad_rotation; build 299b1db5 serves weeks 37–44. Evidence artifacts/s3548/report.md and ledger-result.json. Next: attended deployment through week 48 with ASSAYER SYNCED; November 19 daily duties; week-49 mint November 25. Seven-item desk preserved.';
const predecessor=read(dir+'/predecessor.txt').trimEnd();
const tail=predecessor.slice(predecessor.indexOf('DESK-NOT-OWED:'));
assert(tail.includes("🔺 **OWNER'S DESK — 7 awaiting a word.**"));
const body=summary+' '+tail;
let status=read('STATUS.md');
assert(status.split('\n')[0].includes('(s3548 fire)'));
assert(status.includes('- **s3547 handoff (line-1 archive):** '+predecessor));
const line=`ACTIVE ${stamp} (s3548 fire) — ${body}`;
fs.writeFileSync('STATUS.md',line+status.slice(status.indexOf('\n')));
fs.writeFileSync(dir+'/tested-line1.txt',line+'\n');
fs.writeFileSync(dir+'/handoff-body.txt',body+'\n');
const backlog=read('tasks/BACKLOG.md');
fs.writeFileSync('tasks/BACKLOG.md',`✅ **s3548 VERIFICATION (${stamp}):** ${summary} Fresh checks and inherited-claim limits: artifacts/s3548/report.md. Closing acceptance is artifacts/s3548/ledger-result.json; this row does not anticipate it. No new scope or owner decision.\n\n`+backlog);
const handover='docs/HANDOVER-2026-09-06-attended.md';
fs.writeFileSync(handover,read(handover)+`\n\n### s3548 verification: dry board and completed daily duties\n\n${stamp}. ${summary}\n\nFresh checks: artifacts/s3548/report.md. Launcher 61938 → 61986 → current fire 61987 owns tasks/.fire.lock; prior s3547 handoff archived exactly. Lane histories, queues, latest-run resolution, whole rotation fence, private coverage, archive visibility and both remote heads rechecked. Existing November 18 receipts and November 17 ticker read; no duplicate duty run. Live week-47 rejection persists. CODEX-WALL, attended deployment custody, seven owner items and both desk acknowledgements remain. Closing acceptance is ledger-result.json.\n`);
fs.writeFileSync(dir+'/report.md',`# s3548 fire — dry board and completed daily duties

READY-FOR-GATES: verification complete. Closing acceptance is recorded in ledger-result.json; this report does not anticipate it.

${summary}

## Evidence and verification limits

- Custody: launcher 61938 → Node 61986 → this fire 61987 began November 18 10:33 UTC and owns the fresh process directory. Predecessor s3547 cleared and passed 1,263/1,263 ledger tests. Runner 33370 remains alive, PPID 1. The main semaphore at scripts/lane-runner-v3.sh:322 checks ACTIVE and absence of lock CLEARED. The exact predecessor, seven-item owner desk and both DESK-NOT-OWED acknowledgements are preserved.
- Board: dry-board.txt reads 1,483 done-moves and classifies 95 subjects: 82 merged, 13 closed/blocked, zero eligible or unknown. lane-usable.txt and independent main..branch histories verify four absorbed lanes. Six queues, running tasks and crafting orders are empty. None of 118 historical failures is newer than the prior handoff. The newest October 23 log was read; assayer-sync-visibility-1 is merged as b5d6d3c3248fdf0c4f61c853c040b651c650cf4f, a verified main ancestor. No retry is owed. CODEX-WALL prohibits fire refills; stale lane dependencies require preflight before any future authorized dispatch.
- LB-01 and FM-01: read successful s3542 receipts for November 18, without rerunning completed duties. Fresh coverage is 87/87 days, August 24–November 18. Archive visibility is PRIVATE; remote ledger-backups d0e7ef1b354a5671fdea99797b6d4c748d05aea2 and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb match the receipts. Private bytes remain outside this public repository. Prior exposure results are inherited evidence; the closing battery includes its own exposure check.
- RT-01: r2026w48 opens November 23 UTC. The complete twelve-rotation registry matches the public/skill.md fence; preparation commit 3198ba417 is a main ancestor. No duplicate mint. TK-01: November 17 digest and its pinned window/census were read; the census was not regenerated. No player-visible change or engine pin landed here, so no Gazette event is owed.
- Live checks: landing and game HTTP 200; both stats endpoints return nonempty valid JSON. Served build 299b1db5 still advertises weeks 37–44. Week-47 standings return HTTP 400 bad_rotation on both hosts while week-44 controls return 200. This reproduces the existing deployment mismatch. Deployment remains attended-owned and publish-gated; no deployment attempted. See live-probe.json.
- Assayer/art: no pending order and no art/store landing, so no verdict or conditional staging audit is due.
- Scope: canonical nineteen-part BACKLOG corpus, latest handover, wall, owner desk, predecessor receipts and shared vault consulted. Dashboard changes preserved as bookkeeping; the transient goal-tree regeneration returned to tracked content without intervention. No runtime, goals, specs or assertions changed. No product build or browser gate applies.
- Closing battery: complete npm run test:ledger-guards under repository Node 26.4.0, test-file concurrency 1 and process-bound idle-sleep inhibition on battery power. Assertions, timeouts and package script are unchanged. Inputs and HEAD are fingerprinted. Any failure or concurrent mutation prevents clearance. The gate precedes the final lock-CLEARED commit, which is the last write to main. Actual exit, counts and input parity are in ledger-result.json.

## Commits

- e4cfe79ac: ACTIVE lock acquired.
- ade6d97ab: generated dashboard bookkeeping preserved.
- final-gate.mjs emits the closing commit and matching origin hash after verification.

## REMAINING LIST IN ORDER

1. Read ledger-result.json for mandatory closing acceptance; a red keeps STATUS ACTIVE.
2. Attended deployment through week 48, then ASSAYER SYNCED, served-registry parity and week-47 standings HTTP 200 on both hosts.
3. November 19 ticker after 06:00 local and private duties after 02:10 UTC; week-49 mint November 25 00:00 UTC.
4. Seven existing owner items, unchanged. No new owner decision requested.
`);
console.log({stamp,prepared:true,deskPreserved:true});
