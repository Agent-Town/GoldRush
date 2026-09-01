// F-2220-1 — nul-audit must declare the corpus its universal banner speaks for.
//
// WHY THIS SUITE EXISTS. `nul-audit` prints "CLEAN — no raw NUL bytes in tracked text
// sources": a universal claim over a set it never counted. `git ls-files` is CWD-RELATIVE,
// so from a subdirectory the scan silently narrows to that subtree and still prints CLEAN.
// Measured s2220 on a scratch repo whose ground truth was ONE NUL-bearing tracked file:
// from the root -> rc=1 and the file named; from `scripts/` -> CLEAN, rc=0, BYTE-IDENTICAL
// on stdout, stderr AND rc to a genuinely clean board.
//
// Every red arm below is PROVEN BY MANUFACTURING THE DEFECT on a scratch repo — a passing
// guard never executes its violation path, so its green is not evidence about its red.
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AUDIT = fileURLToPath(new URL('./nul-audit.mjs', import.meta.url));
const NUL = String.fromCharCode(0);
const roots = [];

/** A throwaway repo. `withNul` decides the GROUND TRUTH the arms are measured against. */
function scratch({ withNul }) {
  // realpath: on macOS /tmp is a symlink to /private/tmp, and an unresolved path makes the
  // root/cwd comparison report a false narrowing (the trap that made an s2215 control vacuous).
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 's2220-nul-')));
  roots.push(root);
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  mkdirSync(path.join(root, 'src'), { recursive: true });
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' });
  git('init', '-q', '.');
  git('config', 'user.email', 'f@f');
  git('config', 'user.name', 'f');
  writeFileSync(path.join(root, 'scripts', 'note.md'), 'a clean file under scripts/\n');
  if (withNul) writeFileSync(path.join(root, 'src', 'Game.ts'), `const D = "a${NUL}b";\n`);
  else writeFileSync(path.join(root, 'src', 'Game.ts'), 'const D = "ab";\n');
  git('add', '-A');
  git('commit', '-qm', 'seed');
  return root;
}

const run = (cwd, ...args) => {
  const r = spawnSync(process.execPath, [AUDIT, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
};

test.after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }); });

test('1 · from the repo root it still FINDS a NUL and still exits 1 (the cure is not a mute button)', () => {
  const root = scratch({ withNul: true });
  const r = run(root);
  assert.equal(r.rc, 1, r.out + r.err);
  assert.match(r.out, /carry raw NUL bytes/);
  assert.match(r.out, /src\/Game\.ts/);
});

test('2 · a narrowed scan REFUSES with 2 rather than printing the happy-path verdict', () => {
  const root = scratch({ withNul: true });
  const r = run(path.join(root, 'scripts'));
  // The whole finding: pre-cure this arm was `CLEAN`, rc=0, byte-identical to arm 4.
  assert.equal(r.rc, 2, r.out + r.err);
  assert.match(r.out, /CANNOT VERIFY/);
  assert.match(r.out, /narrowed/);
  // Key on the VERDICT LINE, not the substring: the refusal text itself says the word
  // "CLEAN" while explaining what that banner would have claimed.
  assert.doesNotMatch(r.out, /nul-audit: CLEAN/);
});

test('3 · 2 = "could not answer" is kept DISTINCT from 1 = "answered, and the answer refuses"', () => {
  const withNul = run(scratch({ withNul: true }));
  const narrowed = run(path.join(scratch({ withNul: true }), 'scripts'));
  assert.equal(withNul.rc, 1);
  assert.equal(narrowed.rc, 2);
  assert.notEqual(withNul.rc, narrowed.rc);
});

test('4 · REVERSE CONTROL — a genuinely clean board at the root still passes, quietly', () => {
  const root = scratch({ withNul: false });
  const r = run(root);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /CLEAN/);
});

test('5 · the corpus declaration prints on the HAPPY PATH too (F-2208-1)', () => {
  // A declaration that appears only on failure re-creates the ambiguity it removes.
  const r = run(scratch({ withNul: false }));
  assert.equal(r.rc, 0);
  assert.match(r.out, /corpus \d+ text subject\(s\)/);
  assert.match(r.out, /\d+ read/);
});

test('6 · the declaration states a REAL denominator, not a constant', () => {
  const a = run(scratch({ withNul: false }));
  const subjects = Number(a.out.match(/corpus (\d+) text subject/)[1]);
  // seed is scripts/note.md + src/Game.ts -> exactly 2 text subjects
  assert.equal(subjects, 2, a.out);
  assert.match(a.out, /2 read/);
});

test('7 · a refusal SPEAKS under --quiet — a refusal is not a report', () => {
  // Per F-2211-1 a caller that classifies stdout reads an empty string as silence, so the
  // one mode whose purpose is "exit code only" must still say why it could not answer.
  const r = run(path.join(scratch({ withNul: true }), 'scripts'), '--quiet');
  assert.equal(r.rc, 2);
  assert.match(r.out, /CANNOT VERIFY/);
});

test('8 · --quiet still says NOTHING on a genuine happy path (the cure is not noise)', () => {
  const r = run(scratch({ withNul: false }), '--quiet');
  assert.equal(r.rc, 0);
  assert.equal(r.out, '');
});

test('9 · outside any repository it refuses with 2, not a stack trace at rc=1', () => {
  const bare = realpathSync(mkdtempSync(path.join(tmpdir(), 's2220-bare-')));
  roots.push(bare);
  const r = run(bare);
  assert.equal(r.rc, 2, r.out + r.err);
  assert.match(r.out, /CANNOT VERIFY/);
  assert.match(r.out, /unverifiable/);
});

test('10 · REVERSE CONTROL — an unreadable member DECLARES but must NOT refuse', () => {
  // F-2218-1's restraint. A deleted-but-tracked entry is a lawful, routine state; refusing
  // there would red on ordinary work and be excused into uselessness inside a week
  // (F-1460-1). It is a hole in the denominator, so it is counted and NAMED, not dropped.
  const root = scratch({ withNul: false });
  rmSync(path.join(root, 'src', 'Game.ts')); // tracked, now absent from the worktree
  const r = run(root);
  assert.equal(r.rc, 0, r.out + r.err); // declares, does not refuse
  assert.match(r.out, /1 UNREADABLE/);
  assert.match(r.out, /not audited: src\/Game\.ts/);
  assert.match(r.out, /CLEAN/);
});
