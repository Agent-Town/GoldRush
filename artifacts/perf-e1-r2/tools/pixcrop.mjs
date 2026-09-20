// Side-by-side crop at magnification, so a human (or a model with eyes) can judge the delta
// at the only bar that matters: "is it invisible at 100%".
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [, , aPath, bPath, outPath, xs, ys, ws, hs, zs] = process.argv;
const [x0, y0, w, h, z] = [xs, ys, ws, hs, zs].map(Number);
const a = PNG.sync.read(readFileSync(aPath));
const b = PNG.sync.read(readFileSync(bPath));

const GAP = 8;
const out = new PNG({ width: (w * z) * 2 + GAP, height: h * z });
const put = (src, dx) => {
  for (let y = 0; y < h * z; y += 1) {
    for (let x = 0; x < w * z; x += 1) {
      const sx = x0 + Math.floor(x / z);
      const sy = y0 + Math.floor(y / z);
      const so = (sy * src.width + sx) * 4;
      const dofs = (y * out.width + (x + dx)) * 4;
      out.data[dofs] = src.data[so];
      out.data[dofs + 1] = src.data[so + 1];
      out.data[dofs + 2] = src.data[so + 2];
      out.data[dofs + 3] = 255;
    }
  }
};
put(a, 0);
put(b, w * z + GAP);
for (let y = 0; y < out.height; y += 1) {
  for (let g = 0; g < GAP; g += 1) {
    const o = (y * out.width + w * z + g) * 4;
    out.data[o] = 255; out.data[o + 1] = 0; out.data[o + 2] = 255; out.data[o + 3] = 255;
  }
}
writeFileSync(outPath, PNG.sync.write(out));
console.log(`${outPath}  left=${aPath.split('/').pop()}  right=${bPath.split('/').pop()}  region=${x0},${y0} ${w}x${h} @${z}x`);
