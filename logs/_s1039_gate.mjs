// s1039: final gate — run perf-05 on the MERGED MAIN tree, both projects,
// against the scratch server on 5231.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
for (const project of ['desktop-chrome', 'mobile-chrome']) {
  const load = os.loadavg()[0];
  const r = spawnSync('npx', ['playwright', 'test', 'e2e/perf-05-startup.spec.ts', `--project=${project}`, '--reporter=line'], {
    cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28,
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5199' },
  });
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/perf-05', `after-${project}.json`), 'utf8'));
  console.log(JSON.stringify({
    project, rc: r.status, load: +load.toFixed(2),
    ttiMs: j.metrics?.ttiMs, firstFrameMs: j.metrics?.firstFrameMs,
    bootBytes: j.metrics?.bootBytes,
    beforeFirstFrame: j.lazy?.beforeFirstFrame,
    prefetchCount: j.lazy?.prefetchedBeforeWaveSpawn?.length,
    consoleErrors: j.errors?.consoleErrors?.length,
    pageErrors: j.errors?.pageErrors?.length,
    assetErrors: j.errors?.assetErrors?.length,
  }));
  if (r.status !== 0) console.log((r.stdout ?? '').split('\n').filter((l) => /Expected|Received|✘/.test(l)).slice(0, 8).join('\n'));
}
