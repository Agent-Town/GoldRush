import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./citation-title-guard.mjs', import.meta.url));

const SPEC = `
import { test, expect } from '@playwright/test';

test('hero stops in the shallows and keeps weapons armed at the deep channel', async () => {
  expect(1).toBe(1);
});

test('hash mismatch pauses, shows the wire card, and restores from relay snapshot', async () => {
  expect(1).toBe(1);
});
`;

// A real git tree, because the guard's denominator is `git ls-files tasks` — the same reason
// collection guards here are cwd-invariance tested: a guard that reads the wrong tree is worse
// than no guard.
function fixture(t, doc) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-citation-guard-'));
  fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'e2e'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'e2e', 'fixture.spec.ts'), SPEC);
  fs.writeFileSync(path.join(dir, 'tasks', 'master.md'), doc);
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'fixture@example.com');
  git('config', 'user.name', 'fixture');
  git('add', 'tasks', 'e2e');
  git('commit', '-qm', 'fixture');
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(dir, ...extra) {
  return spawnSync(process.execPath, [SCRIPT, '--root', dir, ...extra], {
    cwd: os.tmpdir(), // deliberately NOT the fixture: --root must decide the tree, not cwd
    encoding: 'utf8',
    timeout: 60_000,
  });
}

function withEmptyBaseline(t, dir) {
  const baseline = path.join(dir, 'empty-baseline.json');
  fs.writeFileSync(baseline, JSON.stringify({ grandfathered: {} }));
  return baseline;
}

// s1252 arms need trees the `fixture` helper deliberately cannot build: one with no task
// markdown at all, and one carrying a tracked .md OUTSIDE tasks/. Same git-real discipline.
function customFixture(t, build) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-citation-guard-x-'));
  fs.mkdirSync(path.join(dir, 'e2e'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'e2e', 'fixture.spec.ts'), SPEC);
  build(dir);
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'fixture@example.com');
  git('config', 'user.name', 'fixture');
  git('add', '-A');
  git('commit', '-qm', 'fixture');
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('a bare spec:line citation fails the guard', (t) => {
  const dir = fixture(t, 'KNOWN RED: e2e/fixture.spec.ts:4 fails on main.\n');
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /FAIL/);
  assert.match(result.stdout, /tasks\/master\.md::e2e\/fixture\.spec\.ts:4/);
});

test('a citation carrying an exact test title passes', (t) => {
  const dir = fixture(
    t,
    'KNOWN RED: e2e/fixture.spec.ts:4 ("hero stops in the shallows and keeps weapons armed at the deep channel") fails.\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS/);
});

test('a short code span cannot consume the following quoted title', (t) => {
  const dir = fixture(
    t,
    'Previously titled "a retired title that is definitely long enough", then `old` and is now titled "hash mismatch pauses, shows the wire card, and restores from relay snapshot" at e2e/fixture.spec.ts:8.\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /CARRIES-TITLE\s+1/);
});

test('a bare apostrophe cannot consume the following quoted title', (t) => {
  const dir = fixture(
    t,
    'Previously titled "a retired title that is definitely long enough"; the scanner\'s own record now calls it "hash mismatch pauses, shows the wire card, and restores from relay snapshot" at e2e/fixture.spec.ts:8.\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /CARRIES-TITLE\s+1/);
});

// The shape this repo's prose actually uses. s1224 scored this exact form NUMBER-ONLY and
// caught the false negative only by reading the entry by hand; the branch is load-bearing.
test('a citation carrying an ELIDED test title passes', (t) => {
  const dir = fixture(
    t,
    'KNOWN RED: e2e/fixture.spec.ts:8 ("hash mismatch … restores from relay snapshot") fails.\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS/);
});

// Without this the guard would be tautological: any quoted string near a citation would pass.
test('a quoted title that does not exist in the spec still fails', (t) => {
  const dir = fixture(
    t,
    'KNOWN RED: e2e/fixture.spec.ts:4 ("a title that was deleted three months ago") fails.\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /FAIL/);
});

test('a grandfathered bare citation passes, and a second copy of it does not', (t) => {
  const dir = fixture(t, 'KNOWN RED: e2e/fixture.spec.ts:4 fails on main.\n');
  const baseline = path.join(dir, 'baseline.json');

  const written = run(dir, '--baseline', baseline, '--update-baseline');
  assert.equal(written.status, 0, written.stdout + written.stderr);

  const gated = run(dir, '--baseline', baseline);
  assert.equal(gated.status, 0, gated.stdout + gated.stderr);
  assert.match(gated.stdout, /PASS/);

  // the ratchet: the debt may not grow behind the same key
  fs.appendFileSync(
    path.join(dir, 'tasks', 'master.md'),
    '\nAlso e2e/fixture.spec.ts:4 over here.\n',
  );
  const grown = run(dir, '--baseline', baseline);
  assert.equal(grown.status, 1, grown.stdout + grown.stderr);
  assert.match(grown.stdout, /found 2, grandfathered 1/);
});

test('--report never gates', (t) => {
  const dir = fixture(t, 'KNOWN RED: e2e/fixture.spec.ts:4 fails on main.\n');
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir), '--report');

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /NUMBER-ONLY/);
});

// ---------------------------------------------------------------------------
// s1252 — F-1252-1/2/3. Measured before these existed: with tasks/ absent, empty, or
// citation-free, this guard printed `citations scanned : 0` and `PASS`, exit 0. Its
// verdict also read as repo-wide while covering 305 of 1158 citations, and it scored a
// correct non-test citation as a violation. Each arm below runs the REAL script.
// ---------------------------------------------------------------------------

test('REFUSES when no tracked task markdown exists (denominator 0 docs)', (t) => {
  const dir = customFixture(t, (d) => {
    fs.mkdirSync(path.join(d, 'tasks'), { recursive: true });
    fs.writeFileSync(path.join(d, 'tasks', 'keep.txt'), 'not markdown\n');
  });
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /REFUSING/);
  assert.match(result.stderr, /matched no \.md file/);
  // and it must NOT have claimed a pass
  assert.doesNotMatch(result.stdout, /PASS/);
});

test('REFUSES when task docs exist but carry zero citations', (t) => {
  const dir = customFixture(t, (d) => {
    fs.mkdirSync(path.join(d, 'tasks'), { recursive: true });
    fs.writeFileSync(path.join(d, 'tasks', 'a.md'), '# a master naming no spec at all\n');
  });
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /0 citations found/);
  assert.doesNotMatch(result.stdout, /PASS/);
});

