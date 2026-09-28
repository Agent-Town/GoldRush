#!/usr/bin/env node
/**
 * is-main.test.mjs: does a script run through a SYMLINKED path still run its main()?
 * (F-LS1-2, reviews/ledger-shape-1.md; small-fixes-1, 2026-09-25. F-SF1-2; is-main-2, 2026-09-26)
 *
 * WHY THIS EXISTS. Thirteen scripts decided "am I the entry point?" by comparing import.meta.url
 * with pathToFileURL(process.argv[1]).href. Node realpaths the entry point and argv[1] keeps the
 * caller's spelling, so under a symlinked path (every macOS mkdtemp: /var is a symlink to
 * /private/var) main() never ran and the tool exited 0 having printed nothing, a silent pass.
 * scripts/is-main.mjs compares real paths on both sides; eleven of the thirteen import it and the
 * two a fixture relocates alone carry a byte-identical copy (arm 7).
 *
 * AND THEN TWENTY-THREE MORE (F-SF1-2, is-main-2, 2026-09-26). The same defect in other spellings:
 * `path.resolve(argv[1]) === fileURLToPath(import.meta.url)` and its reversals, and the unguarded
 * `pathToFileURL(argv[1]).href` that also THROWS on a `node -e` import. Measured before the cure:
 * all twenty-three SILENT through a symlink, rc 0 and 0 B, two of them throwing on import
 * (artifacts/is-main-2/symlink-run-table-before.txt). Nineteen now import isMain; four carry the
 * verbatim copy because something relocates them without is-main.mjs (arm 8, SF12_COPIED says what).
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
 *   8  THE TWENTY-THREE  nineteen import isMain once and call it once; four carry the verbatim copy
 *                        (SF12_COPIED names what relocates each); none reads process.argv[1] outside
 *                        its copy; and the two that threw on a `node -e` import now import.
 *   9  CENSUS            every tracked tool file under scripts/, server/ and ops/ that reads
 *                        process.argv[1] is the helper, a pinned copy, or a NAMED census entry with
 *                        its reason: realpath on both sides (symlink-correct), a basename match, or
 *                        OWED (the same defect outside is-main-2's firewall, F-IM2-1). A new reader
 *                        reds; a cured owed entry reds until it leaves the table.
 *  10  SPELLINGS         every spelling the twenty-three and the owed files carried, evaluated in
 *                        process with import.meta.url the REAL url (the premise arm 1 proves): true
 *                        by the real path, false by a symlinked one, and the unguarded form throws
 *                        with no argv[1]. So each census entry is a measured defect, not a pattern
 *                        match.
 *  11  THE NAMED TWO     server/ledger/serve.mjs and ruling-propagation-guard.mjs, the two the
 *                        master names first: the same exit code and output through a symlinked path
 *                        as through the real one, and their pre-cure line (restored in a relocated
 *                        copy, nothing else changed) exits 0 having printed nothing through a link.
 *
 * SAFETY OF THE CLEANUP. Every symlink here is unlinked by name before the scratch tree is removed.
 * Two kinds point outside the scratch tree: FILE links to single scripts, and one DIRECTORY link to
 * the repository's node_modules, which arm 11 needs so a relocated copy of serve.mjs can still load
 * vite. Unlinking removes the link, never its target, and nothing here removes a path that is not
 * inside a scratch tree, so no cleanup can walk into the repository.
 */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path, { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMain } from './is-main.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const HELPER = join(HERE, 'is-main.mjs');
const GUARD = join(HERE, 'source-pointer-guard.mjs');
const PROBE = join(HERE, 'dry-board-probe.mjs');
const SERVE = join(REPO, 'server', 'ledger', 'serve.mjs');
const RULING = join(HERE, 'ruling-propagation-guard.mjs');

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

