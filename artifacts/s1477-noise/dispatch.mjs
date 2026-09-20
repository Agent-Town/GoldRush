import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = ROOT + '/worktrees/lane-a';
const run = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

console.log('lane HEAD before: ' + run(['rev-parse', '--short', 'HEAD'], LANE));
console.log('dirt before: [' + run(['status', '--porcelain'], LANE) + ']');
run(['fetch', 'origin', 'main'], LANE);
run(['checkout', '-B', 'lane/a', 'origin/main'], LANE);
console.log('lane HEAD after:  ' + run(['rev-parse', '--short', 'HEAD'], LANE));
console.log('dirt after:  [' + run(['status', '--porcelain'], LANE) + ']');
console.log('main..lane/a (empty = nothing unmerged): [' + run(['log', '--oneline', 'main..lane/a']) + ']');

// The master's own STEP 2 currency probe, run in the lane exactly as the runner will run it.
for (const key of ['jitter is perfectly COMMON-MODE', 'A METRIC CANNOT BE CLASSIFIED BY ITS NAME']) {
  const n = fs.readFileSync(LANE + '/artifacts/s1477-noise/REPORT.md', 'utf8')
    .split('\n').filter((l) => l.includes(key)).length;
  console.log(`lane grep "${key.slice(0, 34)}…" = ${n}` + (n === 1 ? '  OK' : '  ** WRONG **'));
}
console.log('master present in lane: ' + fs.existsSync(LANE + '/tasks/lane-f1476-1-renderer-count-tolerance.md'));
