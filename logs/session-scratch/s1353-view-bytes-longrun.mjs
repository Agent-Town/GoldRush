#!/usr/bin/env node
// s1353 — F-1345-2 GATE, part 4: the vector the first three harnesses MISSED.
//
// Parts 1-3 measured breadth (contracts) and agent-controlled width (orders, capped
// at 32 entries by StandingOrders.ts validateStandingOrders). But View.ts accumulates
// `cache.appendLog.push(waveEntry(...))` with NO truncation and emits the whole array
// in every view (View.ts:178) — so the view grows LINEARLY WITH WAVE COUNT, which a
// 5-turn run cannot show. The Python env allows max_turns=64.
//
// This drives a long run with the maximum legal orders payload and reports how the
// largest view scales with waves, plus bytes-per-appendLog-entry for extrapolation.

import { spawnSync } from 'node:child_process';

const LIMIT = 65536;
const TURNS = Number(process.argv[2] ?? 64);
const seam = 'S'.repeat(80);
const maxOrders = Array.from({ length: 32 }, () => ({ verb: 'HARVEST', seam }));
const input = Array.from({ length: TURNS }, () => JSON.stringify(maxOrders)).join('\n') + '\n';

for (const contract of ['e1-dry-gulch', 'the-claim', 'e1-night-shift']) {
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract, '--seed', 'bench-001'],
    { encoding: 'utf8', input, timeout: 300_000, maxBuffer: 512 * 1024 * 1024 },
  );

  const lines = (run.stdout ?? '').split('\n').filter((l) => l.length > 0);
  if (!lines.length) {
    console.log(`${contract}: no stdout — ${(run.stderr ?? '').trim().slice(0, 200)}`);
    continue;
  }
  const sizes = lines.map((l) => Buffer.byteLength(l, 'utf8'));
  const max = Math.max(...sizes);

  // Find the deepest appendLog actually reached, and what one entry costs.
  let deepest = 0;
  let entryBytes = 0;
  let finalWave = 0;
  for (const line of lines) {
    try {
      const v = JSON.parse(line);
      const log = v?.appendLog;
      if (Array.isArray(log) && log.length >= deepest) {
        deepest = log.length;
        if (log.length) entryBytes = Math.round(Buffer.byteLength(JSON.stringify(log)) / log.length);
        finalWave = v?.now?.wave ?? finalWave;
      }
    } catch { /* outcome line */ }
  }

  const perWave = entryBytes || 0;
  const wavesToLimit = perWave ? Math.round((LIMIT - max) / perWave) + deepest : Infinity;
  console.log(
    `${contract}: turnsFed=${TURNS} views=${lines.length} finalWave=${finalWave} ` +
    `appendLog=${deepest} entries (~${perWave}B each) MAX=${max}B (${(max / 1024).toFixed(2)} KiB, ` +
    `${((max / LIMIT) * 100).toFixed(1)}% of limit) → would need ~${wavesToLimit} waves to reach 64 KiB`,
  );
}
