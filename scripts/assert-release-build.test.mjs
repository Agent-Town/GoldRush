// Guard test for scripts/assert-release-build.mjs — the sole gate over the E1 release door.
//
// s1251 measured (logs/session-scratch/s1251/armD-empty-dist.txt) that the guard exited 0 with
// `[release-build] E1-only: 0 files, 0 bytes, zero later manifest ids or plate/GLB assets` when
// dist/ was absent: an affirmative clearance over a subject it never read. That matters because
// F-1126-1's standing remedy is to wire this guard into a gate, and a bare invocation with no
// preceding `npm run build:release` is exactly the shape that wiring takes.
//
// Every arm runs the REAL script against a fixture cwd, so the arms test the subject and not a
// model of it. Each new assertion has a control that isolates the variable it claims to be about.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'assert-release-build.mjs');

/**
 * Build a fixture cwd. `dist` and `denominator` are the two independent variables.
 * A "benign" dist is one the guard's pre-existing checks have no complaint about.
 */
function fixture({ dist = ['benign'], denominator = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'assert-release-build-'));
  if (dist.includes('benign')) {
    write(join(root, 'dist/index.html'), '<!doctype html><title>the Claim</title>');
    write(join(root, 'dist/assets/app.js'), 'export const frontier = 1;');
  }
  // A later-epoch manifest id in a text file — the guard's original job.
  if (dist.includes('later-epoch')) write(join(root, 'dist/assets/app.js'), 'const id = "epoch-3-canyon";');
  // A file whose name matches a blacklisted plate stem — the leak check's original job.
  if (dist.includes('leaked-plate')) write(join(root, 'dist/assets/plate-contract-e2-incline.png'), 'x');
  if (denominator) write(join(root, 'assets/raw/plate-contract-e2-incline.png'), 'x');
  return root;
}

function write(path, body) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}

function runGuard(root, { release = 'e1' } = {}) {
  const env = { ...process.env };
  if (release === null) delete env.GR_RELEASE;
  else env.GR_RELEASE = release;
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: 'utf8', env });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

function withFixture(options, body) {
  const root = fixture(options);
  try {
    body(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// The defect s1251 found: an all-clear over an unread subject.
// ---------------------------------------------------------------------------

test('a missing dist/ is refused, not cleared', () => {
  withFixture({ dist: [], denominator: true }, (root) => {
    const { code, out } = runGuard(root);
    assert.notEqual(code, 0, `a guard with nothing to read must not exit 0. Got:\n${out}`);
    assert.match(out, /no build to check/, out);
    assert.doesNotMatch(out, /zero later manifest ids/, `must not print an all-clear it did not earn:\n${out}`);
  });
});

test('CONTROL: the same fixture with one benign dist file passes — it is the emptiness, not the fixture', () => {
  withFixture({ dist: ['benign'], denominator: true }, (root) => {
    const { code, out } = runGuard(root);
    assert.equal(code, 0, out);
    assert.match(out, /zero later manifest ids/, out);
  });
});

// ---------------------------------------------------------------------------
// The same class one layer down: the blacklist is rebuilt from disk every run.
// ---------------------------------------------------------------------------

test('an empty later-asset blacklist is refused — the leak check would otherwise pass vacuously', () => {
  withFixture({ dist: ['benign'], denominator: false }, (root) => {
    const { code, out } = runGuard(root);
    assert.notEqual(code, 0, `an empty denominator must not read as a clean bill. Got:\n${out}`);
    assert.match(out, /no later-epoch asset stems/, out);
  });
});

test('the success line reports the denominator, so a vacuous clearance would be legible', () => {
  withFixture({ dist: ['benign'], denominator: true }, (root) => {
    const { code, out } = runGuard(root);
    assert.equal(code, 0, out);
    assert.match(out, /checked against 1 later-asset stems/, out);
  });
});

// ---------------------------------------------------------------------------
// Positive controls: the guard's original job must survive the new refusals.
// A cure that breaks what it protects is not a cure.
// ---------------------------------------------------------------------------

test('POSITIVE CONTROL: a later-epoch manifest id in dist still fails', () => {
  withFixture({ dist: ['later-epoch'], denominator: true }, (root) => {
    const { code, out } = runGuard(root);
    assert.notEqual(code, 0, out);
    assert.match(out, /later epoch manifest id/, out);
  });
});

test('POSITIVE CONTROL: a leaked later-epoch plate asset in dist still fails', () => {
  withFixture({ dist: ['benign', 'leaked-plate'], denominator: true }, (root) => {
    const { code, out } = runGuard(root);
    assert.notEqual(code, 0, out);
    assert.match(out, /later plate\/GLB assets emitted/, out);
  });
});

test('POSITIVE CONTROL: the GR_RELEASE=e1 precondition still refuses a bare invocation', () => {
  withFixture({ dist: ['benign'], denominator: true }, (root) => {
    const { code, out } = runGuard(root, { release: null });
    assert.notEqual(code, 0, out);
    assert.match(out, /requires GR_RELEASE=e1/, out);
  });
});
