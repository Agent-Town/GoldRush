#!/usr/bin/env node
// s2681 probe — how big is the findings-state-guard vocabulary hole?
//
// The guard admits a row only through rowState(): 🟡-led (or a wide marker plus
// the word OPEN) means open; ✅-led, struck, or bullet-✅ means closed. Rows that
// declare their state in PROSE behind some other emoji ("🧰 F-X — OPEN,
// fire-authorable" / "🧰🛠️ F-X — CURED s2677") are invisible to it entirely.
//
// This probe counts the rows the guard cannot see, and the F-IDs that carry BOTH
// a prose-open and a prose-closed row — the live Ghost Line population.
//
// It REUSES the guard's exported rowState() and FINDING (F-1261-1: a second
// implementation of a ledger rule disagreed with the original on 4 of 14 rows).
import { rowState, FINDING } from '../../scripts/findings-state-guard.mjs';
import { backlogParts } from '../../scripts/ledger-corpus.mjs';

const SUBJECT_CHARS = 90; // the guard's own subject zone
const PROSE_OPEN = /\bOPEN\b/;
const PROSE_CLOSED = /\b(?:CURED|SHIPPED|LANDED|CLOSED|RETIRED)\b/;

const parts = backlogParts();
const states = new Map();
let invisibleRows = 0;
let visibleRows = 0;

for (const part of parts) {
  for (const [index, line] of part.text.split('\n').entries()) {
    const subject = line.slice(0, SUBJECT_CHARS);
    const lead = line.trimStart();
    // Does the GUARD see this row (in its most permissive setting)?
    const seen = rowState(subject, lead, true, true);
    const ids = new Set(subject.match(FINDING) || []);
    if (!ids.size) continue;

    const proseOpen = PROSE_OPEN.test(subject);
    const proseClosed = PROSE_CLOSED.test(subject);
    if (!proseOpen && !proseClosed) continue;

    if (seen) { visibleRows += 1; continue; }
    invisibleRows += 1;

    for (const id of ids) {
      if (!states.has(id)) states.set(id, { open: [], closed: [] });
      const where = `${part.rel}:${index + 1}`;
      if (proseOpen) states.get(id).open.push(where);
      if (proseClosed) states.get(id).closed.push(where);
    }
  }
}

const conflicts = [...states.entries()]
  .filter(([, s]) => s.open.length && s.closed.length)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

console.log(`corpus parts              : ${parts.length}`);
console.log(`state-declaring rows the guard DOES see : ${visibleRows}`);
console.log(`state-declaring rows INVISIBLE to it    : ${invisibleRows}`);
console.log(`F-IDs with a prose state claim          : ${states.size}`);
console.log(`F-IDs BOTH prose-open and prose-closed  : ${conflicts.length}`);
console.log('');
for (const [id, s] of conflicts) {
  console.log(`${id}`);
  console.log(`   open  : ${s.open.join(', ')}`);
  console.log(`   closed: ${s.closed.join(', ')}`);
}
