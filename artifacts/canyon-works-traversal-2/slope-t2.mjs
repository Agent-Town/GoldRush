#!/usr/bin/env node
// canyon-works-traversal-2, item 1: the Canyon Works t2 ramp measured with the sim's own code, window by window.
//
// Usage (from the repo root):
//   node artifacts/canyon-works-traversal-2/slope-t2.mjs [--rev <git-rev>] [--windows 18:28,14:32,13:33] [--txt <out.txt>] [--json <out.json>]
//
// The method is canyon-works-traversal-1's (artifacts/canyon-works-traversal-1/slope-table.mjs): src/sim/TileHeight.ts,
// src/world/Terrain.ts, src/game/Balance.ts and src/meta/ContractFamilies.ts are loaded through vite's SSR loader the way
// scripts/gr-sim.mjs loads them (globalThis.location carries ?debug&contract=e3-canyon-works), so simHeight, simSlope,
// isTraversable and Terrain.sample read the contract exactly as the running sim does. Nothing here re-implements the slope rule.
// TileHeight reads the active tile once, at import, so every window gets its own vite server and module graph; the window
// is written into the served contract text by a load hook (in memory only: the working tree is never touched). The loader uses a
// private dependency cache (CW2_VITE_CACHE_DIR, default <os tmpdir>/cw2-slope-vite-cache) so it never touches this checkout's
// .vite-cache while a dev server may be serving from it.
//   --rev <rev>        serve the contract from that git revision instead of the working tree.
//   --windows a:b,...  the t2RampStart:t2RampEnd windows to measure (default 18:28,14:32,13:33 plus narrower probes).
//   --as-served        measure the served contract as it stands (no window patch); used to re-read the committed block.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT_ID = 'e3-canyon-works';
const CONTRACTS_REL = 'assets/contracts/epoch-3-voltage/contracts.json';
const CONTRACTS_ABS = path.join(ROOT, CONTRACTS_REL);
const XS = [0, -8, 8, -14, 14, -20, 20, -30, 30];
const BAND = { z0: 8, z1: 38 };
const BRIDGE = { x: 0, z: -5 };

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const rev = opt('--rev');
const asServed = args.includes('--as-served');
const windows = asServed
  ? [null]
  : (opt('--windows') ?? '18:28,14:32,13:33,15:31,14:31,15:32').split(',').map((pair) => pair.split(':').map(Number));
const txtOut = opt('--txt');
const jsonOut = opt('--json');

