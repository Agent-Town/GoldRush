import { expect, test } from '@playwright/test';
import {
  contractDescriptorJson,
  listBoardContracts,
  loadContract,
  parseContractDescriptor,
  validateContractsBundle,
} from '../src/meta/ContractFamilies';

test('authored contract fleet boots valid and planted inert data fails closed', () => {
  expect(listBoardContracts()).toHaveLength(42);

  const template = loadContract('e7-echo-canyon');
  const planted = structuredClone(template);
  delete planted.tileParams.engineDependencies;

  expect(() => validateContractsBundle({
    version: 1,
    epochId: 'epoch-7-signal',
    contracts: [planted],
  }, 'epoch-7-signal')).toThrow(/engine_dependency_required/);

  const pressed = parseContractDescriptor(contractDescriptorJson(planted), template);
  expect(pressed.ok).toBe(false);
  if (!pressed.ok) expect(pressed.reasons.map((reason) => reason.path)).toContain('tileParams.engineDependencies');
});
