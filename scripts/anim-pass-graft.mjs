#!/usr/bin/env node
/**
 * anim-pass-graft.mjs — THE ANIMATION PASS (2026-07-25), mend arm.
 *
 * Grafts generated frames into ONE row of an existing raw sheet without moving a
 * single cell boundary — the task's rule is "keep cell geometry EXACT". The sheet
 * keeps its filename, dimensions and grid; only the pixels of the named row change.
 *
 * Figures are matched to the sheet they are joining, not to the generator's whim:
 *   scale     chosen so the grafted median figure height equals the reference row's
 *   baseline  every figure's feet land on the reference row's median ground line
 *   centre    every figure centred on the reference row's median x offset
 * so the mended row cannot size-pop or bob against the rows around it (s37 law).
 *
 *   node scripts/anim-pass-graft.mjs --sheet <stem> --grid CxR --row N \
 *        --src <generated.png> --src-grid CxR [--match-row M] [--out <path>] [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const has = (k) => A.includes(k);
const stem = arg('--sheet');
const [cols, rows] = arg('--grid').split('x').map(Number);
const row = Number(arg('--row'));
const srcFile = arg('--src');
const [scols, srows] = arg('--src-grid').split('x').map(Number);
const matchRow = Number(arg('--match-row', String(row === 1 ? 2 : 1)));
const sheetPath = path.join('assets/raw', `${stem}.png`);
const outPath = arg('--out', sheetPath);
const TOL = 26;

const dist = (d, i, k) => Math.max(Math.abs(d[i] - k[0]), Math.abs(d[i + 1] - k[1]), Math.abs(d[i + 2] - k[2]));
function detectKey(png) {
  const { width: w, height: h, data } = png;
  const rs = [], gs = [], bs = [];
  const s = (x, y) => { const i = (w * y + x) << 2; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
  for (let x = 0; x < w; x += Math.max(1, w >> 7)) { s(x, 0); s(x, h - 1); }
  for (let y = 0; y < h; y += Math.max(1, h >> 7)) { s(0, y); s(w - 1, y); }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  return [med(rs), med(gs), med(bs)];
}
/** bbox of non-key content inside a cell, in cell-local coords */
function bboxIn(png, key, ox, oy, cw, ch) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (dist(png.data, ((png.width * (oy + y) + (ox + x)) << 2), key) <= TOL) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
/**
 * Where the figure actually STANDS. The bbox bottom is not the feet when a prop
 * hangs lower — the rail tough's wrench dips below his boots, and aligning bbox
 * bottoms put the wrench tip on the ground line and shoved his head out of the
 * cell (grafted height 324 against a 274 reference, offset y=-41). The foot line
 * is the lowest scanline carrying a real run of figure, not a thin prop tip.
 */
function footLine(png, key, ox, oy, b) {
  const minRun = Math.max(3, Math.round(b.w * 0.12));
  for (let y = b.y1; y >= b.y0; y--) {
    let n = 0;
    for (let x = b.x0; x <= b.x1; x++) if (dist(png.data, ((png.width * (oy + y) + (ox + x)) << 2), key) > TOL) n++;
    if (n >= minRun) return y;
  }
  return b.y1;
}
function figure(png, key, ox, oy, cw, ch) {
  const b = bboxIn(png, key, ox, oy, cw, ch);
  if (!b) return null;
  const foot = footLine(png, key, ox, oy, b);
  return { ...b, foot, figH: foot - b.y0 + 1 };
}
const median = (a) => { const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };

const sheet = PNG.sync.read(fs.readFileSync(sheetPath));
const src = PNG.sync.read(fs.readFileSync(srcFile));
const sheetKey = detectKey(sheet), srcKey = detectKey(src);
const cw = Math.floor(sheet.width / cols), ch = Math.floor(sheet.height / rows);
const scw = Math.floor(src.width / scols), sch = Math.floor(src.height / srows);

// --- what the sheet expects, measured from the reference row -----------------
const ref = [];
for (let c = 0; c < cols; c++) {
  const b = figure(sheet, sheetKey, c * cw, matchRow * ch, cw, ch);
  if (b) ref.push(b);
}
if (!ref.length) { console.error(`reference row ${matchRow} is empty`); process.exit(1); }
const refH = median(ref.map((b) => b.figH));
const refFoot = median(ref.map((b) => b.foot));
const refCentre = median(ref.map((b) => (b.x0 + b.x1) / 2));

