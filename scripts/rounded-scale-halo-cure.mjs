#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const BASE = '89bfc10cda7e208589c7ad6304eb4c6aeae727bf';
const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
const RAW = 'assets/raw';
const FIT = 0.86;
const SHEETS = [
  ['char-hero-sheet-back-f', 6],
  ['char-hero-sheet-front-f', 6],
  ['char-hero-sheet-rotation2-f', 8],
  ['char-hero-sheet-side-actions-f', 6],
  ['char-hero-sheet-side-f', 4],
  ['ter-rail-elements', 7],
];

const readPng = (file) => PNG.sync.read(fs.readFileSync(file));
const gitShow = (file) => execFileSync('git', ['show', `${BASE}:${file}`], { maxBuffer: 20 * 1024 * 1024 });
const readBasePng = (file) => PNG.sync.read(gitShow(file));

// Verbatim from artifacts/f1486-1/opaque-preserving-composite.mjs:56-78.
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

// Verbatim from artifacts/f1487-1/full-res-arm.mjs:77-88.
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

function haloSuspect(png) {
  let transparent = 0, key = 0;
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2;
    if (png.data[o + 3] !== 0) continue;
    transparent++;
    if (png.data[o] === 255 && png.data[o + 1] === 0 && png.data[o + 2] === 255) key++;
  }
  return transparent > 0 && key / transparent > 0.05;
}

function measure(base, cured) {
  assert.equal(cured.width, base.width);
  assert.equal(cured.height, base.height);
  let alphaDiffPixels = 0, opaqueRgbDiffPixels = 0, maxDelta = 0;
  for (let i = 0; i < base.width * base.height; i++) {
    const o = i << 2;
    if (base.data[o + 3] !== cured.data[o + 3]) alphaDiffPixels++;
    if (base.data[o + 3] !== 255) continue;
    const delta = Math.max(
      Math.abs(base.data[o] - cured.data[o]),
      Math.abs(base.data[o + 1] - cured.data[o + 1]),
      Math.abs(base.data[o + 2] - cured.data[o + 2]),
    );
    if (delta) { opaqueRgbDiffPixels++; maxDelta = Math.max(maxDelta, delta); }
  }
  return {
    alphaDiffPixels,
    opaqueRgbDiffPixels,
    maxDelta,
    haloSuspectBefore: haloSuspect(base),
    haloSuspectAfter: haloSuspect(cured),
  };
}

function addMetric(target, metric) {
  target.alphaDiffPixels += metric.alphaDiffPixels;
  target.opaqueRgbDiffPixels += metric.opaqueRgbDiffPixels;
  target.maxDelta = Math.max(target.maxDelta, metric.maxDelta);
  target.haloSuspects.before += Number(metric.haloSuspectBefore);
  target.haloSuspects.after += Number(metric.haloSuspectAfter);
}

function derivationDiff(display, derived) {
  assert.equal(derived.width, display.width);
  assert.equal(derived.height, display.height);
  let rgbaDiffPixels = 0, alphaDiffPixels = 0, opaqueRgbDiffPixels = 0, maxDelta = 0;
  for (let i = 0; i < display.width * display.height; i++) {
    const o = i << 2;
    const rgbaDiff = display.data[o] !== derived.data[o]
      || display.data[o + 1] !== derived.data[o + 1]
      || display.data[o + 2] !== derived.data[o + 2]
      || display.data[o + 3] !== derived.data[o + 3];
    if (rgbaDiff) rgbaDiffPixels++;
    if (display.data[o + 3] !== derived.data[o + 3]) alphaDiffPixels++;
    if (display.data[o + 3] !== 255) continue;
    const delta = Math.max(
      Math.abs(display.data[o] - derived.data[o]),
      Math.abs(display.data[o + 1] - derived.data[o + 1]),
      Math.abs(display.data[o + 2] - derived.data[o + 2]),
    );
    if (delta) { opaqueRgbDiffPixels++; maxDelta = Math.max(maxDelta, delta); }
  }
  return { rgbaDiffPixels, alphaDiffPixels, opaqueRgbDiffPixels, maxDelta };
}

const outputs = [];
const rows = [];

