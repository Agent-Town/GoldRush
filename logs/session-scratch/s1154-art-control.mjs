#!/usr/bin/env node
// s1154 — CONTROL: run the SAME instrument over the already-accepted E1 batch,
// whose true verdict is known (row 60: five portraits in 130-145, tf-mei at 104,
// contact-sheet MAE 0.2). If my instrument reproduces those numbers, it is the
// convention's instrument and the E6 readings mean what they appear to mean.
// If it does not, my instrument is the wrong one and the E6 "OUT" is an artefact.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const E1 = [
  'assets/raw/tf-assay-clerk.png',
  'assets/raw/tf-elder-rowan.png',
  'assets/raw/tf-mei.png',
  'assets/raw/tf-preacher.png',
  'assets/raw/tf-schoolteacher.png',
  'assets/raw/tf-storekeeper.png',
];
const E1_SHEET = 'assets/contact-sheets/tf-e1-portrait-convention-sheet.png';

const load = (p) => PNG.sync.read(fs.readFileSync(p));

function cornerWarmth(png, ox, oy, size) {
  let r = 0, b = 0, n = 0;
  for (let y = oy; y < oy + size; y++)
    for (let x = ox; x < ox + size; x++) {
      const i = (png.width * y + x) << 2;
      r += png.data[i]; b += png.data[i + 2]; n++;
    }
  return (r - b) / n;
}

function wholeWarmth(png) {
  let r = 0, b = 0, n = 0;
  for (let i = 0; i < png.data.length; i += 4) { r += png.data[i]; b += png.data[i + 2]; n++; }
  return (r - b) / n;
}

console.log('=== E1 CONTROL (accepted batch, row 60) ===');
console.log('file'.padEnd(26), 'WxH'.padEnd(12), 'TL60'.padEnd(8), 'TR60'.padEnd(8), 'BL60'.padEnd(8), 'BR60'.padEnd(8), '4cornerMean'.padEnd(12), 'wholeImage');
const raws = [];
for (const p of E1) {
  const png = load(p); raws.push(png);
  const W = png.width, H = png.height;
  const c = [
    cornerWarmth(png, 0, 0, 60), cornerWarmth(png, W - 60, 0, 60),
    cornerWarmth(png, 0, H - 60, 60), cornerWarmth(png, W - 60, H - 60, 60),
  ];
  const mean = c.reduce((a, b) => a + b, 0) / 4;
  console.log(
    p.replace('assets/raw/', '').padEnd(26), `${W}x${H}`.padEnd(12),
    ...c.map((v) => v.toFixed(1).padEnd(8)),
    mean.toFixed(1).padEnd(12), wholeWarmth(png).toFixed(1),
  );
}

// same box-downsample MAE instrument, on the E1 sheet whose true MAE was 0.2
function downsample(png, N) {
  const out = new Float64Array(N * N * 3);
  const sx = png.width / N, sy = png.height / N;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++)
        for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) {
          const i = (png.width * yy + xx) << 2;
          r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
        }
      const o = (y * N + x) * 3;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
    }
  return out;
}

function cellMAE(sheet, CELL, yOff, idx, ref) {
  const col = idx % 3, row = Math.floor(idx / 3);
  const ox = col * CELL, oy = yOff + row * CELL;
  let mr = 0, mg = 0, mb = 0;
  for (let y = 0; y < CELL; y++)
    for (let x = 0; x < CELL; x++) {
      const i = (sheet.width * (oy + y) + (ox + x)) << 2;
      const o = (y * CELL + x) * 3;
      mr += Math.abs(sheet.data[i] - ref[o]);
      mg += Math.abs(sheet.data[i + 1] - ref[o + 1]);
      mb += Math.abs(sheet.data[i + 2] - ref[o + 2]);
    }
  const n = CELL * CELL;
  return [mr / n, mg / n, mb / n];
}

const sheet = load(E1_SHEET);
const CELL = Math.floor(sheet.width / 3);
const yOff = Math.round((sheet.height - 2 * CELL) / 2);
console.log(`\n=== E1 SHEET (${sheet.width}x${sheet.height}, cell ${CELL}, yOff ${yOff}) — row 60 measured MAE 0.2 ===`);
const refs = raws.map((r) => downsample(r, CELL));
for (let i = 0; i < 6; i++) {
  const m = cellMAE(sheet, CELL, yOff, i, refs[i]);
  console.log(`cell ${i}`.padEnd(10), E1[i].replace('assets/raw/tf-', '').replace('.png', '').padEnd(16),
    `MAE ${m[0].toFixed(2)} / ${m[1].toFixed(2)} / ${m[2].toFixed(2)}`);
}

// POSITIVE CONTROL: how large is MAE when the cell is compared to the WRONG portrait?
console.log('\n=== POSITIVE CONTROL — cell 0 vs each raw (discriminating scale) ===');
for (let i = 0; i < 6; i++) {
  const m = cellMAE(sheet, CELL, yOff, 0, refs[i]);
  console.log(`  cell0 vs ${E1[i].replace('assets/raw/tf-', '').replace('.png', '').padEnd(16)}`,
    `MAE ${m[0].toFixed(2)} / ${m[1].toFixed(2)} / ${m[2].toFixed(2)}`, i === 0 ? '  <-- correct pairing' : '');
}
