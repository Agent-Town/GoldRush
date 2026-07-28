#!/usr/bin/env node
/**
 * anim-pass-cut.mjs — THE ANIMATION PASS, cell-cut arm (M3).
 *
 * The predecessor's pass measured BLEED — content sitting on a cell cut — with a
 * one-pixel probe (`anim-pass-inspect.mjs`). A probe says a cut is dirty; it does
 * not say WHO is bleeding, which way, or whether the mend is safe. This tool does.
 *
 * WHY THE DEFECT IS REAL. `extract-alpha.mjs --grid` computes each cell's alpha
 * bbox INSIDE that cell's own rectangle (sliceGrid, extract-alpha.mjs:296-307) and
 * centres it. So a neighbour's overhang that crosses the cut is, for the polluted
 * cell, indistinguishable from its own art: it widens that cell's bbox, drags the
 * centring off, and — because ONE shared scale is derived from the largest bbox
 * across the sheet (extract-alpha.mjs:310-311) — can shrink every figure on the
 * whole sheet.
 *
 * WHY THE MEND IS LOSSLESS. Cell sampling is clamped to the cell rect
 * (extract-alpha.mjs:324,328), so pixels lying outside a figure's OWN cell were
 * already dropped from that figure's shipped frame. Erasing them therefore cannot
 * remove anything the owner ships; it only stops them polluting the neighbour.
 * Cell boundaries never move — the sheet keeps its filename, dimensions and grid.
 *
 * THE SAFETY RULE. Components are assigned to the cell holding the plurality of
 * their mass, and only the out-of-cell remainder is erased. When a component
 * straddles a cut with a LARGE minority (two figures drawn touching, merged into
 * one blob) deleting the minority would delete a whole figure, so such components
 * are reported as STRADDLE and never auto-erased. Only OVERHANG is mended.
 *
 * Usage:
 *   node scripts/anim-pass-cut.mjs [--grid CxR] [--fix] [--out DIR] [--json DIR]
 *                                  [--max-minority-pct P] [--max-minority-px N]
 *                                  <sheet-stem ...>
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const RAW = 'assets/raw';
const TOL = 26; // extract-alpha's background core

const A = process.argv.slice(2);
const VALUED = new Set(['--grid', '--out', '--json', '--max-minority-pct', '--max-minority-px']);
const OPTS = new Map();
const STEMS = [];
for (let i = 0; i < A.length; i++) {
  const a = A[i];
  if (VALUED.has(a)) OPTS.set(a, A[++i]);
  else if (a.startsWith('--')) OPTS.set(a, true);
  else STEMS.push(a.replace(/\.png$/, '').replace(/^assets\/raw\//, ''));
}
const argOf = (k, d = null) => (OPTS.has(k) ? OPTS.get(k) : d);
const has = (k) => OPTS.has(k);
const FIX = has('--fix');
const OUTDIR = argOf('--out', RAW);
const JSONDIR = argOf('--json', null);
// An OVERHANG is a limb/prop/tail poking past the cut. A STRADDLE is two figures
// merged into one blob, or a figure genuinely sitting astride a cut: both get a
// report, only the first gets mended.
const MAX_MINORITY_PCT = Number(argOf('--max-minority-pct', '20'));
const MAX_MINORITY_PX = Number(argOf('--max-minority-px', '20000'));
const GRID_OVERRIDE = argOf('--grid', null);

const dist = (d, i, k) => Math.max(Math.abs(d[i] - k[0]), Math.abs(d[i + 1] - k[1]), Math.abs(d[i + 2] - k[2]));

/** Median border colour = the key the generator actually painted (same as inspect). */
function detectKey(png) {
  const { width: w, height: h, data } = png;
  const rs = [], gs = [], bs = [];
  const s = (x, y) => { const i = (w * y + x) << 2; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
  for (let x = 0; x < w; x += Math.max(1, w >> 7)) { s(x, 0); s(x, h - 1); }
  for (let y = 0; y < h; y += Math.max(1, h >> 7)) { s(0, y); s(w - 1, y); }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  return [med(rs), med(gs), med(bs)];
}

/** Grid the sheet actually ships at: prefer the processed frames.json, else convention. */
function shippedGrid(stem) {
  if (GRID_OVERRIDE) { const m = /^(\d+)x(\d+)$/.exec(GRID_OVERRIDE); if (m) return [Number(m[1]), Number(m[2]), 'override']; }
  const fj = path.join('assets/processed', `${stem}.frames.json`);
  if (fs.existsSync(fj)) { const d = JSON.parse(fs.readFileSync(fj, 'utf8')); return [d.grid.cols, d.grid.rows, 'frames.json']; }
  return [null, null, 'unknown'];
}

/**
 * 8-connected components over CONTENT (non-key) pixels. 8-connected on purpose:
 * a diagonal antialiased thread is one object to the eye and must not be split
 * into two components that then get assigned to different cells.
 */
function label(png, key) {
  const { width: w, height: h, data } = png;
  const lab = new Int32Array(w * h).fill(-1);
  const isContent = (i) => dist(data, i << 2, key) > TOL;
  const comps = [];
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (lab[s] !== -1 || !isContent(s)) continue;
    const id = comps.length;
    lab[s] = id; stack.push(s);
    let mass = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
    while (stack.length) {
      const i = stack.pop();
      const x = i % w, y = (i / w) | 0;
      mass++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if ((!dx && !dy) || nx < 0 || nx >= w) continue;
          const j = w * ny + nx;
          if (lab[j] !== -1 || !isContent(j)) continue;
          lab[j] = id; stack.push(j);
        }
      }
    }
    comps.push({ id, mass, bbox: [x0, y0, x1, y1] });
  }
  return { lab, comps };
}

