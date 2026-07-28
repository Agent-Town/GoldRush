#!/usr/bin/env node
/**
 * anim-pass-montage.mjs — THE EIGHT WINDS (2026-07-28), eyes arm (multi-sheet).
 *
 * anim-pass-crop.mjs tiles cells of ONE sheet. Judging identity across the cast
 * needs the opposite: one cell from each of many sheets, side by side, so the
 * asymmetric props (which shoulder carries the towel, which hip the satchel) can
 * be read in a single look instead of nine.
 *
 *   node scripts/anim-pass-montage.mjs --out name.png --h 380 --cols 6 \
 *        <stem>:<CxR>:<r,c> <stem>:<CxR>:<r,c> ...
 *
 * A spec may name a raw stem (assets/raw/<stem>.png) or a path ending in .png.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const OUT_DIR = 'reviews/eight-winds/crops';
const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const outName = arg('--out', 'montage.png');
const targetH = Number(arg('--h', '380'));
const perRow = Number(arg('--cols', '6'));
const specs = A.filter((a, i) => !a.startsWith('--') && !(i > 0 && A[i - 1].startsWith('--')));

const cache = new Map();
const load = (file) => {
  if (!cache.has(file)) cache.set(file, PNG.sync.read(fs.readFileSync(file)));
  return cache.get(file);
};

const tiles = [];
for (const spec of specs) {
  const [stem, grid, cell] = spec.split(':');
  const file = stem.endsWith('.png') ? stem : path.join('assets/raw', `${stem}.png`);
  const [cols, rows] = grid.split('x').map(Number);
  const [r, c] = cell.split(',').map(Number);
  const png = load(file);
  const cw = Math.floor(png.width / cols), ch = Math.floor(png.height / rows);
  const scale = targetH / ch;
  const tw = Math.round(cw * scale), th = targetH;
  const tile = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const sx = Math.min(cw - 1, Math.floor(x / scale)) + c * cw;
    const sy = Math.min(ch - 1, Math.floor(y / scale)) + r * ch;
    const s = (png.width * sy + sx) << 2, d = (tw * y + x) << 2;
    tile.data[d] = png.data[s]; tile.data[d + 1] = png.data[s + 1];
    tile.data[d + 2] = png.data[s + 2]; tile.data[d + 3] = 255;
  }
  tiles.push({ tile, label: `${path.basename(file, '.png')} r${r}c${c}` });
}

const GAP = 6;
const rowsN = Math.ceil(tiles.length / perRow);
const colW = Math.max(...tiles.map((t) => t.tile.width));
const outW = perRow * colW + (perRow + 1) * GAP;
const outH = rowsN * targetH + (rowsN + 1) * GAP;
const out = new PNG({ width: outW, height: outH });
for (let i = 0; i < out.data.length; i += 4) { out.data[i] = 20; out.data[i + 1] = 20; out.data[i + 2] = 24; out.data[i + 3] = 255; }
tiles.forEach(({ tile }, i) => {
  const gx = GAP + (i % perRow) * (colW + GAP) + Math.round((colW - tile.width) / 2);
  const gy = GAP + Math.floor(i / perRow) * (targetH + GAP);
  for (let y = 0; y < tile.height; y++) for (let x = 0; x < tile.width; x++) {
    const s = (tile.width * y + x) << 2, d = (outW * (gy + y) + (gx + x)) << 2;
    out.data[d] = tile.data[s]; out.data[d + 1] = tile.data[s + 1];
    out.data[d + 2] = tile.data[s + 2]; out.data[d + 3] = 255;
  }
});
fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, outName);
fs.writeFileSync(outPath, PNG.sync.write(out));
console.log(`${outPath} — ${tiles.length} tiles @${perRow} per row`);
tiles.forEach((t, i) => console.log(`  ${i}: ${t.label}`));
