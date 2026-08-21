import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('terrain contract scope report matches a fresh SSR measurement', () => {
  const run = spawnSync(process.execPath, ['scripts/terrain-contract-scope.mjs', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});

test('Terrain still resolves DEFAULT_CONTRACT_ID under SSR', async () => {
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { activeContract, DEFAULT_CONTRACT_ID } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    assert.equal(activeContract().id, DEFAULT_CONTRACT_ID,
      'Terrain no longer resolves DEFAULT_CONTRACT_ID under SSR — the documented defect has moved; re-derive the scope report');
  } finally {
    await vite.close();
  }
});

test('the F-A10-1 Terrain consumption and override seams have not moved', () => {
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  const terrain = readFileSync(new URL('../src/world/Terrain.ts', import.meta.url), 'utf8');
  const message = 'the F-A10-1 premise has moved — re-derive before trusting this report';
  assert.ok(headless.includes("import * as Terrain from '../world/Terrain';"), message);
  assert.ok(terrain.includes('return editorPreviewContract ?? ACTIVE_CONTRACT;'), message);
});
