import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [contract, seed, tape] = process.argv.slice(2);
if (!contract || !seed || !tape) throw new Error('usage: rider-driver.mjs contract seed tape');

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tape], {
  cwd: '/tmp/heat2-b42c0fbc',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const out = createInterface({ input: child.stdout });
out.on('line', (line) => process.stdout.write(`${line}\n`));
child.stderr.on('data', (chunk) => process.stderr.write(chunk));

const input = createInterface({ input: process.stdin });
input.on('line', (line) => child.stdin.write(`${line}\n`));
input.on('close', () => child.stdin.end());
child.on('close', (code, signal) => {
  process.stderr.write(`driver child closed code=${code ?? 'null'} signal=${signal ?? 'null'}\n`);
  process.exitCode = code ?? 1;
});
