#!/usr/bin/env node
/**
 * s1487 pre-authoring measurement #3 — WHERE does the composite get applied?
 *
 * F-1486-1 measured its opaque-preserving composite at the DISPLAY cell only
 * (`assets/processed/`). Measurement #2 (master-precedent.mjs) then showed the ACCEPTED
 * cure — the 774 cells already on main — rewrote 278 `assets/processed-full/` masters as
 * well. So a master scoped to display cells only would DIVERGE from the accepted class,
 * and one that rewrites both without measuring would be inventing scope.
 *
 * There is a third fact neither fire measured, and it decides the recipe:
 * the shipped pair is DERIVED — `processed/<cell>` should be a downscale of
 * `processed-full/<cell>` (extract-alpha writes the master; the display cell is
 * resize(master, displayCell, displayCell)). If that invariant holds on the shipped bytes,
 * then applying the composite independently at two resolutions BREAKS it, because
 * resize(composite_full) is not pixel-wise composite_display.
 *
 * So three arms, all against the same single re-extraction per sheet:
 *   INVARIANT : is shipped display byte-identical to resize(shipped full)?
 *   ARM A     : F-1486-1's recipe — composite at the display level. (control: must
 *               reproduce alpha 0 / opaque-RGB 0, or this harness is wrong.)
 *   ARM B     : composite at the FULL level, then resize to the display cell — the recipe
 *               that PRESERVES the derivation. Does it still satisfy the gate?
 *
 * If ARM B holds, the master is coherent AND matches precedent, and that is what to author.
 * If ARM B fails, the master must scope to display cells only and say why.
 *
 * Writes nothing under assets/. Custody per fire.md 3.0b.
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
const FIT = 0.86; // extract-alpha.mjs:376

const SHEETS = [
  'char-hero-sheet-back-f', 'char-hero-sheet-front-f', 'char-hero-sheet-rotation2-f',
  'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f', 'ter-rail-elements',
];

const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

// verbatim from artifacts/f1486-1/opaque-preserving-composite.mjs:56-78 (itself verbatim
// from artifacts/f1470-4/exact-scale-recipe.mjs, s1485)
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

// pixel-wise opaque-preserving composite: alpha always from `cure`, RGB from `shipped`
// wherever the SHIPPED pixel is fully opaque.
function composite(shipped, cure) {
  const out = new PNG({ width: shipped.width, height: shipped.height });
  for (let i = 0; i < shipped.width * shipped.height; i++) {
    const o = i << 2;
    const src = shipped.data[o + 3] === 255 ? shipped : cure;
    out.data[o] = src.data[o];
    out.data[o + 1] = src.data[o + 1];
    out.data[o + 2] = src.data[o + 2];
    out.data[o + 3] = cure.data[o + 3];
  }
  return out;
}

function diff(shipped, cand) {
  let alpha = 0, maxAlpha = 0, opaque = 0, maxDelta = 0;
  if (shipped.width !== cand.width || shipped.height !== cand.height) {
    return { dims: `${shipped.width}x${shipped.height} -> ${cand.width}x${cand.height}`, alpha: -1, maxAlpha: -1, opaque: -1, maxDelta: -1 };
  }
  for (let i = 0; i < shipped.width * shipped.height; i++) {
    const o = i << 2;
    const d = Math.abs(shipped.data[o + 3] - cand.data[o + 3]);
    if (d) { alpha++; maxAlpha = Math.max(maxAlpha, d); }
    if (shipped.data[o + 3] === 255) {
      const dd = Math.max(
        Math.abs(shipped.data[o] - cand.data[o]),
        Math.abs(shipped.data[o + 1] - cand.data[o + 1]),
        Math.abs(shipped.data[o + 2] - cand.data[o + 2]),
      );
      if (dd) { opaque++; maxDelta = Math.max(maxDelta, dd); }
    }
  }
  return { alpha, maxAlpha, opaque, maxDelta };
}

// halo suspect predicate, verbatim in spirit from halo-class-sweep.mjs: share of
// KEY-coloured pixels among the FULLY TRANSPARENT ones.
function haloSuspect(png) {
  let tr = 0, kp = 0;
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2;
    if (png.data[o + 3] !== 0) continue;
    tr++;
    if (png.data[o] === 255 && png.data[o + 1] === 0 && png.data[o + 2] === 255) kp++;
  }
  return tr > 0 && kp / tr > 0.05;
}

const per = [];
let invOk = 0, invBad = 0;
const tot = { cells: 0, aAlpha: 0, aOpaque: 0, aMaxD: 0, bAlpha: 0, bOpaque: 0, bMaxD: 0, sBefore: 0, aAfter: 0, bAfter: 0, fullAlpha: 0, fullOpaque: 0, fullMaxD: 0 };

for (const stem of SHEETS) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  const displayCell = readPng(path.join(PROC, occupied[0].file)).width;
  const maxDim = Math.round((fj.cell * FIT) / fj.scale);
  const exact = (fj.cell * FIT) / maxDim;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's1487-'));
  const row = {
    stem, cells: occupied.length, exactScale: exact, recordedScale: fj.scale,
    invariantHolds: 0, invariantBreaks: 0,
    A: { alpha: 0, opaque: 0, maxDelta: 0, suspectsAfter: 0 },
    B: { alpha: 0, opaque: 0, maxDelta: 0, suspectsAfter: 0 },
    fullArm: { alpha: 0, opaque: 0, maxDelta: 0, suspectsAfter: 0 },
    suspectsBefore: 0,
  };
  try {
    execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${fj.grid.cols}x${fj.grid.rows}`,
      '--cell', String(fj.cell), '--scale', String(exact), '--out', tmp, path.join(RAW, `${stem}.png`)], { stdio: 'pipe' });

    for (const cell of occupied) {
      const produced = readPng(path.join(tmp, cell.file));            // full-res re-extraction
      const shippedDisp = readPng(path.join(PROC, cell.file));
      const fullPath = path.join(FULL, cell.file);
      const hasFull = fs.existsSync(fullPath);
      const shippedFull = hasFull ? readPng(fullPath) : null;

      if (haloSuspect(shippedDisp)) row.suspectsBefore++;

      // --- INVARIANT: is the shipped display cell a downscale of the shipped master?
      if (hasFull) {
        const derived = resize(shippedFull, displayCell, displayCell);
        const d = diff(shippedDisp, derived);
        if (d.alpha === 0 && d.opaque === 0 && d.maxDelta === 0) row.invariantHolds++;
        else row.invariantBreaks++;
      }

      // --- ARM A: composite at the DISPLAY level (F-1486-1's recipe)
      const cureDisp = hasFull ? resize(produced, displayCell, displayCell) : produced;
      const candA = composite(shippedDisp, cureDisp);
      const dA = diff(shippedDisp, candA);
      row.A.alpha += dA.alpha; row.A.opaque += dA.opaque; row.A.maxDelta = Math.max(row.A.maxDelta, dA.maxDelta);
      if (haloSuspect(candA)) row.A.suspectsAfter++;

      // --- ARM B: composite at the FULL level, then resize down
      if (hasFull) {
        const candFull = composite(shippedFull, produced);
        const dFull = diff(shippedFull, candFull);
        row.fullArm.alpha += dFull.alpha; row.fullArm.opaque += dFull.opaque;
        row.fullArm.maxDelta = Math.max(row.fullArm.maxDelta, dFull.maxDelta);
        if (haloSuspect(candFull)) row.fullArm.suspectsAfter++;

        const candB = resize(candFull, displayCell, displayCell);
        const dB = diff(shippedDisp, candB);
        row.B.alpha += dB.alpha; row.B.opaque += dB.opaque; row.B.maxDelta = Math.max(row.B.maxDelta, dB.maxDelta);
        if (haloSuspect(candB)) row.B.suspectsAfter++;
      }
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  invOk += row.invariantHolds; invBad += row.invariantBreaks;
  tot.cells += row.cells; tot.sBefore += row.suspectsBefore;
  tot.aAlpha += row.A.alpha; tot.aOpaque += row.A.opaque; tot.aMaxD = Math.max(tot.aMaxD, row.A.maxDelta); tot.aAfter += row.A.suspectsAfter;
  tot.bAlpha += row.B.alpha; tot.bOpaque += row.B.opaque; tot.bMaxD = Math.max(tot.bMaxD, row.B.maxDelta); tot.bAfter += row.B.suspectsAfter;
  tot.fullAlpha += row.fullArm.alpha; tot.fullOpaque += row.fullArm.opaque; tot.fullMaxD = Math.max(tot.fullMaxD, row.fullArm.maxDelta);
  per.push(row);

  console.log(`${stem}  (${row.cells} cells, scale ${fj.scale} -> ${exact.toFixed(10)})`);
  console.log(`   derivation invariant: holds ${row.invariantHolds} / breaks ${row.invariantBreaks}`);
  console.log(`   ARM A (display composite): alpha ${row.A.alpha} · opaqueRGB ${row.A.opaque} (max ${row.A.maxDelta}) · suspects ${row.suspectsBefore} -> ${row.A.suspectsAfter}`);
  console.log(`   ARM B (full composite -> resize): alpha ${row.B.alpha} · opaqueRGB ${row.B.opaque} (max ${row.B.maxDelta}) · suspects ${row.suspectsBefore} -> ${row.B.suspectsAfter}`);
  console.log(`   full master itself: alpha ${row.fullArm.alpha} · opaqueRGB ${row.fullArm.opaque} (max ${row.fullArm.maxDelta}) · suspectsAfter ${row.fullArm.suspectsAfter}`);
}

console.log('\n=== VERDICT ===');
console.log(`cells: ${tot.cells}   shipped halo suspects: ${tot.sBefore}`);
console.log(`derivation invariant on shipped bytes: holds ${invOk} / breaks ${invBad}`);
console.log(`ARM A: alpha ${tot.aAlpha} · opaqueRGB ${tot.aOpaque} (max ${tot.aMaxD}) · suspectsAfter ${tot.aAfter}`);
console.log(`ARM B: alpha ${tot.bAlpha} · opaqueRGB ${tot.bOpaque} (max ${tot.bMaxD}) · suspectsAfter ${tot.bAfter}`);
console.log(`FULL masters: alpha ${tot.fullAlpha} · opaqueRGB ${tot.fullOpaque} (max ${tot.fullMaxD})`);

const armAOk = tot.aAlpha === 0 && tot.aOpaque === 0 && tot.aAfter === 0;
const armBOk = tot.bAlpha === 0 && tot.bOpaque === 0 && tot.bAfter === 0;
console.log(`\nARM A reproduces F-1486-1 (alpha 0 / opaqueRGB 0 / suspects 0): ${armAOk ? 'YES — harness validated' : 'NO — HARNESS SUSPECT'}`);
console.log(`ARM B satisfies the same gate: ${armBOk ? 'YES' : 'NO'}`);
console.log(armAOk && armBOk
  ? '\nRECOMMENDATION: author ARM B — it satisfies the gate AND preserves the derivation\ninvariant, so processed/ stays a true downscale of processed-full/ and the master\nmatches the accepted 774-cell precedent (which rewrote masters too).'
  : armAOk
    ? '\nRECOMMENDATION: author ARM A, scoped to assets/processed/ ONLY, and state in the master\nthat the full-res masters are deliberately left alone because the derivation-preserving\nrecipe does NOT satisfy the gate. This DIVERGES from the 774-cell precedent — say so.'
    : '\nSTOP: the harness does not reproduce F-1486-1. Do not author from these numbers.');

fs.writeFileSync('artifacts/f1487-1/full-res-arm.json', JSON.stringify({ per, tot, invOk, invBad, armAOk, armBOk }, null, 2) + '\n');
