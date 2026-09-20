// Probe: read the first view from gr-sim, dump it, kill the child. Not a real attempt.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e1-night-shift', '--seed', 'e1-night-shift-01'], {
  cwd: '/private/tmp/heat8-4675cfd7',
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buf = '';
child.stdout.on('data', (d) => {
  buf += d.toString();
  const idx = buf.indexOf('\n');
  if (idx >= 0) {
    const line = buf.slice(0, idx);
    writeFileSync('/private/tmp/heat8-4675cfd7/artifacts/claude-fable-nightshift/first-view.json', line);
    console.log('VIEW CAPTURED', line.length, 'bytes');
    child.kill('SIGKILL');
    process.exit(0);
  }
});
child.stderr.on('data', (d) => process.stderr.write(d));
setTimeout(() => { console.error('probe timeout'); child.kill('SIGKILL'); process.exit(1); }, 60000);
