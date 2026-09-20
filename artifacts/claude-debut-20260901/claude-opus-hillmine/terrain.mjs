#!/usr/bin/env node
// Analytic transcription of src/sim/TileHeight.ts hillMineHeight + src/world/Terrain.ts water,
// for e2-hill-mine. Used only to PLAN placements; the sim remains the authority.
const A = {
  hillMine: 1, creekHeight: -0.5, railHeight: 0, t1Height: 1.5, t2Height: 3, t3Height: 4.5,
  creekBlendStart: -12, creekBlendEnd: -5, t1RampStart: 5, t1RampEnd: 14,
  t2RampStart: 18, t2RampEnd: 26, t3RampStart: 32, t3RampEnd: 40,
  cliffMinX: -16, cliffMaxX: 16, cliffMinZ: 18, cliffMaxZ: 23, cliffAmp: 2.2, cliffFeather: 1,
  mineMouthX: -6, mineMouthZ: 41, mineMouthRadius: 5, mineMouthCrown: 0.22,
};
const SLOPE_MAX = 0.35;
const CELL = 2;
const RIVER_MIN_Z = -5, RIVER_MAX_Z = 5, SHALLOWS = 1.25;
const FORDS = [{ minX: -4, maxX: 4 }];
const BOUND = 48;

const ss = (e0, e1, v) => {
  if (e0 === e1) return v < e0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function height(x, z) {
  let h = A.railHeight;
  h += (A.creekHeight - A.railHeight) * (1 - ss(A.creekBlendStart, A.creekBlendEnd, z));
  h += (A.t1Height - A.railHeight) * ss(A.t1RampStart, A.t1RampEnd, z);
  h += (A.t2Height - A.t1Height) * ss(A.t2RampStart, A.t2RampEnd, z);
  h += (A.t3Height - A.t2Height) * ss(A.t3RampStart, A.t3RampEnd, z);
  const f = Math.max(0.001, A.cliffFeather);
  const mask = ss(A.cliffMinX - f, A.cliffMinX, x) * (1 - ss(A.cliffMaxX, A.cliffMaxX + f, x))
    * ss(A.cliffMinZ - f, A.cliffMinZ, z) * (1 - ss(A.cliffMaxZ, A.cliffMaxZ + f, z));
  h += A.cliffAmp * mask;
  const mr = Math.max(0.001, A.mineMouthRadius);
  const mx = x - A.mineMouthX, mz = z - A.mineMouthZ;
  return h + A.mineMouthCrown * Math.exp(-(mx * mx + mz * mz) / (2 * mr * mr));
}

export function slope(x, z) {
  const s = Math.max(0.25, CELL * 0.25);
  return {
    dx: (height(x + s, z) - height(x - s, z)) / (s * 2),
    dz: (height(x, z + s) - height(x, z - s)) / (s * 2),
  };
}
const insideCliff = (x, z) => x >= A.cliffMinX && x <= A.cliffMaxX && z >= A.cliffMinZ && z <= A.cliffMaxZ;
export function traversable(x, z) {
  if (insideCliff(x, z)) return false;
  const s = slope(x, z);
  return Math.hypot(s.dx, s.dz) <= SLOPE_MAX;
}
// Terrain.sample zone (river band first, then elevation traversability gate applied before it).
export function zone(x, z) {
  if (x < -BOUND || x > BOUND || z < -BOUND || z > BOUND) return 'out';
  if (!traversable(x, z)) return 'out';
  const inFord = z >= RIVER_MIN_Z && z <= RIVER_MAX_Z && FORDS.some((f) => x >= f.minX && x <= f.maxX);
  if (inFord) return 'ford';                                   // depth .35 == wadeDepth -> walkable
  if (z >= RIVER_MIN_Z && z <= RIVER_MAX_Z) return 'river';     // depth 1.25 -> deep, NOT walkable
  if ((z > RIVER_MAX_Z && z <= RIVER_MAX_Z + SHALLOWS) || (z < RIVER_MIN_Z && z >= RIVER_MIN_Z - SHALLOWS)) return 'shallows';
  return 'bank';
}
export const walkable = (x, z) => { const zz = zone(x, z); return zz !== 'out' && zz !== 'river'; };

// terrainLineOfSight transcription
const LOS_STEPS = 12, EYE = 0.72, TGT = 0.5, CLEAR = 0.1;
export function los(from, to) {
  const fh = height(from.x, from.z) + EYE, th = height(to.x, to.z) + TGT;
  for (let s = 1; s < LOS_STEPS; s += 1) {
    const t = s / LOS_STEPS;
    const x = from.x + (to.x - from.x) * t, z = from.z + (to.z - from.z) * t;
    if (height(x, z) > fh + (th - fh) * t - CLEAR) return false;
  }
  return true;
}
export const effRange = (base, x, z) => base + Math.max(0, height(x, z)) * 1.5;

// rail route 0
const RAIL = [{ x: -46, z: -2 }, { x: -24, z: -1 }, { x: 0, z: 0 }, { x: 24, z: -1 }, { x: 46, z: -2 }];
export function railPoints(step = 0.5) {
  const pts = [];
  for (let i = 0; i < RAIL.length - 1; i += 1) {
    const a = RAIL[i], b = RAIL[i + 1];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    for (let d = 0; d < len; d += step) {
      const t = d / len;
      pts.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  pts.push(RAIL[RAIL.length - 1]);
  return pts;
}

if (process.argv[1]?.endsWith('terrain.mjs')) {
  const mode = process.argv[2] ?? 'turrets';
  if (mode === 'turrets') {
    // For each candidate t1 pad cell, how much of the rail is coverable (range + LOS)?
    const rail = railPoints(0.5);
    const rows = [];
    for (let z = 8; z <= 16; z += 1) {
      for (let x = -30; x <= 30; x += 3) {
        if (!walkable(x, z)) { rows.push({ x, z, cover: -1 }); continue; }
        const r = effRange(16, x, z);
        let n = 0;
        for (const p of rail) {
          if (Math.hypot(p.x - x, p.z - z) <= r && los({ x, z }, p)) n += 1;
        }
        rows.push({ x, z, h: +height(x, z).toFixed(2), r: +r.toFixed(2), coverWu: +(n * 0.5).toFixed(1) });
      }
    }
    rows.sort((a, b) => (b.coverWu ?? -1) - (a.coverWu ?? -1));
    console.log('TOP RAIL-COVERING t1 CELLS:');
    for (const r of rows.slice(0, 18)) console.log(JSON.stringify(r));
    console.log('\nBY Z (x=0):');
    for (let z = 8; z <= 16; z += 1) {
      const r = rows.find((v) => v.x === 0 && v.z === z);
      console.log(z, JSON.stringify(r));
    }
  }
  if (mode === 'walk') {
    // walkability corridors between t1 and the seams
    const seams = [[-30, 25], [-10, 29], [18, 25], [-25, 39], [26, 39]];
    for (const [sx, sz] of seams) console.log('seam', sx, sz, 'walkable=', walkable(sx, sz), 'h=', height(sx, sz).toFixed(2));
    console.log('\ncliff-band walkability sweep at z=20 (impassable x -16..16):');
    let line = '';
    for (let x = -34; x <= 34; x += 2) line += walkable(x, 20) ? '.' : '#';
    console.log('x -34..34:', line);
    console.log('\ncolumn walkability x=-20 (z 6..44):');
    for (let z = 6; z <= 44; z += 2) process.stdout.write(walkable(-20, z) ? '.' : '#');
    console.log('');
    console.log('column walkability x=20 (z 6..44):');
    for (let z = 6; z <= 44; z += 2) process.stdout.write(walkable(20, z) ? '.' : '#');
    console.log('');
    console.log('column walkability x=0 (z -8..44):');
    for (let z = -8; z <= 44; z += 2) process.stdout.write(walkable(0, z) ? (zone(0, z) === 'ford' ? 'f' : '.') : '#');
    console.log('');
  }
}
