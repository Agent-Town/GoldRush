#!/usr/bin/env node
/**
 * extract-alpha.mjs — Gold Rush asset pipeline (CLAUDE.md §7 step 5)
 *
 * Keys out the flat #8a8a8a chroma background of GPT-Image cutout sprites and
 * writes game-ready RGBA PNGs into assets/processed/. Full-bleed terrain tiles
 * skip keying (--full-bleed) and are only resized.
 *
 * Only pixels CONNECTED TO THE IMAGE BORDER are keyed (flood fill), so internal
 * grays (hat shadows, gunmetal, stone) are never eaten. Edge alpha is feathered
 * with a distance ramp for soft antialiased edges.
 *
 * Usage:
 *   node scripts/extract-alpha.mjs [options] <input.png> [...more]
 * Options:
 *   --tol N         max per-channel distance from #8a8a8a treated as background core (default 26)
 *   --feather N     extra distance band ramped from alpha 0 -> 255 (default 14)
 *   --size N        output square size, bilinear resample (default 1024; 0 = keep native)
 *   --full-bleed    no alpha keying (terrain tiles); resize only
 *   --out DIR       output directory (default assets/processed)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const KEY = [0x8a, 0x8a, 0x8a];

function parseArgs(argv) {
  const opts = { tol: 26, feather: 14, size: 1024, fullBleed: false, out: 'assets/processed', inputs: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tol') opts.tol = Number(argv[++i]);
    else if (a === '--feather') opts.feather = Number(argv[++i]);
    else if (a === '--size') opts.size = Number(argv[++i]);
    else if (a === '--full-bleed') opts.fullBleed = true;
    else if (a === '--deshadow') opts.deshadow = true;
    else if (a === '--out') opts.out = argv[++i];
    else opts.inputs.push(a);
  }
  if (!opts.inputs.length) {
    console.error('usage: node scripts/extract-alpha.mjs [--tol N] [--feather N] [--size N] [--full-bleed] [--out DIR] <input.png>...');
    process.exit(1);
  }
  return opts;
}

function readPNG(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

/** Max-channel distance to the key color. */
function keyDist(data, idx) {
  const dr = Math.abs(data[idx] - KEY[0]);
  const dg = Math.abs(data[idx + 1] - KEY[1]);
  const db = Math.abs(data[idx + 2] - KEY[2]);
  return Math.max(dr, dg, db);
}

/** Bilinear resample to size x size (RGBA). */
function resize(png, size) {
  if (!size || (png.width === size && png.height === size)) return png;
  const out = new PNG({ width: size, height: size });
  const sx = png.width / size, sy = png.height / size;
  for (let y = 0; y < size; y++) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1);
    const wy = fy - y0;
    for (let x = 0; x < size; x++) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1);
      const wx = fx - x0;
      const o = (size * y + x) << 2;
      for (let c = 0; c < 4; c++) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c];
        const p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c];
        const p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[o + c] = Math.round(
          p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy
        );
      }
    }
  }
  return out;
}

/**
 * Flood fill from every border pixel across pixels within (tol + feather) of the
 * key color; only flooded pixels get alpha from the distance ramp:
 *   dist <= tol            -> alpha 0
 *   dist >= tol + feather  -> alpha 255 (not reached by fill anyway)
 *   in between             -> linear ramp
 */
function extractAlpha(png, tol, feather, deshadow = false) {
  const { width: w, height: h, data } = png;
  const limit = tol + feather;
  const visited = new Uint8Array(w * h);
  const stack = [];
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = w * y + x;
    if (visited[i]) return;
    if (keyDist(data, i << 2) <= limit) { visited[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < w; x++) { pushIf(x, 0); pushIf(x, h - 1); }
  for (let y = 0; y < h; y++) { pushIf(0, y); pushIf(w - 1, y); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    pushIf(x + 1, y); pushIf(x - 1, y); pushIf(x, y + 1); pushIf(x, y - 1);
  }
  // Optional pass: cast shadows the model painted onto the "flat" background.
  // Expand the keyed region into border-connected near-neutral mid-gray pixels
  // only: channel spread <= 26 (GPT-Image bg shadows measure spread ~20-22) and
  // lightness 88..142. Warm sepia shading (spread 50+), bright steel (145+) and
  // dark outlines all survive.
  if (deshadow) {
    const q = [];
    for (let i = 0; i < w * h; i++) if (visited[i]) q.push(i);
    const isShadow = (idx) => {
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
      return hi - lo <= 26 && hi >= 88 && hi <= 142;
    };
    for (let head = 0; head < q.length; head++) {
      const i = q[head];
      const x = i % w, y = (i / w) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = w * ny + nx;
        if (visited[j] || !isShadow(j << 2)) continue;
        visited[j] = 2; // 2 = shadow: forced alpha 0 regardless of key distance
        q.push(j);
      }
    }
  }

  // Second pass: enclosed background pockets (e.g. the gap between an arm and
  // the torso) are near-key regions not connected to the border. Key a pocket
  // only when it is big enough and clearly neutral gray (mean dist <= 12), so
  // sepia-tinted internal shading is never eaten.
  const pocket = new Int32Array(w * h).fill(-1);
  let nPockets = 0;
  for (let s = 0; s < w * h; s++) {
    if (visited[s] || pocket[s] !== -1 || keyDist(data, s << 2) > limit) continue;
    const members = [s];
    pocket[s] = nPockets;
    let distSum = 0;
    for (let q = 0; q < members.length; q++) {
      const i = members[q];
      distSum += keyDist(data, i << 2);
      const x = i % w, y = (i / w) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = w * ny + nx;
        if (visited[j] || pocket[j] !== -1 || keyDist(data, j << 2) > limit) continue;
        pocket[j] = nPockets;
        members.push(j);
      }
    }
    nPockets++;
    if (members.length >= 100 && distSum / members.length <= 12) {
      for (const i of members) visited[i] = 1;
    }
  }
  let keyed = 0;
  for (let i = 0; i < w * h; i++) {
    if (!visited[i]) continue;
    const d = keyDist(data, i << 2);
    const a = visited[i] === 2 ? 0 : d <= tol ? 0 : Math.round(((d - tol) / feather) * 255);
    data[(i << 2) + 3] = Math.min(a, 255);
    keyed++;
  }
  return { keyed, total: w * h };
}

const opts = parseArgs(process.argv);
fs.mkdirSync(opts.out, { recursive: true });

for (const input of opts.inputs) {
  let png = readPNG(input);
  const native = `${png.width}x${png.height}`;
  png = resize(png, opts.size);
  let stat = 'full-bleed (no keying)';
  if (!opts.fullBleed) {
    const { keyed, total } = extractAlpha(png, opts.tol, opts.feather, opts.deshadow);
    stat = `keyed ${keyed}/${total} px (${((keyed / total) * 100).toFixed(1)}%)`;
  }
  const outFile = path.join(opts.out, path.basename(input));
  fs.writeFileSync(outFile, PNG.sync.write(png));
  console.log(`${path.basename(input)}: ${native} -> ${png.width}x${png.height}, ${stat} -> ${outFile}`);
}
