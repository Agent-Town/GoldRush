#!/usr/bin/env node
// status-rotate-month.mjs — move STATUS.md's CLOSED-MONTH line-1 archive bullets into
// `archive/status/<YYYY-MM>.md`, every byte kept, and refuse if the bytes do not balance.
//
// WHY (owner ruling 2026-09-24, item 13 "(a)", verbatim from docs/OWNER-DECISIONS-2026-09-24.md:
// "STATUS.md is 20.5 MB, 97% of it archived line-1s in one file ... Nothing is deleted under
// the law, but the shape makes them unreadable." Option (a): "Rotate old line-1s into dated
// archive files ... every byte kept, in git and in the archives.")
//
// 🚫 THIS IS A MOVE, NEVER A PRUNE. The Retention Law (CLAUDE.md §4.10b, owner 2026-07-25:
// "We have to stop the pruning, our history is our strength") permits COMPACTION of TRACKED
// files — git keeps every version — and forbids deleting history. Every bullet this tool
// removes from STATUS.md is written into a tracked file in the same tree in the same run, and
// the balance check below REFUSES rather than writes if one byte cannot be accounted for.
//
// USAGE
//   node scripts/status-rotate-month.mjs --dry-run [--root <dir>] [--window N] [--month YYYY-MM]
//   node scripts/status-rotate-month.mjs --apply   [--root <dir>] [--window N] [--month YYYY-MM]
//
// WHAT STAYS ON THE BOARD, and why each one is named rather than inferred:
//   · line 1 and the blank line under it — the lock surface. `head -1 STATUS.md` is read by
//     fire-runner.sh, health-watch.sh, dashboard-gen.sh, lane-runner-v3.sh and five guards.
//   · the 18 `s9<letter>` law bullets — live law. law-pointer-guard.mjs's NOT_SCANNED entry
//     for STATUS.md says so in its reason string; moving them would make that reason false.
//   · every bullet of the CURRENT month.
//   · a TRAILING WINDOW of the newest WINDOW bullets (default 40, ~0.6 MB) whatever their
//     month. This is not tidiness: desk-carryforward-guard.previousDesk() scans STATUS.md for
//     `- **s<N> handoff (line-1 archive)` and `process.exit(2)`s with "REFUSING — no previous
//     handoff desk could be read" when it finds none. On the first fire of a new month the
//     current-month set is EMPTY, so without the window the guard would refuse on a board that
//     is perfectly healthy. The window makes that state unreachable; the archives fallback in
//     desk-carryforward-guard is the belt to this brace.
//   · anything this tool cannot date — see UNSTAMPED below.
//
// UNSTAMPED BULLETS ARE DATED BY THEIR NEIGHBOURS, NEVER BY A GUESS. 247 of the 3,314 bullets
// on the live board carry no `YYYY-MM-DD` in their stamp zone (label + the first 60 chars of
// the body): `- **s1921 handoff (line-1 archive):**` with an empty body, s1234's "superseded by
// the s1235 lock at 01:46", the 2026-07 lines written `2026-07-06T08:27+0700`. Every one of them
// carries an `s<N>`, and session numbers are monotonic in time, so the month comes from the
// nearest stamped session — a MEASUREMENT of its neighbours, not a date invented for it. A
// bullet whose month cannot be resolved that way STAYS ON THE BOARD: an unplaceable line is
// never moved on a guess (CLAUDE.md §7.1 — "still unknown: say UNVERIFIED", and an UNVERIFIED
// line does not get filed under a month).
//
// ⚠️ DO NOT READ THE FIRST DATE IN THE LINE. Bullets quote dates in their prose constantly
// ("the owner ruled 2026-07-25", "s1033 removed the three prunes on 2026-07-24"), so a
// whole-line date scan files a September handoff under July. The stamp zone is the label and
// the head of the body, which is where `status-line1.mjs` writes the stamp and where every
// handoff shape this repo has used puts it ("Last updated: <stamp>", "ACTIVE <stamp>").

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { STATUS_HEAD, STATUS_ARCHIVE_DIR, statusArchiveFiles } from './ledger-corpus.mjs';

const DEFAULT_WINDOW = 40;

/** A line-1 archive bullet. Captures the LABEL (`s2674 lock`, `attended handoff 2026-09-24T07:20Z`).
 *  The closing paren is deliberately NOT required: real bullets carry
 *  `(line-1 archive, RESTORED s2674 from ...)` and `(line-1 archive addendum)`. */
