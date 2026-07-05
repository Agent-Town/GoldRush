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
 *   --tol N         max per-channel distance from the key color treated as background core (default 26)
 *   --feather N     extra distance band ramped from alpha 0 -> 255 (default 14)
 *   --size N        output square size, bilinear resample (default 1024; 0 = keep native)
 *   --full-bleed    no alpha keying (terrain tiles); resize only
 *   --out DIR       output directory (default assets/processed)
 *   --key HEX       background key color (default 8a8a8a; ff00ff for sprite sheets).
 *                   Saturated keys (channel spread > 60) trigger hue-targeted despill:
 *                   edge-band pixels (3px dilation) whose key-dominant channels exceed the
 *                   key-recessive channel by > 16 get the excess subtracted (kills magenta
 *                   fringe on anti-aliased edges; sepia/rust/teal art colors are untouched).
 *   --pocket-mean N max mean key-distance for keying an enclosed background pocket
 *                   (default 12; raise for pockets with painted gradients, e.g. 24)
 *   --grid CxR      sprite-sheet mode: key the whole sheet, slice into C cols x R rows,
 *                   bbox-center each cell's content, normalize with ONE shared scale
 *                   (largest bbox -> 86% of cell, never upscaled) so frames don't
 *                   "breathe", emit <base>-r<row>c<col>.png + <base>.frames.json.
 *                   Ignores --size (cell output size comes from --cell).
 *   --cell N        grid-mode output cell size (default 512)
 *   --scale F       grid-mode: absolute scale override (skips the auto 86%-fit; still
 *                   capped at 1 = never upscale). Use to match figure heights across
 *                   sheets whose grids have different native cell sizes (s37 law:
 *                   cross-sheet direction neighbors must not size-pop).
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

let KEY = [0x8a, 0x8a, 0x8a];

