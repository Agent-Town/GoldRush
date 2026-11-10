import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3513', read=p=>fs.readFileSync(p,'utf8'), json=n=>JSON.parse(read(`${dir}/${n}.json`));
const run=(c,a)=>execFileSync(c,a,{encoding:'utf8'}).trim();
const old=read(`${dir}/predecessor.txt`).trimEnd(), lock=read(`${dir}/lock.txt`).trimEnd(), desk=read(`${dir}/desk-tail.txt`).trimEnd();
const q=json('queue-state'),d=json('duties');
assert(Object.values(q.queues).every(a=>!a.length));assert(!q.running.length&&!q.pending.length&&!q.newerFailures.length);
assert.match(read(`${dir}/dry-board.txt`),/✅ DRY/);assert(Object.values(d.branchLogs).every(s=>!s));assert(d.wholeFenceMatches);
assert.equal(json('latest-run-resolution')[0].status,'merged');assert(d.ancestors['b5d6d3c32']);
assert.match(read(`${dir}/mirror-freshness.txt`),/79\/79 day\(s\)/);assert.match(read(`${dir}/mirror-exposure.txt`),/✅ CLEAN/);
assert.equal(read(`${dir}/private-heads.txt`),read('artifacts/s3511/private-heads.txt'));
assert.equal(JSON.parse(read('artifacts/s3512/ledger-result.json')).code,0);
const stamp=run('date',['-u','+%Y-%m-%dT%H:%MZ']);
const summary='WHY no product landing: DRY, 95 subjects and four absorbed lanes; runner 33370 alive. Week-46 standings still return 400 bad_rotation on both hosts; public build 299b1db5 ends at week 44. Private coverage 79/79 through November 10; daily duties and November 9 ticker already complete. Evidence artifacts/s3513/report.md and ledger-result.json. Next: overdue attended deployment with ASSAYER SYNCED; week-47 mint November 11 00:00 UTC; next private duties November 11 after 02:10 UTC.';
const body=summary+' '+desk;
fs.writeFileSync(`${dir}/handoff-body.txt`,body+'\n');
const status=read('STATUS.md');assert.equal(status.split('\n')[0],lock);
const tested=`ACTIVE ${stamp} (s3513 fire) — ${body}`;
assert(status.includes('- **s3512 handoff (line-1 archive):** '+old));
fs.writeFileSync('STATUS.md',tested+'\n\n- **s3513 initial lock (line-1 archive):** '+lock+'\n'+status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`,tested+'\n');
const report=`# s3513 fire — dry board and current heartbeat duties

READY-FOR-GATES. WHY no product landing: the board is DRY. The maintained probe classified 1,483 done-moves into 95 subjects: 82 merged, 13 closed or blocked, zero eligible and zero unknown. All four main..lane histories are empty; all six queues, running tasks and crafting inbox are empty. None of the 118 failed entries is newer than s3512. The newest run's index-lock failure is resolved: assayer-sync-visibility-1 is merged, and 4fe2becb8, b5d6d3c32 and 614f84ca5 are main ancestors. No retry is owed. CODEX-WALL remains in force; usable lanes are not proof of subscription capacity. No refills, dispatches, art landings or new product findings.

Lock verification: this run owns launcher ancestry 56292 → 56680 → 56710, verified by ps command names; the directory is stamped 05:59:14.033 UTC. The empty directory has no PID file, so process ancestry provides ownership proof. The predecessor was cleared and its ledger receipt is accepted: 1,263 tests passed, code 0, unchanged and headUnchanged true. The runner is PID 33370, PPID 1, TTY ??, started November 10 10:06:33 local; ps and health-watch independently confirm it alive. The main-slot semaphore remains scripts/lane-runner-v3.sh:322, ACTIVE and not lock CLEARED. The launcher owns fire-directory cleanup. Previous line 1 and the five-item Owner's Desk tail, including both discharged acknowledgements, are preserved verbatim.

Fresh public verification at 06:11 UTC: nine responses HTTP 200, including nonempty valid stats JSON on both hosts. Current r2026w46 standings return 400 bad_rotation on canonical and direct Pages hosts; week-44 controls return 200. Served build 299b1db5 carries weeks 37–44. Main carries all ten rotations through week 46 and its entire skill fence matches the registry. The inherited deployment gap remains: attended deployment must carry the entire registry and establish ASSAYER SYNCED, served-registry parity and current standings recovery. The task's publication gate and attended custody apply. No deployment attempted; these GETs establish neither gameplay nor fresh replay acceptance.

Daily duties are already discharged by s3511. Fresh read-only verification finds 79/79 backup days August 24–November 10, 79 readable mirrors, 5,904 inspected keys, zero unreadable/account-class/unrecognised rows. Private remote heads match the successful daily receipts: ledger-backups c4585cfe7bef44dcded714b3ccb344846c471d75 and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. The mirror stays outside this public tree; no repeated pull or push. Today's successful duty receipts were read, not rerun. The November 9 ticker exists and was read; its historical census was not repeated. Week 46 is present and the next mint is due Wednesday November 11 00:00 UTC. No real-change merge means no new Gazette item.

Verification evidence: dry-board.txt, lane-usable.txt, queue-state.json, latest-run-tail.txt, latest-run-resolution.json, launcher.json, health.txt, duties.json, live-probe.json, mirror-freshness.txt, mirror-exposure.txt and private-heads.txt. All 19 ledger corpus files were consulted through ledger-corpus.mjs. No new BACKLOG row or goal event is introduced. Builds and browser gates are not repeated for this evidence-only increment; their predecessor results are historical, not new acceptance.

Commits before closeout: a7d14dafb lock, 7806b4f09 inherited dashboard bookkeeping. The write-docs skill guided this report and handoff. The final gate uses npm run test:ledger-guards on the .nvmrc Node 26.4.0 runtime and direct CommandLineTools Git, with the predecessor's evidence-local adapter selecting serial test scheduling; assertions and timeouts are unchanged. The ledger manifest freezes the handoff and evidence. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. This prepared report does not anticipate that result. After acceptance only the STATUS lock/stamp envelope changes; the clearing commit is the last main write, followed by origin backup. Subsequent generated dashboard churn belongs to its live writer.

## REMAINING LIST IN ORDER

1. Overdue attended deployment carrying weeks 45 and 46; require ASSAYER SYNCED, full served registry and current week-46 standings HTTP 200 on both hosts.
2. Mint week 47 on November 11 00:00 UTC, before its November 16 opening.
3. Compile November 10's ticker after November 11 06:00 local; run November 11 private duties after 02:10 UTC.
4. Preserve the five Owner's Desk items and attended custody. No new owner decision was created.

If the closing ledger fails, retain ACTIVE and record the failure before exit. The final clearing commit hash and origin parity are reported by closeout.mjs and the session result.
`;
fs.writeFileSync(`${dir}/report.md`,report);
const handover='docs/HANDOVER-2026-09-06-attended.md';read(handover);
fs.appendFileSync(handover,`\n\n### s3513 verification: dry board and current duties\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3513/report.md. Runner 33370 alive; launcher 56292 → 56680 → 56710. CODEX-WALL, attended custody and the five-item desk are preserved. Daily receipts read, coverage and private heads freshly verified; no repeated private writes. November 9 ticker read without repeating its historical census. Final acceptance is artifacts/s3513/ledger-result.json; this entry does not anticipate it.\n`);
run('git',['diff','--check','--','STATUS.md',handover]);
console.log(summary);