const ARCHIVE_BULLET = /^- \*\*(.+?) \(line-1 archive/;
/** The live law bullets. `s9au`, `s9at`, ... — a session number followed by LETTERS, which is
 *  what law-pointer-guard.mjs uses to split live law from frozen handoff archives. */
const LAW_BULLET = /^- \*\*s\d+[a-z]+\s/;
/** `(?<!\d)`/`(?!\d)` rather than `\b`: in `2026-09-25T00:50Z` the character after the day is
 *  `T`, a word character, so a trailing `\b` never matches and every ISO stamp reads UNDATED. */
const DATE = /(?<!\d)(\d{4})-(\d{2})-\d{2}(?!\d)/;
const SESSION = /^- \*\*s(\d+)\b/;
/** The BODY form: at most `Last updated: ` and/or `ACTIVE ` before the date, and nothing else.
 *  Anchored on purpose — see the note on `stampMonth` below. */
const HEAD_STAMP = /^[\s*]*(?:Last updated:\s*)?(?:ACTIVE\s*)?(?:Last updated:\s*)?(\d{4})-(\d{2})-\d{2}(?!\d)/;
// 60, MEASURED, NOT CHOSEN FOR ROUNDNESS. The stamp sits at the HEAD of the body in every
// shape this board has used: offset 0 (`2026-07-06T07:56+07:00 s53 handoff`), 7 (`ACTIVE <stamp>`),
// 14 (`Last updated: <stamp>`), 21 (`Last updated: ACTIVE <stamp>`). A wider zone reaches PROSE,
// and prose quotes dates constantly — at 200 a real s2101-shaped bullet whose body opens "THE
// OWNER RULED ON 2026-07-25" was filed under July while its neighbours put it in August. Caught
// by this tool's own test before it ever ran on the board.
const STAMP_ZONE_CHARS = 60;

export function labelOf(line) {
  const match = line.match(ARCHIVE_BULLET);
  return match ? match[1] : null;
}

/**
 * The month a bullet belongs to, read from its stamp zone, or null.
 *
 * TWO ZONES, TWO RULES, and the asymmetry is the whole point.
 *   · THE LABEL (`s2674 lock`, `attended handoff 2026-09-24T07:20Z`) is written by
 *     `status-line1.mjs` and is short and controlled, so a date ANYWHERE in it is the stamp.
 *   · THE BODY is the previous line 1 verbatim — prose, and prose quotes dates constantly. So
 *     the body's date must sit at its HEAD, behind at most the two prefixes this board has ever
 *     used (`Last updated: ` and `ACTIVE `, in either order, both optional). A free search of
 *     even the first 60 characters is too loose: a real bullet opening "THE OWNER RULED ON
 *     2026-07-25 THAT PRUNING STOPS" reads as July when its session number puts it in August.
 *     Caught by this tool's own test before it ever ran on the board, which is why the anchored
 *     form is here and not a wider window.
 */
export function stampMonth(line) {
  const label = labelOf(line);
  if (label === null) return null;
  const inLabel = label.match(DATE);
  if (inLabel) return `${inLabel[1]}-${inLabel[2]}`;
  const marker = line.indexOf(':**');
  const body = marker === -1 ? '' : line.slice(marker + 3, marker + 3 + STAMP_ZONE_CHARS);
  const atHead = body.match(HEAD_STAMP);
  return atHead ? `${atHead[1]}-${atHead[2]}` : null;
}

export function sessionOf(line) {
  const match = line.match(SESSION);
  return match ? Number(match[1]) : null;
}

/**
 * Classify every line of STATUS.md.
 *
 * `kind` is one of 'line1' | 'law' | 'bullet' | 'other'. Bullets carry `month` (possibly
 * null), `session` (possibly null) and `order` — their 0-based rank among bullets in document
 * order, which is newest first by this repo's archiving convention and is what the trailing
 * window counts.
 */
export function classify(text) {
  const lines = text.split('\n');
  const rows = [];
  let order = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) { rows.push({ i, line, kind: 'line1' }); continue; }
    if (LAW_BULLET.test(line)) { rows.push({ i, line, kind: 'law' }); continue; }
    if (!ARCHIVE_BULLET.test(line)) { rows.push({ i, line, kind: 'other' }); continue; }
    rows.push({
      i, line, kind: 'bullet', order: order++,
      month: stampMonth(line), session: sessionOf(line),
    });
  }
  return rows;
}

