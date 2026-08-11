import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const readJson = (relative) => JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8'));
const benchSeeds = readJson('assets/contracts/bench-seeds.json');
const artifact = readJson('assets/contracts/null-floors.json');
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let supported;
try {
  const { supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  supported = new Set(supportedContractIds());
} finally {
  await vite.close();
}

test('null-floor artifact exactly covers every door-servable bench seed', () => {
  assert.equal(artifact.schema, 'goldrush.nullfloor.v1');
  assert.match(artifact.eraStamp, /^[0-9a-f]+$/, 'eraStamp must be lowercase hex');
  assert.equal(artifact.policy, 'idle');
  assert.equal(typeof artifact.floors, 'object');

  const contracts = Object.keys(benchSeeds).filter((contract) => supported.has(contract)).sort();
  assert.deepEqual(Object.keys(artifact.floors).sort(), contracts, 'floors must equal bench seeds intersected with supported contracts');

  for (const contract of contracts) {
    assert.deepEqual(Object.keys(artifact.floors[contract]).sort(), [...benchSeeds[contract]].sort(), `${contract} seed coverage drifted`);
    for (const seed of benchSeeds[contract]) {
      const entry = artifact.floors[contract][seed];
      assert.deepEqual(
        Object.keys(entry).sort(),
        ['secured', 'waves', 'timeMs', 'gold', 'kills', 'eventLogHash'].sort(),
        `${contract}/${seed} must carry exactly the six null-floor fields`,
      );
      assert.equal(typeof entry.secured, 'boolean', `${contract}/${seed} secured must be boolean`);
      for (const field of ['waves', 'timeMs', 'gold', 'kills']) {
        assert.equal(Number.isFinite(entry[field]), true, `${contract}/${seed} ${field} must be a finite number`);
      }
      assert.equal(typeof entry.eventLogHash, 'string', `${contract}/${seed} eventLogHash must be string`);
      assert.equal(entry.secured, false, `${contract}/${seed} idle-secured: law 2 needs a ruling before this row can land`);
    }
  }
});
