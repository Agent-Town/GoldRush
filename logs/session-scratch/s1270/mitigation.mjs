// s1270 — MEASURE THE MITIGATION, not the defect.
//
// s1269 §F told the next fire to "just do it": pass `--workers=1` when gating a
// timing-sensitive suite, citing s1268's "0 reds / 18 at w=1". Re-deriving s1268's own
// sweep-meta.json first showed run 5 (w=1) exited rc=1, and sweep-w1-c2.txt holds
// "1 failed" at e2e/gazette-welcome.spec.ts:112 — the RETRIGGER assertion, not the
// DRIFT assertion at :88. So "0 DRIFT reds / 18" is true and "0 reds / 18" is not.
// A gate reads an exit code; it does not read an assertion's signature.
//
// This probe asks the gate-shaped question: at w=1, in THIS fire shell, what is the
// RUN-LEVEL red rate (rc != 0), and how do drift reds and non-drift reds split?
//
// Design, inherited from the fires that earned each line:
//  * ARMS INTERLEAVED (w1, default, w1, default, ...) — a fixed arm order confounds the
//    treatment with time-on-box (s1152, s1180, and s1268's own note).
//  * Output to FILES, never captured stdout — spawnSync truncates under load (s1261).
//  * .txt not .log — .gitignore:7 swallows *.log (F-1267-3).
//  * Load recorded at both ends of every run so a trending background is visible.
//  * Reds are classified by the FAILING LINE, because that is the distinction the
//    headline lost. :88 = drift (toBeLessThan(1)); anything else = a non-drift red that
//    a gate would still surface as a failure.
//  * The obtained worker count is read back from the reporter's own
//    "Running N tests using M workers" line — the flag passed is not the concurrency
//    obtained (s1217/s1264).
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1270';
mkdirSync(OUT, { recursive: true });

const ARMS = [
  { name: 'w1', flags: ['--workers=1'] },
  { name: 'default', flags: [] },
];
const CYCLES = Number(process.argv[2] || 3);

const meta = [];
let n = 0;
for (let cycle = 1; cycle <= CYCLES; cycle++) {
  for (const arm of ARMS) {
    n += 1;
    const loadBefore = os.loadavg().map((x) => x.toFixed(2)).join(' ');
    const logPath = `${OUT}/run-${arm.name}-c${cycle}.txt`;
    const fd = openSync(logPath, 'w');
    const t0 = process.hrtime.bigint();
    const r = spawnSync(
      'npx',
      [
        'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
        '--project=desktop-chrome', '--project=mobile-chrome',
        '--repeat-each=3', '-g', 'fires once', '--reporter=list',
        ...arm.flags,
      ],
      { stdio: ['ignore', fd, fd] },
    );
    const wall = Number(process.hrtime.bigint() - t0) / 1e9;
    closeSync(fd);
    const loadAfter = os.loadavg().map((x) => x.toFixed(2)).join(' ');

    const text = readFileSync(logPath, 'utf8');
    const workersLine = text.match(/Running \d+ tests? using (\d+) workers?/);
    const passed = Number((text.match(/(\d+) passed/) || [])[1] ?? 0);
    const failed = Number((text.match(/(\d+) failed/) || [])[1] ?? 0);
    // every "at .../gazette-welcome.spec.ts:LINE:COL" frame inside a failure block
    const lines = [...text.matchAll(/gazette-welcome\.spec\.ts:(\d+):\d+/g)].map((m) => Number(m[1]));
    const driftFrames = lines.filter((l) => l === 88).length;
    const retriggerFrames = lines.filter((l) => l === 112).length;

    meta.push({
      seq: n, cycle, arm: arm.name,
      workersObtained: workersLine ? Number(workersLine[1]) : null,
      exitCode: r.status,
      passed, failed,
      driftFrames, retriggerFrames,
      otherFailLines: [...new Set(lines.filter((l) => l !== 88 && l !== 112))],
      wallSeconds: +wall.toFixed(2),
      loadavgBefore: loadBefore, loadavgAfter: loadAfter,
      log: logPath,
    });
    writeFileSync(`${OUT}/mitigation-meta.json`, JSON.stringify(meta, null, 2));
    console.log(
      `${n} c${cycle} ${arm.name}: rc=${r.status} workers=${meta[n - 1].workersObtained} ` +
      `${passed}p/${failed}f drift=${driftFrames} retrigger=${retriggerFrames} ` +
      `wall=${wall.toFixed(2)}s load ${loadBefore} -> ${loadAfter}`,
    );
  }
}
