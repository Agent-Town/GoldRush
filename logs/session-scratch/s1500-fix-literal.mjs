import fs from 'node:fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const bad = 'the old `head -2 | grep "ACTIVE 2"` predicate is what actually executes';
const good =
  'the old two-line grep for the bare ACTIVE-plus-year literal is what actually executes — **and I am deliberately NOT quoting that literal here, because writing it into a handoff line-1 IS the false-block: my first draft of this very sentence quoted it and tripped my own head-2 assertion**';

if (!lines[0].includes(bad)) {
  console.error('target text not found on line-1 — refusing to guess');
  process.exit(2);
}
lines[0] = lines[0].replace(bad, good);
fs.writeFileSync(p, lines.join('\n'));

const head2 = lines.slice(0, 2);
console.log('head-2 contains the lock literal (must be false):', head2.some((l) => /ACTIVE 2/.test(l)));
console.log('line-1 says CLEARED:', /lock CLEARED/.test(head2[0]));
console.log('desk header on line-1:', /OWNER'?’?S? DESK/.test(head2[0]));
