#!/usr/bin/env node
// backlog-split-closed.mjs — move tasks/BACKLOG.md's CLOSED rows into `tasks/backlog/<key>.md`,
// every byte kept, the citation baseline re-keyed in the same run, and a refusal if anything
// fails to balance or fails to place.
//
// WHY (owner ruling 2026-09-24, item 13 "(a)", verbatim: "BACKLOG is 9.2 MB with the findings
// above its own title ... Nothing is deleted under the law, but the shape makes them
// unreadable." Option (a): "split BACKLOG into a short index plus per-epic files ... every byte
// kept, in git and in the archives.")
//
// 🚫 IT SPLITS BY STATE, NEVER BY POSITION, and that choice is what keeps the change small.
// docs/ledger-shape-reader-map-2026-09-24.md measured a positional cut at the title: it would
// have taken 51 OPEN rows, the single `^OWNER:` row, 416 of 891 `GATE:` rows and 47 of 129 RULED
// rows off the live index, breaking desk-declaration-guard's first-row rule and blinding the
// dashboard's two panels. Moving only CLOSED rows leaves every row a live reader needs where it
// has always been, and reduces the required code change to the readers listed in §3 of the task.
//
// WHAT NEVER MOVES, whatever its age:
//   · everything at or ABOVE the `# Task backlog` H1 — the newest findings and every first-key
//     desk declaration (today: rows 202 and 259, both above the title).
//   · every OPEN row (findings-state-guard's own vocabulary, imported, not re-implemented).
//   · every row carrying 🔺 (a desk item), `GATE:` (dashboard-gen.sh's blocked panel),
//     `RULED` (ruling-propagation-guard's subject set) or leading `OWNER:` (the desk panel).
//   · every heading. H1 and H2 stay, and each emptied section gains a `→ tasks/backlog/<key>.md`
//     pointer line so a reader following the ladder is never left at a hole.
//
// THE CLOSURE VOCABULARY IS IMPORTED (F-1261-1: a re-implementation of a ledger rule disagreed
// with the original on 4 of 14 rows). `rowState` in findings-state-guard.mjs is THE definition
// of closed in this repo — leading ✅, struck text (`~~`, `✅ CLOSED/RETIRED`, `struck sNNNN`),
// or the bullet-led `- ✅` form under the WIDE vocabulary — and this tool calls it rather than
// re-deriving it. Widening or narrowing "closed" happens in one file, and it is not this one.
//
// KEYS. A row is filed under the H2 it sits under when that H2 NAMES something (an era, an
// epic, a lane, a session) and under `closed-<YYYY-MM>` when the H2 is a dated wave heading or
// when there is no H2 at all — the ledger's 100+ `## 2026-07-13 — ...` wave headings are dates,
// not epics, and one file per wave would be 100 files of three rows each. An undated row under
// no heading takes the month of the nearest dated line in its own band: a MEASUREMENT of its
// neighbours, reported by route, never a date invented for it. A row whose month cannot be
// resolved at all is filed under `closed-undated` and counted, so the unknown is visible rather
// than smuggled into a month.
//
// USAGE
//   node scripts/backlog-split-closed.mjs --dry-run [--root <dir>]
//   node scripts/backlog-split-closed.mjs --apply   [--root <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { rowState } from './findings-state-guard.mjs';
import { BACKLOG_INDEX, BACKLOG_DIR, backlogFiles } from './ledger-corpus.mjs';

const SUBJECT_CHARS = 90;
const BASELINE_REL = 'scripts/citation-title-baseline.json';
/** citation-title-guard.mjs's own pattern. Copied deliberately and stated: importing that file
 *  would execute its `git ls-files tasks` corpus scan at import time in every fixture. */
const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g;
const DATE = /(?<!\d)(\d{4})-(\d{2})-\d{2}(?!\d)/;
const DATED_HEADING = /^##\s+(?:\d{4})-(?:\d{2})-(?:\d{2})/;
const NEIGHBOUR_ZONE_CHARS = 200;

