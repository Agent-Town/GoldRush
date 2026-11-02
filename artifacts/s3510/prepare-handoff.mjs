import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3510';
const read=p=>fs.readFileSync(p,'utf8');
const json=n=>JSON.parse(read(`${dir}/${n}.json`));
const write=(n,s)=>fs.writeFileSync(`${dir}/${n}`,s);
const run=(c,a)=>execFileSync(c,a,{encoding:'utf8'}).trim();
const old=read(`${dir}/predecessor.txt`).trimEnd();
const lock=read(`${dir}/lock.txt`).trimEnd();
const desk=old.slice(old.indexOf('DESK-NOT-OWED:'));
const q=json('queue-state'), duties=json('duties'), live=json('live-probe');
if(Object.values(q.queues).some(a=>a.length)||q.running.length||q.pending.length||q.newerFailures.length)throw Error('Work arrived');
if(!read(`${dir}/dry-board.txt`).includes('✅ DRY')||(read(`${dir}/lane-usable.txt`).match(/=> USABLE:/g)||[]).length!==4||Object.values(duties.branchLogs).some(Boolean))throw Error('Board not proven dry');
if(!duties.wholeFenceMatches||!duties.ancestors['685bd41d9']||!duties.tickerPresent)throw Error('Duties changed');
if(json('skill-result').code!==0||!read(`${dir}/skillmd-tests.txt`).includes('ℹ pass 19'))throw Error('Skill check failed');
if(json('latest-run-resolution')[0]?.status!=='merged'||!duties.ancestors['b5d6d3c32'])throw Error('Latest run not absorbed');
if(!read(`${dir}/mirror-freshness.txt`).includes('71/71 day(s)'))throw Error('Private coverage changed');
const prior=JSON.parse(read('artifacts/s3506/duty-verification.json'));
const receipts=JSON.parse(read('artifacts/s3506/private-duty-results.json'));
if(receipts.some(x=>x.status!==0))throw Error('Prior duty failed');
const heads=Object.fromEntries(read(`${dir}/private-heads.txt`).trim().split('\n').map(l=>{const [hash,ref]=l.split(/\s+/);return [ref.split('/').at(-1),hash]}));
if(heads['ledger-backups']!==prior.ledgerHead||heads['fire-memory']!==prior.memoryHead)throw Error('Private heads changed');
if(live.filter(x=>x.status===200).length!==9||live.filter(x=>x.summary?.error==='bad_rotation').length!==2)throw Error('Public behavior changed');
const stamp=run('date',['-u','+%Y-%m-%dT%H:%MZ']);
const summary='WHY no product landing: DRY (95 subjects, zero eligible/unknown), four absorbed lanes. s3509 ended and its failed ledger handoff is archived. Fresh week-45 standings still return 400 bad_rotation; public build 299b1db5 ends at week 44. Private coverage 71/71 through November 2; daily duties and November 1 ticker complete. Ledger acceptance: artifacts/s3510/ledger-result.json; report: artifacts/s3510/report.md. Next: overdue attended week-45 deployment with ASSAYER SYNCED; November 3 private duties after 02:10 UTC.';
const body=summary+' '+desk;
write('handoff-body.txt',body+'\n');write('desk-tail.txt',desk+'\n');
const status=read('STATUS.md');if(status.split('\n')[0]!==lock)throw Error('Lock changed');
const tested=`ACTIVE ${stamp} (s3510 fire) — ${body}`;
fs.writeFileSync('STATUS.md',tested+'\n\n- **s3509 handoff (line-1 archive):** '+old+'\n\n- **s3510 initial lock (line-1 archive):** '+lock+'\n'+status.slice(status.indexOf('\n')));
write('tested-line1.txt',tested+'\n');
write('report.md',`# s3510 fire — ledger recovery and verified dry board

READY-FOR-GATES for bookkeeping closeout. WHY no product landing: no eligible authorized drain exists. Acceptance is the complete ledger-result.json receipt; this prepared report does not anticipate its result.

The predecessor retained ACTIVE after its incomplete ledger run. The anchored launcher record proves s3509 ended at 2026-11-02T06:27:33Z, after its 06:25 stamp. This fire owns launcher ancestry 34572 → 34781 → 34807 and the directory created at 06:32:33Z; its FIRE START is 06:32:37Z. The exact predecessor and five-item desk, including both discharged acknowledgements, are preserved. Runner 26518 is alive under parent 1. The semaphore remains scripts/lane-runner-v3.sh:322, ACTIVE and not lock CLEARED. The launcher owns directory cleanup.

Verification: dry-board-probe examined 1,483 done-moves and 95 subjects; 82 merged, 13 closed/blocked, zero eligible/unknown. lane-usable reports four absorbed lanes, zero tracked dirt and stale branches behind main. All four main..lane histories are empty. Six queues, running tasks and crafting inbox are empty; no newer failure among 118 failed entries. Latest run assayer-sync-visibility-1 has an old index-lock failure, but its goal is merged and delivery 4fe2becb8, landing b5d6d3c32 and record 614f84ca5 are main ancestors. No retry is owed. CODEX-WALL still bars dispatch/refill; absorption does not establish future subscription capacity. The complete 19-file ledger corpus was consulted; F-STO-1 and F-CUT-1 retain attended custody. No factory audit or new scope was created.

Fresh public reads at ${live[0].at}: nine HTTP 200 responses; both stats bodies are JSON ok:true, empty:false. Canonical and direct week-45 standings each return HTTP 400 bad_rotation, while week-44 controls return 200. Build 299b1db5 advertises weeks 37–44. Local mint 685bd41d9 is on main, its whole nine-rotation skill fence matches, and skill tests pass 19/19. The existing deployment is overdue; the current handoff retains attended custody and the FIRE publish gate remains binding. No deploy attempted. HTTP samples do not establish gameplay, replay acceptance or sustained health. RT-01 is discharged; week 46 is not due until Wednesday. November 1 ticker and its completion row were read; its historical census was not repeated. No real-change merge or engine pin means no Gazette item is due.

Private duties: s3506's November 2 pull, strict private push and FM-01 receipts are all successful. Fresh strict coverage is 71/71 days August 24–November 2. Fresh private remote heads match those receipts: ledger-backups ${heads['ledger-backups']}; fire-memory ${heads['fire-memory']}. Pull/push were not repeated. The 5,152-key exposure count and archive-visibility check remain s3506 measurements, not new measurements here. The complete ledger battery includes exposure validation. Private bytes remain outside this public repo. Next duty is November 3 after 02:10 UTC.

Execution adaptation: the initial health-status command timed out at 45 seconds after reporting 200/200/200. Its retry uses the direct CommandLineTools Git path; see health-result.json. The first probe invocation raced its script creation and failed MODULE_NOT_FOUND; probe-startup-error.txt preserves it, and the completed retry supplies all current probe results. One mistaken freshness source filename was corrected using the file inventory. No source or test timeout was changed. Host load was elevated. Three paired rev-parse reads measured /usr/bin/git at 1480/400/472 ms and direct CommandLineTools Git at 571/8/30 ms, with identical HEAD. This small sample motivates the runtime PATH but does not prove the prior timeout's cause. The ledger uses Node 26.4.0, DEVELOPER_DIR and direct Git, with only the evidence-local serial scheduling adapter. Assertions and timeouts are unchanged.

Lock commit f82b0d314; inherited dashboard bookkeeping bab8ffd17. The write-docs skill guided this handoff. No product source, art, assertion, engine pin, BACKLOG row or goal event changed. Drain-only build/browser gates do not apply. The ledger manifest freezes this handoff and its evidence; code 0, unchanged true and headUnchanged true are required. The tested STATUS envelope is cleared only after acceptance, and that commit is the last main write, followed by origin backup. Concurrent generated dashboard output remains owned by its live writer.

## REMAINING LIST IN ORDER

1. Complete the overdue week-45 deployment in the authorized attended session; require ASSAYER SYNCED, a served registry including r2026w45 and both week-45 standings reads returning HTTP 200.
2. Run November 3 private duties after 02:10 UTC.
3. Preserve the five Owner's Desk items and attended custody. Capture F-ATT-13's intermittent stale-runner failure if it recurs; no cause is claimed.

If the complete ledger gate fails, retain ACTIVE and record the failed receipt before exit; no green closeout is implied by this prepared report.
`);
const handover='docs/HANDOVER-2026-09-06-attended.md';read(handover);
fs.appendFileSync(handover,`\n\n### s3510 verification: predecessor release, dry board and ledger recovery\n\n${stamp}. ${summary}\n\nFresh verification and inherited-claim limits: artifacts/s3510/report.md. The s3509 FIRE END is proven; all four lanes are absorbed, the crafting inbox and queues empty, and CODEX-WALL remains in force. The ledger retry uses the direct CommandLineTools Git binary after measured startup differences, without changing assertions or timeouts. Final acceptance is artifacts/s3510/ledger-result.json. This entry does not anticipate its result. All five desk items and attended deployment custody are preserved.\n`);
write('execution-notes.json',JSON.stringify({at:new Date().toISOString(),healthInitial:{timeoutSeconds:45,partial:'landing=200 game=200 api=200'},probeInitial:'MODULE_NOT_FOUND startup race; retained as probe-startup-error.txt',runtime:'Node 26.4.0; direct CommandLineTools Git; serial ledger scheduling; unchanged assertions/timeouts'},null,2));
console.log('Handoff prepared under ACTIVE',stamp);
