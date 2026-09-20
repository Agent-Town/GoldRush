#!/usr/bin/env node
/**
 * F-1470-4 — is the seven-sheet "rounded-scale" residue class curable TODAY,
 * mechanically, without an owner's eye?
 *
 * THE HYPOTHESIS, stated so it can be refuted:
 *   `extract-alpha.mjs:376` computes  scale = min(1, (cell * 0.86) / maxDim)
 *   as a full double, then `:412` writes it to frames.json as `toFixed(4)`.
 *   `anim-pass-reextract.mjs:163` reads that ROUNDED value back out of
 *   frames.json and feeds it in as `--scale`, which overrides the auto path.
 *   So every sheet whose scale is < 1 is re-extracted at a slightly WRONG
 *   scale, resampling every cell a hair differently — which is exactly what
 *   the strict alpha/opaque-RGB invariant caught on 7 sheets / 45 cells.
 *   Sheets clamped to scale == 1 are immune, because min(1, ...) makes the
 *   rounding irrelevant — and those are precisely the ones that passed.
 *
 * THEREFORE: re-extracting these 7 sheets with NO --scale (letting the
 * extractor recompute its own exact double) should reproduce the shipped
 * geometry byte-for-byte in alpha and opaque RGB, while still curing the halo.
 *
 * ARM A (CONTROL) — pass --scale <rounded>, i.e. reproduce what the runner did.
 *   This arm MUST fail, or the instrument is measuring nothing and arm B's
 *   green means nothing either. A green control is a broken control.
 * ARM B (HYPOTHESIS) — omit --scale entirely.
 *
 * Writes nothing under assets/. Scratch only.
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

// The seven rounded-scale sheets named by F-1470-4. Derived, not hand-typed:
// the roster below is asserted against a live scan of the 15 held sheets.
const HELD = [
  'char-bandit-thief-sheet-walk8', 'char-baron-sheet-walk8',
  'char-e9-feral_terraformer-sheet-walk8', 'char-elder-sheet-walk8',
  'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f',
  'char-hero-sheet-side-f', 'char-hero-sheet-walk8',
  'char-newsie-mei-sheet-walk8', 'char-storekeeper-sheet-walk8',
  'char-youngster-f-sheet-walk8', 'char-youngster-m-sheet-walk8',
  'ter-rail-elements',
];

const readPng = (f) => PNG.sync.read(fs.readFileSync(f));

/** Verbatim from anim-pass-reextract.mjs:59-81 — the shipped downscale. */
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

function convention(stem) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  const shipped = readPng(path.join(PROC, occupied[0].file));
  const masters = occupied.filter((c) => fs.existsSync(path.join(FULL, c.file))).length;
  return {
    stem, grid: fj.grid, declCell: fj.cell, scale: fj.scale,
    displayCell: shipped.width, hasMaster: masters === occupied.length, occupied,
  };
}

/** The sweep predicate, verbatim from artifacts/f1450-4/halo-class-sweep.mjs:40-56. */
function keyShare(png) {
  let transparent = 0, keyPx = 0;
  for (let i = 0; i < png.width * png.height; i++) {
    const idx = i << 2;
    if (png.data[idx + 3] !== 0) continue;
    transparent++;
    const hex = [png.data[idx], png.data[idx + 1], png.data[idx + 2]]
      .map((v) => v.toString(16).padStart(2, '0')).join('');
    if (hex === KEY) keyPx++;
  }
  return transparent ? keyPx / transparent : 0;
}

/** The F-1470-4 gate's own invariant: alpha byte-identical, no opaque pixel changes RGB. */
function compare(before, after) {
  if (before.width !== after.width || before.height !== after.height) {
    return { dims: `${before.width}x${before.height} -> ${after.width}x${after.height}`, alpha: -1, opaque: -1, maxAlpha: -1 };
  }
  let alpha = 0, maxAlpha = 0, opaque = 0;
  for (let i = 0; i < before.width * before.height; i++) {
    const o = i << 2;
    const d = Math.abs(before.data[o + 3] - after.data[o + 3]);
    if (d) { alpha++; maxAlpha = Math.max(maxAlpha, d); }
    if (before.data[o + 3] === 255 && (
      before.data[o] !== after.data[o] || before.data[o + 1] !== after.data[o + 1] || before.data[o + 2] !== after.data[o + 2]
    )) opaque++;
  }
  return { dims: null, alpha, maxAlpha, opaque };
}