/**
 * Fill in the month of every unstamped bullet from its `s<N>` neighbours.
 *
 * Returns a per-bullet `route`: 'stamp' (its own stamp zone), 'session-neighbour' (the nearest
 * stamped session number), 'document-neighbour' (the nearest stamped bullet in document order —
 * for the rare bullet with no session at all), or 'unplaceable'.
 */
export function resolveMonths(rows) {
  const bullets = rows.filter((row) => row.kind === 'bullet');
  const stamped = bullets.filter((row) => row.month !== null);
  const bySession = stamped
    .filter((row) => row.session !== null)
    .map((row) => ({ session: row.session, month: row.month }))
    .sort((a, b) => a.session - b.session);

  for (const row of bullets) {
    if (row.month !== null) { row.route = 'stamp'; continue; }
    // Nearest session number wins; a tie goes to the LOWER session, which is the older month —
    // the conservative direction, since an over-old key files a bullet one month early rather
    // than leaving a closed month on the board.
    if (row.session !== null && bySession.length) {
      let best = null;
      for (const candidate of bySession) {
        const distance = Math.abs(candidate.session - row.session);
        if (best === null || distance < best.distance) best = { distance, month: candidate.month };
      }
      row.month = best.month;
      row.route = 'session-neighbour';
      continue;
    }
    // No session number either: take the nearest stamped bullet in document order.
    let nearest = null;
    for (const candidate of stamped) {
      const distance = Math.abs(candidate.order - row.order);
      if (nearest === null || distance < nearest.distance) nearest = { distance, month: candidate.month };
    }
    if (nearest) { row.month = nearest.month; row.route = 'document-neighbour'; }
    else row.route = 'unplaceable';
  }
  return rows;
}

/** The month the board is currently writing into. Derived from the tree, never from the clock:
 *  a tool whose verdict changes at midnight cannot be tested hermetically, and `--month`
 *  exists so a fixture can state the month it means. */
export function currentMonth(rows, override = null) {
  if (override) return override;
  const months = [];
  const line1 = rows.find((row) => row.kind === 'line1');
  if (line1) {
    const found = line1.line.slice(0, STAMP_ZONE_CHARS).match(DATE);
    if (found) months.push(`${found[1]}-${found[2]}`);
  }
  for (const row of rows) if (row.kind === 'bullet' && row.month) months.push(row.month);
  return months.length ? months.sort().at(-1) : null;
}

/** The plan: which bullets move, where to, and why each stayer stayed. */
export function plan(text, { window = DEFAULT_WINDOW, month = null } = {}) {
  const rows = resolveMonths(classify(text));
  const now = currentMonth(rows, month);
  const bullets = rows.filter((row) => row.kind === 'bullet');
  const moving = [];
  const staying = { 'current-month': 0, 'trailing-window': 0, unplaceable: 0 };
  for (const row of bullets) {
    if (row.order < window) { row.stay = 'trailing-window'; staying['trailing-window']++; continue; }
    if (row.month === null) { row.stay = 'unplaceable'; staying.unplaceable++; continue; }
    if (now === null || row.month >= now) { row.stay = 'current-month'; staying['current-month']++; continue; }
    moving.push(row);
  }
  const byMonth = new Map();
  for (const row of moving) {
    if (!byMonth.has(row.month)) byMonth.set(row.month, []);
    byMonth.get(row.month).push(row);
  }
  return { rows, bullets, moving, staying, byMonth, currentMonth: now, window };
}

const HEADER_NOTE =
  'Rotated out of `STATUS.md` by `scripts/status-rotate-month.mjs` (owner ruling 2026-09-24, item 13a).\n' +
  'NOTHING HERE WAS DELETED — these bullets were MOVED, byte for byte, and this file is tracked in git\n' +
  'exactly as STATUS.md is (CLAUDE.md §4.10b, the Retention Law). Newest first, as on the board.\n' +
  'Readers: `scripts/ledger-corpus.mjs` `statusArchiveFiles()` is the one place that lists these files.';

export function headerFor(month) {
  return `# STATUS line-1 archive — ${month}\n\n${HEADER_NOTE}\n`;
}

