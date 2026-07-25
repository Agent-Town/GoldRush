#!/usr/bin/env node
/**
 * anim-pass-inspect.mjs — THE ANIMATION PASS (2026-07-25), measurement arm.
 *
 * Judges every character sheet the way the review demands, with numbers instead of
 * vibes. Reads only; writes JSON evidence under reviews/anim-pass-2026-07-25/data/.
 *
 * Per sheet:
 *   key       — background key detected from the border (ff00ff / 8a8a8a / other),
 *               purity (bg fraction), halo band (fringe px), interior spill blobs.
 *   grid      — expected grid from the processed frames.json (or the filename
 *               convention); every internal boundary probed for BLEED (content
 *               crossing the cut) and for GUTTER width (clean bg either side).
 *   cells     — per-cell bbox in cell-local coords, content px, height, baseline,
 *               centroid, edge-clipping, margins, alpha pHash + luma pHash.
 *   dupes     — pairwise: byte-identical, flip-identical, near-dupe (hash Hamming),
 *               near-mirror. This is the "no duplicate/mirrored cheats" test.
 *   rows      — per-row walk-cycle series: height/baseline/centroid/foot-span/foot
 *               runs across the frames, plus the derived spreads. This is the
 *               contact-passing-contact + no-breathing + no-sinking test.
 *
 * Usage: node scripts/anim-pass-inspect.mjs [--json] [sheet-stem ...]
 *        (no stems = every assets/raw/char-*-sheet-*.png)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const RAW = 'assets/raw';
const PROC = 'assets/processed';
const OUT = 'reviews/anim-pass-2026-07-25/data';
const TOL = 26; // extract-alpha's default background core
const HALO = 90; // extract-alpha's interiorKey threshold — the fringe/spill band

/** Grid conventions when no processed set exists (assets/LEDGER.md + frames.json survey). */
function conventionGrid(stem) {
  if (/-sheet-walk8$/.test(stem)) return /char-e[6-9]-/.test(stem) ? [4, 2] : [8, 4];
  if (/-sheet-walk8-[ab]$/.test(stem)) return [8, 4];
  if (/-sheet-(walk4|hover4)-[ab]$/.test(stem)) return [4, 4];
  if (/-sheet-hover8$/.test(stem)) return [8, 4];
  if (/-sheet-(attack8|work8)$/.test(stem)) return [8, 4];
  if (/-sheet-rotation2(-f)?$/.test(stem)) return [4, 2];
  if (/-sheet-rotation(-f)?$/.test(stem)) return [4, 3];
  if (/-sheet-(front|back|side-actions)(-f)?$/.test(stem)) return [3, 2];
  if (/-sheet-side(-f)?$/.test(stem)) return [2, 2];
  return null;
}

const dist = (d, i, key) => Math.max(Math.abs(d[i] - key[0]), Math.abs(d[i + 1] - key[1]), Math.abs(d[i + 2] - key[2]));

/** Median border colour = the key the generator actually painted. */
function detectKey(png) {
  const { width: w, height: h, data } = png;
  const rs = [], gs = [], bs = [];
  const sample = (x, y) => { const i = (w * y + x) << 2; rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
  for (let x = 0; x < w; x += Math.max(1, w >> 7)) { sample(x, 0); sample(x, h - 1); }
  for (let y = 0; y < h; y += Math.max(1, h >> 7)) { sample(0, y); sample(w - 1, y); }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  const key = [med(rs), med(gs), med(bs)];
  const spread = Math.max(...key) - Math.min(...key);
  let name = 'other';
  if (key[0] > 200 && key[2] > 200 && key[1] < 90) name = 'ff00ff';
  else if (spread <= 24 && key[0] > 100 && key[0] < 180) name = '8a8a8a';
  else if (spread <= 24 && key[0] >= 180) name = 'white';
  return { key, name, spread };
}

/** 1 = background (within tol of key). Global, not flood — gutters are what we want. */
function bgMask(png, key) {
  const { width: w, height: h, data } = png;
  const m = new Uint8Array(w * h);
  let bg = 0, halo = 0;
  for (let i = 0; i < w * h; i++) {
    const d = dist(data, i << 2, key);
    if (d <= TOL) { m[i] = 1; bg++; }
    else if (d <= HALO) halo++;
  }
  return { m, bg, halo, total: w * h };
}

/** Interior spill: key-coloured pixels NOT reachable from the border (blobs on the art). */
function interiorSpill(png, key, m) {
  const { width: w, height: h } = png;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = w * y + x;
    if (seen[i] || !m[i]) return;
    seen[i] = 1; stack.push(i);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  let spill = 0, biggest = 0;
  const comp = new Uint8Array(w * h);
  for (let s = 0; s < w * h; s++) {
    if (!m[s] || seen[s] || comp[s]) continue;
    const members = [s]; comp[s] = 1;
    for (let q = 0; q < members.length; q++) {
      const i = members[q], x = i % w, y = (i / w) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = w * ny + nx;
        if (!m[j] || seen[j] || comp[j]) continue;
        comp[j] = 1; members.push(j);
      }
    }
    spill += members.length;
    biggest = Math.max(biggest, members.length);
  }
  return { spillPx: spill, biggestBlob: biggest, borderConnected: seen };
}