function parseArgs(argv) {
  const opts = { tol: 26, feather: 14, size: 1024, cell: 512, key: '8a8a8a', grid: null, scaleOverride: null, pocketMean: 12, interiorKey: 90, fullBleed: false, out: 'assets/processed', inputs: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tol') opts.tol = Number(argv[++i]);
    else if (a === '--feather') opts.feather = Number(argv[++i]);
    else if (a === '--size') opts.size = Number(argv[++i]);
    else if (a === '--cell') opts.cell = Number(argv[++i]);
    else if (a === '--pocket-mean') opts.pocketMean = Number(argv[++i]);
    else if (a === '--interior-key') opts.interiorKey = Number(argv[++i]);
    else if (a === '--key') opts.key = argv[++i];
    else if (a === '--grid') opts.grid = argv[++i];
    else if (a === '--scale') opts.scaleOverride = Number(argv[++i]);
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
function extractAlpha(png, tol, feather, deshadow = false, pocketMean = 12) {
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
    if (members.length >= 100 && distSum / members.length <= pocketMean) {
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

function parseKeyHex(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) { console.error(`bad --key ${hex} (want RRGGBB)`); process.exit(1); }
  const v = parseInt(m[1], 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
}

const keySaturation = () => Math.max(...KEY) - Math.min(...KEY);

/**
 * Hue-targeted despill for saturated keys (e.g. #ff00ff): the excess of every
 * key-dominant channel (key channel >= 128) over the strongest key-recessive
 * channel — beyond a 16-step margin — is subtracted. Magenta fringe on dark ink
 * outlines collapses to neutral dark; rust (b << g+24) and teal (r << g) survive.
 * s15: runs on ALL opaque pixels by default (all=true) — batch-004 sheets carried
 * painted magenta SPILL on interior cloth/limb pixels that the old 3px edge band
 * never reached; the margin rule already protects every legit palette color, so
 * band-limiting was caution, not necessity. Pass all=false for the legacy band.
 */
function despillSaturatedKey(png, all = true) {
  const { width: w, height: h, data } = png;
  const hi = [], lo = [];
  for (let c = 0; c < 3; c++) (KEY[c] >= 128 ? hi : lo).push(c);
  if (!hi.length || !lo.length) return 0;
  let band = new Uint8Array(w * h);
  if (all) {
    band.fill(1);
  } else {
    for (let i = 0; i < w * h; i++) if (data[(i << 2) + 3] < 255) band[i] = 1;
    for (let it = 0; it < 3; it++) {
      const next = band.slice();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = w * y + x;
          if (band[i]) continue;
          if ((x > 0 && band[i - 1]) || (x < w - 1 && band[i + 1]) || (y > 0 && band[i - w]) || (y < h - 1 && band[i + w])) next[i] = 1;
        }
      }
      band = next;
    }
  }
  let fixed = 0;
  for (let i = 0; i < w * h; i++) {
    if (!band[i]) continue;
    const idx = i << 2;
    if (!data[idx + 3]) continue;
    let ref = 0;
    for (const c of lo) ref = Math.max(ref, data[idx + c]);
    let m = 255;
    for (const c of hi) m = Math.min(m, data[idx + c] - ref);
    m -= 16;
    if (m <= 0) continue;
    for (const c of hi) data[idx + c] -= m;
    fixed++;
  }
  return fixed;
}

/**
 * Interior near-key alpha clear (s15, saturated keys only): opaque pixels whose
 * max-channel distance to the key is < thr go transparent (ramped to thr+feather).
 * Catches magenta spill BLOBS painted over gaps (between legs, under poncho
 * fringe) that are neither border-connected nor clean enclosed pockets. thr 90 is
 * unreachable by legit art: any sepia/rust/teal/parchment pixel differs from
 * #ff00ff by >100 on at least one channel (G is never near 0 where R/B are high).
 * NOT safe for gray keys (would eat real grays) — call sites gate on saturation.
 */
function interiorKeyClear(png, thr, feather) {
  const { data } = png;
  const n = png.width * png.height;
  let cleared = 0;
  for (let i = 0; i < n; i++) {
    const idx = i << 2;
    if (!data[idx + 3]) continue;
    const d = keyDist(data, idx);
    if (d >= thr + feather) continue;
    const a = d <= thr ? 0 : Math.round(((d - thr) / feather) * 255);
    if (a < data[idx + 3]) {
      data[idx + 3] = a;
      if (a === 0) cleared++;
    }
  }
  return cleared;
}

/**
 * Grid mode: slice a keyed sheet into cols x rows cells. Each cell's alpha bbox
 * is centered in a cellSize^2 output. ONE shared scale across all cells (largest
 * bbox dimension -> 86% of cellSize, capped at 1 = never upscale) so animation
 * frames keep relative proportions instead of pulsing per-frame.
 */
function sliceGrid(png, cols, rows, cellSize, base, outDir, scaleOverride = null) {
  const cw = Math.floor(png.width / cols), ch = Math.floor(png.height / rows);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const a = png.data[((png.width * (r * ch + y) + (c * cw + x)) << 2) + 3];
          if (a > 8) {
            if (x < x0) x0 = x; if (x > x1) x1 = x;
            if (y < y0) y0 = y; if (y > y1) y1 = y;
          }
        }
      }
      cells.push({ r, c, x0, y0, x1, y1, empty: x1 < 0 });
    }
  }
  const occupied = cells.filter((k) => !k.empty);
  const maxDim = Math.max(1, ...occupied.map((k) => Math.max(k.x1 - k.x0 + 1, k.y1 - k.y0 + 1)));
  const scale = Math.min(1, scaleOverride ?? (cellSize * 0.86) / maxDim);
  if (maxDim * scale > cellSize) {
    console.error(`--scale ${scaleOverride}: largest content ${maxDim}px would exceed the ${cellSize}px cell`);
    process.exit(1);
  }
  const emitted = [];
  for (const cell of cells) {
    const out = new PNG({ width: cellSize, height: cellSize });
    if (!cell.empty) {
      const cx = cell.c * cw + (cell.x0 + cell.x1 + 1) / 2;
      const cy = cell.r * ch + (cell.y0 + cell.y1 + 1) / 2;
      for (let oy = 0; oy < cellSize; oy++) {
        const fy = cy + (oy + 0.5 - cellSize / 2) / scale - 0.5;
        if (fy < cell.r * ch || fy > (cell.r + 1) * ch - 1) continue;
        const y0i = Math.max(Math.floor(fy), 0), y1i = Math.min(y0i + 1, png.height - 1), wy = fy - y0i;
        for (let ox = 0; ox < cellSize; ox++) {
          const fx = cx + (ox + 0.5 - cellSize / 2) / scale - 0.5;
          if (fx < cell.c * cw || fx > (cell.c + 1) * cw - 1) continue;
          const x0i = Math.max(Math.floor(fx), 0), x1i = Math.min(x0i + 1, png.width - 1), wx = fx - x0i;
          const o = (cellSize * oy + ox) << 2;
          for (let ch4 = 0; ch4 < 4; ch4++) {
            const p00 = png.data[((png.width * y0i + x0i) << 2) + ch4];
            const p10 = png.data[((png.width * y0i + x1i) << 2) + ch4];
            const p01 = png.data[((png.width * y1i + x0i) << 2) + ch4];
            const p11 = png.data[((png.width * y1i + x1i) << 2) + ch4];
            out.data[o + ch4] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
          }
        }
      }
    }
    const file = `${base}-r${cell.r}c${cell.c}.png`;
    fs.writeFileSync(path.join(outDir, file), PNG.sync.write(out));
    emitted.push({ row: cell.r, col: cell.c, file, empty: cell.empty, bbox: cell.empty ? null : [cell.x0, cell.y0, cell.x1, cell.y1] });
  }
  fs.writeFileSync(
    path.join(outDir, `${base}.frames.json`),
    JSON.stringify({ source: `${base}.png`, grid: { cols, rows }, cell: cellSize, scale: Number(scale.toFixed(4)), cells: emitted }, null, 2) + '\n',
  );
  return emitted;
}

