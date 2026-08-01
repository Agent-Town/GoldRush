import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
if (!prev.startsWith('Last updated:')) { console.error('UNEXPECTED line-1:', prev.slice(0, 80)); process.exit(2); }
const newLine1 = process.argv[2];
const archive = '- **s1345 handoff (line-1 archive):** ' + prev;
lines.splice(0, 1, newLine1, archive);
writeFileSync(p, lines.join('\n'));
console.log('OK. new line-1 len', newLine1.length, '| archived prev len', prev.length);
