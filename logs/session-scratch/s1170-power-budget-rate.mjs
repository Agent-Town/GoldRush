/**
 * s1170-power-budget-rate.mjs — re-derive F-1160-2's defect on TODAY's tree.
 *
 * WHY: BACKLOG:193 carries two prior measurements (s1160 n=20 -> 4 over cap;
 * s1161 n=12 -> 1 over cap) taken at different hours, and s1161's own finding is
 * that THE RATE IS LOAD-DEPENDENT. So neither is usable as a before-arm for a fix
 * measured later. This re-derives the rate on the current tree + current box
 * before any master is authored against it.
 *
 * Instrument: spawn the REAL guard as a fresh subprocess, exactly as
 * run-guards.mjs does (npm run --silent test:power-budget). Node startup and a
 * cold JIT are part of what the battery measures, so an in-process loop would be
 * a different instrument measuring a different thing.
 */
import { spawnSync } from 'node:child_process';

const N = Number(process.argv[2] ?? 20);
const rows = [];

for (let i = 0; i < N; i += 1) {
  const started = Date.now();
  const run = spawnSync('npm', ['run', '--silent', 'test:power-budget'], {
    encoding: 'utf8',
    timeout: 5 * 60 * 1000,
  });
  const ms = Date.now() - started;
  const text = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  // PASS prints "p95=0.416ms"; FAIL throws "...p95 0.631ms exceeded 0.500ms".
  const m = text.match(/p95[= ]([0-9.]+)ms/);
  const p95 = m ? Number(m[1]) : null;
  const rc = run.status === null ? `signal:${run.signal ?? 'unknown'}` : run.status;
  rows.push({ i, rc, p95, ms });
  console.log(`run ${String(i + 1).padStart(2)}  rc=${rc}  p95=${p95 ?? 'PARSE-FAIL'}  wall=${ms}ms`);
}

const parsed = rows.filter((r) => typeof r.p95 === 'number').map((r) => r.p95);
parsed.sort((a, b) => a - b);
const over = rows.filter((r) => r.rc !== 0).length;
const median = parsed.length ? parsed[Math.floor(parsed.length / 2)] : NaN;

console.log('---');
console.log(`n=${N}  OVER CAP (rc!=0): ${over}/${N}  (${((over / N) * 100).toFixed(0)}%)`);
console.log(`p95 body: min=${parsed[0]} median=${median} max=${parsed[parsed.length - 1]}`);
console.log(`sorted: ${parsed.join(' ')}`);
