// F-2218-1 (s2218) — THE DUPLICATE-DISPATCH REFUSAL MUST NEVER READ AN ABSENT
// CORPUS AS "no runner holds this master".
//
// `drain-block-check.mjs`'s dispatch arm is F-1322-1's refusal: it refuses to
// QUEUE a master a runner is holding RIGHT NOW ("a second copy is a second
// DISPATCH that fires the moment this slot frees"). It used to enumerate the
// corpus behind an existsSync guard —
//
//     const live = existsSync(runningDir) ? readdirSync(runningDir)... : [];
//
// — so an ABSENT tasks/running/ produced an empty subject set, and an empty
// subject set means live.length === 0 means ✅ CLEAR. F-2217-1's shape (an empty
// set is the shape of good news) with F-2212-1's permissive polarity.
//
// WHY SIX CONSECUTIVE CENSUSES MISSED IT, and the reason this guard exists as a
// separate file rather than an arm of the ancestry guard: s2212 (`grep -c
// catch`), s2213 (spawn lexically inside a try), s2214 (same-file wrapper),
// s2215 (handler polarity), s2216 (`spawnSync` never throws) and s2217
// (enumeration vs classification) are ALL KEYED ON A `catch`. There is no catch
// here and nothing throws. A guard-keyed empty is invisible to a catch-keyed
// census BY CONSTRUCTION.
//
// Measured before the cure, ground truth = a runner IS holding the master:
//     tasks/running present      -> ⛔ ALREADY DISPATCHED (rc=1), 704 B
//     tasks/running renamed away -> ✅ CLEAR              (rc=0),  89 B
//     REVERSE CONTROL, no run    -> ✅ CLEAR              (rc=0),  89 B
// The defect arm and a genuinely clear board were BYTE-IDENTICAL on stdout,
// stderr and rc.
//
// EVERY RED ARM BELOW WAS PROVEN BY MANUFACTURING THE DEFECT, never by reading.
// THE REVERSE CONTROLS MATTER AS MUCH AS THE DEFECT ARMS: the obvious cure —
// refusing whenever the corpus is absent — passes every defect arm and is WRONG,
// because `.gitignore:78` makes absence a LAWFUL routine state (ephemeral state
// the runner manages, gone after any `git clean -fdx`, absent from every fresh
// clone and all four lane worktrees). That cure would refuse lawful dispatch and
// be excused into uselessness inside a week — the `cross-engine` fate (F-1460-1).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'drain-block-check.mjs');

/**
 * A fixture board carrying one master, one non-terminal leaf for it, and — unless
 * told otherwise — one live run of it in tasks/running/. `status: "queued"` is
 * neither terminal-shipped nor terminal-closed and the leaf carries no mergeHash,
 * so the DISPATCH arm is the only thing standing between this master and a queue.
 */
