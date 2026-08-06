// node-guards-timeout — the battery must carry a FINITE default per-test bound.
//
// WHY (F-1400-4, cured s1479): `node --test` defaults to no test timeout, so one non-terminating
// sim hung the entire battery unbounded, with no diagnostic and no partial report. The bound lives
// in scripts/run-node-guards.mjs as a CLI default rather than in 265 per-test declarations.
//
// This guard asserts BEHAVIOUR by executing the harness, never by grepping its source, and it
// asserts BOTH directions — the same shape as fire-shell-serialisation.test.mjs:
//   1. the harness injects a finite --test-timeout into the child's execArgv;
//   2. a per-test `{ timeout }` still overrides that default, so the three declared budgets —
//      including the escort test's 120 s, which F-1410-2 forbids raising — stay untouched.
// Direction 2 is proven by manufacturing the failure: a test that outlives a tiny CLI default is
// cancelled, while its explicitly-bounded sibling passes. A passing guard that never executes its
// violation path is not evidence about the red (the s1299/s1300 standard).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

// fileURLToPath, not URL.pathname — the repo root contains a space, which .pathname
// percent-encodes into a path that does not exist ("Gold%20Rush").
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HARNESS = 'scripts/run-node-guards.mjs';

// node:test exports NODE_TEST_CONTEXT to its children. Inherited by a nested `node --test`, it
// switches that runner to the machine-readable reporter, so the human output this guard reads
// disappears and every assertion below fails for a reason that has nothing to do with timeouts.
function cleanEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

/** Fixtures live outside the repo so the battery's own glob guards never collect them. */
function withFixture(name, source, run) {
  const dir = mkdtempSync(join(tmpdir(), 's1479-node-guards-timeout-'));
  try {
    const file = join(dir, name);
    writeFileSync(file, source);
    return run(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('the harness gives the battery a finite default per-test timeout', () => {
  // The fixture reports the flags the harness actually handed the child, so this reads the real
  // arrangement rather than the source text of the file that builds it.
  const source = `
import test from 'node:test';
test('report execArgv', () => {
  console.log('EXECARGV=' + JSON.stringify(process.execArgv));
});
`;

  const flags = withFixture('report-execargv.test.mjs', source, (file) => {
    const child = spawnSync(process.execPath, [HARNESS, file], {
      cwd: ROOT,
      encoding: 'utf8',
      env: cleanEnv(),
    });
    assert.equal(child.status, 0, `harness should pass on the fixture:\n${child.stdout}${child.stderr}`);
    const match = /EXECARGV=(\[.*\])/.exec(child.stdout);
    assert.ok(match, `fixture did not report execArgv:\n${child.stdout}`);
    return JSON.parse(match[1]);
  });

  // Measured s1479: node injects its OWN `--test-timeout=0` into execArgv when the flag is absent,
  // so presence proves nothing and this find() never returns undefined in practice. The VALUE is
  // the whole discriminator — and 0 is precisely the unbounded state F-1400-4 recorded. Keep the
  // presence check only as a guard against a future node that stops emitting a default at all.
  // Take the LAST occurrence: the harness's flag is appended after node's default.
  const timeoutFlags = flags.filter((flag) => flag.startsWith('--test-timeout='));
  assert.ok(timeoutFlags.length > 0, `no --test-timeout at all; flags were ${JSON.stringify(flags)}`);

  const ms = Number(timeoutFlags.at(-1).slice('--test-timeout='.length));
  assert.ok(
    Number.isFinite(ms) && ms > 0,
    `--test-timeout must be finite and positive, got ${timeoutFlags.at(-1)}`,
  );

  // 0 and Infinity both mean "unbounded" to node:test — the exact defect F-1400-4 recorded.
  assert.notEqual(ms, 0, '--test-timeout=0 is unbounded, which re-opens F-1400-4');

  // Bounded well above the slowest measured test (34.2 s, s1479) so it can only catch a hang,
  // and well below a fire's window so a hang cannot consume it.
  assert.ok(ms >= 120_000, `the bound must clear the slowest measured test with margin, got ${ms}ms`);
  assert.ok(ms <= 600_000, `a bound this large no longer protects a fire's window, got ${ms}ms`);
});

test('a per-test timeout still overrides the default, so declared budgets are untouched', () => {
  // Manufactured failure: with a 1 s CLI default, the unbounded test must be cancelled and the
  // `{ timeout: 10_000 }` test must survive. If per-test options ever stopped winning, the cure
  // would silently tighten the escort test's protected 120 s budget.
  const source = `
import test from 'node:test';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
test('unbounded sibling', async () => { await sleep(3000); });
test('explicitly bounded sibling', { timeout: 10_000 }, async () => { await sleep(3000); });
`;

  withFixture('override.test.mjs', source, (file) => {
    const child = spawnSync(
      process.execPath,
      ['--test', '--test-timeout=1000', file],
      { cwd: ROOT, encoding: 'utf8', env: cleanEnv() },
    );
    const out = `${child.stdout}${child.stderr}`;

    assert.equal(child.status, 1, `the unbounded sibling should have failed the run:\n${out}`);
    assert.match(out, /test timed out after 1000ms/, `the CLI default should have fired:\n${out}`);
    assert.match(out, /✔ explicitly bounded sibling/, `the declared budget should have won:\n${out}`);
    assert.doesNotMatch(
      out,
      /✖ explicitly bounded sibling/,
      `a per-test timeout must override the CLI default, else declared budgets silently tighten:\n${out}`,
    );
  });
});
