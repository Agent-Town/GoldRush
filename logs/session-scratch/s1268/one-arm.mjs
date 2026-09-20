// s1268 — ONE w=6 arm, tagged, so the caller can alternate sandboxed / unsandboxed invocations.
//
// s1265 closed "the sandbox" with an arm that measured REDNESS ONLY, on a box at loadavg 18.14,
// one instance timing out at 30s — and never recorded wall time. The fire-vs-lane gap is a
// WALL-TIME gap (14s lane vs 83-120s fire at the same 6 workers), so redness cannot close it:
// refuting a report's mechanism is not refuting its symptom, and a contaminated control can
// agree with a contaminated treatment.
//
// This arm records wall time, per-test durations, drift reds, AND an in-band proof that the
// sandbox treatment was actually applied (a write outside the workspace, immediately removed).
import { spawnSync } from 'node:child_process';
import { openSync, closeSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import os from 'node:os';

const OUT = 'logs/session-scratch/s1268';
mkdirSync(OUT, { recursive: true });

const TAG = process.argv[2] || 'arm';
const WORKERS = Number(process.argv[3] || 6);

// --- treatment proof: can this shell write outside the workspace? ---
let sandboxProbe;
const probePath = '/Users/robin/.s1268-sandbox-probe.txt';
try {
  writeFileSync(probePath, 's1268');
  unlinkSync(probePath);
  sandboxProbe = 'WRITE-OUTSIDE-WORKSPACE ALLOWED (unsandboxed)';
} catch (e) {
  sandboxProbe = `WRITE-OUTSIDE-WORKSPACE DENIED (sandboxed): ${e.code}`;
}

const loadBefore = os.loadavg().map((x) => x.toFixed(2)).join(' ');
const logPath = `${OUT}/arm-${TAG}.txt`;
const fd = openSync(logPath, 'w');
const t0 = process.hrtime.bigint();
const r = spawnSync('npx', [
  'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
  '--project=desktop-chrome', '--project=mobile-chrome',
  '--repeat-each=3', '-g', 'fires once', '--reporter=list',
  `--workers=${WORKERS}`,
], { stdio: ['ignore', fd, fd] });
const wall = Number(process.hrtime.bigint() - t0) / 1e9;
closeSync(fd);

const rec = {
  tag: TAG, workersFlag: WORKERS, sandboxProbe,
  wallSeconds: +wall.toFixed(2), exitCode: r.status,
  loadavgBefore: loadBefore, loadavgAfter: os.loadavg().map((x) => x.toFixed(2)).join(' '),
  log: logPath,
};
writeFileSync(`${OUT}/arm-${TAG}.json`, JSON.stringify(rec, null, 2));
console.log(JSON.stringify(rec, null, 2));
