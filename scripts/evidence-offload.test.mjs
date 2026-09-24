// THE OFFLOAD, EXERCISED END TO END AGAINST A FIXTURE ARCHIVE REMOTE.
//
// Nothing here touches the real `archive` remote, and one of the cases PROVES that: the tool refuses
// a worktree pointing at it unless `--drain-authorized` is passed, which is the whole reason the
// branch can ship a mover and still leave the first 7.6 GB move to the attended drain.
//
// Every case builds a WHOLE SMALL REPO plus a bare remote in `mkdtemp`, because the properties under
// test are properties of git: a file must leave the index AND the disk in ONE commit, the archive
// commit must hold it at the same byte size BEFORE that happens, and a slice must not exceed a
// ceiling that GitHub enforces on the push nobody can undo.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { INDEX_PATH, sliceFiles } from './evidence-offload.mjs';

const SCRIPT = join(import.meta.dirname, 'evidence-offload.mjs');
const READERS = join(import.meta.dirname, 'evidence-readers.mjs');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** A 12x8 PNG, small enough that the preview step has something real to resize and cheap to write. */
async function png(file) {
  const { default: sharp } = await import('sharp');
  mkdirSync(dirname(file), { recursive: true });
  await sharp({ create: { width: 640, height: 480, channels: 3, background: '#241a10' } }).png().toFile(file);
}

