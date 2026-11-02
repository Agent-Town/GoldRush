import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3508';
const read = p => fs.readFileSync(p, 'utf8');
const json = n => JSON.parse(read(`${dir}/${n}.json`));
const write = (n, s) => fs.writeFileSync(`${dir}/${n}`, s);
const run = (c, a) => execFileSync(c, a, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const lock = read(`${dir}/lock.txt`).trimEnd();
const desk = read(`${dir}/desk-tail.txt`).trimEnd();
const q = json('queue-state'), duties = json('duties'), latest = json('latest-run-resolution'), live = json('live-probe');
if (Object.values(q.queues).some(x => x.length) || q.running.length || q.pending.length || q.newerFailures.length) throw Error('Work arrived');
if (!read(`${dir}/dry-board.txt`).includes('✅ DRY') || (read(`${dir}/lane-usable.txt`).match(/=> USABLE:/g) || []).length !== 4 || Object.values(duties.branchLogs).some(Boolean)) throw Error('Board changed');
if (!duties.wholeFenceMatches || !duties.ancestors['685bd41d9'] || !duties.tickerPresent || latest.leaf.status !== 'merged' || Object.values(latest.ancestors).some(v => !v)) throw Error('Inherited claim not verified');
if (!read(`${dir}/skillmd-tests.txt`).includes('ℹ pass 19') || !read(`${dir}/skillmd-tests.txt`).includes('ℹ fail 0')) throw Error('Skill tests failed');
if (live.filter(x => x.status === 200).length !== 9 || live.filter(x => x.summary?.error === 'bad_rotation').length !== 2) throw Error('Public behavior changed');
if (!read(`${dir}/mirror-freshness.txt`).includes('71/71 day(s)')) throw Error('Coverage changed');
const priorDuties = JSON.parse(read('artifacts/s3506/private-duty-results.json'));
if (priorDuties.length !== 6 || priorDuties.some(x => x.status !== 0)) throw Error('Private duty receipt incomplete');
const heads = Object.fromEntries(read(`${dir}/private-heads.txt`).trim().split('\n').map(l => { const [hash, ref] = l.split(/\s+/); return [ref.split('/').at(-1), hash]; }));
const prior = JSON.parse(read('artifacts/s3506/duty-verification.json'));
if (heads['ledger-backups'] !== prior.ledgerHead || heads['fire-memory'] !== prior.memoryHead) throw Error('Private archive heads changed');
write('duty-verification.json', JSON.stringify({ at: new Date().toISOString(), completedBy: 's3506', receipt: 'artifacts/s3506/private-duty-results.json', coverage: { start: '2026-08-24', end: '2026-11-02', present: 71, expected: 71 }, freshlyVerifiedPrivateHeads: heads, nextPrivateDutiesNotBefore: '2026-11-03T02:10:00Z', repeatedPullPushOrExposure: false, ticker: { path: 'marketing/outbox/ticker-digest-2026-11-01.md', read: true, censusRepeated: false } }, null, 2));
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const summary = 'WHY no product landing: DRY (95 subjects, zero eligible/unknown), four absorbed lanes. Week-45 deployment remains OVERDUE: both public standings reads return 400 bad_rotation; build 299b1db5 ends at week 44. Private coverage 71/71 through November 2; daily duties and November 1 ticker already complete. Evidence artifacts/s3508/report.md and ledger-result.json. Next: authorized attended deployment with ASSAYER SYNCED; November 3 private duties after 02:10 UTC.';
const acknowledgements = previous.slice(previous.indexOf('DESK-NOT-OWED:'), previous.lastIndexOf("🔺 **OWNER'S DESK"));
const body = `${summary} ${acknowledgements}${desk}`;
write('handoff-body.txt', body + '\n');
const status = read('STATUS.md');
if (status.split('\n')[0] !== lock) throw Error('Lock changed');
const tested = `ACTIVE ${stamp} (s3508 fire) — ${body}`;
fs.writeFileSync('STATUS.md', `${tested}\n\n- **s3507 handoff (line-1 archive):** ${previous}\n\n- **s3508 initial lock (line-1 archive):** ${lock}\n` + status.slice(status.indexOf('\n')));
write('tested-line1.txt', tested + '\n');
const lockHash = read(`${dir}/lock-commit.txt`).trim(), bookkeepingHash = read(`${dir}/bookkeeping-commit.txt`).trim();
write('report.md', `# s3508 fire — dry board and overdue week-45 deployment

READY-FOR-GATES for bookkeeping closeout. WHY no product landing: no eligible authorized drain exists. Final acceptance is ledger-result.json; this prepared report does not anticipate its result.

Fresh verification at 04:33 UTC: canonical and direct Pages week-45 standings both return HTTP 400 bad_rotation. Week-44 controls return 200; served build 299b1db5 carries weeks 37–44. Main's week-45 mint 685bd41d9 is an ancestor and the whole nine-rotation skill fence matches; skill tests passed 19/19. The existing deployment mismatch persists. Earlier seed-selector findings were read in the ledger, not rerun; no live submission. The current handoff and FIRE publish gate retain attended deployment custody; no new owner decision is needed.

Board: 1,483 done-moves, 95 subjects, 82 merged, 13 closed/blocked, zero eligible or unknown. All four main..lane histories are empty and have zero tracked dirt; they remain stale behind main. All six queues, running tasks and crafting inbox are empty; no failures among ${q.failedCount} entries newer than the predecessor. The latest run ${latest.log} contains an old index-lock failure, but its goal is merged and delivery 4fe2becb8, landing b5d6d3c32 and record 614f84ca5 are verified main ancestors. No retry is owed. CODEX-WALL bars refill and dispatch. Lane absorption does not establish future subscription capacity.

Process ownership: 14434 → 14603 → 14605 is this fire's parent chain, matching directory creation 2026-11-02T04:32:00Z and local FIRE START 11:32:00. The launcher is scripts/fire-runner.sh and the actual engine is Codex despite the supplied Claude-edition heading. Runner 26518 is alive under parent 1. Main semaphore verified at scripts/lane-runner-v3.sh:322: ACTIVE and not lock CLEARED. The launcher owns directory cleanup; no process was restarted or terminated.

Private duties: s3506's November 2 pull, strict private push and FM-01 receipts were read, each exit 0. Fresh strict coverage is 71/71 days August 24–November 2. Fresh archive heads match those receipts: ledger-backups ${heads['ledger-backups']}; fire-memory ${heads['fire-memory']}. Those daily pull/push duties and the standalone exposure scan were not repeated; the final ledger battery includes the exposure guard. the prior 5,152-key exposure measurement and archive-visibility check are s3506 evidence, not fresh measurements here. Private bytes stay outside the public tree. Next private duties November 3 after 02:10 UTC.

Nine other public reads returned HTTP 200 in ${Math.min(...live.filter(x => x.status === 200).map(x => x.seconds))}–${Math.max(...live.filter(x => x.status === 200).map(x => x.seconds))} seconds; both stats responses are JSON ok:true and empty:false. These samples do not establish browser gameplay, fresh replay acceptance or sustained health. RT-01 mint duty is discharged; week 46 is not yet due (Wednesday trigger). November 1 ticker and completion row were read; the historical census was not repeated. No real-change merge or engine pin occurred, so no Gazette item is due.

Lock commit ${lockHash}; inherited dashboard bookkeeping ${bookkeepingHash}. The write-docs skill guided the report and handoff; the preceding probe and ledger harness were read and adapted. All 19 ledger files were consulted through ledger-corpus.mjs. The five-item desk, acknowledgements, predecessor and initial lock are preserved verbatim. F-STO-1 and F-CUT-1 retain attended custody; storage and F-SRV-4's stopped-service claim were not re-audited. F-ATT-13's cause remains unverified; capture it if the guard fails again. No product source, art, assertions or engine pin changed; drain-only build/browser gates do not apply. No new BACKLOG row or goal event is invented for this dry fire.

The final npm run test:ledger-guards uses .nvmrc Node 26.4.0, /usr/sbin/lsof and DEVELOPER_DIR=/Library/Developer/CommandLineTools. The evidence-local scheduling adapter adds only --test-concurrency=1 at the ledger entry, preserving assertions and timeouts. The immutable manifest must report code 0, unchanged true and headUnchanged true. Only the verified STATUS lock/stamp envelope changes afterward; the clearing commit is the last write to main, followed by origin backup. Later generated dashboard churn belongs to its live writer.

## REMAINING LIST IN ORDER

1. Complete the overdue week-45 deployment in the authorized attended session; require ASSAYER SYNCED, a served registry including r2026w45 and canonical/direct week-45 standings HTTP 200.
2. Next private duties November 3 after 02:10 UTC.
3. Preserve the five Owner's Desk items: account-registry deploy day, B1 phone verdicts, token revocation follow-up, firewall go and Ubuntu Pro attachment.
4. Capture F-ATT-13's intermittent stale-runner failure if it recurs before selecting a cure.
`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3508 verification: dry board and week-45 deployment overdue\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3508/report.md. Runner 26518 alive; own launcher 14434 → 14603 → 14605. CODEX-WALL, attended custody and the five-item desk are preserved. Daily private receipts read, coverage and remote heads freshly verified; no repeated private writes. Final acceptance is artifacts/s3508/ledger-result.json, not anticipated here.\n`);
write('main-state.json', JSON.stringify({ at: new Date().toISOString(), head: run('git', ['rev-parse', 'HEAD']), status: run('git', ['status', '--short', '--untracked-files=no']), scope: 'Bookkeeping and heartbeat only' }, null, 2));
try {
  const vault = '/Users/robin/Obsidian/Brain', suffix = run('date', ['-u', '+%Y%m%dT%H%M%SZ']);
  const title = 'Gold Rush — s3508 verifies dry lanes while week 45 deployment remains overdue';
  const project = `Projects/Gold Rush/${title} ${suffix}.md`, digest = `Sessions/codex/2026-11-02-s3508-dry-board-${suffix}.md`;
  for (const [p, type, link] of [[project, 'reference', digest], [digest, 'digest', project]]) {
    fs.mkdirSync(vault + '/' + p.slice(0, p.lastIndexOf('/')), { recursive: true });
    fs.writeFileSync(vault + '/' + p, `---\nsource: codex\nproject: Gold Rush\ndate: 2026-11-02\ntype: ${type}\n---\n# ${title}\n\n${summary} Full report: /Users/robin/Claude/Projects/Gold Rush/artifacts/s3508/report.md. Acceptance is ledger-result.json; this note does not anticipate its result. Lock ${lockHash}; bookkeeping ${bookkeepingHash}. Clearing commit discoverable with git log --all --grep='s3508: handoff'.\n\n[[Gold Rush MOC]] · [[${link.slice(0, -3)}]]\n`, { flag: 'wx' });
  }
  write('vault-paths.json', JSON.stringify({ project: vault + '/' + project, digest: vault + '/' + digest }, null, 2));
} catch (e) { write('vault-paths.json', JSON.stringify({ warning: String(e) })); }
console.log('Prepared under ACTIVE at', stamp);
