// Runs gr-sim with a given policy/tape and captures stdout+stderr to files.
// Usage: node run-sim.mjs <outPrefix> <tapePath> [--idle]
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const [outPrefix, tapePath, ...rest] = process.argv.slice(2);
const idle = rest.includes('--idle');
const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e4-dust-flats',
  '--seed', 'e4-dust-flats-01',
  '--tape', tapePath,
];
if (idle) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: '/private/tmp/heat11-b118c4d2', stdio: ['pipe', 'pipe', 'pipe'] });
const out = createWriteStream(`${outPrefix}.out`);
const err = createWriteStream(`${outPrefix}.err`);
child.stdout.pipe(out);
child.stderr.pipe(err);
if (idle) child.stdin.end();
child.on('exit', (code) => {
  console.log(`gr-sim exited ${code}`);
});