function analyse(stem) {
  const file = path.join(RAW, `${stem}.png`);
  const png = PNG.sync.read(fs.readFileSync(file));
  const [cols, rows, gridSrc] = shippedGrid(stem);
  if (!cols) return { stem, error: 'no shipped grid (no frames.json, no --grid)' };
  const key = detectKey(png);
  const { width: w, height: h } = png;
  // extract-alpha's geometry EXACTLY: floor cells, right/bottom remainder unused.
  const cw = Math.floor(w / cols), ch = Math.floor(h / rows);
  const remW = w - cw * cols, remH = h - ch * rows;
  const cellOf = (x, y) => {
    const c = Math.floor(x / cw), r = Math.floor(y / ch);
    if (c >= cols || r >= rows) return -1; // remainder strip: extract-alpha never samples it
    return r * cols + c;
  };

  const { lab, comps } = label(png, key);
  // mass per (component, cell)
  const per = comps.map(() => new Map());
  let remainderPx = 0;
  for (let i = 0; i < w * h; i++) {
    const id = lab[i];
    if (id === -1) continue;
    const k = cellOf(i % w, (i / w) | 0);
    if (k === -1) { remainderPx++; continue; }
    per[id].set(k, (per[id].get(k) || 0) + 1);
  }

  const spanning = [];
  for (const comp of comps) {
    const m = per[comp.id];
    if (m.size <= 1) continue;
    const entries = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const [ownerCell, ownerMass] = entries[0];
    const foreign = entries.slice(1);
    const foreignMass = foreign.reduce((s, e) => s + e[1], 0);
    const total = ownerMass + foreignMass;
    const minorityPct = (foreignMass / total) * 100;
    const verdict = (minorityPct <= MAX_MINORITY_PCT && foreignMass <= MAX_MINORITY_PX) ? 'OVERHANG' : 'STRADDLE';
    spanning.push({
      id: comp.id, mass: comp.mass, bbox: comp.bbox,
      owner: { cell: ownerCell, rc: `r${Math.floor(ownerCell / cols)}c${ownerCell % cols}`, mass: ownerMass },
      foreign: foreign.map(([k, v]) => ({ cell: k, rc: `r${Math.floor(k / cols)}c${k % cols}`, mass: v })),
      foreignMass, minorityPct: +minorityPct.toFixed(2), verdict,
    });
  }
  spanning.sort((a, b) => b.foreignMass - a.foreignMass);
  return { stem, file, w, h, grid: [cols, rows], gridSrc, cellW: cw, cellH: ch, remainder: { w: remW, h: remH, px: remainderPx },
    keyRGB: key, components: comps.length, spanning, lab, png, cols, rows, cw, ch };
}

