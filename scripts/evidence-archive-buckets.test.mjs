// THE TWO EVIDENCE AUDITS, UNDER AN OFFLOAD (task evidence-offload-1, scope item 3).
//
// `docs/ledger-shape-reader-map-2026-09-24.md` §A5 measured exactly how the offload breaks these two
// instruments if they are left alone, and the two failures are OPPOSITE:
//   out of git, still on disk  -> 911 citations flip to ON-DISK-UNTRACKED and `--strict` reds on
//                                 EVERY drain, so the offload would stop the factory.
//   out of git AND disk, no index -> they flip to ABSENT and the audit goes BLIND on the population
//                                 it exists to watch, so the offload would look free and cost the
//                                 Retention Law.
// The arms below pin the cure for both, plus the two properties that make the cure safe: a file the
// offload KEPT still reads TRACKED, and genuinely on-disk-untracked evidence still reds `--strict`.
//
// This lives in its own file rather than inside `review-evidence-audit.test.mjs` and
// `modified-tracked-evidence-census-guard.test.mjs` to keep task evidence-offload-1's firewall narrow:
// those two guards have their own baselines and their own lineage, and a new feature's cases do not
// belong inside them.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { ARCHIVE_INDEX_PATH } from './evidence-readers.mjs';

const AUDIT = join(import.meta.dirname, 'review-evidence-audit.mjs');
const CENSUS = join(import.meta.dirname, 'modified-tracked-evidence-census.mjs');
const BOUND = { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' };

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const ARCHIVED_COMMIT = 'a'.repeat(40);

function index(subtree, files) {
  return {
    version: 1,
    archive: { remote: 'archive', branch: 'evidence', prefix: 'evidence' },
    subtrees: {
      [subtree]: {
        archiveCommits: [ARCHIVED_COMMIT], files: files.length, bytes: 1234,
        movedDate: '2026-09-25', previews: [`${subtree}/PREVIEW.png`], kept: [`${subtree}/report.md`],
        oversizeLeftInPlace: [],
      },
    },
    files: Object.fromEntries(files.map((f) => [f, { archiveCommit: ARCHIVED_COMMIT, sha256: 'b'.repeat(64), bytes: 12, movedDate: '2026-09-25' }])),
  };
}

/**
 * A repo in the state ONE offload leaves behind: the moved files are gone from the index and the
 * disk, the subtree keeps its pointer, its preview and its `report.md`, and a review still cites
 * everything it ever cited. That last part is the point - reviews are immutable evidence and are
 * never rewritten to follow a move.
 */
function offloaded(t, { withIndex = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'evidence-buckets-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = {
    'artifacts/moved/ARCHIVED.md': '# ARCHIVED\n\n`artifacts/moved` is in the private archive.\n',
    'artifacts/moved/PREVIEW.png': 'not really a png, and no reader opens it here\n',
    'artifacts/moved/report.md': '# the run that moved\n',
    'artifacts/stays/board.png': 'still here\n',
    'reviews/slice-01.md': [
      'Moved file: `artifacts/moved/run-1/shot.png`',
      'Moved subtree: `artifacts/moved/`',
      'Kept report: `artifacts/moved/report.md`',
      'Untouched: `artifacts/stays/board.png`',
    ].join('\n') + '\n',
  };
  if (withIndex) {
    files[ARCHIVE_INDEX_PATH] = `${JSON.stringify(index('artifacts/moved', ['artifacts/moved/run-1/shot.png']), null, 1)}\n`;
  }
  for (const [file, body] of Object.entries(files)) {
    mkdirSync(join(root, dirname(file)), { recursive: true });
    writeFileSync(join(root, file), body);
  }
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'fixture@example.com');
  git(root, 'config', 'user.name', 'fixture');
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'after the offload');
  return root;
}

