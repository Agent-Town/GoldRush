#!/usr/bin/env node
// faces.mjs — youngsters-rechain. Head-detail crops laid side by side, because the identity break
// this batch repairs (F-AGE2-1) was invisible in every statistic and obvious in the faces.
// usage: faces.mjs <out.png> <zoom> <file>:<x>,<y>,<w>,<h>[::label] ...
// Each crop is nearest-neighbour magnified to `zoom` and drawn into a row, normalised to the tallest
// crop so the eyes line up. Composited over white so a keyed cutout and a full-bleed plate compare.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , outFile, zoomArg, ...specs] = process.argv;
if (!outFile || specs.length === 0) {
  console.error('usage: faces.mjs <out.png> <zoom> <file>:<x>,<y>,<w>,<h>[::label] ...');
  process.exit(2);
}
const zoom = Math.max(1, Number(zoomArg) || 1);
const pad = 10;

const cells = specs.map((spec) => {
  const [body, label] = spec.split('::');
  const cut = body.lastIndexOf(':');
  const file = body.slice(0, cut);
  const [x, y, w, h] = body.slice(cut + 1).split(',').map(Number);
  return { file, label: label ?? file, x, y, w, h, png: PNG.sync.read(fs.readFileSync(file)) };
});

const cw = Math.max(...cells.map((c) => c.w)) * zoom;
const chh = Math.max(...cells.map((c) => c.h)) * zoom;
const W = cells.length * (cw + pad) + pad;
const H = chh + pad * 2;
const out = new PNG({ width: W, height: H });
out.data.fill(0xff);

cells.forEach((cell, i) => {
  const ox = pad + i * (cw + pad);
  for (let y = 0; y < cell.h * zoom; y++) {
    for (let x = 0; x < cell.w * zoom; x++) {
      const sx = cell.x + Math.floor(x / zoom);
      const sy = cell.y + Math.floor(y / zoom);
      if (sx < 0 || sy < 0 || sx >= cell.png.width || sy >= cell.png.height) continue;
      const si = (cell.png.width * sy + sx) << 2;
      const di = (W * (pad + y) + (ox + x)) << 2;
      const a = cell.png.data[si + 3] / 255;
      for (let c = 0; c < 3; c++) out.data[di + c] = Math.round(cell.png.data[si + c] * a + 255 * (1 - a));
      out.data[di + 3] = 255;
    }
  }
  process.stdout.write(`cell ${i}: ${cell.label} ${cell.w}x${cell.h} at (${cell.x},${cell.y}) zoom ${zoom}\n`);
});
fs.writeFileSync(outFile, PNG.sync.write(out));
process.stdout.write(`wrote ${outFile} ${W}x${H}\n`);
