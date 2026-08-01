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
// THE BINDING CONSTRAINT IS ATTRIBUTION, NOT CHECKABILITY (measured s1347)
//   s1346 shipped this reading 28 of 61 open rows as UNRESOLVED and named that
//   bucket the remaining gap. s1347 fixed the largest reason rows landed there
//   (F-1347-1: 46 of 136 citations resolved to nothing because the ledger cites
//   files by bare basename) and made 6 of those rows checkable. ALL SIX then
//   produced FALSE ABSENTS — every one quoted a template, a command, another row,
//   or its own narration. So reach was never the limit. This instrument cannot
//   distinguish "text I am quoting FROM the cited file" from "text I am proposing,
//   commanding, or narrating", and the ledger writes far more of the latter in
//   backticks. Widening reach widens noise at roughly the same rate. Anyone
//   tempted to raise the ABSENT count should read the seven classes the report
//   prints, and expect the marginal row to be noise rather than a find.
//
// USAGE
//   node scripts/row-quote-currency.mjs              # ABSENT rows only
//   node scripts/row-quote-currency.mjs --all        # every open row
//   node scripts/row-quote-currency.mjs --self-test  # controls, both directions

import { execFileSync } from 'node:child_process';
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

// The ledger cites files by BARE BASENAME at least as often as by repo-relative
// path — `fire.md`, `Game.ts`, `goals.json`, `lane-usable.mjs`. Measured s1347 on
// the live board: 46 of 136 citations on open rows resolved to nothing, and 31 of
// those 46 named exactly one tracked file. That is not a cosmetic reporting gap.
// A quote is scored against the union of the row's READABLE paths, so a row that
// cites one resolvable path and three basenames had its quotes searched in a
// quarter of the evidence the row actually pointed at — and the systematic
// direction of that error is FALSE ABSENT, the interesting-looking answer.
// (F-1347-1. This is the fourth false-positive class on this instrument; the
// three s1346 measured are named at the bottom of the report.)
//
// Resolution is deliberately conservative and never guesses:
//   exact      the cited token is a file on disk                  -> use it
//   basename   exactly ONE tracked path ends with the cited token -> use it, and
//              SAY SO in the report, because an inference happened
//   ambiguous  more than one candidate  -> unreadable (a wrong file is worse than
//              no file: it can manufacture both a false ABSENT and a false PRESENT)
//   none       no tracked file has that basename -> unreadable
export function resolveWith(index, rel, isFile) {
  if (isFile(rel)) return { path: rel, how: 'exact' };
  const cands = index.get(rel.split('/').pop()) || [];
  // A cited token with directories in it (`hero/RUN-NOTE.md`) must match the TAIL,
  // not merely the basename — 16 files share RUN-NOTE.md and only the tail tells
  // them apart. When the tail matches nothing, fall back to the basename pool so
  // the ambiguity is reported rather than silently narrowed to zero.
  const tail = cands.filter((c) => c === rel || c.endsWith('/' + rel));
  const pool = tail.length ? tail : cands;
  if (pool.length === 1) return { path: pool[0], how: 'basename' };
  if (pool.length > 1) return { path: null, how: 'ambiguous', candidates: pool };
  return { path: null, how: 'none' };
}

let INDEX = null;
function basenameIndex() {
  if (INDEX) return INDEX;
  INDEX = new Map();
  let tracked = [];
  try {
    tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 })
      .split('\n').filter(Boolean);
  } catch {
    tracked = [];
  }
  for (const p of tracked) {
    const b = p.split('/').pop();
    if (!INDEX.has(b)) INDEX.set(b, []);
    INDEX.get(b).push(p);
  }
  return INDEX;
}

const BODIES = new Map();
function bodyOf(rel) {
  if (!BODIES.has(rel)) {
    try {
      BODIES.set(rel, normalise(fs.readFileSync(path.join(ROOT, rel), 'utf8')));
    } catch {
      BODIES.set(rel, null);
    }
  }
  return BODIES.get(rel);
}

