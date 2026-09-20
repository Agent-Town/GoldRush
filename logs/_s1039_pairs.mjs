// s1039: paired, alternating A/B replicates for the perf-05 :231 hold.
// The page under test is byte-identical between variants (only the spec's own
// bookkeeping differs), so ttiMs should be statistically indistinguishable.
// Alternating LANE/MAIN cancels slow drift in machine load.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = path.join(ROOT, 'worktrees/lane-a');
const SPEC = 'e2e/perf-05-startup.spec.ts';
const LANE_SPEC = path.join(LANE, SPEC);
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });

const PAIRS = Number(process.argv[2] ?? 3);
const project = process.argv[3] ?? 'desktop-chrome';
const results = [];

function setVariant(v) {
  fs.writeFileSync(LANE_SPEC, git('show', v === 'LANE' ? `cec50777:${SPEC}` : `main:${SPEC}`));
}

function runOnce(variant, i) {
  const load = os.loadavg()[0];
  const t0 = Date.now();
  const r = spawnSync('npx', ['playwright', 'test', SPEC, `--project=${project}`, '--reporter=line'], {
    cwd: LANE, encoding: 'utf8', maxBuffer: 1 << 28,
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5199' },
  });
  const wallMs = Date.now() - t0;
  let m = {};
  try {
    const j = JSON.parse(fs.readFileSync(path.join(LANE, 'artifacts/perf-05', `after-${project}.json`), 'utf8'));
    m = {
      ttiMs: j.metrics?.ttiMs,
      firstFrameMs: j.metrics?.firstFrameMs,
      beforeFirstFrame: j.lazy?.beforeFirstFrame?.length,
      prefetchCount: j.lazy?.prefetchedBeforeWaveSpawn?.length,
    };
  } catch (e) { m = { error: String(e) }; }
  const row = { variant, i, rc: r.status, wallMs, load: +load.toFixed(2), ...m };
  results.push(row);
  console.log(JSON.stringify(row));
  return row;
}

for (let i = 1; i <= PAIRS; i++) {
  // alternate order within each pair to cancel any within-pair ordering bias
  const order = i % 2 === 1 ? ['LANE', 'MAIN'] : ['MAIN', 'LANE'];
  for (const v of order) { setVariant(v); runOnce(v, i); }
}

const by = (v) => results.filter((r) => r.variant === v).map((r) => r.ttiMs).filter((n) => typeof n === 'number');
const stat = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const mean = a.reduce((p, c) => p + c, 0) / a.length;
  return { n: a.length, min: s[0], max: s[s.length - 1], median: s[(s.length - 1) >> 1], mean: Math.round(mean), spread: s[s.length - 1] - s[0] };
};
console.log('\n=== ttiMs SUMMARY ===');
console.log('LANE', JSON.stringify(stat(by('LANE'))));
console.log('MAIN', JSON.stringify(stat(by('MAIN'))));

// restore the lane variant on disk
setVariant('LANE');
console.log('restored: lane-a spec := cec50777');
fs.writeFileSync(path.join(ROOT, 'logs/_s1039_ab-results.json'), JSON.stringify(results, null, 2));
