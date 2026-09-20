import { createServer } from 'vite';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush/.claude/worktrees/agent-a9e7d8321e70f7a1f';
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
const { WaterRegionTile } = await vite.ssrLoadModule('/src/world/WaterRegion.ts');
const c = loadContract('e5-stillwater');
const tile = new WaterRegionTile(c.tileParams.deepwater.waterTile);
const zones = c.tileParams.stillwater.quietZones;
const srcs = c.tileParams.stillwater.noiseSources;
const initial = c.tileParams.deepwater.claimBoat.anchors.find((a) => a.id === 'lagoon');
const inZone = (x, z) => zones.filter((q) => x >= q.minX && x <= q.maxX && z >= q.minZ && z <= q.maxZ).map((q) => q.id);

const candidates = [[0, 30], [-24, 12], [30, 26], [30, 30], [34, 34], [36, 30], [38, 38], [24, 12], [30, -20], [0, -20], [40, 40], [42, 30], [36, 40]];
for (const [x, z] of candidates) {
  const w = tile.sample(x, z, 'boat');
  const machines = srcs.map((s) => {
    const mx = x + (s.x - initial.x);
    const mz = z + (s.z - initial.z);
    return `${s.id}${inZone(mx, mz).length ? '=SILENT' : '=LOUD'}`;
  });
  console.log(`(${String(x).padStart(3)},${String(z).padStart(3)}) boat=${(w?.passable ? w.regionId : 'NO-BOAT').padEnd(16)}`
    + ` distHero=${Math.hypot(x - 0, z - 30).toFixed(1).padStart(5)} zone=[${inZone(x, z).join()}] ${machines.join(' ')}`);
}
await vite.close();
