import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const PREFIX = '- **s1662 handoff (line-1 archive):** ';
const row = lines.find((l) => l.startsWith(PREFIX));
if (!row) throw new Error('REFUSE: inherited handoff archive not found');
fs.writeFileSync('artifacts/s1663-inherited-line1.txt', `${row.slice(PREFIX.length)}\n`);
console.log('ok: extracted inherited line-1');
