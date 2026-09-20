import fs from 'node:fs';
const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
// preserve the prior line-1 verbatim for the handoff archive
fs.writeFileSync('logs/session-scratch/s1513-line1.txt', lines[0], 'utf8');
lines[0] = 'ACTIVE 2026-08-07T08:17Z (s1514 fire) — drain lane-a f1510-3 (inventory names its commit); scripts-only slice, tsc + node-guards battery.';
fs.writeFileSync(P, lines.join('\n'), 'utf8');
console.log('line1 now:', lines[0]);
console.log('archived s1513 line1 chars:', fs.readFileSync('logs/session-scratch/s1513-line1.txt','utf8').length);
