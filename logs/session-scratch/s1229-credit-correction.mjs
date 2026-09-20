// s1229 self-correction. I presented the functions/-is-ungated gap as a new
// finding. It is not: F-1087-1 named it (s1087, re-verified s1089 by reading
// tsconfig.json) and it sat UNCURED for ~3 days. I failed my own standing rule
// -- grep the ledger before authoring a defect -- and found it only when a
// recalled memory matched. F-1229-1 is the CURE and the mutation proof, not the
// discovery. Patching both the ledger entry and the handoff to say so.
import fs from 'node:fs';

const CREDIT =
  '⚠️ **CREDIT CORRECTION, WRITTEN BY THE FIRE THAT GOT IT WRONG: THIS GAP IS NOT NEW AND I SHOULD NOT HAVE PRESENTED IT AS MINE.** ' +
  '**F-1087-1 named it at s1087 and re-verified it at s1089** by reading `tsconfig.json` — *"nothing in this repo typechecks `functions/`"* — and it has sat **uncured for ~3 days and ~140 sessions of session-number**. ' +
  'I re-derived it independently and only caught the prior art afterwards, which means **I skipped my own standing rule: grep the ledger before authoring a defect.** ' +
  'So the honest split is: **F-1087-1 owns the DISCOVERY; F-1229-1 owns the MUTATION PROOF and the MECHANISM.** ' +
  "The proof was the part that had been missing — F-1087-1 recorded the gap as a *config reading*, and a config reading is an argument, which is exactly the kind of finding that gets restated and deferred (see F-1228-1's four handoffs). A planted defect that survives the whole battery is not an argument. ";

function patch(file, anchor, insert) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('CREDIT CORRECTION')) throw new Error(`already patched: ${file}`);
  const i = s.indexOf(anchor);
  if (i === -1) throw new Error(`anchor not found in ${file}`);
  s = `${s.slice(0, i)}${insert}${s.slice(i)}`;
  fs.writeFileSync(file, s);
  console.log('patched', file);
}

// Ledger: insert the correction immediately before the mutation paragraph.
patch('tasks/BACKLOG.md', '🧪 **PROVEN BY MUTATION, BECAUSE AN ARGUMENT WOULD NOT HAVE BEEN ENOUGH.**', CREDIT);

// Handoff line-1: insert before the same beat.
patch('STATUS.md', '🧪 **(C) PROVEN BY MUTATION, BECAUSE THE ARGUMENT ALONE WOULD NOT HAVE EARNED IT.**', CREDIT);
