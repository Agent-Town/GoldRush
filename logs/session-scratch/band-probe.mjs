// Measure the gallery band in a captured frame: mean RGB, luma, warmth and the band's own
// horizontal-variance (how stripey it looks). Rendering-only measurement; writes nothing.
// Usage: node logs/session-scratch/band-probe.mjs <png> [y0] [y1] [x0] [x1]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const [file, y0 = '175', y1 = '360', x0 = '0', x1 = '1280'] = process.argv.slice(2);
const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;
const top = Number(y0); const bottom = Number(y1); const left = Number(x0); const right = Number(x1);
let r = 0; let g = 0; let b = 0; let n = 0;
const rowLuma = [];
for (let y = top; y < bottom; y += 1) {
  let rr = 0; let rn = 0;
  for (let x = left; x < right; x += 1) {
    const i = (y * width + x) * channels;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1;
    rr += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; rn += 1;
  }
  rowLuma.push(rr / rn);
}
// Column variance along a mid row band: a tiling stripe shows as high column-to-column swing.
const colLuma = [];
for (let x = left; x < right; x += 4) {
  let cc = 0; let cn = 0;
  for (let y = top; y < bottom; y += 2) {
    const i = (y * width + x) * channels;
    cc += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; cn += 1;
  }
  colLuma.push(cc / cn);
}
const mean = (v) => v.reduce((a, c) => a + c, 0) / v.length;
const sd = (v) => { const m = mean(v); return Math.sqrt(mean(v.map((c) => (c - m) ** 2))); };
const R = r / n; const G = g / n; const B = b / n;
console.log(JSON.stringify({
  file,
  window: { top, bottom, left, right },
  meanRGB: [R, G, B].map((v) => +v.toFixed(1)),
  luma: +(0.2126 * R + 0.7152 * G + 0.0722 * B).toFixed(2),
  warmth: +(R - B).toFixed(2),
  greenExcess: +(G - (R + B) / 2).toFixed(2),
  rowLumaSd: +sd(rowLuma).toFixed(2),
  colLumaSd: +sd(colLuma).toFixed(2),
}));