const opts = parseArgs(process.argv);
KEY = parseKeyHex(opts.key);
fs.mkdirSync(opts.out, { recursive: true });

for (const input of opts.inputs) {
  let png = readPNG(input);
  const native = `${png.width}x${png.height}`;
  const base = path.basename(input, '.png');
  if (opts.grid) {
    const gm = /^(\d+)x(\d+)$/.exec(opts.grid.toLowerCase());
    if (!gm) { console.error(`bad --grid ${opts.grid} (want CxR, e.g. 2x2)`); process.exit(1); }
    const cols = Number(gm[1]), rows = Number(gm[2]);
    const { keyed, total } = extractAlpha(png, opts.tol, opts.feather, opts.deshadow, opts.pocketMean);
    const saturated = keySaturation() > 60;
    const cleared = saturated ? interiorKeyClear(png, opts.interiorKey, opts.feather) : 0;
    const despilled = saturated ? despillSaturatedKey(png) : 0;
    const emitted = sliceGrid(png, cols, rows, opts.cell, base, opts.out, opts.scaleOverride);
    console.log(
      `${path.basename(input)}: ${native}, keyed ${((keyed / total) * 100).toFixed(1)}%, spill-cleared ${cleared} px, despilled ${despilled} px -> ` +
      `${emitted.filter((e) => !e.empty).length}/${emitted.length} cells @${opts.cell}px + ${base}.frames.json`,
    );
  } else {
    png = resize(png, opts.size);
    let stat = 'full-bleed (no keying)';
    if (!opts.fullBleed) {
      const { keyed, total } = extractAlpha(png, opts.tol, opts.feather, opts.deshadow, opts.pocketMean);
      const saturated = keySaturation() > 60;
      const cleared = saturated ? interiorKeyClear(png, opts.interiorKey, opts.feather) : 0;
      const despilled = saturated ? despillSaturatedKey(png) : 0;
      stat = `keyed ${keyed}/${total} px (${((keyed / total) * 100).toFixed(1)}%)${cleared ? `, spill-cleared ${cleared} px` : ''}${despilled ? `, despilled ${despilled} px` : ''}`;
    }
    const outFile = path.join(opts.out, path.basename(input));
    fs.writeFileSync(outFile, PNG.sync.write(png));
    console.log(`${path.basename(input)}: ${native} -> ${png.width}x${png.height}, ${stat} -> ${outFile}`);
  }
}
