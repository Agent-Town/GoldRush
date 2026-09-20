// First-view probe: boot e1-baron/e1-baron-01 idle, capture view 1, stop.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ROOT = '/tmp/heat8-4675cfd7';
const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01', '--policy', 'idle'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let buffer = '';
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  const newline = buffer.indexOf('\n');
  if (newline < 0) return;
  const line = buffer.slice(0, newline);
  writeFileSync(`${ROOT}/artifacts/claude-opus-baron/first-view.json`, line);
  console.log('first view bytes:', line.length);
  child.kill('SIGKILL');
  process.exit(0);
});
child.stderr.on('data', (chunk) => process.stderr.write(chunk));
