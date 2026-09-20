// s1662: perform the trial merge inside the detached gate worktree (§3.0b).
import { execFileSync } from 'node:child_process';
const wt = 'gate-s1662b';
const run = (args) => execFileSync('git', ['-C', wt, ...args], { encoding: 'utf8' });
console.log('HEAD before:', run(['rev-parse', '--short', 'HEAD']).trim());
try {
  console.log(run(['merge', '--no-ff', 'lane/b', '-m', 'gate: f1660-1 trial merge (s1662 scratch)']));
} catch (e) {
  console.log('MERGE STDOUT:\n' + (e.stdout || ''));
  console.log('MERGE STDERR:\n' + (e.stderr || ''));
  throw e;
}
console.log('HEAD after:', run(['rev-parse', '--short', 'HEAD']).trim());
console.log('--- status ---\n' + run(['status', '--short']));
// The load-bearing control: main moved only in bookkeeping, so the merged tree's
// gate-relevant paths must be byte-identical to lane/b's.
const d = run(['diff', '--stat', 'lane/b', 'HEAD', '--', 'src', 'e2e', 'scripts', 'public', 'docs', 'package.json', 'assets']);
console.log('--- merged-tree vs lane/b over gate paths ---\n' + (d.trim() || '(EMPTY — identical)'));
