/**
 * withheld-evidence-audit-guard.test.mjs — guards F-2477-1's cure.
 *
 * The subject is `scripts/withheld-evidence-audit.mjs`, which reads the
 * `[lane-runner-v3] withheld baseline-dirty path:` lines out of tasks/runs/*.log
 * and asks whether each withheld path survived anywhere.
 *
 * THE ARM THAT MATTERS MOST IS THE ANCHOR (arm 1).
 * Run logs EMBED transcripts, diff hunks and grep output, so they quote the
 * runner's own printf. Measured s2477 over 341 live logs: a bare substring key
 * matches 6 files, the anchored key 5 — the sixth withheld nothing at all. An
 * unanchored census sends a fire chasing a run that never lost anything, which
 * is F-2102-1's defect on a new key. Manufacturing that defect (dropping the
 * startsWith anchor) MUST red.
 *
 * The fixture repo is a REAL git repo and the subject is COPIED into it, because
 * the subject anchors its corpus to import.meta.url on purpose (F-2220-1) — so
 * the only honest way to aim it at a fixture is to relocate it, which doubles as
 * the "a relocated copy must still be correct" control (F-2221-1).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('./withheld-evidence-audit.mjs', import.meta.url));
const NEEDLE = '[lane-runner-v3] withheld baseline-dirty path: ';

const run = (cwd, args, script = 'scripts/withheld-evidence-audit.mjs') =>
  spawnSync('node', [script, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 240_000,
    killSignal: 'SIGKILL',
  });

/**
 * Build a fixture repo whose ground truth is known:
 *   - artifacts/kept.txt      committed  -> TRACKED
 *   - artifacts/here.txt      on disk, untracked -> ON-DISK (recoverable)
 *   - artifacts/gone.txt      never existed      -> LOST
 * plus a NARRATION-ONLY log that must contribute nothing.
 */
function fixture({ withNarrationOnly = true, subject = SUBJECT } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'withheld-guard-'));
  const g = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'guard@example.com');
  g('config', 'user.name', 'guard');

  mkdirSync(path.join(root, 'artifacts'), { recursive: true });
  mkdirSync(path.join(root, 'tasks', 'runs'), { recursive: true });
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  cpSync(subject, path.join(root, 'scripts', 'withheld-evidence-audit.mjs'));

  writeFileSync(path.join(root, 'artifacts', 'kept.txt'), 'kept\n');
  g('add', 'artifacts/kept.txt');
  g('commit', '-q', '-m', 'fixture: the kept evidence');

  // untracked but present -> ON-DISK
  writeFileSync(path.join(root, 'artifacts', 'here.txt'), 'here\n');

  writeFileSync(
    path.join(root, 'tasks', 'runs', '20260101-000000-lane-x-real.md.log'),
    [
      'some ordinary run output',
      NEEDLE + 'artifacts/kept.txt',
      NEEDLE + 'artifacts/here.txt',
      NEEDLE + 'artifacts/gone.txt',
      'more output',
    ].join('\n') + '\n',
  );

  if (withNarrationOnly) {
    // A log that only QUOTES the emitter: a diff hunk and a grep hit. These are
    // the exact two shapes the live corpus contains. Neither is a withholding.
    writeFileSync(
      path.join(root, 'tasks', 'runs', '20260101-010000-lane-y-narrated.md.log'),
      [
        'the task edited the runner and showed its diff:',
        `+      printf '[lane-runner-v3] withheld baseline-dirty path: %s\\n' "$path" >> "$log"`,
        `scripts/lane-runner-v3.sh:91:      printf '[lane-runner-v3] withheld baseline-dirty path: %s\\n' "$path"`,
        '  ' + NEEDLE + 'artifacts/indented-not-emitted.txt',
      ].join('\n') + '\n',
    );
  }
  return root;
}

/** Copy the subject with one edit applied, to manufacture a defect. */
function variantOf(find, replace) {
  const src = readFileSync(SUBJECT, 'utf8');
  assert.ok(src.includes(find), `variant precondition: subject must contain ${JSON.stringify(find.slice(0, 60))}`);
  const out = mkdtempSync(path.join(tmpdir(), 'withheld-variant-')) + '/variant.mjs';
  writeFileSync(out, src.replace(find, replace));
  return out;
}

