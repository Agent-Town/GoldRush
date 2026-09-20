// s1662 gate battery, phase 1: deterministic checks in the detached worktree.
// niced, serial — lane-a is mid flake-rate measurement (owner throttled it to
// --workers=3 nice -n 19); this must not inflate the numbers it is pinning.
import { execFileSync } from 'node:child_process';
const cwd = '/Users/robin/Claude/Projects/Gold Rush/gate-s1662b';
const steps = [
  ['tsc --noEmit', 'nice', ['-n', '19', 'npx', 'tsc', '--noEmit']],
  ['null-floor-anchors (EXPECTED RED pre-fix)', 'nice', ['-n', '19', 'node', '--test', 'scripts/null-floor-anchors.test.mjs']],
  ['door-admission-ratchet (new guard)', 'nice', ['-n', '19', 'node', '--test', 'scripts/door-admission-ratchet.test.mjs']],
  ['skillmd-guard', 'nice', ['-n', '19', 'node', '--test', 'scripts/skillmd-guard.test.mjs']],
];
for (const [label, cmd, args] of steps) {
  const t0 = Date.now();
  let rc = 0, out = '';
  try {
    out = execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 900000 });
  } catch (e) {
    rc = e.status ?? 'ERR';
    out = (e.stdout || '') + (e.stderr || '');
  }
  const tail = out.split('\n').filter((l) => /^# (tests|pass|fail|skip|cancelled)|error TS|not ok|Error:|floors must equal/.test(l)).slice(0, 14).join('\n');
  console.log(`\n=== ${label} === rc=${rc}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(tail || out.split('\n').slice(-8).join('\n'));
}
