#!/usr/bin/env node
// contact.mjs — canon-calls-a8. Composite a contact sheet so the plates can actually be LOOKED at
// (the honesty guard's own test: numbers do not tell you whether two plates are the same woman).
// usage: contact.mjs <out.png> <cellW>x<cellH> <file:label> [...]
// Each input is drawn scaled-to-fit into a cell on a white ground.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , outFile, geom, ...specs] = process.argv;
const [cw, ch] = geom.split('x').map(Number);
const pad = 12;
const cols = specs.length;
const W = cols * (cw + pad) + pad;
const H = ch + pad * 2;
const out = new PNG({ width: W, height: H });
out.data.fill(0xff);

for (let i = 0; i < specs.length; i++) {
  const [file, label] = specs[i].split('::');
  const src = PNG.sync.read(fs.readFileSync(file));
  const scale = Math.min(cw / src.width, ch / src.height);
  const dw = Math.round(src.width * scale);
  const dh = Math.round(src.height * scale);
  const ox = pad + i * (cw + pad) + Math.floor((cw - dw) / 2);
  const oy = pad + Math.floor((ch - dh) / 2);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(src.width - 1, Math.floor(x / scale));
      const sy = Math.min(src.height - 1, Math.floor(y / scale));
      const si = (src.width * sy + sx) << 2;
      const di = (W * (oy + y) + (ox + x)) << 2;
      const a = src.data[si + 3] / 255;
      // composite over white so a keyed cutout and a full-bleed plate can be compared honestly
      for (let c = 0; c < 3; c++) out.data[di + c] = Math.round(src.data[si + c] * a + 255 * (1 - a));
      out.data[di + 3] = 255;
    }
  }
  if (label) process.stdout.write(`cell ${i}: ${label} (${src.width}x${src.height} -> ${dw}x${dh})\n`);
}
fs.writeFileSync(outFile, PNG.sync.write(out));
process.stdout.write(`wrote ${outFile} ${W}x${H}\n`);
