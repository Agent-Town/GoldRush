import fs from 'node:fs';

// --- 1. register the goal leaf (same commit as the master — Goal Registration Law) ---
const GP = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(GP, 'utf8'));
const sg = g.goals.find((x) => x.id === 'factory-infra').subgoals.find((x) => x.id === 'factory-truth');
if (!sg) throw new Error('factory-truth subgoal not found');
if (sg.tasks.some((t) => t.id === 'f1501-5-citation-quote-pairing')) throw new Error('leaf already exists');
sg.tasks.push({
  id: 'f1501-5-citation-quote-pairing',
  title:
    "F-1501-5: citation-title-guard's QUOTED regex pairs quote delimiters SEQUENTIALLY across a 400-char window with a global lastIndex, so a sub-12-char inline code span (a hash, a flag) between two quoted titles makes the scanner pair the code span's CLOSING delimiter with the next title's OPENING one — the real title never appears as a capture and the guard reports \"no recoverable test title\" about a title visibly present in the line it prints. Fails CLOSED, so it costs cycles rather than shipping defects. Fix the pairing (both scan loops, including the CARRIES-LINE fallback) and guard it with a manufactured-defect arm proved RED against the old behaviour. " +
    'CORRECTION FOLDED IN, MEASURED s1514: the finding\'s REC ("pair quotes by KIND") is right about the mechanism and WRONG as a prescription — swapped in and run against the live corpus it moves CARRIES-TITLE 205 -> 167 and NUMBER-ONLY 263 -> 304, i.e. it drops 38 citations whose titles the loose scanner does recover. A union arm (loose OR by-kind) measured 206/262 — a strict superset — and is carried in the master as a proven-safe floor rather than a required implementation. The master therefore makes corpus non-regression (CARRIES-TITLE >= 205, NUMBER-ONLY <= 263, citations == 511) a hard acceptance bar and forbids --update-baseline and any rewording of tasks/** to move a count.',
  status: 'queued',
  taskFile: 'lane-f1501-5-citation-quote-pairing.md',
  lane: 'lane-a',
  attempts: 0,
  authoredBy: 's1514 (fire)',
  authorNotes:
    'Authored s1514 after the f1510-3 negative-result drain (8134ec30). Premise RE-MEASURED, not inherited: the QUOTED line is present verbatim at scripts/citation-title-guard.mjs:66 and the mis-pairing was reproduced standalone on the window F-1501-5 describes (loose scanner captures " and is now titled " and never the title; by-kind captures both). The sibling apostrophe case F-1501-5 predicts was also reproduced. Then — per F-1514-1, filed the same fire — the proposed cure was run against the LIVE CORPUS before authoring, which is what caught the 38-citation regression. Citation key is scoped to the source file (grep -c "const TITLE_DECL = " scripts/citation-title-guard.mjs, measured 1 on main, 0 in BACKLOG) so neither this note nor the master can self-rot it.',
});
fs.writeFileSync(GP, JSON.stringify(g, null, 2) + '\n', 'utf8');

// --- 2. BACKLOG dispatch row ---
const BP = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(BP, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.startsWith('🟢 **F-1501-5 (s1501'));
if (idx === -1) throw new Error('F-1501-5 row not found');
const ROW =
  '📮 **F-1501-5 — MASTER AUTHORED s1514 → lane-a** (`tasks/lane-f1501-5-citation-quote-pairing.md`, leaf `f1501-5-citation-quote-pairing` registered in the same commit). ' +
  'Premise **RE-MEASURED by reading and running the guard this fire, not inherited**: the `QUOTED` line is present verbatim in `scripts/citation-title-guard.mjs` (one line below `const TITLE_DECL = `, which is the master\'s citation key at **1 on main**), and replaying the scanner standalone on the window F-1501-5 describes reproduces its four captures exactly — including the tell-tale `" and is now titled "` where the real title should be. The sibling apostrophe case the row *predicts* was reproduced too. ' +
  '🔍 **AND IT CORRECTS THE FINDING\'S OWN REC, WHICH IS THE WHOLE REASON THIS ROW IS WORTH READING.** F-1501-5 recommends *"pair quotes by KIND … rather than by any-quote-with-any-quote"*. In isolation that is correct — by-kind captures both titles where the loose scanner captures neither. **Run against the LIVE CORPUS it is a regression:** copying the guard and swapping only the `QUOTED` line moves **CARRIES-TITLE 205 → 167** and **NUMBER-ONLY 263 → 304** across a stable denominator of **511 citations scanned**. ' +
  '⚠️ **The prescribed cure for a guard that falsely reports one missing title would have made it falsely report 38 more.** A **union** arm (loose ∪ by-kind) measured **206 / 262 / 511** — a strict superset of today\'s behaviour, nothing lost — and the master carries it as a **proven-safe floor, not a required implementation**, inviting a cleaner non-destructive scan if the runner finds one. ' +
  '➡️ **Scope 2 is therefore a hard acceptance bar** (`CARRIES-TITLE ≥ 205`, `NUMBER-ONLY ≤ 263`, `citations == 511`), and the NO-list forbids the two ways to fake it: `--update-baseline` (the F-1506-2 laundering class) and rewording citations in `tasks/**` (measuring your own edit). A negative result is licensed if no formulation clears the bar — that would mean the window scan, not the regex, is the wrong abstraction, which is a better finding than a cure trading 38 false negatives for one fix. ' +
  '💡 **This correction exists because of [F-1514-1], filed the same fire and applied to the very next gate the fire picked up** — the cheap probe it recommends (run the proposed cure on the live corpus *before* authoring) paid for itself within the hour. **GATE unchanged.** Related: [F-1514-1], [F-1501-6], [F-1503-4].';
lines.splice(idx + 1, 0, '', ROW);
fs.writeFileSync(BP, lines.join('\n'), 'utf8');
console.log('leaf registered + dispatch row inserted at line', idx + 2);
