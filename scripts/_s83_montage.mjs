// s83 temp: composite prospector hover-sheet cells into review montages.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const CELL = 200, PAD = 4, COLS = 4, ROWS = 4;
const dir = 'assets/processed';
for (const sheet of ['a', 'b']) {
  const W = COLS * (CELL + PAD) + PAD, H = ROWS * (CELL + PAD) + PAD;
  const out = new PNG({ width: W, height: H });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 60; out.data[i + 1] = 60; out.data[i + 2] = 64; out.data[i + 3] = 255;
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const f = `${dir}/char-prospector-sheet-hover4-${sheet}-r${r}c${c}.png`;
    const src = PNG.sync.read(fs.readFileSync(f));
    const ox = PAD + c * (CELL + PAD), oy = PAD + r * (CELL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      const sx = Math.floor(x * src.width / CELL), sy = Math.floor(y * src.height / CELL);
      const si = (sy * src.width + sx) * 4, a = src.data[si + 3] / 255;
      const di = ((oy + y) * W + (ox + x)) * 4;
      out.data[di] = Math.round(src.data[si] * a + out.data[di] * (1 - a));
      out.data[di + 1] = Math.round(src.data[si + 1] * a + out.data[di + 1] * (1 - a));
      out.data[di + 2] = Math.round(src.data[si + 2] * a + out.data[di + 2] * (1 - a));
      out.data[di + 3] = 255;
    }
  }
  fs.writeFileSync(`reviews/shots-art-batch-008/hover4-${sheet}-montage.png`, PNG.sync.write(out));
  console.log(`wrote hover4-${sheet}-montage.png ${W}x${H}`);
}
