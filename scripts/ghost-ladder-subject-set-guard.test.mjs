/**
 * F-2336-1 (measured and cured s2336) — `ghost-ladder-row-guard` DECLARED FOUR CORPORA AND NEVER
 * ITS OWN SUBJECT SET.
 *
 * s2335 handed the next fire a rung in its own words: twenty fires have made instruments DECLARE
 * their corpus and nobody has asked WHO READS THEM. This file is one of the FIVE tools invoked
 * BARE in `test:ledger-guards`, where the only observable is rc.
 *
 * `findGhosts` SELECTS subjects with `masterRows(backlog)` and DELEGATES their classification to
 * `classifyRoot` -- s2334's shape. All three of the classifier's declarations (F-2213-1 reviews,
 * F-2219-1 goals, F-2222-2 corpusTree) ARE read here, and F-2226-1/F-2245-1 were right to carry
 * them across. But every one of them is DOWNSTREAM of the selector, so all four read affirmatively
 * HEALTHY while the selector returns nothing -- and `0 ghost ladder row(s)` is then byte-identical
 * between "I checked four rows and none is a ghost" and "I selected nothing to check".
 *
 * ⚖️ SEVERITY STATED HONESTLY AND DELIBERATELY NOT INFLATED. This is NOT a broken guard and NOT a
 * missed ghost. Measured s2336 over every BACKLOG.md revision since the guard was born at
 * f94055da (2026-08-10): the subject set OSCILLATES -- 37 transitions, e.g. 4fe6445a 0->1 when
 * s2291 authored a master and b2332c00 1->0 when s2293's drain retired the row. An empty subject
 * set is the LAWFUL RESTING STATE OF A DRY BOARD, which is why it is 0 today. The defect is only
 * that the instrument could not TELL you which zero it was reporting.
 *
 * 🚦 THE RESTRAINT IS THE DESIGN, AND IT IS MEASURED RATHER THAN STYLISTIC (F-2218-1): `rows === 0`
 * DECLARES AND DOES NOT REFUSE. Refusing there would red this gate on most dry boards -- i.e. most
 * of the time -- and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate).
 * Arm 4 is the reverse control that catches exactly that over-general cure, and it is the most
 * valuable arm in this file: the refusal is the thing a reader of this finding will be tempted to
 * build, and it is measurably wrong.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const GUARD = fileURLToPath(new URL('./ghost-ladder-row-guard.mjs', import.meta.url));
const SCRIPTS = path.dirname(GUARD);

const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r;
};

/**
 * `backlogBody` is the ONLY variable: same masters, same goals, same tree. `shipped` decides
 * whether the leaf makes `foo` a real ghost, so an arm can separate "no ghosts among N rows"
 * from "no rows" without changing anything else.
 */
function board(backlogBody, { shipped = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-subj-'));
  fs.mkdirSync(path.join(root, 'tasks'));
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# foo\n');
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), backlogBody);
  fs.writeFileSync(
    path.join(root, 'tasks', 'goals.json'),
    JSON.stringify({ goals: shipped ? [{ id: 'foo', taskFile: 'foo.md', status: 'merged', mergeHash: 'a'.repeat(40) }] : [] }),
  );
  git(root, 'init', '-q', '-b', 'main', '.');
  git(root, 'config', 'user.email', 'f@f');
  git(root, 'config', 'user.name', 'f');
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'base');
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const run = (script, cwd, args = ['--strict']) =>
  spawnSync(process.execPath, [script, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });

const declaration = (stdout) => stdout.split('\n').find((l) => l.startsWith('ladder corpus:'));

/**
 * Manufacture a variant on a scratch copy inside scripts/ (so its relative imports resolve --
 * /tmp defeats the module-main guard on macOS, the trap F-2215-1 names). ASSERTS THE EDIT
 * MATCHED: a variant that silently changed nothing goes green having tested nothing.
 */
function variantOf(find, replace, body) {
  const src = fs.readFileSync(GUARD, 'utf8');
  assert.ok(src.includes(find), `variant anchor not found — the guard moved: ${find.slice(0, 60)}`);
  const file = path.join(SCRIPTS, `tmp-subj-variant-${process.pid}-${Math.abs(find.length * 31 + replace.length)}.mjs`);
  fs.writeFileSync(file, src.replace(find, replace));
  try { return body(file); } finally { fs.rmSync(file, { force: true }); }
}

const LADDER_ROW = '# B\n\n- 📋 **[foo]** master tasks/foo.md\n';
// Clipboard rows that name a task path but pass NEITHER naming test -- the live board's own shape
// (measured s2336: 23 clipboard rows, 3 carrying a task path, 0 selected).
const CITATION_ONLY = '# B\n\n- 📋 **F-9000-1 WATCH.** Scope 4 cites `tasks/foo.md`.\n';

