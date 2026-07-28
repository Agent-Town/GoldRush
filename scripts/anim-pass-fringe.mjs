#!/usr/bin/env node
/**
 * anim-pass-fringe.mjs — THE ANIMATION PASS, magenta-fringe arm (M3, F-M3-1).
 *
 * Every keyed character cell in the cast carries semi-transparent MAGENTA on its
 * silhouette edge — 338,575 px across 65 sheets, 1.66% of all figure pixels, and
 * NOT ONE of them fully opaque. That last number is the tell: real art would be
 * opaque somewhere. This is the #ff00ff background leaking into the figure.
 *
 * THE MECHANISM. `extract-alpha.mjs` keys the sheet by setting ALPHA to 0 while
 * leaving the background's RGB at pure #ff00ff, then `sliceGrid` resamples each
 * cell with a bilinear filter that averages all four channels INDEPENDENTLY
 * (extract-alpha.mjs:331-337). Straight (non-premultiplied) RGB averaging across a
 * silhouette edge mixes the figure's colour with the background's #ff00ff in
 * proportion to area, not to alpha — so every edge pixel picks up magenta. Despill
 * cannot save it: despill runs BEFORE the slice and skips alpha-0 pixels
 * (extract-alpha.mjs:245), so the key is still pure magenta when the filter reads it.
 *
 * THE FIX is the standard one: weight the colour average by alpha (premultiplied
 * resampling), then un-premultiply. Background pixels contribute zero colour because
 * they contribute zero alpha.
 *
 * This tool does NOT edit the shared pipeline — `extract-alpha.mjs` is outside this
 * claim and re-baking it moves all 462 shipped cells. It proves the diagnosis instead:
 *   --control  reproduce today's slicer byte-for-byte (so the replication is trusted)
 *   --fixed    the same slice with alpha-weighted sampling
 *   --measure  fringe px in a directory of cells
 *
 * Usage:
 *   node scripts/anim-pass-fringe.mjs --sheet <stem> --grid CxR --cell N --scale S \
 *        [--control DIR] [--fixed DIR]
 *   node scripts/anim-pass-fringe.mjs --measure DIR [DIR2]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const A = process.argv.slice(2);
const VALUED = new Set(['--sheet', '--grid', '--cell', '--scale', '--control', '--fixed', '--key']);
const O = new Map(); const REST = [];
for (let i = 0; i < A.length; i++) { const a = A[i]; if (VALUED.has(a)) O.set(a, A[++i]); else if (a.startsWith('--')) O.set(a, true); else REST.push(a); }

const isMagenta = (r, g, b) => r > 140 && b > 140 && g < Math.min(r, b) - 60;

function measure(dir, filter) {
  const files = fs.readdirSync(dir).filter((f) => /-r\d+c\d+\.png$/.test(f) && (!filter || f.startsWith(filter)));
  let mag = 0, opaque = 0, fig = 0;
  for (const f of files) {
    const p = PNG.sync.read(fs.readFileSync(path.join(dir, f)));
    for (let i = 0; i < p.width * p.height; i++) {
      const o = i << 2, a = p.data[o + 3];
      if (a <= 8) continue;
      fig++;
      if (isMagenta(p.data[o], p.data[o + 1], p.data[o + 2])) { mag++; if (a === 255) opaque++; }
    }
  }
  return { cells: files.length, mag, opaque, fig, pct: fig ? (100 * mag) / fig : 0 };
}

if (O.has('--measure')) {
  for (const dir of REST) {
    const m = measure(dir, null);
    console.log(`${dir.padEnd(30)} cells ${String(m.cells).padStart(4)}  fringe ${String(m.mag).padStart(7)} px (${m.pct.toFixed(3)}% of figure)  fully-opaque ${m.opaque}`);
  }
  process.exit(0);
}

/* ---- verbatim from extract-alpha.mjs (the bake this must reproduce) -------- */
let KEY = [0xff, 0x00, 0xff];
const keyDist = (data, idx) => Math.max(Math.abs(data[idx] - KEY[0]), Math.abs(data[idx + 1] - KEY[1]), Math.abs(data[idx + 2] - KEY[2]));

