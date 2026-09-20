// s1466 fire: rewrite STATUS.md line-1 (lock / handoff). Stamp comes from a command, never arithmetic.
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const newLine = process.argv[2];
if (!newLine) { console.error('usage: node s1466-lock.mjs "<new line 1>"'); process.exit(2); }
const lines = readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
lines[0] = newLine;
writeFileSync(p, lines.join('\n'), 'utf8');
console.log('PREV:', prev.slice(0, 120));
console.log('NEW :', lines[0].slice(0, 200));
