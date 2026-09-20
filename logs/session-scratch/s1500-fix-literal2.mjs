import fs from 'node:fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

const bad = 'asserted `/ACTIVE 2/` against `lines.slice(0,2)` mechanically';
const good = 'asserted that same literal against `lines.slice(0,2)` mechanically';

if (!lines[0].includes(bad)) { console.error('target not found'); process.exit(2); }
lines[0] = lines[0].replace(bad, good);
fs.writeFileSync(p, lines.join('\n'));

const head2 = lines.slice(0, 2);
console.log('head-2 contains the lock literal (must be false):', head2.some((l) => /ACTIVE 2/.test(l)));
console.log('line-1 says CLEARED:', /lock CLEARED/.test(head2[0]));
console.log('desk header on line-1:', /OWNER'?’?S? DESK/.test(head2[0]));
console.log('s1499 handoff archive count:', (lines.join('\n').match(/s1499 handoff \(line-1 archive\)/g) || []).length);
console.log('line-3 is s1500 lock archive:', /s1500 lock line/.test(lines[2]));
