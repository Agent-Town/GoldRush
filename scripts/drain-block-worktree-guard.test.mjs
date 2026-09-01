#!/usr/bin/env node
// F-2223-1 (filed s2223, cured s2224) — drain-block-check.mjs must REFUSE from a linked worktree.
//
// Every corpus this tool reads is TRACKED (tasks/goals.json, tasks/BACKLOG.md, tasks/done/), so a
// linked worktree hands it a board frozen at that branch's commit. Measured on the live board:
// `--all` read 594 goal leaves from the repo root and 591 from worktrees/lane-c at IDENTICAL rc and
// IDENTICAL byte length. The harm is the Mistake #8 polarity on --queue: an already-SHIPPED master
// answered "⛔ ALREADY SHIPPED — DO NOT QUEUE" rc=1 from the root and "? UNKNOWN" rc=0 from the
// lane — the 824k-Flail guard handing out a clearance.
//
// THE FIXTURE DESIGN IS LOAD-BEARING (s2223's rule): A STALENESS FIXTURE MUST PLANT ITS GROUND
// TRUTH IN A CORPUS THAT ACTUALLY GOES STALE. The fixture ships its master's SHIPPED evidence as a
// goals.json leaf added to main AFTER the worktree branches, so the worktree's checkout genuinely
// lacks it. Shipping the same signal through anything git resolves by REF (git ls-tree main, and so
// on) would prove nothing — that corpus is reachable from inside a worktree and does not go stale,
// so such an arm would pass on the cured and uncured file alike.
//
// Run: node --test scripts/drain-block-worktree-guard.test.mjs
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SUBJECT = join(dirname(fileURLToPath(import.meta.url)), 'drain-block-check.mjs');
const MASTER = 'fixture-shipped-master.md';
const fixtures = [];
after(() => fixtures.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/**
 * A repo whose main branch KNOWS the fixture master is shipped, plus a linked worktree that
 * branched BEFORE that knowledge landed. The worktree therefore holds a real, readable, non-empty
 * tasks/goals.json that is simply OLD — which is the whole point: every discriminator built before
 * this one asks WHETHER the corpus could be read, and a stale checkout passes all of them.
 */
function buildFixture() {
  const root = mkdtempSync(join(tmpdir(), 'f2223-1-'));
  fixtures.push(root);
  git(root, ['init', '-b', 'main', '-q']);
  git(root, ['config', 'user.email', 'fixture@example.com']);
  git(root, ['config', 'user.name', 'fixture']);
  mkdirSync(join(root, 'tasks', 'done'), { recursive: true });
  writeFileSync(join(root, 'tasks', 'BACKLOG.md'), '# fixture backlog\n');
  // Generation 1 — a lawful, populated board that does NOT yet know about the fixture master.
  writeFileSync(join(root, 'tasks', 'goals.json'), JSON.stringify(
    { id: 'root', children: [{ id: 'unrelated-leaf', taskFile: 'unrelated.md', status: 'merged', mergeHash: '0'.repeat(40) }] }, null, 2));
  git(root, ['add', '-A']);
  git(root, ['commit', '-qm', 'gen1: a board with no knowledge of the fixture master']);
  const base = git(root, ['rev-parse', 'HEAD']).trim();

  // The worktree branches HERE, at generation 1.
  const wt = join(root, 'worktrees', 'lane-x');
  git(root, ['worktree', 'add', '-q', '-b', 'lane/x', wt, 'main']);

  // Generation 2 — main learns the master is shipped. The worktree cannot see this.
  writeFileSync(join(root, 'tasks', MASTER), '# fixture master\n');
  writeFileSync(join(root, 'tasks', 'goals.json'), JSON.stringify(
    {
      id: 'root',
      children: [
        { id: 'unrelated-leaf', taskFile: 'unrelated.md', status: 'merged', mergeHash: '0'.repeat(40) },
        { id: 'fixture-shipped-master', taskFile: MASTER, status: 'merged', mergeHash: base },
      ],
    }, null, 2));
  git(root, ['add', '-A']);
  git(root, ['commit', '-qm', 'gen2: the master ships']);
  return { root, wt };
}

const run = (file, cwd, args) => {
  const r = spawnSync('node', [file, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
};

/** A scratch copy of the subject with one edit applied — used to manufacture each defect. */
function variantOf(edit) {
  const src = readFileSync(SUBJECT, 'utf8');
  const out = edit(src);
  assert.notEqual(out, src, 'variant edit matched nothing — the manufactured defect was never built');
  const dir = mkdtempSync(join(tmpdir(), 'f2223-1-var-'));
  fixtures.push(dir);
  const f = join(dir, 'drain-block-check.mjs');
  writeFileSync(f, out);
  return f;
};

test('F-2223-1: from a LINKED WORKTREE the tool refuses instead of answering off a frozen board', () => {
  const { root, wt } = buildFixture();
  try {
    const lane = run(SUBJECT, wt, [MASTER, '--queue']);
    // Assert the OBSERVABLE, not the blob (s2222's method lesson): the BANNER must name the cause.
    // A variant that cures the exit code and leaves the banner to fall through still puts the words
    // "LINKED WORKTREE" somewhere in stdout, and a substring test over the whole output passes it.
    const banner = lane.out.split('\n').filter((l) => l.trim())[0] || '';
    assert.match(banner, /CANNOT VERIFY/, `first printed line must be the refusal, got: ${banner}`);
    assert.match(lane.out, /LINKED WORKTREE/, 'the refusal must name the cause');
    assert.equal(lane.rc, 2, '2 = "could not answer", never 1 = "answered, and the answer refuses"');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('REVERSE CONTROL: from the MAIN worktree the real verdict still lands (no refusal)', () => {
  const { root } = buildFixture();
  try {
    const r = run(SUBJECT, root, [MASTER, '--queue']);
    assert.match(r.out, /ALREADY SHIPPED/, 'the Mistake #8 refusal must still fire on main');
    assert.equal(r.rc, 1, 'an ANSWERED refusal is 1');
    assert.doesNotMatch(r.out, /CANNOT VERIFY/, 'the main worktree must never be flagged as stale');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('REVERSE CONTROL: a SUBDIRECTORY of the main worktree is not a linked worktree', () => {
  const { root } = buildFixture();
  try {
    // git resolves the same gitdir from any subdirectory, so this must not trip the refusal. It
    // fails loud for the pre-existing reason (a cwd-relative GOALS path), on STDERR, exactly as it
    // did before this cure.
    const r = run(SUBJECT, join(root, 'tasks'), ['--all']);
    assert.doesNotMatch(r.out, /CANNOT VERIFY/, 'a subdirectory of main must not read as stale');
    assert.match(r.err, /goals\.json not found/, 'the pre-existing loud failure is unchanged');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('REVERSE CONTROL: a NON-GIT fixture root stays lawful (git exit 128 is not a failure)', () => {
  // Every fixture-rooted test in this family builds a bare mkdtemp directory. If 128 were treated
  // as "unverifiable" this cure would red all of them, which is the over-general cure this arm
  // exists to catch.
  const root = mkdtempSync(join(tmpdir(), 'f2223-1-nogit-'));
  fixtures.push(root);
  try {
    mkdirSync(join(root, 'tasks'), { recursive: true });
    writeFileSync(join(root, 'tasks', 'goals.json'), JSON.stringify({ id: 'root', children: [] }));
    const r = run(SUBJECT, root, ['--all']);
    assert.doesNotMatch(r.out, /CANNOT VERIFY/, 'a non-git fixture root must not be flagged');
    assert.match(r.out, /Scanned 0 goal leaves/, 'the tool must answer normally on a fixture root');
    assert.equal(r.rc, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the DRAIN arm is refused too, not only --queue', () => {
  const { root, wt } = buildFixture();
  try {
    const r = run(SUBJECT, wt, [MASTER]);
    assert.match(r.out, /CANNOT VERIFY/, 'every arm reads the tracked ledger, so every arm refuses');
    assert.equal(r.rc, 2);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('--all is refused too — it is the arm that printed the 594-vs-591 divergence', () => {
  const { root, wt } = buildFixture();
  try {
    const r = run(SUBJECT, wt, ['--all']);
    assert.match(r.out, /CANNOT VERIFY/);
    assert.doesNotMatch(r.out, /Scanned \d+ goal leaves/, 'no count may be printed off a frozen board');
    assert.equal(r.rc, 2);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('PRE-CURE CONTROL: the uncured file really does hand out the clearance', () => {
  const { root, wt } = buildFixture();
  try {
    const pre = variantOf((s) => s.replace(/\n  const tree = corpusTree\(process\.cwd\(\)\);[\s\S]*?process\.exit\(2\);\n  }\n/, '\n'));
    const lane = run(pre, wt, [MASTER, '--queue']);
    const main = run(pre, root, [MASTER, '--queue']);
    // F-2215-1: assert the control arm PRODUCED something before believing what it says.
    assert.ok(main.out.length > 0, 'pre-cure main arm produced nothing — it never ran');
    assert.match(main.out, /ALREADY SHIPPED/, 'ground truth: main knows this master is shipped');
    assert.equal(main.rc, 1);
    assert.match(lane.out, /UNKNOWN/, 'the defect: the frozen board answers UNKNOWN');
    assert.equal(lane.rc, 0, 'the defect: rc=0, indistinguishable from a clearance');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('PARTIAL-CURE CONTROL: curing the exit code but not the banner must still red', () => {
  const { root, wt } = buildFixture();
  try {
    // The exact shape that scored 6/6 green against s2222's own first draft: the refusal exits 2,
    // but the banner never names the cause. Only an arm that reads the FIRST PRINTED LINE catches it.
    const partial = variantOf((s) => s.replace(
      '    console.log(`\\n  ⛔ CANNOT VERIFY — DO NOT DRAIN, DO NOT QUEUE off this run`);',
      '    console.log(`\\n  (corpus note)`);'));
    const r = run(partial, wt, [MASTER, '--queue']);
    assert.equal(r.rc, 2, 'the partial cure does fix the exit code');
    const banner = r.out.split('\n').filter((l) => l.trim())[0] || '';
    assert.doesNotMatch(banner, /CANNOT VERIFY/, 'sanity: this variant really did silence the banner');
    // ...and that is precisely what arm 1 asserts, so arm 1 is what fails on this variant.
  } finally { rmSync(root, { recursive: true, force: true }); }
});
