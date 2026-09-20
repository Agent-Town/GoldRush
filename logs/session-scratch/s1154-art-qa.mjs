#!/usr/bin/env node
// s1154 — independent QA of the art-e6-town-icons deliverables.
// Re-measures every number the runner reported; believes none of them.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const PORTRAITS = [
  'assets/raw/tf-reactor-steward-e6.png',
  'assets/raw/tf-kitchen-chemist-e6.png',
  'assets/raw/tf-appliance-wrangler-e6.png',
  'assets/raw/tf-diner-carhop-e6.png',
  'assets/raw/tf-combine-defector-e6.png',
  'assets/raw/tf-depot-clerk-e6.png',
];
const SHEET = 'assets/contact-sheets/tf-e6-town-sheet.png';

const load = (p) => PNG.sync.read(fs.readFileSync(p));

// mean R-B over a size x size corner block at (ox,oy)
function cornerWarmth(png, ox, oy, size) {
  let r = 0, b = 0, n = 0;
  for (let y = oy; y < oy + size; y++) {
    for (let x = ox; x < ox + size; x++) {
      const i = (png.width * y + x) << 2;
      r += png.data[i]; b += png.data[i + 2]; n++;
    }
  }
  return (r - b) / n;
}

function scan(png) {
  let magenta = 0, transparent = 0, nearMagenta = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const R = png.data[i], G = png.data[i + 1], B = png.data[i + 2], A = png.data[i + 3];
    if (A < 255) transparent++;
    if (R === 255 && G === 0 && B === 255) magenta++;
    else if (R > 230 && G < 40 && B > 230) nearMagenta++;
  }
  return { magenta, nearMagenta, transparent };
}

console.log('=== PORTRAITS ===');
console.log('file'.padEnd(38), 'WxH'.padEnd(12), 'alphaCh', 'transPx', 'ff00ff', 'nearMag', 'R-B(60x60 corners: TL/TR/BL/BR, mean)');
const raws = [];
for (const p of PORTRAITS) {
  const png = load(p);
  raws.push(png);
  const s = scan(png);
  const W = png.width, H = png.height;
  const c = [
    cornerWarmth(png, 0, 0, 60),
    cornerWarmth(png, W - 60, 0, 60),
    cornerWarmth(png, 0, H - 60, 60),
    cornerWarmth(png, W - 60, H - 60, 60),
  ];
  const mean = c.reduce((a, b) => a + b, 0) / 4;
  const band = mean >= 130 && mean <= 145 ? 'IN' : '**OUT**';
  console.log(
    p.replace('assets/raw/', '').padEnd(38),
    `${W}x${H}`.padEnd(12),
    String(png.alpha).padEnd(7),
    String(s.transparent).padEnd(7),
    String(s.magenta).padEnd(6),
    String(s.nearMagenta).padEnd(7),
    c.map((v) => v.toFixed(1)).join(' / '), '=> mean', mean.toFixed(1), band,
  );
}

console.log('\n=== CONTACT SHEET ===');
const sheet = load(SHEET);
const ss = scan(sheet);
console.log(`${SHEET}  ${sheet.width}x${sheet.height}  alphaCh=${sheet.alpha}  transPx=${ss.transparent}  ff00ff=${ss.magenta}  nearMag=${ss.nearMagenta}`);

// 3 cols x 2 rows of 418px cells centered on the 1254 canvas
const CELL = Math.floor(sheet.width / 3);
console.log(`derived cell = ${CELL}px (sheet.width/3); rows use ${CELL}px too -> content band y=[${(sheet.height - 2 * CELL) / 2}, ${(sheet.height + 2 * CELL) / 2})`);

// box-downsample a raw to CELL x CELL and compare to the sheet cell
function downsample(png, N) {
  const out = new Float64Array(N * N * 3);
  const sx = png.width / N, sy = png.height / N;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++) {
        for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) {
          const i = (png.width * yy + xx) << 2;
          r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
        }
      }
      const o = (y * N + x) * 3;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
    }
  }
  return out;
}

const yOff = Math.round((sheet.height - 2 * CELL) / 2);
console.log('\ncell'.padEnd(10), 'expected portrait'.padEnd(30), 'MAE R/G/B vs box-downsampled raw');
for (let idx = 0; idx < 6; idx++) {
  const col = idx % 3, row = Math.floor(idx / 3);
  const ox = col * CELL, oy = yOff + row * CELL;
  const ref = downsample(raws[idx], CELL);
  let mr = 0, mg = 0, mb = 0;
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const i = (sheet.width * (oy + y) + (ox + x)) << 2;
      const o = (y * CELL + x) * 3;
      mr += Math.abs(sheet.data[i] - ref[o]);
      mg += Math.abs(sheet.data[i + 1] - ref[o + 1]);
      mb += Math.abs(sheet.data[i + 2] - ref[o + 2]);
    }
  }
  const n = CELL * CELL;
  console.log(
    `[${row},${col}]`.padEnd(10),
    PORTRAITS[idx].replace('assets/raw/tf-', '').replace('-e6.png', '').padEnd(30),
    `${(mr / n).toFixed(2)} / ${(mg / n).toFixed(2)} / ${(mb / n).toFixed(2)}`,
  );
}
