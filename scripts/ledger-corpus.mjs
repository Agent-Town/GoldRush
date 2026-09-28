#!/usr/bin/env node
// ledger-corpus.mjs — the ONE place that answers "which files hold the ledger?".
//
// WHY THIS EXISTS (owner ruling 2026-09-24, item 13 "(a)"; task ledger-shape-1).
// STATUS.md was 20.5 MB, 97% of it archived line-1 bullets in one file, and
// tasks/BACKLOG.md 9.2 MB. The rotation (scripts/status-rotate-month.mjs) moves closed
// months into `archive/status/<YYYY-MM>.md`; the split (scripts/backlog-split-closed.mjs)
// moves closed rows into `tasks/backlog/<key>.md`. Nothing is deleted — the Retention Law
// (CLAUDE.md §4.10b, owner 2026-07-25 "our history is our strength") allows COMPACTION of
// tracked files and forbids deleting history, so every byte stays tracked in this repo.
//
// THE DEFECT THIS FILE PREVENTS, measured before the move in
// docs/ledger-shape-reader-map-2026-09-24.md: a dozen readers do a single
// `readFileSync('tasks/BACKLOG.md')` and then answer a question about THE LEDGER. After a
// split each of them narrows SILENTLY and fails OPEN — row-quote-currency would probe 18
// of 69 open rows, ruling-propagation 82 of 129 RULED rows, stale-ready-for-gates 83 of
// 124 carriers — printing the same PASS over a corpus two thirds the size. Thirteen
// private copies of "where the ledger lives" is thirteen chances to widen twelve of them
// (F-1261-1: a re-implementation of a ledger rule disagreed with the original on 4 of 14
// rows). So there is one implementation, and this is it.
//
// COORDINATES ARE THE REASON THIS RETURNS PARTS AND NOT ONE STRING. Nine of the readers
// print a line number into a file a human then opens. Joining the corpus and numbering the
// join gives every one of them a coordinate that resolves to the wrong line in the wrong
// file — a Ghost Line (Mistake #5) minted by the cure. `backlogRows()` therefore carries
// each row's OWN file and its OWN 1-based line, plus `where`: the bare number for the
// index file (so today's output stays byte-identical) and `<rel>:<n>` for a split part.
//
// ORDER IS PART OF THE CONTRACT. The index comes first and the parts follow in sorted
// order, so any reader that takes "the first row wins" (desk-declaration-guard's rule)
// keeps reading the live index before the archives. Status archives are newest month
// first for the same reason.
//
// ⚠️ EMPTY IS LAWFUL AND IS NOT AN ERROR. Until the drain executes the move on main both
// directories are absent; every function below returns the index alone and every reader
// must be indifferent to that. That indifference is what `npm run test:node-guards` on the
// ledger-shape-1 branch proves.

import fs from 'node:fs';
import path from 'node:path';

/** The live index — the file that keeps every OPEN, desk, gate, RULED and `^OWNER:` row. */
export const BACKLOG_INDEX = 'tasks/BACKLOG.md';
/** Where `backlog-split-closed.mjs` writes the closed rows. A SUBDIRECTORY, never a flat
 *  sibling: `master-shipped-classifier.mjs` and `task-guard-audit.mjs` both list `tasks/`
 *  with `.filter(f => f.endsWith('.md') && f !== 'BACKLOG.md')`, so a flat
 *  `tasks/BACKLOG-2026-07.md` would read as a phantom unqueued master in both, while the
 *  directory entry `backlog` fails `.endsWith('.md')` and is invisible to them. */
export const BACKLOG_DIR = 'tasks/backlog';
/** The live board — line 1, the blank line, the 18 `s9<letter>` law bullets, the current
 *  month and the trailing window of archive bullets. */
export const STATUS_HEAD = 'STATUS.md';
/** Where `status-rotate-month.mjs` writes closed months. Outside `<root>/*.md`,
 *  `scripts/*.md` and `.claude/skills/<name>/SKILL.md` on purpose: those are
 *  `law-pointer-guard.mjs`'s three scan families, and a root-level `STATUS-2026-07.md`
 *  would surface there as a law-surface-shaped file with ~1,300 citations and
 *  `reason: NONE DECLARED`. */
