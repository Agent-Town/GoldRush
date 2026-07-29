import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./run-guards.mjs', import.meta.url));
const GUARDS = [
  'test:node-guards',
  'test:power-budget',
  'test:stats',
  'test:accounts',
  'test:mp',
  'test:deploy-contract',
  'test:deploy-site-contract',
  'test:task-guards',
];

function fixture(overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-run-guards-'));
  const scripts = Object.fromEntries(GUARDS.map((guard) => [guard, 'node -e ""']));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ private: true, scripts: { ...scripts, ...overrides } }),
  );
  return dir;
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 60_000,
  });
}

test('runner exit follows guard exit codes', (t) => {
  const greenDir = fixture();
  const redDir = fixture({ 'test:stats': 'node -e "process.exit(3)"' });
  t.after(() => fs.rmSync(greenDir, { recursive: true, force: true }));
  t.after(() => fs.rmSync(redDir, { recursive: true, force: true }));

  const green = run(greenDir);
  assert.equal(green.status, 0, green.stderr || green.stdout);
  assert.match(green.stdout, /guards: 8\/8 passed/);

  const red = run(redDir);
  assert.equal(red.status, 1, red.stderr || red.stdout);
  assert.match(red.stdout, /^FAIL\s+rc=3\s+.*test:stats$/m);
  assert.match(red.stdout, /RED: test:stats/);
});

test('--only rejects unknown guards and runs one known guard', (t) => {
  const dir = fixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const unknown = run(dir, '--only', 'bogus-guard');
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /no guard named/);

  const known = run(dir, '--only', 'test:node-guards');
  assert.equal(known.status, 0, known.stderr || known.stdout);
  assert.equal(known.stdout.match(/^(PASS|FAIL)/gm)?.length, 1);
});

test('--only accepts a comma-separated subset in canonical order', (t) => {
  const dir = fixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const subset = run(dir, '--only', 'test:task-guards,test:power-budget');
  assert.equal(subset.status, 0, subset.stderr || subset.stdout);
  const rows = subset.stdout.match(/^(?:PASS|FAIL)\s+rc=\S+\s+\d+s\s+(\S+)$/gm) ?? [];
  assert.equal(rows.length, 2, subset.stdout);
  // GUARDS order wins over the order typed on the command line.
  assert.match(subset.stdout, /test:power-budget[\s\S]*test:task-guards/);
  assert.match(subset.stdout, /guards: 2\/2 passed/);

  // Whitespace around list members is tolerated.
  const spaced = run(dir, '--only', 'test:power-budget, test:task-guards');
  assert.equal(spaced.status, 0, spaced.stderr || spaced.stdout);
  assert.match(spaced.stdout, /guards: 2\/2 passed/);
});

test('--only rejects a list containing an unknown guard rather than narrowing', (t) => {
  const dir = fixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  // The dangerous shape: one real name carries a typo past the check, and the
  // run reports a green over fewer guards than the caller asked for.
  const mixed = run(dir, '--only', 'test:power-budget,test:tsak-guards');
  assert.equal(mixed.status, 2, mixed.stdout);
  assert.match(mixed.stderr, /no guard named "test:tsak-guards"/);
  assert.doesNotMatch(mixed.stdout, /passed/);
});

test('power-budget rows include p95 only when printed', (t) => {
  const measuredDir = fixture({
    'test:power-budget': 'node -e "console.log(\'power-graph-budget: p95=12.5ms\')"',
  });
  const silentDir = fixture();
  t.after(() => fs.rmSync(measuredDir, { recursive: true, force: true }));
  t.after(() => fs.rmSync(silentDir, { recursive: true, force: true }));

  const measured = run(measuredDir, '--only', 'test:power-budget');
  assert.equal(measured.status, 0, measured.stderr || measured.stdout);
  assert.match(measured.stdout, /^PASS\s+.*test:power-budget\s+p95=12\.5ms$/m);

  const silent = run(silentDir, '--only', 'test:power-budget');
  assert.equal(silent.status, 0, silent.stderr || silent.stdout);
  assert.match(silent.stdout, /^PASS\s+.*test:power-budget$/m);
  assert.doesNotMatch(silent.stdout, /p95=/);
});

