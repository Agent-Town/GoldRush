import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='artifacts/s3277';
const read=n=>fs.readFileSync(`${dir}/${n}`,'utf8');
const dry=read('dry-board.txt');
if(!dry.includes('✅ DRY')) throw Error('Await completed dry-board verdict');
const lanes=read('lane-usable.txt');
if(!lanes.includes('7 ahead of main, 0 could-not-answer')) throw Error('Reassess lane census');
const duties=JSON.parse(read('duties.json'));
if(!duties.wholeFenceMatches || Object.values(duties.branchLogs).some(Boolean)) throw Error('Reassess duties');
if(read('private-heads.txt')!==fs.readFileSync('artifacts/s3266/private-heads.txt','utf8')) throw Error('Private heads moved');
if(JSON.parse(read('private-visibility.json')).visibility!=='PRIVATE') throw Error('Private visibility changed');
const stamp=execFileSync('date',['-u','+%Y-%m-%dT%H:%MZ'],{encoding:'utf8'}).trim();
const predecessor=read('predecessor.txt').trimEnd();
const originalLock=read('lock.txt').trimEnd();
const desk=read('desk-tail.txt').trimEnd();
const discharges=predecessor.slice(predecessor.indexOf('DESK-NOT-OWED:'),predecessor.indexOf('🔺 **OWNER')).trimEnd();
const body='WHY no product landing: board DRY, 94 subjects, zero eligible/unknown; four runner branches absorbed, seven ahead scratch trees attended-owned. October 21 private coverage verified 59/59; PRIVATE remote heads match completed receipts. Week 44 registry and October 20 ticker verified. Live 62403b1d serves weeks 37–42; week 43 canonical/direct 400 bad_rotation, week-42 control 200. Stats JSON and Mac health pass. Next: authorized attended deployment carrying weeks 43–44 and ASSAYER SYNCED; F-CUT-1/droplet probe/release acceptance remain attended; next private coverage day October 22 after 02:10 UTC. Evidence artifacts/s3277/report.md and ledger-result.json.';
fs.writeFileSync(`${dir}/handoff-body.txt`,body+' '+discharges+' '+desk+'\n');
let status=fs.readFileSync('STATUS.md','utf8');
if(!status.split('\n')[0].includes('(s3277 fire)')) throw Error('Lost STATUS ownership');
if(status.includes('- **s3276 handoff (line-1 archive):**')) throw Error('Predecessor already archived');
const tested=`ACTIVE ${stamp} (s3277 fire) — ${body} ${discharges} ${desk}`;
status=tested+'\n\n'+`- **s3276 handoff (line-1 archive):** ${predecessor}\n`+`- **s3277 ACTIVE (line-1 archive):** ${originalLock}\n`+status.slice(status.indexOf('\n')+1);
fs.writeFileSync('STATUS.md',status);
fs.writeFileSync(`${dir}/tested-line1.txt`,tested+'\n');
const verification='Lock b229266ac; inherited dashboard bookkeeping fafea99b7. Own launcher 83541 → 83585 → 83586 matches directory-lock mtime 16:36:58 UTC and process starts; actual engine Codex. Runner 31360 alive under parent 1. Six queues, running tasks and pending crafting empty; none of 118 failures newer than predecessor. Latest October 9 run report read; e0c536dcc and 40dbcf2f8 verified main ancestors. CODEX-WALL remains in force; implementation subscription capacity UNVERIFIED. RT-01 discharged by the existing week-44 registry and matching whole skill fence. Private heads match s3266 receipts and archive visibility is PRIVATE; no duplicate private duty is due. Seven ahead scratch trees retain attended custody (unreported.txt). Exact predecessor/initial ACTIVE archives, three-item desk tail and discharge acknowledgements preserved. READY-FOR-GATES for bookkeeping. Closing validation in ledger-result.json follows these writes and precedes the clearing commit, the final main write, then origin backup. No product root cause or cure claimed.';
fs.appendFileSync('docs/HANDOVER-2026-09-06-attended.md',`\n\n### s3277 verification: dry board and current daily duties\n\n${stamp}. ${body}\n\n${verification}\n`);
const report=`# s3277 fire — dry board and current daily duties

READY-FOR-GATES for bookkeeping. WHY no product landing: all 94 board subjects resolve merged or closed/blocked; four runner branches are absorbed. Seven ahead scratch trees retain attended custody, and CODEX-WALL prohibits fire dispatch. No product root cause or cure is claimed.

Lock commit: b229266ac. Inherited dashboard bookkeeping: fafea99b7. The clearing commit is the final main write, followed by origin backup.

## Verification

| Check | Measured result | Receipt |
|---|---|---|
| Board | 94 subjects: 81 merged, 13 closed/blocked, zero eligible or unknown | dry-board.txt |
| Queues and assayer | Six queues, running tasks and pending orders empty; none of 118 failures newer than predecessor | queue-state.json |
| Lanes | Four empty main..branch logs; fleet covers 4/68 worktrees; seven ahead scratch trees attended-owned | lane-usable.txt, unreported.txt, duties.json |
| Processes | Own launcher 83541 → 83585 → 83586 matches directory-lock mtime 16:36:58 UTC and process starts; runner 31360 alive under parent 1 | launcher.json, runner-scan.json |
| RT-01 | Eight rotations through week 44 match the whole skill fence; week 44 opens October 26 | duties.json |
| TK-01 | October 20 ticker and completion row read; already discharged | marketing/outbox/ticker-digest-2026-10-20.md, ledger-selection.json |
| LB-01 / FM-01 | 59/59 days August 24–October 21; remote heads byte-match completed s3266 receipts; archive visibility PRIVATE | mirror-freshness.txt, private-heads.txt, private-visibility.json |
| Live deployment | Build 62403b1d serves weeks 37–42; week 43 canonical/direct 400 bad_rotation, week-42 control 200 | live-probe.json |
| Health | Canonical/direct stats 200 JSON with ok:true and a stats object; complete Mac health status exits 0 with 200/200/200 | live-probe.json, health-watch.txt |

The nineteen-part ledger corpus was read through scripts/ledger-corpus.mjs; no OWNER-PRIORITY row appeared. The newest October 9 runner report was read (74,799 tokens). Its historical blockers are not asserted current: e0c536dcc and 40dbcf2f8 are verified main ancestors. Implementation subscription capacity remains UNVERIFIED; lane-usable establishes branch custody, not quota. No runner restart was needed. Main-slot semaphore: scripts/lane-runner-v3.sh:322, ACTIVE without lock CLEARED. Actual launcher engine is Codex despite the Claude edition label. The fire log includes echoed event lines inside tool output; process ancestry and directory mtime establish this fire's custody.

Seven ahead scratch trees remain untouched: wt-holds1-candidate (1), wt-holds2 (1), wt-tape (1), wt-audio (1), wt-holds1 (2), wt-control (43), wt-aif1 (51); full paths and tips in unreported.txt. Existing attended deployment and release custody remains in force. No drain, refill, retry, Gazette item or deployment occurred. Live samples establish current responses, not sustained health or cause. Today's private duties were completed by s3266; remote heads and local coverage were verified without repeating the pull/push. No private corpus entered the public tree. RT-01 and TK-01 were already discharged.

Adaptation: reused the preceding read-only probe and ledger runner with only the evidence directory changed. Source, tests and package scripts are unchanged. Health status completed without an artificial wrapper timeout. No process was stopped. Generated dashboard churn was preserved as inherited; the goal-tree cache regenerated to its committed contents before the bookkeeping commit. No factory repair was attempted. Existing untracked attended configurations, paused tasks and run logs remain untouched.

The closing gate selects Node 26.4.0 and process-local DEVELOPER_DIR=/Library/Developer/CommandLineTools. The archive audit uses its documented bounded regression command, --limit 40 --quiet. The exact predecessor and initial ACTIVE line are archived. The three-item Owner's Desk tail and discharge acknowledgements are preserved verbatim. Final validation is npm run test:ledger-guards: ledger-manifest.json fingerprints tested files and HEAD; ledger-result.json records the result. The tested line stays ACTIVE. Only after a passing result does the line-1 lock/stamp envelope change in the clearing commit, the final main write. Product tsc/build/browser gates do not apply to this bookkeeping-only increment.

## Remaining, in order

1. Authorized attended deployment carrying weeks 43 and 44, then ASSAYER SYNCED and standings verification. Week 43 is overdue; week 44 opens October 26.
2. Existing attended F-CUT-1 follow-up, droplet JSON-probe installation, and device/release acceptance. Preserve the three Owner's Desk obligations.
3. Next LB-01/FM-01 coverage day October 22, not before 02:10 UTC.
`;
fs.writeFileSync(`${dir}/report.md`,report);
const vault='/Users/robin/Obsidian/Brain';
const suffix=execFileSync('date',['-u','+%Y%m%dT%H%M%SZ'],{encoding:'utf8'}).trim();
const note=`Projects/Gold Rush/Gold Rush — s3277 verifies dry lanes and current daily duties ${suffix}.md`;
fs.writeFileSync(`${vault}/${note}`,`---\nsource: codex\nproject: Gold Rush\ndate: 2026-10-21\ntype: reference\n---\n# Gold Rush — s3277 verifies dry lanes and current daily duties\n\n${body}\n\n${verification}\n\nHealth status completed successfully. Full evidence: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3277/report.md. Closing ledger validation follows this note; the digest records its result.\n\n[[MOCs/Gold Rush MOC]]\n`);
fs.writeFileSync(`${dir}/vault-note-path.txt`,`${vault}/${note}\n`);
console.log('Handoff, report and vault reference written at',stamp);
