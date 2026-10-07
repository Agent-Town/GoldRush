import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';

const prefix = 'artifacts/s2953/';
const command = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
const started = Date.now();
fs.writeFileSync(prefix + 'ledger-command.txt', 'npm run test:ledger-guards\n\n' + command + '\n');
fs.writeFileSync(prefix + 'ledger-start.json', JSON.stringify({
  startedAt: new Date(started).toISOString(), node: process.version,
  executable: process.execPath, load: os.loadavg(),
  adaptation: 'Canonical Node PATH only; original npm command, scheduling, membership, assertions and deadlines.'
}, null, 2) + '\n');
const fd = fs.openSync(prefix + 'ledger-guards.txt', 'w');
const child = spawn('npm', ['run', 'test:ledger-guards'], {
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
