// Idle probe runner: spawns gr-sim with --policy idle, captures stdout/stderr to files.
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const DIR = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-twin-banks-b';
const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-twin-banks',
  '--seed', 'e1-twin-banks-01',
  '--difficulty', 'trail',
  '--policy', 'idle',
  '--tape', `${DIR}/probe-idle-tape.json`,
], { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['ignore', 'pipe', 'pipe'] });

child.stdout.pipe(createWriteStream(`${DIR}/probe-idle-stdout.ndjson`));
child.stderr.pipe(createWriteStream(`${DIR}/probe-idle-stderr.txt`));
child.on('exit', (code) => {
  console.log(`gr-sim exited ${code}`);
});
