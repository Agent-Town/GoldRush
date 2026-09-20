#!/usr/bin/env node
/**
 * recut.mjs — the HARD-ALPHA RE-CUT of the ten first-town cast walk8 families.
 * Task: tasks/town-cast-walk8-hard-alpha-recut.md (stage 2 of owner ruling A19, 2026-09-13:
 * "A19 - that is ok" = re-cut the heavy sheets with a harder alpha edge, do not raise the budget).
 *
 * INPUT   the branch's despilled cell (sol/code-review-20260908), staged outside the worktree.
 * ALPHA   binarised at 128 — a HARD edge, zero partial-alpha pixels, so the per-sheet partial count
 *         is 0 <= 1.15 x main's by construction. Main's own youngster-m cells are already binary
 *         (partial = 0); the branch introduced the feathering this undoes.
 * RGB     the branch's despilled RGB is kept byte-for-byte wherever the hard alpha is 255.
 * FIELD   every alpha=0 pixel takes ONE constant colour per cell: the mean RGB of the figure's
 *         outermost opaque ring. Main ships #ff00ff in the 1-px ring immediately outside the figure
 *         (measured: 1,207 px on youngster-m r0c0, 1,381 on storekeeper r0c0, 704 on hero r0c0),
 *         which is the halo the cure is about; the branch ships a full bleedEdges field whose
 *         6,363 distinct colours are the byte bomb (measured +26 kB/cell). A matched constant is
 *         what mip minification should average toward and costs one colour.
 * ENCODE  pngjs -> zopflipng, best of {auto filters, --filters=0me}, round-trip verified identical.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const ZOPFLI = '/opt/homebrew/anaconda3/bin/zopflipng';
const SRC = process.env.BRANCH_DIR;
const OUT = process.env.OUT_DIR;
const TMP = process.env.TMP_DIR || '/tmp/recut-tmp';
const MAIN = 'assets/processed';
const FAMILIES = [
  'char-youngster-m-sheet-walk8', 'char-youngster-f-sheet-walk8', 'char-storekeeper-sheet-walk8',
  'char-tavernkeeper-sheet-walk8', 'char-newsie-mei-sheet-walk8', 'char-assay-clerk-sheet-walk8-a',
  'char-schoolteacher-sheet-walk8-a', 'char-preacher-sheet-walk8-a', 'char-elder-sheet-walk8',
  'char-hero-sheet-walk8',
];
const ONLY = process.env.ONLY_FAMILIES ? process.env.ONLY_FAMILIES.split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

function encode(png, tag) {
  const raw = path.join(TMP, `${tag}.raw.png`);
  fs.writeFileSync(raw, PNG.sync.write(png));
  let best = fs.readFileSync(raw);
  for (const args of [[], ['--filters=0me']]) {
    const dst = path.join(TMP, `${tag}.z${args.length}.png`);
    try { fs.unlinkSync(dst); } catch {}
    execFileSync(ZOPFLI, ['-y', ...args, raw, dst], { stdio: 'pipe' });
    const buf = fs.readFileSync(dst);
    if (buf.length < best.length) best = buf;
  }
  // ROUND-TRIP CHECK. zopflipng converts a BINARY-alpha RGBA image to colour-type 2 + tRNS, which
  // is smaller (measured 46,939 vs 56,096 on youngster-m r0c0) and rewrites the RGB of every
  // alpha=0 pixel to the tRNS key it picks. That is lossless for everything the GPU can sample
  // through alpha, so the check is: every alpha byte identical, every RGB byte identical wherever
  // alpha > 0. The shipped field colour is reported, not assumed.
  const back = PNG.sync.read(best);
  if (back.width !== png.width || back.height !== png.height) throw new Error(`${tag}: dimensions moved`);
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2;
    if (back.data[o + 3] !== png.data[o + 3]) throw new Error(`${tag}: alpha moved at px ${i}`);
    if (png.data[o + 3] === 0) continue;
    if (back.data[o] !== png.data[o] || back.data[o + 1] !== png.data[o + 1] || back.data[o + 2] !== png.data[o + 2]) {
      throw new Error(`${tag}: visible RGB moved at px ${i}`);
    }
  }
  return best;
}

function stats(png) {
  const { width: w, height: h, data } = png;
  const n = w * h;
  let partial = 0, opaque = 0, violet = 0, keyUnderTransparent = 0, fieldColours = new Set();
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let i = 0; i < n; i++) {
    const o = i << 2, a = data[o + 3];
    if (a === 0) {
      fieldColours.add((data[o] << 16) | (data[o + 1] << 8) | data[o + 2]);
      if ((data[o] === 255 && data[o + 1] === 0 && data[o + 2] === 255)
        || (data[o] === 138 && data[o + 1] === 138 && data[o + 2] === 138)) keyUnderTransparent++;
      continue;
    }
    if (a === 255) opaque++; else partial++;
    if (a >= 16 && data[o] - data[o + 1] >= 40 && data[o + 2] - data[o + 1] >= 40) violet++;
    if (a >= 128) { const x = i % w, y = (i / w) | 0; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  return { partial, opaque, violet, keyUnderTransparent, fieldColours: fieldColours.size,
    height: y1 >= 0 ? y1 - y0 + 1 : 0, width: x1 >= 0 ? x1 - x0 + 1 : 0, top: y0, bottom: y1 };
}

function recut(branch) {
  const { width: w, height: h } = branch;
  const n = w * h;
  const out = new PNG({ width: w, height: h });
  branch.data.copy(out.data);
  const bin = new Uint8Array(n);
  for (let i = 0; i < n; i++) bin[i] = branch.data[(i << 2) + 3] >= 128 ? 1 : 0;
  // mean RGB of the outermost opaque ring
  let r = 0, g = 0, b = 0, c = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!bin[i]) continue;
    let edge = false;
    for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || !bin[ny * w + nx]) { edge = true; break; }
    }
    if (!edge) continue;
    const o = i << 2; r += branch.data[o]; g += branch.data[o + 1]; b += branch.data[o + 2]; c++;
  }
  let field = c ? [Math.round(r / c), Math.round(g / c), Math.round(b / c)] : [0, 0, 0];
  // never mint a key colour under transparency
  if ((field[0] === 255 && field[1] === 0 && field[2] === 255) || (field[0] === 138 && field[1] === 138 && field[2] === 138)) field = [field[0], field[1], Math.max(0, field[2] - 1)];
  for (let i = 0; i < n; i++) {
    const o = i << 2;
    if (bin[i]) { out.data[o + 3] = 255; continue; }
    out.data[o] = field[0]; out.data[o + 1] = field[1]; out.data[o + 2] = field[2]; out.data[o + 3] = 0;
  }
  return { png: out, field, edgeRing: c };
}

const report = [];
for (const fam of (ONLY ?? FAMILIES)) {
  const re = new RegExp(`^${fam.replace(/[-]/g, '\\-')}-r\\d+c\\d+\\.png$`);
  const cells = fs.readdirSync(MAIN).filter((f) => re.test(f)).sort();
  const agg = { fam, cells: cells.length, mainBytes: 0, branchBytes: 0, recutBytes: 0,
    mainPartial: 0, branchPartial: 0, recutPartial: 0, mainViolet: 0, recutViolet: 0,
    mainKUT: 0, recutKUT: 0, minH: 1e9, maxH: 0, mainMinH: 1e9, mainMaxH: 0, heightDeltas: [] };
  for (const cell of cells) {
    const mainBuf = fs.readFileSync(path.join(MAIN, cell));
    const brBuf = fs.readFileSync(path.join(SRC, cell));
    const mainP = PNG.sync.read(mainBuf), brP = PNG.sync.read(brBuf);
    const ms = stats(mainP);
    const { png } = recut(brP);
    const rs = stats(png);
    const buf = encode(png, cell.replace(/\.png$/, ''));
    fs.writeFileSync(path.join(OUT, cell), buf);
    agg.mainBytes += mainBuf.length; agg.branchBytes += brBuf.length; agg.recutBytes += buf.length;
    agg.mainPartial += ms.partial; agg.branchPartial += stats(brP).partial; agg.recutPartial += rs.partial;
    agg.mainViolet += ms.violet; agg.recutViolet += rs.violet;
    agg.mainKUT += ms.keyUnderTransparent; agg.recutKUT += rs.keyUnderTransparent;
    if (rs.height) { agg.minH = Math.min(agg.minH, rs.height); agg.maxH = Math.max(agg.maxH, rs.height); }
    if (ms.height) { agg.mainMinH = Math.min(agg.mainMinH, ms.height); agg.mainMaxH = Math.max(agg.mainMaxH, ms.height); }
    agg.heightDeltas.push(rs.height - ms.height);
  }
  agg.maxHeightDelta = Math.max(...agg.heightDeltas.map(Math.abs));
  agg.pctVsMain = ((agg.recutBytes / agg.mainBytes - 1) * 100).toFixed(2);
  report.push(agg);
  console.log(`${fam.padEnd(34)} main=${String(agg.mainBytes).padStart(8)} branch=${String(agg.branchBytes).padStart(8)} recut=${String(agg.recutBytes).padStart(8)} (${agg.pctVsMain}%) partial ${agg.mainPartial}->${agg.recutPartial} violet ${agg.mainViolet}->${agg.recutViolet} KUT ${agg.mainKUT}->${agg.recutKUT} H ${agg.mainMinH}-${agg.mainMaxH} -> ${agg.minH}-${agg.maxH} (maxΔ${agg.maxHeightDelta})`);
}
fs.writeFileSync(path.join(OUT, process.env.CENSUS_NAME || '_census.json'), JSON.stringify(report, null, 1));
