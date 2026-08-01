#!/usr/bin/env node
// row-quote-currency — does the sentence an open ledger row DEPENDS ON still exist?
//
// WHY
//   F-1344-2 established that the ledger's open/closed vocabulary is entirely
//   ledger-internal: cure something in code, write no closure row, and the row
//   advertises the work forever. F-1345-3 turned that into a rate — 3 of 5 open
//   rows probed by hand were already cured — and then named the gap this script
//   fills: the rows it could probe made CODE claims, answerable with `git log`
//   plus a read. The remaining rows' subject is a DOCUMENT (a guard's source, a
//   law surface, an inventory, a master), and `git log` cannot answer them,
//   because a file moving tells you nothing about whether THIS row's premise
//   moved with it.
//
// WHAT IT ASKS
//   These rows are unusually quotable: they cite a path and then quote the exact
//   sentence they are arguing about. So the probe is one question per quote —
//   does that verbatim string still occur in the file the row attributes it to?
//     PRESENT    the row's factual anchor is intact
//     ABSENT     the quoted premise is GONE from the file it names -> probe this
//     UNRESOLVED nothing checkable (no path, or every quote elided/paraphrased)
//
// WHAT IT DOES NOT DECIDE — READ THIS BEFORE ACTING ON A VERDICT
//   PRESENT is NOT "the finding is still live": a row can quote an intact
//   sentence and still be about a defect someone cured elsewhere. ABSENT is NOT
//   "the finding is closed": a row may quote a line deliberately as HISTORY
//   (s1345 refused a "cure" that would have overwritten a true past-tense record
//   with a false present-tense coordinate), and history is SUPPOSED to be absent
//   from today's file. This ranks rows by probe-worthiness. It never closes one.
//
// USAGE
//   node scripts/row-quote-currency.mjs              # ABSENT rows only
//   node scripts/row-quote-currency.mjs --all        # every open row
//   node scripts/row-quote-currency.mjs --self-test  # controls, both directions

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from './findings-state-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// A path token as the ledger writes them: inside backticks, optionally :NN or :NN-NN.
const PATH_RE = /^([A-Za-z0-9_./-]+\.(?:mjs|js|ts|tsx|md|json|sh|py|yml|yaml))(?::\d+(?:-\d+)?)?$/;
// Quotes: the ledger's italic-quote idiom *"..."*.
const ITALIC_QUOTE = /\*"([^"]{12,})"\*/g;

// Backtick spans MUST be tokenised by alternation, never matched with a regex.
// The first draft of this file used /`([^`\n]{25,})`/g and it matched the PROSE
// BETWEEN two adjacent code spans — every such stretch was then reported as a
// quote that had vanished from the file. On the live ledger that produced
// ABSENT 41 / PRESENT 1, an alarming and entirely false headline. Splitting on
// the delimiter is the only correct tokenisation; odd indices are inside ticks.
export function tickSpans(row) {
  const parts = row.split('`');
  return parts.filter((_, i) => i % 2 === 1);
}

