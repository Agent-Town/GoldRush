import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./red-inventory-lookup.mjs', import.meta.url));
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SPEC = '072-era-activation.spec.ts';
const RED_TITLE = 'stable title survives coordinate drift';
const CLEAN_TITLE = 'same coordinate but a different title';
const BUCKET = 'BOTH (~25%: 3/12 desktop, 3/12 mobile — measured s1297 (F-1297-1))';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'red-inventory-lookup-'));
  const inventory = path.join(dir, 'inventory.md');
  const compact = path.join(dir, 'compact.json');
  fs.writeFileSync(inventory, `# Suite Red Inventory

- Total tests run: **4**
- Total failed: **1**
- BOTH: **1**

## Failing tests

| Spec file | Test title | Project | Failing file:line | First error line | Duration | Bucket |
|---|---|---|---|---|---:|---|
| e2e/${SPEC} | ${RED_TITLE} | desktop-chrome | e2e/${SPEC}:12 | fixture failure | 5 ms | ${BUCKET} |

## Masking candidates

| Rank | Spec file | Test title | Failing-line / body-lines ratio |
|---:|---|---|---|
| 1 | e2e/${SPEC} | ${RED_TITLE} | desktop-chrome: e2e/${SPEC}:12 — 2/10 (20.0%) |
`);
  fs.writeFileSync(compact, JSON.stringify({
    stats: { startTime: '2031-12-25T01:02:03.000Z', duration: 4000 },
    suites: [{
      title: SPEC,
      file: SPEC,
      specs: [RED_TITLE, CLEAN_TITLE].map((title) => ({
        title,
        file: SPEC,
        line: title === CLEAN_TITLE ? 12 : 999,
        tests: ['desktop-chrome', 'mobile-chrome'].map((projectName) => ({
          projectName,
          results: [{ status: 'passed' }],
        })),
      })),
    }],
  }));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, inventory, compact };
}

function spec(_files, name = SPEC) {
  return path.join(ROOT, 'e2e', name);
}

function run(files, ...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      RED_INVENTORY_PATH: files.inventory,
      RED_INVENTORY_COMPACT_PATH: files.compact,
    },
  });
}

test('title lookup finds a red even when its recorded coordinate has rotted', (t) => {
  const files = fixture(t);
  const result = run(files, spec(files), '--title', RED_TITLE);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /KNOWN-RED/);
  assert.match(result.stdout, /072-era-activation\.spec\.ts:12 \(recorded at inventory run — may have rotted\)/);
  assert.match(result.stdout, /Blast radius: desktop-chrome: e2e\/072-era-activation\.spec\.ts:12 — 2\/10 \(20\.0%\)/);
  assert.ok(result.stdout.includes(BUCKET), 'bucket annotation must survive verbatim');
});

test('matching file:line never substitutes for an exact title match', (t) => {
  const files = fixture(t);
  const result = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CLEAN-IN-INVENTORY/);
  assert.doesNotMatch(result.stdout, new RegExp(RED_TITLE));
});

test('clean and absent specs have distinct words and exit codes', (t) => {
  const files = fixture(t);
  const clean = run(files, spec(files));
  const absent = run(files, spec(files, '044-start-screen.spec.ts'));
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /KNOWN-RED/);
  assert.equal(absent.status, 1, absent.stderr);
  assert.match(absent.stdout, /NOT-IN-INVENTORY/);

  const cleanTitle = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(cleanTitle.status, 0, cleanTitle.stderr);
  assert.match(cleanTitle.stdout, /CLEAN-IN-INVENTORY/);
});

test('json output still names the outcome and denominator', (t) => {
  const files = fixture(t);
  const result = run(files, spec(files), '--title', RED_TITLE, '--json');
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.outcome, 'KNOWN-RED');
  assert.deepEqual([output.rowsParsed, output.failureRowsParsed, output.blastRadiusRowsParsed], [2, 1, 1]);
  assert.deepEqual([output.totalTestsRun, output.totalFailed], [4, 1]);
  assert.equal(output.snapshotDate, '2031-12-25');
  assert.equal(output.rows[0].bucket, BUCKET);
});

test('strict mode makes a known red actionable without changing its word', (t) => {
  const files = fixture(t);
  const result = run(files, spec(files), '--title', RED_TITLE, '--strict');
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /KNOWN-RED/);
});

test('skipped-only tests are not called clean', (t) => {
  const files = fixture(t);
  const report = JSON.parse(fs.readFileSync(files.compact, 'utf8'));
  for (const entry of report.suites[0].specs.filter(({ title }) => title === CLEAN_TITLE)) {
    for (const execution of entry.tests) execution.results[0].status = 'skipped';
  }
  fs.writeFileSync(files.compact, JSON.stringify(report));
  const result = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /NOT-IN-INVENTORY/);
});

test('literal backslashes survive markdown parsing', (t) => {
  const files = fixture(t);
  const backslashTitle = String.raw`matches \d+ values`;
  fs.writeFileSync(files.inventory, fs.readFileSync(files.inventory, 'utf8').replaceAll(RED_TITLE, backslashTitle));
  const report = JSON.parse(fs.readFileSync(files.compact, 'utf8'));
  report.suites[0].specs[0].title = backslashTitle;
  fs.writeFileSync(files.compact, JSON.stringify(report));
  const result = run(files, spec(files), '--title', backslashTitle);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /KNOWN-RED/);
  assert.ok(result.stdout.includes(backslashTitle));
});

test('absent and malformed inventories fail loudly', (t) => {
  const files = fixture(t);
  fs.unlinkSync(files.inventory);
  const absent = run(files, spec(files));
  assert.equal(absent.status, 2);
  assert.match(absent.stderr, /red-inventory-lookup:/);

  fs.writeFileSync(files.inventory, '# malformed\n');
  const malformed = run(files, spec(files));
  assert.equal(malformed.status, 2);
  assert.match(malformed.stderr, /missing header total/);

  const truncated = fixture(t);
  fs.writeFileSync(truncated.inventory, fs.readFileSync(truncated.inventory, 'utf8')
    .replace(`| 1 | e2e/${SPEC} | stable title survives coordinate drift | desktop-chrome: e2e/${SPEC}:12 — 2/10 (20.0%) |\n`, ''));
  const missingBlast = run(truncated, spec(truncated));
  assert.equal(missingBlast.status, 2);
  assert.match(missingBlast.stderr, /parsed 0 blast-radius rows/);
});

test('bare names are misuse and verdict dates track the compact snapshot', (t) => {
  const files = fixture(t);
  const bare = run(files, '072-era-activation');
  assert.equal(bare.status, 2);
  assert.match(bare.stderr, /spec does not exist: e2e\/072-era-activation/);

  const clean = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.stdout, /CLEAN-IN-INVENTORY.*snapshot date \d{4}-\d{2}-\d{2}/);
  assert.match(clean.stdout, /snapshot date 2031-12-25/);

  const report = JSON.parse(fs.readFileSync(files.compact, 'utf8'));
  delete report.stats.startTime;
  fs.writeFileSync(files.compact, JSON.stringify(report));
  const unknown = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(unknown.status, 0, unknown.stderr);
  assert.match(unknown.stdout, /snapshot date UNKNOWN/);

  report.stats.startTime = null;
  fs.writeFileSync(files.compact, JSON.stringify(report));
  const nullDate = run(files, spec(files), '--title', CLEAN_TITLE);
  assert.equal(nullDate.status, 0, nullDate.stderr);
  assert.match(nullDate.stdout, /snapshot date UNKNOWN/);
});
