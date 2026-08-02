// Numbers for the beauty board, so "it looks better" is never the only claim.
//
//   node scripts/beauty-claim-stats.mjs before u1 [more phases...]
//
// Reports, per phase, for the fixed fresh-eye run-camera shot: mean/median/stddev
// luminance and the count of distinct 4-bit colour buckets inside the river band
// versus the two bank fields. A dead slot has near-zero deviation and one bucket;
// moving water has neither.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-beauty-claim');
// Rows measured off the 1280x800 run-camera framing: the river band spans y 150-330,
// the near bank 360-520, the far bank 20-120. Same window for every phase.
const BANDS = {
  river: [150, 330],
  nearBank: [360, 520],
  farBank: [20, 120],
};

function stats(png, [top, bottom]) {
  const values = [];
  const buckets = new Set();
  for (let y = top; y < bottom; y += 2) {
    for (let x = Math.floor(png.width * 0.05); x < png.width * 0.95; x += 2) {
      const offset = (y * png.width + x) * 4;
      const red = png.data[offset];
      const green = png.data[offset + 1];
      const blue = png.data[offset + 2];
      values.push(red * 0.2126 + green * 0.7152 + blue * 0.0722);
      buckets.add(((red >> 4) << 8) | ((green >> 4) << 4) | (blue >> 4));
    }
  }
  values.sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  return {
    mean: Number(mean.toFixed(1)),
    median: Number(values[Math.floor(values.length / 2)].toFixed(1)),
    p05: Number(values[Math.floor(values.length * 0.05)].toFixed(1)),
    p95: Number(values[Math.floor(values.length * 0.95)].toFixed(1)),
    stddev: Number(deviation.toFixed(2)),
    buckets: buckets.size,
  };
}

const shot = process.env.BEAUTY_SHOT ?? 'run-camera';
const rows = [];
for (const phase of process.argv.slice(2)) {
  const file = path.join(SHOT_DIR, `${phase}-${shot}.png`);
  const png = PNG.sync.read(readFileSync(file));
  for (const [band, window] of Object.entries(BANDS)) rows.push({ phase, band, ...stats(png, window) });
}
console.log(`shot: ${shot}`);
console.table(rows);
