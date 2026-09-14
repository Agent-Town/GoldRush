import assert from 'node:assert/strict';
import test from 'node:test';
import {createServer} from 'vite';

// Test the authored loops, including their closing segment, against the shared footprint.
test('town patrols stay outside the pan monument', async () => {
  const vite = await createServer({root: process.cwd(), appType: 'custom', logLevel: 'silent', server: {middlewareMode: true}});
  try {
    const {TOWN_ACTORS} = await vite.ssrLoadModule('/src/town/townsfolk.ts');
    const {townPropRing} = await vite.ssrLoadModule('/src/town/townLayout.ts');
    const {position: center, footprint} = townPropRing.panMonument;
    assert.equal(footprint.kind, 'radius');
    for (const actor of TOWN_ACTORS.filter(actor => actor.loop)) {
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
