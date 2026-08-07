// s1541 scratch — extract the s1540 desk items + owes verbatim so the handoff carries
// them forward mechanically instead of recomposing them from context (F-1533-1's law:
// a desk is a QUEUE, and the only lawful ways off it are a ruling or a closure).
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('STATUS.md', 'utf8').split('\n');
const s1540 = lines[1].replace(/^- \*\*s1540 handoff \(line-1 archive\):\*\* /, '');

const di = Math.max(s1540.lastIndexOf('OWNER’S DESK'), s1540.lastIndexOf("OWNER'S DESK"));
const owesIdx = s1540.indexOf('**Robin owes');
if (di < 0 || owesIdx < 0) throw new Error('desk anchors not found');

// first 🔺 AFTER the header sentence = the first real item
const firstItem = s1540.indexOf('\u{1F53A}', s1540.indexOf('awaiting a word.'));
if (firstItem < 0 || firstItem > owesIdx) throw new Error('no items found after header');

let items = s1540.slice(firstItem, owesIdx).trim();
const owes = s1540.slice(owesIdx).trim();

// F-1536-2's count re-measured this fire: 67 save/* branches, not 66.
const tick = String.fromCharCode(96);
items = items.split(`**66 ${tick}save/*${tick} branches exist**`)
  .join(`**67 ${tick}save/*${tick} branches exist** (RE-COUNTED s1541 by ref sweep; the row was filed at 66)`);
items = items.split('drop 66 rows').join('drop 67 rows');
items = items.split('buckets the 66').join('buckets the 67');

writeFileSync('/tmp/gr-desk-items.txt', items);
writeFileSync('/tmp/gr-desk-owes.txt', owes);

console.log('items chars', items.length);
console.log('carried items (🔺 count):', (items.match(/\u{1F53A}/gu) || []).length);
console.log('66->67 rewrite applied:', items.includes('RE-COUNTED s1541'));
console.log('owes starts:', owes.slice(0, 70));
