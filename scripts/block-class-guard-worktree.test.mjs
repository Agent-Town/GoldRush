// F-2272-2 — block-class-guard validates the board in its current checkout, while
// drain-block-check must refuse a linked worktree's frozen board. The lawful gate answer is a
// loud skip of only those cross-checks, never a cross-tree comparison or a repo-root skip.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(SCRIPTS, 'block-class-guard.test.mjs');
const DRAIN = path.join(SCRIPTS, 'drain-block-check.mjs');
const roots = [];

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.com',
      GIT_COMMITTER_NAME: 'fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.com',
    },
  });
}

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'f2272-2-'));
  roots.push(root);
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'), readFileSync(DRAIN));
  writeFileSync(path.join(root, 'scripts', 'block-class-guard.test.mjs'), readFileSync(SUBJECT));
  const goals = (extra = []) => JSON.stringify({
    version: 1,
    goals: [{
      id: 'fixture-board',
      tasks: [{
        id: 'base-owner-block',
        taskFile: 'base-owner-block.md',
        status: 'blocked',
        blockClass: 'owner-fork',
        blockedReason: 'fixture owner fork',
      }, ...extra],
    }],
  }, null, 2);
  writeFileSync(path.join(root, 'tasks', 'goals.json'), goals());
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# fixture backlog\n');
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-qm', 'base board']);

  const worktree = path.join(root, 'worktrees', 'lane-x');
  git(root, ['worktree', 'add', '-q', '-b', 'lane/x', worktree]);

  // The branch point matters: main gains a blocked leaf only AFTER the linked worktree exists.
  // A forced-main child therefore sees 2 blocked leaves while the local walker sees 1.
  writeFileSync(path.join(root, 'tasks', 'goals.json'), goals([{
    id: 'main-only-owner-block',
    taskFile: 'main-only-owner-block.md',
    status: 'blocked',
    blockClass: 'owner-fork',
    blockedReason: 'added after the branch point',
  }]));
  git(root, ['add', 'tasks/goals.json']);
  git(root, ['commit', '-qm', 'main board diverges']);
  return { root, worktree };
}

/**
 * Replace a needle in the SUBJECT and ASSERT IT MATCHED (s2430, F-2430-2).
 *
 * `variant()` below only asserted that the edit changed SOMETHING. For a multi-clause variant that
 * is far too weak: if one clause matches and another matches nothing, the whole edit still passes
 * that check while manufacturing a DIFFERENT defect from the one the test names. Measured live —
 * s2430 bounded the subject's spawns (F-2429-2), which changed `{ encoding: 'utf8' }` into
 * `{ timeout: ..., killSignal: ..., encoding: 'utf8' }`; the forced-main-cwd clause below then
 * matched nothing, the variant never forced a cwd, and the test failed with an error naming the
 * WRONG SUBJECT (a `⛔ CANNOT VERIFY` from the linked worktree) instead of saying "my needle is stale".
 *
 * A manufactured-variant guard's needles are string literals in a SIBLING file, so any lawful edit
 * to that sibling can silently un-arm them. The needle must therefore assert its own match count.
 */
function replacedAll(src, needle, replacement, expected) {
  const found = src.split(needle).length - 1;
  assert.equal(
    found, expected,
    `stale variant needle: expected ${expected} occurrence(s) of ${JSON.stringify(needle)} in ` +
    `${path.basename(SUBJECT)}, found ${found}. The subject changed under this guard — re-derive ` +
    'the needle; do NOT weaken the assertion.',
  );
  return src.split(needle).join(replacement);
}

function variant(edit) {
  const src = readFileSync(SUBJECT, 'utf8');
  const out = edit(src);
  assert.notEqual(out, src, 'variant edit matched nothing');
  const dir = mkdtempSync(path.join(tmpdir(), 'f2272-2-variant-'));
  roots.push(dir);
  const file = path.join(dir, 'block-class-guard.test.mjs');
  writeFileSync(file, out);
  return file;
}