function gitFixture(overrides = {}) {
  const dir = fixture(overrides);
  const git = (...args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'guard@test.local');
  git('config', 'user.name', 'guard');
  fs.writeFileSync(path.join(dir, 'seed.txt'), 'seed\n');
  git('add', '.');
  git('commit', '-q', '-m', 'base');
  return { dir, git };
}

test('--changed-since runs the base gate when no path rule matches', (t) => {
  const { dir } = gitFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  fs.writeFileSync(path.join(dir, 'seed.txt'), 'touched\n');
  const result = run(dir, '--changed-since', 'HEAD');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /no path rule matched/);
  assert.match(result.stdout, /guards: 3\/3 passed/);
  // The worker guards must NOT ride along on an unrelated change.
  assert.doesNotMatch(result.stdout, /test:accounts/);
});

test('--changed-since adds the worker guards when functions/ moved', (t) => {
  const { dir, git } = gitFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const expectWorkerBattery = (result) => {
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const rows = result.stdout.match(/^(?:PASS|FAIL)\s+rc=\S+\s+\d+s\s+(\S+)$/gm) ?? [];
    assert.equal(rows.length, 6, result.stdout);
    for (const guard of ['test:stats', 'test:accounts', 'test:mp']) {
      assert.ok(rows.some((row) => row.endsWith(` ${guard}`)), `${guard} missing:\n${result.stdout}`);
    }
    // ...and still not the 80s deploy contracts, which no drain touches.
    assert.doesNotMatch(result.stdout, /test:deploy-contract/);
  };

  // Shape 1: a brand-new worker file, not yet staged -- invisible to `git diff`.
  fs.mkdirSync(path.join(dir, 'functions/api'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'functions/api/_accounts.ts'), 'export {};\n');
  expectWorkerBattery(run(dir, '--changed-since', 'HEAD'));

  // Shape 2: the real drain shape -- the merge is committed, gate runs against base.
  git('add', '.');
  git('commit', '-q', '-m', 'merge: worker change');
  expectWorkerBattery(run(dir, '--changed-since', 'HEAD~1'));
});

test('--changed-since exits 2 on a bad ref rather than narrowing to the base gate', (t) => {
  const { dir } = gitFixture();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const bad = run(dir, '--changed-since', 'no-such-ref-xyz');
  assert.equal(bad.status, 2, bad.stdout);
  assert.match(bad.stderr, /git diff --name-only no-such-ref-xyz failed/);
  assert.doesNotMatch(bad.stdout, /passed/);

  const missing = run(dir, '--changed-since');
  assert.equal(missing.status, 2, missing.stdout);
  assert.match(missing.stderr, /needs a git ref/);

  const both = run(dir, '--only', 'test:node-guards', '--changed-since', 'HEAD');
  assert.equal(both.status, 2, both.stdout);
  assert.match(both.stderr, /mutually exclusive/);
});

test('guards run with GR_GUARD_NO_ARTIFACT so a gate cannot dirty its own tree', (t) => {
  // The guard's own exit code is the verdict here: a passing guard's stdout is
  // never printed by the runner, so asserting on output would pass vacuously.
  const dir = fixture({
    'test:node-guards': 'node -e "process.exit(process.env.GR_GUARD_NO_ARTIFACT === \'1\' ? 0 : 7)"',
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const result = run(dir, '--only', 'test:node-guards');
  assert.equal(result.status, 0, `flag not propagated to the child: ${result.stdout}`);
});

test('a signal-killed guard is never a pass', (t) => {
  const dir = fixture({
    'test:stats': 'node -e "process.kill(process.pid, \'SIGKILL\')"',
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const result = run(dir, '--only', 'test:stats');
  assert.equal(result.status, 1, result.stderr || result.stdout);
  const row = result.stdout.split('\n').find((line) => line.startsWith('FAIL'));
  assert.ok(row, result.stdout);
  const rc = row.match(/^FAIL\s+rc=(\S+)/)?.[1];
  assert.ok(rc && rc !== '0', row);
});
