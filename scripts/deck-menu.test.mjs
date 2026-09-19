import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

test('player menu follows free live deck capacity, loss and reset while retaining land prices', async () => {
  // Exercise the real projection without constructing Game's WebGL scene.
  const source = await readFile(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const start = source.indexOf('  private syncUi(): void {');
  const end = source.indexOf('    this.uiSnapshot =', start);
  assert.ok(start >= 0 && end > start);
  const project = new Function(source.slice(source.indexOf('{', start) + 1, end) + '\nreturn buildables;');
  const menu = [{ id: 'turret', cost: 40, count: 0, maxCount: 8, canAfford: false }, { id: 'palisade', cost: 15, count: 1, maxCount: 12, canAfford: true, kitCredits: 2 }];
  const context = { buildSystem: { get buildableSnapshots() { return structuredClone(menu); } }, deepwaterClaim: null };
  assert.deepEqual(project.call(context), menu);
  const vite = await createServer({ configFile: false, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null } });
  try {
    const { DeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
    const { contracts } = JSON.parse(await readFile(new URL('../assets/contracts/epoch-5-deepwater/contracts.json', import.meta.url)));
    for (const contract of contracts) {
      const tile = new DeepwaterClaimTile(contract);context.deepwaterClaim = tile;
      const pads = tile.snapshot().boat.pads;
      assert.ok(project.call(context).every(b => b.cost === 0 && b.count === 0 && b.canAfford && b.maxCount === pads.length && b.kitCredits === undefined));
      for (const pad of pads.slice(1)) assert.equal(tile.placeBoatBuilding(pad.id, 'turret'), true);
      tile.loseHull(pads[0].id); // The only unused pad is no longer usable.
      let actual = project.call(context);
      assert.ok(actual.every(b => !b.canAfford && b.maxCount === pads.length - 1), contract.id);
      assert.equal(actual[0].count, pads.length - 1);
      assert.equal(tile.placeBoatBuilding(pads[0].id, 'turret'), false);
      tile.loseHull(pads[1].id); // Its workshop also leaves the live count.
      actual = project.call(context);
      assert.equal(actual[0].count, pads.length - 2);
      assert.ok(actual.every(b => !b.canAfford && b.maxCount === pads.length - 2));
      tile.reset();assert.ok(project.call(context).every(b => b.count === 0 && b.canAfford && b.maxCount === pads.length));
    }
    context.deepwaterClaim = null;assert.deepEqual(project.call(context), menu);
  } finally { await vite.close(); }
});
