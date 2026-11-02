import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3506';
const read = p => fs.readFileSync(p, 'utf8');
const json = name => JSON.parse(read(`${dir}/${name}.json`));
const write = (name, content) => fs.writeFileSync(`${dir}/${name}`, content);
const run = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const lock = read(`${dir}/lock.txt`).trimEnd();
const desk = read(`${dir}/desk-tail.txt`).trimEnd();
const commands = json('private-duty-results');
if (commands.length !== 6 || commands.some(x => x.status !== 0)) throw Error('Private duties need investigation');
const visibility = JSON.parse(read(`${dir}/private-visibility.txt`));
if (visibility.visibility !== 'PRIVATE') throw Error('Private archive not verified');
const freshness = read(`${dir}/mirror-freshness.txt`);
const exposure = read(`${dir}/mirror-exposure.txt`);
const exposureKeys = Number(exposure.match(/keys inspected\s*:\s*(\d+)/)?.[1]);
if (!exposureKeys || !/account-class rows\s*:\s*0/.test(exposure) || !/unrecognised rows\s*:\s*0/.test(exposure) || !exposure.includes('0 unreadable')) throw Error('Exposure not clean');
const pull = read(`${dir}/ledger-pull.txt`);
const push = read(`${dir}/ledger-push.txt`);
const memory = read(`${dir}/fire-memory.txt`);
const heads = Object.fromEntries(read(`${dir}/private-heads.txt`).trim().split('\n').map(l => { const [hash, ref] = l.split(/\s+/); return [ref.split('/').at(-1), hash]; }));
const todayPresent = fs.existsSync('/Users/robin/.goldrush/ledger-backups/ledger-2026-11-02.db');
const end = todayPresent ? '2026-11-02' : '2026-11-01';
const count = todayPresent ? 71 : 70;
if (!freshness.includes(`${count}/${count} day(s)`)) throw Error('Unexpected coverage');
if (!todayPresent && !pull.includes('NOT DISCHARGED')) throw Error('Missing supply-window explanation');
if (!/UNCHANGED|PUSHED/.test(push) || !/unchanged|pushed/.test(memory)) throw Error('Missing private backup result');
const q = json('queue-state'), duties = json('duties'), latest = json('latest-run-resolution'), live = json('live-probe');
if (Object.values(q.queues).some(x => x.length) || q.running.length || q.pending.length || q.newerFailures.length) throw Error('Work arrived');
if (!read(`${dir}/dry-board.txt`).includes('✅ DRY') || (read(`${dir}/lane-usable.txt`).match(/=> USABLE:/g) || []).length !== 4 || Object.values(duties.branchLogs).some(Boolean)) throw Error('Board changed');
if (!duties.wholeFenceMatches || !duties.ancestors['685bd41d9'] || !duties.tickerPresent || latest.leaf.status !== 'merged' || Object.values(latest.ancestors).some(v => !v)) throw Error('Inherited claim not verified');
if (!read(`${dir}/skillmd-tests.txt`).includes('ℹ pass 19') || !read(`${dir}/skillmd-tests.txt`).includes('ℹ fail 0')) throw Error('Skill tests failed');
if (live.filter(x => x.status === 200).length !== 9 || live.filter(x => x.summary?.error === 'bad_rotation').length !== 2) throw Error('Public behavior changed');
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const backupSummary = todayPresent ? 'November 2 private backup complete; coverage 71/71 through November 2. FM-01 complete.' : 'November 2 backup awaits the source snapshot; coverage 70/70 through November 1. FM-01 complete.';
const nextBackup = todayPresent ? 'Next private duties November 3 after 02:10 UTC.' : 'Next fire retries November 2 LB-01 when the source snapshot exists; FM-01 needs no repeat today.';
write('duty-verification.json', JSON.stringify({ at: new Date().toISOString(), visibility, ledgerHead: heads['ledger-backups'], memoryHead: heads['fire-memory'], coverage: { start: '2026-08-24', end, present: count, expected: count }, todayDutyDischarged: todayPresent, exposure: { source: `${dir}/mirror-exposure.txt`, remeasuredThisFire: true, readableMirrors: count, unreadable: 0, keys: exposureKeys, accountClass: 0, unrecognised: 0 }, fireMemory: { completedTodayBy: 's3506', unchanged: memory.includes('unchanged'), liveHeadVerified: heads['fire-memory'] }, commands }, null, 2) + '\n');
const row = `🗄️ **LB-01 NOVEMBER 2 ${todayPresent ? 'COMPLETE' : 'SUPPLY WINDOW OBSERVED'}; FM-01 CURRENT (s3506, ${stamp}):** ${backupSummary} The bounded pull ran after 02:10 UTC. ${todayPresent ? 'The strict private push completed for the current series.' : "The pull reports NOT DISCHARGED: today's file is not supplied yet within the documented 02:00–03:00 UTC source timer window; the strict private push reports unchanged."} Separate strict exposure inspected ${exposureKeys} keys across ${count} readable mirrors, with zero unreadable mirrors and zero account-class or unrecognised rows; full output is retained in artifacts/s3506/mirror-exposure.txt. Archive visibility PRIVATE; live ledger-backups head ${heads['ledger-backups']} and fire-memory head ${heads['fire-memory']} verified. No private corpus enters the public tree. ${nextBackup} Evidence: artifacts/s3506/ledger-pull.txt, ledger-push.txt, mirror-exposure.txt, mirror-freshness.txt, fire-memory.txt, private-heads.txt, private-visibility.txt, private-duty-results.json, duty-verification.json, report.md.\n\n`;
const backlog = read('tasks/BACKLOG.md');
if (backlog.includes('LB-01 NOVEMBER 2')) throw Error('November 2 row already exists');
fs.writeFileSync('tasks/BACKLOG.md', row + backlog);
const summary = `WHY no product landing: DRY (95 subjects, zero eligible/unknown), four absorbed lanes. Week-45 deployment remains OVERDUE: both public standings reads return 400 bad_rotation; build 299b1db5 ends at week 44. ${backupSummary} Evidence artifacts/s3506/report.md and ledger-result.json. Next: authorized attended deployment with ASSAYER SYNCED. ${nextBackup}`;
const acknowledgements = previous.slice(previous.indexOf('DESK-NOT-OWED:'), previous.lastIndexOf("🔺 **OWNER'S DESK"));
const body = `${summary} ${acknowledgements}${desk}`;
write('handoff-body.txt', body + '\n');
const status = read('STATUS.md');
if (status.split('\n')[0] !== lock) throw Error('Lock changed');
const tested = `ACTIVE ${stamp} (s3506 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${tested}\n\n- **s3505 handoff (line-1 archive):** ${previous}\n\n- **s3506 initial lock (line-1 archive):** ${lock}\n` + status.slice(status.indexOf('\n')));
write('tested-line1.txt', tested + '\n');
const lockHash = read(`${dir}/lock-commit.txt`).trim(), bookkeepingHash = read(`${dir}/bookkeeping-commit.txt`).trim();
const remaining = `1. Complete the overdue week-45 deployment in the authorized attended session; require ASSAYER SYNCED, served registry including r2026w45 and canonical/direct week-45 standings HTTP 200.\n2. ${nextBackup}\n3. Preserve the five Owner's Desk items: account-registry deploy evening, B1 phone verdicts, token revocation follow-up, firewall go and Ubuntu Pro attachment.\n4. Capture F-ATT-13's intermittent stale-runner failure if it recurs before selecting a cure.`;
const report = `# s3506 fire — daily private duties and overdue week-45 deployment

READY-FOR-GATES for bookkeeping closeout. WHY no product landing: no eligible authorized drain exists. Final acceptance is ledger-result.json; this prepared report does not anticipate the battery result.

Fresh verification at 02:05 UTC: canonical and direct Pages week-45 standings return HTTP 400 bad_rotation. Week-44 controls return 200; served build 299b1db5 carries weeks 37–44. Main's week-45 mint 685bd41d9 is an ancestor and the whole nine-rotation skill fence matches. Skill tests passed 19/19. The observed deployment mismatch persists; the prior selector-control findings in artifacts/s3505/report.md were read; those controls were not repeated. No live submission. Deployment retains attended custody under the current handoff and FIRE publish gate, with no new owner decision needed.

Board: 1,483 done-moves, 95 subjects, 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty, with no tracked lane dirt. All six queues, running tasks and crafting inbox are empty; no failures among ${q.failedCount} entries newer than the predecessor. The latest run ${latest.log} contains an old index-lock failure; its goal is merged and delivery 4fe2becb8, landing b5d6d3c32 and record 614f84ca5 are main ancestors. No retry is owed. CODEX-WALL bars refills and dispatch. Lane absorption does not prove future subscription capacity.

Process ownership: parent chain 54421 → 54465 → 54466 matches the lock-directory creation 2026-11-02T02:03:33Z and local FIRE START 09:03:33. This is our launcher's lock, not another fire's. Actual engine is Codex despite the supplied Claude-edition heading. Runner 26518 is alive under parent 1. Main semaphore verified at scripts/lane-runner-v3.sh:322: ACTIVE and not lock CLEARED. The launcher owns directory cleanup; no process was restarted or terminated.

Private duties: ${backupSummary} ${nextBackup} Pull, strict push, FM-01, separate strict exposure, freshness and live private-head checks each returned exit 0; command timestamps and durations are in private-duty-results.json. Strict exposure inspected ${exposureKeys} keys across ${count} readable mirrors, zero unreadable mirrors and zero account-class or unrecognised rows. Full exposure output is retained without player rows. Live private heads: ledger-backups ${heads['ledger-backups']}; fire-memory ${heads['fire-memory']}. Archive PRIVATE was freshly verified before writes. Private bytes stay at ~/.goldrush/ledger-backups and in the private archive, outside this public tree.

Other heartbeat duties: nine established public reads returned HTTP 200 in ${Math.min(...live.filter(x => x.status === 200).map(x => x.seconds))}–${Math.max(...live.filter(x => x.status === 200).map(x => x.seconds))} seconds; both stats responses are JSON ok:true and empty:false. These samples do not establish browser gameplay or fresh replay acceptance. RT-01 mint duty is discharged; the next week-46 mint is not yet due (weekly trigger is Wednesday). November 1 ticker and its completion row were read; the historical census was not repeated. No real-change merge or engine pin occurred, so no Gazette item was added.

Lock commit ${lockHash}; inherited dashboard/usage bookkeeping ${bookkeepingHash}. The write-docs skill guided the handoff; prior evidence-local probe and ledger harness were read and adapted. All 19 ledger parts were consulted through ledger-corpus.mjs. The five-item desk, acknowledgements, predecessor and initial lock are preserved verbatim. F-STO-1 and F-CUT-1 retain attended custody; storage and F-SRV-4's stopped-service claim were not re-audited. F-ATT-13's cause remains unverified. No product source, art, assertions or engine pin changed; drain-only builds/browser gates do not apply.

The final npm run test:ledger-guards uses .nvmrc Node 26.4.0, /usr/sbin/lsof, DEVELOPER_DIR=/Library/Developer/CommandLineTools, and the existing evidence-local scheduling adapter adding only --test-concurrency=1 at the ledger entry. Assertions and timeouts stay unchanged. The immutable manifest must report code 0, unchanged true and headUnchanged true. Only the verified STATUS lock/stamp envelope changes afterward; the clearing commit is the last write to main, followed by origin backup. Later generated dashboard churn belongs to its live writer.

## REMAINING LIST IN ORDER

${remaining}
`;
write('report.md', report);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3506 verification: daily private duties and week-45 deployment overdue\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3506/report.md. Runner 26518 alive, own launcher 54421 → 54465 → 54466. CODEX-WALL, attended custody and five-item desk preserved. The ledger row records the private duty result; full exposure output retained. Final acceptance is artifacts/s3506/ledger-result.json, not anticipated here.\n`);
write('main-state.json', JSON.stringify({ at: new Date().toISOString(), head: run('git', ['rev-parse', 'HEAD']), status: run('git', ['status', '--short', '--untracked-files=no']), worktrees: run('git', ['worktree', 'list', '--porcelain']), scope: 'Bookkeeping and heartbeat only' }, null, 2) + '\n');
try {
  const vault = '/Users/robin/Obsidian/Brain', suffix = run('date', ['-u', '+%Y%m%dT%H%M%SZ']);
  const title = 'Gold Rush — November 2 private duties preserve the archive boundary';
  const project = `Projects/Gold Rush/${title} ${suffix}.md`, digest = `Sessions/codex/2026-11-02-s3506-private-duties-${suffix}.md`;
  for (const [p, type, link] of [[project, 'reference', digest], [digest, 'digest', project]]) {
    fs.mkdirSync(vault + '/' + p.slice(0, p.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(vault + '/' + p, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-11-02\ntype: ${type}\n---\n# ${title}\n\n${backupSummary} ${nextBackup} Live private archive verified. Public week-45 standings still return 400 bad_rotation; attended deployment remains overdue. Board dry with 95 subjects and four absorbed lanes. CODEX-WALL and five desk items preserved. Report: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3506/report.md. Gate acceptance is ledger-result.json, not anticipated by this note. Clearing commit discoverable with git log --all --grep='s3506: handoff'.\n\n[[Gold Rush MOC]] · [[${link.slice(0, -3)}]]\n`, { flag: 'wx' });
  }
  write('vault-paths.json', JSON.stringify({ project: vault + '/' + project, digest: vault + '/' + digest }, null, 2) + '\n');
} catch (e) { write('vault-paths.json', JSON.stringify({ warning: String(e) }) + '\n'); }
console.log('Prepared under ACTIVE at', stamp, backupSummary);
