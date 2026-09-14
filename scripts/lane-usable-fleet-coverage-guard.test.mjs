// s2561 — F-2561-1. `scripts/lane-usable.mjs --all` is prescribed by scripts/fire.md §2F as
// THE answer to "a lane branch can hold unabsorbed content with no done-move at all", and the
// law described its output as "the COMPLETE worktree set ... the rest are attended-owned
// worktree-agent-* / sol/* / gr-task-* trees".
//
// MEASURED s2561: the registry held 119 worktrees and fleet() reported 30 (26 agent-* + 4
// lane-*) — ZERO sol/*, ZERO gr-task-*. The two populations the law named as INCLUDED are
// precisely the two fleet() excludes, because it requires BOTH a `branch ` line (dropping
// every detached worktree) and a path ending /worktrees/<name> (dropping every off-convention
// path). 89 trees unreported, 16 of them ahead of main.
//
// The cure is a DECLARATION, never a widening: resolve() matches by branch and cure() runs
// `git reset --hard main` in the matched worktree, so widening fleet() would make attended
// sol/* and gr-task-* trees curable by name — the Reset Massacre (Mistake #2). These arms
// therefore assert the declaration AND assert that the verdict/cure machinery is untouched.
//
// Every arm was proven by manufacturing the defect on a scratch copy; the teeth sweep is
// recorded in the finding. Fixtures build REAL git worktrees (the s2222 pattern), because a
// staleness/coverage question cannot be measured against a mocked registry.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('./lane-usable.mjs', import.meta.url));

