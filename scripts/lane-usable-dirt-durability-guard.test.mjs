// s2639 — F-2569-3. Guards the durability read added to `lane-usable.mjs`'s DIRTY branch.
//
// WHY THIS FILE EXISTS. `lane-usable` prints `=> DIRTY: ... find its owner` — a CONTENTION
// verdict — and a fire on a dry board is asking a different question: "what would a refill
// LOSE?". The fuse is CODE, not conjecture: `lane-runner-v3.sh` refreshes a lane with
// `git reset --hard main`, which destroys modified-tracked content. F-2569-1 named the cure,
// F-2610-1 re-affirmed it unclaimed, and both declined it as "not a drive-by" because this
// file carries a `--cure` path that runs `reset --hard main` — so every arm below is written
// against the Reset Massacre direction (Mistake #2) as the thing that must never regress.
//
// THE TWO OVER-GENERAL CURES THIS PINS, each caught by the reverse control built for it:
//   1. CLEARING instead of DECLARING — letting an all-SAFE read soften DIRTY into something
//      a fire may reset. The verdict word and exit code must never move (F-2366-1's choice
//      for BUSY, taken here for the same reason).
//   2. RUNNING THE READ ON ATTENDED TREES — measured s2639, unscoped across `--all` it fires
//      on 15 of 28 rows, 14 of them attended-owned `agent-*` worktrees, and reports 248 AT RISK
//      files with a "salvage before anyone touches this lane" remedy that is NOT a fire's to
//      execute (F-2561-1). That is the FALSE URGENCY class, manufactured at scale by a cure
//      meant to remove it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'lane-usable.mjs');
const { dirtDurability, formatDirtDurability } = await import(SUBJECT);

// A stat stub: every named path is a regular file of the given size, everything else throws
// (which is what lstat does for a path that is not there — a deleted tracked file, or the
// `"old -> new"` pseudo-path porcelain emits for a rename).
const statsFor = (sizes) => (abs) => {
  const key = Object.keys(sizes).find((k) => abs.endsWith('/' + k));
  if (!key) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
  return { isFile: () => true, size: sizes[key] };
};

// A git stub driven by a per-blob truth table. `hash-object` echoes one id per input line;
// `cat-file` answers presence. Anything unexpected throws, so a call this stub did not
// anticipate fails LOUD rather than returning a reassuring empty string.
const gitStub = (ids, { presentIds = null, hashOk = true, catOk = true, shortBatch = false } = {}) => {
  const present = presentIds ?? ids;
  return (args, opts = {}) => {
    if (args[0] === 'hash-object') {
      if (!hashOk) return { ok: false, out: 'boom' };
      const n = opts.input.split('\n').filter(Boolean).length;
      const emit = shortBatch ? ids.slice(0, Math.max(0, n - 1)) : ids.slice(0, n);
      return { ok: true, out: emit.join('\n') + '\n' };
    }
    if (args[0] === 'cat-file') {
      if (!catOk) return { ok: false, out: 'boom' };
      const lines = opts.input.split('\n').filter(Boolean)
        .map((id) => (present.includes(id) ? `${id} blob` : `${id} missing`));
      return { ok: true, out: lines.join('\n') + '\n' };
    }
    throw new Error('unexpected git call: ' + args.join(' '));
  };
};

const SETS = (remote, anyRef) => ({ ok: true, remote: new Set(remote), anyRef: new Set(anyRef) });

// ---------------------------------------------------------------- the four buckets

test('1. a blob reachable from an origin ref classifies SAFE', () => {
  const d = dirtDurability(['a.png'], '/w', {
    runGit: gitStub(['aaa']), statFn: statsFor({ 'a.png': 10 }), sets: SETS(['aaa'], ['aaa']),
  });
  assert.equal(d.status, 'read');
  assert.equal(d.counts.SAFE, 1);
  assert.equal(d.counts['AT RISK'], 0);
  assert.equal(d.bytes, 0, 'a SAFE file contributes no at-risk bytes');
});

test('2. a blob in NO object database classifies AT RISK and is NAMED', () => {
  const d = dirtDurability(['gone.png'], '/w', {
    runGit: gitStub(['bbb'], { presentIds: [] }), statFn: statsFor({ 'gone.png': 99 }), sets: SETS([], []),
  });
  assert.equal(d.counts['AT RISK'], 1);
  assert.deepEqual(d.atRisk, ['gone.png'], 'an at-risk path must be named, not merely counted');
  assert.equal(d.bytes, 99);
});

