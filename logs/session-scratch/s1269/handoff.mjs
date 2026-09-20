import fs from 'node:fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const old = lines[0];
const text = fs.readFileSync('/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1269/line1.md', 'utf8').replace(/\n+$/, '');
let insertAt = 0;
for (let i = 1; i < lines.length; i++) {
  if (lines[i].startsWith('- **s') && lines[i].includes('(line-1 archive):**')) insertAt = i;
}
lines[0] = text;
lines.splice(insertAt + 1, 0, '', '- **s1269 lock (line-1 archive):** ' + old);
fs.writeFileSync(p, lines.join('\n'));
console.log('handoff written; archive bullet after index', insertAt);