/** Split an existing archive file into its header block and its bullet lines. */
function splitArchive(text) {
  const lines = text.split('\n');
  const first = lines.findIndex((line) => ARCHIVE_BULLET.test(line));
  if (first === -1) return { header: text.replace(/\n*$/, '\n'), bullets: [] };
  return {
    header: lines.slice(0, first).join('\n'),
    bullets: lines.slice(first).filter((line) => line !== ''),
  };
}

const bytes = (value) => Buffer.byteLength(value, 'utf8');

/**
 * Build the whole new tree in memory, with the accounting, and WITHOUT writing anything.
 *
 * Returns `{ statusText, files, accounting }`. `files` is `[{ rel, text, before, header }]`.
 */
export function build(root, options = {}) {
  const statusPath = path.join(root, STATUS_HEAD);
  const before = fs.readFileSync(statusPath, 'utf8');
  const result = plan(before, options);

  const moved = new Set(result.moving.map((row) => row.i));
  const afterLines = result.rows.filter((row) => !moved.has(row.i)).map((row) => row.line);
  const statusText = afterLines.join('\n');

  const files = [];
  for (const [month, rows] of [...result.byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const rel = `${STATUS_ARCHIVE_DIR}/${month}.md`;
    const abs = path.join(root, rel);
    let existing = null;
    try { existing = fs.readFileSync(abs, 'utf8'); } catch { /* new month */ }
    const parsed = existing === null ? { header: headerFor(month), bullets: [] } : splitArchive(existing);
    const already = new Set(parsed.bullets);
    // Idempotence belt: a bullet already in the archive verbatim is never written twice, so a
    // second --apply over a half-applied tree converges instead of duplicating.
    const fresh = rows.map((row) => row.line).filter((line) => !already.has(line));
    const text = `${parsed.header}\n${[...fresh, ...parsed.bullets].join('\n')}\n`;
    files.push({
      rel, abs, month, text,
      before: existing === null ? '' : existing,
      isNew: existing === null,
      headerBytes: existing === null ? bytes(`${parsed.header}\n`) : 0,
      bullets: fresh.length,
      skipped: rows.length - fresh.length,
      movedBytes: fresh.reduce((sum, line) => sum + bytes(line) + 1, 0),
    });
  }

  const statusBefore = bytes(before);
  const statusAfter = bytes(statusText);
  const archiveBefore = files.reduce((sum, file) => sum + bytes(file.before), 0);
  const archiveAfter = files.reduce((sum, file) => sum + bytes(file.text), 0);
  const headerBytes = files.reduce((sum, file) => sum + file.headerBytes, 0);
  const accounting = {
    statusBefore, statusAfter, archiveBefore, archiveAfter, headerBytes,
    movedBytes: statusBefore - statusAfter,
    in: statusBefore + archiveBefore + headerBytes,
    out: statusAfter + archiveAfter,
  };
  accounting.balanced = accounting.in === accounting.out;
  return { plan: result, statusText, statusPath, files, accounting };
}

function human(n) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(2)} MB` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} kB` : `${n} B`;
}

