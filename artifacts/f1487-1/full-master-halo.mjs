#!/usr/bin/env node
/**
 * s1487 pre-authoring measurement #4 — the datum that decides whether
 * `assets/processed-full/` is in the master's scope AT ALL.
 *
 * Measurement #2 showed the accepted 774-cell cure rewrote 278 full-res masters, which
 * looked like a precedent obliging the new master to do the same. But the accepted cure
 * rewrote them because THOSE masters carried the halo. Whether these 37 do is a separate
 * question nobody has asked, and it is cheap: run the halo-class-sweep predicate over
 * `assets/processed-full/` for the six sheets.
 *
 * If the full masters are already clean, they are simply not part of this defect and
 * leaving them alone is not a divergence from precedent — it is the same rule applied to
 * a corpus that does not need it.
 *
 * Read-only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const SHEETS = [
  'char-hero-sheet-back-f', 'char-hero-sheet-front-f', 'char-hero-sheet-rotation2-f',
  'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f', 'ter-rail-elements',
];

// halo-class-sweep.mjs predicate: the share of KEY-coloured pixels among the fully
// transparent ones. The sweep reports a proportion; a cell is a suspect above 5%.
function haloShare(png) {
  let tr = 0, kp = 0;
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2;
    if (png.data[o + 3] !== 0) continue;
    tr++;
    if (png.data[o] === 255 && png.data[o + 1] === 0 && png.data[o + 2] === 255) kp++;
  }
  return { tr, kp, share: tr ? kp / tr : 0 };
}

const rows = [];
let dispSusp = 0, fullSusp = 0, cells = 0, fullMissing = 0;
for (const stem of SHEETS) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  let d = 0, f = 0, miss = 0;
  let worstFull = 0;
  for (const cell of occupied) {
    cells++;
    const ds = haloShare(PNG.sync.read(fs.readFileSync(path.join(PROC, cell.file))));
    if (ds.share > 0.05) d++;
    const fp = path.join(FULL, cell.file);
    if (!fs.existsSync(fp)) { miss++; continue; }
    const fsh = haloShare(PNG.sync.read(fs.readFileSync(fp)));
    worstFull = Math.max(worstFull, fsh.share);
    if (fsh.share > 0.05) f++;
  }
  dispSusp += d; fullSusp += f; fullMissing += miss;
  rows.push({ stem, cells: occupied.length, displaySuspects: d, fullSuspects: f, fullMissing: miss, worstFullShare: worstFull });
  console.log(`${stem.padEnd(32)} cells ${String(occupied.length).padStart(2)}  display suspects ${d}  FULL suspects ${f}  (worst full share ${(worstFull * 100).toFixed(2)}%)  missing-full ${miss}`);
}

console.log('\n=== VERDICT ===');
console.log(`cells: ${cells}   display-cell halo suspects: ${dispSusp}   FULL-master halo suspects: ${fullSusp}   missing full: ${fullMissing}`);
console.log(fullSusp === 0
  ? 'The full-res masters are ALREADY CLEAN. `assets/processed-full/` is OUT OF SCOPE for this\ncure — not a divergence from the 774-cell precedent, but the same rule meeting a corpus\nthat does not carry the defect. The master must touch assets/processed/ ONLY.'
  : `${fullSusp} full masters DO carry the halo — they are in scope and the master must cure them too\nvia composite(shippedFull, produced), which measurement #3 showed is alpha 0 / opaqueRGB 0.`);

fs.writeFileSync('artifacts/f1487-1/full-master-halo.json', JSON.stringify({ rows, cells, dispSusp, fullSusp, fullMissing }, null, 2) + '\n');
