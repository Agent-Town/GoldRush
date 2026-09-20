#!/usr/bin/env node
/**
 * F-1470-4 — the ROUNDED-SCALE class (7 sheets / 45 cells of the 301 held) is
 * curable today by ONE uniform recipe. This script IS the recipe, and it proves
 * itself against the shipped bytes without writing a single file under assets/.
 *
 * THE DEFECT, named precisely:
 *   extract-alpha.mjs:376  scale = min(1, scaleOverride ?? (cell * 0.86) / maxDim)   // full double
 *   extract-alpha.mjs:412  writes  scale: Number(scale.toFixed(4))                   // <- precision lost
 *   anim-pass-reextract.mjs:163  passes String(conv.scale) back in as --scale        // <- 4dp value reused
 * So every re-extraction is normalised at a scale that is wrong in the 5th decimal,
 * resampling every cell a hair differently. Sheets whose scale clamps to 1 are
 * IMMUNE, because min(1, ...) makes the rounding unobservable — and those are the
 * 774 that passed. The bug was invisible across 94% of the corpus by arithmetic
 * accident, not because the pipeline was right.
 *
 * THE RECIPE: maxDim is an integer pixel count, so it is recoverable exactly —
 *   maxDim = round(cell * 0.86 / shippedScale);  scale = cell * 0.86 / maxDim
 * That reconstructs the original full-precision double from the 4dp record.
 *
 * WHY NOT JUST DROP --scale AND LET IT AUTO-FIT? Measured: it works for 4 sheets
 * and is WRONG for 3. The halo cure shrinks the content bbox, so the auto-fit
 * recomputes a different maxDim and renormalises the figure — rotation2-f would
 * go 0.7644 -> 0.8719, drawing the hero ~14% larger than her sibling sheets.
 * The auto path silently changes sprite SIZE; the recipe above does not.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const RAW = 'assets/raw';
const KEY = 'ff00ff';
const FIT = 0.86;                       // extract-alpha.mjs:376
const SHEETS = [
  'char-e9-feral_terraformer-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f',
  'ter-rail-elements',
];
const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

function resize(png, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / png.width, maxHeight / png.height);
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  if (width === png.width && height === png.height) return png;
  const out = new PNG({ width, height });
  const sx = png.width / width, sy = png.height / height;
  for (let y = 0; y < height; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1), wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1), wx = fx - x0;
      const outIdx = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c], p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c], p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[outIdx + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  return out;
}

const results = [];
let totCells = 0, totAlpha = 0, totOpaque = 0, worstDelta = 0, totSuspectsAfter = 0, totSuspectsBefore = 0;

for (const stem of SHEETS) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  const hasMaster = occupied.every((c) => fs.existsSync(path.join(FULL, c.file)));
  const displayCell = readPng(path.join(PROC, occupied[0].file)).width;

  const maxDim = Math.round((fj.cell * FIT) / fj.scale);       // recover the integer
  const exact = (fj.cell * FIT) / maxDim;                      // reconstruct the double

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'f1470-4-recipe-'));
  let alpha = 0, maxAlpha = 0, opaque = 0, maxDelta = 0, suspectsAfter = 0, suspectsBefore = 0;
  try {
    execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${fj.grid.cols}x${fj.grid.rows}`,
      '--cell', String(fj.cell), '--scale', String(exact), '--out', tmp, path.join(RAW, `${stem}.png`)], { stdio: 'pipe' });

    for (const cell of occupied) {
      const produced = readPng(path.join(tmp, cell.file));
      const shippedForm = hasMaster ? resize(produced, displayCell, displayCell) : produced;
      const current = readPng(path.join(PROC, cell.file));
      let trBefore = 0, kpBefore = 0, trAfter = 0, kpAfter = 0;
      for (let i = 0; i < current.width * current.height; i++) {
        const o = i << 2;
        const d = Math.abs(current.data[o + 3] - shippedForm.data[o + 3]);
        if (d) { alpha++; maxAlpha = Math.max(maxAlpha, d); }
        if (current.data[o + 3] === 255) {
          const delta = Math.max(Math.abs(current.data[o] - shippedForm.data[o]),
            Math.abs(current.data[o + 1] - shippedForm.data[o + 1]),
            Math.abs(current.data[o + 2] - shippedForm.data[o + 2]));
          if (delta) { opaque++; maxDelta = Math.max(maxDelta, delta); }
        }
        const isKey = (p, i2) => p.data[i2] === 255 && p.data[i2 + 1] === 0 && p.data[i2 + 2] === 255;
        if (current.data[o + 3] === 0) { trBefore++; if (isKey(current, o)) kpBefore++; }
        if (shippedForm.data[o + 3] === 0) { trAfter++; if (isKey(shippedForm, o)) kpAfter++; }
      }
      if (trBefore && kpBefore / trBefore > 0.05) suspectsBefore++;
      if (trAfter && kpAfter / trAfter > 0.05) suspectsAfter++;
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  totCells += occupied.length; totAlpha += alpha; totOpaque += opaque;
  worstDelta = Math.max(worstDelta, maxDelta);
  totSuspectsAfter += suspectsAfter; totSuspectsBefore += suspectsBefore;
  results.push({ stem, cells: occupied.length, shippedScale: fj.scale, maxDim, exactScale: exact, hasMaster, alpha, maxAlpha, opaque, maxDelta, suspectsBefore, suspectsAfter });

  console.log(`${stem}`);
  console.log(`   ${occupied.length} cells · shipped scale ${fj.scale} -> maxDim ${maxDim} -> exact ${exact.toFixed(10)} · master ${hasMaster ? 'yes' : 'no'}`);
  console.log(`   alpha diff ${alpha} (max ${maxAlpha}) · opaque-RGB diff ${opaque} (max delta ${maxDelta}) · halo suspects ${suspectsBefore} -> ${suspectsAfter}`);
}

console.log('\n=== RECIPE VERDICT ===');
console.log(`sheets 7 · cells ${totCells}`);
console.log(`halo suspects:      ${totSuspectsBefore} -> ${totSuspectsAfter}`);
console.log(`alpha differences:  ${totAlpha}   <- the silhouette must not move, and does not`);
console.log(`opaque-RGB pixels:  ${totOpaque} changed, max single-channel delta ${worstDelta}`);
console.log(totAlpha === 0 && totSuspectsAfter === 0
  ? `\nGATE STATUS: the halo clears and alpha is byte-identical on all ${totCells} cells.`
    + `\nThe ONLY thing between this and F-1470-4's first disjunct is ${totOpaque} fully-opaque pixels`
    + `\nthat move by ${worstDelta}/255. That is a threshold ruling, and a fire may not relax it.`
  : '\nGATE STATUS: recipe does NOT satisfy the invariant — do not queue this.');
fs.writeFileSync('artifacts/f1470-4/exact-scale-recipe.json', JSON.stringify(results, null, 2) + '\n');