test('3. a blob on a LOCAL ref only classifies LOCAL-REF-ONLY, never SAFE', () => {
  const d = dirtDurability(['l.png'], '/w', {
    runGit: gitStub(['ccc']), statFn: statsFor({ 'l.png': 5 }), sets: SETS([], ['ccc']),
  });
  assert.equal(d.counts['LOCAL-REF-ONLY'], 1);
  assert.equal(d.counts.SAFE, 0);
});

// THE ARM THAT CAUGHT A REAL DEFECT IN THIS CURE'S OWN FIRST DRAFT. That draft inferred
// presence FROM reachability (`bucketOf(onAnyRef, onRemote, onAnyRef)`), which makes this
// bucket UNREACHABLE and silently folds it into AT RISK. The two are not interchangeable:
// AT RISK dies with the disk, while an UNREFERENCED blob whose file is still on disk cannot
// be lost to `git gc` at all (F-2566-1). Presence is now asked separately, by `cat-file`.
test('4. a blob in the odb but on NO ref classifies UNREFERENCED, not AT RISK', () => {
  const d = dirtDurability(['u.png'], '/w', {
    runGit: gitStub(['ddd'], { presentIds: ['ddd'] }), statFn: statsFor({ 'u.png': 7 }), sets: SETS([], []),
  });
  assert.equal(d.counts.UNREFERENCED, 1, 'UNREFERENCED must be reachable — see the comment above');
  assert.equal(d.counts['AT RISK'], 0);
});

// ---------------------------------------------------------------- the denominator

test('5. a path that is not a file on disk is SKIPPED and DECLARED, never silently dropped', () => {
  const d = dirtDurability(['real.png', 'deleted.png', 'old.png -> new.png'], '/w', {
    runGit: gitStub(['aaa']), statFn: statsFor({ 'real.png': 3 }), sets: SETS(['aaa'], ['aaa']),
  });
  assert.equal(d.subjects, 3, 'subjects is the FULL input count, so the denominator cannot shrink quietly');
  assert.equal(d.hashed, 1);
  assert.deepEqual(d.skipped, ['deleted.png', 'old.png -> new.png']);
  const text = formatDirtDurability(d).join('\n');
  assert.match(text, /2 not a file on disk/, 'the skipped count must reach the reader');
});

// ---------------------------------------------------------------- failing toward NOTICING

test('6. unreadable object sets return UNVERIFIABLE, never a zeroed bucket', () => {
  const d = dirtDurability(['a.png'], '/w', {
    runGit: gitStub(['aaa']), statFn: statsFor({ 'a.png': 1 }), sets: { ok: false },
  });
  assert.equal(d.status, 'unverifiable');
  assert.equal(d.counts['AT RISK'], 0, 'the buckets stay zero AND the status says do not read them');
  const text = formatDirtDurability(d).join('\n');
  assert.match(text, /COULD NOT ANSWER/);
  assert.match(text, /never as clean/, 'an unanswerable read must not be mistaken for a clean one');
});

// F-2215-1 at the level that matters: a SHORT hash batch means some path went unhashed, and
// every unhashed path would otherwise read as "not at risk" — a false clean by omission.
test('7. a short hash-object batch is UNVERIFIABLE, not a partial answer', () => {
  const d = dirtDurability(['a.png', 'b.png'], '/w', {
    runGit: gitStub(['aaa', 'bbb'], { shortBatch: true }),
    statFn: statsFor({ 'a.png': 1, 'b.png': 2 }), sets: SETS(['aaa', 'bbb'], ['aaa', 'bbb']),
  });
  assert.equal(d.status, 'unverifiable');
  assert.match(d.reason, /hashed 1 of 2/);
});

test('8. a refused hash-object or cat-file is UNVERIFIABLE', () => {
  for (const opt of [{ hashOk: false }, { catOk: false }]) {
    const d = dirtDurability(['a.png'], '/w', {
      runGit: gitStub(['aaa'], opt), statFn: statsFor({ 'a.png': 1 }), sets: SETS(['aaa'], ['aaa']),
    });
    assert.equal(d.status, 'unverifiable', JSON.stringify(opt));
  }
});

// The options bag must be honoured for EVERY spawn. A runner that is accepted and then
// bypassed for two of three calls lets a guard attest to a subject it never measured.
test('9. runGit is used for ALL git calls — no spawn escapes the injected runner', () => {
  const seen = [];
  const spy = (args, opts) => { seen.push(args[0]); return gitStub(['aaa'])(args, opts); };
  dirtDurability(['a.png'], '/w', { runGit: spy, statFn: statsFor({ 'a.png': 1 }), sets: SETS(['aaa'], ['aaa']) });
  assert.deepEqual(seen.sort(), ['cat-file', 'hash-object'], 'both spawns must come through runGit');
});