function fixture(t, { running = 'live', done = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2218-'));
  t.after(() => {
    // chmod back before rm: an unreadable dir cannot be removed recursively.
    const rd = path.join(root, 'tasks', 'running');
    try { fs.chmodSync(rd, 0o755); } catch { /* absent in most arms */ }
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  if (done) fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });

  const master = '# x\n\nA master with no citations to check.\n';
  fs.writeFileSync(path.join(root, 'tasks', 'x.md'), master);
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# backlog\n');
  fs.writeFileSync(path.join(root, 'scripts', 'citation-title-baseline.json'), '{}\n');
  fs.writeFileSync(
    path.join(root, 'tasks', 'goals.json'),
    JSON.stringify({ id: 'root', children: [{ id: 'x-slice', taskFile: 'x.md', status: 'queued', title: 'a slice' }] }, null, 2),
  );

  const rd = path.join(root, 'tasks', 'running');
  if (running !== 'absent') {
    fs.mkdirSync(rd, { recursive: true });
    // The runner's own filename shape: <slot>--<stamp>-<name>
    if (running === 'live') fs.writeFileSync(path.join(rd, 'lane-b--20260823-050000-x.md'), master);
    if (running === 'unreadable') fs.chmodSync(rd, 0o000);
  }
  return root;
}

/** Run the real script on the fixture and return everything a caller can observe. */
function observe(root) {
  const r = execFileSync(process.execPath, [SUBJECT, 'x.md', '--queue'], {
    cwd: root, encoding: 'utf8', env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { rc: 0, out: r, err: '' };
}
function observeAllowingFailure(root) {
  try {
    return observe(root);
  } catch (e) {
    return { rc: e.status, out: String(e.stdout ?? ''), err: String(e.stderr ?? '') };
  }
}

test('CONTROL — a healthy corpus still refuses a master a runner is holding', () => {
  const root = fixture(test, { running: 'live' });
  const r = observeAllowingFailure(root);
  assert.equal(r.rc, 1, 'a live run must refuse with rc=1');
  assert.match(r.out, /ALREADY DISPATCHED/);
  // F-2215-1: assert the arm PRODUCED something, so a silent failure cannot pass
  // for the verdict it is supposed to be measuring.
  assert.ok(r.out.length > 200, `the refusal must actually print (got ${r.out.length} B)`);
});

test('an ABSENT corpus is DECLARED, so its clearance is no longer silent', () => {
  const root = fixture(test, { running: 'absent' });
  const r = observeAllowingFailure(root);
  assert.match(r.out, /DISPATCH CHECK NOT PERFORMED/,
    'an absent tasks/running must say so — otherwise CLEAR asserts a fact never checked');
  assert.match(r.out, /tasks\/running/, 'the declaration must name the corpus it could not read');
});

test('the declaration reaches STDOUT, not only stderr', () => {
  // F-2211-1: a caller that classifies stdout reads an empty string as silence.
  // A warning that exists only on stderr is noise that happens to be true.
  const root = fixture(test, { running: 'absent' });
  const r = observeAllowingFailure(root);
  assert.match(r.out, /DISPATCH CHECK NOT PERFORMED/, 'must be on stdout');
});

test('DEFECT ARM — an absent corpus is no longer byte-identical to a clear board', () => {
  // This is the whole finding. Pre-cure both arms printed the same 89 bytes at
  // the same rc, so no caller — human or machine — could tell them apart.
  const absent = observeAllowingFailure(fixture(test, { running: 'absent' }));
  const clear = observeAllowingFailure(fixture(test, { running: 'empty' }));
  assert.notEqual(absent.out, clear.out,
    'an unread corpus and a genuinely clear board must be distinguishable on stdout');
});

test('REVERSE CONTROL — a genuinely clear board still CLEARS, and says nothing extra', () => {
  // Catches the over-general cure "declare unconditionally": a declaration on
  // every run is noise, and noise is how a declaration decays into a formality.
  const root = fixture(test, { running: 'empty' });
  const r = observeAllowingFailure(root);
  assert.equal(r.rc, 0, 'no live run must still clear');
  assert.match(r.out, /✅ CLEAR/);
  assert.doesNotMatch(r.out, /DISPATCH CHECK NOT PERFORMED/,
    'the happy path must not carry the not-performed declaration');
});

test('REVERSE CONTROL — an absent corpus must NOT refuse', () => {
  // The load-bearing restraint. `.gitignore:78` makes tasks/running/ ephemeral
  // state the runner manages: it is absent from every fresh clone, from all four
  // lane worktrees, and after any `git clean -fdx`. A cure that refuses here
  // blocks lawful dispatch and gets excused away, taking the declaration with it.
  const root = fixture(test, { running: 'absent' });
  const r = observeAllowingFailure(root);
  assert.equal(r.rc, 0, 'absence is lawful — it must declare, not refuse');
});

test('an UNREADABLE corpus REFUSES, and with 2 rather than 1', () => {
  const root = fixture(test, { running: 'unreadable' });
  if (fs.readdirSync !== undefined) {
    let readable = true;
    try { fs.readdirSync(path.join(root, 'tasks', 'running')); } catch { readable = false; }
    // Running as root defeats chmod 000; skip rather than assert a false green.
    if (readable) return;
  }
  const r = observeAllowingFailure(root);
  assert.equal(r.rc, 2,
    '2 = "could not answer" is a different act from 1 = "answered, and the answer refuses"');
  assert.match(r.out, /CANNOT VERIFY/);
  assert.doesNotMatch(r.out, /✅ CLEAR/, 'a broken instrument must never print a clearance');
});

test('the UNDRAINED sibling arm declares when tasks/done could not be read', () => {
  // Fix the CLASS, not the instance — the standing order this script's own
  // family (F-1054-1..F-2195-1) is named for. Same guard-keyed empty, one line
  // down, feeding an advisory warn instead of a refusal.
  const root = fixture(test, { running: 'empty', done: false });
  const r = observeAllowingFailure(root);
  assert.match(r.out, /UNDRAINED-OUTPUT WARN NOT PERFORMED/,
    'an unread done corpus must say so — silence there reads as "nothing undrained"');
});
