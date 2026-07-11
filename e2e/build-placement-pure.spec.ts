import { expect, test } from '@playwright/test';
import { matchesPlacement, overlapsExisting, type PlacementDescriptor } from '../src/systems/BuildPlacement';

const candidate: PlacementDescriptor = {
  id: 'palisade',
  x: 0,
  z: 0,
  rotationSteps: 0,
  halfX: 0.5,
  halfZ: 1.5,
  overlapRadius: 0.5,
};

test('pure placement predicate preserves surface and overlap rules', () => {
  expect(matchesPlacement('any', { walkable: true, buildable: false, waterSourceAdjacent: false })).toBe(true);
  expect(matchesPlacement('bank', { walkable: true, buildable: false, waterSourceAdjacent: false })).toBe(false);
  expect(matchesPlacement('river-adjacent', { walkable: true, buildable: true, waterSourceAdjacent: true })).toBe(true);
  expect(overlapsExisting(candidate, [{ ...candidate, id: 'stockpile', x: 1, halfX: 0.5 }], [])).toBe(false);
  expect(overlapsExisting(candidate, [{ ...candidate, id: 'stockpile', x: 0.99, halfX: 0.5 }], [])).toBe(true);
  expect(overlapsExisting(candidate, [], [{ x: 0, z: 2, halfX: 1, halfZ: 0.6 }])).toBe(true);
});
