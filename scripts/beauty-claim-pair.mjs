// Side-by-side before/after boards for the review, so a reader judges the pair and
// not two files ten screens apart.
//
//   node scripts/beauty-claim-pair.mjs before u5 run-camera ford-crossing ...
//
// Optional crop: BEAUTY_CROP="x,y,w,h,scale" to zoom one detail of the same frame.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-beauty-claim');
const PAIR_DIR = path.join(SHOT_DIR, 'pairs');
const [left, right, ...shots] = process.argv.slice(2);
const crop = process.env.BEAUTY_CROP ? process.env.BEAUTY_CROP.split(',').map(Number) : null;
const GAP = 10;

mkdirSync(PAIR_DIR, { recursive: true });
for (const shot of shots) {
  const frames = [left, right].map((phase) => PNG.sync.read(readFileSync(path.join(SHOT_DIR, `${phase}-${shot}.png`))));
  const [x, y, w, h, scale] = crop ?? [0, 0, frames[0].width, frames[0].height, 1];
  const out = new PNG({ width: (w * scale + GAP) * frames.length - GAP, height: h * scale });
  frames.forEach((png, index) => {
    const originX = index * (w * scale + GAP);
    for (let row = 0; row < h * scale; row += 1) {
      for (let column = 0; column < w * scale; column += 1) {
        const sourceX = Math.min(png.width - 1, x + Math.floor(column / scale));
        const sourceY = Math.min(png.height - 1, y + Math.floor(row / scale));
        const source = (sourceY * png.width + sourceX) * 4;
        const target = (row * out.width + originX + column) * 4;
        out.data[target] = png.data[source];
        out.data[target + 1] = png.data[source + 1];
        out.data[target + 2] = png.data[source + 2];
        out.data[target + 3] = 255;
      }
    }
  });
  const suffix = crop ? `-crop${x}x${y}` : '';
  const file = path.join(PAIR_DIR, `${left}-vs-${right}-${shot}${suffix}.png`);
  writeFileSync(file, PNG.sync.write(out));
  console.log(path.relative(ROOT, file));
}