test('1 — GROUND TRUTH: a board with a real ghost still reds, and declares the set it checked', () => {
  const b = board(LADDER_ROW, { shipped: true });
  try {
    const r = run(GUARD, b.root);
    assert.ok(r.stdout.trim(), 'control invalid: the arm produced nothing');
    assert.match(r.stdout, /GHOST line 3 tasks\/foo\.md/);
    assert.equal(r.status, 1);
    assert.equal(declaration(r.stdout), 'ladder corpus: 1 master row(s) selected from 1 clipboard-lead row(s).');
  } finally { b.cleanup(); }
});

test('2 — DEFECT: the two zeros must not be byte-identical', () => {
  const checked = board(LADDER_ROW, { shipped: false });   // 1 row checked, no ghost
  const nothing = board(CITATION_ONLY, { shipped: false }); // 0 rows selected
  try {
    const a = run(GUARD, checked.root);
    const c = run(GUARD, nothing.root);
    assert.ok(a.stdout.trim() && c.stdout.trim(), 'control invalid: an arm produced nothing');
    // Both honestly report zero ghosts at rc=0 -- that part is CORRECT and must not change.
    assert.match(a.stdout, /^0 ghost ladder row\(s\)\.$/m);
    assert.match(c.stdout, /^0 ghost ladder row\(s\)\.$/m);
    assert.equal(a.status, 0);
    assert.equal(c.status, 0);
    // ...and the stdout must nevertheless DISTINGUISH them. This is the whole finding.
    assert.notEqual(a.stdout, c.stdout, 'a checked board and an unchecked one are indistinguishable');
    assert.equal(declaration(a.stdout), 'ladder corpus: 1 master row(s) selected from 1 clipboard-lead row(s).');
    assert.equal(declaration(c.stdout), 'ladder corpus: 0 master row(s) selected from 1 clipboard-lead row(s).');
  } finally { checked.cleanup(); nothing.cleanup(); }
});

test('3 — the two numbers are distinct: "no rows at all" differs from "rows that name no master"', () => {
  const bare = board('# B\n\nnothing here\n');
  const cited = board(CITATION_ONLY);
  try {
    const a = run(GUARD, bare.root);
    const c = run(GUARD, cited.root);
    assert.equal(declaration(a.stdout), 'ladder corpus: 0 master row(s) selected from 0 clipboard-lead row(s).');
    assert.equal(declaration(c.stdout), 'ladder corpus: 0 master row(s) selected from 1 clipboard-lead row(s).');
  } finally { bare.cleanup(); cited.cleanup(); }
});

test('4 — REVERSE CONTROL: an empty subject set DECLARES and does NOT refuse', () => {
  const b = board(CITATION_ONLY);
  try {
    const r = run(GUARD, b.root);
    // A dry board selects nothing (measured s2336: that is the lawful resting state, 37
    // transitions across this guard's life). A guard that reds here reds most of the time.
    assert.equal(r.status, 0, 'an empty subject set must not red the gate — see the header');
    assert.doesNotMatch(r.stdout, /CANNOT VERIFY/);
  } finally { b.cleanup(); }
});

test('5 — REVERSE CONTROL: the declaration prints on the HAPPY path, not only on failure', () => {
  const b = board(LADDER_ROW, { shipped: false });
  try {
    const r = run(GUARD, b.root);
    assert.equal(r.status, 0);
    assert.ok(declaration(r.stdout), 'F-2208-1: a declaration that appears only on failure re-creates the ambiguity');
  } finally { b.cleanup(); }
});

test('6 — the declaration prints in ADVISORY mode too, not only under --strict', () => {
  const b = board(LADDER_ROW, { shipped: false });
  try {
    const r = run(GUARD, b.root, []);
    assert.equal(r.status, 0);
    assert.equal(declaration(r.stdout), 'ladder corpus: 1 master row(s) selected from 1 clipboard-lead row(s).');
  } finally { b.cleanup(); }
});

test('7 — MANUFACTURED: dropping the declaration reds arms 2, 3, 5 and 6', () => {
  const b = board(CITATION_ONLY);
  try {
    variantOf('  console.log(`ladder corpus: ${rows} master row(s) selected from ${clipboard} clipboard-lead row(s).`);', '', (file) => {
      const r = run(file, b.root);
      assert.ok(r.stdout.trim(), 'control invalid: the variant produced nothing');
      assert.equal(declaration(r.stdout), undefined, 'the pre-cure shape must be reproducible');
    });
  } finally { b.cleanup(); }
});

test('8 — MANUFACTURED: reporting the CLIPBOARD count as the subject set hides the defect', () => {
  const b = board(CITATION_ONLY);
  try {
    variantOf('`ladder corpus: ${rows} master row(s)', '`ladder corpus: ${clipboard} master row(s)', (file) => {
      const r = run(file, b.root);
      // The mis-wired variant claims one row was checked when none was -- exactly the reassurance
      // the finding is about, so arm 2's equality assertion is what must catch it.
      assert.equal(declaration(r.stdout), 'ladder corpus: 1 master row(s) selected from 1 clipboard-lead row(s).');
    });
  } finally { b.cleanup(); }
});
