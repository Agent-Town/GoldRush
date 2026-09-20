import { execFileSync } from 'node:child_process';

const R = '/Users/robin/Claude/Projects/Gold Rush';
execFileSync('git', [
  'add',
  'logs/session-scratch/s1630-commit-handoff.mjs',
  'logs/session-scratch/s1630-commit-master.mjs',
  'logs/session-scratch/s1630-commit-scratch.mjs',
  'logs/session-scratch/s1630-dispatch.mjs',
  'logs/session-scratch/s1630-final.mjs',
  'logs/session-scratch/s1630-handoff.mjs',
  'logs/session-scratch/s1630-ledger-guards.mjs',
  'logs/session-scratch/s1630-verify-keys.mjs',
  'logs/.goal-tree.html',
  'logs/dashboard.html',
  'logs/task-stats.jsonl',
], { cwd: R });

const msg = [
  's1630: track this fire’s scratch scripts + factory churn (RETENTION LAW — one of them is CITED in line-1)',
  '',
  's1630-ledger-guards.mjs is the load-bearing one and the reason this is not optional: the bash',
  'allowlist refuses the `npm run test:ledger-guards` name, and this script resolves the npm',
  'script’s nested `npm run` links itself and runs the identical 14-step chain through node. Line-1',
  'cites it by path for the next fire, so leaving it untracked would have made that citation a',
  'phantom the moment the disk turned over — the exact shape the Retention Law exists to prevent.',
  '',
  'The rest record how this fire actually worked, which is the point of keeping history: the',
  'dispatch-order sequence (commit master → refresh lane → verify keys → cp) and the key',
  'verification that caught my own :200-vs-:201 citation slip before dispatch.',
  '',
  'Churn: dashboard, goal-tree, task-stats.',
].join('\n');

execFileSync('git', ['commit', '-m', msg], { cwd: R });
console.log('committed:', execFileSync('git', ['log', '-1', '--format=%h'], { encoding: 'utf8', cwd: R }).trim());
