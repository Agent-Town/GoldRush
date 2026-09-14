// F-CR0908-4: production weapon origins follow the building lifecycle without renumbering slots.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

test('later-era mounts stop on wreck or suspension and return on repair with stable relay IDs', async () => {
  globalThis.location = new URL('http://review-wrecked-turrets.test/?contract=e7-relay-valley');
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false } });
  const arsenals = [];
  try {
    const [{ HeadlessContractSim }, { E6ArsenalSystem }, { E7ArsenalSystem }, { E9ArsenalSystem },
      { E7SignalSystem }, { SignalSuppression }, { DecayScheduler }, { Balance }] = await Promise.all([
      '/src/sim/HeadlessContractSim.ts', '/src/systems/E6ArsenalSystem.ts', '/src/systems/E7ArsenalSystem.ts',
      '/src/systems/E9ArsenalSystem.ts', '/src/systems/E7SignalSystem.ts', '/src/systems/SignalSuppression.ts',
      '/src/systems/DecaySystem.ts', '/src/game/Balance.ts',
    ].map((path) => vite.ssrLoadModule(path)));
    const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'review-wrecked-turrets' });
    const build = sim.build;
    const positions = [{ x: 4, z: 4 }, { x: 7, z: 4 }, { x: 10, z: 4 }];
    for (const [index, position] of positions.entries()) {
      assert.equal(build.restoreBuilding({ id: 'turret', index, position, tier: 1, hp: 50, maxHp: 50,
        buildCost: 20, wrecked: false, repairProgress: 0, rotationSteps: 0, sluice: null }), true);
    }
    assert.equal(sim.economy.apply({ id: 'repair-funds', at: 0, type: 'gold_granted', source: 'debug', amount: 100 }).ok, true);

    // Evaluate Game's actual callbacks; this catches a disconnected fix at the composition site.
    const gameSource = ts.createSourceFile('Game.ts', readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true);
    const constructions = new Map();
    function visit(node) {
      if (ts.isNewExpression(node)) constructions.set(node.expression.getText(gameSource), node);
      ts.forEachChild(node, visit);
    }
    visit(gameSource);
    let multiplayer = false;
    let research = true;
    const game = { buildSystem: build, activeEpoch: { order: 9 }, primaryActor: sim.hero,
      multiplayerActive: () => multiplayer, heroWeaponsEnabledFor: () => true, researchState: {} };
    const callback = (name, index) => new Function('Balance', 'hasResearchNode',
      `return (${constructions.get(name).arguments[index].getText(gameSource)})`).call(game, Balance, () => research);
    const e6 = new E6ArsenalSystem(sim.combat, sim.events, new DecayScheduler(sim.events), sim.enemies,
      () => sim.hero.group.position, callback('E6ArsenalSystem', 5), callback('E6ArsenalSystem', 6), callback('E6ArsenalSystem', 7));
    const e9 = new E9ArsenalSystem(sim.combat, sim.events, sim.enemies, () => sim.hero.group.position,
      callback('E9ArsenalSystem', 4), callback('E9ArsenalSystem', 5), callback('E9ArsenalSystem', 6));
    let linked;
    const e7 = new E7ArsenalSystem(sim.combat, sim.events, () => sim.hero.group.position, () => null,
      callback('E7ArsenalSystem', 4), callback('E7ArsenalSystem', 5), (id) => linked?.has(id));
    arsenals.push(e6, e7, e9);
    e9.charge = Balance.e9Arsenal.weather.chargeCapacity;
    e7.update(0);
    const mount = (prefix, index) => sim.combat.rigs.find(({ handle }) => handle.resumeKey === `${prefix}:${index}`).handle;
    const prefixes = ['atomic:sunline-mount', 'e7:beam-relay', 'redfields:storm-lance'];
    const mounts = prefixes.map((prefix) => mount(prefix, 0));
    const assertEnabled = (handles, expected, reason) => {
      for (const handle of handles) assert.equal(handle.enabled(), expected, `${handle.resumeKey}: ${reason}`);
    };
    assertEnabled(mounts, true, 'standing solo researched turret');

    multiplayer = true;
    assertEnabled(mounts, false, 'multiplayer gate');
    multiplayer = false;
    research = false;
    assertEnabled([mounts[0], mounts[2]], false, 'research gate');
    research = true;
    game.activeEpoch.order = 5;
    assertEnabled(mounts, false, 'epoch gate');
    game.activeEpoch.order = 9;
    assertEnabled(mounts, true, 'positive gates restored');
    assert.ok(sim.enemies.spawn(sim.hero.group.position.clone().set(6, 0, 6)));
    const fireOnce = () => {
      sim.projectiles.recycleAll();
      sim.blastCharges.recycleAll();
      e9.charge = Balance.e9Arsenal.weather.chargeCapacity;
      for (const state of sim.combat.rigs) state.timer = 0;
      // Zero elapsed time lets real CombatSystem emit volleys without integrating their hits.
      sim.combat.update(0, 1);
      return new Set(sim.projectiles.captureSuspend().map(({ shooterKey }) => shooterKey));
    };
    const assertFires = (expected) => {
      const fired = fireOnce();
      for (const handle of mounts) assert.equal(fired.has(handle.resumeKey), expected, `${handle.resumeKey}: actual projectile emission`);
    };
    assertFires(true);

    // Real CombatSystem dispatch reaches BuildSystem's wreck/teardown, retaining the ruin slot.
    const target = build.buildingTarget('turret', 0);
    sim.combat.damageBuilding(target, target.hp);
    assert.equal(target.active, false);
    assert.equal(build.remainingHp('turret', 0), 0);
    assert.equal(build.turrets.isActive(0), true);
    assert.equal(build.diagnostics.turretPositions.length, 3, 'ruins still reserve placement');
    assertEnabled(mounts, false, 'wreck disables even before the next arsenal update');
    assertFires(false);
    e7.update(1);
    assert.equal(e7.diagnostics.activeRelayTurrets, 2);
    const surviving = prefixes.map((prefix) => mount(prefix, 1));
    assertEnabled(surviving, true, 'later pool slot still operational');
    for (const handle of surviving) assert.deepEqual({ x: handle.getPos().x, z: handle.getPos().z }, positions[1], 'slot 1 never becomes slot 2');

    const relayNodes = callback('E7SignalSystem', 1);
    assert.deepEqual(relayNodes().filter(({ id }) => id.startsWith('turret-')).map(({ id }) => id), ['turret-1', 'turret-2']);
    // Run the real signal graph without constructing its DOM-only jack board.
    const signal = Object.create(E7SignalSystem.prototype);
    signal.suppression = SignalSuppression.none();
    signal.lineOfSight = () => true;
    const graph = signal.graphFor(relayNodes());
    linked = new Set(graph.links.flatMap(({ from, to }) => [from, to]));
    assert.equal(linked.has('turret-0'), false);
    assert.equal(mount('e7:beam-relay', 1).enabled(), true, 'authoritative signal uses stable pool IDs');
    linked.add('turret-0');
    assert.equal(mounts[1].enabled(), false, 'stale signal graph cannot power a wreck');

    const repair = build.repairBuilding('turret', 0, 2, target.position);
    assert.ok(repair);
    assert.equal(repair.hp, repair.maxHp);
    assert.equal(target.active, true);
    e7.update(2);
    assertEnabled(mounts, true, 'real Economy-funded repair restores all mounts');
    assertFires(true);
    assert.deepEqual(relayNodes().filter(({ id }) => id.startsWith('turret-')).map(({ id }) => id), ['turret-0', 'turret-1', 'turret-2']);

    build.setBuildingSuspended(target, true);
    assertEnabled(mounts, false, 'lifted turret');
    e7.update(3);
    assert.equal(e7.diagnostics.activeRelayTurrets, 2);
    build.setBuildingSuspended(target, false);
    e7.update(4);
    assertEnabled(mounts, true, 'grounded turret');
    build.hp.turret[0] = 0;
    assertEnabled(mounts, false, 'zero HP is unavailable even without a wreck flag');
    build.hp.turret[0] = repair.maxHp;
    assertEnabled(prefixes.map((prefix) => mount(prefix, 3)), false, 'empty pool slot');
    linked = undefined;
    build.setBuildingSuspended(target, true);
    build.setBuildingSuspended(build.buildingTarget('turret', 2), true);
    e7.update(5);
    assert.equal(mount('e7:beam-relay', 1).enabled(), false, 'one surviving turret has no fallback relay partner');
  } finally {
    for (const arsenal of arsenals) arsenal.dispose();
    await vite.close();
  }
});
