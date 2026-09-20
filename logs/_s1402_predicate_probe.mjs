// s1402 probe: does the lane-runner's main-slot gate (`head -2 STATUS.md | grep -q "ACTIVE 2"`)
// match on each recent STATUS.md commit? A match means the MAIN slot was skipped even when
// line-1 said "lock CLEARED". Read-only; writes nothing.
import { execSync } from 'node:child_process';

const lines = execSync('git log -30 --format=%h%x09%cI%x09%s -- STATUS.md', {
  encoding: 'utf8', maxBuffer: 1e8,
}).trim().split('\n');

let blocked = 0;
for (const line of lines) {
  const [sha, when, subj] = line.split('\t');
  let txt = '';
  try {
    txt = execSync('git show ' + sha + ':STATUS.md', { encoding: 'utf8', maxBuffer: 1e8 });
  } catch { continue; }
  const rows = txt.split('\n');
  const head2 = rows.slice(0, 2).join('\n');
  const blocks = /ACTIVE 2/.test(head2);
  if (blocks) blocked++;
  const cleared = /lock CLEARED/.test(rows[0] || '');
  const tag = blocks ? (cleared ? 'BLOCKS(false)' : 'BLOCKS(real)') : '   ok        ';
  console.log(tag + ' ' + sha + ' ' + when + ' | ' + (subj || '').slice(0, 62));
}
console.log('\nmatched head-2 predicate: ' + blocked + '/' + lines.length);
