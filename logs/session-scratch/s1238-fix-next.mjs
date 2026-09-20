import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
let h = lines[0];

const staleA =
  '🔥 **(I) NEXT FIRE. A)** **`guard-fx-02` in lane-a is your drain** once the runner finishes — the bar: a **mutation table** with each red’s **message TEXT** (not rc), the final `git hash-object` of `scripts/lib/subject-tree.mjs` back at **`93012a5c`**, and a plain answer on whether the **fail-CLOSED** arm was unproven as premise 2 predicted. If it silently `it.skip`s the EACCES case, that is a finding, not a pass.';
const freshA =
  '🔥 **(I) NEXT FIRE. A)** **NO DRAIN IS WAITING — the board is dry again and all six queues are 0.** `guard-fx-02` was authored, shipped and drained inside this fire (`032eca5a`), so **do not go looking for it**: `main..lane/m3` is empty and its done-move is `drained-s1238-032eca5a-…`. **The best next master is F-1238-2** — `site-contract.test.mjs` leaking one temp dir per run, 132 accumulated, **fire-authorable, no owner ruling needed, and already measured here** (count `os.tmpdir()` before/after a single `node --test scripts/site-contract.test.mjs` to re-derive it in one command). It is a guard with a hygiene defect, which is the same genre this ladder has been paying down all week.';

if (!h.includes(staleA)) { console.error('STALE (I)A NOT FOUND VERBATIM — not editing blind'); process.exit(9); }
h = h.replace(staleA, freshA);

lines[0] = h;
writeFileSync(P, lines.join('\n'));
console.log('(I)A superseded; line-1 chars:', h.length);