const baseText = rev
  ? execFileSync('git', ['show', `${rev}:${CONTRACTS_REL}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  : readFileSync(CONTRACTS_ABS, 'utf8');
const baseSource = rev ? `git ${rev}:${CONTRACTS_REL}` : `working tree (${CONTRACTS_REL})`;

const location = new URL('http://slope-t2.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', CONTRACT_ID);
globalThis.location = location;
globalThis.window = { location };
const quiet = { log: console.log, info: console.info, debug: console.debug, warn: console.warn };
console.log = console.info = console.debug = console.warn = () => undefined;

const results = [];
try {
  for (const window of windows) {
    const doc = JSON.parse(baseText);
    const entry = doc.contracts.find((c) => c.id === CONTRACT_ID);
    const analytic = entry.tileParams.elevation.analytic;
    const sourceBefore = { t2RampStart: analytic.t2RampStart, t2RampEnd: analytic.t2RampEnd };
    let source = baseSource;
    if (window) {
      analytic.t2RampStart = window[0];
      analytic.t2RampEnd = window[1];
      source += ` + t2RampStart ${window[0]}, t2RampEnd ${window[1]} (in memory only; served ${sourceBefore.t2RampStart}..${sourceBefore.t2RampEnd})`;
    }
    const servedText = JSON.stringify(doc);
    const vite = await createServer({
      root: ROOT,
      appType: 'custom',
      logLevel: 'silent',
      server: { middlewareMode: true },
      // A private optimizer cache: this checkout's .vite-cache belongs to its dev server (an e2e batch may be reading it).
      cacheDir: process.env.CW2_VITE_CACHE_DIR ?? path.join(os.tmpdir(), 'cw2-slope-vite-cache'),
      optimizeDeps: { noDiscovery: true },
      plugins: [{
        name: 'cw2-contract-window',
        enforce: 'pre',
        load(id) {
          if (id.split('?')[0] === CONTRACTS_ABS) return servedText;
          return null;
        },
      }],
    });
    try {
      const families = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const tile = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
      const terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
      const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
      results.push({ source, ...measure(families, tile, terrain, Balance) });
    } finally {
      await vite.close();
    }
  }
} finally {
  Object.assign(console, quiet);
}

const text = render(results);
process.stdout.write(text);
if (txtOut) writeFileSync(path.resolve(txtOut), text);
if (jsonOut) writeFileSync(path.resolve(jsonOut), `${JSON.stringify({ schema: 'goldrush.cw2.slope-t2.v1', results }, null, 2)}\n`);

function measure(families, tile, terrain, Balance) {
  const diag = families.activeContractDiagnostics();
  const contract = families.activeContract();
  if (contract.id !== CONTRACT_ID) throw new Error(`active contract is ${contract.id}, not ${CONTRACT_ID}`);
  const elevation = contract.tileParams.elevation;
  const a = elevation.analytic;
  const slopeMax = Balance.terrainSim.slopeMax;
  const step = Math.max(0.25, elevation.cellSize * 0.25);
  const mag = (x, z) => { const s = tile.simSlope(x, z); return Math.hypot(s.dx, s.dz); };
  // The cliff footprint: every point whose height or central-difference slope the cliff term can touch. The cliff term is
  // non-zero on the open rectangle (cliffMinX - feather, cliffMaxX + feather) x (cliffMinZ - feather, cliffMaxZ + feather);
  // simSlope samples +/- step on each axis, so the footprint is that rectangle grown by the difference step.
  const fp = {
    minX: a.cliffMinX - a.cliffFeather - step,
    maxX: a.cliffMaxX + a.cliffFeather + step,
    minZ: a.cliffMinZ - a.cliffFeather - step,
    maxZ: a.cliffMaxZ + a.cliffFeather + step,
  };
  const inFootprint = (x, z) => x >= fp.minX && x <= fp.maxX && z >= fp.minZ && z <= fp.maxZ;
  const run = a.t2RampEnd - a.t2RampStart;
  const rise = a.t2Height - a.t1Height;

  const walls = (x, z0, z1, dz) => {
    const out = [];
    let open = null;
    let peak = { slope: 0, z: null };
    let peakOutside = { slope: 0, z: null };
    for (let k = 0; ; k += 1) {
      const z = round(z0 + k * dz, 4);
      if (z > z1 + 1e-9) break;
      const s = mag(x, z);
      if (s > peak.slope) peak = { slope: s, z };
      if (!inFootprint(x, z) && s > peakOutside.slope) peakOutside = { slope: s, z };
      const blocked = !tile.isTraversable(x, z);
      const inside = inFootprint(x, z);
      if (blocked && !open) open = { from: z, to: z, peak: s, peakZ: z, inside: 0, outside: 0 };
      if (blocked && open) {
        open.to = z;
        if (s > open.peak) { open.peak = s; open.peakZ = z; }
        if (inside) open.inside += 1; else open.outside += 1;
      }
      if (!blocked && open) { out.push(open); open = null; }
    }
    if (open) out.push(open);
    return {
      walls: out.map((w) => ({
        from: w.from, to: w.to, width: round(w.to - w.from, 2), peak: round(w.peak), peakZ: w.peakZ,
        kind: w.outside === 0 ? 'cliff' : w.inside === 0 ? 'ramp' : 'cliff+ramp',
      })),
      peak: { slope: round(peak.slope), z: peak.z },
      peakOutsideFootprint: { slope: round(peakOutside.slope), z: peakOutside.z },
    };
  };

  const columns = XS.map((x) => ({ x, crossesFootprint: x >= fp.minX && x <= fp.maxX, band: walls(x, BAND.z0, BAND.z1, 0.01), tile: walls(x, terrain.bounds.minZ, terrain.bounds.maxZ, 0.05) }));

  // The whole tile, two lattices: 0.25 m everywhere, 0.05 m across the t2 band. Peak |simSlope| and every refused point
  // outside the cliff footprint (isTraversable only: water and landmark blockers are Terrain.sample's, not the slope rule's).
  const scan = (x0, x1, z0, z1, d) => {
    let peak = { slope: 0, x: null, z: null };
    let refused = 0;
    let points = 0;
    const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    for (let i = 0; ; i += 1) {
      const x = round(x0 + i * d, 4);
      if (x > x1 + 1e-9) break;
      for (let j = 0; ; j += 1) {
        const z = round(z0 + j * d, 4);
        if (z > z1 + 1e-9) break;
        if (inFootprint(x, z)) continue;
        points += 1;
        const s = mag(x, z);
        if (s > peak.slope) peak = { slope: s, x, z };
        if (!tile.isTraversable(x, z)) {
          refused += 1;
          box.minX = Math.min(box.minX, x); box.maxX = Math.max(box.maxX, x);
          box.minZ = Math.min(box.minZ, z); box.maxZ = Math.max(box.maxZ, z);
        }
      }
    }
    return { lattice: d, points, peak: { slope: round(peak.slope), x: peak.x, z: peak.z }, margin: round(slopeMax - peak.slope), refused, refusedBox: refused ? box : null };
  };
  const b = terrain.bounds;
  const outsideFootprint = {
    wholeTile: scan(b.minX, b.maxX, b.minZ, b.maxZ, 0.25),
    t2Band: scan(b.minX, b.maxX, BAND.z0, BAND.z1, 0.05),
  };

  // The cliff is still a cliff: the scripted rectangle refuses at every point, and the refused band at x 0 still spans it.
  let cliffRefused = 0;
  let cliffPoints = 0;
  for (let x = a.cliffMinX; x <= a.cliffMaxX + 1e-9; x += 0.5) {
    for (let z = a.cliffMinZ; z <= a.cliffMaxZ + 1e-9; z += 0.5) {
      cliffPoints += 1;
      if (!tile.isTraversable(x, z)) cliffRefused += 1;
    }
  }
  const cliffTop = tile.simHeight(0, (a.cliffMinZ + a.cliffMaxZ) / 2);
  const rampBeside = tile.simHeight(fp.maxX + 1, (a.cliffMinZ + a.cliffMaxZ) / 2);

  const profiles = [0, -14, -20, -30].map((x) => ({
    x,
    rows: Array.from({ length: BAND.z1 - BAND.z0 + 1 }, (_, i) => {
      const z = BAND.z0 + i;
      return { z, h: round(tile.simHeight(x, z), 3), slope: round(mag(x, z)), T: tile.isTraversable(x, z), walkable: terrain.sample(x, z).walkable };
    }),
  }));

  return {
    activeContract: { activeId: diag.activeId, fallbackReason: diag.fallbackReason },
    window: { t2RampStart: a.t2RampStart, t2RampEnd: a.t2RampEnd, run, rise },
    analyticPeak: round(1.5 * rise / run),
    centralDifferencePeak: round(rise * (1.5 / run - (2 * step * step) / (run * run * run))),
    slopeMax,
    centralDifferenceStep: step,
    cliff: { minX: a.cliffMinX, maxX: a.cliffMaxX, minZ: a.cliffMinZ, maxZ: a.cliffMaxZ, amp: a.cliffAmp, feather: a.cliffFeather, footprint: fp, scriptedRectRefused: `${cliffRefused}/${cliffPoints}`, heightOnTop: round(cliffTop, 3), heightBeside: round(rampBeside, 3) },
    neighbours: { t1RampStart: a.t1RampStart, t1RampEnd: a.t1RampEnd, t3RampStart: a.t3RampStart, t3RampEnd: a.t3RampEnd },
    columns,
    outsideFootprint,
    reachFromBridge: reachability(terrain, contract, inFootprint, BRIDGE, true),
    reachFromBridgePlain: reachability(terrain, contract, inFootprint, BRIDGE, false),
    reachFromHeroStart: reachability(terrain, contract, inFootprint, null, true),
    profiles,
  };
}

function reachability(terrain, contract, inFootprint, from, excludeFootprint) {
  const step = 0.5;
  const { minX, maxX, minZ, maxZ } = terrain.bounds;
  const nx = Math.round((maxX - minX) / step) + 1;
  const nz = Math.round((maxZ - minZ) / step) + 1;
  const walk = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j += 1) for (let i = 0; i < nx; i += 1) {
    const x = minX + i * step;
    const z = minZ + j * step;
    walk[j * nx + i] = terrain.sample(x, z).walkable && !(excludeFootprint && inFootprint(x, z)) ? 1 : 0;
  }
  const seen = new Uint8Array(nx * nz);
  const tp = contract.tileParams;
  const start = from ?? tp.stakeMarkers.find((m) => m.heroStart) ?? tp.stakeMarkers[0];
  // Snap to the nearest walkable lattice point (the bridge deck line may fall between lattice rows).
  let si = Math.round((start.x - minX) / step);
  let sj = Math.round((start.z - minZ) / step);
  if (!walk[sj * nx + si]) {
    let best = null;
    for (let dj = -4; dj <= 4; dj += 1) for (let di = -4; di <= 4; di += 1) {
      const i = si + di; const j = sj + dj;
      if (i < 0 || j < 0 || i >= nx || j >= nz || !walk[j * nx + i]) continue;
      const d = Math.hypot(di, dj);
      if (!best || d < best.d) best = { i, j, d };
    }
    if (!best) throw new Error(`no walkable lattice point near ${start.x},${start.z}`);
    si = best.i; sj = best.j;
  }
  const queue = [sj * nx + si];
  seen[queue[0]] = 1;
  const parent = new Int32Array(nx * nz).fill(-1);
  for (let q = 0; q < queue.length; q += 1) {
    const c = queue[q];
    const i = c % nx;
    const j = (c - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const ai = i + di;
      const bj = j + dj;
      if (ai < 0 || bj < 0 || ai >= nx || bj >= nz) continue;
      const n = bj * nx + ai;
      if (seen[n] || !walk[n]) continue;
      if (di !== 0 && dj !== 0 && (!walk[j * nx + ai] || !walk[bj * nx + i])) continue;
      seen[n] = 1;
      parent[n] = c;
      queue.push(n);
    }
  }
  const nearestReached = (x, z) => {
    let best = null;
    for (let dj = -3; dj <= 3; dj += 1) for (let di = -3; di <= 3; di += 1) {
      const i = Math.round((x - minX) / step) + di;
      const j = Math.round((z - minZ) / step) + dj;
      if (i < 0 || j < 0 || i >= nx || j >= nz) continue;
      const d = Math.hypot(di * step, dj * step);
      if (d > 1.5 || !seen[j * nx + i]) continue;
      if (!best || d < best.d) best = { idx: j * nx + i, d };
    }
    return best;
  };
  const nodes = contract.twist.powerGrid?.nodes ?? [];
  const targets = [
    ...tp.harvestAnchors.map((p, k) => ({ kind: 'seam', id: `anchor-${k}`, x: p.x, z: p.z })),
    ...nodes.filter((n) => n.role === 'gallery' || n.role === 'lamp' || n.role === 'turret').map((n) => ({ kind: n.role, id: n.id, x: n.x, z: n.z })),
    ...tp.pylonSites.map((p) => ({ kind: 'pylon site', id: p.id, x: p.x, z: p.z })),
    { kind: 'bridge north end', id: 'works-bridge-north', x: 0, z: 6.5 },
  ];
  let reached = 0;
  for (const v of seen) reached += v;
  return {
    method: `8-connected flood over Terrain.sample(x,z).walkable${excludeFootprint ? ' minus the cliff footprint' : ''} on a ${step} m lattice from (${round(minX + si * step, 2)},${round(minZ + sj * step, 2)}); a target is reached when a reached point lies within 1.5 m`,
    reached,
    targets: targets.map((t) => {
      const hit = nearestReached(t.x, t.z);
      if (!hit) return { ...t, reachable: false };
      // Walk the parent chain back to the start: the path length and whether any step entered the cliff footprint.
      let pathLength = 0;
      let entersFootprint = false;
      let idx = hit.idx;
      while (parent[idx] >= 0) {
        const i = idx % nx; const j = (idx - i) / nx;
        const p = parent[idx]; const pi = p % nx; const pj = (p - pi) / nx;
        pathLength += Math.hypot((i - pi) * step, (j - pj) * step);
        if (inFootprint(minX + i * step, minZ + j * step)) entersFootprint = true;
        idx = p;
      }
      return { ...t, reachable: true, pathLength: round(pathLength, 1), entersFootprint };
    }),
  };
}

function round(v, d = 4) { const f = 10 ** d; return Math.round(v * f) / f; }
function fmt(v, w = 7, d = 3) { return (typeof v === 'number' ? v.toFixed(d) : String(v)).padStart(w); }

function render(list) {
  const lines = [];
  const first = list[0];
  lines.push('# Canyon Works t2 ramp: slope table by window (goldrush.cw2.slope-t2.v1)');
  lines.push(`measured with the sim's own simSlope / isTraversable / Terrain.sample loaded through vite SSR (the canyon-works-traversal-1 method)`);
  lines.push(`slopeMax (Balance.terrainSim) ${first.slopeMax}; isTraversable = outside the scripted cliff rectangle AND hypot(simSlope) <= slopeMax; simSlope central-difference step ${first.centralDifferenceStep} m`);
  lines.push(`t2 rise ${first.window.rise} m (t1Height -> t2Height); smoothstep peak gradient 1.5 h / r, central difference rise * (1.5/r - 2 s^2/r^3)`);
  const fp = first.cliff.footprint;
  lines.push(`cliff (unchanged): x ${first.cliff.minX}..${first.cliff.maxX}, z ${first.cliff.minZ}..${first.cliff.maxZ}, amp ${first.cliff.amp}, feather ${first.cliff.feather}; footprint (cliff term + feather + difference step) x ${fp.minX}..${fp.maxX}, z ${fp.minZ}..${fp.maxZ}`);
  lines.push('');
  lines.push('## summary: one row per window');
  lines.push(`${'window'.padEnd(9)} ${'run'.padStart(4)} ${'1.5h/r'.padStart(7)} ${'peak outside footprint (tile 0.25 m / band 0.05 m)'.padEnd(52)} ${'margin'.padStart(7)} ${'refused outside'.padStart(15)}  seams  galleries lamps turrets  cliff rect refused`);
  for (const r of list) {
    const w = `${r.window.t2RampStart}..${r.window.t2RampEnd}`;
    const t = r.outsideFootprint.wholeTile;
    const bnd = r.outsideFootprint.t2Band;
    const peak = bnd.peak.slope >= t.peak.slope ? bnd : t;
    const reach = r.reachFromBridge.targets;
    const count = (kind) => `${reach.filter((x) => x.kind === kind && x.reachable).length}/${reach.filter((x) => x.kind === kind).length}`;
    lines.push(`${w.padEnd(9)} ${String(r.window.run).padStart(4)} ${fmt(r.analyticPeak, 7, 4)} ${`${t.peak.slope} at (${t.peak.x},${t.peak.z}) / ${bnd.peak.slope} at (${bnd.peak.x},${bnd.peak.z})`.padEnd(52)} ${fmt(round(r.slopeMax - peak.peak.slope), 7, 4)} ${`${t.refused} + ${bnd.refused}`.padStart(15)}  ${count('seam').padEnd(5)}  ${count('gallery').padEnd(9)} ${count('lamp').padEnd(5)} ${count('turret').padEnd(7)}  ${r.cliff.scriptedRectRefused}`);
  }
  lines.push('');
  lines.push('(refused outside = refused points outside the cliff footprint on the 0.25 m whole-tile lattice + on the 0.05 m t2-band lattice; seams/galleries/lamps/turrets = reached on foot from the bridge at (0,-5) with the cliff footprint excluded from the walk)');
  for (const r of list) {
    lines.push('');
    lines.push(`## window t2RampStart ${r.window.t2RampStart} .. t2RampEnd ${r.window.t2RampEnd} (run ${r.window.run} m)`);
    lines.push(`source: ${r.source}`);
    lines.push(`active contract: ${r.activeContract.activeId} (fallbackReason ${r.activeContract.fallbackReason}); neighbours: t1 ramp ${r.neighbours.t1RampStart}..${r.neighbours.t1RampEnd}, t3 ramp ${r.neighbours.t3RampStart}..${r.neighbours.t3RampEnd}`);
    lines.push(`peak: analytic 1.5h/r ${r.analyticPeak}, central difference ${r.centralDifferencePeak}; outside the cliff footprint, whole tile (0.25 m): ${r.outsideFootprint.wholeTile.peak.slope} at (${r.outsideFootprint.wholeTile.peak.x},${r.outsideFootprint.wholeTile.peak.z}), margin ${r.outsideFootprint.wholeTile.margin}, refused points ${r.outsideFootprint.wholeTile.refused}${r.outsideFootprint.wholeTile.refusedBox ? ` in x ${r.outsideFootprint.wholeTile.refusedBox.minX}..${r.outsideFootprint.wholeTile.refusedBox.maxX}, z ${r.outsideFootprint.wholeTile.refusedBox.minZ}..${r.outsideFootprint.wholeTile.refusedBox.maxZ}` : ''}`);
    lines.push(`      t2 band z ${BAND.z0}..${BAND.z1} (0.05 m, ${r.outsideFootprint.t2Band.points} points): ${r.outsideFootprint.t2Band.peak.slope} at (${r.outsideFootprint.t2Band.peak.x},${r.outsideFootprint.t2Band.peak.z}), margin ${r.outsideFootprint.t2Band.margin}, refused points ${r.outsideFootprint.t2Band.refused}${r.outsideFootprint.t2Band.refusedBox ? ` in x ${r.outsideFootprint.t2Band.refusedBox.minX}..${r.outsideFootprint.t2Band.refusedBox.maxX}, z ${r.outsideFootprint.t2Band.refusedBox.minZ}..${r.outsideFootprint.t2Band.refusedBox.maxZ}` : ''}`);
    lines.push(`cliff still a cliff: scripted rectangle refused ${r.cliff.scriptedRectRefused} (0.5 m lattice); height on top at (0,${(r.cliff.minZ + r.cliff.maxZ) / 2}) ${r.cliff.heightOnTop} m against ${r.cliff.heightBeside} m on the ramp beside it at x ${r.cliff.footprint.maxX + 1}`);
    lines.push(`### columns, t2 band z ${BAND.z0}..${BAND.z1} (step 0.01): peak |simSlope| (all / outside footprint) and every refused band (kind: cliff = inside the footprint, ramp = outside it)`);
    for (const c of r.columns) {
      const walls = c.band.walls.length ? c.band.walls.map((w) => `z ${w.from}..${w.to} (${w.width} m, ${w.kind}, peak ${w.peak} at z ${w.peakZ})`).join('; ') : 'none';
      lines.push(`x=${String(c.x).padStart(3)}${c.crossesFootprint ? ' (crosses the cliff footprint)' : ''}: peak ${c.band.peak.slope} at z ${c.band.peak.z}; outside footprint ${c.band.peakOutsideFootprint.slope} at z ${c.band.peakOutsideFootprint.z}; refused: ${walls}`);
    }
    lines.push(`### columns, whole tile z -56..56 (step 0.05): every refused band`);
    for (const c of r.columns) {
      const walls = c.tile.walls.length ? c.tile.walls.map((w) => `z ${w.from}..${w.to} (${w.width} m, ${w.kind})`).join('; ') : 'none';
      lines.push(`x=${String(c.x).padStart(3)}: ${walls}`);
    }
    for (const reach of [r.reachFromBridge, r.reachFromBridgePlain, r.reachFromHeroStart]) {
      lines.push(`### on foot: ${reach.method}; ${reach.reached} lattice points reached`);
      for (const t of reach.targets) lines.push(`  ${t.reachable ? 'REACHED    ' : 'UNREACHABLE'} ${t.kind} ${t.id} (${t.x},${t.z})${t.reachable ? ` path ${t.pathLength} m, enters cliff footprint: ${t.entersFootprint}` : ''}`);
    }
    lines.push('### height profile (step 1 m): simHeight / |simSlope| / isTraversable (T or -) / Terrain.sample walkable (w or x)');
    lines.push(`${'z'.padStart(4)} ${r.profiles.map((p) => `${`x=${p.x}`.padStart(22)}`).join(' ')}`);
    for (let i = 0; i < r.profiles[0].rows.length; i += 1) {
      lines.push(`${String(r.profiles[0].rows[i].z).padStart(4)} ${r.profiles.map((p) => { const row = p.rows[i]; return `${fmt(row.h, 7)} ${fmt(row.slope, 7, 4)} ${row.T ? 'T' : '-'} ${row.walkable ? 'w' : 'x'}  `; }).join(' ')}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}
