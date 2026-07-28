import { readFileSync, writeFileSync } from 'node:fs';

const [, , label, newLine] = process.argv;
if (!label || !newLine) {
  console.error('usage: node tmp-s1191-lock.mjs "<archive label>" "<new line 1>"');
  process.exit(1);
}
const raw = readFileSync('STATUS.md', 'utf8');
const lines = raw.split('\n');
const old = lines[0];
lines[0] = newLine;
lines.splice(1, 0, `- **${label} (line-1 archive):** ${old}`);
writeFileSync('STATUS.md', lines.join('\n'));
console.log('line1 ->', newLine.slice(0, 160));
console.log('archived as ->', label, `(${old.length} chars)`);
