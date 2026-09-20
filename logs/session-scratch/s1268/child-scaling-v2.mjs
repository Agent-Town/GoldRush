// s1268 — THE SHARED INSTRUMENT. Both the fire arm and the lane arm run THIS file, unmodified,
// so the two readings are the same measurement and not two models of one.
//
// Question: how much parallel CPU throughput can this shell's SPAWNED CHILD PROCESSES obtain?
// s1265 answered a neighbouring question with node worker THREADS inside one process (5.04x) and
// closed a candidate that binds on child processes — which is what six chromium instances are.
//
// Usage:  node logs/session-scratch/s1268/child-scaling-v2.mjs <tag> [reps]
//   <tag>  goes in the output filename: logs/session-scratch/s1268/child-scaling-<tag>.json
//          Use 'lane' in the lane worktree. NEVER overwrite another shell's file.
//   [reps] repetitions of the whole sweep, default 3. n=1 is never a decision (F-1265-2).
//
// Writes ONE new json file and edits nothing else.
import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });

const TAG = process.argv[2] || 'fire';
const REPS = Number(process.argv[3] || 3);
const STEPS = [1, 2, 3, 6, 8];

// identical fixed CPU work in a fresh process: no I/O, no allocation churn
const WORK = "let x=0;for(let i=0;i<9e8;i++){x+=Math.sqrt(i%1000);}process.stdout.write(String(x));";

function runN(n) {
  return new Promise((resolve) => {
    const t0 = process.hrtime.bigint();
    let done = 0;
    for (let i = 0; i < n; i++) {
      const c = spawn(process.execPath, ['-e', WORK], { stdio: 'ignore' });
      c.on('exit', () => { if (++done === n) resolve(Number(process.hrtime.bigint() - t0) / 1e9); });
    }
  });
}

// one instantaneous CPU reading DURING the widest arm: `top -l 2` (the second sample is the true
// one; ps %CPU is a lifetime average and has misled this question before)
function sampleDuringWidest() {
  return new Promise((resolve) => {
    const t0 = process.hrtime.bigint();
    let done = 0;
    const n = 8;
    let sample = null;
    for (let i = 0; i < n; i++) {
      const c = spawn(process.execPath, ['-e', WORK], { stdio: 'ignore' });
      c.on('exit', () => {
        if (++done === n) resolve({ wall: Number(process.hrtime.bigint() - t0) / 1e9, sample });
      });
    }
    setTimeout(() => {
      const t = spawnSync('top', ['-l', '2', '-n', '12', '-o', 'cpu', '-stats', 'pid,command,cpu'], { encoding: 'utf8' }).stdout || '';
      const half = t.slice(t.indexOf('Processes', t.indexOf('Processes') + 1));
      const idle = (half.match(/CPU usage:.*?([\d.]+)% idle/) || [])[1];
      const childCpu = half.split('\n').filter((l) => /\bnode\b/.test(l)).map((l) => l.trim().split(/\s+/).pop()).slice(0, 8);
      sample = { idlePercent: idle ? Number(idle) : null, childCpuPercents: childCpu, topRaw: half.split('\n').slice(0, 20).join('\n') };
    }, 3500);
  });
}

const out = { tag: TAG, node: process.version, cores: os.cpus().length, cpuModel: os.cpus()[0]?.model, reps: [] };
for (let rep = 1; rep <= REPS; rep++) {
  const row = { rep, loadavgBefore: os.loadavg().map((x) => +x.toFixed(2)), steps: {} };
  for (const n of STEPS) row.steps[n] = +(await runN(n)).toFixed(2);
  const base = row.steps[1];
  row.throughput = Object.fromEntries(STEPS.map((n) => [n, +((n * base) / row.steps[n]).toFixed(2)]));
  out.reps.push(row);
  console.log(`rep ${rep}: ` + STEPS.map((n) => `${n}ch=${row.steps[n]}s(${row.throughput[n]}x)`).join(' '));
  writeFileSync(`${OUT}/child-scaling-${TAG}.json`, JSON.stringify(out, null, 2));
}

const widest = await sampleDuringWidest();
out.widestArmObservation = widest;
writeFileSync(`${OUT}/child-scaling-${TAG}.json`, JSON.stringify(out, null, 2));

const best = Math.max(...out.reps.map((r) => r.throughput[8]));
console.log(`\nBEST 8-child throughput: ${best}x on ${out.cores} cores`);
console.log(`idle during 8-child arm: ${widest.sample?.idlePercent ?? 'n/a'}%  child %CPU: ${JSON.stringify(widest.sample?.childCpuPercents ?? [])}`);
console.log(`written: ${OUT}/child-scaling-${TAG}.json`);
