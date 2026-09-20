import fs from 'node:fs';
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const old = lines[0];
const newLine1 = process.argv[2];
const archiveBullet = '- **s1268 handoff (line-1 archive):** ' + old;
// find the last existing line-1 archive bullet and insert after it
let insertAt = 0;
for (let i = 1; i < lines.length; i++) {
  if (lines[i].startsWith('- **s') && lines[i].includes('(line-1 archive):**')) insertAt = i;
}
lines[0] = newLine1;
lines.splice(insertAt + 1, 0, '', archiveBullet);
fs.writeFileSync(p, lines.join('\n'));
console.log('line-1 replaced; archive bullet inserted after index', insertAt);
