import fs from 'node:fs';
const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const anchorIdx = lines.findIndex((l) => l.startsWith('🔺 **F-1268-4 (s1268'));
if (anchorIdx < 0) throw new Error('anchor not found');
const entry = fs.readFileSync('logs/session-scratch/s1269/entry.md', 'utf8').replace(/\n$/, '');
lines.splice(anchorIdx + 1, 0, '', entry);
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted after line', anchorIdx + 1);
