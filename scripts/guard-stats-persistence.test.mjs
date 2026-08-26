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

function run(script, cwd, statsPath, env = {}) {
  return spawnSync(process.execPath, [script, '--only', 'test:citations'], {
    cwd,
    encoding: 'utf8',
    timeout: 60_000,
    env: { ...process.env, ...env, ...(statsPath ? { GR_GUARD_STATS_PATH: statsPath } : {}) },
  });
}

function records(statsPath) {
  return readFileSync(statsPath, 'utf8').trim().split('\n').map(JSON.parse);
}

function git(cwd, ...args) {
  return spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
}

function repoFixture(t, trackedStats = false) {
  const dir = fixture(t);
  assert.equal(git(dir, 'init', '-q').status, 0);
  const statsPath = path.join(dir, 'stats.jsonl');
  if (trackedStats) writeFileSync(statsPath, '{"seed":true}\n');
  assert.equal(git(dir, 'add', '.').status, 0);
  assert.equal(
    git(dir, '-c', 'user.name=Guard Stats', '-c', 'user.email=guard-stats@example.invalid', 'commit', '-qm', 'fixture').status,
    0,
  );
  return { dir, statsPath };
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
  const statsPath = cwd;

  const result = run(SUBJECT, cwd, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp(`⚠️ guard-stats: could not append to ${statsPath}`));
});

test('tracked stats path is skipped without dirtying the repository or changing the guard exit', (t) => {
  const { dir, statsPath } = repoFixture(t, true);
  const before = readFileSync(statsPath, 'utf8');

  const result = run(SUBJECT, dir, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(readFileSync(statsPath, 'utf8'), before);
  assert.equal(git(dir, 'status', '--porcelain').stdout, '');
  assert.match(result.stdout, new RegExp(`guard-stats: skipped ${statsPath} because it is tracked; a gate must not dirty its own tree`));
  assert.doesNotMatch(result.stdout, /guard-stats: appended/);
});

test('untracked stats path in the same repository still appends without changing the guard exit', (t) => {
  const { dir, statsPath } = repoFixture(t);

  const result = run(SUBJECT, dir, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(records(statsPath).length, 1);
  assert.match(result.stdout, new RegExp(`guard-stats: appended 1 record\\(s\\) to ${statsPath}`));
  assert.doesNotMatch(result.stdout, /guard-stats: skipped/);
});

test('stats path outside a repository still appends without changing the guard exit', (t) => {
  const dir = fixture(t);
  const statsPath = path.join(dir, 'stats.jsonl');

  const result = run(SUBJECT, dir, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(records(statsPath).length, 1);
  assert.match(result.stdout, new RegExp(`guard-stats: appended 1 record\\(s\\) to ${statsPath}`));
  assert.doesNotMatch(result.stdout, /guard-stats: skipped/);
});

test('an unclassifiable stats path fails closed without changing the guard exit', (t) => {
  const missingGit = variant(t, (source) => replaceOnce(
    source,
    "    'git',\n    ['-C', path.dirname(statsPath), 'ls-files'",
    "    'definitely-not-git',\n    ['-C', path.dirname(statsPath), 'ls-files'",
  ));
  const statsPath = path.join(fixture(t), 'stats.jsonl');

  const result = run(missingGit, fixture(t), statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.ok(!existsSync(statsPath));
  assert.match(result.stdout, new RegExp(`guard-stats: could not classify ${statsPath}; skipped because a gate must not dirty its own tree`));
});

test('git exit 128 from a classification failure is not mistaken for an outside-repository path', (t) => {
  const { dir, statsPath } = repoFixture(t, true);
  const badConfig = path.join(fixture(t), 'bad-gitconfig');
  writeFileSync(badConfig, '[broken\n');
  const before = readFileSync(statsPath, 'utf8');

  const result = run(SUBJECT, dir, statsPath, { GIT_CONFIG_GLOBAL: badConfig });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(readFileSync(statsPath, 'utf8'), before);
  assert.match(result.stdout, new RegExp(`guard-stats: could not classify ${statsPath}; skipped because a gate must not dirty its own tree`));
});

test('manufactured pre-cure append dirties a tracked stats path without changing the guard exit', (t) => {
  const preCure = variant(t, (source) => {
    const start = source.indexOf('  const tracking = spawnSync(');
    const end = source.indexOf('\n  }\n} catch (error) {', start);
    assert.ok(start >= 0 && end > start, 'tracked-path cure seam moved');
    return `${source.slice(0, start)}  appendFileSync(statsPath, \`${'${records.map((record) => JSON.stringify(record)).join(\'\\n\')}'}\\n\`);\n  console.log(\`guard-stats: appended ${'${records.length}'} record(s) to ${'${statsPath}'}\`);${source.slice(end + 4)}`;
  });
  const { dir, statsPath } = repoFixture(t, true);

  const result = run(preCure, dir, statsPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(git(dir, 'status', '--porcelain').stdout, /^ M stats\.jsonl$/m);
  assert.match(result.stdout, /guard-stats: appended 1 record\(s\)/);
});

test('manufactured defects prove the reverse controls have teeth', (t) => {
  const cwd = fixture(t, 'node -e "console.log(\'transcript that must not persist\')"');

  const projectionStart = SOURCE.indexOf('  const records = rows.map(');
  const projectionEnd = SOURCE.indexOf('\n  const tracking', projectionStart);
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
  const thrown = run(throwing, cwd, fixture(t));
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
