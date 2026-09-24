#!/usr/bin/env node
// blocker-panel-closed-guard — the dashboard may not show the owner a blocker
// row for a finding the ledger has already closed.
//
// WHY (F-1290-1, measured s1290)
//   Five rows the ledger had closed or the owner had already ruled were still
//   being drawn in the dashboard's blocker panel — one of them, F-1024-4, read
//   "blocked 8898 min / 6.2 days" while its fix was live in .claude/settings.json.
//   The owner read that panel on 2026-07-30, reasonably asked "how do we unblock
//   them?", and his question became an AUTHOR-NOW directive to re-do work that
//   had shipped five days earlier. A stale ledger line does not merely misinform:
//   it generates work, with the owner's signature on it.
//
//   The cause is structural, not clerical (scripts/dashboard-gen.sh): the panel
//   selects and excludes PER LINE, while this ledger records closure by APPENDING
//   A NEW LINE. A closure at :1461 can therefore never exclude its finding at
//   :1459 — a row is only ever cleared by editing the original line, which is
//   exactly what nobody remembers to do. s1290 struck those five in place, but a
//   strike is a snapshot; without this guard the rows regrow.
//
// WHAT IT CHECKS — AND DOES NOT
//   It EXECUTES both existing rules and re-implements neither (F-1261-1: a second
//   implementation of a ledger rule disagreed with the first on 4 of 14 rows).
//     · panel selection + display transform: extracted verbatim out of
//       scripts/dashboard-gen.sh and run through bash, so edits to the panel are
//       followed automatically and drift is impossible.
//     · closure state: scan() imported from scripts/findings-state-guard.mjs.
//   A row fails only when it carries an F-ID that census calls closed and NOT
//   open — a finding declared both ways is double-state, which is the other
//   guard's job, not this one's.
//   It does NOT decide whether either claim is true in code, and it cannot see a
//   stale row whose text names no F-ID. Zero here means no closed finding is on
//   the panel; it does not mean the panel is honest.
//
// USAGE
//   node scripts/blocker-panel-closed-guard.mjs
//   node scripts/blocker-panel-closed-guard.mjs --report   # never fails
//   node scripts/blocker-panel-closed-guard.mjs --root <dir>

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scan, FINDING } from './findings-state-guard.mjs';
import { BACKLOG_INDEX, backlogParts, corpusDeclaration } from './ledger-corpus.mjs';
import { subjectLedClosure } from './desk-state-audit.mjs';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const REPORT = process.argv.includes('--report');
// FINDING is IMPORTED, not redeclared (F-2228-1): this guard already reuses scan()
// for exactly the F-1261-1 reason, and the private copy it used to keep here was
// blind to 2 of the 33 rows the live panel shows the owner.

function refuse(message) {
  console.error(`blocker-panel-closed-guard: REFUSING — ${message}`);
  process.exit(REPORT ? 0 : 2);
}

// Pull the panel's own selection pipeline out of dashboard-gen.sh. Anchored on
// the GATE: marker rather than a line number, because coordinates rot.
function extractSelection(script) {
  const line = script
    .split('\n')
    .find((l) => l.startsWith('done < <(') && l.includes('GATE:'));
  if (!line) return null;
  return line.replace(/^done < <\(/, '').replace(/\)\s*$/, '');
}

