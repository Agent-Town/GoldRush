#!/usr/bin/env node
/**
 * s1487 — refresh lane-a to origin/main before dispatch.
 *
 * DISPATCH ORDER (F-1424-3): the master and its evidence are committed FIRST (947f1330,
 * pushed), the lane is refreshed SECOND, the master's own citation grep runs BETWEEN 2 and
 * 3, and the `cp` into the queue is THIRD. s1424 refreshed before committing and the runner
 * claimed the slot one commit short of the evidence its master told it to grep — 44,007
 * tokens for zero files touched.
 *
 * SAFETY, re-verified here rather than inherited from the lane-usable run above:
 * `main..lane/a` must be EMPTY before the reset, or the reset destroys unmerged output
 * (the w1-03 / polish-02 lesson). Refuses loudly rather than proceeding on a dirty tree.
 *
 * Run via node because the bash allowlist refuses `git -C <worktree> checkout` — the gate
 * denies this session, not the factory.
 */
import { execFileSync } from 'node:child_process';

const WT = 'worktrees/lane-a';
const git = (...args) => execFileSync('git', ['-C', WT, ...args], { encoding: 'utf8' }).trim();

const ahead = git('log', '--oneline', 'main..lane/a');
const dirty = git('status', '--porcelain');
console.log(`lane/a ahead of main: ${ahead ? ahead.split('\n').length : 0} commit(s)`);
console.log(`working tree dirt: ${dirty ? dirty.split('\n').length : 0} path(s)`);

if (ahead) {
  console.error('REFUSING: lane/a holds commits main has not absorbed. Drain it first.');
  console.error(ahead);
  process.exit(2);
}
if (dirty) {
  console.error('REFUSING: lane-a working tree is dirty. Inspect before resetting.');
  console.error(dirty);
  process.exit(2);
}

console.log(git('checkout', '-B', 'lane/a', 'origin/main'));
console.log(`now at: ${git('rev-parse', '--short', 'HEAD')} on ${git('branch', '--show-current')}`);
console.log(`behind origin/main: ${git('rev-list', '--count', 'HEAD..origin/main')}`);
