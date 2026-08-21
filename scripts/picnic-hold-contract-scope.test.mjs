import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { createServer } from 'vite';

test('Picnic hold is enabled only for e6-picnic across every epoch contract', async () => {
  const epochs = await readdir('assets/contracts', { withFileTypes: true });
  const contracts = [];
  for (const epoch of epochs.filter((entry) => entry.isDirectory())) {
    try {
      contracts.push(...JSON.parse(await readFile(`assets/contracts/${epoch.name}/contracts.json`, 'utf8')).contracts);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { PicnicHoldSystem } = await vite.ssrLoadModule('/src/systems/PicnicHoldSystem.ts');
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const enabled = contracts.filter((contract) => PicnicHoldSystem.isEnabled(contract)).map(({ id }) => id);
    assert.deepEqual(enabled, ['e6-picnic']);
    const picnicBundle = JSON.parse(await readFile('assets/contracts/epoch-6-atomic/contracts.json', 'utf8'));
    picnicBundle.contracts.find(({ id }) => id === 'e6-picnic').twist.picnicHold = 'true';
    assert.throws(() => validateContractsBundle(picnicBundle, 'epoch-6-atomic'), /twist\.picnicHold: field_type/);
  } finally {
    await vite.close();
  }
});