// Pull the panel's own display transform (the `txt=$(echo "$line" | ...)` inside
// the blocked loop). This is what the owner actually reads, truncation included.
function extractTransform(script) {
  const line = script.split('\n').find((l) => /^\s*txt=\$\(echo "\$line" \|/.test(l));
  if (!line) return null;
  return line.replace(/^\s*txt=\$\(/, '').replace(/\)\s*$/, '');
}

function main() {
  const backlogPath = path.join(ROOT, 'tasks', 'BACKLOG.md');
  const dashboardPath = path.join(ROOT, 'scripts', 'dashboard-gen.sh');

  let backlog;
  let dashboard;
  let backlogCorpus = [];
  try {
  // ledger-shape-1 (owner ruling 2026-09-24, item 13a): the ledger is `tasks/BACKLOG.md` PLUS
  // `tasks/backlog/**`. Reading the index alone after the split narrows the closure census SILENTLY and
  // fails OPEN. Coordinates carry their own file so they still resolve (bare for the index,
  // `<rel>:<n>` for a split part); `scripts/ledger-corpus.mjs` is the one place that lists them.
    if (!fs.existsSync(backlogPath)) throw new Error(`cannot read ${backlogPath}`);
    const parts = backlogParts(ROOT);
    backlogCorpus = parts;
    backlog = parts.map((part) => part.text).join('\n');
    dashboard = fs.readFileSync(dashboardPath, 'utf8');
  } catch (error) {
    refuse(`cannot read inputs: ${error.message}`);
  }

  const selection = extractSelection(dashboard);
  if (!selection) {
    refuse(`no blocker-panel selection found in ${dashboardPath} — the panel moved, re-anchor this guard`);
  }
  const transform = extractTransform(dashboard);
  if (!transform) {
    refuse(`no blocker-panel display transform found in ${dashboardPath} — the panel moved, re-anchor this guard`);
  }

  let selected;
  try {
    selected = execFileSync('bash', ['-c', selection], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
      .split('\n')
      .filter((l) => l.trim().length);
  } catch (error) {
    // grep exits 1 on no matches: an empty panel, not a broken guard.
    if (error.status === 1 && !error.stderr?.trim()) selected = [];
    else refuse(`panel selection failed: ${error.message}`);
  }

  const display = (line) =>
    execFileSync('bash', ['-c', `line="$1"; ${transform}`, '_', line], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    }).trim();

  // Wide closure vocabulary, deliberately: measured s1291, the narrow default
  // sees 1 of the ledger's 136 bullet-led "- ✅" closure rows, and the row that
  // manufactured the owner's 07-30 directive (BACKLOG:1459, closed at :1461) was
  // invisible to it. Wide widens closed only — the panel row IS the open claim.
  // Scanned PER FILE and merged, so a closure coordinate still names a line a reader can open.
  const states = new Map();
  for (const part of backlogCorpus) {
    for (const [id, state] of scan(part.text, { closedVocabulary: 'wide' })) {
      if (!states.has(id)) states.set(id, { closed: [], open: [] });
      const label = (n) => (part.rel === BACKLOG_INDEX ? String(n) : `${part.rel}:${n}`);
      states.get(id).closed.push(...state.closed.map(label));
      states.get(id).open.push(...state.open.map(label));
    }
  }
  const violations = [];
  let rowsWithId = 0;
  for (const line of selected) {
    const shown = display(line);
    const ids = new Set(shown.match(FINDING) || []);
    if (ids.size) rowsWithId += 1;
    for (const id of ids) {
      const state = states.get(id);
      if (!state || !state.closed.length || state.open.length) continue;
      // SUBJECT-FIRST, not mere membership (F-2228-1). scan() attributes state to
      // EVERY id in a row's 90-char subject zone, so a row that merely CITES an id
      // inside its own subject lends it that row's state. Harmless while the id
      // pattern was blind to lettered ids; the moment it could see them, BACKLOG:974
      // — subject F-1543-1, ✅, reading "F-DOOR-3 DISCHARGED BY FOLDING" — declared
      // F-DOOR-3 closed. F-DOOR-3's OWN row (:987) is a live 🔺 whose tail says the
      // `respawns: true` view-flag half "stays OPEN and unassigned". Following this
      // guard's remedy on that false red would have STRUCK A GENUINELY OPEN ITEM off
      // the owner's panel — the exact inversion of what this guard is for.
      if (!subjectLedClosure(backlog, id).length) continue;
      violations.push({ id, shown, closedAt: state.closed });
    }
  }

  console.log(`ledger corpus     : ${corpusDeclaration(backlogCorpus.map((p) => p.rel))}`);
  console.log(`panel rows        : ${selected.length}`);
  console.log(`rows with an F-ID : ${rowsWithId}`);
  console.log(`census closed     : ${[...states.values()].filter((s) => s.closed.length).length}`);
  console.log(`closed-on-panel   : ${violations.length}`);
  for (const v of violations) {
    console.log(`${v.id}  closed at BACKLOG:${v.closedAt.join(', ')}`);
    console.log(`    panel row: ${v.shown}`);
  }

  // A DECLARATION IS ONLY AS GOOD AS ITS CONSUMER (F-2335-1, measured s2335).
  //
  // The three numbers above exist so a reader can tell "I checked and found
  // nothing" from "I checked nothing" — the F-2208-1 principle. Until s2335 the
  // gate read NONE of them: it branched on `violations.length` alone, and the
  // battery reads only rc. So `closed-on-panel: 0` was reported identically
  // whether every row was classified and came back clean, or no row was
  // classifiable at all and the loop body never ran.
  //
  // That is s2334's rung — a consumer that SELECTS subjects and DELEGATES their
  // classification cannot reach any refusal built into the child when the
  // classifiable set is empty. Here the child is scan()/subjectLedClosure() and
  // the emptiness arrives one step earlier, at display(): if the panel's own
  // transform or FINDING stops yielding ids, every row falls through `continue`.
  //
  // PROVEN BY MANUFACTURING (s2335), same board both arms, ground truth = one
  // closed finding on the panel: healthy transform -> rc=1, names it; the same
  // board with the panel's `cut -c1-100` narrowed past the id -> `PASS` rc=0.
  //
  // REFUSES ONLY ON THE UNAMBIGUOUS CASE, and the restraint is measured, not
  // stylistic (F-2218-1): an EMPTY panel is lawful — grep exits 1 on no matches
  // and this file's own catch calls that "an empty panel, not a broken guard" —
  // and a panel row naming no F-ID is lawful too, which this guard's header
  // states outright. Live board s2335: 33 rows, 32 with an id. So the test is
  // "rows selected and NOT ONE id readable", never a ratio and never a bare
  // zero; refusing on either of those would red on lawful boards and be excused
  // into uselessness inside a week (F-1460-1).
  //
  // 2 = "could not answer", never 1 = "answered, and the answer refuses" — the
  // convention drain-block-check, dry-board-probe and master-shipped-classifier
  // already carry. --report stays advisory (refuse() exits 0 there) because an
  // advisory reader must never block a drain by this guard's own blindness.
  if (selected.length && rowsWithId === 0) {
    refuse(
      `selected ${selected.length} panel row(s) and could not read an F-ID from ANY of them — ` +
        'the display transform or the id pattern stopped yielding ids, so "closed-on-panel: 0" says ' +
        'nothing was CLASSIFIED, not that nothing is closed. Re-anchor this guard against ' +
        `${dashboardPath}.`,
    );
  }

  if (REPORT) process.exit(0);
  if (violations.length) {
    console.error(
      'blocker-panel-closed-guard: FAIL — the blocker panel is showing the owner findings the ledger has closed.',
    );
    console.error(
      '  Fix by STRIKING THE ORIGINAL LINE in tasks/BACKLOG.md (retain the text — the Retention Law forbids deleting it).',
    );
    console.error('  Appending a closure line below it will NOT clear the panel; the panel excludes per line.');
    process.exit(1);
  }
  console.log('blocker-panel-closed-guard: PASS');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
