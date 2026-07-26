import assert from 'node:assert/strict';
import test from 'node:test';
import { Balance } from '../src/game/Balance.ts';

const entryDamageScale = Balance.waves.entryDamageScale;
const nightShift = entryDamageScale['e1-night-shift'];
const baron = entryDamageScale['e1-baron'];

test('entry damage tables include both E1 contracts', () => {
  assert.ok(Array.isArray(nightShift));
  assert.ok(Array.isArray(baron));
});

test('night shift wave 3 has reduced entry damage', () => {
  assert.ok(nightShift[3] !== undefined && nightShift[3] < 1);
});

test('night shift wave 12 has no entry damage scale', () => {
  assert.equal(nightShift[12], undefined);
});

test('entry damage scaling ends after wave 10', () => {
  for (const table of [nightShift, baron]) {
    assert.ok(table[10] !== undefined && table[10] < 1);
    assert.equal(table[11], undefined);
  }
});

test('entry damage scales are finite reductions', () => {
  for (const table of [nightShift, baron]) {
    for (const scale of table) {
      assert.ok(Number.isFinite(scale) && scale > 0 && scale <= 1);
    }
  }
});

test('E1 entry damage tables agree', () => {
  assert.deepEqual(baron, nightShift);
});
