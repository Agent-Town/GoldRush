import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = fileURLToPath(new URL('./suite-red-inventory.mjs', import.meta.url));
const SPEC = 'fixture.spec.ts';
const SPEC_PATH = path.join('e2e', SPEC).replaceAll(path.sep, '/');

function fixture(t, config = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-suite-red-inventory-'));
  const rootDir = path.join(dir, 'tree', 'e2e');
  const specFile = path.join(rootDir, SPEC);
  const input = path.join(dir, 'input.json');
  fs.mkdirSync(rootDir, { recursive: true });
  fs.writeFileSync(specFile, "test('cwd invariant failure', async () => {\n  await fixture();\n  throw new Error('fixture failure');\n});\n");
  fs.writeFileSync(input, JSON.stringify({
    config: { rootDir, ...config },
    suites: [{
      title: SPEC,
      file: SPEC,
      specs: [{
        title: 'cwd invariant failure',
        file: SPEC,
        line: 1,
        tests: ['desktop-chrome', 'mobile-chrome'].map((projectName) => ({
          projectName,
          status: 'unexpected',
          expectedStatus: 'passed',
          results: [{
            status: 'failed',
            duration: 1,
            error: {
              message: 'fixture failure',
              location: { file: specFile, line: 3, column: 3 },
              stack: `Error: fixture failure\n    at ${specFile}:3:3`,
            },
          }],
        })),
      }],
    }],
  }));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, input, rootDir, specFile };
}

function run(cwd, input, output, script = SCRIPT) {
  return spawnSync(process.execPath, [script, input, output], {
    cwd,
    encoding: 'utf8',
    timeout: 60_000,
  });
}

function scriptCopies(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-suite-red-scripts-'));
  const scripts = ['a', path.join('a', 'b')].map((name) => {
    const root = path.join(dir, name);
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    fs.copyFileSync(SCRIPT, path.join(root, 'scripts', path.basename(SCRIPT)));
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(root, 'node_modules'), 'dir');
    fs.mkdirSync(path.join(root, 'e2e'));
    fs.writeFileSync(path.join(root, SPEC_PATH), "test('cwd invariant failure', async () => {\n  await fixture();\n  throw new Error('fixture failure');\n});\n");
    return path.join(root, 'scripts', path.basename(SCRIPT));
  });
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return scripts;
}

test('reducer output is cwd-invariant', (t) => {
  const { dir, input } = fixture(t);
  const rootOutput = path.join(dir, 'root.md');
  const tempOutput = path.join(dir, 'temp.md');

  const fromRoot = run(ROOT, input, rootOutput);
  assert.equal(fromRoot.status, 0, fromRoot.stderr || fromRoot.stdout);
  const fromTemp = run(os.tmpdir(), input, tempOutput);
  assert.equal(fromTemp.status, 0, fromTemp.stderr || fromTemp.stdout);
  assert.deepEqual(fs.readFileSync(tempOutput), fs.readFileSync(rootOutput));
  assert.ok(
    fs.readFileSync(rootOutput, 'utf8').includes(`| ${SPEC_PATH} | cwd invariant failure |`),
    `expected failure row for ${SPEC_PATH}`,
  );
});

test('reducer reports configured and actual workers distinctly', (t) => {
  const { dir, input } = fixture(t, {
    workers: 7,
    metadata: { actualWorkers: 3 },
    fullyParallel: true,
    shard: { current: 2, total: 5 },
    version: '9.9.9',
  });
  const output = path.join(dir, 'configured.md');
  const result = run(ROOT, input, output);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.readFileSync(output, 'utf8').includes(
    '- Harness: configured workers **7**; actual workers **3**; fully parallel **true**; shard **{"current":2,"total":5}**; Playwright **9.9.9**',
  ));
});

test('reducer reports absent harness config as unrecorded', (t) => {
  const { dir, input } = fixture(t);
  const output = path.join(dir, 'unrecorded.md');
  const result = run(ROOT, input, output);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.readFileSync(output, 'utf8').includes(
    '- Harness: configured workers **unrecorded**; actual workers **unrecorded**; fully parallel **unrecorded**; shard **unrecorded**; Playwright **unrecorded**',
  ));
});

