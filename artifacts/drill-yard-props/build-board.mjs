/**
 * s1449: composite the three extracted drill-yard props onto a checkerboard so the
 * CUT-OUT itself is visible to the eye (F-1446-1 — QA by looking, not by reading a table).
 * A checkerboard is used deliberately: on white or black an opaque square is easy to miss,
 * on a checkerboard it is unmissable. prop-baron-banner.png is the shipped CONTROL.
 *
 *   node artifacts/drill-yard-props/build-board.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'artifacts/drill-yard-props/comparison-board.png');

const names = [
  'prop-drill-faucet-station.png',
  'prop-drill-bell-post.png',
  'prop-straw-man-stand.png',
  'prop-baron-banner.png',
];

const CELL = 384;
const PAD = 8;
const board = new PNG({ width: names.length * CELL + PAD * (names.length + 1), height: CELL + PAD * 2 });

// checkerboard ground
const CHECK = 24;
for (let y = 0; y < board.height; y++) {
  for (let x = 0; x < board.width; x++) {
    const dark = ((Math.floor(x / CHECK) + Math.floor(y / CHECK)) % 2) === 0;
    const v = dark ? 90 : 150;
    const i = (y * board.width + x) * 4;
    board.data[i] = v; board.data[i + 1] = v; board.data[i + 2] = v; board.data[i + 3] = 255;
  }
}

names.forEach((n, k) => {
  const p = path.join(ROOT, 'assets/processed', n);
  if (!fs.existsSync(p)) { console.log(`SKIP missing ${n}`); return; }
  const src = PNG.sync.read(fs.readFileSync(p));
  const ox = PAD + k * (CELL + PAD);
  const oy = PAD;
  for (let y = 0; y < Math.min(src.height, CELL); y++) {
    for (let x = 0; x < Math.min(src.width, CELL); x++) {
      const si = (y * src.width + x) * 4;
      const a = src.data[si + 3] / 255;
      if (a === 0) continue;
      const di = ((oy + y) * board.width + (ox + x)) * 4;
      for (let c = 0; c < 3; c++) {
        board.data[di + c] = Math.round(src.data[si + c] * a + board.data[di + c] * (1 - a));
      }
    }
  }
  console.log(`placed ${n} at x=${ox}`);
});

fs.writeFileSync(OUT, PNG.sync.write(board));
console.log('wrote', OUT, `${board.width}x${board.height}`);
