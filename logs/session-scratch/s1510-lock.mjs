import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const stamp = process.argv[2];
lines[0] = `Last updated: ${stamp} s1510 fire, lock ACTIVE — draining lane-a f1507-2 landmark-routing STOP report; then recovering the 2026-07-29 proven-green endpoint the bisect needs.`;
writeFileSync(p, lines.join('\n'));
console.log(lines[0].slice(0, 160));
