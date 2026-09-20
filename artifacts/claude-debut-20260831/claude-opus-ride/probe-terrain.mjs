// Terrain / manifest probe for the-claim. Loads the same modules gr-sim does.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', 'the-claim');
location.searchParams.set('seed', 'e1-the-claim-01');
globalThis.location = location;
globalThis.window = { location };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const out = [];
const say = (...a) => out.push(a.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' '));

try {
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const { activeContract } = await vite.ssrLoadModule('/src/contracts/index.ts').catch(() => ({}));
  say('bounds', Terrain.bounds);
  say('RIVER_MIN_Z', Terrain.RIVER_MIN_Z, 'RIVER_MAX_Z', Terrain.RIVER_MAX_Z, 'SHALLOWS', Terrain.SHALLOWS_WIDTH);
  say('FORD', Terrain.FORD_MIN_X, Terrain.FORD_MAX_X);
  say('nodeAnchors', Terrain.nodeAnchors);
  say('landmarkBlockers', Terrain.landmarkBlockers());
  say('spawnEdges', Terrain.spawnEdges());

  // buildable map around the claim
  const rows = [];
  for (let z = 24; z >= -24; z -= 1) {
    let row = String(z).padStart(4) + ' ';
    for (let x = -24; x <= 24; x += 1) {
      const s = Terrain.sample(x, z);
      row += Terrain.isBuildable(x, z) ? '.' : (s.zone === 'river' ? '~' : s.zone === 'ford' ? 'f' : s.zone === 'shallows' ? '-' : s.zone === 'out' ? 'X' : '?');
    }
    rows.push(row);
  }
  say('buildable map (x from -24..24, z from 24 down to -24); . buildable, ~river, f ford, - shallows, X out');
  for (const r of rows) out.push(r);
} catch (e) {
  say('ERR', String(e && e.stack || e));
}
await vite.close();
process.stdout.write(out.join('\n') + '\n');