async function fixture(t, { registerArchiveRemote = false } = {}) {
  const base = mkdtempSync(join(tmpdir(), 'evidence-offload-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = join(base, 'repo');
  const bare = join(base, 'archive.git');
  const work = join(base, 'archive-wt');

  const files = {
    // The must-stay half: a reader in the scan space plus the file it reads.
    'scripts/reader.mjs': "import { readFileSync } from 'node:fs';\nexport const fixture = readFileSync('artifacts/keep-tree/fixture.json', 'utf8');\n",
    'artifacts/keep-tree/fixture.json': '{"kept":true}\n',
    // The movable half, with a report.md the law keeps and a review citing the subtree.
    'artifacts/movable/report.md': '# the movable run\n',
    'artifacts/movable/a.txt': `${'a'.repeat(400)}\n`,
    'artifacts/movable/b.txt': `${'b'.repeat(400)}\n`,
    'artifacts/movable/nested/c.txt': `${'c'.repeat(400)}\n`,
    'artifacts/movable/huge.bin': `${'h'.repeat(4000)}\n`,
    'reviews/slice-01.md': 'Evidence: `artifacts/movable/board.png` and `artifacts/movable/a.txt`.\n',
  };
  for (const [file, body] of Object.entries(files)) {
    mkdirSync(join(root, dirname(file)), { recursive: true });
    writeFileSync(join(root, file), body);
  }
  await png(join(root, 'artifacts/movable/board.png'));

  git(base, 'init', '-q', '--bare', bare);
  git(base, 'init', '-q', root);
  git(root, 'config', 'user.email', 'fixture@example.com');
  git(root, 'config', 'user.name', 'fixture');
  if (registerArchiveRemote) git(root, 'remote', 'add', 'archive', bare);
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'fixture');

  git(base, 'init', '-q', work);
  git(work, 'config', 'user.email', 'fixture@example.com');
  git(work, 'config', 'user.name', 'fixture');
  git(work, 'remote', 'add', 'origin', bare);
  git(work, 'checkout', '-q', '--orphan', 'evidence');
  return { base, root, bare, work };
}

function run(root, ...args) {
  return spawnSync(process.execPath, [SCRIPT, '--root', root, ...args],
    { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
}

const tracked = (root, path) => git(root, 'ls-files', '--', path).split('\n').filter(Boolean);

// ─── THE PLAN ──────────────────────────────────────────────────────────────────────────────────

test('--plan lists the movable subtree with its citations and omits the must-stay one', async (t) => {
  const { root } = await fixture(t);
  const result = run(root, '--plan', '--json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const board = JSON.parse(result.stdout);
  const movable = board.candidates.find((c) => c.subtree === 'artifacts/movable');
  assert.ok(movable, `no candidate for artifacts/movable: ${board.candidates.map((c) => c.subtree)}`);
  assert.deepEqual(movable.keep, ['artifacts/movable/report.md']);
  assert.equal(movable.citations, 2, 'both backticked citations in the review count');
  assert.deepEqual(movable.citingReviews, ['reviews/slice-01.md']);
  assert.equal(board.candidates.some((c) => c.subtree === 'artifacts/keep-tree'), false);
  assert.ok(board.totals.mustStayFiles >= 1 && board.totals.movableFiles >= 4);
});

test('the human --plan prints the must-stay derivation it used, not just the movable list', async (t) => {
  const { root } = await fixture(t);
  const result = run(root, '--plan');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /MUST STAY\s+: \d+ file\(s\)/);
  assert.match(result.stdout, /scripts\/evidence-readers\.mjs/);
});

// ─── THE APPLY ─────────────────────────────────────────────────────────────────────────────────

test('--apply moves a subtree, verifies it in the archive commit, and empties it from git AND disk in one commit', async (t) => {
  const { root, work } = await fixture(t);
  const before = git(root, 'rev-parse', 'HEAD').trim();
  const result = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /VERIFIED in the archive commit/);

  const index = JSON.parse(readFileSync(join(root, INDEX_PATH), 'utf8'));
  const entry = index.subtrees['artifacts/movable'];
  assert.ok(entry, 'the index must name the moved subtree');
  assert.equal(entry.files, 5, 'five movable files: three texts, the board png and the binary');
  assert.deepEqual(entry.kept, ['artifacts/movable/report.md']);
  assert.equal(entry.archiveCommits.length, 1);
  assert.equal(index.archive.branch, 'evidence');
  for (const file of ['artifacts/movable/a.txt', 'artifacts/movable/nested/c.txt']) {
    assert.equal(index.files[file].archiveCommit, entry.archiveCommits[0]);
    assert.match(index.files[file].sha256, /^[0-9a-f]{64}$/);
    assert.ok(index.files[file].bytes > 0);
    assert.match(index.files[file].movedDate, /^\d{4}-\d{2}-\d{2}$/);
  }

  // In the archive, at the same bytes.
  // `refs/heads/evidence` in full: the worktree HOLDS a directory called `evidence/`, so the bare
  // branch name is ambiguous to git and a test that used it would fail for the wrong reason.
  const archived = git(work, 'ls-tree', '-r', '--name-only', 'refs/heads/evidence').split('\n').filter(Boolean);
  assert.deepEqual(archived.filter((p) => p.endsWith('a.txt')), ['evidence/artifacts/movable/a.txt']);
  assert.equal(
    git(work, 'cat-file', '-s', 'refs/heads/evidence:evidence/artifacts/movable/a.txt').trim(),
    String(index.files['artifacts/movable/a.txt'].bytes),
  );

  // Gone from git AND from disk, with only the pointer, the preview and the kept report left.
  assert.deepEqual(tracked(root, 'artifacts/movable').sort(), [
    'artifacts/movable/ARCHIVED.md', 'artifacts/movable/PREVIEW.png', 'artifacts/movable/report.md',
  ]);
  for (const file of ['artifacts/movable/a.txt', 'artifacts/movable/board.png', 'artifacts/movable/nested/c.txt']) {
    assert.equal(existsSync(join(root, file)), false, `${file} must not survive on disk (ON-DISK-UNTRACKED is the red)`);
  }
  assert.equal(existsSync(join(root, 'artifacts/movable/report.md')), true, 'report.md is never touched');
  assert.match(readFileSync(join(root, 'artifacts/movable/ARCHIVED.md'), 'utf8'), /^# ARCHIVED/);

  // One commit carries the removals, the index, the pointer and the preview together.
  assert.equal(git(root, 'status', '--porcelain').trim(), '');
  const head = git(root, 'rev-parse', 'HEAD').trim();
  assert.notEqual(head, before);
  const touched = git(root, 'diff', '--name-status', `${before}..${head}`).split('\n').filter(Boolean);
  assert.ok(touched.some((l) => l.startsWith('D\tartifacts/movable/a.txt')), touched.join(' | '));
  assert.ok(touched.some((l) => l.startsWith(`A\t${INDEX_PATH}`)), touched.join(' | '));
  assert.ok(touched.some((l) => l.startsWith('A\tartifacts/movable/ARCHIVED.md')), touched.join(' | '));
  assert.match(git(root, 'log', '-1', '--format=%s').trim(), /^chore: offload 1 evidence subtree/);
});

test('the preview is one small PNG per subtree, made from its board shot', async (t) => {
  const { root, work } = await fixture(t);
  assert.equal(run(root, '--apply', 'artifacts/movable', '--archive-worktree', work).status, 0);
  const index = JSON.parse(readFileSync(join(root, INDEX_PATH), 'utf8'));
  assert.deepEqual(index.subtrees['artifacts/movable'].previews, ['artifacts/movable/PREVIEW.png']);
  const { default: sharp } = await import('sharp');
  const { width, height } = await sharp(join(root, 'artifacts/movable/PREVIEW.png')).metadata();
  assert.ok(Math.max(width, height) <= 320, `preview is ${width}x${height}`);
  assert.ok(width > 1 && height > 1, 'the preview must be a real picture of the run, not a placeholder');
});

// ─── THE REFUSALS ──────────────────────────────────────────────────────────────────────────────

test('a must-stay subtree is REFUSED, and nothing moves', async (t) => {
  const { root, work } = await fixture(t);
  const before = git(root, 'rev-parse', 'HEAD').trim();
  const result = run(root, '--apply', 'artifacts/keep-tree', '--archive-worktree', work);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /REFUSING — artifacts\/keep-tree is MUST-STAY/);
  assert.equal(git(root, 'rev-parse', 'HEAD').trim(), before);
  assert.equal(existsSync(join(root, 'artifacts/keep-tree/fixture.json')), true);
  assert.equal(existsSync(join(root, INDEX_PATH)), false);
});

test('a dirty archive worktree is REFUSED before anything is copied', async (t) => {
  const { root, work } = await fixture(t);
  writeFileSync(join(work, 'stray.txt'), 'half a commit\n');
  const result = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /REFUSING — the archive worktree is dirty/);
  assert.deepEqual(tracked(root, 'artifacts/movable/a.txt'), ['artifacts/movable/a.txt']);
});

test('a worktree pointing at the REAL archive remote is REFUSED without --drain-authorized', async (t) => {
  const { root, work } = await fixture(t, { registerArchiveRemote: true });
  const refused = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work);
  assert.equal(refused.status, 1);
  assert.match(refused.stdout, /REFUSING — this worktree points at the REAL archive remote/);
  assert.doesNotMatch(refused.stdout + refused.stderr, /archive\.git/, 'the remote URL is never printed');
  const authorized = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work, '--drain-authorized');
  assert.equal(authorized.status, 0, authorized.stdout + authorized.stderr);
});

