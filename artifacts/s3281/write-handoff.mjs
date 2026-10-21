import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3281';
const read=n=>fs.readFileSync(`${dir}/${n}`,'utf8');
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const predecessor=read('predecessor.txt').trimEnd();
const originalLock=read('lock.txt').trimEnd();
const ownerDesk=read('desk-tail.txt').trimEnd();
const duties=JSON.parse(read('duties.json'));
if(!read('dry-board.txt').includes('✅ DRY') || !read('lane-usable.txt').includes('7 ahead of main, 0 could-not-answer'))throw Error('Board changed');
if(!duties.wholeFenceMatches||Object.values(duties.branchLogs).some(Boolean)||!Object.values(duties.ancestors).every(Boolean))throw Error('Duty verification failed');
if(read('private-heads.txt')!==fs.readFileSync('artifacts/s3266/private-heads.txt','utf8'))throw Error('Private heads moved');
if(JSON.parse(read('private-visibility.json')).visibility!=='PRIVATE')throw Error('Private archive visibility changed');
if(!read('health-watch.txt').includes('landing=200 game=200 api=200'))throw Error('Health changed');
const live=JSON.parse(read('live-probe.json'));
if(live.some(x=>x.error))throw Error('Live probe incomplete');
if(live.find(x=>x.url.endsWith('/version.json')).version.build!=='62403b1d')throw Error('Build moved');
if(live.filter(x=>x.url.endsWith('/stats')).some(x=>x.status!==200||!x.summary?.ok||!x.summary?.statsObject))throw Error('Stats changed');
if(live.filter(x=>x.url.includes('rotation=r2026w43')).some(x=>x.status!==400||x.summary?.error!=='bad_rotation'))throw Error('Week 43 changed');
if(live.find(x=>x.url.includes('rotation=r2026w42')).status!==200)throw Error('Week 42 control failed');
const q=JSON.parse(read('queue-state.json'));if(Object.values(q.queues).some(x=>x.length)||q.running.length||q.pending.length||q.newerFailures.length)throw Error('Work appeared');
if(Date.now()>=Date.parse('2026-10-21T23:00Z'))throw Error('Ticker now due');
const discharges=predecessor.slice(predecessor.indexOf('DESK-NOT-OWED:'),predecessor.indexOf('🔺 **OWNER')).trimEnd();
const body='WHY no product landing: board DRY, 94 subjects, zero eligible/unknown; four runner branches absorbed, seven ahead scratch trees attended-owned. October 21 private coverage verified 59/59; PRIVATE remote heads match completed receipts. Week 44 registry and October 20 ticker verified. Live 62403b1d serves weeks 37–42; week 43 canonical/direct 400 bad_rotation, week-42 control 200. Stats JSON and Mac health pass. Next: authorized attended deployment carrying weeks 43–44 and ASSAYER SYNCED; F-CUT-1/droplet probe/release acceptance remain attended; October 21 ticker due after October 22 06:00 local; next private coverage day October 22 after 02:10 UTC. Evidence artifacts/s3281/report.md and ledger-result.json.';
fs.writeFileSync(`${dir}/handoff-body.txt`,body+' '+discharges+' '+ownerDesk+'\n');
let status=fs.readFileSync('STATUS.md','utf8');
if(!status.split('\n')[0].includes('(s3281 fire)'))throw Error('Lost ownership');
if(status.includes('- **s3280 handoff (line-1 archive):**'))throw Error('Predecessor already archived');
const tested=`ACTIVE ${stamp} (s3281 fire) — ${body} ${discharges} ${ownerDesk}`;
fs.writeFileSync('STATUS.md',tested+'\n\n'+`- **s3280 handoff (line-1 archive):** ${predecessor}\n- **s3281 ACTIVE (line-1 archive):** ${originalLock}\n`+status.slice(status.indexOf('\n')+1));
fs.writeFileSync(`${dir}/tested-line1.txt`,tested+'\n');
const verification='Lock 76db7cac2; inherited dashboard bookkeeping 6c1a75b63. Own launcher 93043 → 93087 → 93088 matches directory-lock mtime 21:07:46 UTC and process starts; actual engine Codex. Runner 31360 alive under parent 1. Six queues, running tasks and pending crafting empty; none of 118 failures newer than predecessor. Latest October 9 run report read; e0c536dcc and 40dbcf2f8 verified main ancestors. CODEX-WALL remains in force; implementation subscription capacity UNVERIFIED. RT-01 discharged by the existing week-44 registry and matching whole skill fence. Private heads match s3266 receipts and archive visibility is PRIVATE; no duplicate private duty is due. Seven ahead scratch trees retain attended custody (unreported.txt). Exact predecessor/initial ACTIVE archives, three-item desk tail and discharge acknowledgements preserved. READY-FOR-GATES for bookkeeping. Closing validation in ledger-result.json follows these writes and precedes the clearing commit, the final main write, then origin backup. No product root cause or cure claimed.';
fs.appendFileSync('docs/HANDOVER-2026-09-06-attended.md',`\n\n### s3281 verification: dry board and current daily duties\n\n${stamp}. ${body}\n\n${verification}\n`);
const report=`# s3281 fire — dry board and current daily duties

READY-FOR-GATES for bookkeeping. WHY no product landing: all 94 board subjects resolve merged or closed/blocked; four runner branches are absorbed. Seven ahead scratch trees retain attended custody. CODEX-WALL prohibits fire dispatch. No product root cause or cure is claimed.

Lock commit: 76db7cac2. Inherited dashboard bookkeeping: 6c1a75b63. The clearing commit will be the final main write, followed by origin backup.

| Check | Verified result | Receipt |
|---|---|---|
| Board | 94 subjects: 81 merged, 13 closed/blocked, zero eligible or unknown | dry-board.txt |
| Queues and assayer | Six queues, running tasks and pending orders empty; none of 118 failures newer than predecessor | queue-state.json |
| Lanes | Four empty main..branch logs; fleet covers 4/68 worktrees; seven ahead scratch trees attended-owned | lane-usable.txt, unreported.txt, duties.json |
| Processes | Own launcher 93043 → 93087 → 93088 matches 21:07:46 UTC directory-lock mtime and process starts; runner 31360 alive under parent 1 | launcher.json, runner-scan.json |
| RT-01 | Eight rotations through week 44 match the whole skill fence; week 44 opens October 26 | duties.json |
| TK-01 | October 20 ticker and completion row read; October 21 ticker not due until October 22 06:00 local | ledger-selection.json, marketing/outbox/ticker-digest-2026-10-20.md |
| LB-01 / FM-01 | 59/59 days August 24–October 21; remote heads match s3266 completed receipts; archive PRIVATE | mirror-freshness.txt, private-heads.txt, private-visibility.json |
| Live deployment | Build 62403b1d serves weeks 37–42; week 43 canonical/direct 400 bad_rotation; week-42 control 200 | live-probe.json |
| Health | Canonical/direct stats 200 JSON with ok:true and stats object; full Mac health exits 0, landing/game/API 200 | live-probe.json, health-watch.txt |

Read the nineteen-part ledger corpus through scripts/ledger-corpus.mjs; no OWNER-PRIORITY row found. The newest October 9 runner report was read (74,799 tokens). Its old blockers are not asserted current: e0c536dcc and 40dbcf2f8 are main ancestors. The runner's lane-usable probe establishes branch custody, not subscription quota; implementation capacity remains UNVERIFIED. No runner restart was needed. Main-slot semaphore: scripts/lane-runner-v3.sh:322, ACTIVE without lock CLEARED. The actual launcher uses Codex despite the Claude edition label. Fire-log output contains echoed event lines, so ancestry and directory mtime establish custody.

Seven ahead scratch trees remain attended-owned: wt-holds1-candidate (1), wt-holds2 (1), wt-tape (1), wt-audio (1), wt-holds1 (2), wt-control (43), wt-aif1 (51). Full paths and tips: unreported.txt. No drain, refill, retry, Gazette item or deployment occurred. Existing deployment and release custody remains attended. The FIRE protocol's publish gate leaves scripts/deploy.sh to the attended session; it was not routed through node. Live samples establish current responses, not sustained health or cause.

Private duties were already discharged by s3266; remote heads and local coverage were verified without repeating pulls or pushes. No private corpus entered the public tree. October 22 private coverage is due no earlier than 02:10 UTC; October 21 ticker compilation is due at 23:00 UTC October 21. RT-01 is already discharged.

Adaptation: reused the preceding read-only probe and ledger runner with the new evidence directory. Source, tests and package scripts are unchanged. Generated dashboard churn was committed as inherited bookkeeping. Existing untracked attended configurations, paused tasks and run logs remain untouched. The documented lane-usable.mjs --unreported command provided the scratch-tree census. No factory repair or process termination was attempted.

Final validation uses Node 26.4.0, process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools, and the unmodified npm run test:ledger-guards. ledger-manifest.json fingerprints the tested files and HEAD; ledger-result.json records the result. The bounded status archive audit checks --limit 40 --quiet. Exact predecessor and initial ACTIVE lines are archived, and the three-item Owner's Desk tail and discharge acknowledgements are preserved verbatim. The tested STATUS line remains ACTIVE until the gate passes; only its lock/stamp envelope changes in the final clearing commit. Product tsc/build/browser gates do not apply to this bookkeeping-only increment.

Remaining, in order:

1. Authorized attended deployment carrying weeks 43–44, then ASSAYER SYNCED and standings verification. Week 43 is overdue; week 44 opens October 26.
2. Existing attended F-CUT-1 follow-up, droplet JSON-probe installation, and device/release acceptance. Preserve the three Owner's Desk obligations.
3. October 21 ticker after October 22 06:00 local; LB-01/FM-01 October 22 coverage not before 02:10 UTC.
`;
fs.writeFileSync(`${dir}/report.md`,report);
try {
const vault='/Users/robin/Obsidian/Brain';const suffix=execFileSync('date',['-u','+%Y%m%dT%H%M%SZ'],{encoding:'utf8'}).trim();
const note=`Projects/Gold Rush/Gold Rush — s3281 verifies dry lanes and current daily duties ${suffix}.md`;
fs.writeFileSync(`${vault}/${note}`,`---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-22\ntype: reference\n---\n# Gold Rush — s3281 verifies dry lanes and current daily duties\n\n${body}\n\n${verification}\n\nClosing ledger validation follows this note; the session digest records its result.\n\n[[MOCs/Gold Rush MOC]]\n`,{flag:'wx'});
fs.writeFileSync(`${dir}/vault-note-path.txt`,`${vault}/${note}\n`);
}catch(e){console.log('Vault unavailable; continuing:',e.message)}
console.log('Handoff, report and vault reference written at',stamp);
