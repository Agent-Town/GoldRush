import fs from 'node:fs';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';

const prefix = 'artifacts/s2954/foreground/';
const original = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
if (!original.startsWith('node --test ')) throw new Error('Unexpected ledger command shape');
const heavy = 'scripts/gazette-scan-space-guard.test.mjs';
if (original.split(heavy).length !== 2) throw Error('Expected exactly one Gazette test');
const shim = 'server/codex-shim/serve.test.mjs';
if (original.split(shim).length !== 2) throw Error('Expected exactly one shim test');
const rest = original.replace(' ' + heavy, '').replace(' ' + shim, '').replace(/^node --test /, 'node --test --test-concurrency=4 ');
const command = 'node --test --test-concurrency=1 --test-timeout=300000 ' + shim + ' && node --test --test-concurrency=1 --test-timeout=300000 ' + heavy + ' && ' + rest;
fs.writeFileSync(prefix + 'ledger-command.txt', command + '\n');
const scheduling = spawnSync('/usr/sbin/taskpolicy', ['-B', '-p', String(process.pid)], { encoding: 'utf8' });
fs.writeFileSync(prefix + 'scheduling.json', JSON.stringify({pid: process.pid, status: scheduling.status, stdout: scheduling.stdout, stderr: scheduling.stderr, policy: 'Own process foreground; child default process and Darwin background disk I/O policies. No machine-wide settings.'}, null, 2) + '\n');
if (scheduling.status !== 0) throw new Error('Cannot apply changed scheduling premise');
const started = Date.now();
fs.writeFileSync(prefix + 'ledger-start.json', JSON.stringify({
  startedAt: new Date(started).toISOString(), node: process.version,
  executable: process.execPath, load: os.loadavg(),
  adaptation: 'Own process foreground/default I/O scheduling; shim fixture and Gazette scan each run alone, then all other top-level files at concurrency four. Same complete test set, assertions, timeouts and chained checks.'
}, null, 2) + '\n');
const fd = fs.openSync(prefix + 'ledger-guards.txt', 'w');
const child = spawn('/usr/sbin/taskpolicy', ['-d', 'default', '-g', 'default', 'bash', '-c', command], {
  env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH },
  stdio: ['ignore', fd, fd]
});
console.log(`Ledger PID ${child.pid}; Node ${process.version}; transcript ${prefix}ledger-guards.txt`);
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('close', (code, signal) => {
  fs.closeSync(fd);
  const receipt = { finishedAt: new Date().toISOString(), code, signal, seconds: (Date.now() - started) / 1000 };
  fs.writeFileSync(prefix + 'ledger-result.json', JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt));
  process.exitCode = code ?? 1;
});
