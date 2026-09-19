import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
const location = new URL('http://gr-sim.local/?debug&contract=e8-mare-claim');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
after(() => vite.close());
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const { Vector2 } = await vite.ssrLoadModule('three');
const terrain = { bounds: { minX: -1000, maxX: 1000, minZ: -1000, maxZ: 1000 }, sample: () => ({ walkable: true, speedMul: 1 }) };
const baselineRelease = new Map();
for (const contractId of ['the-claim', 'e8-mare-claim', 'e8-eclipse', 'e8-far-side', 'e8-low-orbit']) for (const multiplier of [1, 1.12]) {
  test(`${contractId}: released movement settles after speed multiplier ${multiplier}`, () => {
    const sim = new HeadlessContractSim({ contractId, seed: 'upgraded-drift-release' });
    sim.hero.applyStats(0, multiplier); sim.hero.velocity.set(4, 0, 0);
    const idle = { move: new Vector2(), aim: new Vector2(), fire: false };
    for (let tick = 0; tick < 1800; tick++) sim.hero.update(1/30, sim.e8PhysicsIntents(idle), terrain);
    const speed = sim.hero.velocity.length();
    if (contractId === 'e8-low-orbit') assert.ok(speed < 4, 'authored free-fall drift must decay');
    else assert.ok(speed < 0.35, `released speed ${speed} prevents mining`);
    if (multiplier === 1) baselineRelease.set(contractId, speed);
    else assert.ok(Math.abs(speed - baselineRelease.get(contractId)) < 1e-6, 'speed perk must not feed back into released drift');
  });
}
