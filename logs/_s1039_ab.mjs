// s1039: contention-cancelling A/B harness for the perf-05 :231 ttiMs hold.
// Swaps main's perf-05 spec into worktrees/lane-a so both variants run on the
// SAME machine under the SAME load, then restores. No git needed inside lane-a.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = path.join(ROOT, 'worktrees/lane-a');
const SPEC = 'e2e/perf-05-startup.spec.ts';
const LANE_SPEC = path.join(LANE, SPEC);
const BAK = path.join(ROOT, 'logs/_s1039_lane_spec.bak.ts');

const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });

const cmd = process.argv[2];

if (cmd === 'status') {
  // status of the lane worktree, via the main repo's git (no cd needed)
  const out = execFileSync('git', ['-C', LANE, 'status', '--short'], { encoding: 'utf8' });
  console.log('lane-a dirt:', JSON.stringify(out));
  const head = execFileSync('git', ['-C', LANE, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log('lane-a HEAD:', head);
  const laneBlob = git('show', `cec50777:${SPEC}`);
  const onDisk = fs.readFileSync(LANE_SPEC, 'utf8');
  console.log('spec matches cec50777:', laneBlob === onDisk);
} else if (cmd === 'to-main') {
  if (!fs.existsSync(BAK)) fs.writeFileSync(BAK, fs.readFileSync(LANE_SPEC));
  fs.writeFileSync(LANE_SPEC, git('show', `main:${SPEC}`));
  console.log('lane-a spec := main version (backup at logs/_s1039_lane_spec.bak.ts)');
} else if (cmd === 'to-lane') {
  fs.writeFileSync(LANE_SPEC, git('show', `cec50777:${SPEC}`));
  console.log('lane-a spec := cec50777 version');
} else if (cmd === 'read') {
  // print the ttiMs / firstFrame from a report json
  const f = path.join(LANE, 'artifacts/perf-05', process.argv[3]);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(JSON.stringify({
    mode: j.mode,
    ttiMs: j.metrics?.ttiMs,
    firstFrameMs: j.metrics?.firstFrameMs,
    playableMs: j.metrics?.playableMs,
    beforeFirstFrame: j.lazy?.beforeFirstFrame,
    prefetchCount: j.lazy?.prefetchedBeforeWaveSpawn?.length,
    bootBytes: j.metrics?.bootBytes,
  }, null, 2));
} else {
  console.error('usage: status | to-main | to-lane | read <file.json>');
  process.exit(2);
}
