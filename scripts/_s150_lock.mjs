import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
writeFileSync('/tmp/_s149_line1.txt', lines[0]);
lines[0] = 'ACTIVE 2026-07-07T17:30:00Z (s150 fire) — quiet-check re-verify; stand down if attended computer-use still live-driving main';
writeFileSync(p, lines.join('\n'));
console.log('lock written');
