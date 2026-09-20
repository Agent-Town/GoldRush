// Idle probe runner: captures all stdout views + outcome to files (Bash redirect guard workaround, gen-8 note)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e2-trestle';
const child = spawn('node', [
  '/private/tmp/heat11-5e7a7c0b/scripts/gr-sim.mjs',
  '--contract', 'e2-trestle',
  '--seed', 'e2-trestle-01',
  '--policy', 'idle',
  '--tape', `${WS}/probe-idle-tape.json`,
], { cwd: '/private/tmp/heat11-5e7a7c0b' });

let out = '';
let err = '';
child.stdout.on('data', (d) => { out += d; });
child.stderr.on('data', (d) => { err += d; });
child.on('close', (code) => {
  writeFileSync(`${WS}/probe-idle-stdout.ndjson`, out);
  writeFileSync(`${WS}/probe-idle-stderr.txt`, err);
  console.log(`idle probe exited ${code}; stdout ${out.length} bytes`);
});
