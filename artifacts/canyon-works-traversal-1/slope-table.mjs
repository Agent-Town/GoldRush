#!/usr/bin/env node
// canyon-works-traversal-1, item 1: the Canyon Works bank measured with the sim's own code.
//
// Usage (from the repo root):
//   node artifacts/canyon-works-traversal-1/slope-table.mjs [--rev <git-rev>] [--what-if k=v,k=v] [--json <out.json>]
//
// It loads src/sim/TileHeight.ts, src/world/Terrain.ts, src/game/Balance.ts and src/meta/ContractFamilies.ts
// through vite's SSR loader exactly as scripts/gr-sim.mjs does (globalThis.location carries
// ?debug&contract=e3-canyon-works), so simHeight / simSlope / isTraversable / Terrain.sample read the
// contract the way the running sim does. Nothing here re-implements the slope rule.
//   --rev <rev>      serve assets/contracts/epoch-3-voltage/contracts.json from that git revision (the
//                    "before" table) through a vite load hook; the working tree is not touched.
//   --what-if k=v    patch keys of the e3-canyon-works elevation.analytic block in memory only (a
//                    proposal probe for a finding; never written anywhere).
//   --points <file>  instead of the tables: read a boards JSON ({ samples: [{ x, z, ... }] }) and
//                    print, for each sample, the sim height and the visible (GLB) height there.
// The visible bank is read from the mounted terrain GLB lattice (read-only) and sampled with the same
// triangle-plane interpolation as src/world/Terrain3dClaimPilot.ts bakeHeightGrid.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT_ID = 'e3-canyon-works';
const CONTRACTS_REL = 'assets/contracts/epoch-3-voltage/contracts.json';
const CONTRACTS_ABS = path.join(ROOT, CONTRACTS_REL);
const GLB = path.join(ROOT, 'assets/pilots/map-rebuild-spike/canyon-works-terrain.glb');
const XS = [0, -24, 24, -44, 44];

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const rev = opt('--rev');
const whatIf = opt('--what-if');
const jsonOut = opt('--json');
const pointsIn = opt('--points');