// ---------------------------------------------------------------- what the reader is told

test('10. the all-clear PRINTS on a clean read (F-2208-1: not only on failure)', () => {
  const d = dirtDurability(['a.png'], '/w', {
    runGit: gitStub(['aaa']), statFn: statsFor({ 'a.png': 1 }), sets: SETS(['aaa'], ['aaa']),
  });
  const text = formatDirtDurability(d).join('\n');
  assert.match(text, /nothing would be lost/);
});

test('11. an AT RISK read carries a runnable remedy and names the destroying command', () => {
  const d = dirtDurability(['gone.png'], '/w', {
    runGit: gitStub(['bbb'], { presentIds: [] }), statFn: statsFor({ 'gone.png': 2_000_000 }), sets: SETS([], []),
  });
  const text = formatDirtDurability(d).join('\n');
  assert.match(text, /reset --hard main/, 'the reader must be told WHAT would destroy the bytes');
  assert.match(text, /save\/\*/, 'an alarm without a remedy is F-2451-1 all over again');
  assert.match(text, /2\.0 MB/);
});

// The whole point of DECLARING rather than CLEARING: this line must never read as permission.
test('12. every formatted read repeats that DIRTY is unchanged and is not a licence to reset', () => {
  const clean = dirtDurability(['a.png'], '/w', {
    runGit: gitStub(['aaa']), statFn: statsFor({ 'a.png': 1 }), sets: SETS(['aaa'], ['aaa']),
  });
  const risky = dirtDurability(['g.png'], '/w', {
    runGit: gitStub(['bbb'], { presentIds: [] }), statFn: statsFor({ 'g.png': 1 }), sets: SETS([], []),
  });
  for (const d of [clean, risky]) {
    const text = formatDirtDurability(d).join('\n');
    assert.match(text, /CONTENTION verdict/, 'the caveat must ride on the all-clear too');
    assert.match(text, /never a licence to reset/);
  }
});

// ---------------------------------------------------------------- end to end, in a real repo

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 's2639-durability-'));
  const sh = (args, cwd = dir) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  const origin = join(dir, 'origin.git');
  execFileSync('git', ['init', '--bare', '-q', origin], { encoding: 'utf8' });
  const repo = join(dir, 'repo');
  mkdirSync(repo);
  const rsh = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  rsh(['init', '-q', '-b', 'main']);
  rsh(['config', 'user.email', 'f@x']);
  rsh(['config', 'user.name', 'f']);
  mkdirSync(join(repo, 'reviews'), { recursive: true });
  writeFileSync(join(repo, 'reviews', 'safe.txt'), 'SAFE-CONTENT\n');
  writeFileSync(join(repo, 'reviews', 'risk.txt'), 'BASE\n');
  rsh(['add', '-A']);
  rsh(['commit', '-qm', 'base']);
  rsh(['remote', 'add', 'origin', origin]);
  rsh(['push', '-q', 'origin', 'main']);
  rsh(['fetch', '-q', 'origin']);
  // A lane worktree at the factory-side convention path.
  mkdirSync(join(repo, 'worktrees'), { recursive: true });
  rsh(['branch', 'lane/a']);
  rsh(['worktree', 'add', '-q', join(repo, 'worktrees', 'lane-a'), 'lane/a']);
  // An attended-owned worktree at a path `isFactorySide` must NOT claim.
  mkdirSync(join(repo, '.claude', 'worktrees'), { recursive: true });
  rsh(['branch', 'attended/x']);
  rsh(['worktree', 'add', '-q', join(repo, '.claude', 'worktrees', 'agent-x'), 'attended/x']);
  // Ship the subject and its siblings into the fixture so relative imports resolve and the
  // module-main NAME predicate is satisfied (a differently-named copy exits rc=0 with 0 B).
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  for (const f of ['lane-usable.mjs', 'lane-residue.mjs', 'modified-tracked-evidence-census.mjs']) {
    copyFileSync(join(HERE, f), join(repo, 'scripts', f));
  }
  writeFileSync(join(repo, 'STATUS.md'), 'Last updated: fixture\n');
  return { dir, repo, rsh, sh };
}

const runCli = (repo, args) => {
  try {
    return { rc: 0, out: execFileSync('node', [join(repo, 'scripts', 'lane-usable.mjs'), ...args], { cwd: repo, encoding: 'utf8', maxBuffer: 64 << 20 }) };
  } catch (e) {
    return { rc: e.status ?? -1, out: (e.stdout || '') + (e.stderr || '') };
  }
};