// The ledger bolds words INSIDE quotes and smartens punctuation; the source file
// has neither. Normalising both sides is what makes a comparison meaningful.
export function normalise(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const ELIDED = /…|\.\.\./;

// A quote counts against a file only when the row ATTRIBUTES it there. The
// ledger's idiom is `path:NN` immediately followed by the quote, so proximity is
// the attribution signal. Without this, a row quoting an owner directive or
// another row is scored against whatever path it happened to mention, and the
// verdict is noise. WINDOW is deliberately tight; widening it re-admits that noise.
const WINDOW = 240;

function citations(row) {
  const out = [];
  let offset = 0;
  for (const [i, part] of row.split('`').entries()) {
    if (i % 2 === 1) {
      const m = PATH_RE.exec(part);
      if (m) out.push({ path: m[1], at: offset });
    }
    offset += part.length + 1;
  }
  return out;
}

function quotesWithOffsets(row) {
  const out = [];
  for (const m of row.matchAll(ITALIC_QUOTE)) out.push({ quote: m[1], at: m.index });
  let offset = 0;
  for (const [i, part] of row.split('`').entries()) {
    // A tick span that is only a path is a citation, not a quote to look for.
    if (i % 2 === 1 && part.length >= 25 && !PATH_RE.test(part)) out.push({ quote: part, at: offset });
    offset += part.length + 1;
  }
  return out;
}

export function extract(row) {
  const cites = citations(row);
  const paths = [...new Set(cites.map((c) => c.path))];
  const pairs = [];
  for (const q of quotesWithOffsets(row)) {
    if (ELIDED.test(q.quote)) continue;
    const near = cites.filter((c) => q.at - c.at <= WINDOW && q.at - c.at >= -WINDOW);
    if (!near.length) continue;
    pairs.push({ quote: q.quote, paths: [...new Set(near.map((c) => c.path))] });
  }
  return { paths, pairs };
}

function readIfPresent(rel) {
  try {
    const abs = path.join(ROOT, rel);
    if (!fs.statSync(abs).isFile()) return null;
    return normalise(fs.readFileSync(abs, 'utf8'));
  } catch {
    return null;
  }
}

export function probeRow(row, read = readIfPresent) {
  const { paths, pairs } = extract(row);
  const cache = new Map();
  const body = (p) => {
    if (!cache.has(p)) cache.set(p, read(p));
    return cache.get(p);
  };
  const missingPaths = paths.filter((p) => body(p) === null);

  // Proximity decides WHETHER a quote is checkable at all; the union of every
  // path the row names decides the VERDICT. Splitting the two is what keeps this
  // conservative. Scoring a quote only against its nearest citation looked more
  // precise and was measurably worse: F-1294-1 quotes a sentence that genuinely
  // lives in `scripts/fire.md`, but the nearest citation was
  // `playwright.config.ts`, so the strict-attribution build called an intact
  // premise GONE. A quote counts as absent only when NO file the row names holds it.
  const readableAll = paths.filter((p) => body(p) !== null);
  const present = [];
  const absent = [];
  for (const pair of pairs) {
    if (!pair.paths.some((p) => body(p) !== null)) continue; // unreadable: never absent
    const needle = normalise(pair.quote);
    const hit = readableAll.find((p) => body(p).includes(needle));
    if (hit) present.push({ quote: pair.quote, path: hit });
    else absent.push({ quote: pair.quote, paths: readableAll });
  }
  if (!present.length && !absent.length) {
    return { verdict: 'UNRESOLVED', paths, missingPaths, present, absent };
  }
  // A row is worth probing when a quote it attributes to a file it names is gone.
  return { verdict: absent.length ? 'ABSENT' : 'PRESENT', paths, missingPaths, present, absent };
}

function openRows() {
  const text = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
  const lines = text.split('\n');
  const byLine = new Map();
  for (const [id, st] of scan(text)) {
    for (const ln of st.open) {
      if (!byLine.has(ln)) byLine.set(ln, { line: ln, ids: [], body: lines[ln - 1] });
      byLine.get(ln).ids.push(id);
    }
  }
  return [...byLine.values()].sort((a, b) => a.line - b.line);
}

function selfTest() {
  let fail = 0;
  const check = (name, got, want) => {
    const ok = got === want;
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}: got ${got}, want ${want}`);
  };
  const fake = (files) => (p) => (p in files ? normalise(files[p]) : null);

  // Positive control: quote that IS in the named file.
  check('present quote', probeRow(
    'row `scripts/x.mjs:64` reads *"the quick brown fox"* etc',
    fake({ 'scripts/x.mjs': 'line1\nthe quick brown fox\nline3' }),
  ).verdict, 'PRESENT');

  // Negative control: MANUFACTURE the defect — same row, quote removed from file.
  check('absent quote', probeRow(
    'row `scripts/x.mjs:64` reads *"the quick brown fox"* etc',
    fake({ 'scripts/x.mjs': 'line1\nthis file was rewritten\nline3' }),
  ).verdict, 'ABSENT');

  // Bold inside a quote must not cause a false ABSENT (the ledger's house style).
  check('bold inside quote', probeRow(
    'row `scripts/x.mjs` reads *"the **quick** brown fox"* etc',
    fake({ 'scripts/x.mjs': 'the quick brown fox' }),
  ).verdict, 'PRESENT');

  // Elided quotes are not checkable and must not manufacture an ABSENT.
  check('elided quote', probeRow(
    'row `scripts/x.mjs` reads *"the quick … fox"* etc',
    fake({ 'scripts/x.mjs': 'unrelated' }),
  ).verdict, 'UNRESOLVED');

  // No path named -> nothing to check against.
  check('no path', probeRow('row says *"the quick brown fox"*', fake({})).verdict, 'UNRESOLVED');

  // A bare path in a code span is a citation, not a quote to look for.
  check('path is not a quote', extract('see `scripts/some/long-name-here.mjs`').pairs.length, 0);

  // REGRESSION CONTROL for the defect this file shipped in its first draft: prose
  // sitting BETWEEN two backtick spans is not a quote. With the old regex this
  // returned 1 and drove a false ABSENT 41/42 on the live ledger.
  check('prose between two tick spans is not a quote', extract(
    'row `scripts/x.mjs` and then a long stretch of ordinary ledger prose here `y`',
  ).pairs.length, 0);
  check('tick tokenisation', tickSpans('a `one` b `two` c').join('|'), 'one|two');

  // Attribution: a quote far from any path citation is not scored against it.
  check('far quote unattributed', probeRow(
    '`scripts/x.mjs` starts it. ' + 'filler '.repeat(60) + 'and the owner said *"the quick brown fox"*',
    fake({ 'scripts/x.mjs': 'nothing like it' }),
  ).verdict, 'UNRESOLVED');

  // A named path that is not on disk can never manufacture an ABSENT.
  check('unreadable path', probeRow(
    'row `scripts/gone.mjs` reads *"the quick brown fox"*',
    fake({}),
  ).verdict, 'UNRESOLVED');

  console.log(fail ? `row-quote-currency self-test: FAIL (${fail})` : 'row-quote-currency self-test: PASS');
  return fail;
}

function main() {
  if (process.argv.includes('--self-test')) process.exit(selfTest() ? 1 : 0);
  const all = process.argv.includes('--all');
  const rows = openRows();
  const tally = { PRESENT: 0, ABSENT: 0, UNRESOLVED: 0 };
  const out = [];
  for (const r of rows) {
    const res = probeRow(r.body);
    tally[res.verdict]++;
    if (all || res.verdict === 'ABSENT') out.push({ r, res });
  }
  // Rank by the FRACTION of a row's checkable quotes that are gone, not by the
  // bare verdict. A row is ABSENT if ANY one quote is missing, and these rows
  // carry up to a dozen quotes each, so one noisy quote condemns a row whose
  // headline premise is intact: measured s1346, F-1305-1 and F-1345-1 both flag
  // ABSENT while the sentence each is actually ARGUING about is still in place.
  // The fraction is the triage signal; the verdict alone is not.
  out.sort((a, b) => {
    const f = (x) => x.res.absent.length / (x.res.absent.length + x.res.present.length);
    return f(b) - f(a);
  });
  let quotesAbsent = 0;
  let quotesPresent = 0;
  for (const { r, res } of out) {
    quotesAbsent += res.absent.length;
    quotesPresent += res.present.length;
    const n = res.absent.length + res.present.length;
    console.log(`\n${res.verdict}  ${res.absent.length}/${n} quotes gone  L${r.line}  ${r.ids.join(',')}`);
    console.log(`  paths: ${res.paths.join(' ') || '(none)'}`);
    if (res.missingPaths.length) console.log(`  path not on disk: ${res.missingPaths.join(' ')}`);
    for (const a of res.absent) console.log(`  GONE: "${a.quote.slice(0, 160)}"`);
  }
  console.log(`\nopen rows ${rows.length} | rows: PRESENT ${tally.PRESENT} ABSENT ${tally.ABSENT} UNRESOLVED ${tally.UNRESOLVED}`);
  if (all || tally.ABSENT) console.log(`quotes checked ${quotesPresent + quotesAbsent} | present ${quotesPresent} | gone ${quotesAbsent}`);
  console.log('ABSENT RANKS A ROW FOR PROBING. It is not a closure, and it is not a defect:');
  console.log('measured false-positive classes — a quoted line later EXTENDED (F-1336-2), a shell');
  console.log('command quoted as evidence (F-1336-3), and a quote of another ROW rather than a file.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
