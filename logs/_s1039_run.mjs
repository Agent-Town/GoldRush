// s1039: run one perf-05 desktop measurement in worktrees/lane-a against the
// scratch dev server on 5199, record the machine load around it, and print the
// metrics that decide the :231 hold. Variant is whatever spec is on disk.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LANE = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a';
const label = process.argv[2] ?? 'run';
const project = process.argv[3] ?? 'desktop-chrome';

const loadBefore = os.loadavg()[0];
const t0 = Date.now();
const r = spawnSync('npx', [
  'playwright', 'test', 'e2e/perf-05-startup.spec.ts',
  `--project=${project}`, '--reporter=line',
], {
  cwd: LANE,
  encoding: 'utf8',
  maxBuffer: 1 << 28,
  env: {
    ...process.env,
    GR_CAPTURE_EXTERNAL_SERVER: '1',
    GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5199',
  },
});
const wallMs = Date.now() - t0;
const loadAfter = os.loadavg()[0];

const out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
const failLines = out.split('\n').filter((l) => /expect|Error|✘|✓|passed|failed|Received|Expected/.test(l)).slice(0, 25);

let metrics = null;
try {
  const j = JSON.parse(fs.readFileSync(path.join(LANE, 'artifacts/perf-05', `after-${project}.json`), 'utf8'));
  metrics = {
    ttiMs: j.metrics?.ttiMs,
    firstFrameMs: j.metrics?.firstFrameMs,
    playableMs: j.metrics?.playableMs,
    bootBytes: j.metrics?.bootBytes,
    beforeFirstFrame: j.lazy?.beforeFirstFrame?.length,
    prefetchCount: j.lazy?.prefetchedBeforeWaveSpawn?.length,
  };
} catch (e) {
  metrics = { error: String(e) };
}

console.log(JSON.stringify({
  label, project, rc: r.status, wallMs,
  loadBefore: +loadBefore.toFixed(2), loadAfter: +loadAfter.toFixed(2),
  metrics,
  lines: failLines,
}, null, 2));
