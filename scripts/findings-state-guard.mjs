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
import { BACKLOG_INDEX, backlogParts, corpusDeclaration } from './ledger-corpus.mjs';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const REPORT = process.argv.includes('--report');
const SUBJECT_CHARS = 90;
// THE F-ID PATTERN — one implementation, for the same F-1261-1 reason scan() is
// shared below. F-2228-1 measured SEVEN live copies in THREE variants, and both
// populations were wrong, in OPPOSITE directions:
//   · the four ledger guards read /\bF-\d+-\d+\b/ and are structurally BLIND to
//     every lettered id (F-DOOR-6, F-E2S-4, F-ASSAY-E2E-9 ...) — 23 state-declaring
//     subjects here and 2 of 33 live blocker-panel rows. A guard that cannot SEE a
//     row can never red on it, so the blindness is in the PERMISSIVE direction.
//   · the three desk guards read /F-(?:[A-Z0-9]{1,8}-)+\d+/ with NO trailing \b, so
//     they match INSIDE a longer token: "F-1419-2s CURE" yields F-1419-2. Adopting
//     that copy verbatim manufactures a double-state conflict (closed 1388 / open
//     1396) and REDS this gate falsely.
// So "import the sibling" (F-2227-1's rule) was not enough here — the sibling was
// itself defective. Correct needs BOTH halves: alphanumeric segments AND \b at each
// end. Measured on the live ledger: 543 subjects (was 520), 0 conflicts (unchanged).
// Safe to share despite the /g flag because every consumer uses String#match, which
// ignores and resets lastIndex; a consumer wanting #test or #exec must clone it.
export const FINDING = /\bF-(?:[A-Z0-9]{1,8}-)+\d+\b/g;

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

// EXPORTED for the same F-1261-1 reason scan() is: `scripts/backlog-split-closed.mjs` must
// decide "is this row closed?" to know whether it may move, and a second implementation of that
// question is exactly the defect this file's header warns about. The function is unchanged —
// only the `export` keyword was added (ledger-shape-1, 2026-09-25).
export function rowState(subject, lead, wide, wideOpen) {
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

function print(states, parts = null) {
  const { closed, open, conflicts } = census(states);
  // Printed ALWAYS, including the happy path: a census whose corpus is invisible cannot be
  // re-judged (F-2208-1). It is the difference between "543 subjects across the whole ledger"
  // and "543 subjects in the file I happened to open".
  if (parts) console.log(`ledger corpus     : ${corpusDeclaration(parts.map((part) => part.rel))}`);
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

/**
 * Merge per-file scans into one census whose coordinates still resolve.
 *
 * ledger-shape-1 (owner ruling 2026-09-24, item 13a) split the closed rows into
 * `tasks/backlog/**`, and this guard's whole job is to notice a finding declared closed in one
 * place and open in another — the exact pair a split can put in two files. Scanning the index
 * alone would narrow the census SILENTLY and fail OPEN. Joining the files and numbering the join
 * would be worse: every conflict would print a line number that resolves to the wrong row in the
 * wrong file, which is a Ghost Line (Mistake #5) minted by the cure. So each file is scanned on
 * its own and the coordinates carry their file — bare for `tasks/BACKLOG.md`, so today's output
 * is byte-identical, and `<rel>:<n>` for a split part.
 */
function scanCorpus(parts, options) {
  const merged = new Map();
  for (const part of parts) {
    for (const [id, state] of scan(part.text, options)) {
      if (!merged.has(id)) merged.set(id, { closed: [], open: [] });
      const into = merged.get(id);
      const label = (n) => (part.rel === BACKLOG_INDEX ? String(n) : `${part.rel}:${n}`);
      for (const n of state.closed) into.closed.push(label(n));
      for (const n of state.open) into.open.push(label(n));
    }
  }
  return merged;
}

function main() {
  const backlog = path.join(ROOT, 'tasks', 'BACKLOG.md');
  let parts;
  try {
    if (!fs.existsSync(backlog)) throw new Error('no such file');
    parts = backlogParts(ROOT);
  } catch (error) {
    console.error(`findings-state-guard: REFUSING — cannot read ${backlog}: ${error.message}`);
    process.exit(REPORT ? 0 : 2);
  }
  const text = parts.map((part) => part.text).join('\n');

  const narrow = scanCorpus(parts);
  const wideOpen = scanCorpus(parts, { openVocabulary: 'wide' });
  const conflicts = print(narrow, parts);
  printOpenAdvisory(text, narrow, wideOpen);
  if (REPORT) process.exit(0);
  if (conflicts.length) {
    console.error('findings-state-guard: FAIL — a finding is declared both closed and open.');
    process.exit(1);
  }
  console.log('findings-state-guard: PASS');
}

// Run only when invoked directly; importing this module must have no side effects.
if (isMain(import.meta.url)) {
  main();
}

/**
 * A VERBATIM COPY of isMain from ./is-main.mjs (F-SF1-2, is-main-2), not an import: a guard fixture
 * relocates this file as a DEPENDENCY with a fixed sibling list. backlog-split-closed.test.mjs
 * copies DEPS (ledger-corpus.mjs and this file) into a bare scratch scripts/ beside a variant of
 * backlog-split-closed.mjs, where a relative import of is-main.mjs dies ERR_MODULE_NOT_FOUND
 * (measured: its manufactured-defect arm reds with the import applied). scripts/is-main.test.mjs
 * asserts this copy still matches the original byte for byte; change them together.
 */
function isMain(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry || !importMetaUrl) return false;
  try {
    return fs.realpathSync(entry) === fs.realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