/** Erase every OVERHANG pixel that sits outside its component's owner cell. */
function mend(a) {
  const { png, lab, cols, cw, ch, keyRGB } = a;
  const { width: w, height: h, data } = png;
  const ownerOf = new Map();
  for (const s of a.spanning) if (s.verdict === 'OVERHANG') ownerOf.set(s.id, s.owner.cell);
  if (!ownerOf.size) return { erased: 0, cells: [] };
  const touched = new Map();
  let erased = 0;
  for (let i = 0; i < w * h; i++) {
    const id = lab[i];
    if (id === -1 || !ownerOf.has(id)) continue;
    const x = i % w, y = (i / w) | 0;
    const c = Math.floor(x / cw), r = Math.floor(y / ch);
    const k = (c >= a.cols || r >= a.rows) ? -1 : r * cols + c;
    if (k === ownerOf.get(id)) continue;
    if (k === -1) continue; // remainder strip is never sampled; leave the art intact
    const o = i << 2;
    data[o] = keyRGB[0]; data[o + 1] = keyRGB[1]; data[o + 2] = keyRGB[2]; data[o + 3] = 255;
    erased++;
    touched.set(k, (touched.get(k) || 0) + 1);
  }
  return { erased, cells: [...touched.entries()].map(([k, v]) => ({ rc: `r${Math.floor(k / cols)}c${k % cols}`, px: v })).sort((x, y) => y.px - x.px) };
}

const stems = STEMS;
if (!stems.length) { console.error('usage: node scripts/anim-pass-cut.mjs [--fix] [--grid CxR] <sheet-stem ...>'); process.exit(1); }
if (JSONDIR) fs.mkdirSync(JSONDIR, { recursive: true });

for (const stem of stems) {
  const a = analyse(stem);
  if (a.error) { console.log(`${stem}: ${a.error}`); continue; }
  const over = a.spanning.filter((s) => s.verdict === 'OVERHANG');
  const strad = a.spanning.filter((s) => s.verdict === 'STRADDLE');
  console.log(`\n=== ${stem} ${a.w}x${a.h} @${a.grid.join('x')} (${a.gridSrc}) cells ${a.cellW}x${a.cellH}` +
    `${a.remainder.w || a.remainder.h ? ` · unused remainder ${a.remainder.w}x${a.remainder.h}px (${a.remainder.px}px of art)` : ''}`);
  console.log(`  ${a.components} components · ${a.spanning.length} cross a cut: ${over.length} OVERHANG, ${strad.length} STRADDLE`);
  for (const s of [...over, ...strad].slice(0, 14)) {
    console.log(`  ${s.verdict.padEnd(9)} comp#${String(s.id).padStart(4)} mass ${String(s.mass).padStart(7)} owner ${s.owner.rc} (${s.owner.mass}) ` +
      `→ foreign ${s.foreign.map((f) => `${f.rc}:${f.mass}`).join(' ')} = ${s.foreignMass}px (${s.minorityPct}%)`);
  }
  if (a.spanning.length > 14) console.log(`  … ${a.spanning.length - 14} more`);
  const foreignTotal = a.spanning.reduce((t, s) => t + (s.verdict === 'OVERHANG' ? s.foreignMass : 0), 0);
  console.log(`  MENDABLE: ${foreignTotal}px of foreign art in ${new Set(over.flatMap((s) => s.foreign.map((f) => f.rc))).size} cells`);
  if (JSONDIR) {
    const { lab, png, ...clean } = a;
    fs.writeFileSync(path.join(JSONDIR, `${stem}.cut.json`), JSON.stringify(clean, null, 1) + '\n');
  }
  if (FIX) {
    if (strad.length) console.log(`  ⚠ ${strad.length} STRADDLE component(s) left untouched — deleting a large minority would delete a figure`);
    const res = mend(a);
    if (!res.erased) { console.log('  nothing to erase'); continue; }
    fs.mkdirSync(OUTDIR, { recursive: true });
    const outPath = path.join(OUTDIR, `${stem}.png`);
    fs.writeFileSync(outPath, PNG.sync.write(a.png));
    console.log(`  MENDED → ${outPath}: erased ${res.erased}px from ${res.cells.length} cells [${res.cells.map((c) => `${c.rc}:${c.px}`).join(' ')}]`);
    console.log(`  geometry untouched: ${a.w}x${a.h} @${a.grid.join('x')}, cells ${a.cellW}x${a.cellH}`);
  }
}
