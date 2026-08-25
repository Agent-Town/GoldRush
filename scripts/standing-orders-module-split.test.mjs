import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const STANDING_ORDERS = '/src/agent/StandingOrders.ts';

test('tape hash keeps the sim-owned standing-orders module across invalidation', async () => {
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const first = await vite.ssrLoadModule(STANDING_ORDERS);
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { agentOrdersEventLogHash } = await vite.ssrLoadModule('/src/game/RunTape.ts');
    const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e1-the-claim-01' });
    const emptyHash = agentOrdersEventLogHash({ log: [] });

    assert.deepEqual(sim.standingOrdersSnapshot().log, [], 'a bound executor with zero submissions is valid');
    assert.equal(agentOrdersEventLogHash(sim.standingOrdersSnapshot()), emptyHash);

    assert.equal(sim.submitOrders([{ verb: 'HOLD', pos: { x: 0, z: 12 } }]).outcome.ok, true);
    const liveHash = agentOrdersEventLogHash(sim.standingOrdersSnapshot());
    assert.notEqual(liveHash, emptyHash);

    const control = await vite.ssrLoadModule(STANDING_ORDERS);
    assert.equal(control, first, 'control reload keeps the bound module');
    assert.equal(agentOrdersEventLogHash(control.snapshotStandingOrders()), liveHash);

    const module = vite.moduleGraph.getModuleById(fileURLToPath(new URL('../src/agent/StandingOrders.ts', import.meta.url)));
    assert.ok(module, 'standing-orders module is present in Vite graph');
    vite.moduleGraph.invalidateModule(module);
    const split = await vite.ssrLoadModule(STANDING_ORDERS);
    assert.notEqual(split, first, 'invalidation creates the module split');
    assert.equal(agentOrdersEventLogHash(split.snapshotStandingOrders()), emptyHash);
    assert.equal(agentOrdersEventLogHash(sim.standingOrdersSnapshot()), liveHash, 'writer input stays on the sim-owned module');

    for (const path of ['gr-sim.mjs', 'assay-replay-agent.mjs']) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8');
      assert.match(source, /agentOrdersEventLogHash\(sim\.standingOrdersSnapshot\(\)\)/);
      assert.doesNotMatch(source, /ssrLoadModule\(['"]\/src\/agent\/StandingOrders\.ts['"]\)/);
    }
  } finally {
    await vite.close();
  }
});
