import { execFileSync } from 'node:child_process';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1e8 });
g('add', 'tasks/BACKLOG.md');
const msg = [
  's1662: declaring rows for F-1662-1..3 — the desk guard caught me folding them into the F-1660-1 row',
  '',
  'test:ledger-guards went rc=1 on my own bookkeeping (179/179 node tests pass; the red',
  'was desk-declaration-guard: 22 desk F-IDs, 21 declared, F-1662-1 undeclared). I had',
  'described all three findings INSIDE the F-1660-1 row, which is exactly the F-1328-3',
  'shape the guard rejects: "a mention inside another finding\'s row does NOT count".',
  '',
  'The guard is right on the merits, not merely by the letter. The dashboard renders',
  'BACKLOG.md, so an undeclared item is on no board the owner reads (Completeness Law),',
  'and F-1662-2 is FIRE-AUTHORABLE — a refilling fire has to be able to find it by',
  'scanning row heads, which it could not while the row head said F-1660-1.',
  '',
  'This is the s1301 class exactly: the drain battery ran on the merged tree, which by',
  'definition PRECEDES the bookkeeping commit, so it was structurally incapable of seeing',
  'the defect I was about to introduce. Caught only by running the guards as the last act.',
  '',
  'desk-declaration-guard now PASS: 22 desk F-IDs, 22 with a declaring row, 0 undeclared.',
].join('\n');
g('commit', '-m', msg);
console.log(g('log', '-1', '--format=%h %s'));
