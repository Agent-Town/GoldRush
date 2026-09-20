import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
const lock = 'ACTIVE 2026-08-07T08:49Z (s1515 fire) — draining priority (A) f1501-5-citation-quote-pairing from lane/a (block-check CLEAR, lane HOLDS 3 paths).';
lines[0] = lock;
lines.splice(1, 0, `- **s1514 handoff (line-1 archive):** ${prev}`);
fs.writeFileSync(p, lines.join('\n'));
console.log('archived s1514, lock written');
