#!/usr/bin/env node
/**
 * is-main.test.mjs: does a script run through a SYMLINKED path still run its main()?
 * (F-LS1-2, reviews/ledger-shape-1.md; small-fixes-1, 2026-09-25)
 *
 * WHY THIS EXISTS. Thirteen scripts decided "am I the entry point?" by comparing import.meta.url
 * with pathToFileURL(process.argv[1]).href. Node realpaths the entry point and argv[1] keeps the
 * caller's spelling, so under a symlinked path (every macOS mkdtemp: /var is a symlink to
 * /private/var) main() never ran and the tool exited 0 having printed nothing, a silent pass.
 * scripts/is-main.mjs compares real paths on both sides; eleven of the thirteen import it and the
 * two a fixture relocates alone carry a byte-identical copy (arm 7).
 *
 * THE ARMS, AND WHY EACH IS HERE
 *   1  CONTROL VALIDITY  a fixture written with the OLD comparison runs by its real path and is
 *                        SILENT (rc 0, 0 B) by a symlinked one: the harness manufactures the real
 *                        defect, so the cure arms below are not vacuous (F-2215-1: control first).
 *   2  CURE              the same fixture written with isMain runs by both spellings.
 *   3  NO ARGV           imported with no argv[1] (node -e), the old UNGUARDED line throws, and
 *                        isMain answers "not main" without throwing (the s1533 half).
 *   4  A REAL GUARD      source-pointer-guard.mjs, one of the thirteen, through a symlinked path
 *                        on a fixture root holding a rotted pointer: rc 1 and the same output as by
 *                        its real path. Its pre-cure source by a symlinked path is rc 0 and silent,
 *                        i.e. the rot it exists to catch would have PASSED.
 *   5  A REAL IMPORT     dry-board-probe.mjs carried the unguarded form, so `node -e` could not even
 *                        import it; now it imports and does not run.
 *   6  UNIT EDGES        in process: a missing, a nonexistent and a symlinked argv[1]; a non-file URL.
 *   7  COVERAGE          eleven scripts import isMain and call it once; the two a fixture
 *                        relocates ALONE (see COPIED) carry a verbatim copy that must match the
 *                        original byte for byte; and no script under scripts/ still carries the
 *                        swept spelling.
 *
 * SAFETY OF THE CLEANUP. Every symlink here is unlinked by name before the scratch tree is removed,
 * and the only symlink whose target is outside the scratch tree is a FILE link to one script, so no
 * cleanup can walk into the repository.
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMain } from './is-main.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const HELPER = join(HERE, 'is-main.mjs');
const GUARD = join(HERE, 'source-pointer-guard.mjs');
const PROBE = join(HERE, 'dry-board-probe.mjs');

// Built, not written, so this file never matches the spelling it sweeps for.
const OLD_COMPARE = ['import.meta.url', '===', 'pathToFileURL(process.argv[1]).href'].join(' ');
const SWEPT = ['import.meta.url', '===', 'pathToFileURL'].join(' ');

const IMPORTED = [
  'claimed-spec-harness-guard.mjs',
  'desk-birth-guard.mjs',
  'desk-carryforward-guard.mjs',
  'desk-declaration-guard.mjs',
  'ghost-ladder-row-guard.mjs',
  'master-shipped-classifier.mjs',
  'phone-hud-entry-census.mjs',
  'source-pointer-guard.mjs',
  'stale-ready-for-gates-guard.mjs',
  'stream-curate.mjs',
  'test-accounts.mjs',
];
// A fixture relocates each of these ALONE into a bare temp dir, where a relative import cannot
// resolve, so each carries a verbatim copy of isMain instead (dry-board-probe.mjs, above headDetached,
// records the constraint). If a fixture ever learns to bring is-main.mjs along, move the script into
// IMPORTED and delete its copy.
const COPIED = {
  'authorable-candidates.mjs': 'authorable-single-read-guard.test.mjs writes it alone into a scratch scripts/ dir',
  'dry-board-probe.mjs': 'dry-board-bucket-verdict-guard.test.mjs writes a variant of it alone as variant.mjs',
};

const MADE = [];
const LINKS = [];
after(() => {
  for (const link of LINKS) {
    try { unlinkSync(link); } catch { /* already gone */ }
  }
  for (const dir of MADE) rmSync(dir, { recursive: true, force: true });
});

let scratchRoot;
function scratch() {
  if (scratchRoot) return scratchRoot;
  const made = mkdtempSync(join(tmpdir(), 'is-main-'));
  MADE.push(made);
  // Real from the start, so "by its real path" really is one; the symlinks below are made on purpose.
  scratchRoot = realpathSync(made);
  return scratchRoot;
}

function link(target, path) {
  symlinkSync(target, path);
  LINKS.push(path);
  return path;
}