for (const [stem, expectedCells] of SHEETS) {
  const frames = JSON.parse(fs.readFileSync(path.join(PROC, `${stem}.frames.json`), 'utf8'));
  const occupied = frames.cells.filter((cell) => !cell.empty);
  assert.equal(occupied.length, expectedCells, `${stem} occupied-cell count moved`);
  const maxDim = Math.round((frames.cell * FIT) / frames.scale);
  const exactScale = (frames.cell * FIT) / maxDim;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rounded-scale-halo-cure-'));
  try {
    execFileSync('node', [
      'scripts/extract-alpha.mjs', '--key', 'ff00ff',
      '--grid', `${frames.grid.cols}x${frames.grid.rows}`,
      '--cell', String(frames.cell), '--scale', String(exactScale),
      '--out', tmp, path.join(RAW, `${stem}.png`),
    ], { stdio: 'pipe' });

    for (const cell of occupied) {
      const displayPath = path.join(PROC, cell.file);
      const fullPath = path.join(FULL, cell.file);
      assert.ok(fs.existsSync(fullPath), `${fullPath} missing`);
      const shippedDisplay = readPng(displayPath);
      const shippedFull = readPng(fullPath);
      const produced = readPng(path.join(tmp, cell.file));
      const cureDisplay = resize(produced, shippedDisplay.width, shippedDisplay.height);
      assert.deepEqual([produced.width, produced.height], [shippedFull.width, shippedFull.height]);
      assert.deepEqual([cureDisplay.width, cureDisplay.height], [shippedDisplay.width, shippedDisplay.height]);
      outputs.push({
        stem,
        file: cell.file,
        displayPath,
        fullPath,
        display: composite(shippedDisplay, cureDisplay),
        full: composite(shippedFull, produced),
      });
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  rows.push({ stem, cells: occupied.length, recordedScale: frames.scale, exactScale, maxDim });
}

assert.equal(outputs.length, 37);
const total = {
  cells: outputs.length,
  processed: { alphaDiffPixels: 0, opaqueRgbDiffPixels: 0, maxDelta: 0, haloSuspects: { before: 0, after: 0 } },
  processedFull: { alphaDiffPixels: 0, opaqueRgbDiffPixels: 0, maxDelta: 0, haloSuspects: { before: 0, after: 0 } },
};
const derivationBreak = {
  cells: outputs.length,
  byteIdenticalCells: 0,
  differingCells: 0,
  rgbaDiffPixels: 0,
  alphaDiffPixels: 0,
  opaqueRgbDiffPixels: 0,
  maxDelta: 0,
};

for (const row of rows) {
  row.processed = { alphaDiffPixels: 0, opaqueRgbDiffPixels: 0, maxDelta: 0, haloSuspects: { before: 0, after: 0 } };
  row.processedFull = { alphaDiffPixels: 0, opaqueRgbDiffPixels: 0, maxDelta: 0, haloSuspects: { before: 0, after: 0 } };
  for (const output of outputs.filter(({ stem }) => stem === row.stem)) {
    const processed = measure(readBasePng(output.displayPath), output.display);
    const processedFull = measure(readBasePng(output.fullPath), output.full);
    addMetric(row.processed, processed);
    addMetric(row.processedFull, processedFull);
    addMetric(total.processed, processed);
    addMetric(total.processedFull, processedFull);

    const diff = derivationDiff(output.display, resize(output.full, output.display.width, output.display.height));
    const identical = diff.rgbaDiffPixels === 0;
    derivationBreak.byteIdenticalCells += Number(identical);
    derivationBreak.differingCells += Number(!identical);
    derivationBreak.rgbaDiffPixels += diff.rgbaDiffPixels;
    derivationBreak.alphaDiffPixels += diff.alphaDiffPixels;
    derivationBreak.opaqueRgbDiffPixels += diff.opaqueRgbDiffPixels;
    derivationBreak.maxDelta = Math.max(derivationBreak.maxDelta, diff.maxDelta);
  }
}

for (const key of ['processed', 'processedFull']) {
  const metric = total[key];
  assert.equal(metric.alphaDiffPixels, 0, `${key} alpha moved`);
  assert.equal(metric.opaqueRgbDiffPixels, 0, `${key} opaque RGB moved`);
  assert.deepEqual(metric.haloSuspects, { before: 37, after: 0 }, `${key} halo result diverged`);
}
assert.equal(derivationBreak.opaqueRgbDiffPixels, 73, 'derivation break diverged from s1487');
assert.equal(derivationBreak.maxDelta, 1, 'derivation break max delta diverged from s1487');

for (const output of outputs) {
  fs.writeFileSync(output.displayPath, PNG.sync.write(output.display));
  fs.writeFileSync(output.fullPath, PNG.sync.write(output.full));
}
const evidence = { base: BASE, sheets: rows, total, derivationBreak };
fs.writeFileSync('artifacts/f1486-1/cure-applied.json', `${JSON.stringify(evidence, null, 2)}\n`);

for (const row of rows) {
  console.log(`${row.stem}: ${row.cells} cells; processed alpha ${row.processed.alphaDiffPixels}, opaque RGB ${row.processed.opaqueRgbDiffPixels}, suspects ${row.processed.haloSuspects.before} -> ${row.processed.haloSuspects.after}; processed-full alpha ${row.processedFull.alphaDiffPixels}, opaque RGB ${row.processedFull.opaqueRgbDiffPixels}, suspects ${row.processedFull.haloSuspects.before} -> ${row.processedFull.haloSuspects.after}`);
}
console.log(`cure applied: ${total.cells} cells; derivation break ${derivationBreak.opaqueRgbDiffPixels} opaque pixels, max delta ${derivationBreak.maxDelta}/255`);
