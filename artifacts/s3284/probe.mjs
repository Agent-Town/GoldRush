import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const dir = 'artifacts/s3284';
const save = (name, value) => fs.writeFileSync(`${dir}/${name}.json`, JSON.stringify(value, null, 2));
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', timeout: 30000 }).trim();
const queues = Object.fromEntries(fs.readdirSync('tasks/queue').filter(x => fs.statSync(`tasks/queue/${x}`).isDirectory()).map(x => [x, fs.readdirSync(`tasks/queue/${x}`).filter(n => !n.startsWith('.'))]));
const previous = fs.readFileSync(`${dir}/predecessor.txt`, 'utf8').match(/Last updated: (\S+)/)[1];
const failed = fs.readdirSync('tasks/failed');
save('queue-state', { queues, running: fs.readdirSync('tasks/running'), pending: fs.readdirSync('assets/crafting-queue/pending'), failedCount: failed.length, newerFailures: failed.filter(x => fs.statSync(`tasks/failed/${x}`).mtimeMs > Date.parse(previous)) });
const branches = ['sol/open-findings-astra', 'sol/wave-lane-b', 'sol/map-art-campaign-2', 'art/portraits-e5-e10-generated'];
const registry = JSON.parse(fs.readFileSync('assets/rotations/rotation-seeds.json', 'utf8'));
const skill = fs.readFileSync('public/skill.md', 'utf8');
const fence = skill.split('skillmd-guard:rotations:start')[1].split('skillmd-guard:rotations:end')[0].match(/```json\s*([\s\S]*?)```/)[1];
save('duties', { at: new Date().toISOString(), branchLogs: Object.fromEntries(branches.map(b => [b, run('git', ['log', '--oneline', `main..${b}`])])), ancestors: Object.fromEntries(['e0c536dcc', '40dbcf2f8'].map(hash => [hash, spawnSync('git', ['merge-base', '--is-ancestor', hash, 'main']).status === 0])), wholeFenceMatches: JSON.stringify(registry) === JSON.stringify(JSON.parse(fence)), registry, tickerPresent: fs.existsSync('marketing/outbox/ticker-digest-2026-10-21.md'), nextPrivateDutiesNotBefore: '2026-10-22T02:10:00Z' });
const ancestors = [];
let pid = process.ppid;
for (let i = 0; i < 6 && pid > 1; i++) {
  ancestors.push(run('ps', ['-o', 'pid,ppid,tty,stat,lstart', '-p', String(pid)]));
  pid = Number(run('ps', ['-o', 'ppid=', '-p', String(pid)]));
}
const runnerScan = spawnSync('bash', ['-c', '. scripts/runner-processes.sh\nrunner_pids'], { encoding: 'utf8', timeout: 30000 });
save('runner-scan', { status: runnerScan.status, stdout: runnerScan.stdout, stderr: runnerScan.stderr });
const runnerPids = runnerScan.stdout.trim().split(/\s+/).filter(p => /^\d+$/.test(p));
if (!runnerPids.length) throw Error('No runner PID returned; investigate before handoff');
save('launcher', { at: new Date().toISOString(), ancestors, lockMtime: fs.statSync('tasks/.fire.lock').mtime, runner: runnerPids.map(p => run('ps', ['-o', 'pid,ppid,tty,stat,lstart', '-p', p])), fireStart: fs.readFileSync('logs/fire-20261022.log', 'utf8').split('\n').filter(l => /^\[fire-runner\].*FIRE (START|END)/.test(l)).slice(-4), mainSemaphore: { file: 'scripts/lane-runner-v3.sh', line: 322, predicate: 'ACTIVE and not lock CLEARED' } });
const urls = ['https://agenttown.app/', 'https://agenttown.app/goldrush/', 'https://agenttown.app/goldrush/version.json', 'https://agenttown.app/goldrush/skill.md', 'https://agenttown.app/api/stats', 'https://gold-rush-3in.pages.dev/api/stats', 'https://agenttown.app/api/standings?board=transfer&rotation=r2026w43', 'https://gold-rush-3in.pages.dev/api/standings?board=transfer&rotation=r2026w43', 'https://agenttown.app/api/standings?board=transfer&rotation=r2026w42'];
const result = await Promise.all(urls.map(async url => {
  const start = Date.now();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await r.text();
    const row = { url, at: new Date().toISOString(), status: r.status, type: r.headers.get('content-type'), bytes: Buffer.byteLength(body), seconds: (Date.now() - start) / 1000 };
    if (url.endsWith('/version.json')) row.version = JSON.parse(body);
    if (url.endsWith('/skill.md')) row.rotations = [...new Set(body.match(/r2026w\d+/g))];
    if (url.includes('/api/')) {
      let j; try { j = JSON.parse(body); } catch {}
      row.summary = { json: !!j, ok: j?.ok, error: j?.error };
      if (url.endsWith('/stats')) Object.assign(row.summary, { statsObject: !!j?.stats && typeof j.stats === 'object' && !Array.isArray(j.stats), empty: j?.empty ?? false });
    }
    return row;
  } catch (e) { return { url, at: new Date().toISOString(), error: String(e) }; }
}));
save('live-probe', result);
console.log(JSON.stringify(result, null, 2));
