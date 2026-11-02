import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3505';
const read = p => fs.readFileSync(p, 'utf8');
const json = n => JSON.parse(read(`${dir}/${n}.json`));
const write = (n, s) => fs.writeFileSync(`${dir}/${n}`, s);
const run = (c, a) => execFileSync(c, a, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const lock = read(`${dir}/lock.txt`).trimEnd();
const desk = previous.slice(previous.lastIndexOf("🔺 **OWNER'S DESK"));
if (!desk.startsWith("🔺 **OWNER'S DESK — 5 awaiting a word.**")) throw Error('Unexpected desk');
write('desk-tail.txt', desk + '\n');
const receipt = JSON.parse(read('artifacts/s3486/duty-verification.json'));
const visibility = JSON.parse(read(`${dir}/private-visibility.txt`));
const heads = read(`${dir}/private-heads.txt`);
if (visibility.visibility !== 'PRIVATE' || !heads.includes(receipt.ledgerHead) || !heads.includes(receipt.memoryHead)) throw Error('Private receipt mismatch');
if (!read(`${dir}/mirror-freshness.txt`).includes('70/70 day(s)')) throw Error('Coverage mismatch');
if (!read(`${dir}/skillmd-tests.txt`).includes('ℹ pass 19') || !read(`${dir}/skillmd-tests.txt`).includes('ℹ fail 0')) throw Error('Skill gate incomplete');
if (!read(`${dir}/dry-board.txt`).includes('✅ DRY') || (read(`${dir}/lanes.txt`).match(/=> USABLE:/g) || []).length !== 4) throw Error('Board is not dry');
const q = json('queue-state'), duties = json('duties'), live = json('live-probe'), latest = json('latest-run-resolution'), rotation = json('rotation-recheck');
if (Object.values(q.queues).some(x => x.length) || q.running.length || q.pending.length || q.newerFailures.length) throw Error('New work');
if (Object.values(duties.branchLogs).some(Boolean) || !duties.wholeFenceMatches || !duties.ancestors['685bd41d9'] || !duties.tickerPresent) throw Error('Lane/rotation/ticker proof missing');
if (latest.leaf.status !== 'merged' || Object.values(latest.ancestors).some(v => !v)) throw Error('Latest run unresolved');
if (live.length !== 11 || live.filter(x => x.status === 200).length !== 9 || live.filter(x => x.summary?.error === 'bad_rotation').length !== 2) throw Error('Public probe changed');
if (rotation.sourceDiffFromServedBuild || rotation.controls.length !== 6 || rotation.controls.some(x => x.servedRotation !== 'r2026w44' || !x.servedWindowClosed || x.localRotation !== 'r2026w45')) throw Error('Rotation control changed');
if (Date.now() >= Date.parse('2026-11-02T02:10:00Z')) throw Error('Private duties are now due');
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
write('duty-verification.json', JSON.stringify({ at: new Date().toISOString(), visibility, ledgerHead: receipt.ledgerHead, memoryHead: receipt.memoryHead, coverage: receipt.coverage, coverageDay: '2026-11-01', verification: 'Completed November 1 receipts match fresh coverage and live private heads; no duplicate execution.', nextPrivateDutiesNotBefore: '2026-11-02T02:10:00Z', historicalExposure: { source: 'artifacts/s3486/mirror-exposure.txt', remeasuredThisFire: false }, ticker: { source: 'marketing/outbox/ticker-digest-2026-11-01.md', compiledThisFire: false, historicalCensusRerun: false }, rotation: { source: `${dir}/rotation-recheck.json`, minted: true, deploymentOverdue: true } }, null, 2) + '\n');
write('main-state.json', JSON.stringify({ at: new Date().toISOString(), head: run('git', ['rev-parse', 'HEAD']), status: run('git', ['status', '--short', '--untracked-files=no']), diffstat: run('git', ['diff', '--stat']), worktrees: run('git', ['worktree', 'list', '--porcelain']), scope: 'Bookkeeping and product-health evidence only; generated dashboard churn belongs to its live writer.' }, null, 2) + '\n');

const backlogPath = 'tasks/BACKLOG.md';
const backlog = read(backlogPath);
const row = backlog.split('\n').find(x => x.startsWith('🗓️ **RT-01 WEEK 45 MINTED'));
if (!row || row.includes('s3505 verification')) throw Error('Rotation row missing or already edited');
const verification = '**s3505 verification, 2026-11-02T00:46–00:47Z: deployment deadline PASSED.** Served build `299b1db5` still carries weeks 37–44. Canonical and direct Pages week-45 transfer GETs each return HTTP 400 `bad_rotation` twice; week-44 controls return HTTP 200 JSON. The unchanged seed selector, driven with the served registry, selects closed week 44 for all six rotation contracts; main selects open week 45. The unchanged submission window check implies `rotation_closed` for otherwise valid old-week submissions; no live submission was made. Mint duty remains discharged, but the next authorized attended deployment must carry week 45 and verify ASSAYER SYNCED plus served-registry parity. No new owner decision or fire deployment. Evidence: `artifacts/s3505/live-probe.json`, `rotation-recheck.json`, `report.md`.';
fs.writeFileSync(backlogPath, backlog.replace(row, row + ' ' + verification));

const summary = 'WHY no product landing: DRY (95 subjects, zero eligible/unknown), four absorbed lanes. Week-45 deployment OVERDUE: both public standings reads return 400 bad_rotation; build 299b1db5 ends at week 44. Evidence artifacts/s3505/report.md, rotation-recheck.json and ledger-result.json. Private coverage 70/70 through November 1; November 1 ticker complete. Next: authorized attended deployment with ASSAYER SYNCED; November 2 private duties after 02:10 UTC.';
const acknowledgements = previous.slice(previous.indexOf('DESK-NOT-OWED:'), previous.lastIndexOf("🔺 **OWNER'S DESK"));
const body = summary + ' ' + acknowledgements + desk;
write('handoff-body.txt', body + '\n');
const status = read('STATUS.md');
if (status.split('\n')[0] !== lock) throw Error('Lock changed');
const tested = `ACTIVE ${stamp} (s3505 fire) — ${body}`;
fs.writeFileSync('STATUS.md', tested + '\n\n- **s3504 handoff (line-1 archive):** ' + previous + '\n\n- **s3505 initial lock (line-1 archive):** ' + lock + '\n' + status.slice(status.indexOf('\n')));
write('tested-line1.txt', tested + '\n');
const lockHash = read(`${dir}/lock-commit.txt`).trim();
const bookkeepingHash = read(`${dir}/bookkeeping-commit.txt`).trim();
const remaining = '1. Complete the overdue week-45 deployment in the authorized attended session; require ASSAYER SYNCED, served registry including r2026w45, and canonical/direct week-45 standings HTTP 200.\n2. Run November 2 LB-01 and FM-01 after 02:10 UTC.\n3. Preserve the five Owner’s Desk items: account-registry deploy day, B1 phone verdicts, token revocation follow-up, firewall go and Ubuntu Pro attachment.\n4. Capture F-ATT-13’s intermittent stale-runner failure if it recurs before choosing a cure.';
const report = `# s3505 fire — week-45 deployment overdue; board dry

READY-FOR-GATES for bookkeeping closeout. WHY no product landing: no eligible authorized drain exists. Final acceptance is ledger-result.json. First ledger attempt passed all 1,263 Node checks and the shell kits (83 passed, zero failed), but the snapshot check correctly rejected it because the process-accounting paragraph and its reproducer were corrected during the run. Its logs, manifest and receipt are retained as ledger-*-attempt1 files. The final battery is repeated on stable bytes; no test assertion or timeout changed.

The week-45 deployment deadline passed at November 2 00:00 UTC. At 00:46–00:47Z, canonical and direct Pages transfer standings each returned HTTP 400 bad_rotation for r2026w45 on two samples; week-44 controls returned 200 JSON. Served build 299b1db5 still advertises only weeks 37–44. The public registry fed into the unchanged live-seed selector chooses closed week 44 for all six rotation contracts; main chooses open week 45. src/game/liveSeed.ts and functions/api/standings.ts have no diff from the served build commit. The submission window check at functions/api/standings.ts:1042 implies rotation_closed for otherwise valid old-week submissions; this is a source-based inference, not a live POST result. Root cause observed: the served registry lacks the open week, despite mint 685bd41d9 already being a main ancestor. No explanation for the deployment delay is inferred. The existing RT-01 week-45 ledger row now carries this evidence. Deployment retains attended custody under the inherited handoff and FIRE publish gate; no deployment attempted or new owner decision added.

Fresh board verification: 1,483 done-moves resolve to 95 subjects, 82 merged and 13 closed/blocked, zero eligible or unknown. Four main..lane histories are empty and each lane has zero tracked dirt; the lanes are behind main, not current for new work. Five worktrees are registered. All six queues, running tasks and crafting inbox are empty. No failure among 118 entries is newer than the predecessor handoff. The newest run is ${latest.log}; its old index-lock failure is resolved by delivery 4fe2becb8, landing b5d6d3c32 and record 614f84ca5, all freshly verified main ancestors with the goal leaf merged. No retry is owed. CODEX-WALL bars dispatch and refills; the lane probe proves absorption, not future subscription capacity.

Process ownership: launcher ancestry 79140 → 79184 → 79185 matches the directory timestamp 2026-11-02T00:45:31Z and local FIRE START 07:45:31. This is the invocation's own lock; no abandoned lock was displaced. Actual launcher engine is Codex despite the supplied Claude-edition heading. Runner 26518 is alive under parent 1. The main-slot semaphore is scripts/lane-runner-v3.sh:322, ACTIVE and not lock CLEARED. Directory cleanup belongs to the launcher. No factory process was restarted or terminated. An unnecessary non-gating unbounded status-history scan was stopped by its own PID 93665 after its advisory named the intended bounded regression command; initial output and the local invocation receipt are retained. The ledger battery independently runs the bounded archive check.

Heartbeat: nine established public URLs returned 200 in ${Math.min(...live.filter(x => x.status === 200).map(x => x.seconds))}–${Math.max(...live.filter(x => x.status === 200).map(x => x.seconds))} seconds, five API bodies ok:true and both stats empty:false. These do not establish gameplay, fresh replay acceptance or sustained health. Whole nine-rotation local registry/fence equality holds and skill checks passed 19/19 on .nvmrc Node 26.4.0. RT-01 mint duty is discharged; deployment remains overdue. November 1 ticker and its completion row were read; the historical 64-update census was not rerun. There was no player-visible merge or engine pin, so no Gazette duplicate. Fresh private coverage is 70/70 days August 24–November 1, and live PRIVATE archive heads match ledger-backups ${receipt.ledgerHead} and fire-memory ${receipt.memoryHead}. November 1 LB-01/FM-01 were completed in s3486; no duplicate execution and historical exposure checks were not repeated. November 2 private duties are not due until 02:10 UTC.

Commits before closeout: lock ${lockHash}; inherited dashboard bookkeeping ${bookkeepingHash}. The write-docs skill guided the handoff. Prior evidence-local probes and the ledger harness were read and adapted; the new bounded rotation control uses the existing selector. All 19 ledger files were consulted through ledger-corpus.mjs. The five-item Owner's Desk, acknowledgements, predecessor and initial lock are preserved byte-for-byte. F-STO-1 and F-CUT-1 retain attended custody; F-SRV-4 stopped-service and storage claims are not re-audited. F-ATT-13 remains open; no root cause or cure is claimed. No product code, assertion, art or engine pin changed, so drain-only builds/browser suites do not apply. The required npm run test:ledger-guards is the final verification after all ledger/handoff writes, using Node 26.4.0, /usr/sbin/lsof, DEVELOPER_DIR=/Library/Developer/CommandLineTools and the evidence-local adapter adding only --test-concurrency=1 at the ledger entry. Assertions and timeouts are unchanged. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. Only the lock/stamp envelope changes after acceptance; the clearing commit is the last main write, followed by origin backup. Later dashboard churn belongs to its live writer.

Evidence: dry-board.txt, lanes.txt, queue-state.json, duties.json, latest-run-resolution.json, launcher.json, health.txt, live-probe.json, rotation-recheck.json, skillmd-tests.txt, mirror-freshness.txt, private-heads.txt, private-visibility.txt, duty-verification.json, ledger-selection.json and main-state.json. Raw implementer log tail and inherited diff remain disk-local.

## REMAINING LIST IN ORDER

${remaining}
`;
write('report.md', report);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3505 verification: week-45 deployment overdue; board dry\n\n${stamp}. ${summary}\n\nFresh verification and remaining list: artifacts/s3505/report.md. Week-45 GETs return 400 bad_rotation twice per host, with week-44 200 controls; six selector controls choose closed week 44 using the served registry and open week 45 using main. No live submission. Existing RT-01 row updated; deployment retains attended custody. Runner 26518 alive; own launcher 79140 → 79184 → 79185. Queues and crafting inbox empty, no newer failures; latest run merged. Private heads and 70/70 coverage freshly verified; November 1 ticker read, historical census not repeated. CODEX-WALL and five-item desk preserved. Final acceptance is artifacts/s3505/ledger-result.json; this entry does not anticipate it.\n`);
try {
  const vault = '/Users/robin/Obsidian/Brain';
  const suffix = run('date', ['-u', '+%Y%m%dT%H%M%SZ']);
  const title = 'Gold Rush — Week 45 standings reject the missing deployed rotation';
  const project = `Projects/Gold Rush/${title} ${suffix}.md`;
  const digest = `Sessions/codex/2026-11-02-s3505-week45-overdue-${suffix}.md`;
  const note = `# ${title}\n\nAt November 2 00:46–00:47 UTC, canonical and direct Pages week-45 transfer reads return 400 bad_rotation on two samples each; week-44 controls return 200. Served build 299b1db5 still advertises weeks 37–44 while main has minted week 45. The unchanged selector chooses closed week 44 for all six contracts with the public registry and open week 45 with main. Source window checks imply rotation_closed for otherwise valid old-week submissions; no live POST was made. The existing RT-01 ledger row records the overdue attended deployment; require ASSAYER SYNCED and registry/standings parity.\n\nBoard DRY: 95 subjects, no eligible/unknown work; four absorbed lanes, queues and crafting inbox empty. Private coverage 70/70 through November 1; November 2 duties after 02:10 UTC. November 1 ticker already complete. CODEX-WALL and five desk items retained. Lock ${lockHash}; bookkeeping ${bookkeepingHash}. Full report: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3505/report.md. Final acceptance is ledger-result.json; this note does not anticipate it. Final hash discoverable with git log --all --grep='s3505: handoff'. [[Gold Rush MOC]].\n`;
  for (const [p, type, link] of [[project, 'reference', digest], [digest, 'digest', project]]) {
    fs.mkdirSync(vault + '/' + p.slice(0, p.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(vault + '/' + p, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-11-02\ntype: ${type}\n---\n${note}\n[[${link.slice(0, -3)}]]\n`, { flag: 'wx' });
  }
  write('vault-paths.json', JSON.stringify({ project: vault + '/' + project, digest: vault + '/' + digest }, null, 2) + '\n');
} catch (e) { write('vault-paths.json', JSON.stringify({ warning: String(e) }) + '\n'); console.log('Vault warning:', String(e)); }
console.log('Prepared under ACTIVE at', stamp);
