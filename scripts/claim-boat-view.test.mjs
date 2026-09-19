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
