// Guard for scripts/untracked-evidence-durability.mjs (F-2586-1).
//
// The subject encodes six findings that SIX consecutive fires each got wrong by hand
// (F-2570-1 · F-2571-1 · F-2572-1 · F-2581-1 · F-2582-1, plus F-2495-1's in-flight test).
// Every arm below was proven by MANUFACTURING the defect on a fixture, not by watching a
// green — a passing subject never executes its violation path, so its green is not evidence
// about the red (the s1299/s1300 standard).
//
// Arms run against a REAL fixture repo with a REAL origin, because F-2560-1's own method
// note records that a fixture WITHOUT an origin measures a different question entirely:
// every committed asset is legitimately LOCAL-REF-ONLY and that bucket appears to
// discriminate for a reason having nothing to do with the corpus.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import {
  resolveInTree,
  preservationOf,
  subjectsOfTree,
} from './untracked-evidence-durability.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'untracked-evidence-durability.mjs');
const BOUND = { timeout: 240_000, killSignal: 'SIGKILL' };

const g = (cwd, args, opts = {}) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, ...opts });

/** A fixture repo with an origin, an evidence file, and a retention ref whose
 *  BACKUP-MANIFEST.json preserves that file's blob in BOTH shapes. */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'gr-ued-'));
  const originPath = join(root, 'origin.git');
  const work = join(root, 'work');
  g(root, ['init', '--bare', '-q', 'origin.git']);
  g(root, ['init', '-q', 'work']);
  g(work, ['config', 'user.email', 'g@example.com']);
  g(work, ['config', 'user.name', 'Guard']);
  g(work, ['remote', 'add', 'origin', originPath]);
  writeFileSync(join(work, 'README.md'), 'fixture\n');
  g(work, ['add', 'README.md']);
  g(work, ['commit', '-qm', 'base']);
  g(work, ['push', '-q', 'origin', 'HEAD:refs/heads/main']);
  g(work, ['fetch', '-q', 'origin']);
  return { root, work, originPath, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

/** Write an untracked evidence file.
 *  `intoOdb: true` writes the blob to the object database, which makes it UNREFERENCED (in
 *  the odb, held by no ref). `intoOdb: false` leaves it AT RISK — in NO object database.
 *  That is the honest way to manufacture AT RISK: deleting `.git/objects` also destroys the
 *  objects backing `origin/HEAD`, so the tool's own control legitimately refuses and the arm
 *  measures nothing (paid for in this guard's first run). */
function evidenceFile(work, rel, body, { intoOdb = true } = {}) {
  const abs = join(work, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
  const blob = intoOdb
    ? g(work, ['hash-object', '-w', abs]).trim()
    : g(work, ['hash-object', abs]).trim();
  return { abs, rel, blob, sha256: createHash('sha256').update(body).digest('hex'), bytes: Buffer.byteLength(body) };
}

/** Mint a retention ref holding `entries` and the named stored paths. */
function retentionRef(work, refName, entries, storedFiles, { push = true } = {}) {
  const idx = join(work, '.git', 'tmp-index-' + Math.random().toString(36).slice(2));
  const env = { ...process.env, GIT_INDEX_FILE: idx };
  const add = (path, body) => {
    const oid = g(work, ['hash-object', '-w', '--stdin'], { input: body }).trim();
    g(work, ['update-index', '--add', '--cacheinfo', `100644,${oid},${path}`], { env });
  };
  add('BACKUP-MANIFEST.json', JSON.stringify({ files: entries }, null, 2));
  for (const [path, body] of Object.entries(storedFiles)) add(path, body);
  const tree = g(work, ['write-tree'], { env }).trim();
  const commit = g(work, ['commit-tree', tree, '-m', 'retention'], { env }).trim();
  g(work, ['update-ref', `refs/heads/${refName}`, commit]);
  if (push) g(work, ['push', '-q', 'origin', `refs/heads/${refName}:refs/heads/${refName}`]);
  g(work, ['fetch', '-q', 'origin']);
  rmSync(idx, { force: true });
  return commit;
}

const run = (work, args = []) => {
  const r = spawnSync(process.execPath, [SUBJECT, '--root', work, ...args], {
    encoding: 'utf8', maxBuffer: 64 << 20, ...BOUND,
  });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
};

// ---------------------------------------------------------------- unit: the loose key

test('resolveInTree REFUSES an ambiguous suffix rather than guessing (F-2572-1)', () => {
  const tree = ['a/parts/part-00', 'b/parts/part-00', 'c/whole.bin'];
  // exact hit
  assert.deepEqual(resolveInTree(tree, 'a/parts/part-00'), { path: 'a/parts/part-00', how: 'exact' });
  // unique suffix
  assert.deepEqual(resolveInTree(tree, 'whole.bin'), { path: 'c/whole.bin', how: 'suffix' });
  // AMBIGUOUS — two entries end in the same basename. The fuzzy `endsWith` this replaces
  // silently returns the FIRST, which is how a verifier attests to the wrong bytes.
  assert.deepEqual(resolveInTree(tree, 'part-00'), { ambiguous: 2 });
  // absent is null, never a guess
  assert.equal(resolveInTree(tree, 'nope.bin'), null);
});

test('resolveInTree does not match a partial path SEGMENT', () => {
  // `xpart-00` must not satisfy a request for `part-00` — the suffix test is anchored on a
  // path separator, so a filename that merely ENDS with the wanted string is not a hit.
  assert.equal(resolveInTree(['dir/xpart-00'], 'part-00'), null);
});

// ---------------------------------------------------------------- unit: entry shapes

test('preservationOf resolves BOTH shapes — parts[] and storedAs (F-2581-1)', () => {
  const remote = new Set(['aaa', 'bbb', 'ccc']);
  const gitFn = (args) => {
    const ref = args[1];
    const map = { 'r:x/parts/part-00': 'aaa', 'r:x/parts/part-01': 'bbb', 'r:x/whole.bin': 'ccc' };
    if (!(ref in map)) throw new Error('unresolvable');
    return map[ref] + '\n';
  };
  const tree = ['BACKUP-MANIFEST.json', 'x/parts/part-00', 'x/parts/part-01', 'x/whole.bin'];

  const split = preservationOf(
    { ref: 'r', tree, entry: { gitBlob: 'z', parts: [{ path: 'x/parts/part-00' }, { path: 'x/parts/part-01' }] } },
    remote, { gitFn },
  );
  assert.equal(split.verdict, 'PRESERVED');
  assert.equal(split.shape, 'SPLIT');
  assert.equal(split.parts, 2);

  // A parts-only test scores this `0/0` and reports NOT PRESERVED — F-2581-1's whole defect.
  const whole = preservationOf({ ref: 'r', tree, entry: { gitBlob: 'z', storedAs: 'x/whole.bin' } }, remote, { gitFn });
  assert.equal(whole.verdict, 'PRESERVED');
  assert.equal(whole.shape, 'WHOLE');
  assert.equal(whole.parts, 1);
});

test('an entry with NEITHER shape is UNKNOWN SHAPE, never absence (F-2581-1)', () => {
  const r = preservationOf({ ref: 'r', tree: [], entry: { gitBlob: 'z' } }, new Set(), {});
  assert.equal(r.verdict, 'UNKNOWN SHAPE');
  assert.notEqual(r.verdict, 'NOT PRESERVED');
});

test('a part that is NOT origin-reachable reads INCOMPLETE, not PRESERVED (F-1055-1)', () => {
  const gitFn = () => 'local-only-oid\n';
  const r = preservationOf(
    { ref: 'r', tree: ['x/parts/part-00'], entry: { gitBlob: 'z', parts: [{ path: 'x/parts/part-00' }] } },
    new Set(['something-else']), { gitFn },
  );
  assert.equal(r.verdict, 'INCOMPLETE');
  assert.equal(r.onRemote, 0);
  assert.match(r.problems.join(' '), /not origin-reachable/);
});

test('no manifest hit at all is NOT PRESERVED (and is distinguishable from UNKNOWN SHAPE)', () => {
  assert.equal(preservationOf(undefined, new Set(), {}).verdict, 'NOT PRESERVED');
});

// ---------------------------------------------------------------- unit: the subject set

test('subjectsOfTree REFUSES a tree with zero tracked files (F-2215-1)', () => {
  const f = fixture();
  try {
    const empty = join(f.root, 'bare-empty');
    mkdirSync(empty);
    g(f.root, ['init', '-q', 'bare-empty']);
    // A tree that answers must have tracked files, else its empty subject list is a failed
    // read wearing a clean answer's clothes.
    assert.throws(() => subjectsOfTree(empty), /zero tracked/);
  } finally { f.cleanup(); }
});

test('subjectsOfTree takes untracked AND modified-tracked, and only evidence prefixes', () => {
  const f = fixture();
  try {
    evidenceFile(f.work, 'artifacts/probe/a.log', 'a\n');   // untracked evidence  -> IN
    evidenceFile(f.work, 'src/thing.ts', 'x\n');            // untracked non-evidence -> OUT
    // a TRACKED evidence file, then modified: `--others` is blind to this (F-2569-1)
    const t = evidenceFile(f.work, 'reviews/r.md', 'one\n');
    g(f.work, ['add', 'reviews/r.md']);
    g(f.work, ['commit', '-qm', 'track review']);
    writeFileSync(t.abs, 'two\n');

    const subj = subjectsOfTree(f.work).map((s) => s.path).sort();
    assert.deepEqual(subj, ['artifacts/probe/a.log', 'reviews/r.md']);
  } finally { f.cleanup(); }
});

// ---------------------------------------------------------------- CLI: the observable

test('the happy path DECLARES its corpus, controls and ALL FOUR buckets (F-2208-1)', () => {
  const f = fixture();
  try {
    const r = run(f.work);
    assert.equal(r.rc, 0, r.out + r.err);
    // In advisory mode stdout is the WHOLE interface (F-2210-1), so assert the observable.
    assert.match(r.out, /corpus\s+:/);
    assert.match(r.out, /controls\s+:/);
    for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY', 'SAFE']) {
      assert.match(r.out, new RegExp(k.replace(' ', '\\s')), `bucket ${k} must print even when empty`);
    }
    // the banked regression figures are a successor's free check (F-2581-1)
    assert.match(r.out, /BANKED/);
    assert.match(r.out, /23\/23 parts/);
  } finally { f.cleanup(); }
});

test('an UNREFERENCED subject is reported, and its prunable-fuse reading is disclaimed (F-2566-1)', () => {
  const f = fixture();
  try {
    // written to the odb but held by NO ref, and still on disk -> UNREFERENCED
    evidenceFile(f.work, 'artifacts/probe/orphan.bin', 'orphan-bytes\n');
    const r = run(f.work);
    assert.equal(r.rc, 0, r.out + r.err);
    assert.match(r.out, /UNREFERENCED\s+1 file/);
    assert.match(r.out, /git gc` costs nothing|REDUNDANT/);
  } finally { f.cleanup(); }
});

test('a non-SAFE subject preserved by a retention transform reads PRESERVED end-to-end', () => {
  const f = fixture();
  try {
    const body = 'PRESERVE-ME'.repeat(200);
    const ev = evidenceFile(f.work, 'artifacts/probe/big.bin', body);
    const half = Math.floor(body.length / 2);
    const p0 = body.slice(0, half);
    const p1 = body.slice(half);
    retentionRef(f.work, 'save/fixture-s1', [{
      path: ev.rel,
      gitBlob: ev.blob,
      sha256: ev.sha256,
      bytes: ev.bytes,
      parts: [
        { path: 'kept/parts/part-00', sha256: createHash('sha256').update(p0).digest('hex'), bytes: p0.length },
        { path: 'kept/parts/part-01', sha256: createHash('sha256').update(p1).digest('hex'), bytes: p1.length },
      ],
    }], { 'kept/parts/part-00': p0, 'kept/parts/part-01': p1 });

    const r = run(f.work);
    assert.equal(r.rc, 0, r.out + r.err);
    assert.match(r.out, /✅ SPLIT\s+2\/2/);
    assert.match(r.out, /RETENTION VERDICT: 1\/1 non-SAFE subject\(s\) fully preserved/);
    assert.match(r.out, /FALSE URGENCY/);

    // --verify-bytes streams the parts and checks the manifest's OWN sha256 (F-2582-1):
    // presence is not recoverability, and this is the arm that knows the difference.
    const v = run(f.work, ['--verify-bytes']);
    assert.equal(v.rc, 0, v.out + v.err);
    assert.match(v.out, /BYTES VERIFIED: 1\/1 reconstruct/);
    assert.match(v.out, /sha256 ✓ reconstructs/);
  } finally { f.cleanup(); }
});

test('--verify-bytes CATCHES a transform whose parts do not reconstruct (F-2582-1)', () => {
  const f = fixture();
  try {
    const body = 'GOOD'.repeat(100);
    const ev = evidenceFile(f.work, 'artifacts/probe/claim.bin', body);
    // The manifest CLAIMS this blob, and its part is origin-reachable — so presence-only
    // checks pass. The stored bytes are WRONG, which only a hash can see.
    //
    // The corruption is the SAME LENGTH as the original ON PURPOSE. A shorter corruption is
    // caught by the BYTE-COUNT check, so the arm would pass with the sha256 check deleted —
    // which is exactly what this guard's own teeth sweep measured on its first run, and it
    // is F-2582-1's lesson landing on the test instead of the tool.
    const corrupt = 'BAD!'.repeat(100);
    assert.equal(corrupt.length, body.length, 'the corruption must be byte-length-identical');
    retentionRef(f.work, 'save/fixture-bad', [{
      path: ev.rel, gitBlob: ev.blob, sha256: ev.sha256, bytes: ev.bytes,
      parts: [{ path: 'kept/parts/part-00', sha256: ev.sha256, bytes: ev.bytes }],
    }], { 'kept/parts/part-00': corrupt });

    const presence = run(f.work);
    assert.match(presence.out, /RETENTION VERDICT: 1\/1 non-SAFE subject\(s\) fully preserved/,
      'presence-only must still read preserved — that IS the blind spot F-2582-1 names');

    const v = run(f.work, ['--verify-bytes']);
    assert.match(v.out, /BYTES VERIFIED: 0\/1 reconstruct/);
    // assert the HASH specifically: a byte-count mismatch is a different check and cannot
    // stand in for this one.
    assert.match(v.out, /sha256 mismatch/);
    assert.doesNotMatch(v.out, /byte mismatch/, 'the fixture is length-identical by construction');
  } finally { f.cleanup(); }
});

test('IN FLIGHT fires on a freshly-written subject and is silent on an old one (F-2495-1)', () => {
  const f = fixture();
  try {
    const ev = evidenceFile(f.work, 'artifacts/probe/live.bin', 'live\n');
    const fresh = run(f.work);
    assert.match(fresh.out, /IN FLIGHT/);
    assert.match(fresh.out, /DO NOT TOUCH/);

    // age it past the window; the timestamp is what gets carried, not a derived age (F-2567-1)
    const old = Date.now() / 1000 - 7 * 86400;
    utimesSync(ev.abs, old, old);
    const quiet = run(f.work);
    assert.doesNotMatch(quiet.out, /IN FLIGHT/);
    assert.match(quiet.out, /days quiet/);
  } finally { f.cleanup(); }
});

test('AT RISK is split by POPULATION so the desk figure cannot be misread (F-2585-1)', () => {
  const f = fixture();
  try {
    // one at-risk file in EACH population, so the two halves cannot coincide — a fixture in
    // which both readings agree cannot test which one you reported (s2585's paid-for lesson).
    evidenceFile(f.work, 'artifacts/probe/untracked-risk.bin', 'u\n', { intoOdb: false });
    const t = evidenceFile(f.work, 'reviews/tracked-risk.md', 'one\n');
    g(f.work, ['add', 'reviews/tracked-risk.md']);
    g(f.work, ['commit', '-qm', 'track it']);
    writeFileSync(t.abs, 'two-never-hashed\n'); // modified, and this content is in no odb

    const r = run(f.work, ['--json']);
    const j = JSON.parse(r.out);
    assert.equal(j.buckets['AT RISK'].files, 2, 'both halves must be at risk: ' + r.out);
    assert.equal(j.atRiskByPopulation['modified-tracked'].files, 1);
    assert.equal(j.atRiskByPopulation.untracked.files, 1);
    assert.match(j.atRiskByPopulation['modified-tracked'].note, /desk figure/);

    const human = run(f.work);
    assert.match(human.out, /AT RISK splits by POPULATION/);
    assert.match(human.out, /= the DESK figure/);
    assert.match(human.out, /Do NOT paste the combined AT RISK count/);
  } finally { f.cleanup(); }
});

test('--strict REDS on FACTORY-SIDE at-risk bytes that no transform preserves', () => {
  const f = fixture();
  try {
    // AT RISK: never written to the object database at all.
    evidenceFile(f.work, 'artifacts/probe/lost.bin', 'lost\n', { intoOdb: false });
    // The swept tree IS the resolved root, and the root is factory-side by definition — a
    // fire may lawfully write in main. This is the one actionable case, so it must red.
    const r = run(f.work, ['--strict']);
    assert.notEqual(r.rc, 2, 'must still be able to answer: ' + r.out + r.err);
    assert.equal(r.rc, 1, 'factory-side unpreserved bytes are a fire\'s own duty: ' + r.out);
    assert.match(r.out, /FACTORY-SIDE and unpreserved/);
    assert.match(r.out, /salvage-art-staging/, 'an alarm must carry its remedy (F-2451-1)');
  } finally { f.cleanup(); }
});

test('--strict does NOT red on ATTENDED-OWNED at-risk bytes — that is an OWNER call (F-2561-1)', () => {
  const f = fixture();
  try {
    // A registered LINKED worktree at a non-lane path is attended-owned by isFactorySide's
    // convention. The at-risk file lives ONLY there, so the root contributes nothing.
    const attended = join(f.root, 'attended-ish');
    g(f.work, ['worktree', 'add', '-q', '--detach', attended]);
    evidenceFile(attended, 'artifacts/probe/theirs.bin', 'theirs\n', { intoOdb: false });

    const r = run(f.work, ['--all-trees', '--strict']);
    assert.notEqual(r.rc, 2, 'must still be able to answer: ' + r.out + r.err);
    // A red on the normal state is excused into uselessness inside a week (F-1460-1), and
    // reaching into someone else's tree is the Mistake #2 direction F-2489-1 forbids.
    assert.equal(r.rc, 0, 'attended-owned bytes must NOT red: ' + r.out);
    assert.match(r.out, /attended-owned \(REPORT, never touch/);
    assert.doesNotMatch(r.out, /FACTORY-SIDE and unpreserved/);
  } finally { f.cleanup(); }
});

test('REFUSES with 2 — could-not-answer — rather than reporting an empty board as clean', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gr-ued-nogit-'));
  try {
    const r = run(dir);
    // 2 = could not answer, distinct from 1 = answered and the answer refuses.
    assert.equal(r.rc, 2, r.out + r.err);
    // the refusal must reach STDOUT: a caller that classifies stdout reads an empty string
    // as silence (F-2211-1).
    assert.match(r.out, /CANNOT VERIFY/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('--json carries the buckets, the preservation counts and the in-flight fact', () => {
  const f = fixture();
  try {
    evidenceFile(f.work, 'artifacts/probe/j.bin', 'j\n');
    const r = run(f.work, ['--json']);
    assert.equal(r.rc, 0, r.out + r.err);
    const j = JSON.parse(r.out);
    assert.equal(j.subjects, 1);
    assert.equal(j.buckets.UNREFERENCED.files, 1);
    assert.equal(j.nonSafe, 1);
    assert.equal(j.bytesVerified, false);
    assert.ok(j.inflight && typeof j.inflight.newestMtimeIso === 'string');
    assert.ok(typeof j.treesRegistered === 'number' && j.treesRegistered >= 1);
  } finally { f.cleanup(); }
});

test('the subject is anchored by --root, so a fixture arm cannot measure the REAL repo', () => {
  // F-2221-1's trap, and the sibling census's own paid-for lesson: without --root this file
  // anchors to its OWN directory, so an arm that merely sets cwd asserts about the live
  // board and is vacuous. This asserts the CONTROL is aimed at the fixture.
  const f = fixture();
  try {
    const r = run(f.work, ['--json']);
    const j = JSON.parse(r.out);
    assert.equal(j.treesRegistered, 1, 'the fixture has exactly one worktree; the live board has >100');
    assert.equal(j.treesSwept, 1);
  } finally { f.cleanup(); }
});
