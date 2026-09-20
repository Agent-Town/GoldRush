#!/usr/bin/env node
// HALO SIMULATION — the one risk in a flat transparent field, measured the way the GPU makes it.
// three.js samples these sprites NON-premultiplied: at a minified sample the RGB of neighbouring
// TRANSPARENT texels is averaged into the colour alongside the figure's, weighted by nothing, while
// alpha is averaged separately. That is why bleedEdges exists. This box-filters each cell the same
// way (RGB averaged over ALL texels in the box, alpha averaged separately), composites the result
// over the town's sand, and reports the mean colour of the rim band — the pixels whose resampled
// alpha lands between 0.1 and 0.9, i.e. exactly the halo.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
const S = process.env.SCRATCH;
const SAND = [205, 170, 120];
const OUT = 'artifacts/town-cast-walk8-hard-alpha-recut';
const N = 48; // on-screen height of a town actor at the default framing, measured from the shot
function minify(png, n) {
  const { width: w, height: h, data } = png;
  const out = new Float32Array(n * n * 4);
  const bx = w / n, by = h / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let r = 0, g = 0, b = 0, a = 0, c = 0;
    for (let sy = Math.floor(y * by); sy < Math.floor((y + 1) * by); sy++)
      for (let sx = Math.floor(x * bx); sx < Math.floor((x + 1) * bx); sx++) {
        const o = (sy * w + sx) << 2;
        r += data[o]; g += data[o + 1]; b += data[o + 2]; a += data[o + 3]; c++;
      }
    const o = (y * n + x) << 2;
    out[o] = r / c; out[o + 1] = g / c; out[o + 2] = b / c; out[o + 3] = a / c / 255;
  }
  return out;
}
const rows = [];
for (const cell of process.argv.slice(2)) {
  const variants = [['main', PNG.sync.read(execFileSync('git', ['show', `HEAD:assets/processed/${cell}`], { maxBuffer: 3e7 }))],
    ['branch', PNG.sync.read(fs.readFileSync(S + '/branchcells/' + cell))],
    ['re-cut', PNG.sync.read(fs.readFileSync('assets/processed/' + cell))]];
  const tiles = [];
  for (const [label, png] of variants) {
    const m = minify(png, N);
    let rr = 0, gg = 0, bb = 0, k = 0;
    const tile = Buffer.alloc(N * N * 3);
    for (let i = 0; i < N * N; i++) {
      const o = i << 2, a = m[o + 3];
      for (let c = 0; c < 3; c++) tile[i * 3 + c] = Math.round(m[o + c] * a + SAND[c] * (1 - a));
      if (a > 0.1 && a < 0.9) { rr += m[o]; gg += m[o + 1]; bb += m[o + 2]; k++; }
    }
    rows.push(`${cell} ${label.padEnd(7)} rim texels ${String(k).padStart(4)}  mean rim RGB ${k ? [rr / k, gg / k, bb / k].map((v) => v.toFixed(0).padStart(3)).join(',') : '   -'}`);
    tiles.push(tile);
  }
  const W = N * 3 + 8, H = N;
  const canvas = Buffer.alloc(W * H * 3, 40);
  tiles.forEach((t, j) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const s = (y * N + x) * 3, d = (y * W + j * (N + 4) + x) * 3;
    canvas[d] = t[s]; canvas[d + 1] = t[s + 1]; canvas[d + 2] = t[s + 2]; } });
  await sharp(canvas, { raw: { width: W, height: H, channels: 3 } }).resize(W * 6, H * 6, { kernel: 'nearest' })
    .png().toFile(`${OUT}/halo-sim-${cell.replace(/\.png$/, '')}.png`);
}
for (const r of rows) console.log(r);
