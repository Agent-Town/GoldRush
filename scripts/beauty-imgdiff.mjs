#!/usr/bin/env node
/**
 * beauty-imgdiff.mjs — honest before/after comparison for the beauty shifts.
 *
 * Two jobs:
 *   1. Prove a re-export is deterministic (or measure exactly how it is not).
 *   2. Quantify "did this upgrade actually change what the camera sees?" so a
 *      shift's verdict table carries a number instead of an adjective.
 *
 * Usage:
 *   node scripts/beauty-imgdiff.mjs <before.png> <after.png> [--bands N]
 *
 * --bands N slices the image into N horizontal bands and reports per-band mean
 * luminance before/after, which is how the "two sides, two lights" value split
 * is measured without eyeballing it.
 */
import sharp from 'sharp';

const args = process.argv.slice(2);
const bandIndex = args.findIndex((a) => a.startsWith('--bands'));
const bands = bandIndex < 0 ? 0 : Number(args[bandIndex].split('=')[1] ?? args[bandIndex + 1]);
const consumed = new Set(bandIndex < 0 ? [] : args[bandIndex].includes('=') ? [bandIndex] : [bandIndex, bandIndex + 1]);
const files = args.filter((a, i) => !consumed.has(i) && !a.startsWith('--'));

if (files.length !== 2) {
  console.error('usage: beauty-imgdiff.mjs <before.png> <after.png> [--bands N]');
  process.exit(2);
}

const read = async (p) => {
  const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
  return { data, info };
};

const [a, b] = await Promise.all(files.map(read));
if (a.info.width !== b.info.width || a.info.height !== b.info.height || a.info.channels !== b.info.channels) {
  console.log(JSON.stringify({ verdict: 'SHAPE MISMATCH', before: a.info, after: b.info }, null, 1));
  process.exit(1);
}

const ch = a.info.channels;
const px = a.data.length / ch;
let maxDelta = 0;
let sumDelta = 0;
let differing = 0;
for (let i = 0; i < a.data.length; i += ch) {
  let d = 0;
  for (let c = 0; c < Math.min(ch, 3); c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[i + c]));
  if (d > 0) differing++;
  if (d > maxDelta) maxDelta = d;
  sumDelta += d;
}

const lum = (buf, i) => 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2];
const meanLum = (buf) => {
  let s = 0;
  for (let i = 0; i < buf.length; i += ch) s += lum(buf, i);
  return s / px;
};

const out = {
  size: `${a.info.width}x${a.info.height}x${ch}`,
  differingPixels: differing,
  differingPct: +((100 * differing) / px).toFixed(4),
  maxChannelDelta: maxDelta,
  meanChannelDelta: +(sumDelta / px).toFixed(5),
  meanLuminance: { before: +meanLum(a.data).toFixed(2), after: +meanLum(b.data).toFixed(2) },
};

if (bands > 0) {
  const { width, height } = a.info;
  const rows = Math.floor(height / bands);
  out.bands = [];
  for (let k = 0; k < bands; k++) {
    const y0 = k * rows;
    const y1 = k === bands - 1 ? height : (k + 1) * rows;
    let sa = 0;
    let sb = 0;
    let n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * ch;
        sa += lum(a.data, i);
        sb += lum(b.data, i);
        n++;
      }
    }
    out.bands.push({ band: k, rows: `${y0}-${y1}`, before: +(sa / n).toFixed(2), after: +(sb / n).toFixed(2), delta: +((sb - sa) / n).toFixed(2) });
  }
}

console.log(JSON.stringify(out, null, 1));
