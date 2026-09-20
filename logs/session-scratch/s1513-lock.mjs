import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const raw = readFileSync(P, 'utf8');
const lines = raw.split('\n');
const prev = lines[0];
writeFileSync('logs/session-scratch/s1512-line1.txt', prev + '\n');
console.log('prev line-1 length:', prev.length);
console.log('prev starts:', prev.slice(0, 90));

const stamp = process.argv[2];
lines[0] = `Last updated: ${stamp} s1513 fire, lock ACTIVE — draining lane-b f1508-2 (red-inventory-lookup verdicts).`;
writeFileSync(P, lines.join('\n'));
console.log('new line-1:', lines[0]);
console.log('s1511 archive bullets:', (raw.match(/s1511 handoff \(line-1 archive\)/g) || []).length);
