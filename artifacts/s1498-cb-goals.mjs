import fs from 'node:fs';
const P = 'tasks/goals.json';
const lines = fs.readFileSync(P, 'utf8').split('\n');
if (!lines[5429].startsWith('<<<<<<<') || !lines[5464].startsWith('=======') || !lines[5473].startsWith('>>>>>>>')) {
  throw new Error('boundaries moved — refusing to write');
}
const headBody = lines.slice(5430, 5464); // main's four er-01 leaves, last one unclosed
const brBody = lines.slice(5465, 5473);   // county-board's leaf, unclosed
const indent = '            ';
const out = [...headBody, `${indent}},`, `${indent}{`, ...brBody];
const merged = [...lines.slice(0, 5429), ...out, ...lines.slice(5474)];
fs.writeFileSync(P, merged.join('\n'));
// Prove it: the file must still parse, and must contain both the first and last added ids.
const tree = JSON.parse(fs.readFileSync(P, 'utf8'));
const ids = JSON.stringify(tree).match(/"id":"[^"]+"/g) || [];
console.log('JSON parses. leaves:', ids.length);
for (const want of ['er-01-e10-census', 'mcb-posse-board-and-row-watch', 'milk-twin-sockets']) {
  console.log(' ', want, JSON.stringify(tree).includes(`"${want}"`) ? 'PRESENT' : 'MISSING');
}
