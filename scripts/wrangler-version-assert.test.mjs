import assert from 'node:assert/strict';
import test from 'node:test';
import { assertWranglerVersion, EXPECTED_WRANGLER_VERSION } from './wrangler-binary.mjs';

const result = (version) => ({ status: 0, stdout: version, stderr: '' });
const inheritedEscape = process.env.GR_WRANGLER_ANY;

test.beforeEach(() => delete process.env.GR_WRANGLER_ANY);
test.afterEach(() => {
  if (inheritedEscape === undefined) delete process.env.GR_WRANGLER_ANY;
  else process.env.GR_WRANGLER_ANY = inheritedEscape;
});

test('positive arm accepts the expected Wrangler version', () => {
  assert.equal(assertWranglerVersion('positive gate', () => result(EXPECTED_WRANGLER_VERSION)), EXPECTED_WRANGLER_VERSION);
});

test('violation arm rejects Wrangler version drift', () => {
  assert.throws(
    () => assertWranglerVersion('violation gate', () => result('4.107.0-beta.1')),
    (error) => ['violation gate', '4.107.0-beta.1', EXPECTED_WRANGLER_VERSION].every((text) => error.message.includes(text)),
  );
});

test('missing arm reports Wrangler absent from PATH', () => {
  assert.throws(
    () => assertWranglerVersion('missing gate', () => ({ error: new Error('ENOENT'), status: null })),
    /missing gate: wrangler was not found on PATH/,
  );
});

test('escape arm warns loudly and permits explicit drift', () => {
  const previous = process.env.GR_WRANGLER_ANY;
  const warnings = [];
  const warn = console.warn;
  process.env.GR_WRANGLER_ANY = '1';
  console.warn = (message) => warnings.push(message);
  try {
    assert.equal(assertWranglerVersion('escape gate', () => result('9.9.9')), '9.9.9');
    assert.equal(warnings.length, 1);
    assert.equal(
      ['WRANGLER VERSION DRIFT', 'escape gate', '9.9.9', EXPECTED_WRANGLER_VERSION].every((text) => warnings[0].includes(text)),
      true,
    );
  } finally {
    console.warn = warn;
    if (previous === undefined) delete process.env.GR_WRANGLER_ANY;
    else process.env.GR_WRANGLER_ANY = previous;
  }
});