const audit = (root, ...args) => spawnSync(process.execPath, [AUDIT, '--root', root, ...args, '--all'], BOUND);
const counts = (stdout) => Object.fromEntries(
  [...stdout.matchAll(/([A-Z-]+)=(\d+)/g)].map(([, key, value]) => [key, Number(value)]),
);

// ─── review-evidence-audit ─────────────────────────────────────────────────────────────────────

test('a citation to a moved file is ARCHIVED, not ABSENT, and --strict stays green', (t) => {
  const result = audit(offloaded(t), '--strict');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const c = counts(result.stdout);
  assert.equal(c.ARCHIVED, 2, 'the moved file and the moved subtree both resolve from the index');
  assert.equal(c.ABSENT, 0, 'an archived citation must never be counted as absent');
  assert.equal(c['ON-DISK-UNTRACKED'], 0);
});

test('a file the offload KEPT still reads TRACKED, though its subtree is archived', (t) => {
  const result = audit(offloaded(t));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(counts(result.stdout).TRACKED, 2, 'the kept report.md and the untouched subtree');
  assert.doesNotMatch(result.stdout, /^ABSENT\s+artifacts\/moved\/report\.md/m);
});

test('without an index the same tree goes BLIND, which is why the index is declared on every run', (t) => {
  const blind = audit(offloaded(t, { withIndex: false }));
  assert.equal(blind.status, 0, blind.stdout + blind.stderr);
  const c = counts(blind.stdout);
  assert.equal(c.ARCHIVED, 0);
  assert.equal(c.ABSENT, 1, 'the moved file has nowhere to resolve, and that is the failure §A5 predicted');
  assert.match(blind.stdout, new RegExp(`archive index: ${ARCHIVE_INDEX_PATH.replace(/[./]/g, '\\$&')} ABSENT`));
});

test('the index is declared in BOTH states, so ABSENT=0 can never be read as "archived"', (t) => {
  assert.match(audit(offloaded(t)).stdout, /archive index: artifacts\/ARCHIVE-INDEX\.json — 1 subtree\(s\), 1 file\(s\)/);
  assert.match(audit(offloaded(t, { withIndex: false })).stdout, /archive index: .* ABSENT — nothing has been offloaded/);
});

test('evidence that is genuinely on disk and untracked still reds --strict (the gate is not weakened)', (t) => {
  const root = offloaded(t);
  writeFileSync(join(root, '.gitignore'), '*.log\n');
  mkdirSync(join(root, 'artifacts/leak'), { recursive: true });
  writeFileSync(join(root, 'artifacts/leak/run.log'), 'never committed\n');
  writeFileSync(join(root, 'reviews/slice-02.md'), 'Leak: `artifacts/leak/run.log`\n');
  git(root, 'add', '--', 'reviews/slice-02.md', '.gitignore');
  git(root, 'commit', '-qm', 'a review citing a leak');
  const result = audit(root, '--strict');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /^ON-DISK-UNTRACKED\s+artifacts\/leak\/run\.log/m);
});

test('an index that is absent, empty or malformed never crashes the audit', (t) => {
  for (const body of ['', '{}', 'not json at all', '{"subtrees":{}}']) {
    const root = offloaded(t, { withIndex: false });
    writeFileSync(join(root, ARCHIVE_INDEX_PATH), body);
    const result = audit(root);
    assert.equal(result.status, 0, `body ${JSON.stringify(body)}: ${result.stdout}${result.stderr}`);
    assert.equal(counts(result.stdout).ARCHIVED, 0);
    assert.doesNotMatch(result.stdout, /CANNOT VERIFY/);
  }
});

// ─── modified-tracked-evidence-census ──────────────────────────────────────────────────────────

/**
 * A repo whose evidence file is BOTH modified-tracked and named by the index. That is not a
 * contrivance: the index lands on main while lane and gate worktrees still track the same paths at
 * an older commit, and this tool's population is every registered worktree.
 */
