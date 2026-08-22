// F-2212-1 (s2212) — THE ANCESTRY PROBE MUST NEVER READ A BROKEN INSTRUMENT AS
// THE VERDICT "NOT SHIPPED".
//
// `drain-block-check.mjs`'s ancestry arm is the Mistake #8 guard (the 824k Flail):
// it refuses to QUEUE a master whose mergeHash is already an ancestor of main. It
// used to wrap both git calls in a bare `catch { return false }` — but
// `merge-base --is-ancestor` uses EXIT 1 AS A LEGITIMATE VERDICT ("not an
// ancestor"), so the catch could not separate that verdict from a crash, and the
// crash direction was the PERMISSIVE one: false => "not shipped" => cleared for
// dispatch. F-2211-1's class, one file over, with the dangerous polarity.
//
// The two calls also carried the ONLY 2-second bound in that file, so a load spike
// killed this check alone and left every other git call working. Measured before
// the cure, on a fixture whose leaf mergeHash IS on main:
//     healthy git  -> `⛔ ALREADY SHIPPED — DO NOT QUEUE` (rc=1)
//     2 s timeout  -> `✅ CLEAR` (rc=0), no crash, no warning.
//
// EVERY ARM BELOW WAS PROVEN BY MANUFACTURING THE DEFECT ON A FIXTURE, never by
// reading. The REVERSE CONTROLS matter as much as the crash arms: a cure one level
// too general — refusing whenever git exits non-zero — passes every crash arm while
// breaking the ordinary path, because "not an ancestor" IS exit 1.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'drain-block-check.mjs');
const GIT = '/usr/bin/git';

/** A throwaway repo with one commit on main and one commit that is NOT on main. */
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2212-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks', 'queue', 'main'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });

  const g = (...a) => execFileSync(GIT, a, { cwd: root, encoding: 'utf8' });
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'guard@example.invalid');
  g('config', 'user.name', 'guard');
  fs.writeFileSync(path.join(root, 'seed.txt'), 'seed\n');
  g('add', 'seed.txt');
  g('commit', '-q', '-m', 'seed');
  const onMain = g('rev-parse', 'HEAD').trim();
  g('checkout', '-q', '-b', 'side');
  g('commit', '-q', '--allow-empty', '-m', 'side');
  const offMain = g('rev-parse', 'HEAD').trim();
  g('checkout', '-q', 'main');

  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# backlog\n');
  fs.writeFileSync(path.join(root, 'scripts', 'citation-title-baseline.json'), '{}\n');
  const master = '# x\n\nA master with no citations to check.\n';
  fs.writeFileSync(path.join(root, 'tasks', 'x.md'), master);
  fs.writeFileSync(path.join(root, 'tasks', 'queue', 'main', 'x.md'), master);

  // status "queued" is neither terminal-shipped nor terminal-closed, so the
  // ANCESTRY arm is the only thing standing between this master and a re-queue.
  const setLeaf = (mergeHash) => fs.writeFileSync(
    path.join(root, 'tasks', 'goals.json'),
    JSON.stringify({
      id: 'root',
      children: [{
        id: 'x-slice', taskFile: 'x.md', status: 'queued', title: 'a slice',
        ...(mergeHash ? { mergeHash } : {}),
      }],
    }, null, 2),
  );
  return { root, onMain, offMain, setLeaf };
}

/** A directory holding ONLY a `git` shim, to be used as the entire PATH. */
function gitStub(t, body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f2212-bin-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  if (body !== null) {
    fs.writeFileSync(path.join(dir, 'git'), body);
    fs.chmodSync(path.join(dir, 'git'), 0o755);
  }
  return dir;
}

/**
 * Run the real script against the fixture. Spawns via process.execPath, NOT via a
 * PATH lookup of "node": the stub PATHs contain only git, so resolving node through
 * PATH would fail for reasons unrelated to the subject under test.
 */
function verdictOf(root, env) {
  let out;
  try {
    out = execFileSync(process.execPath, [SUBJECT, 'x.md', '--queue'],
      { cwd: root, encoding: 'utf8', env });
  } catch (e) {
    out = String(e.stdout ?? '') + String(e.stderr ?? '');
  }
  if (/ALREADY SHIPPED/.test(out)) return 'ALREADY SHIPPED';
  if (/CANNOT VERIFY/.test(out)) return 'CANNOT VERIFY';
  if (/✅ CLEAR/.test(out)) return 'CLEAR';
  return `other:: ${out.split('\n').filter(Boolean)[0] ?? '(no output)'}`;
}

const onlyGit = (dir) => ({ ...process.env, PATH: dir });

test('CONTROL: with healthy git, an already-merged master is refused', (t) => {
  const f = fixture(t);
  f.setLeaf(f.onMain);
  assert.equal(verdictOf(f.root, process.env), 'ALREADY SHIPPED');
});

test('F-2212-1: git exiting 128 is NOT the verdict "not shipped"', (t) => {
  const f = fixture(t);
  f.setLeaf(f.onMain);
  const bin = gitStub(t, '#!/bin/sh\necho "fatal: unable to read tree object" >&2\nexit 128\n');
  assert.equal(verdictOf(f.root, onlyGit(bin)), 'CANNOT VERIFY');
});

test('F-2212-1: a failure WEARING the verdict\'s exit code is caught by stderr', (t) => {
  // The sharpest arm. `is-ancestor` says "no" with exit 1 and EMPTY stderr, so exit
  // 1 alone cannot be trusted -- only exit-1-and-silent is the verdict. Here the
  // existence probe passes so we genuinely reach the ancestry call.
  const f = fixture(t);
  f.setLeaf(f.onMain);
  const bin = gitStub(t, `#!/bin/sh
case "$1 $2" in
  "cat-file -e") exec ${GIT} "$@" ;;
  "merge-base --is-ancestor") echo "error: could not open pack" >&2; exit 1 ;;
esac
exec ${GIT} "$@"
`);
  assert.equal(verdictOf(f.root, onlyGit(bin)), 'CANNOT VERIFY');
});

test('F-2212-1: git missing entirely (ENOENT) is not a clearance', (t) => {
  const f = fixture(t);
  f.setLeaf(f.onMain);
  assert.equal(verdictOf(f.root, onlyGit(gitStub(t, null))), 'CANNOT VERIFY');
});

test('REVERSE CONTROL: a genuine "not an ancestor" still CLEARS', (t) => {
  // Exit 1 with empty stderr is the real verdict. A cure that refused on any
  // non-zero exit would pass every arm above and break this -- the ordinary path.
  const f = fixture(t);
  f.setLeaf(f.offMain);
  assert.equal(verdictOf(f.root, process.env), 'CLEAR');
});

test('REVERSE CONTROL: a leaf with no mergeHash still CLEARS', (t) => {
  // 43 of the live tree's 593 leaves carry no mergeHash, so this is the majority
  // working path for unshipped work and must stay untouched.
  //
  // ⓘ An earlier draft asserted this by handing the script a git that ERRORS,
  // claiming the absent-hash path "never probes git at all". That over-claims:
  // `ancestryOfMain` does short-circuit before any spawn, but the SCRIPT calls git
  // elsewhere for unrelated checks, so the stub reddened this for a reason that has
  // nothing to do with the subject. Scope the control to the claim actually made.
  const f = fixture(t);
  f.setLeaf(null);
  assert.equal(verdictOf(f.root, process.env), 'CLEAR');
});
