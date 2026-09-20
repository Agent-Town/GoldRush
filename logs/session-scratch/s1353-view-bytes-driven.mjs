#!/usr/bin/env node
// s1353 — F-1345-2 GATE, part 2: the idle harness measures a view with NOTHING placed.
// This one drives gr-sim with real standing orders to exercise the only agent-controlled
// growth vector in the view: `now.orders`, which View.ts:267 echoes straight back.
// (Buildings themselves do NOT grow the view — View.ts:382-395 collapses them into a
// `byKind` COUNT record keyed by buildable kind, so placing 500 palisades adds ~0 bytes.)
//
// Usage: node logs/session-scratch/s1353-view-bytes-driven.mjs [ordersPerTurn]

import { spawnSync } from 'node:child_process';

const LIMIT = 65536;
const N = Number(process.argv[2] ?? 200);

// A contract-valid BUILD order, repeated at distinct positions. If the contract
// rejects the payload, that rejection is itself the bound we are looking for.
const bulk = Array.from({ length: N }, (_, i) => ({
  verb: 'BUILD',
  what: 'palisade',
  where: { x: (i % 40) - 20, z: Math.floor(i / 40) - 10 },
  when: { goldGte: 10 },
}));

const turns = [bulk, bulk, bulk, bulk, bulk];
const input = turns.map((t) => JSON.stringify(t)).join('\n') + '\n';

const run = spawnSync(
  process.execPath,
  ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
  { encoding: 'utf8', input, timeout: 120_000, maxBuffer: 512 * 1024 * 1024 },
);

console.log(`orders/turn submitted: ${N}  (payload ${Buffer.byteLength(JSON.stringify(bulk))}B per turn)`);
console.log(`rc=${run.status}`);

const rejects = (run.stderr ?? '').split('\n').filter((l) => l.includes('rejected orders'));
if (rejects.length) console.log(`REJECTED by the contract (${rejects.length}): ${rejects[0].slice(0, 220)}`);

const lines = (run.stdout ?? '').split('\n').filter((l) => l.length > 0);
if (!lines.length) {
  console.log(`no stdout lines; stderr: ${(run.stderr ?? '').trim().slice(0, 400)}`);
  process.exit(0);
}

const sizes = lines.map((l) => Buffer.byteLength(l, 'utf8'));
const max = Math.max(...sizes);
const maxIndex = sizes.indexOf(max);
console.log(`lines=${lines.length} MAX=${max}B (${(max / 1024).toFixed(2)} KiB) — ` +
  `${(LIMIT / max).toFixed(1)}x under the ${LIMIT}B limit (${((max / LIMIT) * 100).toFixed(2)}% of it)`);

// How many orders actually survived into the echoed view? That is the real bound.
try {
  const view = JSON.parse(lines[maxIndex]);
  const echoed = Array.isArray(view?.now?.orders) ? view.now.orders.length : 'n/a';
  console.log(`echoed now.orders length in the largest view: ${echoed} (submitted ${N})`);
} catch {
  console.log('largest line is not a view (likely the outcome line)');
}
