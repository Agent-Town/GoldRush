#!/usr/bin/env node
/**
 * anim-pass-celldiff.mjs — THE ANIMATION PASS, A/B arm (M3).
 *
 * Compares two directories of extracted cells and says HOW different they are, not
 * merely THAT they differ. Re-extracting a sheet with today's `extract-alpha.mjs`
 * rewrites cells that were baked by an older build of it, so a byte compare cannot
 * separate "my mend changed this" from "the script changed under me". This does:
 * run it control-vs-treatment and the drift cancels.
 *
 * Reports per cell: alpha-coverage delta (how much figure appeared/vanished), mean
 * |dRGB| over pixels opaque in BOTH, bbox shift, and the peak per-pixel difference.
 *
 * Usage: node scripts/anim-pass-celldiff.mjs <dirA> <dirB> [--stem S] [--quiet]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const A = process.argv.slice(2);
const dirs = A.filter((x) => !x.startsWith('--'));
const stemFilter = A.includes('--stem') ? A[A.indexOf('--stem') + 1] : null;
const QUIET = A.includes('--quiet');
if (dirs.length < 2) { console.error('usage: node scripts/anim-pass-celldiff.mjs <dirA> <dirB> [--stem S]'); process.exit(1); }
const [dA, dB] = dirs;

// Compare the INTERSECTION. Iterating one side alone makes "absent from the other
// directory" masquerade as "changed" — which is how a snapshot of only-the-changed
// files reads as a whole-cast regression.
const inA = new Set(fs.readdirSync(dA));
const files = fs.readdirSync(dB)
  .filter((f) => /-r\d+c\d+\.png$/.test(f) && inA.has(f) && (!stemFilter || f.startsWith(stemFilter)))
  .sort();
const onlyB = fs.readdirSync(dB).filter((f) => /-r\d+c\d+\.png$/.test(f) && !inA.has(f) && (!stemFilter || f.startsWith(stemFilter))).length;
if (onlyB) console.log(`(${onlyB} cells present in B but not A — not compared)`);
const bySheet = new Map();
for (const f of files) {
  const stem = f.replace(/-r\d+c\d+\.png$/, '');
  if (!bySheet.has(stem)) bySheet.set(stem, []);
  bySheet.get(stem).push(f);
}

function bbox(png) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    if (png.data[((png.width * y + x) << 2) + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

for (const [stem, list] of bySheet) {
  const rows = [];
  for (const f of list) {
    const pa = path.join(dA, f), pb = path.join(dB, f);
    if (!fs.existsSync(pa)) { rows.push({ f, missing: true }); continue; }
    const a = PNG.sync.read(fs.readFileSync(pa)), b = PNG.sync.read(fs.readFileSync(pb));
    if (a.width !== b.width || a.height !== b.height) { rows.push({ f, dims: `${a.width}x${a.height} vs ${b.width}x${b.height}` }); continue; }
    let opaqueA = 0, opaqueB = 0, both = 0, sum = 0, peak = 0, alphaOnly = 0;
    for (let i = 0; i < a.width * a.height; i++) {
      const o = i << 2, aa = a.data[o + 3], ab = b.data[o + 3];
      if (aa > 8) opaqueA++;
      if (ab > 8) opaqueB++;
      if (aa > 8 && ab > 8) {
        both++;
        const d = Math.max(Math.abs(a.data[o] - b.data[o]), Math.abs(a.data[o + 1] - b.data[o + 1]), Math.abs(a.data[o + 2] - b.data[o + 2]));
        sum += d; if (d > peak) peak = d;
      } else if (aa > 8 || ab > 8) alphaOnly++;
    }
    const ba = bbox(a), bb = bbox(b);
    rows.push({
      f, opaqueA, opaqueB, coverageDeltaPct: +(((opaqueB - opaqueA) / Math.max(1, opaqueA)) * 100).toFixed(2),
      alphaOnly, meanD: both ? +(sum / both).toFixed(2) : 0, peak,
      bboxA: ba ? `${ba.w}x${ba.h}@${ba.x0},${ba.y0}` : 'empty', bboxB: bb ? `${bb.w}x${bb.h}@${bb.x0},${bb.y0}` : 'empty',
      shift: ba && bb ? `${(bb.cx - ba.cx).toFixed(1)},${(bb.cy - ba.cy).toFixed(1)}` : '-',
    });
  }
  const changed = rows.filter((r) => r.missing || r.dims || r.alphaOnly || r.meanD > 0);
  console.log(`\n${stem}: ${rows.length} cells, ${changed.length} differ`);
  if (QUIET) continue;
  for (const r of rows) {
    if (r.missing) { console.log(`  ${r.f}  MISSING in A`); continue; }
    if (r.dims) { console.log(`  ${r.f}  DIMS ${r.dims}`); continue; }
    const tag = !r.alphaOnly && !r.meanD ? 'identical' : '';
    console.log(`  ${r.f.replace(stem + '-', '').padEnd(10)} cover ${String(r.opaqueA).padStart(6)}→${String(r.opaqueB).padStart(6)} (${String(r.coverageDeltaPct).padStart(7)}%) ` +
      `alphaOnly ${String(r.alphaOnly).padStart(6)} meanΔRGB ${String(r.meanD).padStart(6)} peak ${String(r.peak).padStart(3)} bbox ${r.bboxA.padEnd(16)}→ ${r.bboxB.padEnd(16)} shift ${r.shift} ${tag}`);
  }
}
