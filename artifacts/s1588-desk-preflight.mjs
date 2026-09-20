// s1588: what will the NEWLY MERGED live-desk gate say about the desk I inherit and carry?
// Uses the production parser from the merged tree, so this answers about the real instrument.
import fs from 'node:fs';
import { deskTail, deskItems } from '../gate-s1588/scripts/desk-carryforward-guard.mjs';

const status = fs.readFileSync('STATUS.md', 'utf8').split('\n');

// The desk I inherit = s1587's archived handoff line-1.
const archive = status.find((l) => l.startsWith('- **s1587 handoff (line-1 archive):**'));
if (!archive) { console.error('no s1587 archive bullet found'); process.exit(2); }
const line = archive.replace(/^- \*\*s1587 handoff \(line-1 archive\):\*\* /, '');

const tail = deskTail(line);
const items = deskItems(tail);
const declaredMatch = tail?.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/);
const declared = declaredMatch ? Number(declaredMatch[1]) : null;

console.log(`s1587 desk: declared=${declared} keyed=${items.length} delta=${declared - items.length}`);
console.log(`verdict under the merged gate (tolerance +/-1): ${Math.abs(declared - items.length) > 1 ? 'REFUSE' : 'PASS'}`);
console.log('keyed ids:', items.join(' '));

// Which 🔺 segments key to nothing? These are the ones I must repair when I carry them.
const unkeyed = (tail ?? '').split('🔺').slice(1)
  .filter((s) => deskItems(`🔺${s}`).length === 0)
  .map((s) => s.trim().slice(0, 90));
console.log(`unkeyed segments: ${unkeyed.length}`);
for (const u of unkeyed) console.log('  ', u);
