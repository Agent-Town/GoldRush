import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('./run-guards.mjs', import.meta.url));
const SOURCE = readFileSync(SUBJECT, 'utf8');

function fixture(t, command = 'node -e ""') {
  const dir = mkdtempSync(path.join(tmpdir(), 'f2313-guard-stats-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ private: true, scripts: { 'test:citations': command } }),
  );
  return dir;
}

function run(script, cwd, statsPath) {
  return spawnSync(process.execPath, [script, '--only', 'test:citations'], {
    cwd,
    encoding: 'utf8',
    timeout: 60_000,
    env: { ...process.env, ...(statsPath ? { GR_GUARD_STATS_PATH: statsPath } : {}) },
  });
}

function records(statsPath) {
  return readFileSync(statsPath, 'utf8').trim().split('\n').map(JSON.parse);
}

function variant(t, replace) {
  const root = mkdtempSync(path.join(tmpdir(), 'f2313-guard-stats-variant-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'scripts'));
  const script = path.join(root, 'scripts', 'run-guards.mjs');
  writeFileSync(script, replace(SOURCE));
  return script;
}

function replaceOnce(source, before, after) {
  assert.ok(source.includes(before), `mutation seam moved: ${before.slice(0, 80)}`);
  return source.replace(before, after);
}

test('happy, failing, append, projection, p95, and declarations', (t) => {
  const statsPath = path.join(fixture(t), 'stats.jsonl');
  const cwd = fixture(t, 'node -e "console.log(\'power-graph-budget: p95=12.5ms\')"');

  const first = run(SUBJECT, cwd, statsPath);
  assert.equal(first.status, 0, first.stdout + first.stderr);
  assert.match(first.stdout, new RegExp(`guard-stats: appended 1 record\\(s\\) to ${statsPath}`));

  const second = run(SUBJECT, cwd, statsPath);
  assert.equal(second.status, 0, second.stdout + second.stderr);
  const rows = records(statsPath);
  assert.equal(rows.length, 2, 'two runs must append rather than overwrite');
  assert.deepEqual(Object.keys(rows[0]), [
    'runId', 'ts', 'head', 'roster', 'guard', 'rc', 'seconds', 'p95',
  ]);
  assert.equal(rows[0].guard, 'test:citations');
  assert.equal(rows[0].rc, 0);
  assert.equal(rows[0].roster, '--only');
  assert.equal(rows[0].p95, '12.5');
  assert.equal(rows[0].ts, rows[0].runId);
  assert.equal(typeof rows[0].seconds, 'number');
  assert.equal(typeof rows[0].head, 'string');
  assert.ok(rows[0].head.length > 0);
  assert.ok(!Object.hasOwn(rows[0], 'output'), 'the full guard transcript leaked into tracked JSONL');

  const redPath = path.join(fixture(t), 'red.jsonl');
  const red = run(SUBJECT, fixture(t, 'node -e "process.exit(1)"'), redPath);
  assert.equal(red.status, 1, red.stdout + red.stderr);
  assert.equal(records(redPath)[0].rc, 1, 'a failing leg must still be inventoried as red');
});

test('default path is anchored to the script tree, not cwd', (t) => {
  const script = variant(t, (source) => source);
  const root = path.dirname(path.dirname(script));
  mkdirSync(path.join(root, 'logs'));
  const cwd = fixture(t);

  const result = run(script, cwd);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const expected = path.join(root, 'logs', 'guard-stats.jsonl');
  assert.equal(records(expected).length, 1);
  assert.equal(records(expected)[0].head, 'unknown');
  assert.match(result.stdout, new RegExp(expected));
  assert.ok(!existsSync(path.join(cwd, 'logs', 'guard-stats.jsonl')));
});

test('write failure is declared but cannot change a passing guard exit', (t) => {
  const cwd = fixture(t);
  const blocker = path.join(cwd, 'not-a-directory');
  writeFileSync(blocker, 'file');
  const statsPath = path.join(blocker, 'stats.jsonl');

  const result = run(SUBJECT, cwd, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp(`⚠️ guard-stats: could not append to ${statsPath}`));
});

test('manufactured defects prove the reverse controls have teeth', (t) => {
  const cwd = fixture(t, 'node -e "console.log(\'transcript that must not persist\')"');

  const projectionStart = SOURCE.indexOf('  const records = rows.map(');
  const projectionEnd = SOURCE.indexOf('\n  appendFileSync', projectionStart);
  assert.ok(projectionStart >= 0 && projectionEnd > projectionStart, 'projection seam moved');
  const verbatim = variant(t, (source) =>
    `${source.slice(0, projectionStart)}  const records = rows.map((row) => ({ runId, ts: runId, head, roster, ...row }));${source.slice(projectionEnd)}`,
  );
  const verbatimPath = path.join(fixture(t), 'verbatim.jsonl');
  assert.equal(run(verbatim, cwd, verbatimPath).status, 0);
  assert.ok(Object.hasOwn(records(verbatimPath)[0], 'output'), 'literal rows mutation did not manufacture the size trap');

  const successLine = '  console.log(`guard-stats: appended ${records.length} record(s) to ${statsPath}`);';
  const silent = variant(t, (source) => replaceOnce(source, successLine, '  void records;'));
  const silentPath = path.join(fixture(t), 'silent.jsonl');
  const silentResult = run(silent, cwd, silentPath);
  assert.equal(silentResult.status, 0);
  assert.doesNotMatch(silentResult.stdout, /guard-stats: appended/, 'success declaration mutation did not take');

  const catchLine = '  console.log(`⚠️ guard-stats: could not append to ${statsPath}: ${error.message}`);';
  const throwing = variant(t, (source) => replaceOnce(source, catchLine, '  throw error;'));
  const blocker = path.join(fixture(t), 'file');
  writeFileSync(blocker, 'file');
  const thrown = run(throwing, cwd, path.join(blocker, 'stats.jsonl'));
  assert.equal(thrown.status, 1, 'throwing mutation did not change the passing guard exit');
});

test('pre-change persistence absence reddens every persistence arm, but not guard exits', (t) => {
  const start = SOURCE.indexOf('const roster = requested');
  const end = SOURCE.indexOf('\n\nprocess.exit(failed.length ? 1 : 0);', start);
  assert.ok(start >= 0 && end > start, 'persistence block seam moved');
  const preChange = variant(t, (source) => source.slice(0, start) + source.slice(end));
  const cwd = fixture(t);
  const statsPath = path.join(fixture(t), 'pre-change.jsonl');

  const green = run(preChange, cwd, statsPath);
  assert.equal(green.status, 0, 'pre-change passing guard exit was not 0');
  assert.ok(!existsSync(statsPath), 'pre-change mutation unexpectedly persisted a record');
  assert.doesNotMatch(green.stdout, /guard-stats:/);

  const red = run(preChange, fixture(t, 'node -e "process.exit(1)"'), statsPath);
  assert.equal(red.status, 1, 'pre-change failing guard exit was not 1');
  assert.ok(!existsSync(statsPath), 'pre-change mutation unexpectedly inventoried the red');
});
