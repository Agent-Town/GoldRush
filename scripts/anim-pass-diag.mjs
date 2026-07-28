#!/usr/bin/env node
/**
 * anim-pass-diag.mjs — THE EIGHT WINDS (2026-07-28), composition arm.
 *
 * Builds a SIBLING diagonal sheet — `char-<name>-sheet-walkdiag<F>[-<suffix>].png`,
 * rows sw / se / nw / ne — beside an existing base sheet that is never touched.
 *
 * Everything geometric is taken from the base sheet, not from the generator:
 *   cell size    exactly the base's floor(w/cols) x floor(h/rows), so the two
 *                sheets slice identically and no contract number moves
 *   figure scale chosen so the composed median FIGURE height equals the base's
 *   ground line  every figure's feet land on the base's median foot line
 *   centre       every figure centred on the base's median cell-local centre
 * so a diagonal frame cannot size-pop or bob against the cardinal frame it cuts
 * to mid-stride (the s37 cross-sheet size law).
 *
 * "Figure height" is measured to the FOOT LINE, not the bbox bottom — the rail
 * tough's wrench taught this pass that a prop hanging below the boots will
 * otherwise be seated on the ground and lever the whole body out of the cell
 * (see anim-pass-graft.mjs).
 *
 *   node scripts/anim-pass-diag.mjs --base <stem> --out <stem> --row <0-3> \
 *        --src <generated.png> --src-grid CxR [--cols N] [--dry]
 *   node scripts/anim-pass-diag.mjs --base <stem> --out <stem> --row <0-3> \
 *        --copy-row <baseRow>            # lift a row the base already has, verbatim
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const has = (k) => A.includes(k);
const TOL = 26;
const ROW_NAMES = ['sw', 'se', 'nw', 'ne'];

const baseStem = arg('--base');
const outStem = arg('--out');
const row = Number(arg('--row'));
const copyRow = arg('--copy-row') === null ? null : Number(arg('--copy-row'));
const srcFile = arg('--src');
const basePath = path.join('assets/raw', `${baseStem}.png`);
const outPath = path.join('assets/raw', `${outStem}.png`);

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
function bboxIn(png, key, ox, oy, cw, ch) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (dist(png.data, ((png.width * (oy + y) + (ox + x)) << 2), key) <= TOL) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
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
const sample = (png, fx, fy) => {
  const x0 = Math.max(0, Math.min(png.width - 1, Math.floor(fx))), x1 = Math.min(png.width - 1, x0 + 1);
  const y0 = Math.max(0, Math.min(png.height - 1, Math.floor(fy))), y1 = Math.min(png.height - 1, y0 + 1);
  const wx = fx - x0, wy = fy - y0, o = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const p00 = png.data[((png.width * y0 + x0) << 2) + k], p10 = png.data[((png.width * y0 + x1) << 2) + k];
    const p01 = png.data[((png.width * y1 + x0) << 2) + k], p11 = png.data[((png.width * y1 + x1) << 2) + k];
    o[k] = p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy;
  }
  return o;
};

// --- the base sheet, read-only: geometry + the band every wind must land in ----
const base = PNG.sync.read(fs.readFileSync(basePath));
const [bCols, bRows] = arg('--base-grid', '0x0') !== '0x0'
  ? arg('--base-grid').split('x').map(Number)
  : (() => { const m = /walk(\d+)|hover(\d+)/.exec(baseStem); const f = m ? Number(m[1] ?? m[2]) : 8; return [f, 4]; })();
const cw = Math.floor(base.width / bCols), ch = Math.floor(base.height / bRows);
const cols = Number(arg('--cols', String(bCols)));
const baseKey = detectKey(base);

const cells = [];
for (let r = 0; r < bRows; r++) for (let c = 0; c < bCols; c++) {
  const f = figure(base, baseKey, c * cw, r * ch, cw, ch);
  if (f) cells.push({ r, c, ...f });
}
if (!cells.length) { console.error(`base ${baseStem} has no measurable figures`); process.exit(1); }
const refH = median(cells.map((f) => f.figH));
const refFoot = median(cells.map((f) => f.foot));
const refCentre = median(cells.map((f) => (f.x0 + f.x1) / 2));
const perRow = [];
for (let r = 0; r < bRows; r++) {
  const rr = cells.filter((f) => f.r === r);
  if (rr.length) perRow.push(`r${r}: h ${Math.min(...rr.map((f) => f.figH))}-${Math.max(...rr.map((f) => f.figH))} (med ${median(rr.map((f) => f.figH))}), foot ${median(rr.map((f) => f.foot))}`);
}
console.log(`base ${baseStem} ${base.width}x${base.height} @${bCols}x${bRows}, cell ${cw}x${ch}, key #${baseKey.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
perRow.forEach((s) => console.log(`  ${s}`));
console.log(`BAND: median figure height ${refH}px, foot line y=${refFoot}, centre x=${refCentre.toFixed(1)}`);

// --- the sibling sheet: created on first row, extended in place afterwards ----
const outW = cols * cw, outH = 4 * ch;
let out;
if (fs.existsSync(outPath)) {
  out = PNG.sync.read(fs.readFileSync(outPath));
  if (out.width !== outW || out.height !== outH) { console.error(`existing ${outPath} is ${out.width}x${out.height}, expected ${outW}x${outH}`); process.exit(1); }
} else {
  out = new PNG({ width: outW, height: outH });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = baseKey[0]; out.data[i + 1] = baseKey[1]; out.data[i + 2] = baseKey[2]; out.data[i + 3] = 255;
  }
  console.log(`will create ${outPath} ${outW}x${outH} @${cols}x4, rows ${ROW_NAMES.join(' / ')}, filled with the base sheet's own key`);
}
// wipe the target row to pure key so no fragment of a previous take survives
for (let y = row * ch; y < (row + 1) * ch; y++) for (let x = 0; x < outW; x++) {
  const i = ((outW * y + x) << 2);
  out.data[i] = baseKey[0]; out.data[i + 1] = baseKey[1]; out.data[i + 2] = baseKey[2]; out.data[i + 3] = 255;
}

if (copyRow !== null) {
  // Lift a row the base ALREADY draws in this wind. No rescale, no reseat: the
  // cells are byte-copied, which is the only way to be certain the lifted wind
  // is the same art the game already ships.
  const n = Math.min(cols, bCols);
  for (let c = 0; c < n; c++) for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const s = ((base.width * (copyRow * ch + y) + (c * cw + x)) << 2);
    const d = ((outW * (row * ch + y) + (c * cw + x)) << 2);
    out.data[d] = base.data[s]; out.data[d + 1] = base.data[s + 1]; out.data[d + 2] = base.data[s + 2]; out.data[d + 3] = 255;
  }
  if (has('--dry')) { console.log('--dry: nothing written'); process.exit(0); }
  fs.writeFileSync(outPath, PNG.sync.write(out));
  console.log(`row ${row} (${ROW_NAMES[row]}) ← base row ${copyRow}, ${n} cells copied byte-for-byte`);
  process.exit(0);
}

const [scols, srows] = arg('--src-grid').split('x').map(Number);
const src = PNG.sync.read(fs.readFileSync(srcFile));
const srcKey = detectKey(src);
const scw = Math.floor(src.width / scols), sch = Math.floor(src.height / srows);
const got = [];
for (let r = 0; r < srows; r++) for (let c = 0; c < scols; c++) {
  const f = figure(src, srcKey, c * scw, r * sch, scw, sch);
  if (f) got.push({ r, c, ...f });
}
console.log(`\nsource ${path.basename(srcFile)} ${src.width}x${src.height} @${scols}x${srows}, key #${srcKey.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
got.forEach((f, i) => console.log(`  frame ${i} r${f.r}c${f.c}: bbox ${f.w}x${f.h} at (${f.x0},${f.y0}) · figure ${f.figH}${f.foot < f.y1 ? ` (+${f.y1 - f.foot}px prop below the feet)` : ''}`));
if (got.length !== cols) console.log(`NOTE: ${got.length} source figures for ${cols} target columns`);
const srcH = median(got.map((f) => f.figH));
/**
 * `--scale-mul` corrects the one case where matching FOOT-LINE heights does not
 * land the EXTRACTED cells in the base's band: the Prospector hovers, so its
 * foot line is the bottom of the body while extract-alpha's bbox also swallows
 * the jet plume below it. Matching the body left the shipped cells 6.0% narrow
 * and 6.3% short — a visible shrink every time the companion turns 45°, which
 * is exactly the size-pop the s21 rotation note tells this repo to watch for.
 * Walkers need no multiplier and get none; the value used is recorded in the run file.
 */
