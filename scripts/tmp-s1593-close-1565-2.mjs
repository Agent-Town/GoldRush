import fs from 'node:fs';

const bp = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(bp, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('\u{1F7E1} **F-1565-2'));
if (i < 0) throw new Error('ANCHOR MISSING: F-1565-2 row');
if (lines[i].includes('CLOSED s1593')) throw new Error('REFUSE: already closed');
if (!lines[i].includes('GATE: none')) throw new Error('ANCHOR MISSING: trailing gate text');

const addition = [
  ' ✅ **CLOSED s1593 — BOTH HALVES WERE ALREADY DISCHARGED, AND THIS ROW WENT ON ADVERTISING A FREE AUTHORING SLOT.**',
  '✓ **Half 1 (SPLIT THE ASSERTIONS) — verified by READING THE MERGED DIFF, not the commit message:** `9bfecb997` moved the receipt and bark expectations to *below* the `[m4-06-denied] driftAbs=…` log line in `e2e/m4-06-embodiment.spec.ts`, under a comment naming this finding verbatim — *"F-1565-2: assertions follow the drift log so receipt or bark failures cannot suppress its sample."*',
  '✓ **Half 2 (REPRODUCE IN THE FIRE SHELL) — discharged s1572**, recorded in F-1571-1’s row as *"CLOSED s1572 — GATE SATISFIED IN BOTH HALVES BY THE SAME FIRE THAT MERGED THE PREREQUISITE"*: run in a genuine launchd-set `CLAUDE_CONFIG_DIR` shell (never exported by hand — the false-negative trap F-1571-1 exists to name), full spec rather than isolated, `--workers=1`, 11 separate invocations.',
  '⚠️ **WHY IT SURVIVED, which is the reusable part: BOTH closures were written into the rows of the findings that DID the work (F-1571-1, F-1572-1), and NEITHER was written back into the row that ASKED for it.** F-1571-1 even opens by quoting this row’s cure text — so the two rows sat in every reader’s field of view together and the parent still read `OPEN, FIRE-AUTHORABLE`.',
  '➡️ **A finding is closed by an edit to ITS OWN row; a closure recorded only in a child row is invisible to anyone scanning for authorable work.**',
  '\u{1F4A1} This is the F-1179-1 / F-1259-2 class that `/author-task` §0 fact 4 exists for, and it cost this fire real minutes of a dry-board audit — the same recurrence tax, one finding over. **See F-1593-3.**',
].join(' ');

lines[i] += addition;
fs.writeFileSync(bp, lines.join('\n'));
console.log('F-1565-2 closed at line', i + 1, '| +' + addition.length + ' chars');
