import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8' });

// 2. refresh the lane ONTO the commit carrying the master + its citation
console.log(g('-C', 'worktrees/lane-a', 'checkout', '-B', 'lane/a', 'main').trim());
console.log(g('-C', 'worktrees/lane-a', 'clean', '-fd').trim() || '(nothing to clean)');
console.log('lane head:', g('-C', 'worktrees/lane-a', 'log', '-1', '--format=%h %s').trim());

// verify the master file is present in the lane
console.log('master in lane:', fs.existsSync('worktrees/lane-a/tasks/lane-f1506-2-e9-roster-bisect.md'));

// re-prove the citation key IN THE LANE (F-1424-3 / F-1425-2)
const key = "test('E9 placeholders preserve siege/thief flags and cure-arms exits'";
const laneSrc = fs.readFileSync('worktrees/lane-a/e2e/e9-roster.spec.ts', 'utf8');
const mainSrc = fs.readFileSync('e2e/e9-roster.spec.ts', 'utf8');
const count = (s) => s.split('\n').filter((l) => l.includes(key)).length;
console.log('citation key on main:', count(mainSrc), '| in lane:', count(laneSrc));
if (count(mainSrc) !== 1 || count(laneSrc) !== 1) throw new Error('REFUSING to dispatch: key not 1/1');
