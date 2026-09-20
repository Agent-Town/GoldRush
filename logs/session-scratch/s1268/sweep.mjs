// s1268 — the WORKER-COUNT SWEEP prescribed by s1267 RESULTS.md §4, run in the FIRE shell.
//
// Question: the fire shell runs 6 workers SLOWER than 1 (78-108s vs ~49s) while the lane runs
// them 3.5x FASTER. Is the degradation superlinear in PROCESS count (=> scheduling policy on
// spawned children), or does only the 6-step collapse (=> a per-tree concurrency limit)?
//
// Design notes, each earned by a prior fire:
//  * ARMS ARE INTERLEAVED (1,2,3,6, 1,2,3,6, ...). A fixed arm order confounds the treatment
//    with time-on-box; s1152 and s1180 both manufactured clean-looking false effects that way.
//  * Load is recorded at BOTH ENDS of every run, so a trending background is visible.
//  * Output goes to FILES, never captured stdout (spawnSync truncates under load, s1261).
//  * Logs are written as .txt, not .log — `.gitignore:7` swallows *.log and that is F-1267-3.
//  * Concurrency is read from the reporter's own `Running X tests using M workers` line at
//    analysis time; the flag passed is NOT the concurrency obtained (s1217/s1264).
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });

const STEPS = [1, 2, 3, 6];
const CYCLES = Number(process.argv[2] || 3);

const meta = [];
let n = 0;
for (let cycle = 1; cycle <= CYCLES; cycle++) {
  for (const workers of STEPS) {
    n += 1;
    const loadBefore = os.loadavg().map((x) => x.toFixed(2)).join(' ');
    const logPath = `${OUT}/sweep-w${workers}-c${cycle}.txt`;
    const fd = openSync(logPath, 'w');
    const t0 = process.hrtime.bigint();
    const r = spawnSync(
      'npx',
      [
        'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
        '--project=desktop-chrome', '--project=mobile-chrome',
        '--repeat-each=3', '-g', 'fires once', '--reporter=list',
        `--workers=${workers}`,
      ],
      { stdio: ['ignore', fd, fd] },
    );
    const wall = Number(process.hrtime.bigint() - t0) / 1e9;
    closeSync(fd);
    const loadAfter = os.loadavg().map((x) => x.toFixed(2)).join(' ');
    meta.push({
      seq: n, cycle, workersFlag: workers,
      wallSeconds: +wall.toFixed(2), exitCode: r.status,
      loadavgBefore: loadBefore, loadavgAfter: loadAfter,
      log: logPath,
    });
    writeFileSync(`${OUT}/sweep-meta.json`, JSON.stringify(meta, null, 2));
    console.log(`${n} cycle${cycle} w=${workers}: rc=${r.status} wall=${wall.toFixed(2)}s load ${loadBefore} -> ${loadAfter}`);
  }
}