/** Closed by the ledger's ONE definition. Wide vocabulary: the bullet-led `- ✅ **F-x ...` is
 *  the commonest closure shape on this board (136 occurrences at s1291), and a split that could
 *  not see it would leave the bulk of the closed rows on the index. */
export function isClosedRow(line) {
  return rowState(line.slice(0, SUBJECT_CHARS), line.trimStart(), true, false) === 'closed';
}

/** A row the split must never move, whatever its state. Returns the reason, or null. */
export function keepReason(line) {
  if (line.includes('🔺')) return 'desk';
  if (line.includes('GATE:')) return 'gate';
  if (/\bRULED\b/.test(line)) return 'RULED';
  if (/^OWNER:/.test(line)) return 'OWNER';
  return null;
}

/** `## 🚂 E2 COMPLETION — THE ACTIVE ERA PROGRAM (...)` -> `e2-completion`. */
export function slugOf(heading) {
  const stripped = heading
    .replace(/^#+\s*/, '')
    .replace(/[’']/g, '')
    .split(/\s+[—–-]\s+|\s*\(|:\s/)[0]
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return stripped.slice(0, 48) || 'section';
}

const monthOf = (text) => {
  const found = (text ?? '').match(DATE);
  return found ? `${found[1]}-${found[2]}` : null;
};

/**
 * Classify every line of the index.
 *
 * Returns `{ rows, h1 }` where each row carries `{ i, line, heading, belowTitle }` plus, for a
 * moving row, `{ key, route }`.
 */
export function plan(text) {
  const lines = text.split('\n');
  const h1 = lines.findIndex((line) => /^# /.test(line));
  const rows = [];
  let heading = null;
  let headingIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      if (/^##\s/.test(line)) { heading = line; headingIndex = i; }
      rows.push({ i, line, kind: 'heading', heading, headingIndex });
      continue;
    }
    rows.push({ i, line, kind: 'row', heading, headingIndex, belowTitle: h1 !== -1 && i > h1 });
  }

  // The nearest dated line ABOVE, then BELOW — used only for rows that carry no date of their
  // own and sit under no dated heading. Computed over ALL lines, because the band that needs it
  // (between the H1 and the first H2) is chronological and its dates live on neighbouring rows.
  const nearestMonth = (index) => {
    for (let j = index; j >= 0; j--) {
      const month = monthOf(lines[j].slice(0, NEIGHBOUR_ZONE_CHARS));
      if (month) return { month, direction: 'above' };
    }
    for (let j = index + 1; j < lines.length; j++) {
      const month = monthOf(lines[j].slice(0, NEIGHBOUR_ZONE_CHARS));
      if (month) return { month, direction: 'below' };
    }
    return null;
  };

  const moving = [];
  for (const row of rows) {
    if (row.kind !== 'row' || !row.belowTitle) continue;
    if (row.line.trim() === '') continue;
    if (!isClosedRow(row.line)) continue;
    const keep = keepReason(row.line);
    if (keep) { row.keep = keep; continue; }

    if (row.heading && !DATED_HEADING.test(row.heading)) {
      row.key = slugOf(row.heading);
      row.route = 'heading-slug';
    } else {
      const headingMonth = row.heading ? monthOf(row.heading) : null;
      const ownMonth = monthOf(row.line.slice(0, SUBJECT_CHARS));
      if (headingMonth) { row.key = `closed-${headingMonth}`; row.route = 'heading-date'; }
      else if (ownMonth) { row.key = `closed-${ownMonth}`; row.route = 'row-date'; }
      else {
        const near = nearestMonth(row.i);
        if (near) { row.key = `closed-${near.month}`; row.route = `neighbour-${near.direction}`; }
        else { row.key = 'closed-undated'; row.route = 'undated'; }
      }
    }
    moving.push(row);
  }
  return { lines, rows, h1, moving };
}

const HEADER_NOTE =
  'Closed rows split out of `tasks/BACKLOG.md` by `scripts/backlog-split-closed.mjs`\n' +
  '(owner ruling 2026-09-24, item 13a). NOTHING HERE WAS DELETED — these rows were MOVED, byte\n' +
  'for byte, and this file is tracked exactly as the index is (CLAUDE.md §4.10b, the Retention\n' +
  'Law). The COMPLETE work ledger is the index PLUS every file in this directory; read them\n' +
  'together, and list them with `backlogFiles()` in `scripts/ledger-corpus.mjs`.';

export function headerFor(key) {
  return `# Task backlog — closed rows: ${key}\n\n${HEADER_NOTE}\n`;
}

export const pointerFor = (key, count) =>
  `→ \`${BACKLOG_DIR}/${key}.md\` — ${count} closed row(s) moved there by ` +
  '`scripts/backlog-split-closed.mjs` (owner ruling 2026-09-24, item 13a); nothing was deleted.';

/** Split an existing part file into its header block and its row lines. */
function splitPart(text) {
  const lines = text.split('\n');
  const first = lines.findIndex((line, index) => index > 0 && line !== '' && !/^#/.test(line) && !line.startsWith('('));
  if (first === -1) return { header: text.replace(/\n*$/, '\n'), rows: [] };
  return { header: lines.slice(0, first).join('\n'), rows: lines.slice(first).filter((line) => line !== '') };
}

const bytes = (value) => Buffer.byteLength(value, 'utf8');

/** Count CITE occurrences of one exact raw coordinate in a body of text. */
function citeCount(text, raw) {
  let n = 0;
  CITE.lastIndex = 0;
  let hit;
  while ((hit = CITE.exec(text))) if (hit[0] === raw) n++;
  return n;
}

/**
 * Re-key `scripts/citation-title-baseline.json` mechanically.
 *
 * 🚫 NEVER `--update-baseline`: that regenerates the WHOLE map from the current tree and would
 * grandfather a genuinely new bare citation alongside the moved ones — a ratchet re-cut to fit
 * whatever it is pointed at (the reader map says so in as many words). Only the
 * `tasks/BACKLOG.md::` keys are touched, and only by counting where their own coordinate landed.
 *
 * THE ALLOCATION RULE, AND THE ONE IT REPLACES. A baseline entry is an ALLOWANCE for the
 * OFFENDING occurrences of one coordinate in one file, and this tool cannot see which
 * occurrences offend — that verdict needs the e2e spec's titles and a ±WINDOW read, which is
 * `citation-title-guard`'s job and must not be re-implemented here (F-1261-1). So:
 *   · ALL occurrences on one side  -> the whole allowance goes there. The total is unchanged,
 *     and this is the common case (measured on the live board: 19 of 21 affected keys).
 *   · STRADDLING both sides       -> EACH destination gets `min(allowance, occurrences there)`,
 *     and the addition is PRINTED, per key, under STRADDLE.
 *
 * ⚠️ THE FIRST DRAFT SPLIT A STRADDLING ALLOWANCE IN PROPORTION, AND IT REDDED THE GATE.
 * Measured on a scratch `--apply` of the live board before this tool ever ran on main: two keys
 * straddle (`e2e/asset-diet.spec.ts:15` and `e2e/ap-standing-orders.spec.ts:80`), each with one
 * occurrence per side and an allowance of 1. The proportional rule floored both shares to 0 and
 * gave the remainder to the index — and in BOTH cases the offending occurrence was the one that
 * MOVED, so `citation-title-guard` came back `FAIL — 2 citation(s)` at `found 1, grandfathered 0`.
 * A proportional split of an allowance whose distribution you cannot see is a guess dressed as
 * arithmetic. `min` is not: it can only ever excuse occurrences of a coordinate this baseline
 * ALREADY grandfathered, in the files that already hold that text, and it says when it did.
 */
export function rekeyBaseline(baseline, stayedText, movedTextByKey) {
  const out = {};
  const moves = [];
  const straddles = [];
  const unplaceable = [];
  for (const [key, count] of Object.entries(baseline)) {
    if (!key.startsWith(`${BACKLOG_INDEX}::`)) { out[key] = count; continue; }
    const raw = key.slice(`${BACKLOG_INDEX}::`.length);
    const tally = [{ file: BACKLOG_INDEX, n: citeCount(stayedText, raw) }];
    for (const [partKey, text] of movedTextByKey) {
      const n = citeCount(text, raw);
      if (n > 0) tally.push({ file: `${BACKLOG_DIR}/${partKey}.md`, n });
    }
    const present = tally.filter((entry) => entry.n > 0);
    if (present.length === 0) { unplaceable.push({ key, count }); continue; }

    const shares = new Map();
    for (const entry of present) shares.set(entry.file, Math.min(count, entry.n));
    for (const [file, share] of shares) {
      if (share <= 0) continue;
      out[`${file}::${raw}`] = (out[`${file}::${raw}`] ?? 0) + share;
    }
    const allocated = [...shares.values()].reduce((a, b) => a + b, 0);
    const to = [...shares.entries()].filter(([, n]) => n > 0).map(([file, n]) => `${file}=${n}`);
    if (present.length > 1) straddles.push({ key, count, allocated, to });
    else if (present[0].file !== BACKLOG_INDEX) moves.push({ key, count, to });
  }
  return { out, moves, straddles, unplaceable };
}
/** Build the whole new tree in memory, with the accounting, WITHOUT writing anything. */
export function build(root) {
  const indexPath = path.join(root, BACKLOG_INDEX);
  const before = fs.readFileSync(indexPath, 'utf8');
  const result = plan(before);

  const movingIndexes = new Set(result.moving.map((row) => row.i));
  const byKey = new Map();
  for (const row of result.moving) {
    if (!byKey.has(row.key)) byKey.set(row.key, []);
    byKey.get(row.key).push(row);
  }

  // Pointer lines: one per (section, key), inserted directly under the section's heading.
  const pointersAfter = new Map();
  const seen = new Set();
  for (const row of result.moving) {
    const anchor = row.headingIndex >= 0 ? row.headingIndex : result.h1;
    const token = `${anchor}::${row.key}`;
    if (seen.has(token)) continue;
    seen.add(token);
    if (!pointersAfter.has(anchor)) pointersAfter.set(anchor, []);
    pointersAfter.get(anchor).push(row.key);
  }
  const counts = new Map();
  for (const row of result.moving) {
    const anchor = row.headingIndex >= 0 ? row.headingIndex : result.h1;
    const token = `${anchor}::${row.key}`;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  const indexLines = [];
  let pointerBytes = 0;
  for (const row of result.rows) {
    if (movingIndexes.has(row.i)) continue;
    indexLines.push(row.line);
    const pointers = pointersAfter.get(row.i);
    if (!pointers) continue;
    for (const key of pointers) {
      // Idempotence: a pointer this section already carries is never doubled. A complete run
      // leaves no moving rows for that key, so this only fires after a PARTIAL apply — which is
      // exactly the state a second run has to converge from rather than double.
      const prefix = `→ \`${BACKLOG_DIR}/${key}.md\``;
      const existing = result.lines.slice(row.i + 1, row.i + 11).some((line) => line.startsWith(prefix));
      if (existing) continue;
      const line = pointerFor(key, counts.get(`${row.i}::${key}`));
      indexLines.push(line);
      pointerBytes += bytes(line) + 1;
    }
  }
  const indexText = indexLines.join('\n');

  const files = [];
  for (const [key, rows] of [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const rel = `${BACKLOG_DIR}/${key}.md`;
    const abs = path.join(root, rel);
    let existing = null;
    try { existing = fs.readFileSync(abs, 'utf8'); } catch { /* new key */ }
    const parsed = existing === null ? { header: headerFor(key), rows: [] } : splitPart(existing);
    const already = new Set(parsed.rows);
    const fresh = rows.map((row) => row.line).filter((line) => !already.has(line));
    const text = `${parsed.header}\n${[...fresh, ...parsed.rows].join('\n')}\n`;
    files.push({
      rel, abs, key, text,
      before: existing === null ? '' : existing,
      isNew: existing === null,
      headerBytes: existing === null ? bytes(`${parsed.header}\n`) : 0,
      rows: fresh.length,
      skipped: rows.length - fresh.length,
      movedBytes: fresh.reduce((sum, line) => sum + bytes(line) + 1, 0),
      movedText: fresh.join('\n'),
    });
  }

  const indexBefore = bytes(before);
  const indexAfter = bytes(indexText);
  const partsBefore = files.reduce((sum, file) => sum + bytes(file.before), 0);
  const partsAfter = files.reduce((sum, file) => sum + bytes(file.text), 0);
  const headerBytes = files.reduce((sum, file) => sum + file.headerBytes, 0);
  const accounting = {
    indexBefore, indexAfter, partsBefore, partsAfter, headerBytes, pointerBytes,
    movedBytes: indexBefore + pointerBytes - indexAfter,
    in: indexBefore + partsBefore + headerBytes + pointerBytes,
    out: indexAfter + partsAfter,
  };
  accounting.balanced = accounting.in === accounting.out;

  // The baseline re-key is computed against the same two bodies of text the move produces.
  const baselinePath = path.join(root, BASELINE_REL);
  let baseline = null;
  let rekey = null;
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    rekey = rekeyBaseline(
      baseline.grandfathered ?? {},
      indexText,
      files.map((file) => [file.key, file.movedText]),
    );
  } catch (error) {
    rekey = { error: error.message };
  }

  return { plan: result, indexText, indexPath, files, accounting, baseline, baselinePath, rekey };
}

function human(n) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(2)} MB` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} kB` : `${n} B`;
}

function report(built, { apply }) {
  const { plan: result, accounting, files, rekey } = built;
  console.log('=== backlog-split-closed ===');
  console.log(`mode              : ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`# Task backlog H1 : line ${result.h1 + 1}${result.h1 === -1 ? ' (ABSENT — nothing is below the title, so nothing moves)' : ''}`);
  const below = result.rows.filter((row) => row.kind === 'row' && row.belowTitle && row.line.trim() !== '').length;
  const closed = result.rows.filter((row) => row.kind === 'row' && row.belowTitle && row.line.trim() !== '' && isClosedRow(row.line));
  console.log(`rows below title  : ${below}  (${closed.length} closed-marked)`);
  const kept = closed.filter((row) => row.keep);
  const keptBy = {};
  for (const row of kept) keptBy[row.keep] = (keptBy[row.keep] ?? 0) + 1;
  console.log(`held on the index : ${kept.length} closed row(s) kept — ${Object.entries(keptBy).map(([k, v]) => `${v} ${k}`).join(' · ') || '(none)'}`);
  const routes = {};
  for (const row of result.moving) routes[row.route] = (routes[row.route] ?? 0) + 1;
  console.log(`moving            : ${result.moving.length} row(s), ${human(accounting.movedBytes)}`);
  console.log(`  keyed by        : ${Object.entries(routes).map(([k, v]) => `${v} ${k}`).join(' · ') || '(none)'}`);
  console.log('per destination   :');
  if (files.length === 0) console.log('  (nothing to move — the index is already split)');
  for (const file of files) {
    console.log(
      `  ${file.rel.padEnd(46)} ${String(file.rows).padStart(4)} row(s)  ${human(file.movedBytes).padStart(9)}` +
        `${file.isNew ? `  + ${file.headerBytes} B header (new file)` : '  (appending)'}` +
        `${file.skipped ? `  ${file.skipped} already present, skipped` : ''}`,
    );
  }
  console.log(`tasks/BACKLOG.md  : ${human(accounting.indexBefore)} -> ${human(accounting.indexAfter)}  (+${accounting.pointerBytes} B of pointer lines)`);
  console.log(
    `BALANCE           : in ${accounting.in} B (index ${accounting.indexBefore} + parts ${accounting.partsBefore} ` +
      `+ headers ${accounting.headerBytes} + pointers ${accounting.pointerBytes}) === out ${accounting.out} B ` +
      `(index ${accounting.indexAfter} + parts ${accounting.partsAfter}) -> ` +
      `${accounting.balanced ? 'BALANCED' : `OFF BY ${accounting.out - accounting.in} B`}`,
  );

  console.log('baseline re-key   :');
  if (rekey?.error) {
    console.log(`  UNREADABLE — ${rekey.error}`);
  } else {
    const backlogKeys = Object.keys(built.baseline.grandfathered ?? {}).filter((k) => k.startsWith(`${BACKLOG_INDEX}::`));
    console.log(
      `  ${BACKLOG_INDEX} keys: ${backlogKeys.length} · moved whole: ${rekey.moves.length} · straddling: ${rekey.straddles.length} · unplaceable: ${rekey.unplaceable.length}`,
    );
    for (const move of rekey.moves) console.log(`    ${move.key}  ->  ${move.to.join(' , ')}`);
    for (const s of rekey.straddles) {
      console.log(
        `    STRADDLE ${s.key}  ->  ${s.to.join(' , ')}   (allowance ${s.count} -> ${s.allocated}; the coordinate now occurs on both sides of the split)`,
      );
    }
    for (const miss of rekey.unplaceable) console.log(`    UNPLACEABLE ${miss.key} (allowance ${miss.count})`);
  }
  return accounting.balanced && !rekey?.error && rekey.unplaceable.length === 0;
}

function refuse(message) {
  console.log(`REFUSING: ${message}`);
  console.error(`REFUSING: ${message}`);
  process.exit(2);
}

function main(argv) {
  const apply = argv.includes('--apply');
  const dry = argv.includes('--dry-run');
  if (apply === dry) refuse('pass exactly one of --dry-run or --apply');
  const known = new Set(['--apply', '--dry-run', '--root']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    if (!known.has(arg)) refuse(`unrecognised option ${JSON.stringify(arg)}`);
    if (arg === '--root') i++;
  }
  const rootIndex = argv.indexOf('--root');
  const root = path.resolve(rootIndex === -1 ? process.cwd() : argv[rootIndex + 1]);

  let built;
  try {
    built = build(root);
  } catch (error) {
    refuse(`cannot read ${path.join(root, BACKLOG_INDEX)} — ${error.message}`);
  }

  const ok = report(built, { apply });
  if (!ok) {
    console.error('  Nothing was written. Rows, bytes and baseline keys must all reconcile before a move.');
    process.exit(2);
  }

  if (!apply) {
    console.log('DRY-RUN — nothing written. Re-run with --apply to perform the split.');
    process.exit(0);
  }

  fs.mkdirSync(path.join(root, BACKLOG_DIR), { recursive: true });
  for (const file of built.files) fs.writeFileSync(file.abs, file.text, 'utf8');
  fs.writeFileSync(built.indexPath, built.indexText, 'utf8');
  const sorted = Object.fromEntries(Object.entries(built.rekey.out).sort((a, b) => a[0].localeCompare(b[0])));
  fs.writeFileSync(built.baselinePath, `${JSON.stringify({ grandfathered: sorted }, null, 2)}\n`, 'utf8');
  console.log(`APPLIED — ${built.plan.moving.length} row(s) moved into ${built.files.length} file(s); baseline re-keyed.`);
  console.log(`the ledger corpus is now: ${backlogFiles(root).join(', ')}`);
  process.exit(0);
}

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
