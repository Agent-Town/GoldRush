/**
 * s1170-degraded-arm.mjs — does `taskpolicy -b` STILL reproduce the degraded mode?
 *
 * WHY: my n=20 default-QoS arm returned 0/20 over cap, so the gate BACKLOG:193
 * states ("over-cap count 4/20 -> 0/20") cannot be run -- the before-arm is
 * already 0/20. Any authorable fix therefore needs a DETERMINISTIC degradation
 * to gate against instead of an ~8% flake. s1161 measured `taskpolicy -b` at
 * 12/12 over cap (1.628-1.846 ms). If that still holds today it is a usable
 * gate mechanism; if it does not, the remedy has no provable gate at all and the
 * honest act is to flag rather than author.
 */
import { spawnSync } from 'node:child_process';

const GUARD = ['--experimental-strip-types', 'scripts/check-power-graph-budget.mjs'];
const CAP = 0.5;
const N = Number(process.argv[2] ?? 6);
const vals = [];

for (let i = 0; i < N; i += 1) {
  const r = spawnSync('taskpolicy', ['-b', process.execPath, ...GUARD], { encoding: 'utf8' });
  const text = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const m = text.match(/p95[= ]([0-9.]+)ms/);
  const p95 = m ? Number(m[1]) : null;
  if (p95 === null) {
    console.log(`E[${i}] PARSE-FAIL rc=${r.status} ${text.slice(0, 200)}`);
    continue;
  }
  vals.push(p95);
  console.log(`E[${i}] p95=${p95.toFixed(3)} rc=${r.status} ${p95 > CAP ? 'OVER' : 'ok'}`);
}

const sorted = vals.slice().sort((a, b) => a - b);
const over = sorted.filter((x) => x > CAP).length;
console.log('---');
console.log(`degraded arm: n=${sorted.length} OVER-CAP ${over}/${sorted.length}`);
console.log(`min=${sorted[0]} med=${sorted[Math.floor(sorted.length / 2)]} max=${sorted[sorted.length - 1]}`);
