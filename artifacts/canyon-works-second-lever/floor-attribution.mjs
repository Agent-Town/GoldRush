// WHICH LEVER MOVED THE IDLE FLOOR? `null-floor-anchors.mjs --check` reported the two
// `e3-canyon-works` rows moved by eventLogHash alone (every other field identical). The idle policy
// never builds and dies at wave 3, so neither lever should be reachable — this attributes the move
// by re-running the idle floor with each lever removed in turn.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const BUNDLE = 'assets/contracts/epoch-3-voltage/contracts.json';
const original = readFileSync(BUNDLE, 'utf8');
const LADDER = ', "beaconLadder": [25, 30, 35, 45, 50, 55]';
const BYWAVE_NEW = '"connect": { "required": 2, "byWave": 8 }';
const BYWAVE_OLD = '"connect": { "required": 2, "byWave": 6 }';

function idleFloor(seed) {
  const run = spawnSync(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e3-canyon-works', '--seed', seed, '--policy=idle'], {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  if (run.status !== 0) throw new Error(`rc=${run.status} ${run.stderr.slice(-400)}`);
  const outcome = JSON.parse(run.stdout.trim().split('\n').at(-1));
  return { secured: outcome.secured, waves: outcome.waves, timeMs: outcome.timeMs, gold: outcome.gold, kills: outcome.kills, eventLogHash: outcome.eventLogHash };
}

const variants = {
  'both levers (shipped)': original,
  'ladder only (byWave back to 6)': original.replace(BYWAVE_NEW, BYWAVE_OLD),
  'byWave only (no ladder)': original.replace(LADDER, ''),
  'neither lever (pre-slice)': original.replace(BYWAVE_NEW, BYWAVE_OLD).replace(LADDER, ''),
};
const report = {};
try {
  for (const [label, bundle] of Object.entries(variants)) {
    writeFileSync(BUNDLE, bundle);
    report[label] = { 'e3-canyon-works-01': idleFloor('e3-canyon-works-01'), 'e3-canyon-works-02': idleFloor('e3-canyon-works-02') };
    process.stderr.write(`${label}: ${JSON.stringify(report[label])}\n`);
  }
} finally {
  writeFileSync(BUNDLE, original);
}
writeFileSync(new URL('./floor-attribution.json', import.meta.url), `${JSON.stringify(report, null, 1)}\n`);
process.stderr.write(`restored: ${readFileSync(BUNDLE, 'utf8') === original}\n`);
