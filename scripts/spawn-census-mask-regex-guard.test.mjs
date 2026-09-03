#!/usr/bin/env node
/**
 * spawn-census-mask-regex-guard — the census's comment/string mask must know a REGEX
 * LITERAL, and must never narrow its own corpus SILENTLY. (F-2465-1, s2465)
 *
 * WHAT WENT WRONG. `spawn-bound-census.mjs` classifies each spawner occurrence as code or
 * not-code with a hand-rolled mask that knew line comments, block comments and strings —
 * and NOT regex literals. It scanned a regex body as ordinary code, so the `'` inside
 * `fixture-teardown.test.mjs:15`'s `(['"`])` opened a phantom string and swallowed the rest
 * of the file. The real, UNBOUNDED `spawnSync(process.execPath, ['--test', ...])` at `:35`
 * never became a row, and the census reported `✅ 0 exposed inside mandated legs` from a
 * corpus that did not contain it. Measured: 9 unbounded SYNC node-child sites in 6 files,
 * every one inside a MANDATED battery leg.
 *
 * WHY IT WAS INVISIBLE TO EVERY EXISTING CHECK. The drop is not an error, a throw, a `catch`
 * or a stale tree — the classes this factory has spent twenty fires curing. It is a
 * SUBTRACTION FROM THE CORPUS, and `unparsed` counts only `topLevelArgs` failures, never
 * mask drops. `triage-instrument-spawn-bound-guard` DOES carry an anti-vacuity arm, and it
 * is green and truthful: its subject set is exactly two triage instruments, neither of which
 * is affected. A guard that asserts a principle where it holds and never where it fails
 * certifies its own blind spot (F-2208-1) — so this guard asserts it where it FAILED.
 *
 * THE ARMS BELOW ARE FIXTURE-DRIVEN ON PURPOSE. A live-tree-only guard would go green the
 * day someone deletes the offending regex from fixture-teardown.test.mjs, which would fix
 * nothing about the mask. The fixtures encode the SHAPE; the live arms pin today's board.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { census, batteryLegs, isExposed } from './spawn-bound-census.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SUBJECT = path.join(HERE, 'spawn-bound-census.mjs');
const BOUND = 240_000;

/** Build a throwaway scripts-like dir and census it. */
function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-spawn-mask-guard-'));
  try {
    for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
    return { dir, result: census(dir) };
  } finally {
    // caller reads the returned result; the dir is disposable immediately
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- THE SHAPE

test('a regex literal holding a quote does NOT hide a later spawn site', () => {
  const body = [
    "const PREFIX = /\\bmkdtemp\\(\\s*(['\"`])([^'\"`]+)\\1\\s*\\)/g;",
    "const run = spawnSync(process.execPath, ['--test', f], { cwd: '.' });",
  ].join('\n');
  const { result } = fixture({ 'subject.mjs': body });
  const rows = result.rows.filter((r) => r.file === 'subject.mjs');
  assert.equal(rows.length, 1,
    'the spawn site after a quote-bearing regex literal must be a census row. This is ' +
    'F-2465-1 exactly: the mask read the regex as a string and swallowed the rest of the file.');
  assert.equal(rows[0].bounded, false, 'the fixture site is unbounded and must be scored so');
  assert.ok(isExposed(rows[0]), 'an unbounded sync node-child spawn must be EXPOSED');
});

test('a spawner genuinely INSIDE a regex literal stays hidden (the mask must still mask)', () => {
  // The needle must contain a LITERAL `spawnSync(` for the census's own `\bspawnSync\s*\(`
  // to match it at all. `/spawnSync\s*\(/` does NOT: after the name comes a backslash. My
  // first draft used that shape, so the arm asserted "0 rows" and passed for the WRONG
  // reason -- there was no occurrence to drop. It was caught only by the `masked > 0`
  // assertion below, which is why that assertion is the load-bearing half of this arm.
  const body = 'const NEEDLE = /spawnSync(node|deno)/;\nmark(NEEDLE);\n';
  const { result } = fixture({ 'subject.mjs': body });
  assert.deepEqual(result.rows.filter((r) => r.file === 'subject.mjs'), [],
    'a spawner quoted inside a regex literal is not a call site — over-correcting the mask ' +
    'into blindness about regexes would manufacture phantom sites (F-2430-1 correction 3).');
  assert.ok(result.masked > 0,
    'and the drop must be COUNTED, not silent: a corpus subtraction nobody counts is exactly ' +
    'how F-2465-1 hid 9 unbounded sites. If this reds while the arm above passes, the fixture ' +
    'contains no matchable occurrence and is asserting nothing.');
});

test('DIVISION is not mistaken for a regex literal (reverse control)', () => {
  // If `/` after `)` or an identifier were read as a regex, everything to the next `/` would
  // be masked away -- re-creating the defect with the opposite cause.
  //
  // THE DIVISION AND THE SPAWN MUST SHARE A LINE, and that is a MEASUREMENT, not a style
  // choice. codeMask resyncs a regex at the newline on purpose (fail small), so a phantom
  // regex opened on one line cannot reach a spawn on the next. My first draft split them
  // across three lines; the reverse-control sweep reddened NOTHING and proved the arm was
  // decoration. Same-line is the only parameterisation that can observe this defect.
  const body = "const share = total / 2; const run = spawnSync('node', [script]);\n";
  const { result } = fixture({ 'subject.mjs': body });
  assert.equal(result.rows.filter((r) => r.file === 'subject.mjs').length, 1,
    'division must not open a phantom regex literal and hide the spawn that follows it');
});

test('property access (re.exec, db.exec) is excluded and counted, not scored as a spawn', () => {
  const body = [
    'const TITLE = /title:\\s*(.+)/g;',
    'while ((m = TITLE.exec(src))) push(m[1]);',
    "db.exec('create table kv (key text primary key)');",
    "const run = execFileSync('node', [script]);",
  ].join('\n');
  const { result } = fixture({ 'subject.mjs': body });
  const rows = result.rows.filter((r) => r.file === 'subject.mjs');
  assert.deepEqual(rows.map((r) => r.fn), ['execFileSync'],
    'only the real child-process call is a row; `TITLE.exec(` and `db.exec(` are method calls');
  assert.ok(result.propertyAccess >= 2, 'and the exclusions must be COUNTED, not silent');
});

// ------------------------------------------------------- THE DECLARATION

test('the census DECLARES both exclusion counts on stdout, always', () => {
  const r = spawnSync(process.execPath, [SUBJECT], { cwd: ROOT, encoding: 'utf8', timeout: BOUND, killSignal: 'SIGKILL' });
  assert.equal(r.status, 0, `census exited ${r.status}: ${r.stderr}`);
  const out = r.stdout ?? '';
  assert.ok(out.length > 0, 'census produced empty stdout — the arm did not run (F-2215-1)');
  assert.match(out, /^excluded: \d+ in comment\/string\/regex · \d+ property access/m,
    'a corpus that can narrow silently must say by how much, on the happy path too (F-2208-1)');
});

test('the banner does not print a green tick beside a non-zero exposed count', () => {
  const r = spawnSync(process.execPath, [SUBJECT], { cwd: ROOT, encoding: 'utf8', timeout: BOUND, killSignal: 'SIGKILL' });
  const out = r.stdout ?? '';
  assert.ok(out.length > 0, 'census produced empty stdout — the arm did not run (F-2215-1)');
  const m = out.match(/^([✅⚠️].*?)\s*(\d+) exposed inside mandated legs/m);
  assert.ok(m, `no verdict banner found in:\n${out}`);
  const [, mark, n] = m;
  if (Number(n) > 0) {
    assert.ok(!mark.includes('✅'),
      'in advisory mode stdout is the whole interface (F-2210-1); a ✅ beside a non-zero ' +
      'count is the false reassurance this instrument exists to prevent');
  }
});

// ------------------------------------------------------------ THE LIVE BOARD

test('the census still SEES the site that proved F-2465-1 (anti-vacuity on the live tree)', () => {
  const rows = census().rows.filter((r) => r.file === 'fixture-teardown.test.mjs');
  assert.ok(rows.length > 0,
    'fixture-teardown.test.mjs contributes NO spawn rows. It carries a real spawnSync and a ' +
    'quote-bearing regex literal above it — zero rows means the mask has regressed and every ' +
    'verdict about this file is being read off an empty corpus.');
  const legs = batteryLegs(ROOT);
  assert.ok(legs.all.has('fixture-teardown.test.mjs'),
    'and it must still be a mandated battery leg, or this arm asserts nothing about gate risk');
});