function node(args) {
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

function importOnly(file) {
  const url = pathToFileURL(file).href;
  return node(['--input-type=module', '-e', `const m = await import(${JSON.stringify(url)}); console.log('exports:' + Object.keys(m).length);`]);
}

const OLD_FIXTURE = ["import { pathToFileURL } from 'node:url';", `if (process.argv[1] && ${OLD_COMPARE}) console.log('MAIN RAN');`, ''].join('\n');
const OLD_UNGUARDED = ["import { pathToFileURL } from 'node:url';", `if (${OLD_COMPARE}) console.log('MAIN RAN');`, 'export const loaded = true;', ''].join('\n');
const NEW_FIXTURE = [`import { isMain } from ${JSON.stringify(pathToFileURL(HELPER).href)};`, "if (isMain(import.meta.url)) console.log('MAIN RAN');", 'export const loaded = true;', ''].join('\n');

let fixturesMade = false;
function fixtures() {
  const base = scratch();
  const real = join(base, 'real');
  const linked = join(base, 'linked');
  if (!fixturesMade) {
    mkdirSync(real);
    writeFileSync(join(real, 'old.mjs'), OLD_FIXTURE);
    writeFileSync(join(real, 'old-unguarded.mjs'), OLD_UNGUARDED);
    writeFileSync(join(real, 'new.mjs'), NEW_FIXTURE);
    link(real, linked);
    fixturesMade = true;
  }
  return { real, linked };
}

test('1 CONTROL VALIDITY: the old comparison runs by the real path and is silent by a symlinked one', () => {
  const { real, linked } = fixtures();
  const byReal = node([join(real, 'old.mjs')]);
  assert.equal(byReal.rc, 0, byReal.err);
  assert.equal(byReal.out, 'MAIN RAN\n', 'the fixture must work by its real path, or the arm below proves nothing');
  const byLink = node([join(linked, 'old.mjs')]);
  assert.equal(byLink.rc, 0, byLink.err);
  assert.equal(byLink.out, '', 'the manufactured defect: rc 0 and nothing printed under a symlinked path');
});

test('2 CURE: isMain runs main() by the real path and by the symlinked one', () => {
  const { real, linked } = fixtures();
  for (const file of [join(real, 'new.mjs'), join(linked, 'new.mjs')]) {
    const r = node([file]);
    assert.equal(r.rc, 0, r.err);
    assert.equal(r.out, 'MAIN RAN\n', `${file} must run its main`);
  }
});

test('3 NO ARGV: the unguarded old line throws on import; isMain answers "not main"', () => {
  const { real } = fixtures();
  const old = importOnly(join(real, 'old-unguarded.mjs'));
  assert.notEqual(old.rc, 0, 'control: pathToFileURL(undefined) must throw, or this arm measures nothing');
  assert.match(old.err, /ERR_INVALID_ARG_TYPE/);
  const cured = importOnly(join(real, 'new.mjs'));
  assert.equal(cured.rc, 0, cured.err);
  assert.equal(cured.out, 'exports:1\n', 'imported for its exports, and main did not run');
});

test('4 A REAL GUARD: source-pointer-guard through a symlinked path still reds a rotted pointer', () => {
  const base = scratch();
  const root = join(base, 'rotted-root');
  mkdirSync(root);
  // One same-file pointer, cited at line 99 while its declaration sits on line 4 (the guard's own
  // fixture shape, source-pointer-guard.test.mjs arm 1).
  writeFileSync(join(root, 'a.mjs'), ['// the declaration is `target` at :99 and this is the citation', '', '', 'export function target() { return 1; }', ''].join('\n'));

  const byReal = node([GUARD, '--root', root]);
  assert.equal(byReal.rc, 1, `by its real path the guard reds the rot:\n${byReal.out}${byReal.err}`);
  assert.match(byReal.err, /FAIL/);

  const byLink = node([link(GUARD, join(base, 'source-pointer-guard.link.mjs')), '--root', root]);
  assert.equal(byLink.rc, 1, `by a symlinked path the cured guard must red exactly the same:\n${byLink.out}${byLink.err}`);
  assert.equal(byLink.out, byReal.out, 'same stdout by both spellings');
  assert.equal(byLink.err, byReal.err, 'same stderr by both spellings');

  // The pre-cure source: the guard's two main-module lines restored, and nothing else.
  const pre = join(base, 'pre');
  mkdirSync(pre);
  const source = readFileSync(GUARD, 'utf8');
  const importLine = "import { isMain } from './is-main.mjs';";
  const guardLine = 'if (isMain(import.meta.url)) main();';
  assert.equal(source.split(importLine).length, 2, 'mutation target (import) not found exactly once: re-read the subject');
  assert.equal(source.split(guardLine).length, 2, 'mutation target (guard) not found exactly once: re-read the subject');
  writeFileSync(
    join(pre, 'source-pointer-guard.mjs'),
    source.replace(importLine, "import { pathToFileURL } from 'node:url';").replace(guardLine, `if (process.argv[1] && ${OLD_COMPARE}) main();`),
  );
  const preByReal = node([join(pre, 'source-pointer-guard.mjs'), '--root', root]);
  assert.equal(preByReal.rc, 1, `control: the pre-cure copy must still work by its real path:\n${preByReal.err}`);
  const preByLink = node([link(join(pre, 'source-pointer-guard.mjs'), join(base, 'pre-cure.link.mjs')), '--root', root]);
  assert.equal(preByLink.rc, 0, 'the defect: rc 0 on a rotted pointer');
  assert.equal(preByLink.out + preByLink.err, '', 'the defect: nothing printed at all');
});

test('5 A REAL IMPORT: dry-board-probe.mjs imports under node -e and does not run', () => {
  const r = importOnly(PROBE);
  assert.equal(r.rc, 0, `importing the probe with no argv[1] must not throw:\n${r.err}`);
  assert.match(r.out, /^exports:[1-9]\d*\n$/, `only the importer printed; the probe's main did not run:\n${r.out}`);
});

test('6 UNIT EDGES: missing, nonexistent and symlinked argv[1]; a URL that is not a file', () => {
  const { real, linked } = fixtures();
  const saved = process.argv[1];
  try {
    process.argv[1] = undefined;
    assert.equal(isMain(import.meta.url), false, 'no argv[1] is not main');
    process.argv[1] = join(scratch(), 'no-such-dir', 'no-such-file.mjs');
    assert.equal(isMain(import.meta.url), false, 'an unresolvable argv[1] is not main, and does not throw');
    process.argv[1] = join(linked, 'new.mjs');
    assert.equal(isMain(pathToFileURL(join(real, 'new.mjs')).href), true, 'a symlinked argv[1] names the real module');
    process.argv[1] = join(real, 'new.mjs');
    assert.equal(isMain(pathToFileURL(join(linked, 'new.mjs')).href), true, 'and the reverse spelling agrees');
    assert.equal(isMain(pathToFileURL(join(real, 'old.mjs')).href), false, 'a different module is not main');
    assert.equal(isMain('data:text/javascript,0'), false, 'a URL that is not a file is not main');
    assert.equal(isMain(''), false, 'an empty URL is not main');
  } finally {
    process.argv[1] = saved;
  }
});

test('7 COVERAGE: eleven import isMain, two carry a byte-identical copy, none keeps the swept spelling', () => {
  assert.equal(IMPORTED.length + Object.keys(COPIED).length, 13, 'the thirteen scripts F-LS1-2 swept');
  for (const name of IMPORTED) {
    const source = readFileSync(join(HERE, name), 'utf8');
    assert.equal(source.split("import { isMain } from './is-main.mjs';").length, 2, `${name} imports isMain exactly once`);
    assert.equal(source.split('isMain(import.meta.url)').length, 2, `${name} calls isMain(import.meta.url) exactly once`);
    assert.ok(!source.includes(SWEPT), `${name} still carries the swept spelling`);
  }
  const original = functionText(readFileSync(HELPER, 'utf8'), 'export function isMain(importMetaUrl) {').replace(/^export /, '');
  for (const [name, why] of Object.entries(COPIED)) {
    const source = readFileSync(join(HERE, name), 'utf8');
    assert.ok(!source.includes("from './is-main.mjs'"), `${name} must not import a sibling: ${why}`);
    assert.equal(functionText(source, 'function isMain(importMetaUrl) {'), original, `${name}'s copy of isMain drifted from scripts/is-main.mjs; change them together`);
    assert.equal(source.split('isMain(import.meta.url)').length, 2, `${name} calls isMain(import.meta.url) exactly once`);
    assert.ok(!source.includes(SWEPT), `${name} still carries the swept spelling`);
  }
  const carriers = readdirSync(HERE)
    .filter((name) => name.endsWith('.mjs') && readFileSync(join(HERE, name), 'utf8').includes(SWEPT))
    .sort();
  assert.deepEqual(carriers, [], 'scripts carrying the symlink-fragile main-module spelling: use isMain from ./is-main.mjs');
});

/** The text of a top-level function, from its opening line to the first closing brace at column 0. */
function functionText(source, opening) {
  const start = source.indexOf(opening);
  assert.ok(start >= 0, `${opening} not found`);
  const end = source.indexOf('\n}\n', start);
  assert.ok(end > start, `no closing brace after ${opening}`);
  return source.slice(start, end + 2);
}
