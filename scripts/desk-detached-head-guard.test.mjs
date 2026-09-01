/**
 * F-2332-1 — A MAIN WORKTREE CAN BE FROZEN TOO, AND 'main' IS THE MODAL HEALTHY VALUE.
 *
 * `corpusTree` answers WHICH TREE; `frozenTreeCheck` was using that as a proxy for
 * IS THIS CORPUS FRESH. They come apart in the main worktree: a DETACHED HEAD there
 * reports 'main' — the value a correct run prints — while STATUS.md and
 * tasks/BACKLOG.md are frozen at that commit exactly as in the linked worktree the
 * family has refused since F-2232-1.
 *
 * Measured s2332, ground truth = a REAL silent desk drop on main:
 *   healthy main worktree             -> rc=1, names the dropped id   (control)
 *   frozen LINKED worktree            -> rc=2, REFUSING               (already cured)
 *   same repo, main worktree DETACHED -> rc=0, `PASS — every item...` (this defect)
 * The false PASS differed from a genuinely clean board in ONE substring: the session
 * label of the desk it happened to read.
 *
 * ⚠️ THE ARMS BELOW ASSERT THEY REACHED THE BRANCH UNDER TEST (F-2227-1), not merely
 * that the tool produced bytes — every arm here prints `corpus tree : main`, so a
 * fixture that silently failed to detach would otherwise pass for the wrong reason.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-carryforward-guard.mjs');
const SRC = path.join(HERE, 'corpus-tree.mjs');

const BACKLOG = `# BACKLOG
🔺 **F-AAA-1** first thing the owner must rule on. GATE: owner ruling.
🔺 **F-BBB-1** second thing the owner must rule on. GATE: owner ruling.
`;
const deskBoth = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-AAA-1** first item. 🔺 **F-BBB-1** second item.";
const deskDropped = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-AAA-1** first item.";
const h1 = `Last updated: 2026-08-20T10:00Z s1001 handoff, lock CLEARED — first. ${deskBoth}`;
const h2 = `Last updated: 2026-08-21T10:00Z s1002 handoff, lock CLEARED — second. ${deskBoth}`;
const h3 = `Last updated: 2026-08-22T10:00Z s1003 handoff, lock CLEARED — drops one silently. ${deskDropped}`;
const h3c = `Last updated: 2026-08-22T10:00Z s1003 handoff, lock CLEARED — carries both. ${deskBoth}`;

const statusText = (l1, arch) =>
  [l1, ...arch.map((a) => `- **s${a.n} handoff (line-1 archive):** ${a.line}`), '', '## body'].join('\n');

/** A scratch repo whose `main` branch carries a silent drop (or an honest carry). */
function buildRepo({ dropOnMain = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'f2332-'));
  const git = (args, cwd = root) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git(['init', '-q', '-b', 'main']);
  git(['config', 'user.email', 'f@f']);
  git(['config', 'user.name', 'f']);
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks/BACKLOG.md'), BACKLOG);
  writeFileSync(path.join(root, 'STATUS.md'), statusText(h2, [{ n: 1001, line: h1 }]));
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'clean']);
  const cleanSha = git(['rev-parse', 'HEAD']).trim();
  writeFileSync(
    path.join(root, 'STATUS.md'),
    statusText(dropOnMain ? h3 : h3c, [{ n: 1002, line: h2 }, { n: 1001, line: h1 }])
  );
  git(['add', '-A']);
  git(['commit', '-q', '-m', dropOnMain ? 'silent drop' : 'honest carry']);
  return { root, cleanSha, git, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

/** A non-git root — the shape every legacy fixture in this family uses. */
function plainRoot(line1, archives) {
  const root = mkdtempSync(path.join(tmpdir(), 'f2332p-'));
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks/BACKLOG.md'), BACKLOG);
  writeFileSync(path.join(root, 'STATUS.md'), statusText(line1, archives));
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const run = (cwd) => {
  const r = spawnSync(process.execPath, [GUARD], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: String(r.stdout || ''), err: String(r.stderr || '') };
};

// ---------------------------------------------------------------- defect arms

test('1. a DETACHED main worktree REFUSES rather than certifying a board it never read', () => {
  const f = buildRepo();
  try {
    f.git(['checkout', '-q', '--detach', f.cleanSha]);
    const r = run(f.root);
    // validity: this arm is worthless unless the tree really classified as 'main'
    assert.match(r.out, /corpus tree\s+: main/, 'arm never reached the main-tree branch');
    assert.equal(r.rc, 2, 'a frozen tree must refuse with 2 = "could not answer"');
    assert.match(r.err, /REFUSING/);
    assert.match(r.err, /DETACHED/);
    assert.doesNotMatch(r.out, /PASS —/, 'must not certify a board it never read');
  } finally {
    f.cleanup();
  }
});

test('2. the refusal is distinguishable from a GENUINELY clean board on both channels', () => {
  const bad = buildRepo({ dropOnMain: true });
  const good = buildRepo({ dropOnMain: false });
  try {
    bad.git(['checkout', '-q', '--detach', bad.cleanSha]);
    const spurious = run(bad.root);
    const clean = run(good.root);
    // control asserts its own validity first (F-2215-1)
    assert.equal(clean.rc, 0, 'control invalid: a clean board must pass');
    assert.match(clean.out, /PASS —/);
    assert.notEqual(spurious.rc, clean.rc, 'pre-cure these were both rc=0');
    assert.notEqual(spurious.out, clean.out);
  } finally {
    bad.cleanup();
    good.cleanup();
  }
});

test('3. the SAME board from a healthy main worktree still FAILS loudly and names the id', () => {
  // The control that gives arm 1 its meaning: the defect is detectable when the
  // tree is fresh, so a PASS from the detached arm was a miss, not an absence.
  const f = buildRepo();
  try {
    const r = run(f.root);
    assert.match(r.out, /corpus tree\s+: main/);
    assert.equal(r.rc, 1, 'a real silent drop is ANSWERED, not refused');
    assert.match(r.err, /F-BBB-1/);
  } finally {
    f.cleanup();
  }
});

// ------------------------------------------------------------- reverse controls

test('4. REVERSE CONTROL — a clean main worktree ON a branch still PASSES', () => {
  // The prescribed invocation. A fire's own main worktree is on `main` for its
  // entire working life; refusing here would red every lawful handoff (F-1460-1).
  const f = buildRepo({ dropOnMain: false });
  try {
    const r = run(f.root);
    assert.match(r.out, /corpus tree\s+: main/, 'arm never reached the main-tree branch');
    assert.equal(r.rc, 0);
    assert.match(r.out, /PASS —/);
  } finally {
    f.cleanup();
  }
});

test('5. REVERSE CONTROL — a NON-GIT root must not be refused', () => {
  // Load-bearing, not decoration: every legacy fixture in this family builds a
  // non-git temp root, and 'no-git' must keep falling through to the permissive
  // return. This is F-2243-1's restraint, and an inequality-shaped cure breaks it.
  const c = plainRoot(h2, [{ n: 1001, line: h1 }]);
  try {
    const r = run(c.root);
    assert.equal(r.rc, 0, 'a non-git root is lawful and must proceed');
    assert.doesNotMatch(r.err, /REFUSING/);
  } finally {
    c.cleanup();
  }
});

test('6. REVERSE CONTROL — an uncommitted STATUS.md on main is NOT refused', () => {
  // This is the state a fire is in for its whole working life: line-1 rewritten in
  // the working tree and not yet committed. Any freshness test that compared local
  // text to `main:STATUS.md` would refuse here — which is exactly why the cure keys
  // on DETACHMENT and not on "does line-1 match main".
  const f = buildRepo({ dropOnMain: false });
  try {
    writeFileSync(
      path.join(f.root, 'STATUS.md'),
      statusText(`Last updated: 2026-08-23T09:00Z s1004 handoff, lock CLEARED — mid-fire edit. ${deskBoth}`,
        [{ n: 1003, line: h3c }, { n: 1002, line: h2 }])
    );
    const r = run(f.root);
    assert.match(r.out, /corpus tree\s+: main/);
    assert.equal(r.rc, 0, 'an uncommitted handoff edit is lawful and must not refuse');
    assert.doesNotMatch(r.err, /REFUSING/);
  } finally {
    f.cleanup();
  }
});

test('9. a git that cannot answer the HEAD question REFUSES — and does NOT cry "detached"', () => {
  // The failure value must land on the side that NOTICES (F-2212-1), and it must
  // name the act it owes (F-2225-1): an unanswered probe is an INSTRUMENT failure,
  // not an accusation about the tree. Board is genuinely clean, so a PASS here
  // would be a pass over an unread question rather than over a defect.
  const f = buildRepo({ dropOnMain: false });
  const shim = mkdtempSync(path.join(tmpdir(), 'f2332-shim-'));
  try {
    const real = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim();
    assert.ok(real, 'cannot resolve a real git to wrap — the shim would be vacuous');
    writeFileSync(
      path.join(shim, 'git'),
      `#!/bin/bash\nfor a in "$@"; do if [ "$a" = "symbolic-ref" ]; then exit 3; fi; done\nexec ${real} "$@"\n`
    );
    chmodSync(path.join(shim, 'git'), 0o755);
    const r = spawnSync(process.execPath, [GUARD], {
      timeout: 240_000, killSignal: 'SIGKILL',
      cwd: f.root, encoding: 'utf8', env: { ...process.env, PATH: `${shim}:${process.env.PATH}` },
    });
    const err = String(r.stderr || '');
    assert.match(String(r.stdout || ''), /corpus tree\s+: main/, 'arm never reached the main-tree branch');
    assert.equal(r.status, 2, 'an unanswerable instrument question must refuse');
    assert.match(err, /REFUSING/);
    assert.doesNotMatch(err, /is DETACHED/, 'must not accuse the tree of a state it never measured');
    assert.match(err, /INSTRUMENT failure/);
  } finally {
    f.cleanup();
    rmSync(shim, { recursive: true, force: true });
  }
});

// ------------------------------------------------------- the shape of the cure

test('7. frozenTreeCheck tests the failure value EXPLICITLY, not by inequality alone', () => {
  // F-2243-1's lesson, applied to the arm added beside it: `!== 'on-branch'` would
  // put 'unverifiable' on the REFUSING side, turning an instrument failure into a
  // frozen-tree accusation; `=== 'detached'` names the one state that is unlawful.
  const body = readFileSync(SRC, 'utf8');
  const fn = body.slice(body.indexOf('export function frozenTreeCheck'));
  assert.match(fn, /===\s*'detached'/, 'frozenTreeCheck no longer tests detachment explicitly');
  assert.match(fn, /tree === 'main'/, 'the detached arm must be scoped to the main tree');
});

test('8. headDetached separates a failure value from both real answers', () => {
  const body = readFileSync(SRC, 'utf8');
  const fn = body.slice(body.indexOf('export function headDetached'), body.indexOf('export function detachedHeadRefusal'));
  for (const v of ["'on-branch'", "'detached'", "'unverifiable'"]) {
    assert.ok(fn.includes(v), `headDetached no longer returns ${v}`);
  }
});
