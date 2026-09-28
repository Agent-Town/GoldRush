// s2673 — the desk is CARRIED, never composed. I typed the tail into the handoff draft from
// a probe's output; that is composition, and the law says carry (a retyped tail is one
// invisible character-swap away from a desk item that no longer matches its declaring row).
// This splices the LIVE bytes in and reports whether my typing had in fact drifted.
import { readFileSync, writeFileSync } from 'node:fs';

const DRAFT = 'artifacts/s2673/handoff-intent.txt';
const HEADER = /🔺 \*\*OWNER.{0,2}S DESK —/;

const status = readFileSync('STATUS.md', 'utf8');
const live1 = status.slice(0, status.indexOf('\n'));
const liveAt = live1.search(HEADER);
if (liveAt === -1) throw new Error('no desk header on the live line 1 — refusing to invent one');
const liveTail = live1.slice(liveAt);

const draft = readFileSync(DRAFT, 'utf8').replace(/\n+$/, '');
const draftAt = draft.search(HEADER);
if (draftAt === -1) throw new Error('no desk header in the draft');
const draftTail = draft.slice(draftAt);

console.log('live tail chars :', liveTail.length);
console.log('draft tail chars:', draftTail.length);
console.log('identical       :', liveTail === draftTail);

if (liveTail !== draftTail) {
  let p = 0;
  while (p < liveTail.length && p < draftTail.length && liveTail[p] === draftTail[p]) p++;
  console.log('first divergence at char', p);
  console.log('  live :', JSON.stringify(liveTail.slice(p, p + 90)));
  console.log('  draft:', JSON.stringify(draftTail.slice(p, p + 90)));
}

writeFileSync(DRAFT, `${draft.slice(0, draftAt)}${liveTail}\n`, 'utf8');
const items = (liveTail.match(/🔺/g) ?? []).length - 1;
console.log(`spliced the LIVE tail in; ${items} desk items carried`);
for (const id of ['F-2642-3', 'b1-device-verdict-rows', 'F-2299-1']) {
  console.log(`  carries ${id}:`, liveTail.includes(id));
}
