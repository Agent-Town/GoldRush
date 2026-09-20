// s1268 — the control s1265 needed and did not have.
//
// s1265 "REFUTED a CPU/QoS scheduling cap" by measuring node WORKER-THREAD arithmetic inside one
// already-running process (5.04x at 6 threads). A policy that binds on SPAWNED CHILD PROCESSES —
// which is what six chromium instances are — is invisible to that workload. s1267 therefore
// reopened scheduling policy as OPEN, not refuted.
//
// This probe spawns N genuinely separate child PROCESSES from the fire shell, each doing the same
// fixed CPU-bound work, and reports wall time vs N. Linear-ish scaling refutes a process-level
// scheduling cap with an instrument that can actually see one.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });

// fixed CPU work: ~1.5s of float math in a fresh process, no I/O, no allocation churn
const WORK = "let x=0;for(let i=0;i<9e8;i++){x+=Math.sqrt(i%1000);}process.stdout.write(String(x));";

function runN(n) {
  return new Promise((resolve) => {
    const t0 = process.hrtime.bigint();
    let done = 0;
    for (let i = 0; i < n; i++) {
      const c = spawn(process.execPath, ['-e', WORK], { stdio: 'ignore' });
      c.on('exit', () => {
        done += 1;
        if (done === n) resolve(Number(process.hrtime.bigint() - t0) / 1e9);
      });
    }
  });
}

const results = [];
for (const n of [1, 2, 3, 6, 8]) {
  const load = os.loadavg()[0].toFixed(2);
  const wall = await runN(n);
  results.push({ children: n, wallSeconds: +wall.toFixed(2), loadavgBefore: +load });
  console.log(`children=${n}: wall=${wall.toFixed(2)}s (loadavg before ${load})`);
}
const base = results[0].wallSeconds;
for (const r of results) {
  r.throughputVsOne = +((r.children * base) / r.wallSeconds).toFixed(2); // x speedup vs serial
}
writeFileSync(`${OUT}/child-scaling.json`, JSON.stringify({ cores: os.cpus().length, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