function run(file, cwd, env = {}) {
  const childEnv = { ...process.env, ...env };
  delete childEnv.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', file], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd,
    encoding: 'utf8',
    env: childEnv,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  assert.ok(out.length > 0, `control arm produced no output (rc=${r.status})`);
  return { rc: r.status, out };
}

function count(out, label) {
  const m = new RegExp(`^(?:#|ℹ) ${label} (\\d+)$`, 'm').exec(out);
  assert.ok(m, `missing ${label} count in:\n${out}`);
  return Number(m[1]);
}

function verdict(out) {
  return out.split('\n')
    .filter((line) => /^(?:(?:ok|not ok) \d+ - |[✔✖﹣] |(?:#|ℹ) (?:tests|suites|pass|fail|cancelled|skipped|todo) )/.test(line))
    .map((line) => line.replace(/ \([^)]*ms\)/, ''))
    .join('\n');
}

test.after(() => { for (const root of roots) rmSync(root, { recursive: true, force: true }); });

test('linked worktree declares exactly the two reached cross-checks as loud skips', () => {
  const { worktree } = fixture();
  const r = run(SUBJECT, worktree);
  assert.equal(r.rc, 0, r.out);
  assert.equal(count(r.out, 'pass'), 3, r.out);
  assert.equal(count(r.out, 'fail'), 0, r.out);
  assert.equal(count(r.out, 'skipped'), 2, r.out);
  assert.equal((r.out.match(/DECLARED SKIP/g) || []).length, 2, r.out);
  assert.match(r.out, /frozen.*Re-run from the main worktree/i, r.out);
});

test('repo-root verdict and rc are byte-identical to the pre-cure subject', () => {
  const { root } = fixture();
  const pre = variant((src) => src.replaceAll('  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);\n', ''));
  const before = run(pre, root);
  const after = run(SUBJECT, root);
  assert.equal(after.rc, before.rc);
  assert.equal(verdict(after.out), verdict(before.out));
  assert.equal(count(after.out, 'pass'), 5, after.out);
  assert.equal(count(after.out, 'skipped'), 0, after.out);
});

test('manufactured pre-cure spawn reds exactly two arms in the linked worktree', () => {
  const { worktree } = fixture();
  const pre = variant((src) => src.replaceAll('  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);\n', ''));
  const r = run(pre, worktree);
  assert.equal(r.rc, 1, r.out);
  assert.equal(count(r.out, 'fail'), 2, r.out);
  assert.equal(count(r.out, 'pass'), 3, r.out);
});

test('manufactured forced-main cwd is caught by denominator parity', () => {
  const { root, worktree } = fixture();
  const forced = variant((src) => {
    const a = replacedAll(src, '  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);\n', '', 3);
    // Needle re-derived s2430: the subject's spawn options are now BOUNDED, so the literal
    // `{ encoding: 'utf8' }` no longer opens each bag. Anchoring on the CLOSING side is stable
    // across anything prepended inside the braces, and still reaches all three option bags
    // (the shared git `opts` plus the two drain-block-check spawns).
    return replacedAll(a, "encoding: 'utf8' }", "encoding: 'utf8', cwd: process.env.BLOCK_CLASS_MAIN_ROOT }", 3);
  });
  const r = run(forced, worktree, { BLOCK_CLASS_MAIN_ROOT: root });
  assert.equal(r.rc, 1, r.out);
  assert.equal(count(r.out, 'fail'), 1, r.out);
  assert.match(r.out, /this guard sees 1 blocked leaves but drain-block-check --all reports 2/, r.out);
});

test('manufactured unconditional skip is caught at the repo root', () => {
  const { root } = fixture();
  const unconditional = variant((src) => src.replaceAll('if (LINKED_WORKTREE)', 'if (true)'));
  const r = run(unconditional, root);
  assert.equal(r.rc, 0, r.out);
  assert.equal(count(r.out, 'skipped'), 2, r.out);
  assert.notEqual(verdict(r.out), verdict(run(SUBJECT, root).out), 'repo-root neutrality arm must red this variant');
});
