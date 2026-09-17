import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

// Test every authored loop, including its closing segment, against the shared footprint.
//
// CENSUS WIDENED 2026-09-17 (owner ruling A13, tasks/town-cast-rulings-a13-a17.md): the plaza cast
// — the tavernkeeper, the storekeeper and now the Elder — do NOT carry a loop in townsfolk.ts. It
// is derived at placement time from their PLACED post, in TownScene's patrol-loop map, so reading
// TOWN_ACTORS alone left three of the town's six patrols unmeasured. The census now runs every
// actor through townActorPlazaPlacement, which is what the scene itself walks.
test('town patrols stay outside the pan monument', async () => {
  const vite = await createServer({root: process.cwd(), appType: 'custom', logLevel: 'silent', server: {middlewareMode: true}});
  try {
    const {TOWN_ACTORS} = await vite.ssrLoadModule('/src/town/townsfolk.ts');
    const {townPropRing} = await vite.ssrLoadModule('/src/town/townLayout.ts');
    const {townActorPlazaPlacement} = await vite.ssrLoadModule('/src/town/TownScene.ts');
    const {position: center, footprint} = townPropRing.panMonument;
    assert.equal(footprint.kind, 'radius');
    const placed = TOWN_ACTORS.map(actor => townActorPlazaPlacement(actor)).filter(actor => actor.loop);
    assert.ok(placed.some(actor => actor.id === 'elder'), 'the Elder patrols (A13) and is in the census');
    for (const actor of placed) {
      const points = actor.loop.points;
      for (let index = 0; index < points.length; index++) {
        const a = points[index], b = points[(index + 1) % points.length];
        const dx = b.x - a.x, dz = b.z - a.z, lengthSq = dx * dx + dz * dz;
        const t = lengthSq ? Math.max(0, Math.min(1, ((center.x - a.x) * dx + (center.z - a.z) * dz) / lengthSq)) : 0;
        const distance = Math.hypot(center.x - a.x - t * dx, center.z - a.z - t * dz);
        assert.ok(distance > footprint.radius, `${actor.id} segment ${index} enters the monument (${distance})`);
      }
    }
  } finally {
    await vite.close();
  }
});
