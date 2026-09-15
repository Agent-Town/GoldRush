import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const SCRIPTS = dirname(SELF);
const ROOT = resolve(SCRIPTS, '..');
const childEnv = { ...process.env };
// Inheriting Node's internal test-child marker makes nested `node --test` execute zero tests.
delete childEnv.NODE_TEST_CONTEXT;
const PREFIX = /\bmkdtemp(?:Sync)?\s*\(\s*(?:path\.)?join\s*\(\s*(?:os\.)?tmpdir\(\)\s*,\s*(['"`])([^'"`]+)\1\s*\)\s*\)/g;
const BASELINE = JSON.parse(readFileSync(join(ROOT, 'scripts/gate-caller-baseline.json'), 'utf8'));
const subjects = readdirSync(SCRIPTS)
  .filter((name) => name.endsWith('.test.mjs'))
  .map((name) => join(SCRIPTS, name))
  // This guard uses mkdtemp itself; including it would recurse without bound.
  .filter((file) => file !== SELF)
  // F-TCR-4 (attended 2026-09-15): a guard the battery does not call is not a fixture owner this sweep can judge.
  // scripts/gate-caller-baseline.json's `grandfathered` map records, with a reason each, the guards that have
  // no caller by decision (browser probes that need a running server, the six review-*.test.mjs that need real
  // Durable Objects and hang 90 s as children, town-patrol-monument red by a known town-data defect). Running
  // them here made the sweep red on main for every tree since 2026-09-14 while every rooted guard was clean.
  // They are skipped by the battery's own word, never silently: the reason is the baseline's.
  .filter((file) => !(BASELINE.grandfathered ?? {})[relative(ROOT, file).replaceAll('\\', '/')])
  .map((file) => ({ file, source: readFileSync(file, 'utf8') }))
  .filter(({ source }) => /\bmkdtemp(?:Sync)?\s*\(/.test(source));

test(`all ${subjects.length} scripts/*.test.mjs fixture owners remove their temp directories`, () => {
  assert.ok(subjects.length > 0, 'fixture teardown guard covered 0 mkdtemp-using scripts/*.test.mjs files');
  const results = [];

  for (const { file, source } of subjects) {
    const name = relative(ROOT, file).replaceAll('\\', '/');
    const prefixes = [...new Set([...source.matchAll(PREFIX)].map((match) => match[2]))];
    assert.ok(prefixes.length > 0, `${name} calls mkdtemp but yielded 0 extractable literal prefixes`);

    const scratch = mkdtempSync(join(tmpdir(), 'gold-rush-fixture-teardown-'));
    try {
      const run = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...childEnv, TMPDIR: scratch },
      });
      assert.equal(run.status, 0, `${name} child failed:\n${run.stderr || run.stdout}`);
      assert.match(run.stdout, /^ℹ tests [1-9]\d*$/m, `${name} child reported zero executed tests`);
      const survivors = readdirSync(scratch).filter((entry) =>
        prefixes.some((prefix) => entry.startsWith(prefix)));
      results.push({ name, survivors });
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }

  assert.ok(
    results.every(({ survivors }) => survivors.length === 0),
    `fixture survivors by file:\n${results
      .map(({ name, survivors }) => `${name}: ${survivors.length} [${survivors.join(', ')}]`)
      .join('\n')}`,
  );
});
