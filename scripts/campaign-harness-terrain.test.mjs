import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

async function terrainDimensions(url) {
  globalThis.location = new URL(url);
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { CLAIM_WIDTH, CLAIM_HEIGHT } = await vite.ssrLoadModule('/src/world/Terrain.ts');
    return [CLAIM_WIDTH, CLAIM_HEIGHT];
  } finally {
    await vite.close();
  }
}

test('campaign harness URL binds Terrain to its selected contract', async () => {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
  try {
    const fallback = await terrainDimensions('http://gr-sim-campaign.local/?debug');
    const canyon = await terrainDimensions('http://gr-sim-campaign.local/?debug&contract=e3-canyon-works');
    assert.deepEqual(fallback, [64, 64]);
    assert.deepEqual(canyon, [96, 112]);
    assert.notDeepEqual(canyon, fallback);
  } finally {
    if (previousLocation) Object.defineProperty(globalThis, 'location', previousLocation);
    else delete globalThis.location;
  }
});
