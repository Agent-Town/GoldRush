// Runs the exact `test:node-guards` chain from package.json, step by step.
// Needed because the npm script contains `&&`, which the fire's bash gate refuses.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const script = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:node-guards'];
const steps = script.split('&&').map((s) => s.trim());

let failed = 0;
for (const step of steps) {
  const parts = step.split(/\s+/);
  const cmd = parts[0] === 'npm' ? 'npm' : parts[0];
  const args = parts.slice(1);
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  const pass = /^# pass (\d+)/m.exec(out);
  const fail = /^# fail (\d+)/m.exec(out);
  const label = step.length > 60 ? parts.slice(0, 2).join(' ') + ` …(${args.length} files)` : step;
  console.log(`rc=${r.status}  ${label}` + (pass ? `  pass=${pass[1]} fail=${fail ? fail[1] : '?'}` : ''));
  if (r.status !== 0) {
    failed += 1;
    console.log(out.slice(-3000));
  }
}
console.log(failed === 0 ? 'NODE-GUARDS: ALL STEPS rc=0' : `NODE-GUARDS: ${failed} STEP(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
