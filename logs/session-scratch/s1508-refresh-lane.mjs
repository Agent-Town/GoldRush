import { execFileSync } from 'node:child_process';
const wt = 'worktrees/lane-a';
const run = (...args) => execFileSync('git', ['-C', wt, ...args], { encoding: 'utf8' }).trim();

console.log('before:', run('rev-parse', '--short', 'HEAD'), run('status', '--porcelain') || '(clean)');
console.log(run('merge', '--ff-only', 'main'));
const head = run('rev-parse', 'HEAD');
console.log('after :', head.slice(0, 9));
console.log('ahead/behind vs main:', run('rev-list', '--left-right', '--count', 'main...HEAD'));
// prove the lane contains the master's own commit
try {
  execFileSync('git', ['-C', wt, 'merge-base', '--is-ancestor', '557a78c70', 'HEAD']);
  console.log('CONTAINS 557a78c70: yes');
} catch {
  console.log('CONTAINS 557a78c70: NO');
}
