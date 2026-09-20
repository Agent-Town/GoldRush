#!/usr/bin/env node
// s1154 — the master's bar says each portrait must "read clearly at ~120px".
// Actually downscale all six to 120px and lay them in one strip, so the claim
// is verified by looking rather than by believing the runner's sentence.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const NAMES = ['reactor-steward', 'kitchen-chemist', 'appliance-wrangler', 'diner-carhop', 'combine-defector', 'depot-clerk'];
const N = 120, PAD = 8;

function box(png, S) {
  const out = new PNG({ width: S, height: S });
  const sx = png.width / S, sy = png.height / S;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++)
        for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) {
          const i = (png.width * yy + xx) << 2;
          r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
        }
      const o = (S * y + x) << 2;
      out.data[o] = r / n; out.data[o + 1] = g / n; out.data[o + 2] = b / n; out.data[o + 3] = 255;
    }
  return out;
}

const strip = new PNG({ width: NAMES.length * (N + PAD) + PAD, height: N + 2 * PAD });
strip.data.fill(255);
NAMES.forEach((name, k) => {
  const small = box(PNG.sync.read(fs.readFileSync(`assets/raw/tf-${name}-e6.png`)), N);
  const ox = PAD + k * (N + PAD), oy = PAD;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const s = (N * y + x) << 2, d = (strip.width * (oy + y) + (ox + x)) << 2;
      strip.data[d] = small.data[s]; strip.data[d + 1] = small.data[s + 1];
      strip.data[d + 2] = small.data[s + 2]; strip.data[d + 3] = 255;
    }
});
const out = 'reviews/shots-art-e6-town-icons/e6-portraits-120px-strip.png';
fs.mkdirSync('reviews/shots-art-e6-town-icons', { recursive: true });
fs.writeFileSync(out, PNG.sync.write(strip));
console.log('wrote', out, `${strip.width}x${strip.height} — six portraits at ${N}px, order:`, NAMES.join(', '));
