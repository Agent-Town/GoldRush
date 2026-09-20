import { test } from '@playwright/test';
import { listContracts } from '../src/meta/ContractFamilies';
test('probe templates', () => {
  for (const [i, c] of listContracts('epoch-1-frontier').entries()) {
    console.log(i, c.id, 'buildZones=' + (c.tileParams.buildZones?.length ?? 'undefined'));
  }
});
