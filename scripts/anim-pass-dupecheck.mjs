#!/usr/bin/env node
/**
 * anim-pass-dupecheck.mjs — THE ANIMATION PASS (2026-07-25), duplicate-proof arm.
 *
 * A 16x16 silhouette hash saying "these two frames match" is a SUSPICION, not a
 * duplicate: two opposite contact poses of one walk share a coarse silhouette.
 * This settles it at full resolution — bbox-align the two cells, then measure
 *   mad   mean |ΔRGB| over the union of the two figures (0 = identical art)
 *   diff% share of figure pixels differing by more than 12/255
 * Verdict: IDENTICAL (mad < 2) · NEAR-IDENTICAL (mad < 6) · DISTINCT.
 *
 * Usage: node scripts/anim-pass-dupecheck.mjs [stem ...]   (default: every sheet
 *        whose data file carries at least one flagged pair)
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const DATA = 'reviews/anim-pass-2026-07-25/data';
const TOL = 26;
const dist = (d, i, k) => Math.max(Math.abs(d[i] - k[0]), Math.abs(d[i + 1] - k[1]), Math.abs(d[i + 2] - k[2]));

let stems = process.argv.slice(2);
if (!stems.length) {
  stems = fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .filter((f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).dupes?.length)
    .map((f) => f.replace(/\.json$/, '')).sort();
}

const out = [];
for (const stem of stems) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, `${stem}.json`), 'utf8'));
  if (!d.dupes?.length) continue;
  const png = PNG.sync.read(fs.readFileSync(path.join('assets/raw', `${stem}.png`)));
  const key = d.keyRGB;
  const [cols, rows] = d.grid;
  const cw = png.width / cols, ch = png.height / rows;
  const cellOf = (id) => {
    const m = /^r(\d+)c(\d+)$/.exec(id);
    return d.cells.find((c) => c.row === Number(m[1]) && c.col === Number(m[2]));
  };
  const results = [];
  for (const pair of d.dupes) {
    const A = cellOf(pair.a), B = cellOf(pair.b);
    if (!A || !B || A.empty || B.empty) continue;
    const mirror = pair.tag.includes('MIRROR');
    // origin of each cell's bbox in sheet coords
    const ax = Math.round(A.col * cw) + A.bbox[0], ay = Math.round(A.row * ch) + A.bbox[1];
    const bx = Math.round(B.col * cw) + B.bbox[0], by = Math.round(B.row * ch) + B.bbox[1];
    const w = Math.min(A.w, B.w), h = Math.min(A.h, B.h);
    let sum = 0, n = 0, big = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ai = ((png.width * (ay + y) + (ax + x)) << 2);
        const bxx = mirror ? bx + (B.w - 1 - x) : bx + x;
        const bi = ((png.width * (by + y) + bxx) << 2);
        const aBg = dist(png.data, ai, key) <= TOL, bBg = dist(png.data, bi, key) <= TOL;
        if (aBg && bBg) continue; // both background — not part of either figure
        const dv = (Math.abs(png.data[ai] - png.data[bi]) + Math.abs(png.data[ai + 1] - png.data[bi + 1]) + Math.abs(png.data[ai + 2] - png.data[bi + 2])) / 3;
        sum += dv; n++;
        if (dv > 12) big++;
      }
    }
    const mad = n ? sum / n : 0;
    const verdict = mad < 2 ? 'IDENTICAL' : mad < 6 ? 'NEAR-IDENTICAL' : 'DISTINCT';
    results.push({ ...pair, mad: +mad.toFixed(2), diffPct: n ? +((big / n) * 100).toFixed(1) : 0, sizeDeltaPx: Math.abs(A.w - B.w) + Math.abs(A.h - B.h), verdict });
  }
  const real = results.filter((r) => r.verdict !== 'DISTINCT');
  out.push({ stem, flagged: results.length, real: real.length, results });
  console.log(`${stem.padEnd(46)} flagged ${String(results.length).padStart(3)} → REAL ${String(real.length).padStart(3)}` +
    (real.length ? `  ${real.slice(0, 6).map((r) => `${r.a}~${r.b}(${r.verdict === 'IDENTICAL' ? 'ID' : 'NR'} mad${r.mad})`).join(' ')}` : ''));
}
// MERGE, never clobber: a single-sheet re-run must not erase the other sheets'
// proofs. (It did once, and two MEND verdicts silently became CLEAN because the
// verdict table reads "no proof entry" as "no duplicates".)
const proofPath = path.join(DATA, '_dupecheck.json');
const merged = new Map();
if (fs.existsSync(proofPath)) for (const s of JSON.parse(fs.readFileSync(proofPath, 'utf8'))) merged.set(s.stem, s);
for (const s of out) merged.set(s.stem, s);
fs.writeFileSync(proofPath, JSON.stringify([...merged.values()].sort((a, b) => a.stem.localeCompare(b.stem)), null, 1) + '\n');
const totF = out.reduce((s, x) => s + x.flagged, 0), totR = out.reduce((s, x) => s + x.real, 0);
console.log(`\n${out.length} sheets · ${totF} hash-flagged pairs · ${totR} survive full-resolution comparison`);
