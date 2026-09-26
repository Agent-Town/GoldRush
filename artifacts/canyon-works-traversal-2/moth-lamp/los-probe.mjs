// canyon-works-traversal-2 (finding F-CW2-1): the sim's own terrainLineOfSight and highGroundRange from the authored turret sites to the gallery lamps, per t2 window (in memory only).
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const { createServer } = await import('/Users/robin/Claude/Projects/wt-cw2/node_modules/vite/dist/node/index.js');
const ROOT = '/Users/robin/Claude/Projects/wt-cw2';
const CONTRACTS_ABS = path.join(ROOT, 'assets/contracts/epoch-3-voltage/contracts.json');
const [s0, s1] = (process.argv[2] ?? '14:32').split(':').map(Number);
const doc = JSON.parse(readFileSync(CONTRACTS_ABS, 'utf8'));
const entry = doc.contracts.find((c) => c.id === 'e3-canyon-works');
entry.tileParams.elevation.analytic.t2RampStart = s0; entry.tileParams.elevation.analytic.t2RampEnd = s1;
const served = JSON.stringify(doc);
const location = new URL('http://los.local/'); location.searchParams.set('debug', ''); location.searchParams.set('contract', 'e3-canyon-works');
globalThis.location = location; globalThis.window = { location };
const quiet = console.log; console.log = console.info = console.debug = console.warn = () => undefined;
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true }, cacheDir: path.join(os.tmpdir(), 'cw2-slope-vite-cache'), optimizeDeps: { noDiscovery: true },
  plugins: [{ name: 'w', enforce: 'pre', load(id) { return id.split('?')[0] === CONTRACTS_ABS ? served : null; } }] });
const tile = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
console.log = quiet;
const pairs = JSON.parse(process.argv[3] ?? '[[18,22,32,32],[18,22,30,32],[-18,22,-32,32],[-18,22,-30,32],[18,22,28,28],[-18,22,-28,28]]');
for (const [ax, az, bx, bz] of pairs) {
  const clear = tile.terrainLineOfSight({ x: ax, z: az }, { x: bx, z: bz });
  const check = tile.simHeightDiagnostics().lastLos;
  console.log(`window ${s0}..${s1}: (${ax},${az}) h ${tile.simHeight(ax, az).toFixed(3)} range(16) ${tile.highGroundRange(16, ax, az).toFixed(3)} -> (${bx},${bz}) h ${tile.simHeight(bx, bz).toFixed(3)} dist ${Math.hypot(bx - ax, bz - az).toFixed(3)}: LOS ${clear ? 'CLEAR' : 'BLOCKED at ' + JSON.stringify(check.blockedAt)}`);
}
await vite.close();
