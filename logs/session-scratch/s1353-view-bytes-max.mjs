#!/usr/bin/env node
// s1353 — F-1345-2 GATE, part 3: the LEGAL MAXIMUM view.
// StandingOrders.ts validateStandingOrders caps orders at 32 entries; validateOrder
// then bounds every entry by `exactKeys` + closed enums + numeric ranges, leaving
// exactly ONE unbounded-ish field in the whole schema: HARVEST's `seam` string,
// capped at 80 chars. So the largest legal orders payload is 32 x an 80-char seam.
// Anything bigger is rejected by the contract, which is the real bound.

import { spawnSync } from 'node:child_process';

const LIMIT = 65536;
const seam = 'S'.repeat(80);
const maxOrders = Array.from({ length: 32 }, () => ({ verb: 'HARVEST', seam }));
const input = Array.from({ length: 5 }, () => JSON.stringify(maxOrders)).join('\n') + '\n';

const run = spawnSync(
  process.execPath,
  ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
  { encoding: 'utf8', input, timeout: 120_000, maxBuffer: 512 * 1024 * 1024 },
);

const rejects = (run.stderr ?? '').split('\n').filter((l) => l.includes('rejected orders'));
console.log(`max legal orders payload: ${Buffer.byteLength(JSON.stringify(maxOrders))}B/turn (32 x 80-char seam)`);
console.log(`rc=${run.status}${rejects.length ? `  REJECTED(${rejects.length}): ${rejects[0].slice(0, 200)}` : '  accepted'}`);

const lines = (run.stdout ?? '').split('\n').filter((l) => l.length > 0);
const sizes = lines.map((l) => Buffer.byteLength(l, 'utf8'));
const max = Math.max(...sizes);
console.log(`lines=${lines.length} MAX=${max}B (${(max / 1024).toFixed(2)} KiB) — ` +
  `${(LIMIT / max).toFixed(1)}x under the ${LIMIT}B limit (${((max / LIMIT) * 100).toFixed(2)}% of it)`);

// Where do the bytes live? Count how many times the orders array is echoed.
try {
  const view = JSON.parse(lines[sizes.indexOf(max)]);
  const nowLen = JSON.stringify(view?.now?.orders ?? []).length;
  const prefixLen = JSON.stringify(view?.stablePrefix?.orders ?? []).length;
  console.log(`orders echoed in now.orders=${nowLen}B and stablePrefix.orders=${prefixLen}B ` +
    `(total ${nowLen + prefixLen}B = ${(((nowLen + prefixLen) / max) * 100).toFixed(1)}% of the largest view)`);
} catch { /* largest line may be the outcome line */ }