// --- what the generator gave -------------------------------------------------
const frames = [];
for (let r = 0; r < srows; r++) for (let c = 0; c < scols; c++) {
  const b = figure(src, srcKey, c * scw, r * sch, scw, sch);
  frames.push(b ? { r, c, ...b } : null);
}
const got = frames.filter(Boolean);
console.log(`source ${path.basename(srcFile)} ${src.width}x${src.height} @${scols}x${srows}, key #${srcKey.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
got.forEach((f, i) => console.log(`  frame ${i} r${f.r}c${f.c}: bbox ${f.w}x${f.h} at (${f.x0},${f.y0}) · figure height ${f.figH} (foot line y=${f.foot}${f.foot < f.y1 ? `, ${f.y1 - f.foot}px of prop hangs below` : ''})`));
if (got.length !== cols) console.log(`NOTE: ${got.length} source figures for ${cols} target columns`);
const srcH = median(got.map((f) => f.figH));
const scale = refH / srcH;
console.log(`\ntarget row ${row}: reference row ${matchRow} median FIGURE height ${refH}px, foot line y=${refFoot}, centre x=${refCentre}`);
console.log(`source median figure height ${srcH}px → scale ${scale.toFixed(4)} (grafted figure heights ${got.map((f) => Math.round(f.figH * scale)).join(', ')})`);
if (has('--dry')) { console.log('\n--dry: nothing written'); process.exit(0); }

// --- graft -------------------------------------------------------------------
const out = new PNG({ width: sheet.width, height: sheet.height });
sheet.data.copy(out.data);
// wipe the row to pure key first, so no fragment of the old art survives
for (let y = row * ch; y < (row + 1) * ch; y++) {
  for (let x = 0; x < sheet.width; x++) {
    const i = ((sheet.width * y + x) << 2);
    out.data[i] = sheetKey[0]; out.data[i + 1] = sheetKey[1]; out.data[i + 2] = sheetKey[2]; out.data[i + 3] = 255;
  }
}
const sample = (png, fx, fy) => { // bilinear
  const x0 = Math.max(0, Math.min(png.width - 1, Math.floor(fx))), x1 = Math.min(png.width - 1, x0 + 1);
  const y0 = Math.max(0, Math.min(png.height - 1, Math.floor(fy))), y1 = Math.min(png.height - 1, y0 + 1);
  const wx = fx - x0, wy = fy - y0, o = [0, 0, 0];
  for (let ch4 = 0; ch4 < 3; ch4++) {
    const p00 = png.data[((png.width * y0 + x0) << 2) + ch4], p10 = png.data[((png.width * y0 + x1) << 2) + ch4];
    const p01 = png.data[((png.width * y1 + x0) << 2) + ch4], p11 = png.data[((png.width * y1 + x1) << 2) + ch4];
    o[ch4] = p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy;
  }
  return o;
};
let placed = 0, lost = 0;
for (let c = 0; c < cols && c < got.length; c++) {
  const f = got[c];
  const dw = Math.round(f.w * scale), dh = Math.round(f.h * scale);
  const dx0 = Math.round(c * cw + refCentre - dw / 2);
  // FEET on the reference foot line — anything hanging below (a wrench, a coat
  // tail) simply extends downward from there instead of levering the figure up.
  const dy0 = Math.round(row * ch + refFoot - (f.foot - f.y0) * scale);
  for (let y = 0; y < dh; y++) {
    const sy = f.r * sch + f.y0 + (y / scale);
    const ty = dy0 + y;
    if (ty < row * ch || ty >= (row + 1) * ch) { lost++; continue; }
    for (let x = 0; x < dw; x++) {
      const sx = f.c * scw + f.x0 + (x / scale);
      const tx = dx0 + x;
      if (tx < c * cw || tx >= (c + 1) * cw) continue;
      const px = sample(src, sx, sy);
      // key pixels stay key: never paint the generator's background over the sheet
      if (Math.max(Math.abs(px[0] - srcKey[0]), Math.abs(px[1] - srcKey[1]), Math.abs(px[2] - srcKey[2])) <= TOL) continue;
      const i = ((out.width * ty + tx) << 2);
      out.data[i] = Math.round(px[0]); out.data[i + 1] = Math.round(px[1]); out.data[i + 2] = Math.round(px[2]); out.data[i + 3] = 255;
    }
  }
  placed++;
  const localY = dy0 - row * ch;
  console.log(`  col ${c} ← source frame ${c}: ${dw}x${dh} at cell-local (${dx0 - c * cw},${localY})${localY < 0 ? '  ⚠ ABOVE CELL TOP' : ''}`);
}
if (lost) console.log(`⚠ ${lost} scanlines fell outside the cell band and were dropped`);
fs.writeFileSync(outPath, PNG.sync.write(out));
console.log(`\ngrafted ${placed} frames into row ${row} of ${outPath} — sheet stays ${sheet.width}x${sheet.height} @${cols}x${rows}, every cell boundary untouched`);
