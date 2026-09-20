/**
 * run-duties.mjs — s1253 duty battery. Every verdict comes from an exit code.
 * spawnSync argv arrays, because the shell gate rejects npm scripts whose BODY
 * contains `&&` (test:node-guards, build:release) and `ENV=v node` prefixes.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const OUT = 'logs/session-scratch/s1253/duty-transcript.txt';
writeFileSync(OUT, 's1253 duty battery\n\n');
function log(s) { console.log(s); appendFileSync(OUT, s + '\n'); }

const JOBS = [
  ['tsc', 'npx', ['tsc', '--noEmit']],
  ['build', 'npm', ['run', 'build']],
  ['test:node-guards', 'npm', ['run', 'test:node-guards']],
  ['test:task-guards', 'npm', ['run', 'test:task-guards']],
  ['test:citations', 'npm', ['run', 'test:citations']],
  ['test:gate-callers', 'npm', ['run', 'test:gate-callers']],
  ['test:guards (FULL)', 'npm', ['run', 'test:guards']],
];

const results = [];
for (const [label, cmd, args] of JOBS) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 1_200_000, maxBuffer: 128 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const all = (r.stdout || '') + (r.stderr || '');
  results.push([label, r.status, secs]);
  log('\n########## ' + label + '  rc=' + r.status + '  ' + secs + 's ##########');
  log(all.split('\n').slice(-30).join('\n'));
}

log('\n\n=== SUMMARY ===');
for (const [label, rc, secs] of results) log((rc === 0 ? 'PASS ' : 'FAIL ') + 'rc=' + rc + '  ' + String(secs).padStart(7) + 's  ' + label);
log('\nall green: ' + results.every((r) => r[1] === 0));
