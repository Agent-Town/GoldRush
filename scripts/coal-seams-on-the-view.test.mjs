import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

async function coalSeams(contractId, seed, options = { admissionProbe: true }) {
  const location = new URL(`http://coal-seams-on-the-view.test/?debug&contract=${contractId}&seed=${seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    return new HeadlessContractSim({ contractId, seed, ...options }).currentTurn().view.stablePrefix.map.coalSeams;
  } finally {
    await vite.close();
  }
}

test('the agent view publishes declared pressure-contract coal seams only', async () => {
  assert.deepEqual(await coalSeams('e2-hill-mine', 'e2-hill-mine-01'), [
    { id: 'coal-seam-1', x: -12, z: 39 },
    { id: 'coal-seam-2', x: -5, z: 43 },
    { id: 'coal-seam-3', x: 3, z: 39 },
  ]);
  assert.deepEqual(await coalSeams('e2-hill-mine', 'e2-hill-mine-01', {}), [
    { id: 'coal-seam-1', x: -12, z: 39 },
    { id: 'coal-seam-2', x: -5, z: 43 },
    { id: 'coal-seam-3', x: 3, z: 39 },
  ]);
  assert.deepEqual(await coalSeams('e2-trestle', 'e2-trestle-01'), [
    { id: 'coal-seam-1', x: -16, z: -20 },
    { id: 'coal-seam-2', x: -20, z: -16 },
    { id: 'coal-seam-3', x: -12, z: -24 },
  ]);
  assert.deepEqual(await coalSeams('e1-dry-gulch', 'bench-001'), []);
});
