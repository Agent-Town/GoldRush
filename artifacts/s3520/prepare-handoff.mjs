import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3520';
const read = p => fs.readFileSync(p, 'utf8');
const json = n => JSON.parse(read(`${dir}/${n}.json`));
const run = (c, a) => execFileSync(c, a, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const lock = read(`${dir}/lock.txt`).trimEnd();
const oldTail = read(`${dir}/desk-tail.txt`).trimEnd();
const tail = previous.slice(previous.indexOf('DESK-NOT-OWED:'));
assert(tail.endsWith(oldTail));
fs.writeFileSync(`${dir}/desk-tail.txt`, tail + '\n');
const q = json('queue-state'), d = json('duties'), live = json('live-probe');
assert(Object.values(q.queues).every(x => !x.length));
assert(!q.running.length && !q.pending.length && !q.newerFailures.length);
assert.match(read(`${dir}/dry-board.txt`), /✅ DRY/);
assert(Object.values(d.branchLogs).every(x => !x));
assert.equal(json('latest-run-resolution').leaf.status, 'merged');
assert(Object.values(json('latest-run-resolution').ancestors).every(Boolean));
assert(d.wholeFenceMatches && d.tickerPresent);
assert.equal(d.registry.rotations.length, 11);
const week = d.registry.rotations.find(x => x.id === 'r2026w47');
assert.equal(week.opensAt, '2026-11-16T00:00:00.000Z');
assert.equal(Object.keys(week.seeds).length, 6);
assert.match(read(`${dir}/mirror-freshness.txt`), /79\/79 day\(s\)/);
assert.match(read(`${dir}/mirror-exposure.txt`), /✅ CLEAN/);
assert.equal(read(`${dir}/private-heads.txt`), read('artifacts/s3511/private-heads.txt'));
const prior = JSON.parse(read('artifacts/s3519/ledger-result.json'));
assert.equal(prior.code, 0); assert(prior.unchanged && prior.headUnchanged);
assert.equal(live.filter(r => r.status === 200).length, 9);
assert(live.filter(r => r.url.includes('r2026w46')).every(r => r.status === 400 && r.summary.error === 'bad_rotation'));
assert.match(tail, /OWNER'S DESK — 7 awaiting/);
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
assert(Date.parse(stamp) < Date.parse('2026-11-11T02:10:00Z'));
const summary = 'WHY no product landing: DRY, 95 subjects and four absorbed lanes; runner 33370 alive. Week-46 standings still return 400 bad_rotation on both hosts; served build 299b1db5 ends at week 44. Week 47 and November 10 ticker already complete. Private coverage 79/79 through November 10. Evidence artifacts/s3520/report.md and ledger-result.json. Next: overdue attended deployment carrying weeks 45–47 with ASSAYER SYNCED; private duties November 11 after 02:10 UTC; week-48 mint November 18 00:00 UTC. Seven-item desk preserved.';
const body = summary + ' ' + tail;
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');
const status = read('STATUS.md');
assert.equal(status.split('\n')[0], lock);
assert(status.includes('- **s3519 handoff (line-1 archive):** ' + previous));
const tested = `ACTIVE ${stamp} (s3520 fire) — ${body}`;
fs.writeFileSync('STATUS.md', tested + '\n\n- **s3520 initial lock (line-1 archive):** ' + lock + '\n' + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, tested + '\n');
const commits = run('git', ['log', '--reverse', '--format=%h %s', read(`${dir}/entry-head.txt`).trim() + '..HEAD']);
fs.writeFileSync(`${dir}/report.md`, `# s3520 fire — dry board and current heartbeat duties

WHY no product landing: the maintained dry-board probe classified 1,483 done-moves into 95 subjects: 82 merged, 13 closed or blocked, zero eligible and zero unknown. All four main..lane histories are empty. All six queues, running tasks and crafting inbox are empty; no failed entry among 118 is newer than the predecessor. The newest run's historical index-lock failure is resolved: assayer-sync-visibility-1 has merged status and mergeHash b5d6d3c3248fdf0c4f61c853c040b651c650cf4f; that commit plus 4fe2becb8 and 614f84ca5 are main ancestors. No recovery, drain, refill, dispatch, art landing or new master is due. CODEX-WALL is preserved.

READY-FOR-GATES. The authorized increment is bookkeeping and heartbeat verification. The exact s3519 predecessor is archived; its seven-item Owner's Desk tail and both DESK-NOT-OWED acknowledgements are preserved. Inherited dashboard changes are committed. No source, simulation, render, goal leaf, BACKLOG row or player-facing change was authored, so no new Gazette item or gameplay acceptance is claimed.

Lock ownership is established by this run's launcher ancestry 96761 → 96809 → 96810, the empty fire directory mtime 2026-11-11T01:29:18.247Z and the launcher's 08:29:18 local FIRE START. The launcher identifies engine codex; no Claude identity is claimed. Runner 33370, PPID 1 and TTY ??, started November 10 10:06:33 local, is alive in ps and health-watch. The main-slot semaphore is scripts/lane-runner-v3.sh:322: ACTIVE and not lock CLEARED. The prior closing receipt is read as 1,263 passing tests, code 0, unchanged true and headUnchanged true. The launcher owns directory cleanup.

Fresh public GETs at 01:30–01:31 UTC confirm the existing deployment gap: week-46 standings is HTTP 400 bad_rotation on canonical and direct Pages hosts. Week-44 controls and nonempty stats JSON are HTTP 200. The served build remains 299b1db5 with weeks 37–44; main contains weeks 37–47 and its full public skill fence equals the registry. The absent served registry entries explain the observed rejection; the cause of the deployment delay remains unverified. Existing attended custody and the FIRE publication gate are preserved. No deployment was attempted. The next attended deployment must establish ASSAYER SYNCED, full served-registry parity and current standings recovery. GET samples do not establish gameplay, saves or replay acceptance.

RT-01 is discharged: r2026w47 already opens November 16 with six seeds, and bbbff3517 is a main ancestor. November 10's ticker draft and the s3519 census receipt were read; their historical census and build gates were not repeated. The next ticker is due after November 12 06:00 local; week-48 mint is due Wednesday November 18 00:00 UTC. No secret salt was accessed.

Private coverage is freshly verified as 79/79 days August 24–November 10. Strict exposure reads 79 mirrors and 5,904 keys with zero unreadable mirrors, account-class or unrecognised rows. Fresh archive heads match successful November 10 receipts: ledger-backups c4585cfe7bef44dcded714b3ccb344846c471d75 and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb. November 11 LB-01/FM-01 start after 02:10 UTC and were not run early. Private bytes remain outside this public tree. The attended disk-rescue and credential observations were read, not independently repeated; no credential values were accessed.

The ledger corpus was read through ledger-corpus.mjs, 19 parts. An evidence-only inline leaf probe initially had an extra closing brace and failed to parse; the corrected read-only command produced latest-run-resolution.json. No repository source was changed to accommodate a probe. The write-docs skill guided the handoff.

Evidence: dry-board.txt, lane-usable.txt, queue-state.json, latest-run-tail.txt, latest-run-resolution.json, process-verification.json, health.txt, duties.json, live-probe.json, mirror-freshness.txt, mirror-exposure.txt, private-heads.txt and ledger-scope.json.

Commits before closeout:

${commits.split('\n').map(x => '- ' + x).join('\n')}

The closing gate runs npm run test:ledger-guards on .nvmrc Node 26.4.0 using direct CommandLineTools Git and the established evidence-local serial scheduling adapter. Assertions and timeouts remain unchanged. Its manifest freezes the handoff and evidence. Acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true; this report does not anticipate that result. Only the STATUS lock/stamp envelope changes after acceptance. The clearing commit is the final main write, followed by origin backup. Later dashboard churn belongs to its live writer.

## REMAINING LIST IN ORDER

1. Overdue attended deployment carrying the complete registry through week 47; require ASSAYER SYNCED, served-registry parity and week-46 standings HTTP 200 on both hosts.
2. November 11 private duties after 02:10 UTC; next daily ticker after November 12 06:00 local.
3. Week-48 mint Wednesday November 18 00:00 UTC, before its November 23 opening.
4. Preserve all seven desk items, including the USB drive and OpenRouter rotation. No new owner decision was created.

If the closing ledger fails, retain ACTIVE and record the failure before exit. closeout.mjs prints the final clearing commit and origin parity.
`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3520 verification: dry board and current heartbeat duties\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3520/report.md. Runner 33370 alive; launcher 96761 → 96809 → 96810. Full eleven-rotation fence and week-47 presence verified; November 10 ticker and prior gates read without repeating their history. CODEX-WALL, attended custody, seven-item desk and both acknowledgements preserved. Private coverage and heads freshly read; no early private writes. Closing acceptance is artifacts/s3520/ledger-result.json; this entry does not anticipate it.\n`);
run('git', ['diff', '--check', '--', 'STATUS.md', handover]);
const now = new Date(); fs.utimesSync('tasks/.fire.lock', now, now);
console.log(summary);
