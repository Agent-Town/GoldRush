import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { deriveMechanicsManifest, type MechanicsManifest } from '../src/agent/MechanicsManifest';
import {
  contractDescriptorJson,
  loadContract,
  parseContractDescriptor,
  validateContractsBundle,
} from '../src/meta/ContractFamilies';

test('the Drill Yard derives every declared practice mechanic without changing its E1 siblings', async () => {
  const manifest = deriveMechanicsManifest('e1-drill-yard');
  expect(manifest.interactables).toEqual([
    { id: 'assay_tent_faucet', count: 1, operations: ['top_up'], source: 'practice.stations' },
    { id: 'drill_bell', count: 1, operations: ['ring'], source: 'practice.stations' },
    { id: 'rolling_log', count: 2, operations: ['strike'], source: 'practice.targets' },
    { id: 'straw_man', count: 3, operations: ['strike'], source: 'practice.targets' },
  ]);
  // hero-move-verb (owner ruling 2026-09-06): `hero_orders` is the manifest's first unconditional
  // row, published on every contract because the verb's contract belongs to the engine rather than
  // to a map. Alphabetical, so it lands between `drill_wave` and `ledger_free_practice`.
  expect(manifest.rules.map(({ id }) => id)).toEqual([
    'drill_wave',
    'hero_orders',
    'ledger_free_practice',
    'practice_buildables',
    'practice_gold_grant',
    'practice_target_respawn',
    'river',
    'water_crossings',
  ]);
  expect(manifest.rules.find(({ id }) => id === 'practice_buildables')?.data.ids).toHaveLength(7);
  expect(manifest.rules.find(({ id }) => id === 'drill_wave')?.data.size).toBe(8);
  expect(manifest.posting.waves).toEqual([]);

  const fixture = JSON.parse(await readFile(path.resolve('e2e/fixtures/e1-mechanics-manifests.json'), 'utf8')) as MechanicsManifest[];
  for (const id of ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron']) {
    expect(JSON.stringify(deriveMechanicsManifest(id))).toBe(JSON.stringify(fixture.find((entry) => entry.contractId === id)));
  }

  const template = loadContract('e1-drill-yard');
  const planted = structuredClone(template);
  (planted.practice as unknown as Record<string, unknown>).bogus = true;
  expect(() => validateContractsBundle({
    version: 1,
    epochId: 'epoch-1-frontier',
    contracts: [planted],
  }, 'epoch-1-frontier')).toThrow(/practice\.bogus: field_unknown/);
  const pressed = parseContractDescriptor(contractDescriptorJson(planted), template);
  expect(pressed.ok).toBe(false);
  if (!pressed.ok) expect(pressed.reasons).toEqual([{
    code: 'field_unknown',
    message: 'This contract page carries an unknown field.',
    path: 'practice.bogus',
  }]);

  expect(JSON.stringify(deriveMechanicsManifest('e1-drill-yard'))).toBe(JSON.stringify(deriveMechanicsManifest('e1-drill-yard')));
});
