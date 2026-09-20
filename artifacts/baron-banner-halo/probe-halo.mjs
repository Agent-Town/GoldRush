#!/usr/bin/env node
// s1450 — F-1449-3 probe. Asks the question the s1449 probe did NOT ask:
// not "does key-magenta survive among the VISIBLE pixels" (it does not, and never did),
// but "what RGB is sitting UNDER the transparency, where the GPU's bilinear filter and
// mipmap chain will average it into every surviving edge texel". That is F-1449-1.
//
// Usage: node artifacts/baron-banner-halo/probe-halo.mjs <png> [...]
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const KEY = [255, 0, 255];
const near = (r, g, b, tol = 60) =>
  Math.abs(r - KEY[0]) <= tol && Math.abs(g - KEY[1]) <= tol && Math.abs(b - KEY[2]) <= tol;

for (const file of process.argv.slice(2)) {
  const png = PNG.sync.read(readFileSync(file));
  const { width: w, height: h, data } = png;
  let transparent = 0, opaque = 0, partial = 0;
  let keyUnder = 0;      // transparent pixels still carrying key-magenta RGB
  let keyTouching = 0;   // ...of those, the ones orthogonally adjacent to a visible pixel
  const at = (x, y) => (y * w + x) * 4;
  const visible = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[at(x, y) + 3] > 10;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y);
      const a = data[i + 3];
      if (a === 0) transparent++; else if (a === 255) opaque++; else partial++;
      // Denominator discipline: count key-under only among FULLY transparent pixels, the same
      // set `transparent` counts. An earlier draft used a<=10 here and printed 100.03%, which is
      // a probe artifact, not a measurement — a percentage over 100 is the instrument confessing.
      if (a === 0 && near(data[i], data[i + 1], data[i + 2])) {
        keyUnder++;
        if (visible(x - 1, y) || visible(x + 1, y) || visible(x, y - 1) || visible(x, y + 1)) keyTouching++;
      }
    }
  }
  const pct = transparent ? ((keyUnder / transparent) * 100).toFixed(2) : '0.00';
  console.log(`${file}`);
  console.log(`  ${w}x${h}  transparent=${transparent}  opaque=${opaque}  partial=${partial}`);
  console.log(`  key-magenta UNDER transparency: ${keyUnder} (${pct}% of transparent)`);
  console.log(`  ...of those, TOUCHING visible art: ${keyTouching}   <-- the halo source`);
}
