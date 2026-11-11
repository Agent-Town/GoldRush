import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3522';
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const run = (c, a) => execFileSync(c, a, { encoding: 'utf8' }).trim();
const previous = read(`${dir}/predecessor.txt`).trimEnd();
const status = read('STATUS.md');
const lock = status.split('\n')[0];
assert.match(lock, /^ACTIVE .*\(s3522 fire\)/);
assert(status.includes('- **s3521 handoff (line-1 archive):** ' + previous));
const tail = previous.slice(previous.indexOf('DESK-NOT-OWED:'));
assert.match(tail, /OWNER'S DESK — 7 awaiting/);
const q = json(`${dir}/queue-state.json`), d = json(`${dir}/duties.json`);
assert(Object.values(q.queues).every(x => !x.length));
assert(!q.running.length && !q.pending.length && !q.newerFailures.length);
assert.match(read(`${dir}/dry-board.txt`), /✅ DRY/);
assert(Object.values(d.branchLogs).every(x => !x));
const resolution = json(`${dir}/latest-run-resolution.json`);
assert.equal(resolution.leaf.status, 'merged');
assert(Object.values(resolution.ancestors).every(Boolean));
assert(d.wholeFenceMatches && d.tickerPresent);
assert.equal(d.registry.rotations.length, 11);
const week = d.registry.rotations.find(x => x.id === 'r2026w47');
assert.equal(week.opensAt, '2026-11-16T00:00:00.000Z');
assert.equal(Object.keys(week.seeds).length, 6);
assert.match(read(`${dir}/mirror-freshness.txt`), /80\/80 day\(s\)/);
assert.equal(json(`${dir}/private-visibility.json`).visibility, 'PRIVATE');
const heads = read(`${dir}/private-heads.txt`);
assert.match(heads, /af8bbd222a496bb84a76f346b122d375b16d380c\s+refs\/heads\/ledger-backups/);
assert.match(heads, /53d87470fb2670626fb4605d4dc0eb5bffd899fb\s+refs\/heads\/fire-memory/);
const prior = json('artifacts/s3521/ledger-result.json');
assert.equal(prior.code, 0); assert(prior.unchanged && prior.headUnchanged);
assert(json('artifacts/s3521/private-duty-results.json').every(x => x.status === 0));
const live = json(`${dir}/live-probe.json`);
assert.equal(live.filter(r => r.status === 200).length, 9);
assert(live.filter(r => r.url.includes('r2026w46')).every(r => r.status === 400 && r.summary.error === 'bad_rotation'));
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const summary = 'WHY no product landing: DRY, 95 subjects, zero eligible or unknown, four absorbed lanes; runner 33370 alive. November 11 private duties complete, coverage 80/80; week 47 and November 10 ticker already complete. Week-46 standings still return 400 bad_rotation on both hosts; served build 299b1db5 ends at week 44. Evidence artifacts/s3522/report.md and ledger-result.json. Next: overdue attended deployment carrying weeks 45–47 with ASSAYER SYNCED; November 12 ticker after 06:00 local and private duties after 02:10 UTC; week-48 mint November 18 00:00 UTC. Seven-item desk preserved.';
const body = summary + ' ' + tail;
fs.writeFileSync(`${dir}/lock.txt`, lock + '\n');
fs.writeFileSync(`${dir}/desk-tail.txt`, tail + '\n');
fs.writeFileSync(`${dir}/handoff-body.txt`, body + '\n');
const tested = `ACTIVE ${stamp} (s3522 fire) — ${body}`;
fs.writeFileSync('STATUS.md', tested + '\n\n- **s3522 initial lock (line-1 archive):** ' + lock + '\n' + status.slice(status.indexOf('\n')));
fs.writeFileSync(`${dir}/tested-line1.txt`, tested + '\n');
const start = json(`${dir}/start.json`);
const commits = run('git', ['log', '--reverse', '--format=%h %s', start.head + '..HEAD']);
fs.writeFileSync(`${dir}/report.md`, `# s3522 fire — dry board and current heartbeat duties

READY-FOR-GATES. WHY no product landing: the maintained dry-board probe classified 1,483 done-moves into 95 subjects: 82 merged, 13 closed or blocked, zero eligible and zero unknown. All four main..lane histories are empty. The six queues, running tasks and crafting inbox are empty; none of 118 failed entries is newer than the predecessor. Runner 33370 is alive. CODEX-WALL still forbids new fire dispatch; attended work remains in its owner's custody. No drain, refill, re-queue, new master or art landing is due.

The latest run log ends in a historical index-lock failure, but its task assayer-sync-visibility-1 is merged at b5d6d3c3248fdf0c4f61c853c040b651c650cf4f. That commit and resolution commits 4fe2becb8 and 614f84ca5 are verified main ancestors. There is no retry to perform.

Fresh public GETs at ${live[0].at} confirm current week-46 standings HTTP 400 bad_rotation on both canonical and direct Pages hosts. Week-44 controls and nonempty stats JSON return HTTP 200. Served build 299b1db5 lists weeks 37–44; main and the matching public skill fence contain eleven rotations through week 47. The absent served rotations explain the observed rejection; the reason deployment remains delayed is unverified. This is the existing attended deployment action, not a new owner decision. FIRE §3's publish gate and attended custody are preserved; no deployment was attempted. Deployment must establish ASSAYER SYNCED, full served-registry parity and current standings recovery. These GETs do not establish gameplay or replay acceptance.

November 11 LB-01/FM-01 receipts from s3521 were read: all three commands exited 0 and memory was unchanged. Current read-only freshness verifies 80/80 days from August 24 through November 11. The archive is currently PRIVATE; its live ledger-backups head is af8bbd222a496bb84a76f346b122d375b16d380c and fire-memory head is 53d87470fb2670626fb4605d4dc0eb5bffd899fb, matching today's completion. No duplicate private writes or private corpus copying. The predecessor's exposure result is historical evidence, not a fresh exposure scan.

RT-01 is discharged: week 47 opens November 16 and contains six seeds; mint bbbff3517 is a main ancestor. November 10 ticker and its historical census receipt were read: 28 updates/commits, one player-path event, busy-day control 136; that census was not rerun. Next ticker is November 12 after 06:00 local; private duties after 02:10 UTC. Week-48 mint is due Wednesday November 18 00:00 UTC. No secret salt was accessed. This fire made no player-visible merge or engine pin, so no Gazette item or gameplay/build acceptance is claimed.

Lock ownership is proven by launcher ancestry 64221 → 64269 → 64271, the fresh fire directory and the 10:59:44 local FIRE START. The actual engine is Codex. Runner 33370 has PPID 1, TTY ??, and started November 10 10:06:33 local. The main semaphore is scripts/lane-runner-v3.sh:322, ACTIVE and not lock CLEARED. The launcher retains cleanup ownership of tasks/.fire.lock. The s3521 predecessor is archived byte-for-byte, including the seven-item Owner's Desk and both DESK-NOT-OWED acknowledgements. Its closing receipt confirms 1,263 passing tests, code 0 and unchanged tree/head. Inherited dashboard and usage changes are committed; later dashboard churn remains with its live writer.

The ledger corpus was read through ledger-corpus.mjs, 19 parts. The write-docs skill guided the report. Vault and older memory notes supplied navigation and the public/private storage boundary; current conclusions use this fire's checks. Attended disk-rescue and credential observations were read without independently repeating them or accessing credential values. No product or law source changed.

Evidence in this directory: dry-board.txt, lane-usable.txt, queue-state.json, latest-run-tail.txt, latest-run-resolution.json, process-verification.json, process-verification.txt, health.txt, duties.json, live-probe.json, mirror-freshness.txt, private-heads.txt, private-visibility.json and ledger-scope.json.

Commits before closeout:

${commits.split('\n').map(x => '- ' + x).join('\n')}

Closing verification runs npm run test:ledger-guards on .nvmrc Node 26.4.0, direct CommandLineTools Git and the established evidence-local serial scheduling adapter. Assertions and timeouts remain unchanged. The manifest freezes the handoff and evidence; acceptance requires ledger-result.json code 0, unchanged true and headUnchanged true. This report does not anticipate that result. Only the STATUS lock/stamp envelope changes after acceptance. The clearing commit is the final main write, followed by origin backup; its hash is printed by closeout.mjs. If verification fails, retain ACTIVE and record the failure before exit.

## REMAINING LIST IN ORDER

1. Overdue attended deployment carrying the whole registry through week 47; require ASSAYER SYNCED, served-registry parity and week-46 standings HTTP 200 on both hosts.
2. November 12 ticker after 06:00 local and private duties after 02:10 UTC.
3. Week-48 mint Wednesday November 18 00:00 UTC, before its November 23 opening.
4. Preserve the seven owner items, including the USB drive and OpenRouter rotation. No new owner decision was created.
`);
const handover = 'docs/HANDOVER-2026-09-06-attended.md'; read(handover);
fs.appendFileSync(handover, `\n\n### s3522 verification: dry board and current heartbeat duties\n\n${stamp}. ${summary}\n\nFresh checks and inherited-claim limits: artifacts/s3522/report.md. Runner 33370 alive; launcher 64221 → 64269 → 64271. Full eleven-rotation fence, week-47 presence, dry board and absorbed lanes verified. Today's private-duty receipts read; coverage 80/80 and both private remote heads freshly verified, no duplicate private writes. CODEX-WALL, attended custody, seven-item desk and both acknowledgements preserved. November 10 ticker and prior gates read without repeating their history. Closing acceptance is artifacts/s3522/ledger-result.json; this entry does not anticipate it.\n`);
run('git', ['diff', '--check', '--', 'STATUS.md', handover]);
const now = new Date(); fs.utimesSync('tasks/.fire.lock', now, now);
console.log(summary);
