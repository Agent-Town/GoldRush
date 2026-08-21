import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('Canyon Works alone publishes its live connection objective', async () => {
  const location = new URL('http://canyon-connect-view.test/?debug');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const canyon = new HeadlessContractSim({ contractId: 'e3-canyon-works', seed: 'e3-canyon-works-01', admissionProbe: true });
    const ordinary = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'bench-001' });

    assert.deepEqual(Object.keys(canyon.currentTurn().view.now.canyonConnect).sort(),
      ['byWave', 'complete', 'failed', 'powered', 'required']);
    assert.equal(Object.hasOwn(ordinary.currentTurn().view.now, 'canyonConnect'), false);
  } finally {
    await vite.close();
  }
});
