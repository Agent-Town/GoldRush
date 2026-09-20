import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
const lock = 'ACTIVE 2026-08-07T02:57Z (s1506 fire) — draining priority (A) f1501-4-manifest-plural from lane/c (26b9d25e0, READY-FOR-GATES with both probe halves).';
lines[0] = lock;
lines.splice(1, 0, `- **s1505 handoff (line-1 archive):** ${prev}`);
fs.writeFileSync(p, lines.join('\n'));
console.log('archived s1505, lock written');
