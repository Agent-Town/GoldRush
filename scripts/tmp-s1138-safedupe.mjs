// s1138: prove a lane branch is a SAFE-DUPE of main — i.e. every path its
// unmerged commit(s) touched is byte-identical on main, so a reset loses nothing.
import { execFileSync } from 'node:child_process';

const branch = process.argv[2];
const commit = process.argv[3];

const git = (args) => execFileSync('git', args, { encoding: 'utf8' });

const paths = git(['show', '--pretty=', '--name-only', commit])
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`paths touched by ${commit} (${paths.length}):`);
for (const p of paths) console.log('  ' + p);

const diff = git(['diff', branch, 'main', '--', ...paths]);
console.log('\n--- diff ' + branch + ' vs main over ONLY those paths ---');
console.log(diff.trim() === '' ? '(EMPTY) => SAFE-DUPE PROVEN: reset loses nothing' : diff);
