#!/usr/bin/env node
/**
 * salvage-art-staging-reach — does the prescribed cure REACH the exposure?
 *
 * WHY (F-1658-1, s1658): `art-staging-audit.mjs` raises the alarm and
 * `salvage-art-staging.mjs` is the cure named in the alarm's own remedy text
 * (`scripts/health-watch.sh:139`) and in the owner's 530 MB desk question
 * (F-1640-1, "salvage to a branch"). The audit was widened three times
 * (F-1054-1 name->blob, F-1055-1 remote refs, F-1120-2 one-dir->recursive
 * enumeration); the salvage script was never revisited. Measured live at s1658:
 * the audit found AT RISK 582 files / 527.89 MB, ALL of them nested under
 * `motion-pilot/`, and the salvage script's --dry-run offered 3 files from
 * `raw/`, none at risk. Reach: 0 of 582. It would have written a save/* branch,
 * printed a success line, and ended no exposure at all.
 *
 * A green here proves nothing on its own — a passing guard never executes its
 * own violation path. So the two tests that matter MANUFACTURE the historical
 * defect (a mutated copy of the real script) and assert the mutant UNDER-REACHES
 * the same fixture the real script clears. If a future edit makes a mutation
 * inapplicable, the test FAILS LOUDLY rather than silently skipping.
 *
 * Every test runs against a scratch repo built in tmp, so nothing here depends
 * on the live board's state and nothing here can touch it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./salvage-art-staging.mjs', import.meta.url));
const SOURCE = readFileSync(SCRIPT, 'utf8');

const git = (repo, ...args) =>
  execFileSync('git', ['-C', repo, '-c', 'user.email=f@g.r', '-c', 'user.name=fire', ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  }).trim();

/** A scratch repo with a `main` branch, a tracked assets/ tree, and an art staging dir. */
const makeRepo = () => {
  const repo = mkdtempSync(join(tmpdir(), 'gr-salvage-test-'));
  git(repo, 'init', '--quiet');
  git(repo, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  mkdirSync(join(repo, 'assets/raw'), { recursive: true });
  writeFileSync(join(repo, 'assets/raw/shipped.png'), 'SHIPPED-BYTES');
  git(repo, 'add', '--', 'assets/raw/shipped.png');
  git(repo, 'commit', '--quiet', '-m', 'base');
  return repo;
};

/** Put a file into the ART staging tree at `worktrees/art/assets/<rel>`. */
const stage = (repo, rel, contents) => {
  const p = join(repo, 'worktrees/art/assets', rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, contents);
  return p;
};

/** Install the real script, or a mutated variant of it, and run it. */
const run = (repo, args, source = SOURCE) => {
  writeFileSync(join(repo, 'scripts/salvage-art-staging.mjs'), source);
  try {
    return { rc: 0, out: execFileSync('node', [join(repo, 'scripts/salvage-art-staging.mjs'), ...args], {
      encoding: 'utf8', maxBuffer: 1 << 26,
    }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
};

/** Textual mutation that must actually apply — a no-op mutation would fake a pass. */
const mutate = (from, to) => {
  assert.ok(SOURCE.includes(from), `mutation target absent from the script — this guard has rotted: ${from}`);
  const out = SOURCE.replace(from, to);
  assert.notEqual(out, SOURCE, 'mutation did not change the source');
  return out;
};

const atRiskCount = (out) => {
  const m = out.match(/AT RISK \(in NO object database\): (\d+) file/);
  return m ? Number(m[1]) : null;
};

/**
 * A mutant can under-reach in two shapes, and both are the defect: it can report
 * `AT RISK 0`, or it can miss the staging area entirely and bail at the earlier
 * "nothing under ..." exit without printing a count at all. The historical
 * one-dir reader does the second — it never even looked at motion-pilot.
 */
const assertUnderReached = (out, needle) => {
  const n = atRiskCount(out);
  assert.ok(n === 0 || n === null, `the mutant should have under-reached, but reported:\n${out}`);
  assert.ok(!out.includes(needle), `the mutant unexpectedly reached ${needle}:\n${out}`);
};

test('reaches a NESTED staging file — the F-1120-2 class', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
    assert.match(out, /assets\/motion-pilot\/pose-library\/hero\/frames\/hero-01\.png/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: the historical one-dir, non-recursive reader finds NONE of it', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    // The s1045 shape: only `raw`, and only its top level.
    const old = mutate(
      '  if (!statSync(dir).isDirectory()) continue;\n  const files = walk(dir);',
      '  if (!statSync(dir).isDirectory() || name !== \'raw\') continue;\n' +
        '  const files = readdirSync(dir).map((n) => join(dir, n)).filter((p) => statSync(p).isFile());',
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assertUnderReached(out, 'hero-01.png');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('selects by BLOB, not name: regenerated bytes under a tracked name are AT RISK', () => {
  const repo = makeRepo();
  try {
    // Same path as main's tracked file, different bytes, in no object database.
    stage(repo, 'raw/shipped.png', 'REGENERATED-DIFFERENT-BYTES');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: name-based selection skips those same bytes — the F-1054-1 class', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'raw/shipped.png', 'REGENERATED-DIFFERENT-BYTES');
    const old = mutate(
      '  .filter((s) => !present.has(s.sha))',
      '  .filter((s) => !present.has(s.sha) && !new Set(\n' +
        "    git(['ls-tree', '-r', '--name-only', 'main', '--', 'assets/']).split('\\n').filter(Boolean),\n" +
        '  ).has(s.mainPath))',
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assertUnderReached(out, 'assets/raw/shipped.png');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('bytes already in git are NOT at risk (no pointless re-salvage)', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'raw/shipped.png', 'SHIPPED-BYTES'); // blob-identical to main's
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 0, out);
    assert.match(out, /nothing at risk/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('--dry-run writes no object and no ref', () => {
  const repo = makeRepo();
  try {
    const p = stage(repo, 'motion-pilot/a/b/deep.png', 'DRY-RUN-MUST-NOT-WRITE');
    const sha = execFileSync('git', ['-C', repo, 'hash-object', '--', p], { encoding: 'utf8' }).trim();
    run(repo, ['save/x', '--dry-run']);
    assert.throws(() => git(repo, 'cat-file', '-e', sha), 'dry-run wrote the blob into the object database');
    assert.equal(existsSync(join(repo, '.git/refs/heads/save')), false, 'dry-run wrote a ref');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('a real run salvages the nested bytes onto save/*, leaving main untouched', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    const before = git(repo, 'rev-parse', 'main');
    const { rc, out } = run(repo, ['save/art-test']);
    assert.equal(rc, 0, out);
    assert.equal(git(repo, 'rev-parse', 'main'), before, 'main moved');
    const listed = git(repo, 'ls-tree', '-r', '--name-only', 'save/art-test');
    assert.match(listed, /assets\/motion-pilot\/pose-library\/hero\/frames\/hero-01\.png/);
    // and the salvaged bytes are really retrievable, not just named in a tree
    assert.equal(
      git(repo, 'show', 'save/art-test:assets/motion-pilot/pose-library/hero/frames/hero-01.png'),
      'NESTED-AT-RISK',
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('refuses to clobber an existing ref', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/a/deep.png', 'AT-RISK');
    assert.equal(run(repo, ['save/dupe']).rc, 0);
    const second = run(repo, ['save/dupe']);
    assert.equal(second.rc, 1, second.out);
    assert.match(second.out, /REFUSING/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
