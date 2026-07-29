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
