import fs from 'node:fs';

const p = 'reviews/f1465-1-nul-delimiters.md';
const NUL = String.fromCharCode(0);
const ESCAPE = '\\u0000'; // the six-character text both sites meant to write

const before = fs.readFileSync(p, 'utf8');
let n = 0;
for (const ch of before) if (ch === NUL) n++;

if (n === 0) {
  console.log('no raw NULs present — no-op');
  process.exit(0);
}

const after = before.split(NUL).join(ESCAPE);

// Safety: the only permitted change is raw-NUL -> escape text. Prove it by
// reversing the substitution and requiring the original back, byte for byte.
// NOTE: this comment deliberately spells NUL in words. An earlier revision put a
// literal 0x00 here and tripped nul-audit -- F-1467-2's own defect, in its cure.
if (after.split(ESCAPE).join(NUL) !== before) {
  throw new Error('reverse-substitution mismatch — refusing to write (the file already contained the literal escape somewhere)');
}

fs.writeFileSync(p, after);
console.log('replaced', n, 'raw NUL byte(s) with the', ESCAPE.length + '-char escape');
console.log('bytes:', Buffer.byteLength(before), '->', Buffer.byteLength(after));
