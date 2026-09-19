import assert from 'node:assert/strict';
import { createServer } from 'vite';

globalThis.location = new URL('http://archive.test/?debug&contract=e10-archive-world');
globalThis.window = { location: globalThis.location };
const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' });
try {
  const { loadContract } = await server.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { HeadlessContractSim } = await server.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const contract = loadContract('e10-archive-world');
  const original = contract.twist;
  // Shortened clock fixture; production cadence stays unchanged.
  contract.twist = { ...original, archiveWorld: {
    squall: { calmSeconds: .1, telegraphSeconds: .1, squallSeconds: .1, recoverSeconds: .1 },
    lightHold: contract.tileParams.archiveWingZones.map((wing, i) => ({ wingId: wing.id, siteId: contract.tileParams.lightHoldSites[i].id })),
  } };
  try {
    for (const lit of [false, true]) {
      const sim = new HeadlessContractSim({ contractId: contract.id, seed: 'archive-wiring', admissionProbe: true });
      const site = contract.tileParams.lightHoldSites[0];
      // A fixture beacon in the real pool; no earned-gold or native-play claim.
      let slot = -1;
      if (lit) {
        outer: for (let dx = -3; dx <= 3; dx += 1) for (let dz = -3; dz <= 3; dz += 1) {
          if (Math.hypot(dx, dz) > site.radius) continue;
          if (sim.build.placeFree('sentry_beacon', { x: site.x + dx, z: site.z + dz }, 0)) {
            slot = sim.targeting.allBuildings.find(target => target.family === 'sentry_beacon' && target.active).index;
            break outer;
          }
        }
        assert.ok(slot >= 0, 'a beacon must fit legally inside the authored west light site');
      }
      assert.equal(sim.build.hasPoweredBeaconWithin(site.x, site.z, site.radius), lit);
      assert.equal(sim.archive.objectiveAllowsSecure, false);
      for (let tick = 0; tick < 10; tick += 1) sim.advanceOneTick();
      const view = sim.currentTurn().view.now.archive;
      assert.equal(view.objectiveAllowsSecure, lit);
      assert.deepEqual(view.restoredThisRun, lit ? ['west-stacks-wing'] : []);
      if (lit) {
        const beacon = sim.build.beacons.allPositions[slot];
        assert.equal(sim.build.hasPoweredBeaconWithin(beacon.x + site.radius + .01, beacon.z, site.radius), false);
        sim.build.suspendedBuildings.add(`sentry_beacon:${slot}`);
        assert.equal(sim.build.hasPoweredBeaconWithin(site.x, site.z, site.radius), false, 'suspended beacon supplies no light');
        sim.build.suspendedBuildings.clear();
        const powered = sim.build.isShooterPowered;
        sim.build.isShooterPowered = () => false;
        assert.equal(sim.build.hasPoweredBeaconWithin(site.x, site.z, site.radius), false, 'unpowered beacon supplies no light');
        sim.build.isShooterPowered = powered;
        const target = sim.targeting.allBuildings.find(target => target.family === 'sentry_beacon' && target.index === slot);
        sim.build.resolveBuildingDamage(target, 1e6);
        assert.equal(sim.build.beacons.isActive(slot), true, 'wreck keeps its render slot');
        assert.equal(sim.build.hasPoweredBeaconWithin(site.x, site.z, site.radius), false, 'destroyed beacon supplies no light');
      }
    }
    const allSites = new HeadlessContractSim({ contractId: contract.id, seed: 'archive-all-sites', admissionProbe: true });
    const placements = [];
    for (const site of contract.tileParams.lightHoldSites) {
      let placed = false;
      for (let dx = -3; dx <= 3 && !placed; dx += 1) for (let dz = -3; dz <= 3 && !placed; dz += 1) {
        if (Math.hypot(dx, dz) > site.radius) continue;
        const position = { x: site.x + dx, z: site.z + dz };
        placed = allSites.build.placeFree('sentry_beacon', position, 0);
        if (placed) placements.push({ siteId: site.id, ...position });
      }
      assert.ok(placed, `a legal powered beacon must fit at ${site.id}`);
      assert.equal(allSites.build.hasPoweredBeaconWithin(site.x, site.z, site.radius), true);
    }
    // Three actual scheduler cycles, all sites lit: one ordered wing per cycle.
    for (const expected of [1, 2, 3]) {
      for (let tick = 0; tick < (expected === 1 ? 10 : 12); tick += 1) allSites.advanceOneTick();
      assert.deepEqual(allSites.currentTurn().view.now.archive.restoredThisRun,
        contract.tileParams.archiveWingZones.slice(0, expected).map(wing => wing.id));
    }
    // Public rider tools address the currently installed sim; bank before constructing another fixture.
    assert.deepEqual(allSites.archiveStore.readSnapshot(contract.id).entries, [], 'holds do not persist before banking');
    assert.ok(allSites.runManager.secureCurrentRun(12), 'fixture opens the real secure-choice window');
    const bank = allSites.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    assert.ok(bank.outcome.ok, bank.outcome.message);
    for (let tick = 0; tick < 20 && !allSites.currentTurn().terminal; tick += 1) allSites.advanceOneTick();
    assert.deepEqual(allSites.archiveStore.readSnapshot(contract.id).entries.map(entry => entry.payload.wingId),
      contract.tileParams.archiveWingZones.map(wing => wing.id), 'public bank action commits restored wings');
    contract.twist.archiveWorld.squall.squallSeconds = 2;
    const contact = new HeadlessContractSim({ contractId: contract.id, seed: 'archive-contact', admissionProbe: true });
    const THREE = await import('three');
    const site = contract.tileParams.lightHoldSites[0];
    assert.ok(contact.build.placeFree('sentry_beacon', placements[0], 0));
    for (let tick = 0; tick < 7; tick += 1) contact.advanceOneTick();
    const mote = contact.enemies.spawn(new THREE.Vector3(site.x, 0, site.z), { variantId: 'static_mote', speedScale: 0 });
    assert.ok(mote && contact.archive.pressureTarget(mote));
    const hp = contact.hero.hp;
    contact.advanceOneTick();
    assert.equal(contact.hero.hp, hp, 'reaching a light site cannot damage a distant hero');
    mote.group.position.copy(contact.hero.group.position);
    contact.advanceOneTick();
    assert.ok(contact.hero.hp < hp, 'a light-seeking mote still damages an actor it touches');
    const updateEnemies = contact.enemies.update.bind(contact.enemies);
    const target = contact.targeting.allBuildings.find(target => target.family === 'sentry_beacon' && target.active);
    let sampledDuringDamage = false;
    contact.enemies.update = (...args) => {
      assert.ok(contact.archive.pressureTarget(mote), 'current tick keeps previous completed pressure sample');
      contact.build.resolveBuildingDamage(target, 1e6);
      assert.ok(contact.archive.pressureTarget(mote), 'damage does not mutate the sampled steering target mid-tick');
      sampledDuringDamage = true;
      return updateEnemies(...args);
    };
    contact.advanceOneTick();
    assert.ok(sampledDuringDamage);
    assert.equal(contact.archive.pressureTarget(mote), null, 'completed tick samples destruction and releases next-tick pressure');
    contact.enemies.update = updateEnemies;
    contact.advanceOneTick();
    assert.equal(contact.archive.pressureTarget(mote), null);
    console.log('Legal fixture beacon placements:', JSON.stringify(placements));
  } finally { contract.twist = original; }
  console.log('PASS: headless fixed-step clock, authored-site power input, hold and published objective state');
} finally { await server.close(); }