function extractAlpha(png, tol, feather, pocketMean = 12) {
  const { width: w, height: h, data } = png;
  const limit = tol + feather;
  const visited = new Uint8Array(w * h); const stack = [];
  const pushIf = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = w * y + x; if (visited[i]) return; if (keyDist(data, i << 2) <= limit) { visited[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { pushIf(x, 0); pushIf(x, h - 1); }
  for (let y = 0; y < h; y++) { pushIf(0, y); pushIf(w - 1, y); }
  while (stack.length) { const i = stack.pop(); const x = i % w, y = (i / w) | 0; pushIf(x + 1, y); pushIf(x - 1, y); pushIf(x, y + 1); pushIf(x, y - 1); }
  const pocket = new Int32Array(w * h).fill(-1); let nPockets = 0;
  for (let s = 0; s < w * h; s++) {
    if (visited[s] || pocket[s] !== -1 || keyDist(data, s << 2) > limit) continue;
    const members = [s]; pocket[s] = nPockets; let distSum = 0;
    for (let q = 0; q < members.length; q++) {
      const i = members[q]; distSum += keyDist(data, i << 2);
      const x = i % w, y = (i / w) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = w * ny + nx;
        if (visited[j] || pocket[j] !== -1 || keyDist(data, j << 2) > limit) continue;
        pocket[j] = nPockets; members.push(j);
      }
    }
    nPockets++;
    if (members.length >= 100 && distSum / members.length <= pocketMean) for (const i of members) visited[i] = 1;
  }
  for (let i = 0; i < w * h; i++) {
    if (!visited[i]) continue;
    const d = keyDist(data, i << 2);
    data[(i << 2) + 3] = Math.min(d <= tol ? 0 : Math.round(((d - tol) / feather) * 255), 255);
  }
}
function interiorKeyClear(png, thr, feather) {
  const { data } = png; const n = png.width * png.height;
  for (let i = 0; i < n; i++) {
    const idx = i << 2; if (!data[idx + 3]) continue;
    const d = keyDist(data, idx); if (d >= thr + feather) continue;
    const a = d <= thr ? 0 : Math.round(((d - thr) / feather) * 255);
    if (a < data[idx + 3]) data[idx + 3] = a;
  }
}
function despill(png) {
  const { width: w, height: h, data } = png;
  const hi = [], lo = [];
  for (let c = 0; c < 3; c++) (KEY[c] >= 128 ? hi : lo).push(c);
  if (!hi.length || !lo.length) return;
  for (let i = 0; i < w * h; i++) {
    const idx = i << 2; if (!data[idx + 3]) continue;
    let ref = 0; for (const c of lo) ref = Math.max(ref, data[idx + c]);
    let m = 255; for (const c of hi) m = Math.min(m, data[idx + c] - ref);
    m -= 16; if (m <= 0) continue;
    for (const c of hi) data[idx + c] -= m;
  }
}
/* -------------------------------------------------------------------------- */

/** sliceGrid, with the ONE change under test: alpha-weighted colour averaging. */
function sliceGrid(png, cols, rows, cellSize, base, outDir, scaleOverride, premultiply) {
  const cw = Math.floor(png.width / cols), ch = Math.floor(png.height / rows);
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const a = png.data[((png.width * (r * ch + y) + (c * cw + x)) << 2) + 3];
      if (a > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    cells.push({ r, c, x0, y0, x1, y1, empty: x1 < 0 });
  }
  const occupied = cells.filter((k) => !k.empty);
  const maxDim = Math.max(1, ...occupied.map((k) => Math.max(k.x1 - k.x0 + 1, k.y1 - k.y0 + 1)));
  const scale = Math.min(1, scaleOverride ?? (cellSize * 0.86) / maxDim);
  fs.mkdirSync(outDir, { recursive: true });
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
          const idx = [((png.width * y0i + x0i) << 2), ((png.width * y0i + x1i) << 2), ((png.width * y1i + x0i) << 2), ((png.width * y1i + x1i) << 2)];
          const wt = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];
          if (!premultiply) {
            for (let c4 = 0; c4 < 4; c4++) {
              let v = 0; for (let k = 0; k < 4; k++) v += png.data[idx[k] + c4] * wt[k];
              out.data[o + c4] = Math.round(v);
            }
          } else {
            let aSum = 0, rr = 0, gg = 0, bb = 0;
            for (let k = 0; k < 4; k++) {
              const a = png.data[idx[k] + 3] * wt[k];
              aSum += a;
              rr += png.data[idx[k]] * a; gg += png.data[idx[k] + 1] * a; bb += png.data[idx[k] + 2] * a;
            }
            out.data[o + 3] = Math.round(aSum);
            if (aSum > 0) { out.data[o] = Math.round(rr / aSum); out.data[o + 1] = Math.round(gg / aSum); out.data[o + 2] = Math.round(bb / aSum); }
          }
        }
      }
    }
    fs.writeFileSync(path.join(outDir, `${base}-r${cell.r}c${cell.c}.png`), PNG.sync.write(out));
  }
}

const stem = O.get('--sheet');
if (!stem) { console.error('need --sheet <stem> (or --measure DIR)'); process.exit(1); }
const [cols, rows] = String(O.get('--grid')).split('x').map(Number);
const cellSize = Number(O.get('--cell') || 512);
const scaleOverride = O.has('--scale') ? Number(O.get('--scale')) : null;

for (const [flag, premul] of [['--control', false], ['--fixed', true]]) {
  if (!O.has(flag)) continue;
  const png = PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${stem}.png`)));
  extractAlpha(png, 26, 14);
  interiorKeyClear(png, 90, 14);
  despill(png);
  sliceGrid(png, cols, rows, cellSize, stem, O.get(flag), scaleOverride, premul);
  const m = measure(O.get(flag), stem);
  console.log(`${premul ? 'FIXED  (alpha-weighted)' : 'CONTROL(as shipped)   '} → ${O.get(flag).padEnd(26)} fringe ${String(m.mag).padStart(7)} px (${m.pct.toFixed(3)}% of figure)`);
}