const scale = (refH / srcH) * Number(arg('--scale-mul', '1'));
console.log(`source median figure ${srcH}px → scale ${scale.toFixed(4)} · composed heights ${got.slice(0, cols).map((f) => Math.round(f.figH * scale)).join(', ')}`);
if (has('--dry')) { console.log('\n--dry: nothing written'); process.exit(0); }

let placed = 0, lost = 0, over = 0;
for (let c = 0; c < cols && c < got.length; c++) {
  const f = got[c];
  const dw = Math.round(f.w * scale), dh = Math.round(f.h * scale);
  const dx0 = Math.round(c * cw + refCentre - dw / 2);
  const dy0 = Math.round(row * ch + refFoot - (f.foot - f.y0) * scale);
  for (let y = 0; y < dh; y++) {
    const sy = f.r * sch + f.y0 + (y / scale);
    const ty = dy0 + y;
    if (ty < row * ch || ty >= (row + 1) * ch) { lost++; continue; }
    for (let x = 0; x < dw; x++) {
      const sx = f.c * scw + f.x0 + (x / scale);
      const tx = dx0 + x;
      if (tx < c * cw || tx >= (c + 1) * cw) { over++; continue; }
      const px = sample(src, sx, sy);
      if (Math.max(Math.abs(px[0] - srcKey[0]), Math.abs(px[1] - srcKey[1]), Math.abs(px[2] - srcKey[2])) <= TOL) continue;
      const i = ((outW * ty + tx) << 2);
      out.data[i] = Math.round(px[0]); out.data[i + 1] = Math.round(px[1]); out.data[i + 2] = Math.round(px[2]); out.data[i + 3] = 255;
    }
  }
  placed++;
  const ly = dy0 - row * ch;
  console.log(`  col ${c} ← frame ${c}: ${dw}x${dh} at cell-local (${dx0 - c * cw},${ly})${ly < 0 ? '  ⚠ ABOVE CELL TOP' : ''}`);
}
if (lost) console.log(`⚠ ${lost} scanlines fell outside the row band and were dropped`);
if (over) console.log(`⚠ ${over} pixels fell outside their own column and were dropped (no neighbour was polluted)`);
fs.writeFileSync(outPath, PNG.sync.write(out));
console.log(`\ncomposed ${placed} frames into row ${row} (${ROW_NAMES[row]}) of ${outPath} — ${outW}x${outH} @${cols}x4, cell ${cw}x${ch} identical to ${baseStem}`);