test('13. end to end: a DIRTY FACTORY lane gets the durability read, and DIRTY still exits 2', () => {
  const f = fixture();
  try {
    // Dirty the lane with content that exists nowhere in git -> AT RISK.
    writeFileSync(join(f.repo, 'worktrees', 'lane-a', 'reviews', 'risk.txt'), 'NEVER-COMMITTED\n');
    const r = runCli(f.repo, ['lane-a']);
    assert.ok(r.out.length > 0, 'control: the CLI produced output at all');
    assert.match(r.out, /=> DIRTY/);
    assert.match(r.out, /would a reset LOSE any of it\?/);
    assert.match(r.out, /AT RISK 1/);
    assert.equal(r.rc, 2, 'the cure DECLARES: the DIRTY exit code must not move');
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

// REVERSE CONTROL for over-general cure #2. This is the arm that would have caught the
// version of this cure I very nearly shipped.
test('14. end to end: a DIRTY ATTENDED tree gets a POINTER, never an AT RISK alarm', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.repo, '.claude', 'worktrees', 'agent-x', 'reviews', 'risk.txt'), 'NEVER-COMMITTED\n');
    const r = runCli(f.repo, ['--all']);
    const rows = r.out.split('\n');
    const i = rows.findIndex((l) => /agent-x|attended\/x/.test(l));
    assert.ok(i !== -1, 'control: the attended worktree really is in the fleet listing');
    const after = rows.slice(i, i + 12).join('\n');
    assert.match(after, /ATTENDED-OWNED tree/);
    assert.doesNotMatch(after, /AT RISK \d/, 'a fire never resets an attended tree — an alarm here is false urgency');
    assert.match(after, /modified-tracked-evidence-census/, 'it must name the instrument that DOES own this question');
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

// THE LOAD-BEARING REVERSE CONTROL FOR OVER-GENERAL CURE #1, and the teeth sweep is what
// proved it was missing: with only arms 13 and 15, manufacturing "let an all-SAFE read soften
// DIRTY into USABLE" reddened NOTHING. Arm 13's lane is dirty with AT RISK content, so it stays
// DIRTY under that defect too, and arm 15's lane is not dirty at all — so the one state where
// clearing actually fires (DIRTY, every byte already safe) had no arm. That state is not
// hypothetical: it is lane-d on the live board today, 26 files, all SAFE. Clearing there would
// hand a fire `USABLE: refill freely` over another owner's uncommitted work — the Reset Massacre
// (Mistake #2) with a green suite attesting to it.
test('16. end to end: an ALL-SAFE dirty lane is STILL DIRTY — declaring never clears', () => {
  const f = fixture();
  try {
    // Put a second version on origin, then write exactly that content into the lane worktree:
    // the file now DIFFERS from the lane's own HEAD (so it is dirt) while its blob is already
    // reachable from an origin ref (so every bucket is SAFE).
    writeFileSync(join(f.repo, 'reviews', 'safe.txt'), 'VERSION-2\n');
    f.rsh(['add', '-A']);
    f.rsh(['commit', '-qm', 'v2']);
    f.rsh(['push', '-q', 'origin', 'main']);
    f.rsh(['fetch', '-q', 'origin']);
    writeFileSync(join(f.repo, 'worktrees', 'lane-a', 'reviews', 'safe.txt'), 'VERSION-2\n');

    const r = runCli(f.repo, ['lane-a']);
    assert.ok(r.out.length > 0, 'control: the CLI produced output at all');
    assert.match(r.out, /SAFE 1 · LOCAL-REF-ONLY 0 · UNREFERENCED 0 · AT RISK 0/,
      'control: this fixture really does reach the all-SAFE state the arm is about');
    assert.match(r.out, /=> DIRTY/, 'an all-SAFE durability read must NOT soften the verdict');
    assert.equal(r.rc, 2, 'nor the exit code — the cure DECLARES, it never CLEARS');
    assert.doesNotMatch(r.out, /refill freely/, 'and it must never read as permission to reset');
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});

// REVERSE CONTROL for an always-on read: a lane with no tracked dirt is not DIRTY, and must
// stay byte-quiet. An unconditional durability line across a 30-row fleet is the noise that
// decays a declaration into a formality (F-2366-1's measured reason for scoping BUSY).
test('15. end to end: a clean lane prints NO durability line at all', () => {
  const f = fixture();
  try {
    const r = runCli(f.repo, ['lane-a']);
    assert.ok(r.out.length > 0, 'control: the CLI produced output at all');
    assert.doesNotMatch(r.out, /would a reset LOSE/);
    assert.doesNotMatch(r.out, /ATTENDED-OWNED tree/);
    assert.equal(r.rc, 0);
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});
