// s1468: gate battery on the MERGED tree (gate-s1468, detached).
// §3.1 — every playwright invocation passes --workers=1.
import { spawnSync } from 'node:child_process';

const WT = process.cwd() + '/gate-s1468';
const which = process.argv[2] || 'all';

function run(label, cmd, args, env = {}) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: WT, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 64 * 1024 * 1024,
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n===== ${label} -> rc=${r.status}  (${secs}s) =====`);
  const out = ((r.stdout || '') + '\n' + (r.stderr || '')).trim();
  console.log(out.slice(-2500));
  return r.status;
}

const results = {};
if (which === 'all' || which === 'static') {
  results.tsc = run('tsc --noEmit', 'npx', ['tsc', '--noEmit']);
  results.build = run('npm run build', 'npm', ['run', 'build']);
}
if (which === 'all' || which === 'rig') {
  // the slice's own spec: a .rig.ts, testIgnore'd unless GR_CAPTURE_RUN=1
  results.rig = run('own rig (desktop+mobile)', 'npx',
    ['playwright', 'test', 'e2e/f1467-alpha-recipe-ab.rig.ts', '--workers=1'],
    { GR_CAPTURE_RUN: '1' });
}
if (which === 'all' || which === 'guards') {
  results.guards = run('npm run test:node-guards', 'npm', ['run', 'test:node-guards']);
}
console.log('\n===== SUMMARY =====');
console.log(JSON.stringify(results, null, 2));
