/**
 * s1449 drill-yard prop extraction probe.
 *
 * Kept as evidence (RETENTION LAW): this is the instrument that measured the
 * cut-out, not a summary of it. Re-run it to re-derive every number in
 * reviews/art-drill-yard-props-extracted.md.
 *
 *   node artifacts/drill-yard-props/probe-cutout.mjs
 *
 * It answers three questions the extraction log cannot:
 *   1. do the raws' ff00ff counts match what the LEDGER recorded (transposition check)
 *   2. does the processed PNG actually CUT (alpha present, corners clear, subject bounded)
 *   3. is there residual magenta fringing left inside the kept pixels
 * prop-baron-banner.png is the CONTROL: same slot, same generator, already shipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const load = (p) => PNG.sync.read(fs.readFileSync(p));

function countKey(png, r, g, b) {
  let n = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i] === r && png.data[i + 1] === g && png.data[i + 2] === b) n++;
  }
  return n;
}

function alphaStats(png) {
  let transparent = 0, opaque = 0, partial = 0;
  for (let i = 3; i < png.data.length; i += 4) {
    const a = png.data[i];
    if (a === 0) transparent++;
    else if (a === 255) opaque++;
    else partial++;
  }
  return { total: png.width * png.height, transparent, opaque, partial };
}

function cornerAlpha(png) {
  const at = (x, y) => png.data[(y * png.width + x) * 4 + 3];
  return [at(0, 0), at(png.width - 1, 0), at(0, png.height - 1), at(png.width - 1, png.height - 1)];
}

function bbox(png) {
  let minX = png.width, minY = png.height, maxX = -1, maxY = -1;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** magenta-ish pixels surviving inside the kept (visible) region = fringing */
function residualMagenta(png) {
  let n = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] < 16) continue;
    const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
    if (r > 150 && b > 150 && g < 100) n++;
  }
  return n;
}

const names = [
  'prop-drill-faucet-station.png',
  'prop-drill-bell-post.png',
  'prop-straw-man-stand.png',
];

console.log('=== RAW ff00ff counts (LEDGER transposition check) ===');
for (const n of names) {
  const raw = load(path.join(ROOT, 'assets/raw', n));
  const c = countKey(raw, 255, 0, 255);
  console.log(`${n}: ${raw.width}x${raw.height} ff00ff=${c} (${(100 * c / (raw.width * raw.height)).toFixed(2)}%)`);
}

console.log('\n=== PROCESSED cut-out verification ===');
for (const n of [...names, 'prop-baron-banner.png']) {
  const p = path.join(ROOT, 'assets/processed', n);
  if (!fs.existsSync(p)) { console.log(`${n}: MISSING`); continue; }
  const png = load(p);
  const a = alphaStats(png);
  const bb = bbox(png);
  console.log(`${n}${n === 'prop-baron-banner.png' ? '  [CONTROL]' : ''}: ${png.width}x${png.height} bytes=${fs.statSync(p).size}`);
  console.log(`   alpha: transparent=${a.transparent} (${(100 * a.transparent / a.total).toFixed(1)}%) opaque=${a.opaque} (${(100 * a.opaque / a.total).toFixed(1)}%) partial=${a.partial}`);
  console.log(`   corners alpha=[${cornerAlpha(png).join(',')}]  subject bbox=${bb.w}x${bb.h} at (${bb.minX},${bb.minY})`);
  console.log(`   residual magenta px (alpha>=16): ${residualMagenta(png)}`);
}
