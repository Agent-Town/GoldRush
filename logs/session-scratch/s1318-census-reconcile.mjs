// s1318 — reconcile the findings census across my own fire. s1317 handed over 201/157/44;
// I closed 2 and filed 3, so naive arithmetic expects 204/159/45. The guard reads 200/157/43.
// A green I cannot explain is not clean — so: diff the ID sets, don't reason about them.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { scan } from '../../scripts/findings-state-guard.mjs';

const before = execFileSync('git', ['show', '57b9d9bb:tasks/BACKLOG.md'], { encoding: 'utf8', maxBuffer: 1e9 });
const after = readFileSync('tasks/BACKLOG.md', 'utf8');

const ids = (text) => {
  const states = scan(text);
  const open = new Set();
  const closed = new Set();
  for (const [id, st] of states) {
    if (st.closed.length) closed.add(id);
    if (st.open.length) open.add(id);
  }
  return { open, closed, all: new Set([...open, ...closed]) };
};

const A = ids(before);
const B = ids(after);
const diff = (a, b) => [...b].filter((x) => !a.has(x));

console.log(`before (57b9d9bb, s1317 tip): subjects ${A.all.size}  closed ${A.closed.size}  open ${A.open.size}`);
console.log(`after  (this fire)          : subjects ${B.all.size}  closed ${B.closed.size}  open ${B.open.size}`);
console.log('\nsubjects GAINED :', diff(A.all, B.all).join(', ') || '(none)');
console.log('subjects LOST   :', diff(B.all, A.all).join(', ') || '(none)');
console.log('closed GAINED   :', diff(A.closed, B.closed).join(', ') || '(none)');
console.log('closed LOST     :', diff(B.closed, A.closed).join(', ') || '(none)');
console.log('open GAINED     :', diff(A.open, B.open).join(', ') || '(none)');
console.log('open LOST       :', diff(B.open, A.open).join(', ') || '(none)');

for (const id of ['F-1316-1', 'F-1297-2', 'F-1318-1', 'F-1318-2', 'F-1318-3']) {
  const inB = B.all.has(id) ? (B.closed.has(id) ? 'CLOSED' : 'open') : 'NOT COUNTED AT ALL';
  const inA = A.all.has(id) ? (A.closed.has(id) ? 'CLOSED' : 'open') : 'NOT COUNTED AT ALL';
  console.log(`${id.padEnd(9)} before=${inA.padEnd(18)} after=${inB}`);
}