// F-SF1-2 (is-main-2): the twenty-three other spellings, repo-relative. Which route each took was
// MEASURED (artifacts/is-main-2/report.md): the import was applied to all twenty-three and every
// test naming or relocating them was run; the four below redded with it, the nineteen did not.
const SF12_IMPORTED = [
  'scripts/blocker-panel-closed-guard.mjs',
  'scripts/desk-state-audit.mjs',
  'scripts/e4-motor-ride.mjs',
  'scripts/e7-playbook-digest.mjs',
  'scripts/evidence-budget.mjs',
  'scripts/evidence-offload.mjs',
  'scripts/evidence-readers.mjs',
  'scripts/frontier-registry.mjs',
  'scripts/gate-battery.mjs',
  'scripts/gazette-backfill-sweep.mjs',
  'scripts/review-evidence-audit.mjs',
  'scripts/row-quote-currency.mjs',
  'scripts/ruling-propagation-guard.mjs',
  'scripts/second-rider.mjs',
  'scripts/spawn-bound-census.mjs',
  'scripts/stream-director.mjs',
  'scripts/stream-showcase.mjs',
  'scripts/terrain-contract-scope.mjs',
  'scripts/ticker-stats.mjs',
];
const SF12_COPIED = {
  'server/ledger/serve.mjs': 'the deploy mirror ships server/ whole and scripts/ by five names, never is-main.mjs, so the droplet door could not load it (deploy-mirror-allowlist.test.mjs walks this import)',
  'scripts/assay-replay-agent.mjs': 'assay-worker.test.mjs copies it beside assay-worker.mjs alone, and the deploy mirror ships it to the assayer by name',
  'scripts/findings-state-guard.mjs': 'backlog-split-closed.test.mjs copies it as a fixed DEPS entry beside ledger-corpus.mjs only',
  'scripts/withheld-evidence-audit.mjs': 'withheld-evidence-audit-guard.test.mjs copies it alone and writes a variant of it alone',
};

// Every spelling of the defect that the twenty-three and the owed files carried. import.meta.url is
// written META_URL, so this file never carries the spelling arm 7 sweeps for; `spelled` restores it.
const SPELLINGS = {
  resolvedArgv: ['process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(META_URL)', 'ten of the twenty-three, and ops/droplet/ledger-backup.mjs'],
  resolvedArgvReversed: ["fileURLToPath(META_URL) === path.resolve(process.argv[1] ?? '')", 'e7-playbook-digest'],
  namedResolve: ['process.argv[1] && resolve(process.argv[1]) === fileURLToPath(META_URL)', 'evidence-budget, evidence-offload, evidence-readers, gazette-backfill-sweep'],
  rawArgv: ['process.argv[1] === fileURLToPath(META_URL)', 'frontier-registry'],
  resolvedOrEmpty: ["path.resolve(process.argv[1] || '') === fileURLToPath(META_URL)", 'spawn-bound-census'],
  unguardedUrl: ['pathToFileURL(process.argv[1]).href === META_URL', 'stream-showcase, stream-director (it also throws with no argv[1])'],
  resolvedUrl: ['process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === META_URL', 'second-rider'],
  guardedUrl: ['process.argv[1] && pathToFileURL(process.argv[1]).href === META_URL', 'ticker-stats'],
  resolvedOrNullish: ["path.resolve(process.argv[1] ?? '') === fileURLToPath(META_URL)", 'withheld-evidence-audit'],
  metaFirstUrl: ['process.argv[1] && META_URL === pathToFileURL(path.resolve(process.argv[1])).href', 'server/ledger/serve.mjs, and server/codex-shim/serve.mjs'],
  bothResolved: ['process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(META_URL))', 'glb-contract-guard'],
  bothResolvedOrEmpty: ["resolve(process.argv[1] || '') === resolve(fileURLToPath(META_URL))", 'modified-tracked-evidence-census, untracked-evidence-durability'],
};
const spelled = (id) => SPELLINGS[id][0].replaceAll('META_URL', 'import.meta.url');