function sh(args, cwd) {
  return execFileSync(args[0], args.slice(1), {
    cwd, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 240_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
function cli(args, cwd) {
  const r = spawnSync('node', [SUBJECT, ...args], {
    cwd, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 240_000, killSignal: 'SIGKILL',
  });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

// A repo with: main, a conventional worktrees/<slot> lane (fleet() SEES it), an
// off-convention-path worktree (filter 1 drops it) and a DETACHED worktree (filter 2 drops it).
function fixture({ offConventionAhead = true, detachedAhead = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 's2561-cov-'));
  const repo = path.join(root, 'repo');
  mkdirSync(repo, { recursive: true });
  sh(['git', 'init', '-q', '-b', 'main'], repo);
  sh(['git', 'config', 'user.email', 'g@example.com'], repo);
  sh(['git', 'config', 'user.name', 'guard'], repo);
  writeFileSync(path.join(repo, 'package.json'), JSON.stringify({ name: 'fx', scripts: {} }, null, 2));
  mkdirSync(path.join(repo, 'src'), { recursive: true });
  writeFileSync(path.join(repo, 'src/a.ts'), 'export const a = 1\n');
  sh(['git', 'add', '-A'], repo);
  sh(['git', 'commit', '-qm', 'base'], repo);
  const base = sh(['git', 'rev-parse', 'HEAD'], repo).trim();

  // (a) conventional lane — REPORTED by fleet()
  sh(['git', 'worktree', 'add', '-q', '-b', 'lane/x', path.join(repo, 'worktrees', 'lane-x'), 'main'], repo);

  // (b) off-convention path — dropped by the PATH filter
  const off = path.join(root, 'gr-task-offconvention');
  sh(['git', 'worktree', 'add', '-q', '-b', 'sol/offconvention', off, 'main'], repo);
  if (offConventionAhead) {
    writeFileSync(path.join(off, 'src/off.ts'), 'export const off = 1\n');
    sh(['git', 'add', '-A'], off);
    sh(['git', 'commit', '-qm', 'off-convention work main has not absorbed'], off);
  }

  // (c) DETACHED worktree — dropped by the BRANCH filter. Its tip must NOT be an ancestor
  // of main, which is the case the is-ancestor form got wrong (exit 1 == a verdict).
  const det = path.join(root, 'detached-arena');
  sh(['git', 'worktree', 'add', '-q', '--detach', det, base], repo);
  if (detachedAhead) {
    writeFileSync(path.join(det, 'src/det.ts'), 'export const det = 1\n');
    sh(['git', 'add', '-A'], det);
    sh(['git', 'commit', '-qm', 'detached work main has not absorbed'], det);
  }
  return { root, repo, off, det };
}
const cleanup = (f) => rmSync(f.root, { recursive: true, force: true });

test('the registry is larger than the fleet, and fleetCoverage() names the difference', async () => {
  const f = fixture();
  try {
    const { fleetCoverage } = await import(`${SUBJECT}?cov=${Date.now()}`);
    const cwd = process.cwd();
    process.chdir(f.repo);
    let cov;
    try { cov = fleetCoverage(); } finally { process.chdir(cwd); }
    assert.equal(cov.source, 'read', 'control: the registry must be readable, else this measures nothing');
    // 4 registered: main + lane-x + off-convention + detached. fleet() sees 1 (lane-x).
    assert.equal(cov.registered, 4, 'fixture should register 4 worktrees');
    // F-2217-1: an empty subject set must REFUSE, not pass vacuously.
    assert.ok(cov.unreported.length > 0, 'unreported set is empty — the fixture built nothing to measure');
    assert.equal(cov.unreported.length, 3, 'main + off-convention + detached are all unreported');
  } finally { cleanup(f); }
});

test('the PATH filter is declared: an off-convention worktree is unreported and named ahead', async () => {
  const f = fixture();
  try {
    const { fleetCoverage } = await import(`${SUBJECT}?cov=${Date.now()}`);
    const cwd = process.cwd();
    process.chdir(f.repo);
    let cov;
    try { cov = fleetCoverage(); } finally { process.chdir(cwd); }
    const row = cov.unreported.find((t) => t.branch === 'sol/offconvention');
    assert.ok(row, 'the off-convention worktree must appear in the unreported set');
    assert.match(row.why, /path/, 'its exclusion reason is the PATH filter');
    assert.match(row.state, /^ahead 1$/, `expected "ahead 1", got "${row.state}"`);
  } finally { cleanup(f); }
});

test('the BRANCH filter is declared: a DETACHED worktree is unreported', async () => {
  const f = fixture();
  try {
    const { fleetCoverage } = await import(`${SUBJECT}?cov=${Date.now()}`);
    const cwd = process.cwd();
    process.chdir(f.repo);
    let cov;
    try { cov = fleetCoverage(); } finally { process.chdir(cwd); }
    const row = cov.unreported.find((t) => !t.branch && t.head);
    assert.ok(row, 'the detached worktree must appear in the unreported set');
    assert.match(row.why, /detached/, 'its exclusion reason is the BRANCH filter');
  } finally { cleanup(f); }
});

// The specific defect caught while writing the cure: `merge-base --is-ancestor` reports "no"
// with exit 1, and this file's tryGit collapses a failure to String(err.stderr || err.message)
// — NON-EMPTY for exit 1 — so the stderr-is-empty discriminator (F-2212-1) is unavailable and
// a real "not an ancestor" gets misfiled as could-not-answer. A throwaway probe using that
// form read 13 ahead / 3 could-not-answer where the value-reporting form reads 16 / 0.
test('a detached tip that main has NOT absorbed reads ahead, never could-not-answer', async () => {
  const f = fixture();
  try {
    const { fleetCoverage } = await import(`${SUBJECT}?cov=${Date.now()}`);
    const cwd = process.cwd();
    process.chdir(f.repo);
    let cov;
    try { cov = fleetCoverage(); } finally { process.chdir(cwd); }
    const row = cov.unreported.find((t) => !t.branch && t.head);
    assert.ok(row, 'control: no detached row to judge');
    assert.notEqual(row.state, 'could-not-answer',
      'a detached tip not on main must be classified, not filed as unanswerable (F-2212-1)');
    assert.match(row.state, /^ahead/, `expected an ahead verdict, got "${row.state}"`);
  } finally { cleanup(f); }
});

test('an absorbed unreported tree is not reported as ahead (reverse control)', async () => {
  const f = fixture({ offConventionAhead: false, detachedAhead: false });
  try {
    const { fleetCoverage } = await import(`${SUBJECT}?cov=${Date.now()}`);
    const cwd = process.cwd();
    process.chdir(f.repo);
    let cov;
    try { cov = fleetCoverage(); } finally { process.chdir(cwd); }
    const ahead = cov.unreported.filter((t) => t.state.startsWith('ahead'));
    assert.equal(ahead.length, 0, `nothing is ahead in this fixture, got ${JSON.stringify(ahead.map((a) => a.state))}`);
    assert.ok(cov.unreported.every((t) => t.state === 'absorbed'),
      'every unreported tree here should read absorbed');
  } finally { cleanup(f); }
});

test('--all declares the denominator on stdout, on the happy path too (F-2208-1)', () => {
  const f = fixture({ offConventionAhead: false, detachedAhead: false });
  try {
    const r = cli(['--all'], f.repo);
    assert.ok(r.out.length > 0, 'control: --all produced no stdout at all');
    assert.match(r.out, /worktree coverage: reported \d+ of \d+ registered/,
      'the coverage declaration must print even when nothing is ahead');
    assert.match(r.out, /0 ahead of main/, 'a quiet board still states the ahead count');
  } finally { cleanup(f); }
});

test('--all names an ahead unreported tree and still exits 0 (declare, do not refuse)', () => {
  const f = fixture();
  try {
    const r = cli(['--all'], f.repo);
    assert.match(r.out, /worktree coverage: reported \d+ of \d+ registered/);
    assert.match(r.out, /2 ahead of main/, 'both the off-convention and detached trees are ahead');
    // F-1460-1: an attended worktree ahead of main is a LAWFUL routine state. A red here
    // would fire during ordinary correct operation and be excused into uselessness.
    assert.equal(r.rc, 0, '--all is an audit and must stay exit 0 in every state');
  } finally { cleanup(f); }
});

test('--all tells the reader these are not theirs to drain, and how to list them', () => {
  const f = fixture();
  try {
    const r = cli(['--all'], f.repo);
    assert.match(r.out, /NOT yours to drain/, 'the declaration must not read as a missed drain');
    assert.match(r.out, /--unreported/, 'print the remedy beside the alarm, not only in the law');
  } finally { cleanup(f); }
});

test('--unreported lists the trees --all cannot see, and exits 0', () => {
  const f = fixture();
  try {
    const r = cli(['--unreported'], f.repo);
    assert.equal(r.rc, 0);
    assert.match(r.out, /sol\/offconvention/, 'the off-convention branch must be listed by name');
    assert.match(r.out, /detached /, 'the detached tree must be listed');
    assert.match(r.out, /ahead 1/, 'its drain verdict must be shown, not just its path');
  } finally { cleanup(f); }
});

test('--unreported REFUSES with 2 when the registry cannot be read', () => {
  const f = fixture();
  try {
    // Outside any repo: `git worktree list` fails, so the unreported set is UNKNOWN.
    // "could not answer" (2) is not "answered, and the answer is nothing" (0).
    const outside = mkdtempSync(path.join(tmpdir(), 's2561-norepo-'));
    try {
      const r = cli(['--unreported'], outside);
      assert.equal(r.rc, 2, 'an unreadable registry must refuse, never clear');
      assert.match(r.out + r.err, /CANNOT VERIFY/);
    } finally { rmSync(outside, { recursive: true, force: true }); }
  } finally { cleanup(f); }
});

test('the single-lane form carries NO declaration (restraint + neutrality)', () => {
  const f = fixture();
  try {
    const r = cli(['lane-x'], f.repo);
    assert.ok(r.out.length > 0, 'control: the single-lane form produced nothing');
    assert.doesNotMatch(r.out, /worktree coverage:/,
      'an always-on line on the most-run form is the noise that decays a declaration into a formality');
  } finally { cleanup(f); }
});

// The cure must NOT widen fleet(): resolve() matches by BRANCH and cure() runs
// `git reset --hard main` in the matched worktree, so a resolvable sol/* name is a lever
// over attended work — the Reset Massacre (Mistake #2) with a green suite attesting to it.
test('an unreported branch stays UNRESOLVABLE by name — fleet() must not have been widened', () => {
  const f = fixture();
  try {
    const r = cli(['sol/offconvention'], f.repo);
    assert.equal(r.rc, 3, 'an off-convention branch must not resolve to a curable lane');
    assert.match(r.err, /no lane worktree matches/);
  } finally { cleanup(f); }
});

test('the subject still refuses to run its CLI when imported (s1416 guard intact)', async () => {
  const mod = await import(`${SUBJECT}?cov=${Date.now()}-import`);
  assert.equal(typeof mod.fleetCoverage, 'function', 'fleetCoverage must be exported for direct testing');
  assert.equal(typeof mod.classifyDirt, 'function', 'the pre-existing exports must survive');
});

// The needle must select the CALL, not the MENTION — F-2365-1's discriminator. This arm's
// first draft matched the bare token `is-ancestor` and reddened on the COMMENT that explains
// why the form is not used: a guard failing on the prose that documents its own subject is
// the "found in comments, not implementation" false-claim pattern. Strip comments first.
test('the cure does not reintroduce the is-ancestor exit-code trap', () => {
  const src = readFileSync(SUBJECT, 'utf8');
  const fn = src.slice(src.indexOf('export function fleetCoverage'));
  const body = fn.slice(0, fn.indexOf('\n}\n') + 3);
  assert.ok(body.length > 200, 'control: failed to slice fleetCoverage out of the subject');
  const code = body.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.match(code, /rev-list/, 'control: the stripped body must still contain its git call');
  assert.doesNotMatch(code, /is-ancestor/,
    'fleetCoverage must report by VALUE (rev-list --count), not by an overloaded exit code');
});
