import { readFileSync, writeFileSync } from 'node:fs';
const status = readFileSync('STATUS.md', 'utf8');
const newLine1 = readFileSync('scripts/_s173_line1.txt', 'utf8').replace(/\n$/, '');
const nl = status.indexOf('\n');
const oldLine1 = status.slice(0, nl);
const rest = status.slice(nl + 1);
const out = newLine1 + '\n- **s172 handoff (line-1 archive):** ' + oldLine1 + '\n' + rest;
writeFileSync('STATUS.md', out);
console.log('OK line1 replaced; s172 archived; total bytes', out.length);
