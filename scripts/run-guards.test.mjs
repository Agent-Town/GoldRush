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
