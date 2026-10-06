import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { backlogFiles, backlogRows } from '../../scripts/ledger-corpus.mjs';

const prefix = 'artifacts/s2947/';
const run = (bin, args) => execFileSync(bin, args, { encoding: 'utf8', maxBuffer: 32e6 }).trim();
const save = (name, value) => fs.writeFileSync(prefix + name, typeof value === 'string' ? value + '\n' : JSON.stringify(value, null, 2) + '\n');
const files = dir => fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => !n.startsWith('.')) : [];
const direct = {};
for (const lane of ['a', 'b', 'c', 'd']) {
  const cwd = `worktrees/lane-${lane}`;
  const branch = run('git', ['-C', cwd, 'branch', '--show-current']);
  direct[cwd] = { branch, ahead: run('git', ['log', `main..${branch}`, '--oneline']), dirty: run('git', ['-C', cwd, 'status', '--short', '--untracked-files=no']) };
}
const byMtime = dir => files(dir).map(name => ({ path: `${dir}/${name}`, mtime: fs.statSync(`${dir}/${name}`).mtime.toISOString() })).sort((a, b) => b.mtime.localeCompare(a.mtime));
const triage = {
  observedAt: new Date().toISOString(), direct,
  queues: Object.fromEntries(['main', 'lane-a', 'lane-b', 'lane-c', 'lane-d', 'art'].map(slot => [slot, files(`tasks/queue/${slot}`)])),
  running: files('tasks/running'), orders: files('assets/crafting-queue/pending'),
  failures: byMtime('tasks/failed').slice(0, 3),
  runs: byMtime('tasks/runs').filter(r => r.path.endsWith('.log')).slice(0, 2),
};
save('triage.json', triage);
for (const r of triage.runs) save(r.path.split('/').at(-1) + '-tail.txt', fs.readFileSync(r.path, 'utf8').split('\n').slice(-38).join('\n'));
const proof = {};
for (const hash of ['a5aad2abf', '73b82dbfe', '9a216a07d', '40dbcf2f8']) {
  const result = spawnSync('git', ['merge-base', '--is-ancestor', hash, 'main']);
  if (result.status !== 0) throw Error(`${hash} is not a verified ancestor`);
  proof[hash] = 'ancestor';
}
save('git-proof.json', proof);
save('main-dirt.json', { tracked: run('git', ['status', '--short', '--untracked-files=no']), diffStat: run('git', ['diff', '--stat']) });
const rows = backlogRows();
const selected = rows.filter(r => /LB-01 \+ FM-01 OCTOBER 6 COMPLETE|TK-01 OCTOBER 5 COMPLETE|F-2472-3|F-2742-1|^🔺 \*\*F-2299-1|^🔺 \*\*F-2642-3/.test(r.line));
save('ledger-selection.json', { corpus: backlogFiles(), selected });
console.log(JSON.stringify({ triage, proof, corpusFiles: backlogFiles().length, selectedRows: selected.map(r => ({ at: `${r.rel}:${r.n}`, text: r.line.slice(0, 1700) })) }, null, 2));
let pid = process.pid;
let processes = '';
for (let n = 0; n < 7 && pid > 1; n++) {
  const row = run('ps', ['-o', 'pid,ppid,tty,stat,lstart,comm', '-p', String(pid)]);
  processes += row + '\n';
  const data = row.split('\n')[1];
  if (!data) break;
  pid = Number(data.trim().split(/\s+/)[1]);
}
processes += run('ps', ['-o', 'pid,ppid,tty,stat,lstart', '-p', '31360']) + '\n';
processes += 'semaphore ' + fs.statSync('tasks/.fire.lock').mtime.toISOString() + '\n';
processes += fs.readFileSync('logs/fire-20261007.log', 'utf8').split('\n').filter(l => /^\[fire-runner\].*FIRE (START|END)/.test(l)).slice(-4).join('\n');
save('processes.txt', processes);
console.log(processes);