test('reducer output is script-root-invariant', (t) => {
  const { dir, input } = fixture(t);
  const scripts = scriptCopies(t);
  const outputs = scripts.map((script, index) => path.join(dir, `script-${index}.md`));

  scripts.forEach((script, index) => {
    const result = run(ROOT, input, outputs[index], script);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
  assert.deepEqual(fs.readFileSync(outputs[0]), fs.readFileSync(outputs[1]));
});

test('reducer renders absolute raw paths relative to the recorded tree', (t) => {
  const { dir, input, rootDir, specFile } = fixture(t);
  const output = path.join(dir, 'faithful.md');
  const result = run(ROOT, input, output, scriptCopies(t)[0]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const markdown = fs.readFileSync(output, 'utf8');
  assert.ok(markdown.includes(`| ${SPEC_PATH} | cwd invariant failure |`));
  assert.ok(markdown.includes(`| ${SPEC_PATH}:3 |`));
  assert.ok(!markdown.includes(`| ${specFile} |`));
  assert.ok(!markdown.includes('| fixture.spec.ts | cwd invariant failure |'));
  assert.ok(markdown.includes(`- Run tree: **${rootDir}**; status **present**; resolved masking-row test bodies`));
  assert.ok(!markdown.split('\n').filter((line) => !line.startsWith('- Run tree:')).join('\n').includes(specFile));
});

test('reducer refuses body statistics when the recorded tree is unavailable', (t) => {
  const missingRoot = path.join(os.tmpdir(), `missing-suite-tree-${process.pid}-${Date.now()}`, 'e2e');
  const { dir, input } = fixture(t, { rootDir: missingRoot });
  const report = JSON.parse(fs.readFileSync(input, 'utf8'));
  for (const testCase of report.suites[0].specs[0].tests) {
    testCase.results[0].error.location.file = path.join(missingRoot, SPEC);
    testCase.results[0].error.stack = `Error: fixture failure\n    at ${path.join(missingRoot, SPEC)}:3:3`;
  }
  fs.writeFileSync(input, JSON.stringify(report));
  const scripts = scriptCopies(t);
  const outputs = scripts.map((script, index) => path.join(dir, `missing-${index}.md`));

  scripts.forEach((script, index) => {
    const result = run(ROOT, input, outputs[index], script);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
  assert.deepEqual(fs.readFileSync(outputs[0]), fs.readFileSync(outputs[1]));
  const markdown = fs.readFileSync(outputs[0], 'utf8');
  const masking = markdown.match(/## Masking candidates[\s\S]*?## Crashes and timeouts/)?.[0] ?? '';
  assert.ok(markdown.includes(`- Run tree: **${missingRoot}**; status **unavailable**;`));
  assert.doesNotMatch(masking, /\(\d+\.\d+%\)/);
  assert.ok(masking.includes('No masking candidates could be ranked; all 1 row is unresolved'));
  assert.ok(masking.includes('body unavailable'));
});

test('an unresolved masking row never outranks a resolved row', (t) => {
  const { dir, input, rootDir } = fixture(t);
  const report = JSON.parse(fs.readFileSync(input, 'utf8'));
  report.suites[0].specs[0].title = 'Z resolved';
  const unresolved = structuredClone(report.suites[0].specs[0]);
  unresolved.title = 'A unresolved';
  unresolved.file = 'missing.spec.ts';
  for (const testCase of unresolved.tests) {
    testCase.results[0].error.location.file = path.join(rootDir, 'missing.spec.ts');
    testCase.results[0].error.stack = `Error: fixture failure\n    at ${path.join(rootDir, 'missing.spec.ts')}:3:3`;
  }
  report.suites[0].specs.push(unresolved);
  fs.writeFileSync(input, JSON.stringify(report));
  const output = path.join(dir, 'ranked.md');
  const result = run(ROOT, input, output);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const markdown = fs.readFileSync(output, 'utf8');
  assert.ok(markdown.indexOf('| 1 | e2e/fixture.spec.ts | Z resolved |')
    < markdown.indexOf('| — | e2e/missing.spec.ts | A unresolved |'));
});
