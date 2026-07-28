import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = fileURLToPath(new URL('./suite-red-inventory.mjs', import.meta.url));
const SPEC = fs.readdirSync(path.join(ROOT, 'e2e')).find((file) => file.endsWith('.spec.ts'));
assert.ok(SPEC, 'expected at least one e2e spec');
const SPEC_PATH = path.join('e2e', SPEC).replaceAll(path.sep, '/');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-suite-red-inventory-'));
  const input = path.join(dir, 'input.json');
  fs.writeFileSync(input, JSON.stringify({
    config: {},
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
            error: { message: 'fixture failure' },
          }],
        })),
      }],
    }],
  }));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return { dir, input };
}

function run(cwd, input, output) {
  return spawnSync(process.execPath, [SCRIPT, input, output], {
    cwd,
    encoding: 'utf8',
    timeout: 60_000,
  });
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
