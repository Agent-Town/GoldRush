import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test, { after } from 'node:test';

const SCRIPT = resolve(process.env.F2135_CENSUS_PLAYER_SCRIPT ?? join(import.meta.dirname, 'f2135-canyon-census-player.mjs'));
const BANKED = resolve(import.meta.dirname, '../artifacts/f2135-canyon-census/census.json');
const fixtures = [];

after(() => {
  for (const fixture of fixtures) rmSync(fixture, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'f2135-census-player-'));
  fixtures.push(root);
  return root;
}

function write(path, body) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}

function run(root, views, { output, runId } = {}) {
  const viewsPath = join(root, 'views.json');
  writeFileSync(viewsPath, JSON.stringify(views));
  const env = { ...process.env, F2135_TEST_SCRIPT: SCRIPT, F2135_TEST_VIEWS: viewsPath };
  delete env.F2135_CENSUS_FILE;
  delete env.F2135_CENSUS_RUN;
  if (output) env.F2135_CENSUS_FILE = output;
  if (runId) env.F2135_CENSUS_RUN = runId;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval', `
    const { default: player } = await import(process.env.F2135_TEST_SCRIPT);
    const { readFile } = await import('node:fs/promises');
    for (const row of JSON.parse(await readFile(process.env.F2135_TEST_VIEWS, 'utf8'))) {
      await player({
        canyonConnect: {
          powered: row.powered,
          required: row.required,
          complete: row.complete,
          failed: row.failed,
        },
        now: { wave: row.wave, pendingSecure: true },
      });
    }
  `], { timeout: 240_000, killSignal: 'SIGKILL', cwd: root, env, encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr || child.stdout);
}

const row = (wave, powered = 0) => ({ wave, powered, required: 6, complete: false, failed: false });

test('a default write leaves the banked census byte-identical', () => {
  const root = fixture();
  const banked = join(root, 'artifacts/f2135-canyon-census/census.json');
  const bytes = `${JSON.stringify({
    schema: 'goldrush.f2135.canyon-census.v1',
    contractId: 'e3-canyon-works',
    runs: [{ id: 'banked-a', rows: [row(1)] }, { id: 'banked-b', rows: [row(1)] }],
    comparison: { comparedRunIds: ['banked-a', 'banked-b'], identical: true },
  }, null, 2)}\n`;
  write(banked, bytes);

  run(root, [row(1)]);

  assert.equal(readFileSync(banked, 'utf8'), bytes);
  assert.ok(existsSync(join(root, 'artifacts/f2135-canyon-census/scratch/run-1.json')));
});

test('an explicit F2135_CENSUS_FILE write still lands where asked', () => {
  const root = fixture();
  const output = join(root, 'explicit/census.json');

  run(root, [row(2, 1)], { output, runId: 'explicit-run' });

  const artifact = JSON.parse(readFileSync(output, 'utf8'));
  assert.deepEqual(artifact.runs.map(({ id }) => id), ['explicit-run']);
  assert.deepEqual(artifact.comparison, { comparedRunIds: ['explicit-run'], identical: null });
});

test('a differing third run recomputes the comparison across all three runs', () => {
  const root = fixture();
  const output = join(root, 'census.json');
  write(output, `${JSON.stringify({
    schema: 'goldrush.f2135.canyon-census.v1',
    contractId: 'e3-canyon-works',
    runs: [{ id: 'run-a', rows: [row(1)] }, { id: 'run-b', rows: [row(1)] }],
    comparison: { comparedRunIds: ['run-a', 'run-b'], identical: true },
  }, null, 2)}\n`);

  run(root, [row(3, 2)], { output, runId: 'run-c' });

  const { comparison } = JSON.parse(readFileSync(output, 'utf8'));
  assert.deepEqual(comparison, {
    comparedRunIds: ['run-a', 'run-b', 'run-c'],
    identical: false,
  });
});

test('the committed two-run artifact round-trips byte-identically', () => {
  const root = fixture();
  const output = join(root, 'census.json');
  const bytes = readFileSync(BANKED, 'utf8');
  const artifact = JSON.parse(bytes);
  write(output, bytes);

  run(root, artifact.runs[1].rows, { output, runId: artifact.runs[1].id });

  assert.equal(readFileSync(output, 'utf8'), bytes);
});
