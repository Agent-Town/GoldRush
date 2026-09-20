// s1619: declares F-1619-2 into tasks/BACKLOG.md, immediately after the F-1619-1 row.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('🔎 **F-1619-1 (s1619 2026-08-10'));
if (i < 0) { console.error('F-1619-1 ROW NOT FOUND'); process.exit(2); }

const row = [
  '⚠️ **F-1619-2 (s1619 2026-08-10, MEASURED ON MY OWN DISPATCH — A CITATION KEY COPIED FROM THE FILE YOU MEANT IS NOT A KEY PROVED AGAINST THE FILE YOU NAMED.)**',
  ' ⚙️ `f1619-1`’s READ-FIRST told its runner to locate F-1616-3 by grepping `the WARM column measures request` in `tasks/BACKLOG.md`.',
  ' ✓ **It returns `0` there.** The ledger carries that sentence in **UPPERCASE** (`THE WARM COLUMN MEASURES REQUEST`), and the lowercase form lives in a different file entirely — `reviews/advance-stream-walkthrough-drain.md`, where I had read it.',
  ' 🎯 **Caught because F-1424-3’s dispatch order was followed to the letter:** keys are re-proved **in the refreshed lane** between the refresh and the `cp`, so the `0` surfaced *before* the runner ever saw the master. Re-keyed to `Distinguishing them costs one probe` (`=1` in BACKLOG), re-committed, lane re-refreshed, all four then `=1` in the lane.',
  ' ⚠️ **The failure mode this avoided is the nasty one, and it is worth naming:** the master specifies `0` to mean *the lane drifted*, so a false `0` produces a STOP whose error message **accuses the wrong subject**, sending the next fire chasing a phantom lane refresh (exactly F-1425-2’s recorded shape).',
  ' 💡 **What is NEW here is the mechanism of the mistake, which F-1425-2 does not cover: line-wrapping was never involved.** F-1425-2 warns that prose wraps and `grep` is line-oriented; this key sat on one physical line in both files and matched cleanly **in the file I had read**. The defect was that the WHY quoted the review while the READ-FIRST named the ledger, and **the ledger paraphrases its own findings in caps**.',
  ' ➡️ **THEREFORE, ADD TO THE AUTHORING STEP: prove each key against the EXACT PATH the master names, not against wherever you first read the sentence.** I proved three keys and eyeballed the fourth — and it was the eyeballed one.',
  ' **GATE: none owed to the owner. Closes when the authoring skill’s citation clause says "prove the key against the path the master names"; until then this line is the reminder.**',
].join('');

lines.splice(i + 1, 0, row, '');
writeFileSync(p, lines.join('\n'));
console.log('F-1619-2 declared after line', i + 1);
