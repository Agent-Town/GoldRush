import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveBase } from '../rehearsal/base-url.mjs';

const ROOT = '/repo/ours';
const BASE = 'http://127.0.0.1:5432';

test('accepts a listener owned by this checkout', () => {
  process.env.REHEARSAL_BASE_TEST_OWN = BASE;
  assert.equal(resolveBase('REHEARSAL_BASE_TEST_OWN', { root: ROOT, probeListener: () => ROOT }), BASE);
});

test('rejects a listener owned by another checkout', () => {
  process.env.REHEARSAL_BASE_TEST_FOREIGN = BASE;
  assert.throws(
    () => resolveBase('REHEARSAL_BASE_TEST_FOREIGN', { root: ROOT, probeListener: () => '/repo/foreign' }),
    /port 5432 belongs to \/repo\/foreign, not \/repo\/ours/,
  );
});

test('rejects a port with no listener', () => {
  process.env.REHEARSAL_BASE_TEST_NONE = BASE;
  assert.throws(
    () => resolveBase('REHEARSAL_BASE_TEST_NONE', { root: ROOT, probeListener: () => null }),
    /port 5432 has no listener/,
  );
});

test('rejects an unusable ownership probe', () => {
  process.env.REHEARSAL_BASE_TEST_ERROR = BASE;
  assert.throws(
    () => resolveBase('REHEARSAL_BASE_TEST_ERROR', {
      root: ROOT,
      probeListener: () => { throw new Error('lsof unavailable'); },
    }),
    /ownership is unknown: lsof probe failed \(lsof unavailable\)/,
  );
});
