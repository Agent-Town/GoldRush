import fs from 'node:fs';
import { spawn } from 'node:child_process';

const dir = new URL('./', import.meta.url);
const base = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
if (!base.startsWith('node --test ')) throw new Error('Unexpected ledger command');
const command = base.replace(/^node --test /, 'node --test --test-concurrency=4 ');
fs.writeFileSync(new URL('ledger-command.txt', dir), command + '\n');
const start = new Date();
fs.writeFileSync(new URL('ledger-start.json', dir), JSON.stringify({
  start: start.toISOString(), node: process.version, executable: process.execPath, concurrency: 4,
}, null, 2) + '\n');
const output = fs.openSync(new URL('ledger-guards.txt', dir), 'a');
const child = spawn('bash', ['-c', command], {
  env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
  stdio: ['ignore', output, output],
});
child.on('error', (error) => { throw error; });
child.on('exit', (code, signal) => {
  fs.closeSync(output);
  const end = new Date();
  const result = { start: start.toISOString(), end: end.toISOString(), code, signal,
    seconds: (end - start) / 1000, node: process.version, concurrency: 4 };
  fs.writeFileSync(new URL('ledger-result.json', dir), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  process.exitCode = code ?? 1;
});
