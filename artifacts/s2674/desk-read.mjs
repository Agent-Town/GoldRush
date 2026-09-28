import fs from 'node:fs';
const s = fs.readFileSync('STATUS.md', 'utf8');
const line1 = s.slice(0, s.indexOf('\n'));
const marker = 'awaiting a word';
const hits = [];
let p = 0;
while (true) {
  const k = s.indexOf(marker, p);
  if (k < 0) break;
  hits.push(k);
  p = k + 1;
  if (hits.length > 40) break;
}
console.log('line1Len', line1.length, 'statusLen', s.length);
console.log('awaiting-a-word hits:', hits.slice(0, 10).join(','), 'total', hits.length);
const h = hits.find((x) => x < line1.length);
console.log('inLine1:', h);
if (h !== undefined) {
  const out = line1.slice(Math.max(0, h - 300));
  fs.writeFileSync('artifacts/s2674/desk-tail.txt', out);
  console.log('wrote desk-tail.txt bytes', out.length);
}
fs.writeFileSync('artifacts/s2674/line1.txt', line1);
