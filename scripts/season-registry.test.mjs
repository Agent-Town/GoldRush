import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSeasonAt, SEASONS } from '../src/seasons/registry.ts';

const founding = SEASONS[0];
const sameGame = SEASONS[1];

test('registry turns from Season 1 to Season 2 at the half-open boundary', () => {
  assert.equal(SEASONS.length, 2);
  assert.equal(founding.endsAt, sameGame.startsAt);
  assert.equal(resolveSeasonAt(sameGame.startsAt - 1)?.id, 'founding-season');
  assert.equal(resolveSeasonAt(sameGame.startsAt)?.id, 'same-game-season');
});

test('season resolver leaves dates before all seasons unlabelled', () => {
  assert.equal(resolveSeasonAt(founding.startsAt - 1), null);
});

test('season resolver leaves missing timestamps unlabelled', () => {
  assert.equal(resolveSeasonAt(undefined), null);
});

test('season resolver treats null endsAt as open-ended', () => {
  assert.equal(resolveSeasonAt(Date.UTC(2027, 0, 1))?.id, 'same-game-season');
});
