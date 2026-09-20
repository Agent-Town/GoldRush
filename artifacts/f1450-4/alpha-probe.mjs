#!/usr/bin/env node
/**
 * alpha-probe.mjs — F-1450-4 instrument.
 *
 * Reports the alpha histogram of a PNG: transparent (a===0), partial (0<a<255),
 * opaque (a===255), plus the alpha bbox and an RGB purity check under transparency.
 *
 * "partial" is THE number F-1450-4 is about: s1450 measured the Baron banner's
 * shipped sprite at partial=1845 (extracted 2026-07-08) vs a fresh re-extraction at
 * partial=121, and could not attribute the delta.
 *
 * Usage: node artifacts/f1450-4/alpha-probe.mjs <label> <file.png> [...]
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

function probe(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width: w, height: h, data } = png;
  let transparent = 0, partial = 0, opaque = 0;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  let keyMagentaUnderTransparency = 0;
  for (let i = 0; i < w * h; i++) {
    const a = data[(i << 2) + 3];
    if (a === 0) {
      transparent++;
      const idx = i << 2;
      if (data[idx] === 255 && data[idx + 1] === 0 && data[idx + 2] === 255) keyMagentaUnderTransparency++;
    } else {
      if (a === 255) opaque++; else partial++;
      const x = i % w, y = (i / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return {
    size: `${w}x${h}`, transparent, partial, opaque,
    bbox: x1 < 0 ? null : [x0, y0, x1, y1],
    keyMagentaUnderTransparency,
  };
}

const args = process.argv.slice(2);
const rows = [];
for (let i = 0; i < args.length; i += 2) {
  const label = args[i], file = args[i + 1];
  if (!file) { console.error(`usage: <label> <file.png> pairs`); process.exit(2); }
  rows.push({ label, ...probe(file) });
}
const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('ARM', 34)} ${pad('size', 10)} ${pad('transparent', 12)} ${pad('partial', 9)} ${pad('opaque', 9)} ${pad('bbox', 22)} keyRGBunderAlpha0`);
for (const r of rows) {
  console.log(`${pad(r.label, 34)} ${pad(r.size, 10)} ${pad(r.transparent, 12)} ${pad(r.partial, 9)} ${pad(r.opaque, 9)} ${pad(JSON.stringify(r.bbox), 22)} ${r.keyMagentaUnderTransparency}`);
}
console.log(JSON.stringify(rows));