function report(built, { apply }) {
  const { plan: result, accounting, files } = built;
  console.log('=== status-rotate-month ===');
  console.log(`mode              : ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`current month     : ${result.currentMonth ?? '(none — nothing datable on the board)'}`);
  console.log(`trailing window   : ${result.window} newest bullet(s) held on the board whatever their month`);
  console.log(`archive bullets   : ${result.bullets.length}`);
  const routes = { stamp: 0, 'session-neighbour': 0, 'document-neighbour': 0, unplaceable: 0 };
  for (const row of result.bullets) routes[row.route] = (routes[row.route] ?? 0) + 1;
  console.log(
    `  dated by        : ${routes.stamp} stamp · ${routes['session-neighbour']} session-neighbour · ` +
      `${routes['document-neighbour']} document-neighbour · ${routes.unplaceable} unplaceable`,
  );
  console.log(
    `staying           : ${result.staying['current-month']} current-month · ` +
      `${result.staying['trailing-window']} trailing-window · ${result.staying.unplaceable} unplaceable`,
  );
  console.log(`moving            : ${result.moving.length} bullet(s), ${human(accounting.movedBytes)}`);
  console.log('per destination   :');
  if (files.length === 0) console.log('  (nothing to move — the board is already rotated)');
  for (const file of files) {
    console.log(
      `  ${file.rel.padEnd(28)} ${String(file.bullets).padStart(5)} bullet(s)  ${human(file.movedBytes).padStart(9)}` +
        `${file.isNew ? `  + ${file.headerBytes} B header (new file)` : '  (appending)'}` +
        `${file.skipped ? `  ${file.skipped} already present, skipped` : ''}`,
    );
  }
  console.log(`STATUS.md         : ${human(accounting.statusBefore)} -> ${human(accounting.statusAfter)}`);
  console.log(
    `BALANCE           : in ${accounting.in} B (STATUS ${accounting.statusBefore} + archives ` +
      `${accounting.archiveBefore} + headers ${accounting.headerBytes}) === out ${accounting.out} B ` +
      `(STATUS ${accounting.statusAfter} + archives ${accounting.archiveAfter}) -> ` +
      `${accounting.balanced ? 'BALANCED' : `OFF BY ${accounting.out - accounting.in} B`}`,
  );
  return accounting.balanced;
}

function refuse(message) {
  console.log(`REFUSING: ${message}`);
  console.error(`REFUSING: ${message}`);
  process.exit(2);
}

function main(argv) {
  const flag = (name) => argv.includes(name);
  const value = (name, fallback) => {
    const index = argv.indexOf(name);
    return index === -1 ? fallback : argv[index + 1];
  };
  const apply = flag('--apply');
  const dry = flag('--dry-run');
  if (apply === dry) refuse('pass exactly one of --dry-run or --apply');
  const known = new Set(['--apply', '--dry-run', '--root', '--window', '--month']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    if (!known.has(arg)) refuse(`unrecognised option ${JSON.stringify(arg)}`);
    if (arg !== '--apply' && arg !== '--dry-run') i++;
  }
  const root = path.resolve(value('--root', process.cwd()));
  const window = Number(value('--window', DEFAULT_WINDOW));
  if (!Number.isInteger(window) || window < 0) refuse('--window needs a non-negative integer');
  const month = value('--month', null);
  if (month !== null && !/^\d{4}-\d{2}$/.test(month)) refuse('--month needs a YYYY-MM value');

  let built;
  try {
    built = build(root, { window, month });
  } catch (error) {
    refuse(`cannot read ${path.join(root, STATUS_HEAD)} — ${error.message}`);
  }

  const balanced = report(built, { apply });
  if (!balanced) {
    // The refusal is BEFORE any write, on purpose: a half-written rotation is the one state
    // the Retention Law cannot tolerate, and this tool's whole claim is that every byte is
    // accounted for. An unbalanced plan is a bug in the plan, never a licence to write it.
    console.error('  Nothing was written. The bullets and the bytes must reconcile exactly before a move.');
    process.exit(2);
  }

  if (!apply) {
    console.log('DRY-RUN — nothing written. Re-run with --apply to perform the move.');
    process.exit(0);
  }

  fs.mkdirSync(path.join(root, STATUS_ARCHIVE_DIR), { recursive: true });
  for (const file of built.files) fs.writeFileSync(file.abs, file.text, 'utf8');
  fs.writeFileSync(built.statusPath, built.statusText, 'utf8');
  console.log(`APPLIED — ${built.plan.moving.length} bullet(s) moved into ${built.files.length} file(s).`);
  console.log(`archive/status now holds: ${statusArchiveFiles(root).join(', ') || '(none)'}`);
  process.exit(0);
}

// NOT `file://${process.argv[1]}` — this repo's absolute path contains a space ("Gold Rush"),
// which import.meta.url percent-encodes and process.argv[1] does not.
// INVOKED DIRECTLY? — realpath on BOTH sides, and both halves are load-bearing.
//   · `pathToFileURL`, never `file://${process.argv[1]}`: this repo's path contains a space
//     ("Gold Rush"), which import.meta.url percent-encodes and process.argv[1] does not.
//   · `realpathSync`, because node resolves the ENTRY POINT through symlinks while argv[1] keeps
//     the caller's spelling. Measured while writing this tool's own test: run from a macOS
//     `mkdtemp` (`/var/folders/...`, where /var is a symlink to /private/var) the two sides
//     disagreed, main() never ran, and the tool exited 0 having printed NOTHING — a silent
//     no-op wearing the shape of success, which is Mistake #1 arriving through a path idiom.
const invokedDirectly = () => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (invokedDirectly()) {
  main(process.argv.slice(2));
}
export const TOOL = fileURLToPath(import.meta.url);
