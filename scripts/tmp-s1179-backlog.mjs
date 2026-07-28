import fs from 'node:fs';
const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const anchor = lines.findIndex((l) => l.startsWith('✍️ **F-1178-1 (s1178)'));
if (anchor < 0) { console.error('anchor not found'); process.exit(1); }
const add = fs.readFileSync('scripts/tmp-s1179-backlog.txt', 'utf8').replace(/\n$/, '').split('\n');
lines.splice(anchor, 0, ...add, '');
fs.writeFileSync(p, lines.join('\n'));
console.log('inserted at line', anchor + 1);
