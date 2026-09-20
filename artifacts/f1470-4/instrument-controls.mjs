#!/usr/bin/env node
/**
 * Two controls on the rounded-scale-ab instrument, run BEFORE its numbers are
 * allowed to mean anything. Both target the probe itself, not the sprites.
 *
 * CONTROL 1 (does my keyShare see what the sweep sees?)
 *   The 45 rounded-scale cells are 45 of the 301 held suspects, so the SHIPPED
 *   bytes must read >5% key-magenta under my predicate. If they read 0.00%, my
 *   predicate is broken and the "suspects 0" in both A/B arms is meaningless —
 *   it would just be my instrument failing to see halo anywhere.
 *
 * CONTROL 2 (does my extract+resize+compare reproduce byte-identity at all?)
 *   Re-run arm B's exact pipeline against a sheet that was ALREADY cured by the
 *   s1470 batch. Its shipped bytes are the re-extracted bytes, so a faithful
 *   reproduction must return alphaDiff 0 AND opaqueRGB 0. Any residue here is
 *   MY artifact — and would mean the 45 opaque pixels arm B reported on the
 *   four good sheets are mine too, not the sprites'.
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

function convention(stem) {
  const fj = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = fj.cells.filter((c) => !c.empty);
  const shipped = readPng(path.join(PROC, occupied[0].file));
  const masters = occupied.filter((c) => fs.existsSync(path.join(FULL, c.file))).length;
  return { stem, grid: fj.grid, declCell: fj.cell, scale: fj.scale, displayCell: shipped.width, hasMaster: masters === occupied.length, occupied };
}

// --- CONTROL 1 -------------------------------------------------------------
console.log('=== CONTROL 1: does my keyShare see the shipped rounded-scale cells as suspects? ===');
const ROUNDED = ['char-e9-feral_terraformer-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f', 'ter-rail-elements'];
const sweep = JSON.parse(fs.readFileSync('artifacts/f1450-4/halo-class-sweep.json', 'utf8'));
const sweepShare = new Map(sweep.suspects.map((s) => [s.file, s.share]));
let seen = 0, cells = 0, mismatched = 0;
for (const stem of ROUNDED) {
  const conv = convention(stem);
  for (const cell of conv.occupied) {
    cells++;
    const mine = keyShare(readPng(path.join(PROC, cell.file)));
    const theirs = sweepShare.get(`${PROC}/${cell.file}`) ?? sweepShare.get(cell.file);
    if (mine > 0.05) seen++;
    if (theirs && Math.abs(parseFloat(theirs) - mine * 100) > 0.01) { mismatched++; console.log(`   MISMATCH ${cell.file}: mine ${(mine * 100).toFixed(2)}% vs sweep ${theirs}`); }
  }
}
console.log(`   ${seen}/${cells} shipped rounded-scale cells read >5% key under MY predicate; ${mismatched} disagree with the tracked sweep`);
console.log(seen === cells && mismatched === 0
  ? '   CONTROL 1 PASS — my predicate agrees with the sweep on every cell.\n'
  : '   CONTROL 1 FAIL — the "suspects 0" readings in the A/B probe are NOT trustworthy.\n');

// --- CONTROL 2 -------------------------------------------------------------
console.log('=== CONTROL 2: does arm B reproduce an ALREADY-CURED sheet byte-for-byte? ===');
// Pick cured sheets (not in the held 15) that still have a raw + frames.json,
// preferring ones with masters so the downscale path is exercised too.
const HELD = new Set(['char-bandit-thief-sheet-walk8', 'char-baron-sheet-walk8', 'char-e9-feral_terraformer-sheet-walk8',
  'char-elder-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f', 'char-hero-sheet-rotation2-f',
  'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f', 'char-hero-sheet-walk8', 'char-newsie-mei-sheet-walk8',
  'char-storekeeper-sheet-walk8', 'char-youngster-f-sheet-walk8', 'char-youngster-m-sheet-walk8', 'ter-rail-elements']);
const curedStems = [...new Set(sweep.suspects
  .map((s) => path.basename(s.file).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '')))]
  .filter((s) => !HELD.has(s) && fs.existsSync(path.join(RAW, `${s}.png`)) && fs.existsSync(path.join(PROC, `${s}.frames.json`)));

const withMaster = [], withoutMaster = [];
for (const s of curedStems) { const c = convention(s); (c.hasMaster ? withMaster : withoutMaster).push(c); }
const picks = [...withMaster.slice(0, 2), ...withoutMaster.slice(0, 1)];
console.log(`   ${curedStems.length} cured grid sheets available; probing ${picks.length}: ${picks.map((p) => p.stem).join(', ')}`);

let anyResidue = false;
for (const conv of picks) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's1485-ctl2-'));
  try {
    execFileSync('node', ['scripts/extract-alpha.mjs', '--key', KEY, '--grid', `${conv.grid.cols}x${conv.grid.rows}`,
      '--cell', String(conv.declCell), '--out', tmp, path.join(RAW, `${conv.stem}.png`)], { stdio: 'pipe' });
    const emitted = JSON.parse(fs.readFileSync(path.join(tmp, `${conv.stem}.frames.json`), 'utf8')).scale;
    let alpha = 0, opaque = 0, maxAlpha = 0;
    for (const cell of conv.occupied) {
      const produced = readPng(path.join(tmp, cell.file));
      const shippedForm = conv.hasMaster ? resize(produced, conv.displayCell, conv.displayCell) : produced;
      const current = readPng(path.join(PROC, cell.file));
      if (current.width !== shippedForm.width) { console.log(`   ${conv.stem}: DIMS MOVED`); continue; }
      for (let i = 0; i < current.width * current.height; i++) {
        const o = i << 2;
        const d = Math.abs(current.data[o + 3] - shippedForm.data[o + 3]);
        if (d) { alpha++; maxAlpha = Math.max(maxAlpha, d); }
        if (current.data[o + 3] === 255 && (current.data[o] !== shippedForm.data[o]
          || current.data[o + 1] !== shippedForm.data[o + 1] || current.data[o + 2] !== shippedForm.data[o + 2])) opaque++;
      }
    }
    if (alpha || opaque) anyResidue = true;
    console.log(`   ${conv.stem.padEnd(34)} scale ${conv.scale} -> ${emitted}, master ${conv.hasMaster ? 'yes' : 'no'}: alphaDiff ${alpha} (max ${maxAlpha})  opaqueRGB ${opaque}`);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
console.log(anyResidue
  ? '   CONTROL 2 FAIL — my pipeline does not reproduce already-cured bytes; residue in the A/B probe may be MINE.'
  : '   CONTROL 2 PASS — arm B reproduces cured sheets exactly, so residue it reports belongs to the sprite.');