test('--apply without an archive worktree is REFUSED rather than fetching one itself', async (t) => {
  const { root } = await fixture(t);
  const result = run(root, '--apply', 'artifacts/movable');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /REFUSING — --apply needs --archive-worktree/);
});

test('a modified tracked evidence file blocks its subtree rather than being moved mid-edit', async (t) => {
  const { root, work } = await fixture(t);
  writeFileSync(join(root, 'artifacts/movable/a.txt'), 'edited while the move was planned\n');
  const result = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /REFUSING — artifacts\/movable has 1 modified tracked file/);
});

// ─── THE TWO CEILINGS GITHUB ENFORCES ──────────────────────────────────────────────────────────

test('--slice-bytes splits the move into several archive commits', async (t) => {
  const { root, work } = await fixture(t);
  const result = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work, '--slice-bytes', '500');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const index = JSON.parse(readFileSync(join(root, INDEX_PATH), 'utf8'));
  const commits = index.subtrees['artifacts/movable'].archiveCommits;
  assert.ok(commits.length >= 4, `expected several slices under a 500 B ceiling, got ${commits.length}`);
  assert.equal(new Set(commits).size, commits.length, 'each slice is its own commit');
  assert.equal(git(work, 'rev-list', '--count', 'refs/heads/evidence').trim(), String(commits.length));
  assert.equal(tracked(root, 'artifacts/movable/a.txt').length, 0);
});

test('a blob over the ceiling is LEFT IN PLACE and listed, never silently dropped', async (t) => {
  const { root, work } = await fixture(t);
  const result = run(root, '--apply', 'artifacts/movable', '--archive-worktree', work, '--max-blob', '1000');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const index = JSON.parse(readFileSync(join(root, INDEX_PATH), 'utf8'));
  const entry = index.subtrees['artifacts/movable'];
  assert.ok(entry.oversizeLeftInPlace.includes('artifacts/movable/huge.bin'), JSON.stringify(entry.oversizeLeftInPlace));
  assert.deepEqual(tracked(root, 'artifacts/movable/huge.bin'), ['artifacts/movable/huge.bin']);
  assert.equal(existsSync(join(root, 'artifacts/movable/huge.bin')), true);
  assert.equal(index.files['artifacts/movable/huge.bin'], undefined, 'and it is not claimed by the index');
  assert.equal(tracked(root, 'artifacts/movable/a.txt').length, 0, 'the rest of the subtree still moved');
});

test('sliceFiles never opens an empty slice and never splits below one file', () => {
  const sizes = new Map([['a', 900], ['b', 900], ['c', 100]]);
  assert.deepEqual(sliceFiles(['a', 'b', 'c'], sizes, 1000).map((s) => s.files), [['a'], ['b', 'c']]);
  assert.deepEqual(sliceFiles(['a'], sizes, 10).map((s) => s.files), [['a']],
    'a single file over the ceiling still gets a slice: the BLOB ceiling is what excludes it, not this');
  assert.deepEqual(sliceFiles([], sizes, 1000), []);
});

test('the readers module and the mover agree on the must-stay predicate (one implementation of the word)', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  assert.match(source, /from '\.\/evidence-readers\.mjs'/);
  assert.match(readFileSync(READERS, 'utf8'), /export function mustStay\(/);
});
