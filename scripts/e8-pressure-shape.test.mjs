import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('authored dome footprints govern breathing and breaches in both consumers', async () => {
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { loadContract, parseContractDescriptor } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { E8AtmosphereSystem, pressureZoneContains } = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const create = contract => contract.id === 'e8-mare-claim' ? E8AtmosphereSystem.create(contract) : E8SuitAirSystem.create(contract);
    for (const id of ['e8-mare-claim', 'e8-eclipse']) {
      const contract = loadContract(id);
      assert.equal(contract.twist.atmosphere.pressurisedZoneShape, 'ellipse');
      assert.equal(parseContractDescriptor(JSON.stringify(contract), contract).ok, true);
      const zones = contract.tileParams.buildZones.filter(z => contract.twist.atmosphere.pressurisedZoneIds.includes(z.id));
      for (const zone of zones) {
        const corner = { x: zone.maxX - .1, z: zone.maxZ - .1 };
        const center = { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 };
        const air = create(contract);
        air.update(1, corner, [{ isAlive: true, position: corner }], 1);
        assert.equal(air.diagnostics.suit.inDome, null, id + ' outside glass must consume suit air');
        assert.equal(air.diagnostics.suit.seconds, air.diagnostics.suit.capacity - 1);
        assert.equal(air.captureSuspend().domes?.find(d => d.id === zone.id)?.breached ?? air.captureSuspend().shelters?.find(d => d.id === zone.id)?.breached, false);
        air.update(1, center, [], 1);
        assert.equal(air.diagnostics.suit.inDome, zone.id);
        assert.equal(air.diagnostics.suit.seconds, air.diagnostics.suit.capacity);
        const resumed = create(contract);
        assert.equal(resumed.restoreSuspend(JSON.parse(JSON.stringify(air.captureSuspend()))), true);
        air.update(.5, corner, [], 1); resumed.update(.5, corner, [], 1);
        assert.deepEqual(resumed.captureSuspend(), air.captureSuspend());
        const oldShape = structuredClone(air.captureSuspend()); delete oldShape.pressureShape;
        const beforeRestore = resumed.captureSuspend();
        assert.equal(resumed.restoreSuspend(oldShape), false, 'rectangular-era saves cannot silently change their pressure boundary');
        assert.deepEqual(resumed.captureSuspend(), beforeRestore);
        const legacy = structuredClone(contract); delete legacy.twist.atmosphere.pressurisedZoneShape;
        assert.equal(parseContractDescriptor(JSON.stringify(legacy), contract).ok, true, 'legacy descriptor omits the optional shape');
        const rectangular = create(legacy); rectangular.update(1, corner, [], 1);
        assert.equal(rectangular.diagnostics.suit.inDome, zone.id, 'omitted shape preserves rectangle behavior');
        const oldRect = structuredClone(rectangular.captureSuspend()); delete oldRect.pressureShape;
        assert.equal(rectangular.restoreSuspend(oldRect), true, 'legacy rectangular saves remain compatible');
        const breached = create(contract); breached.update(1, center, [{ isAlive: true, position: center }], 1);
        assert.equal((breached.captureSuspend().domes ?? breached.captureSuspend().shelters).find(d => d.id === zone.id).breached, true);
        for (let i = 0; i < 32; i++) {
          const angle = i / 32 * Math.PI * 2;
          for (const radius of [.999, 1.001]) {
            const point = { x: center.x + Math.cos(angle) * (zone.maxX - center.x) * radius, z: center.z + Math.sin(angle) * (zone.maxZ - center.z) * radius };
            assert.equal(pressureZoneContains(zone, point, 'ellipse'), radius < 1);
          }
        }
      }
      for (const malformed of ['circle', '', null, 1, {}]) {
        const bad = structuredClone(contract); bad.twist.atmosphere.pressurisedZoneShape = malformed;
        const result = parseContractDescriptor(JSON.stringify(bad), contract);
        assert.equal(result.ok, false, JSON.stringify(malformed));
        assert.ok(result.reasons.some(r => r.path === 'twist.atmosphere.pressurisedZoneShape'));
      }
    }
    for (const id of ['e8-far-side', 'e8-low-orbit']) {
      const contract = loadContract(id); assert.equal(contract.twist.atmosphere.pressurisedZoneShape, undefined);
      const explicit = structuredClone(contract); explicit.twist.atmosphere.pressurisedZoneShape = 'rect';
      assert.equal(parseContractDescriptor(JSON.stringify(explicit), contract).ok, true);
      const ellipse = structuredClone(contract); ellipse.twist.atmosphere.pressurisedZoneShape = 'ellipse';
      assert.equal(parseContractDescriptor(JSON.stringify(ellipse), contract).ok, true);
      const before = create(contract), after = create(explicit);
      for (const point of [{ x: 0, z: -36 }, { x: 0, z: 0 }, { x: 50, z: 50 }]) {
        before.update(1, point, [], 1); after.update(1, point, [], 1);
        assert.deepEqual(after.captureSuspend(), before.captureSuspend());
      }
    }
    assert.equal(pressureZoneContains({ minX: 0, maxX: 0, minZ: 0, maxZ: 1 }, { x: 0, z: .5 }, 'ellipse'), false);
  } finally { await vite.close(); }
});