/**
 * TRUE grid, inferred from the art alone: a gutter is a line that is 100%
 * background all the way across. Count the content bands between gutters. When
 * this disagrees with the declared grid, the extractor has been slicing figures
 * apart (the s1047 assay-clerk/preacher/schoolteacher class).
 */
function inferGrid(png, m) {
  const { width: w, height: h } = png;
  const bands = (n, isClean) => {
    const clean = new Uint8Array(n);
    for (let i = 0; i < n; i++) clean[i] = isClean(i) ? 1 : 0;
    let count = 0, open = false, runs = [];
    for (let i = 0; i < n; i++) {
      if (!clean[i]) { if (!open) { count++; open = true; runs.push([i, i]); } else runs[runs.length - 1][1] = i; }
      else open = false;
    }
    return { count, runs };
  };
  const colClean = (x) => { for (let y = 0; y < h; y++) if (!m[w * y + x]) return false; return true; };
  const rowClean = (y) => { for (let x = 0; x < w; x++) if (!m[w * y + x]) return false; return true; };
  const c = bands(w, colClean), r = bands(h, rowClean);
  return { cols: c.count, rows: r.count, colBands: c.runs, rowBands: r.runs };
}

/** Boundary probe: does content cross the cut, and how wide is the clean gutter? */
function probeBoundaries(png, m, cols, rows) {
  const { width: w, height: h } = png;
  const cw = w / cols, chh = h / rows;
  const vertical = [], horizontal = [];
  const colClean = (x) => { let n = 0; for (let y = 0; y < h; y++) if (!m[w * y + x]) n++; return n; };
  const rowClean = (y) => { let n = 0; for (let x = 0; x < w; x++) if (!m[w * y + x]) n++; return n; };
  for (let c = 1; c < cols; c++) {
    const x = Math.round(c * cw);
    const bleed = colClean(Math.min(x, w - 1));
    let left = 0, right = 0;
    for (let k = 1; k < 64 && x - k >= 0 && colClean(x - k) === 0; k++) left = k;
    for (let k = 1; k < 64 && x + k < w && colClean(x + k) === 0; k++) right = k;
    vertical.push({ at: x, bleedPx: bleed, gutterPx: bleed === 0 ? left + right + 1 : 0 });
  }
  for (let r = 1; r < rows; r++) {
    const y = Math.round(r * chh);
    const bleed = rowClean(Math.min(y, h - 1));
    let up = 0, down = 0;
    for (let k = 1; k < 64 && y - k >= 0 && rowClean(y - k) === 0; k++) up = k;
    for (let k = 1; k < 64 && y + k < h && rowClean(y + k) === 0; k++) down = k;
    horizontal.push({ at: y, bleedPx: bleed, gutterPx: bleed === 0 ? up + down + 1 : 0 });
  }
  return { vertical, horizontal };
}

const HB = 16; // pHash grid

/**
 * Bbox-normalized silhouette hash: the CONTENT is resampled to 16x16, so cell
 * position and figure size drop out and a mirror comparison measures pose/facing
 * alone. This is the one the direction-row test uses.
 */
