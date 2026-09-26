// canyon-works-traversal-2 (finding F-CW2-4): the visible t2 face (the mounted GLB lattice, read-only, with canyon-works-traversal-1's reader) against the sim height, per window.
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const { createServer } = await import('/Users/robin/Claude/Projects/wt-cw2/node_modules/vite/dist/node/index.js');
const ROOT = '/Users/robin/Claude/Projects/wt-cw2';
const CONTRACTS_ABS = path.join(ROOT, 'assets/contracts/epoch-3-voltage/contracts.json');
const GLB = path.join(ROOT, 'assets/pilots/map-rebuild-spike/canyon-works-terrain.glb');
function loadMesh() {
  const b = readFileSync(GLB);
  const jsonLength = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLength).toString('utf8'));
  const binStart = 20 + jsonLength + 8;
  const prim = json.meshes[0].primitives[0];
  const posAcc = json.accessors[prim.attributes.POSITION];
  const posView = json.bufferViews[posAcc.bufferView];
  const pos = new Float32Array(b.buffer.slice(b.byteOffset + binStart + (posView.byteOffset ?? 0) + (posAcc.byteOffset ?? 0), b.byteOffset + binStart + (posView.byteOffset ?? 0) + (posAcc.byteOffset ?? 0) + posAcc.count * 12));
  const idxAcc = json.accessors[prim.indices];
  const idxView = json.bufferViews[idxAcc.bufferView];
  const idxStart = b.byteOffset + binStart + (idxView.byteOffset ?? 0) + (idxAcc.byteOffset ?? 0);
  const Ctor = idxAcc.componentType === 5125 ? Uint32Array : Uint16Array;
  const idx = new Ctor(b.buffer.slice(idxStart, idxStart + idxAcc.count * Ctor.BYTES_PER_ELEMENT));
  const count = posAcc.count; const segments = Math.round(Math.sqrt(count)) - 1; const width = segments + 1;
  const [minX, , minZ] = posAcc.min; const [maxX, , maxZ] = posAcc.max;
  const stepX = (maxX - minX) / segments; const stepZ = (maxZ - minZ) / segments;
  const heights = new Float32Array(width * width); const cols = new Int32Array(count); const rows = new Int32Array(count);
  for (let v = 0; v < count; v += 1) { const c = Math.round((pos[v * 3] - minX) / stepX); const r = Math.round((pos[v * 3 + 2] - minZ) / stepZ); heights[r * width + c] = pos[v * 3 + 1]; cols[v] = c; rows[v] = r; }
  const diagonals = new Uint8Array(segments * segments);
  for (let t = 0; t < idx.length / 3; t += 1) { const a = idx[t * 3], bb = idx[t * 3 + 1], c = idx[t * 3 + 2]; const col = Math.min(cols[a], cols[bb], cols[c]); const row = Math.min(rows[a], rows[bb], rows[c]); const mask = (1 << ((rows[a] - row) * 2 + cols[a] - col)) | (1 << ((rows[bb] - row) * 2 + cols[bb] - col)) | (1 << ((rows[c] - row) * 2 + cols[c] - col)); diagonals[row * segments + col] = mask === 0b1011 || mask === 0b1101 ? 0 : 1; }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)); const lastCell = segments - 1;
  return { heightAt(x, z) { const gx = clamp((x - minX) / stepX, 0, segments); const gz = clamp((z - minZ) / stepZ, 0, segments); const x0 = Math.min(Math.floor(gx), lastCell); const z0 = Math.min(Math.floor(gz), lastCell); const x1 = Math.min(x0 + 1, segments); const z1 = Math.min(z0 + 1, segments); const fx = gx - x0; const fz = gz - z0; const low = heights[z0 * width + x0]; const east = heights[z0 * width + x1]; const south = heights[z1 * width + x0]; const high = heights[z1 * width + x1]; if (diagonals[z0 * segments + x0] === 0) return fz <= fx ? low + (east - low) * fx + (high - east) * fz : low + (high - south) * fx + (south - low) * fz; return fx + fz <= 1 ? low + (east - low) * fx + (south - low) * fz : high + (high - south) * (fx - 1) + (high - east) * (fz - 1); } };
}
const mesh = loadMesh();
const out = {};
for (const w of ['18:28', '14:32']) {
  const [s0, s1] = w.split(':').map(Number);
  const doc = JSON.parse(readFileSync(CONTRACTS_ABS, 'utf8'));
  const entry = doc.contracts.find((c) => c.id === 'e3-canyon-works');
  entry.tileParams.elevation.analytic.t2RampStart = s0; entry.tileParams.elevation.analytic.t2RampEnd = s1;
  const served = JSON.stringify(doc);
  const location = new URL('http://glb.local/'); location.searchParams.set('debug', ''); location.searchParams.set('contract', 'e3-canyon-works');
  globalThis.location = location; globalThis.window = { location };
  const quiet = console.log; console.log = console.info = console.debug = console.warn = () => undefined;
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true }, cacheDir: path.join(os.tmpdir(), 'cw2-slope-vite-cache'), optimizeDeps: { noDiscovery: true }, plugins: [{ name: 'w', enforce: 'pre', load(id) { return id.split('?')[0] === CONTRACTS_ABS ? served : null; } }] });
  const tile = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
  console.log = quiet;
  for (const x of [-28, -20, 20, 28]) {
    let maxAbs = 0, at = null; const rows = [];
    for (let z = 10; z <= 36; z += 1) { const m = mesh.heightAt(x, z), s = tile.simHeight(x, z); rows.push(`${z}:${m.toFixed(2)}/${s.toFixed(2)}`); if (Math.abs(s - m) > maxAbs) { maxAbs = Math.abs(s - m); at = z; } }
    console.log(`window ${w} x=${x}: max |sim - visible| ${maxAbs.toFixed(3)} m at z ${at}; z:visible/sim ${rows.join(' ')}`);
  }
  await vite.close();
}
