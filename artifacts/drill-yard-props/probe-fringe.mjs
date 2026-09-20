/**
 * s1449 — F-1449-2 probe: what RGB survives UNDER alpha 0?
 *
 * probe-cutout.mjs asked "is there magenta among the VISIBLE pixels" and answered 0. That
 * question is too narrow. A keyer that sets alpha=0 but leaves the key colour in RGB looks
 * perfect in every alpha-aware viewer and still halos in-game, because GPU bilinear filtering
 * and mipmap generation interpolate RGB across neighbours WITHOUT regard to alpha — so fully
 * transparent magenta bleeds into the visible edge.
 *
 * This measures the transparent region's own colour, and the colour of the transparent pixels
 * that directly border a visible one (the only ones filtering can actually reach).
 *
 *   node artifacts/drill-yard-props/probe-fringe.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const names = [
  'prop-drill-faucet-station.png',
  'prop-drill-bell-post.png',
  'prop-straw-man-stand.png',
  'prop-baron-banner.png',
];

for (const n of names) {
  const p = path.join(ROOT, 'assets/processed', n);
  if (!fs.existsSync(p)) { console.log(`${n}: MISSING`); continue; }
  const png = PNG.sync.read(fs.readFileSync(p));
  const { width: w, height: h, data } = png;

  const at = (x, y) => (y * w + x) * 4;
  let magentaTransparent = 0, transparent = 0;
  let borderTransparent = 0, borderMagenta = 0;
  const borderSamples = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y);
      if (data[i + 3] !== 0) continue;
      transparent++;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const isMagenta = r > 150 && b > 150 && g < 100;
      if (isMagenta) magentaTransparent++;

      // does this transparent pixel touch a visible one? those are the ones that bleed.
      let touches = false;
      for (let dy = -1; dy <= 1 && !touches; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (data[at(nx, ny) + 3] > 16) { touches = true; break; }
        }
      }
      if (touches) {
        borderTransparent++;
        if (isMagenta) borderMagenta++;
        if (borderSamples.length < 6) borderSamples.push(`rgb(${r},${g},${b})`);
      }
    }
  }

  const pct = (a, b) => (b === 0 ? '—' : `${(100 * a / b).toFixed(1)}%`);
  console.log(`${n}${n === 'prop-baron-banner.png' ? '  [CONTROL, already shipped]' : ''}`);
  console.log(`   transparent px: ${transparent}, of which key-magenta RGB: ${magentaTransparent} (${pct(magentaTransparent, transparent)})`);
  console.log(`   transparent px TOUCHING a visible px: ${borderTransparent}, of which magenta: ${borderMagenta} (${pct(borderMagenta, borderTransparent)})  <-- these are what bleed`);
  console.log(`   sample border-transparent colours: ${borderSamples.join(' ')}`);
}
