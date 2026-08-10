import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSeasonAt, SEASONS } from '../src/seasons/registry.ts';

const founding = SEASONS[0];

test('season resolver finds a date inside Season 1', () => {
  assert.equal(resolveSeasonAt(1786034488337)?.id, 'founding-season');
});

test('season resolver leaves dates before all seasons unlabelled', () => {
  assert.equal(resolveSeasonAt(founding.startsAt - 1), null);
});

test('season resolver leaves missing timestamps unlabelled', () => {
  assert.equal(resolveSeasonAt(undefined), null);
});

test('season resolver treats null endsAt as open-ended', () => {
  assert.equal(resolveSeasonAt(Date.UTC(2027, 0, 1))?.id, 'founding-season');
});
