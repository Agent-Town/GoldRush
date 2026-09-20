#!/usr/bin/env node
// SIDECAR RE-BASE. assets/processed/<family>.frames.json carries each cell's figure bbox in the
// SOURCE SHEET's coordinate space (its origin sits ~116 px off the 512 px cell's), and
// src/town/TownScene.ts:3386 anchors three actors' billboards on `bbox[3] - bbox[1] + 1`. MEASURED
// on main: the sidecar tracks the shipped cell's own figure height to within 1 px on all three
// registered families (mean |Δ| 0.28-0.53). After the re-cut it drifts to a mean of 1.53-7.09,
// max 13 — so the sidecars must travel with the cells, exactly as stage 1's two did.
// The re-base TRANSLATES each box by the measured per-cell delta between main's cell and the
// re-cut's (left/right/top/bottom independently), so the sheet-space origin is preserved and
// nothing is invented: every number is a difference of two measurements.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const box = (buf) => { const p = PNG.sync.read(buf);
  const dim = p.width;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let i = 0; i < p.width * p.height; i++) { if (p.data[(i << 2) + 3] < 128) continue;
    const x = i % p.width, y = (i / p.width) | 0;
    if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { box: [x0, y0, x1, y1], dim }; };
const APPLY = process.env.APPLY === '1';
for (const fam of process.argv.slice(2)) {
  const file = `assets/processed/${fam}.frames.json`;
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  let moved = 0, maxDh = 0;
  for (const c of j.cells) {
    const m = box(execFileSync('git', ['show', `HEAD:assets/processed/${c.file}`], { maxBuffer: 20 * 1024 * 1024 }));
    const r = box(fs.readFileSync('assets/processed/' + c.file));
    // char-hero-sheet-walk8 ships 256 px cells against a 512 px sidecar `cell` (the shipped cell was
    // downscaled after the sidecar was written; assets/master-divergent.json calls it "the 256px
    // shipped cell"), so a delta measured in cell pixels is scaled into sidecar space.
    const k2 = (j.cell ?? r.dim) / r.dim;
    const before = c.bbox.slice();
    for (let k = 0; k < 4; k++) c.bbox[k] = before[k] + Math.round((r.box[k] - m.box[k]) * k2);
    const dh = (c.bbox[3] - c.bbox[1]) - (before[3] - before[1]);
    if (dh) { moved++; maxDh = Math.max(maxDh, Math.abs(dh)); }
  }
  const heights = j.cells.map((c) => c.bbox[3] - c.bbox[1] + 1);
  if (APPLY) fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
  console.log(`${fam.padEnd(34)} cells ${j.cells.length}, heights moved on ${moved}, max |Δh| ${maxDh}, band ${Math.min(...heights)}-${Math.max(...heights)}`);
}
