import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const L = fs.readFileSync(p, 'utf8').split('\n');

// Insert directly after the F-1634-3 row so the s1634 findings sit together.
const idx = L.findIndex((l) => l.startsWith('- 🟢 **[F-1634-3]'));
if (idx < 0) throw new Error('F-1634-3 row not found');

const row = [
  '- 🟢 **[F-1634-4] MY OWN MERGE ROTTED A NEIGHBOURING ROW\'S CITATION, AND ONLY THE POST-BOOKKEEPING GUARD RUN COULD SEE IT (measured s1634, CURED IN THE SAME COMMIT).**',
  'Landing f1631-1 added **+33 lines** to `e2e/asset-diet.spec.ts`, which shifted the code under a citation in the *retired* F-1627-1 row — `e2e/asset-diet.spec.ts:431–432`, written s1627.',
  'Pre-merge, `:431` was `await normalArm.context.close();` inside a test; post-merge it lands in an unrelated markdown-table literal, so `test:citations` could no longer recover a test title and **`test:ledger-guards` went rc=1 on a tree whose code was green**.',
  '✅ **PROVEN BY CONTROL, not inferred:** the same guard run in a detached worktree at the pre-merge commit `c1acdea37` exits **0**, against **1** post-merge — with **609 citations scanned on both sides**, so nothing was added; the code simply moved beneath an existing pointer.',
  '🔑 **This is the F-1300-4 shape with a wider denominator than "your own rows": the subject a fire mutates late is not only its ledger rows and law surfaces but ANY CODE FILE ITS MERGE SHIFTS — and every stale coordinate anywhere in `tasks/**` that points into that file is a candidate red.**',
  'A drain therefore cannot conclude from a green code battery that the board is green; the citation guard must run **after** the merge, which is exactly what the F-1300-4 law already orders and why it caught this.',
  '⚠️ **The trap for the next fire: this red accuses a row that is already ✅ RETIRED and whose defect was cured two fires ago, so it reads as someone else\'s stale bookkeeping rather than as a consequence of the merge you just made.**',
  'Cured the way the guard itself prescribes — the citation now carries its **test title** (`"town byte budget reports normal and saveData arms by URL"`) plus a note that the coordinates are s1627-era and the surviving assertion now sits at `:465`.',
  '`test:citations` CARRIES-TITLE **297 → 298**, NUMBER-ONLY **261 → 260**, exit **0**. Merge: `7f9340baf056e228bae8c1ca11c2d836e38a2a26`.',
].join(' ');

L.splice(idx + 1, 0, row);
fs.writeFileSync(p, L.join('\n'));
console.log('F-1634-4 inserted at line', idx + 2, '; total lines', L.length);