let servedText = null;
let source = `working tree (${CONTRACTS_REL})`;
if (rev) {
  servedText = execFileSync('git', ['show', `${rev}:${CONTRACTS_REL}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  source = `git ${rev}:${CONTRACTS_REL}`;
}
if (whatIf) {
  const doc = JSON.parse(servedText ?? readFileSync(CONTRACTS_ABS, 'utf8'));
  const entry = doc.contracts.find((c) => c.id === CONTRACT_ID);
  for (const pair of whatIf.split(',')) {
    const [key, value] = pair.split('=');
    if (!(key in entry.tileParams.elevation.analytic)) throw new Error(`what-if: unknown analytic key ${key}`);
    entry.tileParams.elevation.analytic[key] = Number(value);
  }
  servedText = JSON.stringify(doc);
  source += ` + WHAT-IF {${whatIf}} (in memory only)`;
}

const location = new URL('http://slope-table.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', CONTRACT_ID);
globalThis.location = location;
globalThis.window = { location };
const quiet = { log: console.log, info: console.info, debug: console.debug, warn: console.warn };
console.log = console.info = console.debug = console.warn = () => undefined;

const vite = await createServer({
  root: ROOT,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
  plugins: [{
    name: 'cw1-contract-revision',
    enforce: 'pre',
    load(id) {
      if (servedText !== null && id.split('?')[0] === CONTRACTS_ABS) return servedText;
      return null;
    },
  }],
});

let result;
try {
  const families = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const tile = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
  const terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  result = pointsIn ? measurePoints(families, tile) : measure(families, tile, terrain, Balance);
} finally {
  await vite.close();
}
Object.assign(console, quiet);

const text = pointsIn ? renderPoints(result) : render(result);
process.stdout.write(text);
if (jsonOut) writeFileSync(path.resolve(jsonOut), `${JSON.stringify(result, null, 2)}\n`);

function measure(families, tile, terrain, Balance) {
  const diag = families.activeContractDiagnostics();
  const contract = families.activeContract();
  if (contract.id !== CONTRACT_ID) throw new Error(`active contract is ${contract.id}, not ${CONTRACT_ID}`);
  const elevation = contract.tileParams.elevation;
  const slopeMax = Balance.terrainSim.slopeMax;
  const mag = (x, z) => { const s = tile.simSlope(x, z); return Math.hypot(s.dx, s.dz); };
  const mesh = loadMesh();

  const table = [];
  for (let i = 0; i <= 40; i += 1) {
    const z = -12 + i * 0.25;
    table.push({
      z,
      simHeight: round(tile.simHeight(0, z)),
      cols: XS.map((x) => ({ x, slope: round(mag(x, z)), traversable: tile.isTraversable(x, z), zone: terrain.sample(x, z).zone, walkable: terrain.sample(x, z).walkable })),
    });
  }

  const bands = (x, z0, z1, step) => {
    const out = [];
    let open = null;
    let peak = { slope: 0, z: null };
    for (let k = 0; ; k += 1) {
      const z = round(z0 + k * step, 4);
      if (z > z1 + 1e-9) break;
      const s = mag(x, z);
      if (s > peak.slope) peak = { slope: s, z };
      const blocked = !tile.isTraversable(x, z);
      if (blocked && !open) open = { from: z, to: z, peak: s, peakZ: z };
      if (blocked && open) { open.to = z; if (s > open.peak) { open.peak = s; open.peakZ = z; } }
      if (!blocked && open) { out.push(open); open = null; }
    }
    if (open) out.push(open);
    return { walls: out.map((w) => ({ from: w.from, to: w.to, width: round(w.to - w.from, 2), peak: round(w.peak), peakZ: w.peakZ })), peak: { slope: round(peak.slope), z: peak.z } };
  };

  const creekBand = XS.map((x) => ({ x, ...bands(x, -12, -2, 0.01) }));
  const fullProfile = XS.map((x) => ({ x, ...bands(x, -56, 56, 0.05) }));

  const visible = XS.map((x) => ({
    x,
    rows: Array.from({ length: 29 }, (_, i) => {
      const z = -16 + i * 0.5;
      const meshH = mesh.heightAt(x, z);
      const simH = tile.simHeight(x, z);
      return { z, mesh: round(meshH), sim: round(simH), simMinusMesh: round(simH - meshH), meshGrade: round((mesh.heightAt(x, z + 0.5) - mesh.heightAt(x, z - 0.5)) / 1) };
    }),
  }));

  return {
    schema: 'goldrush.cw1.slope-table.v1',
    contract: CONTRACT_ID,
    source,
    activeContract: { activeId: diag.activeId, fallbackReason: diag.fallbackReason },
    elevation,
    slopeMax,
    centralDifferenceStep: Math.max(0.25, elevation.cellSize * 0.25),
    xs: XS,
    table,
    creekBand,
    fullProfile,
    reach: reachability(terrain, contract),
    visible,
  };
}

function measurePoints(families, tile) {
  const contract = families.activeContract();
  if (contract.id !== CONTRACT_ID) throw new Error(`active contract is ${contract.id}, not ${CONTRACT_ID}`);
  const mesh = loadMesh();
  const boards = JSON.parse(readFileSync(path.resolve(pointsIn), 'utf8'));
  const points = boards.samples.map((s) => {
    const sim = tile.simHeight(s.x, s.z);
    const visible = mesh.heightAt(s.x, s.z);
    return { leg: s.leg, x: round(s.x, 3), z: round(s.z, 3), heroGround: round(s.heroGround), meshHeight: round(visible), heroVisualY: round(s.heroVisualY), simHeight: round(sim), simMinusVisible: round(sim - visible), heroMinusVisible: round(s.heroVisualY - visible) };
  });
  return { schema: 'goldrush.cw1.board-points.v1', source, boardsFile: path.relative(ROOT, path.resolve(pointsIn)), project: boards.project, points };
}

function renderPoints(r) {
  const lines = [`# board points (${r.project}): sim height and visible (GLB) height at every sampled hero position`, `source: ${r.source}`, `${'leg'.padEnd(26)} ${'x'.padStart(7)} ${'z'.padStart(7)} ${'heroGround'.padStart(10)} ${'mesh'.padStart(7)} ${'heroY'.padStart(7)} ${'sim'.padStart(7)} ${'sim-vis'.padStart(7)} ${'hero-vis'.padStart(8)}`];
  for (const p of r.points) lines.push(`${String(p.leg).padEnd(26)} ${fmt(p.x, 7, 2)} ${fmt(p.z, 7, 2)} ${fmt(p.heroGround, 10)} ${fmt(p.meshHeight)} ${fmt(p.heroVisualY)} ${fmt(p.simHeight)} ${fmt(p.simMinusVisible)} ${fmt(p.heroMinusVisible, 8)}`);
  return `${lines.join('\n')}\n`;
}

function reachability(terrain, contract) {
  const step = 0.5;
  const { minX, maxX, minZ, maxZ } = terrain.bounds;
  const nx = Math.round((maxX - minX) / step) + 1;
  const nz = Math.round((maxZ - minZ) / step) + 1;
  const walk = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j += 1) for (let i = 0; i < nx; i += 1) walk[j * nx + i] = terrain.sample(minX + i * step, minZ + j * step).walkable ? 1 : 0;
  const seen = new Uint8Array(nx * nz);
  const start = contract.tileParams.stakeMarkers.find((m) => m.heroStart) ?? contract.tileParams.stakeMarkers[0];
  const si = Math.round((start.x - minX) / step);
  const sj = Math.round((start.z - minZ) / step);
  const queue = [sj * nx + si];
  seen[queue[0]] = 1;
  for (let q = 0; q < queue.length; q += 1) {
    const c = queue[q];
    const i = c % nx;
    const j = (c - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const a = i + di;
      const b = j + dj;
      if (a < 0 || b < 0 || a >= nx || b >= nz) continue;
      const n = b * nx + a;
      if (seen[n] || !walk[n]) continue;
      // Diagonal steps need both orthogonal neighbours walkable (no corner cutting through a wall).
      if (di !== 0 && dj !== 0 && (!walk[j * nx + a] || !walk[b * nx + i])) continue;
      seen[n] = 1;
      queue.push(n);
    }
  }
  const at = (x, z) => {
    // A target counts as reachable when any walkable lattice point within 1.5 m of it was reached.
    for (let dj = -3; dj <= 3; dj += 1) for (let di = -3; di <= 3; di += 1) {
      const i = Math.round((x - minX) / step) + di;
      const j = Math.round((z - minZ) / step) + dj;
      if (i < 0 || j < 0 || i >= nx || j >= nz) continue;
      if (Math.hypot(di * step, dj * step) > 1.5) continue;
      if (seen[j * nx + i]) return true;
    }
    return false;
  };
  const tp = contract.tileParams;
  const nodes = contract.twist.powerGrid?.nodes ?? [];
  const targets = [
    ...tp.pylonSites.map((p) => ({ kind: 'pylon site', id: p.id, x: p.x, z: p.z })),
    ...tp.harvestAnchors.map((p, k) => ({ kind: 'seam (harvest anchor)', id: `anchor-${k}`, x: p.x, z: p.z })),
    ...nodes.filter((n) => n.role === 'gallery' || n.role === 'lamp').map((n) => ({ kind: `${n.role} consumer`, id: n.id, x: n.x, z: n.z })),
    ...tp.prePlacedBuildables.map((p, k) => ({ kind: `pre-placed ${p.id}`, id: `${p.id}-${k}`, x: p.x, z: p.z })),
    { kind: 'bridge (works-bridge ford), north end', id: 'works-bridge-north', x: 0, z: 6.5 },
  ];
  let reached = 0;
  for (const v of seen) reached += v;
  let walkable = 0;
  for (const v of walk) walkable += v;
  return {
    method: `8-connected flood fill over Terrain.sample(x,z).walkable on a ${step} m lattice from the hero start (${start.x},${start.z}); a target is reached when a reached lattice point lies within 1.5 m`,
    lattice: { nx, nz, walkable, reached },
    targets: targets.map((t) => ({ ...t, reachable: at(t.x, t.z) })),
  };
}

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
  const count = posAcc.count;
  const segments = Math.round(Math.sqrt(count)) - 1;
  const width = segments + 1;
  const [minX, , minZ] = posAcc.min;
  const [maxX, , maxZ] = posAcc.max;
  const stepX = (maxX - minX) / segments;
  const stepZ = (maxZ - minZ) / segments;
  const heights = new Float32Array(width * width);
  const cols = new Int32Array(count);
  const rows = new Int32Array(count);
  for (let v = 0; v < count; v += 1) {
    const c = Math.round((pos[v * 3] - minX) / stepX);
    const r = Math.round((pos[v * 3 + 2] - minZ) / stepZ);
    heights[r * width + c] = pos[v * 3 + 1];
    cols[v] = c;
    rows[v] = r;
  }
  const diagonals = new Uint8Array(segments * segments);
  for (let t = 0; t < idx.length / 3; t += 1) {
    const a = idx[t * 3], bb = idx[t * 3 + 1], c = idx[t * 3 + 2];
    const col = Math.min(cols[a], cols[bb], cols[c]);
    const row = Math.min(rows[a], rows[bb], rows[c]);
    const mask = (1 << ((rows[a] - row) * 2 + cols[a] - col)) | (1 << ((rows[bb] - row) * 2 + cols[bb] - col)) | (1 << ((rows[c] - row) * 2 + cols[c] - col));
    diagonals[row * segments + col] = mask === 0b1011 || mask === 0b1101 ? 0 : 1;
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lastCell = segments - 1;
  return {
    heightAt(x, z) {
      const gx = clamp((x - minX) / stepX, 0, segments);
      const gz = clamp((z - minZ) / stepZ, 0, segments);
      const x0 = Math.min(Math.floor(gx), lastCell);
      const z0 = Math.min(Math.floor(gz), lastCell);
      const x1 = Math.min(x0 + 1, segments);
      const z1 = Math.min(z0 + 1, segments);
      const fx = gx - x0;
      const fz = gz - z0;
      const low = heights[z0 * width + x0];
      const east = heights[z0 * width + x1];
      const south = heights[z1 * width + x0];
      const high = heights[z1 * width + x1];
      if (diagonals[z0 * segments + x0] === 0) {
        return fz <= fx ? low + (east - low) * fx + (high - east) * fz : low + (high - south) * fx + (south - low) * fz;
      }
      return fx + fz <= 1 ? low + (east - low) * fx + (south - low) * fz : high + (high - south) * (fx - 1) + (high - east) * (fz - 1);
    },
  };
}

function round(v, d = 4) { const f = 10 ** d; return Math.round(v * f) / f; }
function fmt(v, w = 7, d = 3) { return (typeof v === 'number' ? v.toFixed(d) : String(v)).padStart(w); }

function render(r) {
  const a = r.elevation.analytic;
  const lines = [];
  lines.push(`# Canyon Works slope table (${r.schema})`);
  lines.push(`source: ${r.source}`);
  lines.push(`active contract: ${r.activeContract.activeId} (fallbackReason ${r.activeContract.fallbackReason})`);
  lines.push(`creek term: creekHeight ${a.creekHeight} -> railHeight ${a.railHeight} over creekBlendStart ${a.creekBlendStart} .. creekBlendEnd ${a.creekBlendEnd} (cellSize ${r.elevation.cellSize}; simSlope central-difference step ${r.centralDifferenceStep})`);
  lines.push(`slopeMax (Balance.terrainSim): ${r.slopeMax}; isTraversable = hypot(dx,dz) <= slopeMax`);
  lines.push('');
  lines.push('## z -12 .. -2 (step 0.25): simHeight at x=0, then |simSlope| and isTraversable (T/-) per x; Terrain.sample zone at x=0 and x=-24');
  lines.push(`${'z'.padStart(7)} ${'h(0)'.padStart(7)} ${XS.map((x) => `${`|s|@${x}`.padStart(8)} T`).join(' ')}  zone@0 / zone@-24`);
  for (const row of r.table) {
    lines.push(`${fmt(row.z, 7, 2)} ${fmt(row.simHeight)} ${row.cols.map((c) => `${fmt(c.slope, 8, 4)} ${c.traversable ? 'T' : '-'}`).join(' ')}  ${row.cols[0].zone}${row.cols[0].walkable ? '' : '(x)'} / ${row.cols[1].zone}${row.cols[1].walkable ? '' : '(x)'}`);
  }
  lines.push('');
  lines.push('## creek band z -12 .. -2 (step 0.01): walls (isTraversable false) and the peak |simSlope| per x');
  for (const b of r.creekBand) {
    const walls = b.walls.length ? b.walls.map((w) => `z ${w.from}..${w.to} (${w.width} m, peak ${w.peak} at z ${w.peakZ})`).join('; ') : 'none';
    lines.push(`x=${String(b.x).padStart(3)}: peak |slope| ${b.peak.slope} at z ${b.peak.z}; margin to slopeMax ${round(r.slopeMax - b.peak.slope)}; walls: ${walls}`);
  }
  lines.push('');
  lines.push('## whole tile z -56 .. 56 (step 0.05): every wall per x');
  for (const b of r.fullProfile) {
    const walls = b.walls.length ? b.walls.map((w) => `z ${w.from}..${w.to} (${w.width} m, peak ${w.peak} at z ${w.peakZ})`).join('; ') : 'none';
    lines.push(`x=${String(b.x).padStart(3)}: ${walls}`);
  }
  lines.push('');
  lines.push(`## reachability on foot: ${r.reach.method}`);
  lines.push(`lattice ${r.reach.lattice.nx}x${r.reach.lattice.nz}: ${r.reach.lattice.walkable} walkable points, ${r.reach.lattice.reached} reached`);
  for (const t of r.reach.targets) lines.push(`  ${t.reachable ? 'REACHED    ' : 'UNREACHABLE'} ${t.kind} ${t.id} (${t.x},${t.z})`);
  lines.push('');
  lines.push('## visible bank (mounted GLB lattice, read-only) against the sim height, z -16 .. -2 (step 0.5)');
  for (const v of r.visible.filter((entry) => entry.x === 0 || entry.x === -24)) {
    lines.push(`x=${v.x}: ${'z'.padStart(6)} ${'mesh'.padStart(7)} ${'sim'.padStart(7)} ${'sim-mesh'.padStart(8)} ${'meshGrade'.padStart(9)}`);
    for (const row of v.rows) lines.push(`      ${fmt(row.z, 6, 1)} ${fmt(row.mesh)} ${fmt(row.sim)} ${fmt(row.simMinusMesh, 8)} ${fmt(row.meshGrade, 9)}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
