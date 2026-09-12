import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('shipped Fairground crowd consumer loads without a missing dependency declaration', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { loadContract, parseContractDescriptor, contractDescriptorJson } = await server.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const fairground = loadContract('e3-fairground');
    assert.equal(fairground.tileParams.engineDependencies?.length ?? 0, 0);
    const parsed = parseContractDescriptor(contractDescriptorJson(fairground), fairground);
    assert.equal(parsed.ok, true, JSON.stringify(parsed));
    const { CrowdFlockSystem } = await server.ssrLoadModule('/src/systems/CrowdFlockSystem.ts');
    const crowds = CrowdFlockSystem.create(fairground);
    assert.equal(crowds.diagnostics.count, 3);
    assert.equal(crowds.allCrossed, false);
  } finally {
    await server.close();
  }
});
