import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const SCRIPT = fileURLToPath(new URL('./probe-plain-boot-console.mjs', import.meta.url));
const envWithoutBase = { ...process.env };
delete envWithoutBase.PROBE_BASE;

test('rejects an unset PROBE_BASE before launching a browser', () => {
  const result = spawnSync(process.execPath, [SCRIPT], { env: envWithoutBase, encoding: 'utf8' });
  assert.ok(Number.isInteger(result.status) && result.status !== 0, result.stderr);
  assert.match(result.stderr, /PROBE_BASE/);
});

test('rejects a positional base URL with a PROBE_BASE directive', () => {
  const result = spawnSync(process.execPath, [SCRIPT, 'http://127.0.0.1:5188'], {
    env: { ...envWithoutBase, PROBE_BASE: 'http://127.0.0.1:1' },
    encoding: 'utf8',
  });
  assert.ok(Number.isInteger(result.status) && result.status !== 0, result.stderr);
  assert.match(result.stderr, /Positional.*PROBE_BASE/);
});
