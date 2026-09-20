// s1588: check my own handoff desk with the parser I just merged, BEFORE writing line-1.
// The guard cannot see a lock line, so a fire only learns its verdict after committing —
// unless it asks the parser directly. That is what this does.
import fs from 'node:fs';
import { deskTail, deskItems } from '../scripts/desk-carryforward-guard.mjs';

const line = fs.readFileSync('artifacts/s1588-handoff-line1.txt', 'utf8').replace(/\n+$/, '');
const tail = deskTail(line);
if (!tail) { console.error('REFUSE: deskTail() found no desk segment on this line'); process.exit(2); }

const items = deskItems(tail);
const declaredMatch = tail.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
const declared = declaredMatch ? Number(declaredMatch[1]) : null;

const segments = tail.split('🔺').slice(1);
const unkeyed = segments
  .filter((s) => deskItems(`🔺${s}`).length === 0)
  .map((s) => s.trim().slice(0, 90));

console.log(`declared : ${declared}`);
console.log(`keyed    : ${items.length}`);
console.log(`segments : ${segments.length}`);
console.log(`delta    : ${declared - items.length}`);
console.log(`unkeyed  : ${unkeyed.length}`);
for (const u of unkeyed) console.log('   !', u);

const verdict = Math.abs(declared - items.length) > 1 ? 'WOULD REFUSE' : 'PASSES';
console.log(`\nverdict under the merged gate (±1): ${verdict}`);
if (declared !== items.length) {
  console.log(`(exact agreement would be declared=${items.length})`);
}
