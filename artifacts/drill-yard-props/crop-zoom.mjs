/**
 * s1449 — magnify regions of the in-game screenshot so a fringe can be judged by eye.
 *   node artifacts/drill-yard-props/crop-zoom.mjs <src.png> <out.png> <x> <y> <w> <h> [scale]
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

const [src, out, xs, ys, ws, hs, ss] = process.argv.slice(2);
const x0 = Number(xs), y0 = Number(ys), cw = Number(ws), ch = Number(hs), scale = Number(ss ?? 4);

const img = PNG.sync.read(fs.readFileSync(src));
const dst = new PNG({ width: cw * scale, height: ch * scale });

for (let y = 0; y < ch * scale; y++) {
  for (let x = 0; x < cw * scale; x++) {
    const sx = Math.min(img.width - 1, x0 + Math.floor(x / scale));
    const sy = Math.min(img.height - 1, y0 + Math.floor(y / scale));
    const si = (sy * img.width + sx) * 4;
    const di = (y * dst.width + x) * 4;
    dst.data[di] = img.data[si];
    dst.data[di + 1] = img.data[si + 1];
    dst.data[di + 2] = img.data[si + 2];
    dst.data[di + 3] = 255;
  }
}
fs.writeFileSync(out, PNG.sync.write(dst));
console.log(`wrote ${out} (${cw}x${ch} @${scale}x from ${src})`);