// What each of the twenty-three carried before is-main-2 (artifacts/small-fixes-1/other-main-module-spellings.txt).
const SF12_WAS = {
  'scripts/assay-replay-agent.mjs': 'resolvedArgv',
  'scripts/blocker-panel-closed-guard.mjs': 'resolvedArgv',
  'scripts/desk-state-audit.mjs': 'resolvedArgv',
  'scripts/e4-motor-ride.mjs': 'resolvedArgv',
  'scripts/e7-playbook-digest.mjs': 'resolvedArgvReversed',
  'scripts/evidence-budget.mjs': 'namedResolve',
  'scripts/evidence-offload.mjs': 'namedResolve',
  'scripts/evidence-readers.mjs': 'namedResolve',
  'scripts/findings-state-guard.mjs': 'resolvedArgv',
  'scripts/frontier-registry.mjs': 'rawArgv',
  'scripts/gate-battery.mjs': 'resolvedArgv',
  'scripts/gazette-backfill-sweep.mjs': 'namedResolve',
  'scripts/review-evidence-audit.mjs': 'resolvedArgv',
  'scripts/row-quote-currency.mjs': 'resolvedArgv',
  'scripts/ruling-propagation-guard.mjs': 'resolvedArgv',
  'scripts/second-rider.mjs': 'resolvedUrl',
  'scripts/spawn-bound-census.mjs': 'resolvedOrEmpty',
  'scripts/stream-director.mjs': 'unguardedUrl',
  'scripts/stream-showcase.mjs': 'unguardedUrl',
  'scripts/terrain-contract-scope.mjs': 'resolvedArgv',
  'scripts/ticker-stats.mjs': 'guardedUrl',
  'scripts/withheld-evidence-audit.mjs': 'resolvedOrNullish',
  'server/ledger/serve.mjs': 'metaFirstUrl',
};

