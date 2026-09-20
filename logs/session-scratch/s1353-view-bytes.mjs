#!/usr/bin/env node
// s1353 — F-1345-2's GATE: measure a real gr-sim view line's BYTE length against
// asyncio's default StreamReader limit (64 KiB), which applies because
// env/goldrush-verifiers/goldrush/__init__.py:72-83 spawns the sim with no `limit=`.
//
// Runs gr-sim in --policy=idle (needs no stdin, runs a whole contract to terminal)
// and measures every stdout line the Python side would feed to readline().
// Byte length, not character length: JSON may carry non-ASCII.
//
// Usage: node logs/session-scratch/s1353-view-bytes.mjs [contractId ...]

import { spawnSync } from 'node:child_process';

const LIMIT = 65536; // asyncio.streams._DEFAULT_LIMIT (64 KiB)
const contracts = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['e1-dry-gulch', 'e1-night-shift', 'the-claim', 'e5-deepwater-claim'];

let worstOverall = { bytes: 0, contract: null, index: null };

for (const contract of contracts) {
  const started = process.hrtime.bigint();
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract, '--policy=idle'],
    { encoding: 'buffer', maxBuffer: 512 * 1024 * 1024 },
  );
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;

  if (run.status !== 0) {
    console.log(`${contract}: rc=${run.status} — ${run.stderr?.toString().trim().slice(0, 300)}`);
    continue;
  }

  // Split on the same delimiter readline() uses, and measure the bytes of each
  // line WITHOUT the trailing \n (asyncio's limit is checked against the buffered
  // line body before the separator is found).
  const lines = run.stdout.toString('utf8').split('\n').filter((l) => l.length > 0);
  const sizes = lines.map((l) => Buffer.byteLength(l, 'utf8'));
  sizes.sort((a, b) => a - b);

  const max = sizes[sizes.length - 1];
  const min = sizes[0];
  const mean = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
  const p95 = sizes[Math.min(sizes.length - 1, Math.floor(sizes.length * 0.95))];
  const maxIndex = lines.findIndex((l) => Buffer.byteLength(l, 'utf8') === max);

  if (max > worstOverall.bytes) worstOverall = { bytes: max, contract, index: maxIndex };

  const headroom = (LIMIT / max).toFixed(1);
  console.log(
    `${contract}: lines=${lines.length} min=${min}B mean=${mean}B p95=${p95}B MAX=${max}B ` +
    `(${(max / 1024).toFixed(2)} KiB) headroom=${headroom}x  [${elapsedMs.toFixed(0)}ms]`,
  );
  console.log(`  largest line #${maxIndex}: ${lines[maxIndex].slice(0, 160)}…`);
}

console.log('');
console.log(`asyncio default limit: ${LIMIT}B (64 KiB)`);
console.log(
  `WORST observed: ${worstOverall.bytes}B (${(worstOverall.bytes / 1024).toFixed(2)} KiB) ` +
  `in ${worstOverall.contract} line #${worstOverall.index} — ` +
  `${(LIMIT / worstOverall.bytes).toFixed(1)}x under the limit ` +
  `(${((worstOverall.bytes / LIMIT) * 100).toFixed(2)}% of it)`,
);
