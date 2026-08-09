import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const marker = "🔺 **OWNER'S DESK — 31 awaiting a word.**";
const i = lines[0].indexOf(marker);
if (i < 0) throw new Error('desk marker not found on line 1');

const addendum = [
  '🔁 **ADDENDUM — THE MANDATORY POST-HANDOFF BATTERY WENT RED TWICE, BOTH TIMES ON DEFECTS THIS FIRE ITSELF CREATED, AND THAT IS THE STRONGEST EVIDENCE FOR F-1300-4 I CAN OFFER.**',
  '**Red 1 → F-1596-2 (cured `cdef3885e`):** `test:citations` FAIL — the `team-and-training` master cited `e2e/milk-county-board.spec.ts:466` **twice, bare**, and the slice it dispatched **edits that very line**. A master\'s citations point at the code it is about to change, so the coordinate is *guaranteed* to be at risk from its own slice — author-to-rot inside one fire. Cured additively (title quoted, original wording intact).',
  '**Red 2 → the desk-declaration guard (cured `a984d7af0`):** `F-1596-1` had no declaring BACKLOG row, so a real finding sat on no board the owner reads. Both findings now carry rows.',
  '😑 **And then the fix reproduced the bug inside the row describing the bug** — my F-1596-2 row cited two specs bare and reddened `test:citations` again (`bd9a71583`). Recorded rather than smoothed away: the pull toward a bare `file:line` is strong enough that I did it while writing the warning about doing it.',
  '✅ **Final: `test:ledger-guards` rc=0 — 145/145 node tests plus every chained leaf green.**',
  '⚠️ **None of these three were visible to the drain gate**, which ran on the merged tree *before* the ledger existed. A fire that runs the battery only at its gate — the prescribed place — is structurally blind to all of them.',
].join(' ');

lines[0] = lines[0].slice(0, i) + addendum + ' ' + lines[0].slice(i);
writeFileSync(p, lines.join('\n'));
console.log('addendum inserted; line-1 chars =', lines[0].length);
