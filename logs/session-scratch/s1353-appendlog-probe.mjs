#!/usr/bin/env node
// s1353 — F-1345-2 GATE, part 5: the appendLog vector, measured on runs that
// ACTUALLY REACH TERMINAL. Part 4 fed 64 turns of orders and got finalWave=0 /
// appendLog=0 — the run never advanced a wave, so it measured nothing about the
// growth vector it was built to measure. The idle runs DO terminate, so they are
// the honest place to watch appendLog accumulate.

import { spawnSync } from 'node:child_process';

const LIMIT = 65536;

for (const contract of ['e1-dry-gulch', 'the-claim', 'e1-night-shift']) {
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract, '--policy=idle'],
    { encoding: 'utf8', timeout: 300_000, maxBuffer: 512 * 1024 * 1024 },
  );
  const lines = (run.stdout ?? '').split('\n').filter((l) => l.length > 0);

  const rows = [];
  for (const line of lines) {
    try {
      const v = JSON.parse(line);
      if (v?.schema !== 'goldrush.view.v1') continue;
      rows.push({
        wave: v.now?.wave ?? -1,
        log: Array.isArray(v.appendLog) ? v.appendLog.length : -1,
        logBytes: Buffer.byteLength(JSON.stringify(v.appendLog ?? [])),
        bytes: Buffer.byteLength(line, 'utf8'),
        terminal: v.now?.timers?.runSeconds,
      });
    } catch { /* outcome line */ }
  }

  const last = rows[rows.length - 1];
  const perEntry = last && last.log > 0 ? Math.round(last.logBytes / last.log) : 0;
  console.log(`${contract}: views=${rows.length} finalWave=${last?.wave} ` +
    `appendLog=${last?.log} entries / ${last?.logBytes}B (~${perEntry}B each) ` +
    `maxView=${Math.max(...rows.map((r) => r.bytes))}B`);
  console.log(`  wave/appendLog/bytes per view: ${rows.map((r) => `w${r.wave}:${r.log}:${r.bytes}`).join('  ')}`);
  if (perEntry) {
    console.log(`  → at ~${perEntry}B/wave, reaching the ${LIMIT}B limit needs ~` +
      `${Math.round((LIMIT - Math.max(...rows.map((r) => r.bytes))) / perEntry)} more waves`);
  }
}
