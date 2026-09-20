// Idle probe runner: captures gr-sim stdout/stderr to files (no shell redirects).
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e2-pressure-garden';
const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e2-pressure-garden',
  '--seed', 'e2-pressure-garden-01',
  '--policy', 'idle',
  '--tape', `${WS}/probe-idle-tape.json`,
], { cwd: '/private/tmp/heat11-5e7a7c0b' });

let out = '';
let err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });
child.on('close', (code) => {
  writeFileSync(`${WS}/probe-idle.ndjson`, out);
  writeFileSync(`${WS}/probe-idle.stderr.txt`, err);
  const lines = out.trim().split('\n');
  console.log('exit', code, 'stdoutLines', lines.length);
  console.log('LAST LINE:', lines[lines.length - 1]);
});