function extract(conv, useRoundedScale, outDir) {
  const args = ['scripts/extract-alpha.mjs', '--key', KEY,
    '--grid', `${conv.grid.cols}x${conv.grid.rows}`, '--cell', String(conv.declCell)];
  if (useRoundedScale) args.push('--scale', String(conv.scale));
  args.push('--out', outDir, path.join(RAW, `${conv.stem}.png`));
  execFileSync('node', args, { stdio: 'pipe' });
  const fj = JSON.parse(fs.readFileSync(path.join(outDir, `${conv.stem}.frames.json`), 'utf8'));
  return fj.scale;
}

// ---------------------------------------------------------------------------

const conventions = HELD.map(convention);
const rounded = conventions.filter((c) => Math.abs(c.scale - Math.round(c.scale)) > 1e-9);
const integral = conventions.filter((c) => Math.abs(c.scale - Math.round(c.scale)) <= 1e-9);
console.log(`held sheets ${conventions.length} = ${rounded.length} rounded-scale + ${integral.length} scale-1`);
console.log(`rounded-scale cells: ${rounded.reduce((n, c) => n + c.occupied.length, 0)}`);
console.log(`scale-1 cells:       ${integral.reduce((n, c) => n + c.occupied.length, 0)}\n`);

const results = [];
for (const conv of rounded) {
  const row = { stem: conv.stem, shippedScale: conv.scale, cells: conv.occupied.length, hasMaster: conv.hasMaster, arms: {} };
  for (const [arm, useRounded] of [['A-control-rounded', true], ['B-auto-exact', false]]) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `s1485-${arm}-`));
    let emittedScale;
    try {
      emittedScale = extract(conv, useRounded, tmp);
      let alpha = 0, opaque = 0, maxAlpha = 0, dimsMoved = 0, suspects = 0, worstShare = 0;
      for (const cell of conv.occupied) {
        const produced = readPng(path.join(tmp, cell.file));
        // What would actually SHIP for this cell, reproducing anim-pass-reextract:170-175.
        const shippedForm = conv.hasMaster ? resize(produced, conv.displayCell, conv.displayCell) : produced;
        const current = readPng(path.join(PROC, cell.file));
        const c = compare(current, shippedForm);
        if (c.dims) dimsMoved++;
        else { alpha += c.alpha; opaque += c.opaque; maxAlpha = Math.max(maxAlpha, c.maxAlpha); }
        const share = keyShare(shippedForm);
        worstShare = Math.max(worstShare, share);
        if (share > 0.05) suspects++;
      }
      row.arms[arm] = { emittedScale, alpha, maxAlpha, opaque, dimsMoved, suspects, worstShare: (worstShare * 100).toFixed(2) + '%' };
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
  results.push(row);
  const a = row.arms['A-control-rounded'], b = row.arms['B-auto-exact'];
  console.log(`${conv.stem}  (${conv.occupied.length} cells, shipped scale ${conv.scale}, master ${conv.hasMaster ? 'yes' : 'no'})`);
  console.log(`   A control (--scale ${conv.scale}): alphaDiff ${a.alpha} (max ${a.maxAlpha})  opaqueRGB ${a.opaque}  suspects ${a.suspects}  worst ${a.worstShare}`);
  console.log(`   B auto    (no --scale, emits ${b.emittedScale}): alphaDiff ${b.alpha} (max ${b.maxAlpha})  opaqueRGB ${b.opaque}  suspects ${b.suspects}  worst ${b.worstShare}`);
}

const sum = (arm, k) => results.reduce((n, r) => n + r.arms[arm][k], 0);
console.log('\n=== VERDICT ===');
console.log(`ARM A (control, reproduces the runner): alphaDiff ${sum('A-control-rounded', 'alpha')}  opaqueRGB ${sum('A-control-rounded', 'opaque')}  sweep suspects ${sum('A-control-rounded', 'suspects')}`);
console.log(`ARM B (hypothesis, no --scale):        alphaDiff ${sum('B-auto-exact', 'alpha')}  opaqueRGB ${sum('B-auto-exact', 'opaque')}  sweep suspects ${sum('B-auto-exact', 'suspects')}`);
const controlFailed = sum('A-control-rounded', 'alpha') + sum('A-control-rounded', 'opaque') > 0;
console.log(controlFailed
  ? 'CONTROL VALID: arm A violates the invariant, as the runner reported.'
  : 'CONTROL BROKEN: arm A passed. This instrument proves nothing — do not trust arm B.');
fs.writeFileSync('artifacts/f1470-4/rounded-scale-ab.json', JSON.stringify(results, null, 2) + '\n');
