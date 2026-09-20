// s1268 — the control the sweep earned.
//
// The sweep's cycle 2 was slower and redder than cycle 1 at EVERY worker step, including w=1
// (48.33s green -> 77.98s RED on the identical command in the identical shell). Either the box
// degrades under sustained load, or my own sweep is the load. This block answers it:
//
//   1. let the box go quiet, sampling loadavg with setTimeout (never a spin loop, s1124)
//   2. re-run the w=1 arm — if it returns to ~48s and green, box state is the variable and
//      "shell identity" cannot be, because one shell produced both readings
//   3. re-run the w=6 arm immediately after, as a same-conditions reference
//
// Replicates within a step run ADJACENTLY (blocked), which is what s1180 established you need
// when the background is trending rather than stationary.
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });

const QUIET_SECONDS = Number(process.argv[2] || 150);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const loadSeries = [];
console.log(`cooling for ${QUIET_SECONDS}s, sampling load every 15s`);
for (let t = 0; t < QUIET_SECONDS; t += 15) {
  loadSeries.push({ tSeconds: t, load: os.loadavg().map((x) => +x.toFixed(2)) });
  console.log(`  t=${t}s load=${loadSeries[loadSeries.length - 1].load.join(' ')}`);
  await sleep(15000);
}

function arm(workers, tag) {
  const loadBefore = os.loadavg().map((x) => x.toFixed(2)).join(' ');
  const logPath = `${OUT}/recovery-${tag}.txt`;
  const fd = openSync(logPath, 'w');
  const t0 = process.hrtime.bigint();
  const r = spawnSync('npx', [
    'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
    '--project=desktop-chrome', '--project=mobile-chrome',
    '--repeat-each=3', '-g', 'fires once', '--reporter=list',
    `--workers=${workers}`,
  ], { stdio: ['ignore', fd, fd] });
  const wall = Number(process.hrtime.bigint() - t0) / 1e9;
  closeSync(fd);
  const rec = {
    tag, workersFlag: workers, wallSeconds: +wall.toFixed(2), exitCode: r.status,
    loadavgBefore: loadBefore, loadavgAfter: os.loadavg().map((x) => x.toFixed(2)).join(' '),
    log: logPath,
  };
  console.log(`${tag} (w=${workers}): rc=${r.status} wall=${wall.toFixed(2)}s load ${loadBefore} -> ${rec.loadavgAfter}`);
  return rec;
}

const runs = [];
runs.push(arm(1, 'w1-quiet-a'));
writeFileSync(`${OUT}/recovery-meta.json`, JSON.stringify({ loadSeries, runs }, null, 2));
runs.push(arm(1, 'w1-quiet-b'));
writeFileSync(`${OUT}/recovery-meta.json`, JSON.stringify({ loadSeries, runs }, null, 2));
runs.push(arm(6, 'w6-after-quiet'));
writeFileSync(`${OUT}/recovery-meta.json`, JSON.stringify({ loadSeries, runs }, null, 2));
console.log('recovery block done');
