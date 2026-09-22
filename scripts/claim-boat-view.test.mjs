import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import { Group, Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';
const pending = [];
globalThis.__boatTestLoader = { load: (url, ready, progress, error) => pending.push({ url, ready, error }) };
const vite = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, plugins: [{ name: 'boat-test-loader', enforce: 'pre',
  resolveId(id, importer) {
    if (id === '../assets/AssetLoading' && /\/(ClaimBoatView|FlotillaView)\.ts$/.test(importer ?? '')) return '\0boat-test-loader';
    if (id === './Turret' && importer?.endsWith('/DeepwaterArsenal.ts')) return '\0boat-test-turret';
  },
  load(id) {
    if (id === '\0boat-test-loader') return 'export const trackedGltfLoader = () => globalThis.__boatTestLoader';
    if (id === '\0boat-test-turret') return 'export const TURRET_SILHOUETTE_HEIGHT = 1.1';
  },
}], server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' });
after(async () => { await vite.close(); delete globalThis.__boatTestLoader; });
const { ClaimBoatView } = await vite.ssrLoadModule('/src/world/ClaimBoatView.ts');
const { ClaimBoat, CLAIM_BOAT_DECK_BOUNDS } = await vite.ssrLoadModule('/src/entities/ClaimBoat.ts');
const { default: bodyContract } = await vite.ssrLoadModule('/assets/pilots/claim-boat-3d/claim-boat-contract.json');
assert.deepEqual(bodyContract.deckBounds, CLAIM_BOAT_DECK_BOUNDS, 'render body must fit the simulation deck bounds');
const { DeepwaterArsenal } = await vite.ssrLoadModule('/src/entities/DeepwaterArsenal.ts');

test('boat follows its owner and reset, projects only a loaded deck, and disposes late loads', () => {
  const config = { id: 'claim-boat', initialAnchorId: 'lagoon', anchors: [{ id: 'lagoon', x: 0, z: 30 }, { id: 'open', x: -24, z: 12 }], pads: [{ id: 'bow', x: 0, z: -3 }] };
  let owner = new ClaimBoat(config);
  const canvas = { dataset: {} }, view = new ClaimBoatView(canvas, () => owner);
  assert.equal(view.deckYAt(0, 30), undefined);
  const scene = new Group(), mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  scene.add(mesh); let disposed = 0; mesh.geometry.addEventListener('dispose', () => disposed++);
  pending.shift().ready({ scene });
  assert.equal(canvas.dataset.claimBoatBody, 'ready'); assert.equal(view.deckYAt(0, 30), .8);
  assert.equal(view.deckYAt(10, 30), undefined);
  owner.placeBuilding('bow', 'turret'); owner.reanchor('open'); const before = owner.snapshot(); view.update();
  assert.equal(view.deckYAt(-24, 12), .8); assert.equal(view.deckYAt(0, 30), undefined);
  assert.deepEqual(owner.snapshot(), before);
  owner = new ClaimBoat(config); view.update(); assert.equal(view.deckYAt(0, 30), .8);
  view.dispose(); assert.equal(disposed, 1); assert.equal(view.deckYAt(0, 30), undefined);
  const late = new ClaimBoatView(canvas, () => owner); late.dispose();
  const callback = pending.shift(); callback.ready({ scene }); callback.error(new Error('late'));
  assert.equal(disposed, 2); assert.equal(late.group.children.length, 0); assert.equal(canvas.dataset.claimBoatBody, 'disposed');
});

test('rendered deck equipment leaves every combat origin and owner position unchanged', () => {
  const shooters = [], hero = new Vector3(0, -4, 30);
  const arsenal = new DeepwaterArsenal({ registerShooter: s => { shooters.push(s); return () => {}; } },
    () => hero, () => [{ buildingId: 'turret', x: 0, z: 27 }, { buildingId: 'sentry_beacon', x: -3, z: 31 }],
    () => true, () => true, () => false, () => false);
  arsenal.update(1);
  const before = shooters.map(s => s.getPos().toArray());
  arsenal.updatePresentation(() => .8, new Vector3(0, .8, 30));
  assert.deepEqual(shooters.map(s => s.getPos().toArray()), before);
  assert.deepEqual(arsenal.group.children.map(mesh => mesh.position.y), [.8, .8, .8]);
  arsenal.update(2); assert.deepEqual(shooters.map(s => s.getPos().toArray()), before);
  arsenal.dispose();
});

test('three Flotilla bodies follow movement, loss and reset without changing the hull owner', async () => {
  const { FlotillaView } = await vite.ssrLoadModule('/src/world/FlotillaView.ts');
  const { FlotillaHullSystem } = await vite.ssrLoadModule('/src/systems/FlotillaHullSystem.ts');
  const { default: contracts } = await vite.ssrLoadModule('/assets/contracts/epoch-5-deepwater/contracts.json');
  const owner = FlotillaHullSystem.create(contracts.contracts.find(c => c.id === 'e5-flotilla'));
  const canvas = { dataset: {} }, view = new FlotillaView(canvas, owner);
  assert.equal(view.deckYAt(-26, 21), undefined);
  let disposed = 0;
  const callbacks = pending.splice(0);
  assert.equal(callbacks.length, 3);
  for (const [i, callback] of callbacks.entries()) {
    assert.ok(callback.url.endsWith(owner.diagnostics.hulls[i].id + '.glb'));
    const scene = new Group(), mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    mesh.geometry.addEventListener('dispose', () => disposed++); scene.add(mesh); callback.ready({scene});
  }
  assert.equal(canvas.dataset.flotillaBodies, 'ready');
  const before = owner.diagnostics;
  for (const h of before.hulls) {
    assert.equal(view.deckYAt(h.x, h.z), .8);
    assert.equal(view.deckYAt(h.x + 4.5, h.z), undefined, 'outside the modeled deck but inside the gameplay disc');
  }
  owner.reanchor('kitchen-scow'); const moved = owner.diagnostics; view.update();
  assert.deepEqual(owner.diagnostics, moved);
  assert.equal(view.deckYAt(moved.hulls[0].x, moved.hulls[0].z), .8);
  assert.equal(view.deckYAt(before.hulls[0].x, before.hulls[0].z), undefined);
  owner.advance(1, [{id:1,isAlive:true,position:moved.hulls[0],hitRadius:.1,contactDamage:100}]);
  view.update(); assert.equal(view.group.children[0].visible, false);
  assert.equal(view.deckYAt(moved.hulls[0].x, moved.hulls[0].z), undefined);
  owner.reset(); view.update(); assert.equal(view.group.children[0].visible, true);
  assert.equal(view.deckYAt(-26,21), .8); assert.deepEqual(owner.diagnostics, before);
  view.dispose(); assert.equal(disposed, 3); assert.equal(view.deckYAt(-26,21), undefined);
  const late = new FlotillaView(canvas, owner); late.dispose();
  for (const callback of pending.splice(0)) { callback.ready({scene:new Group()}); callback.error(); }
  assert.equal(late.group.children.length, 0); assert.equal(canvas.dataset.flotillaBodies, 'disposed');
});

test('Regatta publishes exact terminal seconds, including the finish row, and resets them', async () => {
  const { RegattaRaceSystem } = await vite.ssrLoadModule('/src/systems/RegattaRaceSystem.ts');
  const { buildView } = await vite.ssrLoadModule('/src/agent/View.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const race = RegattaRaceSystem.create(loadContract('e5-regatta'));
  const boat = { id: 'claim-boat', x: -49, z: 0, heading: 0, speed: 0, aboard: true };
  const read = (canStepAshore = false, overrides = {}) => buildView({ diagnostics: () => ({
    regatta: { declared: true, boat, canStepAshore, race: { ...race.diagnostics, ...overrides } },
  }) }).now.regatta;
  assert.equal(read().finishedAt, null);
  assert.equal(read().forfeitedAt, null);
  assert.equal(read().canStepAshore, false);
  assert.equal(read(true).canStepAshore, true);
  let at = 0;
  while (race.diagnostics.nextGate) race.advance(at += 1.234, 0, race.diagnostics.nextGate);
  const finish = read();
  assert.equal(finish.buoysPassed.length, 6);
  assert.equal(finish.buoysPassed.at(-1).id, 'claim-boat');
  assert.equal(finish.finishedAt, Math.round(at * 100) / 100);
  assert.equal(finish.finishedAt, finish.buoysPassed.at(-1).atSeconds);
  assert.equal(finish.forfeitedAt, null);
  race.advance(99, 0, null);
  assert.deepEqual(read(), finish, 'terminal reads do not append duplicate finishes');
  race.reset();
  race.advance(0, 0, race.diagnostics.nextGate);
  race.advance(3.456, 0, null);
  assert.equal(read().finishedAt, null);
  assert.equal(read().forfeitedAt, 3.46);
  assert.equal(read().state, 'forfeited');
  assert.equal(read().buoysPassed.length, 1);
  assert.equal(read(false, { finishedAt: Infinity, forfeitedAt: NaN }).finishedAt, null);
  assert.equal(read(false, { finishedAt: Infinity, forfeitedAt: NaN }).forfeitedAt, null);
  race.reset();
  assert.equal(read().finishedAt, null);
  assert.equal(read().forfeitedAt, null);
  assert.deepEqual(read().buoysPassed, []);
});

test('the shared shore query samples all 16 headings, reads the walkable port, and changes no state', async () => {
  const { DeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { CLAIM_BOAT_GANGWAY_REACH } = await vite.ssrLoadModule('/src/entities/ClaimBoat.ts');
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const tile = new DeepwaterClaimTile(loadContract('e5-regatta'));
  const rule = deriveMechanicsManifest('e5-regatta').rules.find(({ id }) => id === 'regatta_boat');
  assert.deepEqual(rule.data.waterBounds, tile.boat.water);
  assert.deepEqual(rule.data.waterBounds, { minX: -49.75, maxX: 49.75, minZ: -49.75, maxZ: 49.75 });
  assert.equal(rule.data.gangwayReach, CLAIM_BOAT_GANGWAY_REACH);
  assert.match(rule.data.standable, /STANDABLE ground: walkable terrain off the deck/);
  const before = tile.boat.snapshot();
  // Record headings before the geometry filter so the query cannot silently reduce its resolution.
  const contains = tile.boat.contains.bind(tile.boat), points = [];
  tile.boat.contains = (x, z) => { points.push({ x, z }); return contains(x, z); };
  assert.equal(tile.canStepAshore({ walkable: () => false }), false);
  assert.equal(points.length, 16);
  for (const point of points) assert.ok(Math.abs(Math.hypot(point.x + 49, point.z) - CLAIM_BOAT_GANGWAY_REACH) < 1e-9);
  const lastSide = points[14];
  // At the initial left rim only western off-deck probes can disembark.
  assert.equal(tile.canStepAshore({ walkable: (x, z) => x < -49.75 && z < 0 }), true);
  assert.equal(tile.canStepAshore({ walkable: (x, z) => x === lastSide.x && z === lastSide.z }), false);
  assert.deepEqual(tile.boat.snapshot(), before);
});

test('live Regatta shore agrees with stepAshore; Deepwater has a positive shore geometry control', async () => {
  const beforeLocation = globalThis.location, beforeWindow = globalThis.window;
  try {
    for (const contractId of ['e5-regatta', 'e5-deepwater-claim']) {
      const location = new URL(`http://shore.test/?debug&contract=${contractId}`);
      Object.assign(globalThis, { location, window: { location } });
      const loader = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
      try {
        const { DeepwaterClaimTile } = await loader.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
        const { loadContract } = await loader.ssrLoadModule('/src/meta/ContractFamilies.ts');
        const Terrain = await loader.ssrLoadModule('/src/world/Terrain.ts');
        const tile = new DeepwaterClaimTile(loadContract(contractId));
        const ports = { walkable: (x, z) => Terrain.sample(x, z).walkable };
        if (contractId === 'e5-regatta') {
          tile.boat.board(-40, 0); tile.boat.board(-49, 6);
          assert.equal(tile.boat.stepAshore({ x: -55, z: 0 }, ports.walkable), true);
          assert.equal(ports.walkable(-50.41, 0), false, 'heat 15 measured this point, not the whole rim');
          assert.equal(tile.canStepAshore(ports), true);
          tile.boat.hullX = 0;
          assert.equal(tile.canStepAshore(ports), false, 'walkable swimming water is not a shore');
        } else {
          assert.equal(tile.canStepAshore(ports), false, 'the lagoon anchor is out of shore reach');
          tile.boat.hullX = 49.75; // geometric fixture on actual terrain; the home boat only moors
          assert.equal(tile.canStepAshore(ports), true);
        }
      } finally { await loader.close(); }
    }
  } finally { Object.assign(globalThis, { location: beforeLocation, window: beforeWindow }); }
});
