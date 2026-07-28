#!/usr/bin/env node
/**
 * anim-pass-winds.mjs — THE EIGHT WINDS (2026-07-28), assembly + verdict arm.
 *
 * Composes a character's whole diagonal sibling in one call and then MEASURES
 * it, so the verdict for a sheet is produced by the same command that built it
 * and cannot drift from it.
 *
 * A wind may come from a generation (`--src`) or, where the base sheet already
 * draws that wind, be LIFTED byte-for-byte from the base. Lifting is preferred
 * wherever it is available: it is free, and it cannot drift from the identity
 * the game already ships.
 *
 * The preacher / schoolteacher / assay clerk `-a` sheets are the case that pays:
 * their true row order is `s / sw / e / nw`, so rows 1 and 3 ARE sw and nw and
 * only se + ne need generating. (F-M3-3 records that order as `s / sw / w / nw`
 * and concludes "no east frame exists"; row 2 is an EAST-facing profile on all
 * three — see F-EW-3, and see the predecessor's own `crops/m3-a-partners-rows.png`,
 * which shows it.)
 *
 *   node scripts/anim-pass-winds.mjs <character> [--lift sw=1,nw=3] [--frames N] [--measure-only]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const name = A[0];
const CAST = JSON.parse(fs.readFileSync('reviews/eight-winds/cast.json', 'utf8')).cast;
const c = CAST[name];
if (!c) { console.error(`unknown character ${name}`); process.exit(2); }

const WINDS = ['sw', 'se', 'nw', 'ne'];
const frames = Number(arg('--frames', String(c.frames)));
const kind = c.gait === 'hover' ? 'hover' : 'walk';
const suffix = /-(a|b)$/.exec(c.base)?.[1];
const outStem = `${c.base.replace(/-sheet-.*$/, '')}-sheet-${kind}diag${frames}${suffix ? `-${suffix}` : ''}`;
const outPath = path.join('assets/raw', `${outStem}.png`);
const scaleMul = arg('--scale-mul', null);
const lift = Object.fromEntries((arg('--lift', '') || '').split(',').filter(Boolean).map((s) => s.split('=')));
const [bCols, bRows] = c.grid.split('x').map(Number);

if (!A.includes('--measure-only')) {
  if (fs.existsSync(outPath)) fs.rmSync(outPath); // rebuild from scratch: rows are authored, never accumulated
  for (let r = 0; r < 4; r++) {
    const wind = WINDS[r];
    const base = ['--base', c.base, '--base-grid', c.grid, '--out', outStem, '--row', String(r), '--cols', String(frames)];
    if (scaleMul) base.push('--scale-mul', scaleMul);
    if (lift[wind] !== undefined) {
      execFileSync('node', ['scripts/anim-pass-diag.mjs', ...base, '--copy-row', lift[wind]], { stdio: 'inherit' });
      continue;
    }
    const src = `reviews/eight-winds/gen/${name}-${wind}-${frames >= 8 ? '4x2' : '2x2'}.png`;
    if (!fs.existsSync(src)) { console.error(`MISSING generation for ${name}:${wind} (${src})`); process.exit(1); }
    execFileSync('node', ['scripts/anim-pass-diag.mjs', ...base, '--src', src, '--src-grid', frames >= 8 ? '4x2' : '2x2'], { stdio: 'inherit' });
  }
}

// --- verdict ------------------------------------------------------------------
const scaleOf = (stem) => {
  const p = `assets/processed/${stem}.frames.json`;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).scale : 1;
};
const scale = scaleOf(c.base);
const scratch = '.scratch-ew/proc';
execFileSync('node', ['scripts/extract-alpha.mjs', '--key', 'ff00ff', '--grid', `${frames}x4`,
  '--scale', String(scale), '--out', scratch, outPath], { stdio: 'inherit' });

const heights = (j) => j.cells.filter((x) => !x.empty).map((x) => x.bbox[3] - x.bbox[1]);
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const baseJson = `assets/processed/${c.base}.frames.json`;
let baseH = null;
if (fs.existsSync(baseJson)) baseH = heights(JSON.parse(fs.readFileSync(baseJson, 'utf8')));
else {
  // no shipped set for this base (some enemy sheets): measure the raw sheet directly
  const png = PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${c.base}.png`)));
  const cw = Math.floor(png.width / bCols), chh = Math.floor(png.height / bRows);
  baseH = [];
  for (let r = 0; r < bRows; r++) for (let col = 0; col < bCols; col++) {
    let y0 = Infinity, y1 = -1;
    for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) {
      const i = ((png.width * (r * chh + y) + (col * cw + x)) << 2);
      const d = Math.max(Math.abs(png.data[i] - 255), Math.abs(png.data[i + 1] - 0), Math.abs(png.data[i + 2] - 255));
      if (d <= 26) continue;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (y1 >= 0) baseH.push(y1 - y0);
  }
}
const outH = heights(JSON.parse(fs.readFileSync(`${scratch}/${outStem}.frames.json`, 'utf8')));
const cut = execFileSync('node', ['scripts/anim-pass-cut.mjs', '--grid', `${frames}x4`, outStem]).toString();
execFileSync('node', ['scripts/anim-pass-inspect.mjs', outStem], { stdio: 'pipe' });
const insp = execFileSync('node', ['scripts/anim-pass-dupecheck.mjs', outStem]).toString();

const drift = ((med(outH) - med(baseH)) / med(baseH) * 100).toFixed(1);
console.log(`\n=== ${outStem} ===`);
console.log(`base ${c.base}: ${baseH.length} figures, height ${Math.min(...baseH)}-${Math.max(...baseH)} med ${med(baseH)}`);
console.log(`new  ${outStem}: ${outH.length} cells, height ${Math.min(...outH)}-${Math.max(...outH)} med ${med(outH)}  → drift vs base ${drift > 0 ? '+' : ''}${drift}%`);
console.log(cut.trim().split('\n').slice(1).join('\n'));
console.log(insp.trim().split('\n')[0]);
console.log(`rows: 0 sw · 1 se · 2 nw · 3 ne   |   ${frames} frames   |   extracted at the base's pinned scale ${scale}`);
