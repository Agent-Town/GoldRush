import fs from 'node:fs';

const p = 'reviews/f1465-1-nul-delimiters.md';
const t = fs.readFileSync(p, 'utf8');
const lines = t.split('\n');

const NUL = String.fromCharCode(0);
let count = 0;
for (const ch of t) if (ch === NUL) count++;
console.log('total raw NUL bytes:', count);

lines.forEach((l, i) => {
  if (l.includes(NUL)) {
    console.log('--- LINE ' + (i + 1) + ' ---');
    // render NULs visibly so the output is safe to read
    console.log(l.split(NUL).join('«NUL»'));
    console.log('');
  }
});
