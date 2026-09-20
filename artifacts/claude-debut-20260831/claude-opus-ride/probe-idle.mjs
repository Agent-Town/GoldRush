// Idle probe: run gr-sim with --policy=idle and capture every view line to disk.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url).pathname;
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=idle'], {
  cwd: '/tmp/heat8-4675cfd7',
  stdio: ['ignore', 'pipe', 'pipe'],
});

let out = '';
let err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });
child.on('close', (code) => {
  writeFileSync(`${here}idle-views.ndjson`, out);
  writeFileSync(`${here}idle.err`, err);
  const lines = out.trim().split('\n');
  console.log('exit', code, 'lines', lines.length);
  console.log('stderr:', err.trim());
});