export function makeReader() {
  const notes = new Map();
  const fn = (rel) => {
    const r = resolveWith(basenameIndex(), rel, (p) => {
      try { return fs.statSync(path.join(ROOT, p)).isFile(); } catch { return false; }
    });
    notes.set(rel, r);
    return r.path ? bodyOf(r.path) : null;
  };
  fn.notes = notes;
  return fn;
}

export function probeRow(row, read = makeReader()) {
  const { paths, pairs } = extract(row);
  const cache = new Map();
  const body = (p) => {
    if (!cache.has(p)) cache.set(p, read(p));
    return cache.get(p);
  };
  const missingPaths = paths.filter((p) => body(p) === null);
  const notes = read.notes ?? new Map();
  const inferred = paths.filter((p) => notes.get(p)?.how === 'basename')
    .map((p) => `${p} -> ${notes.get(p).path}`);
  const ambiguous = paths.filter((p) => notes.get(p)?.how === 'ambiguous')
    .map((p) => `${p} (${notes.get(p).candidates.length} candidates)`);

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
    // A quotation's TERMINAL punctuation belongs to the quoter's sentence, not to
    // the quoted file: F-1289-1 quotes "...refuse a re-queue." where
    // scripts/goal-tracker.test.mjs:47 continues "...refuse a re-queue, and while".
    // Relaxing only the trailing mark is safe (it can never match MORE text) and
    // is applied as a FALLBACK so an exact hit is always preferred. (F-1347-2.)
    // Honest size: this rescues 1 of 38 live ABSENT quotes. Fixed because it is
    // correct and free, not because it moved the board.
    const relaxed = needle.replace(/[.,;:!?]+$/, '');
    const hit = readableAll.find((p) => body(p).includes(needle))
      ?? (relaxed !== needle ? readableAll.find((p) => body(p).includes(relaxed)) : undefined);
    if (hit) present.push({ quote: pair.quote, path: hit });
    else absent.push({ quote: pair.quote, paths: readableAll });
  }
  if (!present.length && !absent.length) {
    return { verdict: 'UNRESOLVED', paths, missingPaths, inferred, ambiguous, present, absent };
  }
  // A row is worth probing when a quote it attributes to a file it names is gone.
  return {
    verdict: absent.length ? 'ABSENT' : 'PRESENT',
    paths, missingPaths, inferred, ambiguous, present, absent,
  };
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

  // --- F-1347-1: basename resolution. Pure-function controls first. ---
  const idx = new Map([
    ['fire.md', ['scripts/fire.md']],
    ['Game.ts', ['.s195-probe-bak/Game.ts', 'src/game/Game.ts']],
    ['RUN-NOTE.md', ['assets/a/hero/RUN-NOTE.md', 'assets/b/production-hero/RUN-NOTE.md']],
  ]);
  const noFiles = () => false;
  check('exact path beats the index', resolveWith(idx, 'scripts/fire.md', (p) => p === 'scripts/fire.md').how, 'exact');
  check('unique basename resolves', resolveWith(idx, 'fire.md', noFiles).path, 'scripts/fire.md');
  check('ambiguous basename refuses to guess', resolveWith(idx, 'Game.ts', noFiles).how, 'ambiguous');
  check('unknown basename', resolveWith(idx, 'nope.mjs', noFiles).how, 'none');
  check('tail disambiguates a shared basename', resolveWith(idx, 'hero/RUN-NOTE.md', noFiles).path, 'assets/a/hero/RUN-NOTE.md');

  const resolvingFake = (files, index) => {
    const notes = new Map();
    const fn = (rel) => {
      const r = resolveWith(index, rel, (p) => p in files);
      notes.set(rel, r);
      return r.path && r.path in files ? normalise(files[r.path]) : null;
    };
    fn.notes = notes;
    return fn;
  };

  // MANUFACTURE THE DEFECT. A passing guard never executes its violation path, so
  // a green says nothing about the red (the s1299/s1300 standard). This row cites
  // a bare basename beside a resolvable path; the quote lives in the basename's
  // real file and is absent from the other. Both directions are asserted, so the
  // control proves the FIX changed the verdict rather than merely coexisting with it.
  const basenameRow = 'row `fire.md` and `package.json` reads *"the quick brown fox"* etc';
  const idx2 = new Map([['fire.md', ['scripts/fire.md']], ['package.json', ['package.json']]]);
  check('basename citation no longer manufactures ABSENT', probeRow(
    basenameRow,
    resolvingFake({ 'scripts/fire.md': 'the quick brown fox', 'package.json': '{}' }, idx2),
  ).verdict, 'PRESENT');
  check('...and the old behaviour, reproduced with resolution off', probeRow(
    basenameRow,
    fake({ 'package.json': '{}' }),
  ).verdict, 'ABSENT');

  // The conservative half: an ambiguous citation must stay unreadable. Guessing a
  // file manufactures false PRESENT as readily as false ABSENT, and a false
  // PRESENT is worse — it retires a row that is still live.
  check('ambiguous citation cannot manufacture PRESENT', probeRow(
    'row `Game.ts` reads *"the quick brown fox"*',
    resolvingFake({ 'src/game/Game.ts': 'the quick brown fox' }, idx),
  ).verdict, 'UNRESOLVED');

  // --- F-1347-2: the quoter's terminal punctuation. Both directions asserted. ---
  check('trailing period does not manufacture ABSENT', probeRow(
    'row `scripts/x.mjs` reads *"refuse a re-queue."* etc',
    fake({ 'scripts/x.mjs': 'the status word can refuse a re-queue, and while' }),
  ).verdict, 'PRESENT');
  // The relaxation must stay TERMINAL-only: a quote whose body differs is still gone.
  check('relaxation does not rescue a real absence', probeRow(
    'row `scripts/x.mjs` reads *"refuse a re-queue."* etc',
    fake({ 'scripts/x.mjs': 'this file was rewritten entirely' }),
  ).verdict, 'ABSENT');

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
    if (res.inferred?.length) console.log(`  resolved by basename: ${res.inferred.join(', ')}`);
    if (res.ambiguous?.length) console.log(`  AMBIGUOUS, not searched: ${res.ambiguous.join(', ')}`);
    if (res.missingPaths.length) console.log(`  path not searched: ${res.missingPaths.join(' ')}`);
    for (const a of res.absent) console.log(`  GONE: "${a.quote.slice(0, 160)}"`);
  }
  console.log(`\nopen rows ${rows.length} | rows: PRESENT ${tally.PRESENT} ABSENT ${tally.ABSENT} UNRESOLVED ${tally.UNRESOLVED}`);
  if (all || tally.ABSENT) console.log(`quotes checked ${quotesPresent + quotesAbsent} | present ${quotesPresent} | gone ${quotesAbsent}`);
  console.log('ABSENT RANKS A ROW FOR PROBING. It is not a closure, and it is not a defect.');
  console.log('SEVEN false-positive classes measured so far. Two are fixed; five are inherent,');
  console.log('and together they are why ABSENT is a weak signal that must never be acted on alone:');
  console.log('  1 the quoted line was later EXTENDED, and is alive at its heading   (F-1336-2)');
  console.log('  2 a shell COMMAND quoted as evidence, never file content           (F-1336-3)');
  console.log('  3 a quote of another ROW, or of the row\'s own narration            (F-1305-3)');
  console.log('  4 a TEMPLATE with placeholders, verbatim in no file by construction (F-1319-1)');
  console.log('  5 a tick span used as an ENUMERATION or label, not a quotation      (F-1343-2)');
  console.log('  6 FIXED s1347: a bare-basename citation truncated the evidence set  (F-1347-1)');
  console.log('  7 FIXED s1347: the quoter\'s terminal punctuation                    (F-1347-2)');
  console.log('And absence has NO DIRECTION: a row may quote what IS in a file (gone => premise');
  console.log('rotted) or the text it says is MISSING and ought to be added (gone => still LIVE).');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