test('REFUSES when the baseline it ratchets against is missing', (t) => {
  const dir = fixture(t, 'Carried: e2e/fixture.spec.ts:4 ("hero stops in the shallows").\n');
  // POSITIVE CONTROL: the identical tree passes once a baseline exists, so this arm
  // is proving the missing baseline is what refuses -- not the tree.
  const withBaseline = run(dir, '--baseline', withEmptyBaseline(t, dir));
  assert.equal(withBaseline.status, 0, withBaseline.stdout + withBaseline.stderr);

  const missing = run(dir, '--baseline', path.join(dir, 'no-such-baseline.json'));
  assert.equal(missing.status, 2, missing.stdout + missing.stderr);
  assert.match(missing.stderr, /no baseline at/);
});

test('a citation quoting a real NON-TEST source line is carried, not a violation', (t) => {
  // e2e/fixture.spec.ts line 2 is the playwright import -- not a test title.
  const dir = fixture(
    t,
    'See e2e/fixture.spec.ts:2 ("import { test, expect } from \'@playwright/test\';").\n',
  );
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /CARRIES-LINE/);
});

test('a quote matching NEITHER a title nor any source line still fails', (t) => {
  // The control for the arm above: widening to source lines must not accept anything.
  const dir = fixture(t, 'See e2e/fixture.spec.ts:2 ("a sentence that appears nowhere in it").\n');
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /FAIL/);
});

test('the verdict names the citations it did NOT gate', (t) => {
  const dir = customFixture(t, (d) => {
    fs.mkdirSync(path.join(d, 'tasks'), { recursive: true });
    fs.mkdirSync(path.join(d, 'logs'), { recursive: true });
    fs.writeFileSync(
      path.join(d, 'tasks', 'master.md'),
      'Carried: e2e/fixture.spec.ts:4 ("hero stops in the shallows").\n',
    );
    // tracked, carries citations, and outside the denominator
    fs.writeFileSync(
      path.join(d, 'logs', 'red-inventory.md'),
      'e2e/fixture.spec.ts:11 and e2e/fixture.spec.ts:12 and e2e/fixture.spec.ts:13\n',
    );
  });
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir));

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /NOT GATED\s*:\s*3 citation\(s\) in 1 tracked \.md outside tasks\//);
  assert.match(result.stdout, /logs\/red-inventory\.md \(3\)/);
  // the PASS may no longer read as a claim about the whole repo
  assert.match(result.stdout, /covers tasks\/\*\* only/);
});

test('--report still never gates, even on a denominator it could not read', (t) => {
  const dir = customFixture(t, (d) => {
    fs.mkdirSync(path.join(d, 'tasks'), { recursive: true });
    fs.writeFileSync(path.join(d, 'tasks', 'keep.txt'), 'not markdown\n');
  });
  const result = run(dir, '--baseline', withEmptyBaseline(t, dir), '--report');

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /read nothing/);
});
