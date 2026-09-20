#!/usr/bin/env node
// FOOTLINE CHECK. src/town/TownScene.ts:3386 anchors three actors' billboards on their feet from
// the .frames.json sidecar's bbox height, not from the shipped cell. The sidecars are NOT touched by
// this land (their bboxes live in the source SHEET's coordinate space, ~116 px off the cell's), so
// the question is whether the re-cut moves the shipped figure AWAY from the height the sidecar
// claims by more than main already does.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
const S = process.env.SCRATCH;
const hb = (buf) => { const p = PNG.sync.read(buf); let y0 = 1e9, y1 = -1;
  for (let i = 0; i < p.width * p.height; i++) if (p.data[(i << 2) + 3] >= 128) { const y = (i / p.width) | 0; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return y1 - y0 + 1; };
const h = (f) => hb(fs.readFileSync(f));
const hMain = (rel) => hb(execFileSync('git', ['show', `HEAD:${rel}`], { maxBuffer: 20 * 1024 * 1024 }));
for (const fam of ['char-tavernkeeper-sheet-walk8', 'char-storekeeper-sheet-walk8', 'char-elder-sheet-walk8']) {
  const j = JSON.parse(fs.readFileSync(`assets/processed/${fam}.frames.json`, 'utf8'));
  let mSum = 0, rSum = 0, mMax = 0, rMax = 0;
  for (const c of j.cells) {
    const side = (c.bbox[3] - c.bbox[1] + 1) * (j.scale ?? 1);
    const dm = Math.abs(hMain('assets/processed/' + c.file) - side);
    const dr = Math.abs(h(S + '/recut/' + c.file) - side);
    mSum += dm; rSum += dr; mMax = Math.max(mMax, dm); rMax = Math.max(rMax, dr);
  }
  const n = j.cells.length;
  console.log(`${fam.padEnd(32)} sidecar-vs-cell height |Δ|: MAIN mean ${(mSum / n).toFixed(2)} max ${mMax}  |  RE-CUT mean ${(rSum / n).toFixed(2)} max ${rMax}  (scale ${j.scale}, cell ${j.cell})`);
}