function normHash(png, m, ax0, ay0, bx0, by0, bx1, by1) {
  const { width: w } = png;
  const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
  const occ = new Float64Array(HB * HB), cnt = new Float64Array(HB * HB);
  for (let y = 0; y < bh; y++) {
    const by = Math.min(HB - 1, (y * HB / bh) | 0);
    for (let x = 0; x < bw; x++) {
      const bx = Math.min(HB - 1, (x * HB / bw) | 0), b = by * HB + bx;
      cnt[b]++;
      if (!m[w * (ay0 + by0 + y) + (ax0 + bx0 + x)]) occ[b]++;
    }
  }
  return Array.from(occ, (v, i) => (v / Math.max(1, cnt[i]) > 0.5 ? 1 : 0));
}

function hashes(png, m, x0, y0, cw, ch) {
  const { width: w, data } = png;
  const occ = new Float64Array(HB * HB), lum = new Float64Array(HB * HB), cnt = new Float64Array(HB * HB);
  for (let y = 0; y < ch; y++) {
    const by = Math.min(HB - 1, (y * HB / ch) | 0);
    for (let x = 0; x < cw; x++) {
      const bx = Math.min(HB - 1, (x * HB / cw) | 0), b = by * HB + bx;
      const i = w * (y0 + y) + (x0 + x);
      cnt[b]++;
      if (m[i]) continue;
      const idx = i << 2;
      occ[b]++;
      lum[b] += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  const occN = Array.from(occ, (v, i) => v / Math.max(1, cnt[i]));
  const lumN = Array.from(lum, (v, i) => (occ[i] ? v / occ[i] : 0));
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const om = mean(occN), lm = mean(lumN.filter((v) => v > 0)) || 0;
  return {
    alpha: occN.map((v) => (v > Math.max(0.02, om) ? 1 : 0)),
    luma: lumN.map((v) => (v > lm ? 1 : 0)),
    occ: occN,
  };
}
const ham = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);
const flipHash = (a) => { const o = []; for (let r = 0; r < HB; r++) for (let c = 0; c < HB; c++) o.push(a[r * HB + (HB - 1 - c)]); return o; };

function cellStats(png, m, r, c, cw, ch) {
  const { width: w, data } = png;
  const x0 = Math.round(c * cw), y0 = Math.round(r * ch);
  const cwI = Math.round((c + 1) * cw) - x0, chI = Math.round((r + 1) * ch) - y0;
  let bx0 = Infinity, by0 = Infinity, bx1 = -1, by1 = -1, px = 0, sx = 0, sy = 0;
  for (let y = 0; y < chI; y++) {
    for (let x = 0; x < cwI; x++) {
      if (m[w * (y0 + y) + (x0 + x)]) continue;
      px++; sx += x; sy += y;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
  }
  const empty = bx1 < 0;
  const H = hashes(png, m, x0, y0, cwI, chI);
  const norm = empty ? null : normHash(png, m, x0, y0, bx0, by0, bx1, by1);
  // Foot band: the bottom 8% of the figure. A walk's CONTACT frames show two
  // separated feet (2 runs, wide span); PASSING frames show one (1 run, narrow).
  let footSpan = 0, footRuns = 0, holes = 0;
  if (!empty) {
    const band = Math.max(2, Math.round((by1 - by0 + 1) * 0.08));
    const cov = new Uint8Array(cwI);
    for (let y = Math.max(by0, by1 - band + 1); y <= by1; y++) for (let x = 0; x < cwI; x++) if (!m[w * (y0 + y) + (x0 + x)]) cov[x] = 1;
    const minRun = Math.max(3, Math.round((bx1 - bx0 + 1) * 0.06)); // a speck is not a foot
    const minGap = Math.max(3, Math.round((bx1 - bx0 + 1) * 0.05));
    let lo = Infinity, hi = -1, runLen = 0, gapLen = 0, open = false;
    for (let x = 0; x <= cwI; x++) {
      const on = x < cwI && cov[x];
      if (on) { if (x < lo) lo = x; hi = x; runLen++; if (!open && runLen >= minRun) { footRuns++; open = true; } gapLen = 0; }
      else { gapLen++; runLen = 0; if (open && gapLen >= minGap) open = false; }
    }
    footSpan = hi < 0 ? 0 : hi - lo + 1;
    // Holes: key-coloured regions ENCLOSED by the figure (not reachable from the
    // cell's border) — magenta painted onto the art, which the pipeline keys into
    // a see-through wound. Open gaps (between legs, under an arm) never count.
    const seen = new Uint8Array(cwI * chI), st = [];
    const at = (x, y) => m[w * (y0 + y) + (x0 + x)];
    const push = (x, y) => { if (x < 0 || y < 0 || x >= cwI || y >= chI) return; const i = y * cwI + x; if (seen[i] || !at(x, y)) return; seen[i] = 1; st.push(i); };
    for (let x = 0; x < cwI; x++) { push(x, 0); push(x, chI - 1); }
    for (let y = 0; y < chI; y++) { push(0, y); push(cwI - 1, y); }
    while (st.length) { const i = st.pop(), x = i % cwI, y = (i / cwI) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) if (at(x, y) && !seen[y * cwI + x]) holes++;
  }
  return {
    row: r, col: c, empty,
    bbox: empty ? null : [bx0, by0, bx1, by1],
    w: empty ? 0 : bx1 - bx0 + 1, h: empty ? 0 : by1 - by0 + 1,
    px, cellW: cwI, cellH: chI,
    baseline: empty ? null : by1, top: empty ? null : by0,
    cx: px ? +(sx / px).toFixed(1) : null, cy: px ? +(sy / px).toFixed(1) : null,
    margins: empty ? null : { l: bx0, t: by0, r: cwI - 1 - bx1, b: chI - 1 - by1 },
    clipped: empty ? [] : [bx0 <= 1 && 'L', by0 <= 1 && 'T', bx1 >= cwI - 2 && 'R', by1 >= chI - 2 && 'B'].filter(Boolean),
    footSpan, footRuns, holes,
    _h: H, _n: norm,
  };
}

function analyse(stem) {
  const file = path.join(RAW, `${stem}.png`);
  const png = PNG.sync.read(fs.readFileSync(file));
  const fj = path.join(PROC, `${stem}.frames.json`);
  let grid = null, gridSrc = 'convention';
  if (fs.existsSync(fj)) { const d = JSON.parse(fs.readFileSync(fj, 'utf8')); grid = [d.grid.cols, d.grid.rows]; gridSrc = 'frames.json'; }
  if (!grid) grid = conventionGrid(stem);
  const kd = detectKey(png);
  const { m, bg, halo, total } = bgMask(png, kd.key);
  const sp = interiorSpill(png, kd.key, m);
  const out = {
    stem, file, w: png.width, h: png.height,
    key: kd.name, keyRGB: kd.key,
    bgPct: +((bg / total) * 100).toFixed(2),
    haloPx: halo, haloPct: +((halo / total) * 100).toFixed(3),
    spillPx: sp.spillPx, biggestSpillBlob: sp.biggestBlob,
    grid, gridSrc, cells: [], dupes: [], rows: [],
  };
  out.trueGrid = inferGrid(png, m);
  if (!grid) { out.error = 'no grid convention'; return out; }
  const [cols, rows] = grid;
  // A figure with a full-height gap (between the legs) splits into extra bands, so
  // MORE bands than declared is noise. FEWER is the dangerous direction: the art
  // does not contain as many figures as the extractor is slicing out of it.
  out.gridAgrees = out.trueGrid.cols >= cols && out.trueGrid.rows >= rows;
  out.gridMerged = out.trueGrid.cols < cols || out.trueGrid.rows < rows;
  out.divisible = { w: png.width % cols === 0, h: png.height % rows === 0, cellW: png.width / cols, cellH: png.height / rows };
  out.boundaries = probeBoundaries(png, m, cols, rows);
  const cw = png.width / cols, ch = png.height / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(cellStats(png, m, r, c, cw, ch));
  // pairwise duplicate / mirror
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i], b = cells[j];
      if (a.empty || b.empty) continue;
      const dA = ham(a._h.alpha, b._h.alpha), dL = ham(a._h.luma, b._h.luma);
      const mA = ham(a._h.alpha, flipHash(b._h.alpha)), mL = ham(a._h.luma, flipHash(b._h.luma));
      const nD = a._n && b._n ? ham(a._n, b._n) : 999, nM = a._n && b._n ? ham(a._n, flipHash(b._n)) : 999;
      const tag = dA <= 2 && dL <= 8 ? 'NEAR-DUPLICATE'
        : nD <= 3 && dL <= 10 ? 'POSE-DUPLICATE'
          : mA <= 2 && mL <= 8 ? 'NEAR-MIRROR'
            : nM <= 3 && mL <= 10 ? 'POSE-MIRROR' : null;
      if (tag) out.dupes.push({ a: `r${a.row}c${a.col}`, b: `r${b.row}c${b.col}`, tag, alphaHam: dA, lumaHam: dL, mirrorAlphaHam: mA, mirrorLumaHam: mL, normHam: nD, normMirrorHam: nM });
    }
  }
  const spread = (a) => (a.length ? +(Math.max(...a) - Math.min(...a)).toFixed(1) : 0);
  for (let r = 0; r < rows; r++) {
    const rc = cells.filter((k) => k.row === r && !k.empty);
    const hs = rc.map((k) => k.h), bl = rc.map((k) => k.baseline), fs2 = rc.map((k) => k.footSpan), cxs = rc.map((k) => k.cx);
    out.rows.push({
      row: r, filled: rc.length, of: cols,
      height: hs, heightSpread: spread(hs), heightSpreadPct: hs.length ? +((spread(hs) / (hs.reduce((s, v) => s + v, 0) / hs.length)) * 100).toFixed(1) : 0,
      baseline: bl, baselineSpread: spread(bl),
      footSpan: fs2, footSpanSpread: spread(fs2),
      centroidX: cxs, centroidSpread: spread(cxs),
    });
  }
  out.cells = cells.map(({ _h, _n, ...rest }) => rest);
  out._hashes = cells.map((k) => ({ id: `r${k.row}c${k.col}`, alpha: k._h.alpha.join(''), luma: k._h.luma.join(''), norm: k._n ? k._n.join('') : null }));
  return out;
}

