import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/Users/robin/Claude/Projects/Gold Rush';
const pkg = JSON.parse(fs.readFileSync(R + '/package.json', 'utf8'));
const script = pkg.scripts['test:ledger-guards'];

// Split the npm script into its && -chained steps, resolving nested `npm run X` to its own script.
const resolve = (s, depth = 0) => {
  const out = [];
  for (const part of s.split('&&').map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^npm run ([\w:-]+)$/);
    if (m && depth < 3 && pkg.scripts[m[1]]) out.push(...resolve(pkg.scripts[m[1]], depth + 1));
    else out.push(part);
  }
  return out;
};

const steps = resolve(script);
console.log('resolved', steps.length, 'steps from test:ledger-guards\n');

let failed = 0;
for (const [i, step] of steps.entries()) {
  const argv = step.split(/\s+/);
  const cmd = argv[0];
  const args = argv.slice(1);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { cwd: R, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const ok = r.status === 0;
  if (!ok) failed++;
  const label = ok ? 'PASS' : 'FAIL rc=' + r.status;
  console.log(`[${i + 1}/${steps.length}] ${label} ${secs}s  ${step.slice(0, 100)}`);
  if (!ok) {
    const out = ((r.stdout || '') + '\n' + (r.stderr || '')).trim().split('\n');
    console.log('   ----- tail -----');
    for (const l of out.slice(-25)) console.log('   ' + l);
    console.log('   ----------------');
  }
}
console.log('\n=== test:ledger-guards: ' + (failed ? failed + ' STEP(S) FAILED' : 'ALL ' + steps.length + ' STEPS PASS') + ' ===');
process.exit(failed ? 1 : 0);
