import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = readFileSync(new URL('../../scripts/fixture-teardown.test.mjs', import.meta.url), 'utf8');
const results = [];
for (const mode of ['clean', 'leak', 'zero']) {
  const directory = new URL(`diagnostic-${mode}/scripts/`, import.meta.url);
  mkdirSync(directory, { recursive: true });
  writeFileSync(new URL('fixture-teardown.test.mjs', directory), source);
  writeFileSync(new URL('gate-caller-baseline.json', directory), '{"grandfathered":{}}');
  writeFileSync(new URL('subject.test.mjs', directory), `
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
${mode === 'zero' ? "process.stdout.write('stdout-before-crash\\n'); process.stderr.write('stderr-before-crash\\n'); process.exit(0);" : ''}
test('controlled nested assertion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'campaign-diagnostic-'));
  try { assert.fail('CONTROLLED_NESTED_ASSERTION'); }
  finally { ${mode === 'leak' ? '/* deliberately leak for the verdict probe */' : 'rmSync(dir, { recursive: true });'} }
});
`);
  // Node 26 counts a crashed file as one synthetic test. Exercise the existing no-summary
  // refusal with a controlled spawn result instead of pretending that is zero tests.
  const preload = new URL('no-summary.cjs', directory);
  if (mode === 'zero') writeFileSync(preload, `
    require('node:child_process').spawnSync = () => ({ status: 1, signal: null, stdout: 'stdout-before-crash', stderr: 'stderr-before-crash' });
    require('node:module').syncBuiltinESMExports();
  `);
  const run = spawnSync(process.execPath, [...(mode === 'zero' ? ['--require', fileURLToPath(preload)] : []), '--test', '--test-reporter=spec', fileURLToPath(new URL('fixture-teardown.test.mjs', directory))], { cwd: root, encoding: 'utf8' });
  writeFileSync(new URL(`diagnostic-${mode}.txt`, import.meta.url), run.stdout + run.stderr);
  results.push({ mode, status: run.status });
  assert.equal(run.status, mode === 'clean' ? 0 : 1);
  if (mode !== 'zero') assert.match(run.stdout, /CONTROLLED_NESTED_ASSERTION/);
  else {
    assert.match(run.stdout, /stdout-before-crash/);
    assert.match(run.stdout, /stderr-before-crash/);
  }
}
writeFileSync(new URL('diagnostic-results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
console.log(results);
