import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const baseline = JSON.parse(readFileSync(new URL('./door-admission-baseline.json', import.meta.url), 'utf8'));
const remedy = [
  'Door admission drifted from scripts/door-admission-baseline.json.',
  'If you are ADMITTING a contract, add it to the baseline and cite the measurement that admitted it.',
  'If you are REMOVING one, add a cited exemption.',
].join('\n');

test('derived door matches the fixed admission baseline', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    assert.deepEqual(supportedContractIds(), baseline, remedy);
  } finally {
    await vite.close();
  }
});
