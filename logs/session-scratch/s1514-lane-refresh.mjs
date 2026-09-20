import { execFileSync } from 'node:child_process';
const LANE = '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a';
const git = (...a) => execFileSync('git', ['-C', LANE, ...a], { encoding: 'utf8' }).trim();

// SAFETY: only fast-forward, and only if the lane holds nothing of its own.
const ahead = git('rev-list', '--count', 'main..lane/a');
const dirt = git('status', '--porcelain');
console.log('pre: ahead=' + ahead, '| dirt=' + JSON.stringify(dirt));
if (ahead !== '0') throw new Error('lane is AHEAD — refusing to touch it');
if (dirt !== '') throw new Error('lane is DIRTY — refusing to touch it');

console.log(git('merge', '--ff-only', 'main'));
console.log('post: behind=' + git('rev-list', '--count', 'lane/a..main'));
console.log('post: HEAD=' + git('rev-parse', '--short', 'HEAD'));
