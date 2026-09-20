// s1587: make the declared desk count match deskItems() exactly (delta 0).
import fs from 'node:fs';

const NOTE_OLD = 'plus this fire’s two.';
const NOTE_NEW =
  'plus this fire’s two — declared 27 to match `deskItems()` EXACTLY (delta 0), the trailing F-1364-1 reference included because it keys as an item; measured by running `desk-declaration-guard` rather than by counting the prose.';

for (const p of ['STATUS.md', 'logs/s1587-line1.txt']) {
  const before = fs.readFileSync(p, 'utf8');
  let s = before;
  for (const apos of ['’', "'"]) {
    s = s.split(`OWNER${apos}S DESK — 26 awaiting a word.`).join(`OWNER${apos}S DESK — 27 awaiting a word.`);
  }
  s = s.split(NOTE_OLD).join(NOTE_NEW);
  if (s === before) console.log('NO CHANGE', p);
  else {
    fs.writeFileSync(p, s);
    console.log('updated', p);
  }
}