const args = process.argv.slice(2).filter((a) => a !== '--json');
const stems = args.length
  ? args.map((a) => a.replace(/\.png$/, '').replace(/^assets\/raw\//, ''))
  : fs.readdirSync(RAW).filter((f) => /^char-.*-sheet-.*\.png$/.test(f)).map((f) => f.replace(/\.png$/, '')).sort();
fs.mkdirSync(OUT, { recursive: true });
const summary = [];
for (const stem of stems) {
  const a = analyse(stem);
  fs.writeFileSync(path.join(OUT, `${stem}.json`), JSON.stringify(a, null, 1) + '\n');
  const bMax = a.boundaries ? Math.max(0, ...a.boundaries.vertical.map((v) => v.bleedPx), ...a.boundaries.horizontal.map((v) => v.bleedPx)) : -1;
  const gMin = a.boundaries ? Math.min(999, ...a.boundaries.vertical.map((v) => v.gutterPx), ...a.boundaries.horizontal.map((v) => v.gutterPx)) : -1;
  const clipped = a.cells.filter((c) => c.clipped.length).length;
  const emptyN = a.cells.filter((c) => c.empty).length;
  const hSpread = Math.max(0, ...a.rows.map((r) => r.heightSpreadPct));
  const blSpread = Math.max(0, ...a.rows.map((r) => r.baselineSpread));
  summary.push({ stem: a.stem, dims: `${a.w}x${a.h}`, key: a.key, grid: a.grid ? a.grid.join('x') : '?', src: a.gridSrc, bgPct: a.bgPct, halo: a.haloPct, spill: a.spillPx, bleed: bMax, gutter: gMin, clip: clipped, empty: emptyN, dupes: a.dupes.length, hSpr: hSpread, blSpr: blSpread });
  const tg = a.trueGrid ? `${a.trueGrid.cols}x${a.trueGrid.rows}` : '?';
  console.log(
    `${a.stem.padEnd(46)} ${(`${a.w}x${a.h}`).padEnd(10)} ${a.key.padEnd(7)} ${(a.grid ? a.grid.join('x') : '?').padEnd(4)}${a.gridSrc === 'convention' ? '~' : ' '}` +
    `${a.gridMerged ? `ART=${tg} `.padEnd(4) : 'ok  '} ` +
    `bg ${String(a.bgPct).padStart(5)}% halo ${String(a.haloPct).padStart(6)}% spill ${String(a.spillPx).padStart(7)} ` +
    `bleed ${String(bMax).padStart(5)} gut ${String(gMin).padStart(3)} clip ${String(clipped).padStart(2)} empty ${String(emptyN).padStart(2)} dup ${String(a.dupes.length).padStart(3)} hSpr ${String(hSpread).padStart(5)}% blSpr ${String(blSpread).padStart(4)}`,
  );
}
fs.writeFileSync(path.join(OUT, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(`\n${stems.length} sheets → ${OUT}/`);