function censusFixture(t, { withIndex = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'evidence-census-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const work = join(root, 'work');
  git(root, 'init', '-q', '-b', 'main', work);
  git(work, 'config', 'user.email', 'fixture@example.com');
  git(work, 'config', 'user.name', 'fixture');
  mkdirSync(join(work, 'artifacts/moved'), { recursive: true });
  writeFileSync(join(work, 'artifacts/moved/shot.png'), 'committed contents\n');
  writeFileSync(join(work, 'README.md'), 'x\n');
  if (withIndex) {
    writeFileSync(join(work, ARCHIVE_INDEX_PATH),
      `${JSON.stringify(index('artifacts/moved', ['artifacts/moved/shot.png']), null, 1)}\n`);
  }
  git(work, 'add', '-A');
  git(work, 'commit', '-qm', 'seed');
  writeFileSync(join(work, 'artifacts/moved/shot.png'), 'MODIFIED, in no object database\n');
  return work;
}

const census = (work, ...args) => spawnSync(process.execPath, [CENSUS, '--root', work, ...args], BOUND);

test('a path the index names reads SAFE (archive <commit>), not AT RISK', (t) => {
  const work = censusFixture(t);
  const result = census(work, '--json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const board = JSON.parse(result.stdout);
  assert.equal(board.subjects, 1);
  assert.equal(board.deskFigure.files, 0, 'an archived path is not at risk: the owner has it in a git repository');
  assert.equal(board.buckets.SAFE.files, 1);
  assert.equal(board.safeByArchive.files, 1);
  assert.deepEqual(board.archiveIndex, { path: ARCHIVE_INDEX_PATH, subtrees: 1, files: 1 });
  const human = census(work);
  assert.match(human.stdout, new RegExp(`SAFE \\(archive ${ARCHIVED_COMMIT.slice(0, 12)}\\)`));
  assert.match(human.stdout, /of which ARCHIVE\s+1 file\(s\)/);
});

test('the SAME tree without an index reads AT RISK, so the arm is not vacuous', (t) => {
  const result = census(censusFixture(t, { withIndex: false }), '--json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const board = JSON.parse(result.stdout);
  assert.equal(board.subjects, 1);
  assert.equal(board.deskFigure.files, 1, 'this is the reading §A5 predicted for 26,163 files');
  assert.equal(board.safeByArchive.files, 0);
  assert.equal(board.archiveIndex, null);
});

test('the census declares the index in both states', (t) => {
  assert.match(census(censusFixture(t)).stdout, /archive\s+: artifacts\/ARCHIVE-INDEX\.json — 1 subtree\(s\)/);
  assert.match(census(censusFixture(t, { withIndex: false })).stdout, /archive\s+: .* ABSENT — nothing has been offloaded/);
});

test('an unarchived modified evidence file in the same tree still reads AT RISK beside an archived one', (t) => {
  const work = censusFixture(t);
  writeFileSync(join(work, 'artifacts/moved/other.png'), 'committed\n');
  git(work, 'add', '--', 'artifacts/moved/other.png');
  git(work, 'commit', '-qm', 'another evidence file');
  writeFileSync(join(work, 'artifacts/moved/other.png'), 'MODIFIED, and the index does not name it\n');
  const board = JSON.parse(census(work, '--json').stdout);
  assert.equal(board.subjects, 2);
  // `other.png` sits UNDER an archived subtree but is not in the index's file map; the subtree entry
  // is what resolves it, which is correct - the whole subtree moved - so both read SAFE by archive.
  // What must never happen is a file OUTSIDE any archived subtree inheriting the verdict.
  assert.equal(board.safeByArchive.files, 2);
  unlinkSync(join(work, ARCHIVE_INDEX_PATH));
  git(work, 'rm', '-q', '--cached', '--', ARCHIVE_INDEX_PATH);
  git(work, 'commit', '-qm', 'index removed');
  const without = JSON.parse(census(work, '--json').stdout);
  assert.equal(without.deskFigure.files, 2, 'and with the index gone both are at risk again');
});
