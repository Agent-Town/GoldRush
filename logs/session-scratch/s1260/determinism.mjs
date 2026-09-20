#!/usr/bin/env node
// s1260 — re-derive the gr-sim determinism gate ON MERGED MAIN (never inherit the lane's number).
// The master's scope 4 IS this gate: same contract+seed+orders twice -> byte-identical outcome + event hash.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const ORDERS = 'artifacts/gr-sim/ap-07/bench-001-orders.jsonl';
const stdin = readFileSync(ORDERS);

function run(label) {
  const t0 = process.hrtime.bigint();
  const r = spawnSync('node', ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'], {
    input: stdin,
    maxBuffer: 1 << 28,
  });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const out = r.stdout;
  writeFileSync(`logs/session-scratch/s1260/${label}.jsonl`, out);
  if (r.status !== 0) console.log(`  ${label} rc=${r.status} STDERR: ${r.stderr.toString().slice(0, 800)}`);
  const lines = out.toString().trim().split('\n').filter(Boolean);
  return {
    label,
    rc: r.status,
    bytes: out.length,
    lines: lines.length,
    sha: createHash('sha256').update(out).digest('hex'),
    outcome: lines[lines.length - 1],
    wallMs: Math.round(ms),
  };
}

const a = run('runA');
const b = run('runB');
for (const r of [a, b]) console.log(`${r.label}: rc=${r.rc} lines=${r.lines} bytes=${r.bytes} wall=${r.wallMs}ms\n  sha256=${r.sha}`);
console.log(`\nBYTE-IDENTICAL: ${a.sha === b.sha ? 'YES' : 'NO'}`);
console.log(`outcome A: ${a.outcome}`);
console.log(`outcome B: ${b.outcome}`);
console.log(`\nlane-reported sha256: 63f42fac6a07b14666d885627dd37508bd30eab6babb68477e829943314129f5`);
console.log(`matches lane report : ${a.sha === '63f42fac6a07b14666d885627dd37508bd30eab6babb68477e829943314129f5'}`);
