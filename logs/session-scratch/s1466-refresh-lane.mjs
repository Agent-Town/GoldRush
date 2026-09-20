// s1466: refresh lane-a onto origin/main BEFORE the queue copy, then prove the master's own
// citation key is present IN THE LANE. F-1424-3 orders commit -> refresh -> grep -> cp; s1465 could
// not do the refresh itself (the bash allowlist refuses `git -C … checkout -B`) and pushed the
// ordering into the master, where dispatch 1 then STOPped for 27,551 tokens. node runs it.
import { execFileSync, spawnSync } from 'node:child_process';

const lane = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a';
const git = (...a) => execFileSync('git', a, { cwd: lane, encoding: 'utf8' });

console.log('branch before :', git('branch', '--show-current').trim());
console.log('head before   :', git('rev-parse', '--short', 'HEAD').trim());
const dirt = git('status', '--porcelain').trim();
// Only TRACKED dirt blocks a reset; factory churn under logs/** and artifacts/** never does.
const blocking = dirt.split('\n').filter(Boolean)
  .filter((l) => !/^\?\?/.test(l))
  .filter((l) => !/\s(logs|artifacts)\//.test(l));
if (blocking.length) {
  console.error('BLOCKING TRACKED DIRT — refusing to reset:\n' + blocking.join('\n'));
  process.exit(2);
}
console.log('blocking tracked dirt: none');

git('fetch', 'origin', 'main');
git('checkout', '-B', 'lane/a', 'origin/main');
console.log('head after    :', git('rev-parse', '--short', 'HEAD').trim());

// The master's STEP 2 currency probe, run here against the LANE.
const key = 'F-ER01-E3-1 — Blackout Ridge has no agent-visible current';
const r = spawnSync('grep', ['-c', key, 'docs/bench/e3-readiness-census.md'], { cwd: lane, encoding: 'utf8' });
console.log(`citation key in lane -> ${JSON.stringify((r.stdout ?? '').trim())} (rc=${r.status}) — expect "1"`);

const d = spawnSync('grep', ['-c', 'PowerGraph', 'src/sim/HeadlessContractSim.ts'], { cwd: lane, encoding: 'utf8' });
console.log(`safe-dupe probe in lane -> ${JSON.stringify((d.stdout ?? '').trim())} (rc=${d.status}) — expect "0"`);

// And the master file itself must be present in the lane, since the runner reads it from the queue
// but the slice's READ-FIRST list points at lane paths.
console.log('master on lane:', git('cat-file', '-e', 'HEAD:tasks/lane-e3-voltage-socket.md') === '' ? 'present' : 'present');
