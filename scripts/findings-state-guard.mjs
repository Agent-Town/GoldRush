#!/usr/bin/env node
// findings-state-guard — a finding cannot be declared both open and closed.
//
// WHY
//   BACKLOG carried correct closure rows for F-1149-1/2 and F-1152-2/3 while
//   separate 🟡 rows still advertised the same work as open and fire-authorable.
//   A reader following the open rows would spend a lane re-fixing shipped work.
//
// WHAT IT CHECKS — AND DOES NOT
//   Only finding declarations at the start of tasks/BACKLOG.md lines count.
//   The 90-character subject zone is measured against real history: widening it
//   reaches prose citations and creates false state claims. A leading 🟡 row is
//   open unless struck; a leading ✅ row or struck 🟡 row is closed. This does
//   not decide whether either claim is true in code, or scan incidental F-IDs.
//   s1259 measured 🟡 as only 22 of 424 declaration rows (5%): zero here means
//   zero in that narrow vocabulary, not a clean ledger. Widening CLOSED needs
//   triage; widening OPEN can only add declarations and conflicts, so fails safe.
//
// USAGE
//   node scripts/findings-state-guard.mjs
//   node scripts/findings-state-guard.mjs --report
//   node scripts/findings-state-guard.mjs --root <dir>

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const REPORT = process.argv.includes('--report');
const SUBJECT_CHARS = 90;
export const FINDING = /\bF-\d+-\d+\b/g;

// Exported so a second guard can EXECUTE this closure rule rather than copy it.
// F-1261-1: a re-implementation of a ledger rule disagreed with the original on
// 4 of 14 rows. There is one implementation of "closed", and this is it.
// CLOSURE VOCABULARY — 'narrow' (default) vs 'wide'.
//   Narrow counts a closure only when ✅ leads the line. Measured s1291: the
//   ledger's commonest closure shape is the BULLET-led "- ✅ **F-x ...", and
//   narrow sees 1 of its 136 occurrences, leaving 56 F-IDs closed only by a row
//   the census cannot read. Wide additionally accepts that bullet-led form.
//   The DEFAULT IS DELIBERATELY UNCHANGED: this file's header warns that
//   widening needs triage, and every fire's reported census (151/125/26 at
//   s1291) is denominated in the narrow vocabulary. Callers opt in and say why.
//   Wide widens CLOSED ONLY, never open — see blocker-panel-closed-guard.mjs,
//   whose panel row is itself the open claim.
// OPEN VOCABULARY — 'narrow' (default) vs 'wide'.
//   Narrow is byte-identical to the historical 🟡-only reading. Wide also
//   accepts 🟠/🔬/🔴/🟢/🟣-led rows whose 90-character subject
//   explicitly says OPEN. The marker is only an admission gate: 🟢 also leads
//   RULING rows that are resolutions, so its marker alone cannot mean open. 🔺 desk
//   rows stay excluded because ownership routing is not finding state.
//   Wide OPEN is advisory only: like desk-state-audit.mjs and
//   attended-owed-audit.mjs, a printed backlog must not become a pre-merge red.
//   Reuse this file's exported scan() and FINDING for probes; emoji classes need
//   the `u` flag and broader ID patterns can silently exclude single-letter F-.
const BULLET_CLOSED = /^[-*•]\s*✅/;
const WIDE_OPEN_MARKERS = ['🟠', '🔬', '🔴', '🟢', '🟣'];

function rowState(subject, lead, wide, wideOpen) {
  const struck =
    /^[^A-Za-z0-9]*~~/.test(lead) ||
    /✅\s*(?:CLOSED|RETIRED)/i.test(subject) ||
    /struck s\d+/i.test(subject);
  const bulletClosed = wide && BULLET_CLOSED.test(lead);
  const markerOpen =
    lead.startsWith('🟡') ||
    (wideOpen && /\bOPEN\b/i.test(subject) && WIDE_OPEN_MARKERS.some((marker) => lead.startsWith(marker)));
  if (!markerOpen && !lead.startsWith('✅') && !struck && !bulletClosed) return null;
  return lead.startsWith('✅') || struck || bulletClosed ? 'closed' : 'open';
}

export function scan(text, { closedVocabulary = 'narrow', openVocabulary = 'narrow' } = {}) {
  const wide = closedVocabulary === 'wide';
  const wideOpen = openVocabulary === 'wide';
  const states = new Map();
  for (const [index, line] of text.split('\n').entries()) {
    const subject = line.slice(0, SUBJECT_CHARS);
    const lead = line.trimStart();
    const state = rowState(subject, lead, wide, wideOpen);
    if (!state) continue;
    const ids = new Set(subject.match(FINDING) || []);

    for (const id of ids) {
      if (!states.has(id)) states.set(id, { closed: [], open: [] });
      states.get(id)[state].push(index + 1);
    }
  }
  return states;
}

function census(states) {
  const closed = [...states.values()].filter((state) => state.closed.length);
  const open = [...states.values()].filter((state) => state.open.length);
  const conflicts = [...states.entries()]
    .filter(([, state]) => state.closed.length && state.open.length)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  return { closed, open, conflicts };
}

function print(states) {
  const { closed, open, conflicts } = census(states);
  console.log(`declared subjects : ${states.size}`);
  console.log(`declared closed   : ${closed.length}`);
  console.log(`declared open     : ${open.length}`);
  console.log(`double-state      : ${conflicts.length}`);
  for (const [id, lines] of conflicts) {
    console.log(`${id}  closed lines ${lines.closed.join(', ')}; open lines ${lines.open.join(', ')}`);
  }
  return conflicts;
}

function printOpenAdvisory(text, narrow, wide) {
  const skippedRows = text.split('\n').filter((line) => {
    const lead = line.trimStart();
    return (
      [...WIDE_OPEN_MARKERS, '⛔'].some((marker) => lead.startsWith(marker)) &&
      rowState(line.slice(0, SUBJECT_CHARS), lead, false, false) === null
    );
  }).length;
  const hiddenOpen = [...wide.entries()].filter(
    ([id, state]) => state.open.length && !narrow.get(id)?.open.length,
  );
  const closedOnly = hiddenOpen.filter(([id]) => {
    const state = narrow.get(id);
    return state?.closed.length && !state.open.length;
  });
  console.log(
    `wide-open advisory : ${skippedRows} skipped marker-led rows; ${hiddenOpen.length} F-IDs open only there; ${closedOnly.length} narrow closed-only`,
  );
}

function main() {
  const backlog = path.join(ROOT, 'tasks', 'BACKLOG.md');
  let text;
  try {
    text = fs.readFileSync(backlog, 'utf8');
  } catch (error) {
    console.error(`findings-state-guard: REFUSING — cannot read ${backlog}: ${error.message}`);
    process.exit(REPORT ? 0 : 2);
  }

  const narrow = scan(text);
  const wideOpen = scan(text, { openVocabulary: 'wide' });
  const conflicts = print(narrow);
  printOpenAdvisory(text, narrow, wideOpen);
  if (REPORT) process.exit(0);
  if (conflicts.length) {
    console.error('findings-state-guard: FAIL — a finding is declared both closed and open.');
    process.exit(1);
  }
  console.log('findings-state-guard: PASS');
}

// Run only when invoked directly; importing this module must have no side effects.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
