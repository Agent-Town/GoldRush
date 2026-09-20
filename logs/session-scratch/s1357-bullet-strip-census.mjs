// s1357 probe (read-only) — re-derive F-1336-5's blast-radius numbers on the
// CURRENT ledger, and name every double-state the bullet-strip cure would create.
// Does NOT modify findings-state-guard.mjs; it re-implements the ONE variation
// the finding proposes (strip a leading list bullet before the marker test) and
// otherwise calls the guard's own exported scan() for the narrow baseline.
import fs from 'node:fs';
import { scan } from '../../scripts/findings-state-guard.mjs';

const SUBJECT_CHARS = 90;
const FINDING = /\bF-\d+-\d+\b/g;
const BULLET = /^[-*•]\s*/;

function scanStripped(text) {
  const states = new Map();
  for (const [index, line] of text.split('\n').entries()) {
    const subject = line.slice(0, SUBJECT_CHARS);
    const lead = line.trimStart().replace(BULLET, '');
    const struck =
      /^[^A-Za-z0-9]*~~/.test(lead) ||
      /✅\s*(?:CLOSED|RETIRED)/i.test(subject) ||
      /struck s\d+/i.test(subject);
    if (!lead.startsWith('🟡') && !lead.startsWith('✅') && !struck) continue;
    const state = lead.startsWith('✅') || struck ? 'closed' : 'open';
    for (const id of new Set(subject.match(FINDING) || [])) {
      if (!states.has(id)) states.set(id, { closed: [], open: [] });
      states.get(id)[state].push(index + 1);
    }
  }
  return states;
}

function census(states) {
  const closed = [...states.values()].filter((s) => s.closed.length).length;
  const open = [...states.values()].filter((s) => s.open.length).length;
  const conflicts = [...states.entries()].filter(([, s]) => s.closed.length && s.open.length);
  return { subjects: states.size, closed, open, conflicts };
}

const text = fs.readFileSync(new URL('../../tasks/BACKLOG.md', import.meta.url), 'utf8');
for (const [label, states] of [['NARROW (live guard)', scan(text)], ['BULLET-STRIPPED (the cure)', scanStripped(text)]]) {
  const c = census(states);
  console.log(`${label}: subjects ${c.subjects}  closed ${c.closed}  open ${c.open}  double-state ${c.conflicts.length}`);
  for (const [id, s] of c.conflicts) console.log(`    ${id}  closed@${s.closed.join(',')}  open@${s.open.join(',')}`);
}
