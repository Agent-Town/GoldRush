// s1588 dispatch step 2 (F-1424-3): refresh lane-b to main AFTER the authoring commit,
// then prove BOTH citation keys resolve IN THE LANE before the cp. lane-b was measured
// USABLE (ahead=0, no dirt) immediately before this runs, so the reset is provably lossless.
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = `${REPO}/worktrees/lane-b`;

// Re-assert losslessness at the last possible moment rather than trusting the earlier read.
const ahead = execFileSync('git', ['-C', LANE, 'log', 'main..lane/b', '--oneline'], { encoding: 'utf8' }).trim();
if (ahead) {
  console.error('STOP: lane/b is ahead of main — refusing to reset over unmerged work');
  console.error(ahead);
  process.exit(2);
}

for (const args of [['checkout', '-B', 'lane/b', 'main'], ['clean', '-fd']]) {
  const r = spawnSync('git', ['-C', LANE, ...args], { encoding: 'utf8' });
  console.log(`git ${args.join(' ')} → rc=${r.status}`);
  if (r.status !== 0) { console.error(r.stderr); process.exit(2); }
}

// The citation check the master tells the runner to run — asked HERE, in the lane, before
// the cp. A key that resolves on main but not in the lane is the F-1424-3 false STOP.
const KEYS = [
  ['tasks/BACKLOG.md', 'THE FIRST PLAYWRIGHT TEST AGAINST A COLD DEV SERVER CAN TIME OUT'],
  ['scripts/gate-battery.mjs', 'THE VERDICT IS AN EXIT CODE, never a parse of stdout'],
];
let bad = 0;
for (const [file, key] of KEYS) {
  const r = spawnSync('grep', ['-c', key, file], { cwd: LANE, encoding: 'utf8' });
  const n = (r.stdout || '').trim();
  console.log(`grep -c '${key.slice(0, 44)}...' ${file} → ${n}`);
  if (n !== '1') bad++;
}
console.log(bad ? `\n✖ ${bad} key(s) did not print 1 — do NOT cp` : '\n✔ both keys print 1 in the lane — safe to cp');
process.exit(bad ? 1 : 0);