export const STATUS_ARCHIVE_DIR = 'archive/status';

/** `.md` files directly inside `dir`, sorted, as repo-relative paths. Missing or
 *  unreadable directories yield `[]` — see the "EMPTY IS LAWFUL" note in the header. */
function mdFilesIn(root, dir) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `${dir}/${entry.name}`)
    .sort();
}

/**
 * Every file that holds a BACKLOG row, index first.
 *
 * Named in tasks/ledger-shape-1.md §3 as one of this module's two required exports.
 */
export function backlogFiles(root = process.cwd()) {
  return [BACKLOG_INDEX, ...mdFilesIn(root, BACKLOG_DIR)];
}

/**
 * Every file that holds an archived STATUS line-1 bullet, NEWEST MONTH FIRST.
 *
 * File names are `<YYYY-MM>.md`, so a reverse lexicographic sort is a reverse
 * chronological sort — true for as long as the year is four digits, which outlives this
 * repo. `desk-carryforward-guard.previousDesk()` takes the highest session number and does
 * not depend on the order; the order is for humans and for any future reader that stops at
 * the first hit.
 *
 * Named in tasks/ledger-shape-1.md §3 as one of this module's two required exports.
 */
export function statusArchiveFiles(root = process.cwd()) {
  return mdFilesIn(root, STATUS_ARCHIVE_DIR).reverse();
}

/** Read a list of repo-relative paths into `{ rel, abs, text }`, skipping the unreadable.
 *  A part that cannot be read is SKIPPED rather than thrown: a reader that refuses because
 *  one archive file is mid-write turns a compaction into an outage, and the index — the
 *  one file whose absence IS an error — is checked by its own reader, as it always was. */
function partsOf(root, rels) {
  const parts = [];
  for (const rel of rels) {
    const abs = path.join(root, rel);
    try {
      parts.push({ rel, abs, text: fs.readFileSync(abs, 'utf8') });
    } catch {
      /* see the note above */
    }
  }
  return parts;
}

/** `{ rel, abs, text }` for every BACKLOG file, index first. */
export function backlogParts(root = process.cwd()) {
  return partsOf(root, backlogFiles(root));
}

/** `{ rel, abs, text }` for `STATUS.md` followed by every archive month, newest first. */
export function statusParts(root = process.cwd()) {
  return partsOf(root, [STATUS_HEAD, ...statusArchiveFiles(root)]);
}

/** The whole BACKLOG corpus as one string — for CONTAINMENT and COUNTING only.
 *  Do not number the lines of this: use `backlogRows()`, which keeps each row's own file
 *  and line (see the COORDINATES note in the header). */
export function backlogText(root = process.cwd()) {
  return backlogParts(root).map((part) => part.text).join('\n');
}

/** The whole STATUS corpus (board + archives) as one string, for containment tests. */
export function statusText(root = process.cwd()) {
  return statusParts(root).map((part) => part.text).join('\n');
}

/**
 * Every BACKLOG row with the coordinate a human can open.
 *
 * `{ rel, n, line, where }` — `n` is 1-based WITHIN `rel`; `where` is the bare number for
 * `tasks/BACKLOG.md` (so a widened reader's output stays byte-identical on today's board)
 * and `<rel>:<n>` for a split part.
 */
export function backlogRows(root = process.cwd()) {
  const rows = [];
  for (const part of backlogParts(root)) {
    const lines = part.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      rows.push({
        rel: part.rel,
        n: i + 1,
        line: lines[i],
        where: part.rel === BACKLOG_INDEX ? String(i + 1) : `${part.rel}:${i + 1}`,
      });
    }
  }
  return rows;
}

/** One line naming the corpus a run actually read, for readers that declare their scope.
 *  Printed on the happy path too: a declaration that appears only on failure re-creates
 *  the ambiguity it removes (F-2208-1). */
export function corpusDeclaration(files) {
  const parts = files.slice(1);
  return parts.length === 0
    ? `${files[0]} (no split parts on this tree)`
    : `${files[0]} + ${parts.length} part(s): ${parts.join(', ')}`;
}
