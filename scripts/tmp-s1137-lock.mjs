import fs from 'node:fs';
const path = 'STATUS.md';
const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split('\n');
const prev = lines[0];
const newLine1 = process.argv[2];
const archiveLabel = process.argv[3]; // e.g. "s1136 handoff"
lines[0] = newLine1;
// insert the archive bullet immediately before the first existing "(line-1 archive)" bullet
const idx = lines.findIndex((l, i) => i > 0 && l.includes('(line-1 archive):'));
if (idx < 0) throw new Error('no archive bullet block found');
lines.splice(idx, 0, `- **${archiveLabel} (line-1 archive):** ${prev}`, '');
fs.writeFileSync(path, lines.join('\n'));
console.log('line1 set; archived as', archiveLabel, '; inserted at', idx + 1);
