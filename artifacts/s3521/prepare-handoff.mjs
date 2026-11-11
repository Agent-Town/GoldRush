import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3521';
const read = p => fs.readFileSync(p, 'utf8');
const json = n => JSON.parse(read(`${dir}/${n}.json`));
const run = (c, a) => execFileSync(c, a, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const status = read('STATUS.md');
const lock = status.split('\n')[0];
assert.match(lock, /^ACTIVE .*\(s3521 fire\)/);
assert(status.includes('- **s3520 handoff (line-1 archive):** ' + previous));
const tail = previous.slice(previous.indexOf('DESK-NOT-OWED:'));
assert.match(tail, /OWNER'S DESK — 7 awaiting/);
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
assert.match(read(`${dir}/mirror-freshness.txt`), /80\/80 day\(s\)/);
assert.match(read(`${dir}/ledger-push.txt`), /✅ CLEAN/);
assert.match(read(`${dir}/ledger-push.txt`), /✅ PUSHED — 1 file\(s\)/);
assert.match(read(`${dir}/ledger-push.txt`), /keys inspected\s+: 5998/);
assert(json('private-duty-results').every(r => r.status === 0));
assert.equal(json('private-visibility').visibility, 'PRIVATE');
const heads = read(`${dir}/private-heads.txt`);
assert.match(heads, /af8bbd222a496bb84a76f346b122d375b16d380c\s+refs\/heads\/ledger-backups/);
assert.match(heads, /53d87470fb2670626fb4605d4dc0eb5bffd899fb\s+refs\/heads\/fire-memory/);
const prior = JSON.parse(read('artifacts/s3520/ledger-result.json'));
assert.equal(prior.code, 0); assert(prior.unchanged && prior.headUnchanged);
assert.equal(live.filter(r => r.status === 200).length, 9);
assert(live.filter(r => r.url.includes('r2026w46')).every(r => r.status === 400 && r.summary.error === 'bad_rotation'));
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const summary = 'November 11 LB-01/FM-01 complete: private coverage 80/80 through today; one snapshot pushed, memory unchanged. WHY no product landing: DRY, 95 subjects and four absorbed lanes; runner 33370 alive. Week-46 standings still return 400 bad_rotation on both hosts; build 299b1db5 ends at week 44. Week 47 and November 10 ticker already complete. Evidence artifacts/s3521/report.md and ledger-result.json. Next: overdue attended deployment carrying weeks 45–47 with ASSAYER SYNCED; November 12 ticker after 06:00 local and private duties after 02:10 UTC; week-48 mint November 18 00:00 UTC. Seven-item desk preserved.';
const body = summary + ' ' + tail;
fs.writeFileSync(`${dir}/lock.txt`, lock + '\n');
fs.writeFileSync(`${dir}/desk-tail.txt`, tail + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');
const tested = `ACTIVE ${stamp} (s3521 fire) — ${body}`;
fs.writeFileSync('STATUS.md', tested + '\n\n- **s3521 initial lock (line-1 archive):** ' + lock + '\n' + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, tested + '\n');
const backlog = read('tasks/BACKLOG.md');
const row = `🗄️ **LB-01 + FM-01 NOVEMBER 11 COMPLETE (s3521, ${stamp}):** Today's snapshot pulled after 02:10 UTC and one file pushed to the verified PRIVATE archive. Coverage 80/80 days August 24–November 11. Strict exposure inspected 5,998 keys in 80 readable mirrors, zero unreadable mirrors, account-class rows or unrecognised rows. Live ledger-backups head af8bbd222a496bb84a76f346b122d375b16d380c verified; FM-01 unchanged at verified 53d87470fb2670626fb4605d4dc0eb5bffd899fb. Private bytes remain outside this public repo. Next private duties November 12 after 02:10 UTC. Evidence: artifacts/s3521/private-duty-results.json, ledger-pull.txt, ledger-push.txt, fire-memory.txt, mirror-freshness.txt, private-heads.txt and private-visibility.json.`;
assert(!backlog.includes('LB-01 + FM-01 NOVEMBER 11 COMPLETE'));
fs.writeFileSync('tasks/BACKLOG.md', row + '\n\n' + backlog.replace('Next private duties November 11 after 02:10 UTC.', 'November 11 duty subsequently discharged by s3521; see the current completion row.'));
const commits = run('git', ['log', '--reverse', '--format=%h %s', read(`${dir}/entry-head.txt`).trim() + '..HEAD']);
fs.writeFileSync(`${dir}/report.md`, `# s3521 fire — November 11 private backup coverage complete

READY-FOR-GATES. November 11 LB-01 and FM-01 completed after 02:10 UTC. The snapshot was pulled and one file pushed to the verified PRIVATE archive. Coverage is 80/80 days August 24–November 11. Strict exposure inspected 5,998 keys across 80 readable mirrors with zero unreadable, account-class or unrecognised rows. Live archive heads are ledger-backups af8bbd222a496bb84a76f346b122d375b16d380c and fire-memory 53d87470fb2670626fb4605d4dc0eb5bffd899fb; memory was unchanged. Private bytes remain outside this public tree. The ledger completion row lands in the closing commit.

WHY no product landing: the maintained dry-board probe classified 1,483 done-moves into 95 subjects: 82 merged, 13 closed or blocked, zero eligible and zero unknown. All four main..lane histories are empty. All six queues, running tasks and crafting inbox are empty; no failed entry among 118 is newer than the predecessor. The latest run's historical index-lock failure is resolved: assayer-sync-visibility-1 is merged at b5d6d3c3248fdf0c4f61c853c040b651c650cf4f, with that hash, 4fe2becb8 and 614f84ca5 verified as main ancestors. CODEX-WALL and attended custody remain binding. No drain, refill, re-queue, new master or art landing is due.

Fresh public GETs at 02:46 UTC confirm week-46 standings HTTP 400 bad_rotation on canonical and direct Pages hosts. Week-44 controls and nonempty stats JSON return HTTP 200. Served build 299b1db5 carries weeks 37–44; main and its matching public skill fence contain all eleven rotations through week 47. The absent served entries explain the observed rejection; the reason deployment has been delayed is unverified. This is the existing attended deployment action, not a new owner decision. FIRE §3's publication gate and attended custody are preserved; no deployment was attempted. The attended deployment must establish ASSAYER SYNCED, full served-registry parity and current standings recovery. GET samples do not establish gameplay or replay acceptance.

RT-01 is discharged: week 47 has six seeds and opens November 16; mint bbbff3517 is a main ancestor. November 10 ticker and its historical census receipt were read, not rerun. Next ticker: November 12 after 06:00 local. Next mint: week 48 on Wednesday November 18 00:00 UTC. No secret salt was accessed. No player-visible merge or engine pin occurred, so no Gazette item or gameplay/build acceptance is claimed.

Lock ownership was proved by launcher ancestry 28292 → 28340 → 28342, fire-directory mtime 2026-11-11T02:43:39.354Z and the 09:43:39 local FIRE START. This launch identifies engine codex; no Claude identity is claimed. Runner 33370 is alive with PPID 1, TTY ??, started November 10 10:06:33 local. The main semaphore is scripts/lane-runner-v3.sh:322, ACTIVE and not lock CLEARED. The launcher owns directory cleanup. The exact s3520 predecessor is archived, preserving its seven-item Owner's Desk and both DESK-NOT-OWED acknowledgements. Its closing receipt records 1,263 passing tests, code 0 and unchanged tree/head. Inherited dashboard changes were committed; later dashboard churn belongs to its live writer.

The ledger corpus was read through ledger-corpus.mjs, 19 parts. One inline read-only probe had a missing array bracket and failed before execution; the corrected command generated the evidence. No repository source was changed to accommodate a probe. The write-docs skill guided this handoff. Prior vault notes supplied navigation only; current conclusions come from this session's checks. Attended disk-rescue and credential observations were read without independently repeating them or accessing credential values.

Evidence: dry-board.txt, lane-usable.txt, queue-state.json, latest-run-tail.txt, latest-run-resolution.json, process-verification.json, health.txt, duties.json, live-probe.json, private-duty-results.json, ledger-pull.txt, ledger-push.txt, fire-memory.txt, mirror-freshness.txt, private-heads.txt, private-visibility.json and ledger-scope.json.

Commits before closeout:

${commits.split('\n').map(x => '- ' + x).join('\n')}

Closing verification runs npm run test:ledger-guards on .nvmrc Node 26.4.0, direct CommandLineTools Git and the established evidence-local serial scheduling adapter. Assertions and timeouts remain unchanged. The manifest freezes the handoff and evidence; acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. This report does not anticipate that result. Only the STATUS lock/stamp envelope changes after acceptance. The clearing commit is the final main write, followed by origin backup; its hash is printed by closeout.mjs.

## REMAINING LIST IN ORDER

1. Overdue attended deployment carrying the whole registry through week 47; require ASSAYER SYNCED, served-registry parity and week-46 standings HTTP 200 on both hosts.
2. November 12 ticker after 06:00 local and private duties after 02:10 UTC.
3. Week-48 mint Wednesday November 18 00:00 UTC, before its November 23 opening.
4. Preserve the seven owner items, including the USB drive and OpenRouter rotation. No new owner decision was created.

If closing verification fails, retain ACTIVE and record the failure before exit.
`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3521 verification: November 11 private backup coverage complete\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3521/report.md. Private duties completed, 80/80 coverage and both remote heads verified. Runner 33370 alive; launcher 28292 → 28340 → 28342. Full eleven-rotation fence, week-47 presence, dry board and absorbed lanes verified. CODEX-WALL, attended custody, seven-item desk and both acknowledgements preserved. November 10 ticker and prior gates read without repeating their history. Closing acceptance is artifacts/s3521/ledger-result.json; this entry does not anticipate it.\n`);
run('git', ['diff', '--check', '--', 'STATUS.md', 'tasks/BACKLOG.md', handover]);
const now = new Date(); fs.utimesSync('tasks/.fire.lock', now, now);
console.log(summary);
