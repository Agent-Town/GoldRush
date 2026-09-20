// s1466: perform the merge inside the detached gate worktree (bash gate refuses `git -C` and `cd &&`; node exec does it).
import { execFileSync } from 'node:child_process';
const cwd = '/Users/robin/Claude/Projects/Gold Rush/gate-s1466';
const run = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
console.log('HEAD before:', run('rev-parse', '--short', 'HEAD').trim());
console.log(run('merge', '--no-ff', 'lane/a', '-m', 'gate-s1466: merged tree probe (nul-delimiters)'));
console.log('HEAD after :', run('rev-parse', '--short', 'HEAD').trim());
console.log('status:', JSON.stringify(run('status', '--porcelain')));
