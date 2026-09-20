// s1039: N consecutive runs of whatever spec variant is on disk in lane-a.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LANE = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a';
const n = Number(process.argv[2] ?? 3);
const project = process.argv[3] ?? 'desktop-chrome';
const rows = [];
for (let i = 1; i <= n; i++) {
  const load = os.loadavg()[0];
  const r = spawnSync('npx', ['playwright', 'test', 'e2e/perf-05-startup.spec.ts', `--project=${project}`, '--reporter=line'], {
    cwd: LANE, encoding: 'utf8', maxBuffer: 1 << 28,
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5199' },
  });
  const j = JSON.parse(fs.readFileSync(path.join(LANE, 'artifacts/perf-05', `after-${project}.json`), 'utf8'));
  const row = { i, rc: r.status, load: +load.toFixed(2), ttiMs: j.metrics?.ttiMs, firstFrameMs: j.metrics?.firstFrameMs,
    beforeFirstFrame: j.lazy?.beforeFirstFrame?.length, prefetchCount: j.lazy?.prefetchedBeforeWaveSpawn?.length };
  rows.push(row);
  console.log(JSON.stringify(row));
}
const tti = rows.map((r) => r.ttiMs);
console.log('\ngreen runs:', rows.filter((r) => r.rc === 0).length, '/', rows.length,
  '| tti min', Math.min(...tti), 'max', Math.max(...tti));