// THE CENSUS TABLES (arm 9): readers of process.argv[1] outside isMain, each named with its reason.
// Symlink-correct by construction: a hand-rolled isMain, realpathSync on both sides.
const CENSUS_REALPATH = {
  'scripts/backlog-split-closed.mjs': 'invokedDirectly compares realpathSync of both sides',
  'scripts/first-town-payload.mjs': 'invokedDirectly compares realpathSync of both sides',
  'scripts/kv-to-ledger-migrate.mjs': 'invokedDirectly compares realpathSync of both sides',
  'scripts/ledger-mirror-exposure.mjs': 'sameFile compares realpathSync of both sides',
  'scripts/ledger-mirror-freshness.mjs': 'resolveReal is realpathSync, applied to both sides',
  'scripts/status-rotate-month.mjs': 'invokedDirectly compares realpathSync of both sides',
  'scripts/worktree-registry-ledger.mjs': 'real is realpathSync, applied to both sides',
};
// A NAME match, not a path comparison: it survives a symlink that keeps the file's name and goes
// silent through one that renames it. Not the F-SF1-2 comparison; candidates for isMain (F-IM2-3).
const CENSUS_BASENAME = {
  'scripts/f-astra-6-census.mjs': 'argv[1] ends with the file name',
  'scripts/lane-absorbed-lines.mjs': 'argv[1] matches the file name',
  'scripts/lane-usable.mjs': 'argv[1] matches the file name',
  'scripts/ledger-mirror-dest.mjs': 'argv[1] ends with the file name',
};
// OWED (F-IM2-1): the F-SF1-2 defect itself, in files outside is-main-2's firewall. The list of
// twenty-three missed them (all five were on disk when it was made): three wrap both sides in
// resolve(), two sit outside scripts/. Each value is the SPELLINGS entry the file still carries,
// which arm 10 proves silent through a symlink. Curing one reds this arm until its line leaves here.
const CENSUS_OWED = {
  'ops/droplet/ledger-backup.mjs': 'resolvedArgv',
  'scripts/glb-contract-guard.mjs': 'bothResolved',
  'scripts/modified-tracked-evidence-census.mjs': 'bothResolvedOrEmpty',
  'scripts/untracked-evidence-durability.mjs': 'bothResolvedOrEmpty',
  'server/codex-shim/serve.mjs': 'metaFirstUrl',
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

function node(args, { env, cwd } = {}) {
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL', env, cwd });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

function importOnly(file, cwd) {
  const url = pathToFileURL(file).href;
  return node(['--input-type=module', '-e', `const m = await import(${JSON.stringify(url)}); console.log('exports:' + Object.keys(m).length);`], { cwd });
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

/** 1-based numbers of the lines that read process.argv[1] outside a comment. */
function argvReads(source) {
  return source.split('\n').flatMap((line, i) => (!/^\s*(?:\/\/|\*|\/\*)/.test(line) && /process\.argv(?:\[1\]|\.at\(1\))/.test(line) ? [i + 1] : []));
}

/** First and last line of a top-level function, the same span functionText cuts. */
function lineSpan(source, opening) {
  const start = source.indexOf(opening);
  assert.ok(start >= 0, `${opening} not found`);
  const end = source.indexOf('\n}\n', start);
  assert.ok(end > start, `no closing brace after ${opening}`);
  const lineOf = (index) => source.slice(0, index).split('\n').length;
  return [lineOf(start), lineOf(end + 1)];
}

/** Tracked tool code under scripts/, server/ and ops/: the census corpus (tests excluded). */
function toolFiles() {
  const listed = execFileSync('git', ['ls-files', '-z', '--', 'scripts', 'server', 'ops'], { cwd: REPO, encoding: 'utf8', timeout: 60_000, maxBuffer: 64 << 20 });
  return listed.split('\0').filter((rel) => /\.[cm]?[jt]s$/.test(rel) && !/\.test\.[cm]?[jt]s$/.test(rel));
}

/** Copy a script and every `./x.mjs` it imports, recursively, into dir. Named files only. */
function copyClosure(file, dir, seen = new Set()) {
  const name = basename(file);
  if (seen.has(name)) return seen;
  seen.add(name);
  const source = readFileSync(file, 'utf8');
  writeFileSync(join(dir, name), source);
  for (const m of source.matchAll(/from\s+'\.\/([\w.-]+\.mjs)'/g)) copyClosure(join(dirname(file), m[1]), dir, seen);
  return seen;
}

test('8 THE TWENTY-THREE: nineteen import isMain, four carry the pinned copy, the two that threw now import', () => {
  assert.equal(SF12_IMPORTED.length + Object.keys(SF12_COPIED).length, 23, 'the twenty-three F-SF1-2 listed');
  assert.deepEqual(Object.keys(SF12_WAS).sort(), [...SF12_IMPORTED, ...Object.keys(SF12_COPIED)].sort(), 'SF12_WAS names each of the twenty-three once');
  const original = functionText(readFileSync(HELPER, 'utf8'), 'export function isMain(importMetaUrl) {').replace(/^export /, '');
  for (const rel of SF12_IMPORTED) {
    const source = readFileSync(join(REPO, rel), 'utf8');
    assert.equal(source.split("import { isMain } from './is-main.mjs'").length, 2, `${rel} imports isMain exactly once`);
    assert.equal(source.split('isMain(import.meta.url)').length, 2, `${rel} calls isMain(import.meta.url) exactly once`);
    assert.deepEqual(argvReads(source), [], `${rel} still reads process.argv[1] outside a comment`);
    assert.ok(!source.includes(spelled(SF12_WAS[rel])), `${rel} still carries its old spelling`);
  }
  for (const [rel, why] of Object.entries(SF12_COPIED)) {
    const source = readFileSync(join(REPO, rel), 'utf8');
    assert.doesNotMatch(source, /from\s+'[^']*is-main\.mjs'/, `${rel} must not import is-main.mjs: ${why}`);
    assert.equal(functionText(source, 'function isMain(importMetaUrl) {'), original, `${rel}'s copy of isMain drifted from scripts/is-main.mjs; change them together`);
    assert.equal(source.split('isMain(import.meta.url)').length, 2, `${rel} calls isMain(import.meta.url) exactly once`);
    assert.ok(!source.includes(spelled(SF12_WAS[rel])), `${rel} still carries its old spelling`);
  }
  // The unguarded pair threw ERR_INVALID_ARG_TYPE on any argv-less import before the cure. Imported
  // from a scratch cwd: stream-director loads a cwd-relative .env.local at import time.
  for (const rel of ['scripts/stream-showcase.mjs', 'scripts/stream-director.mjs']) {
    const r = importOnly(join(REPO, rel), scratch());
    assert.equal(r.rc, 0, `${rel} must import with no argv[1]:\n${r.err}`);
    assert.match(r.out, /^exports:[1-9]\d*\n$/, `only the importer printed; ${rel}'s main did not run:\n${r.out}`);
  }
});

test('9 CENSUS: every reader of process.argv[1] in tool code is isMain, a pinned copy, or a named census entry', () => {
  const files = toolFiles();
  assert.ok(files.length > 300, `the census corpus is ${files.length} files: the listing broke`);
  for (const must of ['scripts/is-main.mjs', 'server/ledger/serve.mjs', 'ops/droplet/ledger-backup.mjs']) {
    assert.ok(files.includes(must), `${must} is missing from the census corpus: it is aimed at nothing`);
  }
  const readers = new Map();
  for (const rel of files) {
    const lines = argvReads(readFileSync(join(REPO, rel), 'utf8'));
    if (lines.length) readers.set(rel, lines);
  }
  const copies = [...Object.keys(COPIED).map((name) => `scripts/${name}`), ...Object.keys(SF12_COPIED)];
  const named = new Map([
    ...['scripts/is-main.mjs', ...copies].map((rel) => [rel, 'isMain']),
    ...Object.keys(CENSUS_REALPATH).map((rel) => [rel, 'realpath']),
    ...Object.keys(CENSUS_BASENAME).map((rel) => [rel, 'basename']),
    ...Object.keys(CENSUS_OWED).map((rel) => [rel, 'owed']),
  ]);
  const unnamed = [...readers].filter(([rel]) => !named.has(rel)).map(([rel, lines]) => `${rel}:${lines.join(',')}`);
  assert.deepEqual(unnamed, [],
    'these read process.argv[1] outside isMain: to decide "am I the entry point", import { isMain } from ./is-main.mjs ' +
    '(a pinned copy if something relocates the file without it); otherwise name the reader in a census table with its reason');
  const departed = [...named.keys()].filter((rel) => !readers.has(rel));
  assert.deepEqual(departed, [], 'named in the census but no longer reading process.argv[1]: cured or moved, so take it out of its table');
  // The helper and every pinned copy read argv[1] only inside isMain itself.
  for (const rel of ['scripts/is-main.mjs', ...copies]) {
    const source = readFileSync(join(REPO, rel), 'utf8');
    const opening = rel === 'scripts/is-main.mjs' ? 'export function isMain(importMetaUrl) {' : 'function isMain(importMetaUrl) {';
    assert.ok(source.includes(opening), `${rel} carries no copy of isMain, yet the census counts it as one`);
    const [first, last] = lineSpan(source, opening);
    const outside = readers.get(rel).filter((n) => n < first || n > last);
    assert.deepEqual(outside, [], `${rel} reads process.argv[1] outside isMain`);
  }
  for (const rel of Object.keys(CENSUS_REALPATH)) {
    assert.match(readFileSync(join(REPO, rel), 'utf8'), /realpathSync\s*\(/, `${rel} is censused as realpath on both sides but calls no realpathSync`);
  }
  for (const rel of Object.keys(CENSUS_BASENAME)) {
    const lines = readFileSync(join(REPO, rel), 'utf8').split('\n');
    assert.ok(readers.get(rel).every((n) => /\.endsWith\(|\.test\(/.test(lines[n - 1])), `${rel} is censused as a name match but reads argv[1] another way`);
  }
  for (const [rel, id] of Object.entries(CENSUS_OWED)) {
    assert.ok(readFileSync(join(REPO, rel), 'utf8').includes(spelled(id)), `${rel} no longer carries ${id}: if it is cured, take it out of CENSUS_OWED (F-IM2-1)`);
  }
  // Declared on every run, the happy path included (F-2208-1).
  console.log(`census: ${files.length} tracked tool files under scripts/ server/ ops/; ${readers.size} read process.argv[1]: ` +
    `${copies.length + 1} isMain (the helper and ${copies.length} pinned copies), ${Object.keys(CENSUS_REALPATH).length} realpath on both sides, ` +
    `${Object.keys(CENSUS_BASENAME).length} name matches, ${Object.keys(CENSUS_OWED).length} owed (F-IM2-1)`);
});

test('10 SPELLINGS: every spelling the census forbids is true by the real path and false by a symlinked one', () => {
  const { real, linked } = fixtures();
  const file = join(real, 'new.mjs');
  const viaLink = join(linked, 'new.mjs');
  // What node hands the entry module as import.meta.url: its REAL path (arm 1 proves the premise).
  const url = pathToFileURL(file).href;
  const saved = process.argv[1];
  try {
    for (const [id, [spelling, carriers]] of Object.entries(SPELLINGS)) {
      const check = new Function('path', 'resolve', 'fileURLToPath', 'pathToFileURL', 'META_URL', `return (${spelling});`);
      const evaluate = (argv1) => {
        process.argv[1] = argv1;
        return check(path, path.resolve, fileURLToPath, pathToFileURL, url);
      };
      assert.equal(evaluate(file), true, `${id} (${carriers}) must hold by the real path, or this arm proves nothing`);
      assert.equal(evaluate(viaLink), false, `${id} (${carriers}): the defect is false by a symlinked path`);
      let threw = null;
      try {
        evaluate(undefined);
      } catch (error) {
        threw = error.code ?? String(error);
      }
      assert.equal(threw, id === 'unguardedUrl' ? 'ERR_INVALID_ARG_TYPE' : null, `${id}: with no argv[1]`);
      process.argv[1] = viaLink;
      assert.equal(isMain(url), true, `isMain holds by the same symlinked path (${id})`);
    }
  } finally {
    process.argv[1] = saved;
  }
  for (const id of [...Object.values(SF12_WAS), ...Object.values(CENSUS_OWED)]) assert.ok(SPELLINGS[id], `${id} is not a measured spelling`);
});

test('11a THE PRODUCTION DOOR: server/ledger/serve.mjs runs main through a symlinked path; its pre-cure line did not', () => {
  const base = scratch();
  // Unset, main() throws its first check (SqliteStorage), before vite loads or any port opens.
  const env = { ...process.env };
  delete env.LEDGER_DB_PATH;
  const byReal = node([SERVE], { env });
  assert.equal(byReal.rc, 1, `by its real path main() runs and refuses:\n${byReal.out}${byReal.err}`);
  assert.match(byReal.err, /LEDGER_DB_PATH is required/);
  const byLink = node([link(SERVE, join(base, 'serve.link.mjs'))], { env });
  assert.equal(byLink.rc, 1, `by a symlinked path the door must refuse exactly the same:\n${byLink.out}${byLink.err}`);
  assert.equal(byLink.out, byReal.out, 'same stdout by both spellings');
  assert.equal(byLink.err, byReal.err, 'same stderr by both spellings');

  // The pre-cure source, relocated with what it needs to load (storage.mjs, and vite through a
  // node_modules link), its two main-module lines restored and nothing else.
  const ledgerDir = join(base, 'serve-pre', 'server', 'ledger');
  mkdirSync(ledgerDir, { recursive: true });
  link(join(REPO, 'node_modules'), join(base, 'serve-pre', 'node_modules'));
  writeFileSync(join(ledgerDir, 'storage.mjs'), readFileSync(join(REPO, 'server', 'ledger', 'storage.mjs')));
  const source = readFileSync(SERVE, 'utf8');
  const importLine = "import { fileURLToPath } from 'node:url';";
  const guardLine = 'if (isMain(import.meta.url)) {';
  assert.equal(source.split(importLine).length, 2, 'mutation target (import) not found exactly once: re-read the subject');
  assert.equal(source.split(guardLine).length, 2, 'mutation target (guard) not found exactly once: re-read the subject');
  const pre = join(ledgerDir, 'serve.mjs');
  writeFileSync(pre, source.replace(importLine, "import { fileURLToPath, pathToFileURL } from 'node:url';").replace(guardLine, `if (${spelled('metaFirstUrl')}) {`));
  const preByReal = node([pre], { env });
  assert.equal(preByReal.rc, 1, `control: the pre-cure copy must still refuse by its real path:\n${preByReal.err}`);
  assert.equal(preByReal.err, byReal.err, 'control: the same refusal as the cured door');
  const preByLink = node([link(pre, join(base, 'serve-pre.link.mjs'))], { env });
  assert.equal(preByLink.rc, 0, 'the defect: the production door started through a link exits 0');
  assert.equal(preByLink.out + preByLink.err, '', 'the defect: nothing printed at all');
});

test('11b A NAMED GUARD: ruling-propagation-guard reds a stale refusal by both spellings; its pre-cure line was silent', () => {
  const base = scratch();
  const root = join(base, 'rp');
  mkdirSync(join(root, 'tasks'), { recursive: true });
  mkdirSync(join(root, 'scripts'));
  // One refusal citing a finding the ledger records as RULED: the guard's own stale shape.
  const leaf = { id: 'x', taskFile: 'x.md', status: 'blocked', blockedReason: 'OWNER RULING REQUIRED (F-1219-1).' };
  writeFileSync(join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [{ title: 'root', children: [leaf] }] }));
  writeFileSync(join(root, 'tasks', 'BACKLOG.md'), 'F-1219-1 RULED, harvest 2 / build 3.\n');
  // The guard and its relative imports, is-main.mjs among them (arm 8 asserts the import itself).
  copyClosure(RULING, join(root, 'scripts'));
  const guard = join(root, 'scripts', 'ruling-propagation-guard.mjs');

  const byReal = node([guard]);
  assert.equal(byReal.rc, 1, `by its real path the guard reds the stale refusal:\n${byReal.out}${byReal.err}`);
  assert.match(byReal.out, /STALE REFUSAL/);
  const byLink = node([link(guard, join(base, 'ruling-propagation-guard.link.mjs'))]);
  assert.equal(byLink.rc, 1, `by a symlinked path the cured guard must red exactly the same:\n${byLink.out}${byLink.err}`);
  assert.equal(byLink.out, byReal.out, 'same stdout by both spellings');
  assert.equal(byLink.err, byReal.err, 'same stderr by both spellings');

  const source = readFileSync(guard, 'utf8');
  const importLine = "import { isMain } from './is-main.mjs';\n";
  const guardLine = 'if (isMain(import.meta.url)) {';
  assert.equal(source.split(importLine).length, 2, 'mutation target (import) not found exactly once: re-read the subject');
  assert.equal(source.split(guardLine).length, 2, 'mutation target (guard) not found exactly once: re-read the subject');
  const pre = join(root, 'scripts', 'ruling-propagation-guard.pre-cure.mjs');
  writeFileSync(pre, source.replace(importLine, '\n').replace(guardLine, `if (${spelled('resolvedArgv')}) {`));
  const preByReal = node([pre]);
  assert.equal(preByReal.rc, 1, `control: the pre-cure copy must still red by its real path:\n${preByReal.err}`);
  assert.equal(preByReal.out, byReal.out, 'control: the same stale refusal as the cured guard');
  const preByLink = node([link(pre, join(base, 'ruling-propagation-pre-cure.link.mjs'))]);
  assert.equal(preByLink.rc, 0, 'the defect: rc 0 on a stale refusal');
  assert.equal(preByLink.out + preByLink.err, '', 'the defect: nothing printed at all');
});
