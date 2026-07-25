#!/usr/bin/env node
/**
 * anim-pass-crop.mjs — THE ANIMATION PASS (2026-07-25), eyes arm.
 * Tiles chosen cells of a raw sheet into one PNG so a reviewer can judge gait and
 * facing at readable size. Reads only; writes into reviews/anim-pass-2026-07-25/crops/.
 *
 *   node scripts/anim-pass-crop.mjs <stem> <CxR> <r,c> [<r,c> ...] [--out name.png] [--h 420]
 *   node scripts/anim-pass-crop.mjs <stem> <CxR> row:2        # a whole row
 *   node scripts/anim-pass-crop.mjs <stem> <CxR> col:0        # a whole column
 *   node scripts/anim-pass-crop.mjs <stem> <CxR> all
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const OUT = 'reviews/anim-pass-2026-07-25/crops';
const args = process.argv.slice(2);
const stem = args[0].replace(/\.png$/, '').replace(/^assets\/raw\//, '');
const [cols, rows] = args[1].split('x').map(Number);
let outName = `${stem}-crop.png`, targetH = 420;
const picks = [];
for (let i = 2; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') { outName = args[++i]; continue; }
  if (a === '--h') { targetH = Number(args[++i]); continue; }
  if (a === 'all') { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) picks.push([r, c]); continue; }
  if (a.startsWith('row:')) { const r = Number(a.slice(4)); for (let c = 0; c < cols; c++) picks.push([r, c]); continue; }
  if (a.startsWith('col:')) { const c = Number(a.slice(4)); for (let r = 0; r < rows; r++) picks.push([r, c]); continue; }
  const [r, c] = a.split(',').map(Number);
  picks.push([r, c]);
}

const src = PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${stem}.png`)));
const cw = Math.floor(src.width / cols), ch = Math.floor(src.height / rows);
const scale = Math.min(1, targetH / ch);
const ow = Math.max(1, Math.round(cw * scale)), oh = Math.max(1, Math.round(ch * scale));
const GAP = 6;
const out = new PNG({ width: ow * picks.length + GAP * (picks.length + 1), height: oh + GAP * 2 });
// gutter ink so cell edges are unmistakable
for (let i = 0; i < out.width * out.height; i++) { const o = i << 2; out.data[o] = 20; out.data[o + 1] = 20; out.data[o + 2] = 28; out.data[o + 3] = 255; }
picks.forEach(([r, c], n) => {
  const ox = GAP + n * (ow + GAP), oy = GAP;
  for (let y = 0; y < oh; y++) {
    const sy = Math.min(src.height - 1, r * ch + Math.floor(y / scale));
    for (let x = 0; x < ow; x++) {
      const sx = Math.min(src.width - 1, c * cw + Math.floor(x / scale));
      const si = ((src.width * sy + sx) << 2), di = ((out.width * (oy + y) + ox + x) << 2);
      out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1]; out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = 255;
    }
  }
});
fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, outName);
fs.writeFileSync(file, PNG.sync.write(out));
console.log(`${file} — ${picks.length} cells (${picks.map(([r, c]) => `r${r}c${c}`).join(' ')}) from ${stem} @${cols}x${rows}, cell ${cw}x${ch} -> ${ow}x${oh}`);
