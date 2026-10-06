import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';

const prefix = 'artifacts/s2940/';
const original = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
if (!original.startsWith('node --test ')) throw new Error('Unexpected ledger command shape');
const command = original.replace(/^node --test /, 'node --test --test-concurrency=4 ');
fs.writeFileSync(prefix + 'ledger-command.txt', command + '\n');
const started = Date.now();
fs.writeFileSync(prefix + 'ledger-start.json', JSON.stringify({
  startedAt: new Date(started).toISOString(), node: process.version,
  executable: process.execPath, load: os.loadavg(),
  adaptation: 'Only four concurrent top-level Node test files; assertions, timeouts and chained checks unchanged.'
}, null, 2) + '\n');
const fd = fs.openSync(prefix + 'ledger-guards.txt', 'w');
const child = spawn('bash', ['-c', command], {
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
