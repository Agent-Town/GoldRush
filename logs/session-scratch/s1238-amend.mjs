import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');

const note =
  '📉 **F-1238-1 (new, non-blocking, UNDER-SAMPLED ON PURPOSE — recorded as a rate, not a diagnosis):** the guard battery went **7/8 RED on `test:mp`** once, between two 8/8 greens, with a bare `Node.js v26.4.0` crash banner as its whole tail. **Measured rather than labelled "flake":** that guard is **0 red in 5 consecutive isolated runs** (rc=0 each, ~4s), against **1 red in 3 full-battery runs**. The signature is therefore **load/contention inside the battery, not a line in the multiplayer probe** — the same shape as the already-drained concurrency-class-failure-rate ladder (`d71f6ea8`). **One datum is not a cure**, so no corrective was authored: if a later fire sees it again, the honest next step is a rate on **BOTH** arms (battery vs isolated), not an edit to the script. This fire’s final gate is the **8/8 rc=0** re-run, and the red is disclosed here rather than buried. ';

const anchor = '🔺 **(H) OWNER';
const i = lines[0].indexOf(anchor);
if (i < 0) { console.error('ANCHOR MISSING'); process.exit(9); }
lines[0] = lines[0].slice(0, i) + note + lines[0].slice(i);
writeFileSync(P, lines.join('\n'));
console.log('note inserted; line-1 chars', lines[0].length);
