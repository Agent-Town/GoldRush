#!/usr/bin/env node
/**
 * anim-pass-heads.mjs — THE ANIMATION PASS (2026-07-25), facing-verdict arm.
 *
 * A silhouette mirror-test cannot tell a true left/right pair from the SAME walk
 * viewed from the front and from behind — both read as mirrors. Only the face
 * settles it. This tiles the HEAD of chosen cells, magnified, so one image decides
 * the direction-row verdict for a whole batch of sheets.
 *
 * Reads reviews/anim-pass-2026-07-25/data/<stem>.json for the grid + the cell's
 * content bbox, crops the top `--band` (default 0.42) of that bbox, and scales it
 * into a fixed tile. Writes into reviews/anim-pass-2026-07-25/crops/.
 *
 *   node scripts/anim-pass-heads.mjs --out lr.png --cols 8 <stem>[:r,c] ...
 *     bare <stem>  = rows 1 and 2 at column 0 (the LEFT/RIGHT contract rows)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const DATA = 'reviews/anim-pass-2026-07-25/data';
const OUT = 'reviews/anim-pass-2026-07-25/crops';
const args = process.argv.slice(2);
let outName = 'heads.png', tile = 230, cols = 8, band = 0.42;
const specs = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') { outName = args[++i]; continue; }
  if (a === '--tile') { tile = Number(args[++i]); continue; }
  if (a === '--cols') { cols = Number(args[++i]); continue; }
  if (a === '--band') { band = Number(args[++i]); continue; }
  const [stem, cell] = a.split(':');
  if (cell) specs.push({ stem, cell });
  else { specs.push({ stem, cell: '1,0' }); specs.push({ stem, cell: '2,0' }); }
}

const sheetCache = new Map();
const load = (stem) => {
  if (!sheetCache.has(stem)) sheetCache.set(stem, {
    png: PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${stem}.png`))),
    data: JSON.parse(fs.readFileSync(path.join(DATA, `${stem}.json`), 'utf8')),
  });
  return sheetCache.get(stem);
};

const rows = Math.ceil(specs.length / cols);
const GAP = 4;
const out = new PNG({ width: cols * (tile + GAP) + GAP, height: rows * (tile + GAP) + GAP });
for (let i = 0; i < out.width * out.height; i++) { const o = i << 2; out.data[o] = 18; out.data[o + 1] = 18; out.data[o + 2] = 24; out.data[o + 3] = 255; }

const legend = [];
specs.forEach((s, n) => {
  const { png, data } = load(s.stem);
  const [gc, gr] = data.grid;
  const [r, c] = s.cell.split(',').map(Number);
  const cell = data.cells.find((k) => k.row === r && k.col === c);
  if (!cell || cell.empty) { legend.push(`${n}: ${s.stem} r${r}c${c} EMPTY`); return; }
  const cw = png.width / gc, ch = png.height / gr;
  const ax = Math.round(c * cw), ay = Math.round(r * ch);
  const [bx0, by0, bx1, by1] = cell.bbox;
  const bh = Math.max(1, Math.round((by1 - by0 + 1) * band)), bw = bx1 - bx0 + 1;
  // square-ish source window centred on the head
  const side = Math.max(bh, Math.round(bw * 0.9));
  const sx0 = Math.round(ax + bx0 + (bw - side) / 2), sy0 = ay + by0;
  const tx = GAP + (n % cols) * (tile + GAP), ty = GAP + Math.floor(n / cols) * (tile + GAP);
  for (let y = 0; y < tile; y++) {
    const sy = sy0 + Math.floor((y * side) / tile);
    for (let x = 0; x < tile; x++) {
      const sx = sx0 + Math.floor((x * side) / tile);
      const di = ((out.width * (ty + y) + tx + x) << 2);
      if (sx < 0 || sy < 0 || sx >= png.width || sy >= png.height) continue;
      const si = ((png.width * sy + sx) << 2);
      out.data[di] = png.data[si]; out.data[di + 1] = png.data[si + 1]; out.data[di + 2] = png.data[si + 2];
    }
  }
  legend.push(`${String(n).padStart(2)}: ${s.stem} r${r}c${c}`);
});
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, outName), PNG.sync.write(out));
console.log(legend.join('\n'));
console.log(`→ ${path.join(OUT, outName)} (${cols} cols, tile ${tile}, band ${band}) — reading order is left→right, top→bottom`);
