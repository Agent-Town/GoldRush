// s1588: is s1587's delta +1 a miscount, or does deskItems() dedupe a repeated key?
// The gate compares declared against deskItems().length; if that de-duplicates, a desk
// listing the same id twice reads one short no matter how carefully it was counted.
import fs from 'node:fs';
import { deskTail, deskItems } from '../gate-s1588/scripts/desk-carryforward-guard.mjs';

const status = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const archive = status.find((l) => l.startsWith('- **s1587 handoff (line-1 archive):**'));
const line = archive.replace(/^- \*\*s1587 handoff \(line-1 archive\):\*\* /, '');
const tail = deskTail(line);

const segments = tail.split('🔺').slice(1);
const perSegment = segments.map((s) => deskItems(`🔺${s}`));
const flat = perSegment.flat();
const unique = deskItems(tail);

console.log(`🔺 segments in the desk tail : ${segments.length}`);
console.log(`ids keyed, summed per segment: ${flat.length}`);
console.log(`ids returned by deskItems()  : ${unique.length}`);

const seen = new Map();
for (const id of flat) seen.set(id, (seen.get(id) ?? 0) + 1);
const dupes = [...seen].filter(([, n]) => n > 1);
console.log(`repeated ids: ${dupes.length ? dupes.map(([id, n]) => `${id} x${n}`).join(', ') : 'none'}`);

const empty = perSegment.filter((ids) => ids.length === 0).length;
const multi = perSegment.filter((ids) => ids.length > 1).length;
console.log(`segments keying to 0 ids: ${empty}; to >1 id: ${multi}`);