test('1 — the needle is ANCHORED: a log that only NARRATES the line contributes nothing (F-2102-1)', () => {
  const root = fixture();
  try {
    const r = run(root, ['--list']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /runs that withheld\s+:\s*1\b/, 'only the REAL log withheld anything');
    assert.ok(
      !r.stdout.includes('indented-not-emitted'),
      'an indented (quoted) needle must not be read as an emitted withholding',
    );
    assert.ok(!r.stdout.includes('lane-y-narrated'), 'the narration-only log must not appear as a withholding run');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('2 — ground truth: TRACKED / ON-DISK / LOST are told apart', () => {
  const root = fixture();
  try {
    const r = run(root, ['--list']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /TRACKED\s+\(on main\)\s+1\s+1/);
    assert.match(r.stdout, /ON-DISK\s+\(untracked, HERE\)\s+1\s+1/);
    assert.match(r.stdout, /LOST\s+\(no ref, no disk\)\s+1\s+1/);
    assert.match(r.stdout, /LOST\s+artifacts\/gone\.txt/);
    assert.match(r.stdout, /ON-DISK\s+artifacts\/here\.txt/);
    assert.ok(!/\bTRACKED\s+artifacts\/kept\.txt/.test(r.stdout), 'a tracked path is not owed work');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('3 — the corpus is declared on the HAPPY path too (F-2208-1)', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'withheld-clean-'));
  try {
    const g = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
    g('init', '-q', '-b', 'main');
    g('config', 'user.email', 'g@e.com');
    g('config', 'user.name', 'g');
    mkdirSync(path.join(root, 'tasks', 'runs'), { recursive: true });
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    cpSync(SUBJECT, path.join(root, 'scripts', 'withheld-evidence-audit.mjs'));
    writeFileSync(path.join(root, 'seed.txt'), 'x\n');
    g('add', 'seed.txt');
    g('commit', '-q', '-m', 'seed');
    writeFileSync(path.join(root, 'tasks', 'runs', 'quiet.log'), 'nothing withheld here\n');

    const r = run(root, []);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /corpus\s+:\s*read \(1 run log\(s\) read\)/, 'declared even when nothing is owed');
    assert.match(r.stdout, /NOTHING OWED/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('4 — an ABSENT corpus REFUSES; it never reads as "nothing was withheld"', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'withheld-nocorpus-'));
  try {
    const g = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
    g('init', '-q', '-b', 'main');
    g('config', 'user.email', 'g@e.com');
    g('config', 'user.name', 'g');
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    cpSync(SUBJECT, path.join(root, 'scripts', 'withheld-evidence-audit.mjs'));
    // tasks/runs deliberately absent

    const r = run(root, []);
    assert.match(r.stdout, /CANNOT VERIFY/, 'an unreadable corpus must refuse on STDOUT (F-2211-1)');
    assert.ok(!r.stdout.includes('NOTHING OWED'), 'an empty selection is not a clean board (F-2217-1)');
    const s = run(root, ['--strict']);
    assert.equal(s.status, 2, '2 = could not answer, distinct from 1 = answered and refuses');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('5 — --strict separates 1 (owed) from 0 (clean) from 2 (cannot answer)', () => {
  const root = fixture();
  try {
    assert.equal(run(root, []).status, 0, 'advisory default never blocks a drain');
    assert.equal(run(root, ['--strict']).status, 1, 'LOST/ON-DISK present -> 1');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('6 — rows and DISTINCT paths are both reported (a repeat withhold is the ordinary case)', () => {
  const root = fixture();
  try {
    // A second run in the same lane inherits the same dirty baseline and
    // withholds the identical path. Rows must double; distinct must not.
    writeFileSync(
      path.join(root, 'tasks', 'runs', '20260101-020000-lane-x-next.md.log'),
      NEEDLE + 'artifacts/gone.txt\n',
    );
    const r = run(root, []);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /withheld rows\s+:\s*4\s+\(3 distinct path\(s\)\)/);
    assert.match(r.stdout, /LOST\s+\(no ref, no disk\)\s+2\s+1/, 'two rows, one file');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('7 — cwd-invariant: the verdict does not change when run from a subdirectory (F-2220-1)', () => {
  const root = fixture();
  try {
    const atRoot = run(root, []);
    const atSub = run(path.join(root, 'scripts'), [], 'withheld-evidence-audit.mjs');
    assert.equal(atRoot.status, atSub.status);
    assert.ok(atRoot.stdout.length > 0, 'control: the root arm really produced output (F-2215-1)');
    assert.equal(
      atRoot.stdout.replace(/^\s+dir\s+:.*$/m, ''),
      atSub.stdout.replace(/^\s+dir\s+:.*$/m, ''),
      'a subdirectory must not silently narrow the corpus',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('8 — an unverifiable TRACKED SET refuses rather than calling everything LOST', () => {
  // A root that is not a git repo: `git ls-files` cannot answer, so every path
  // would classify LOST against an empty denominator. That is the loudest
  // possible false alarm and must be a refusal instead (F-2215-1).
  const root = mkdtempSync(path.join(tmpdir(), 'withheld-nogit-'));
  try {
    mkdirSync(path.join(root, 'tasks', 'runs'), { recursive: true });
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    cpSync(SUBJECT, path.join(root, 'scripts', 'withheld-evidence-audit.mjs'));
    writeFileSync(path.join(root, 'tasks', 'runs', 'r.log'), NEEDLE + 'artifacts/x.txt\n');

    const r = run(root, []);
    assert.match(r.stdout, /CANNOT VERIFY/);
    assert.ok(!/LOST\s+\(no ref, no disk\)\s+1/.test(r.stdout), 'must not classify against an empty tracked set');
    assert.equal(run(root, ['--strict']).status, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('11 — a path surviving ONLY in a lane worktree is ON-DISK, not LOST', () => {
  // This is the branch that decides s2476's own recovery: the runner withheld
  // two screenshots and they were recoverable ONLY because the lane worktree
  // still held them. A tool that searched the main root alone would report them
  // LOST — an unrecoverable verdict on recoverable bytes, which is the one
  // direction that stops a fire from even trying. Added after a reverse-control
  // sweep found this branch unreddened by any variant, i.e. decoration (s2226).
  const root = fixture();
  try {
    const lane = path.join(root, 'worktrees', 'lane-b', 'artifacts');
    mkdirSync(lane, { recursive: true });
    writeFileSync(path.join(lane, 'lane-only.txt'), 'still here\n');
    writeFileSync(
      path.join(root, 'tasks', 'runs', '20260101-030000-lane-b-laneonly.md.log'),
      NEEDLE + 'artifacts/lane-only.txt\n',
    );
    const r = run(root, ['--list']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /ON-DISK\s+artifacts\/lane-only\.txt/, 'a lane worktree is a place evidence survives');
    assert.ok(!/LOST\s+artifacts\/lane-only\.txt/.test(r.stdout), 'recoverable bytes must never be reported LOST');
    assert.match(r.stdout, /ON-DISK\s+\(untracked, HERE\)\s+2\s+2/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('9 — TEETH: dropping the anchor reds arm 1 (the manufactured F-2102-1 defect)', () => {
  const v = variantOf('if (line.startsWith(NEEDLE)) {', 'if (line.includes(NEEDLE)) {');
  const root = fixture({ subject: v });
  try {
    const r = run(root, ['--list']);
    // With the anchor gone the narration-only log is counted as a withholding.
    assert.match(r.stdout, /runs that withheld\s+:\s*2\b/, 'the manufactured defect must be VISIBLE');
    assert.ok(r.stdout.includes('indented-not-emitted'), 'and it must pull in a path that was never withheld');
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(path.dirname(v), { recursive: true, force: true });
  }
});

test('10 — TEETH: an empty tracked set that classifies instead of refusing is visibly wrong', () => {
  const v = variantOf(
    "if (tracked.size === 0) {\n    return { corpus: 'tracked-set-empty'",
    "if (false) {\n    return { corpus: 'tracked-set-empty'",
  );
  const root = mkdtempSync(path.join(tmpdir(), 'withheld-teeth-'));
  try {
    mkdirSync(path.join(root, 'tasks', 'runs'), { recursive: true });
    mkdirSync(path.join(root, 'scripts'), { recursive: true });
    cpSync(v, path.join(root, 'scripts', 'withheld-evidence-audit.mjs'));
    const g = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
    g('init', '-q', '-b', 'main');
    writeFileSync(path.join(root, 'tasks', 'runs', 'r.log'), NEEDLE + 'artifacts/x.txt\n');
    const r = run(root, []);
    // The defect turns "I cannot answer" into a confident loss report.
    assert.match(r.stdout, /LOST\s+\(no ref, no disk\)\s+1/, 'the manufactured defect must be VISIBLE');
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(path.dirname(v), { recursive: true, force: true });
  }
});
