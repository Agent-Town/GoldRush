import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');

const f1 = [
  '🟡 **F-1596-1** (s1596 2026-08-09, OPEN, NON-BLOCKING, FIRE-AUTHORABLE — AN OWNER RULING’S ONLY TEST IS HOUSED UNDER A TITLE THAT DOES NOT NAME IT).',
  'Found at the `team-and-training` drain (merged `f18879c9ee1bbc1f79439d48cec9b45b4798152d`).',
  '✓ **THE COVERAGE IS REAL AND WAS READ, NOT ASSUMED:** `e2e/field-book.spec.ts:67` asserts the drill-yard POST returns `400`, the exact `training_ground` error and the house-voice message, that **KV is not written** (`standings:epoch-1-frontier:e1-drill-yard` is null), **and** that the GET path refuses too — both halves of the ruling, green desktop+390px.',
  '⚠️ **THE DEFECT IS WHERE IT LIVES, NOT WHETHER IT WORKS.** Those assertions are appended to an existing test titled *"optional cost fields group the best score by model and never change county ranking"* — a title about something else entirely.',
  'So the only test defending an **owner ruling** ("the Drill Yard is not a contract that needs a ladder") is **invisible to a grep for "drill yard" among test names**, and would be deleted silently along with its host if the cost-field test is ever retired.',
  '💡 *Reusable shape: coverage inherits the discoverability of its CONTAINER, not of its assertions. A test title is the only index anyone searches; assertions buried under an unrelated title are protected by nothing but the memory of whoever wrote them.*',
  '➡️ **CURE: split the drill-yard assertions into their own `test(...)` naming the Drill Yard and the refusal.** One-line split, spec file only, no production code.',
  '**GATE: none — fold into the next task that opens `e2e/field-book.spec.ts` rather than spending a lane run on it** (s1596 deliberately authored no corrective: the dispatch cost exceeds the fix).',
].join(' ');

const f2 = [
  '🟢 **F-1596-2** (s1596 2026-08-09, CURED THIS FIRE — A DRAIN’S OWN MERGE CAN ROT A CITATION IN ITS OWN MASTER, AND ONLY THE POST-BOOKKEEPING BATTERY SEES IT).',
  'Non-blocking, cured in `cdef3885e`.',
  '⚙️ **WHAT HAPPENED:** `tasks/lane-team-and-training.md` cited `e2e/milk-county-board.spec.ts:466` **twice, bare** — and the slice it dispatched **edits that very file**, rewriting the labels asserted on that line. `test:citations` went **FAIL — 1 citation cites a line with no recoverable test title**.',
  '✓ **CURED the way the guard prescribes, additively (Retention Law):** the enclosing test title *"plain boot: posse chips rank within size, the field book counts hands, and a row watches its run"* is now quoted beside both citations; original wording untouched. Post-fix `NUMBER-ONLY 261→259`, `CARRIES-TITLE 255→257`, PASS.',
  '🔑 **WHY THIS IS A CLASS AND NOT A TYPO:** a master’s citations point at the code the master is about to CHANGE. The coordinate is therefore **guaranteed** to be at risk from its own slice — this is [[your-own-cure-rots-the-coordinates-its-evidence-cites]] with the shortest possible fuse, author to rot inside one fire.',
  '⚠️ **AND IT WAS INVISIBLE UNTIL THE LAST POSSIBLE MOMENT:** the master was authored attended-side at `7a564d8ad` and the drain gate ran on the MERGED TREE before the ledger commit — exactly the F-1300-4 blind spot. **The drain battery could not have caught it; only `test:ledger-guards` run AFTER the bookkeeping did.**',
  '💡 *Reusable: when authoring a master, prefer citing a spec by TEST TITLE rather than by line — the line is the thing your own slice is about to move.*',
  '**GATE: none — closed by the patch.**',
].join(' ');

lines.splice(1, 0, '', f1, '', f2);
writeFileSync(p, lines.join('\n'));
console.log('two rows inserted at the top');
