// s1189: close the loop independently of the survey. The runner validated the cyan tank as
// a ONE-SIDED fixture using the SHIPPED CARDINAL sheet. If the cardinal sheet's front row
// shows exactly one cyan cluster, then the diagonal sheet's row 1 (two clusters, every
// frame) is anomalous against BOTH the cardinal control and its own sheet's other front row
// — which makes the tank-side tell void for exactly that row.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const isKey = (r, g, b) => r > 200 && b > 200 && g < 60;
const isCyan = (r, g, b) => g > r + 18 && b > r + 18 && g > 70 && b > 70;
const MIN_GAP = 8;

function probe(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const cell = Math.floor(png.width / 4);
  console.log(`\n${file}  ${png.width}x${png.height}  cell ${cell}`);
  for (let row = 0; row < 4; row += 1) {
    const counts = [];
    for (let col = 0; col < 4; col += 1) {
      const hist = new Array(cell).fill(0);
      for (let y = 0; y < cell; y += 1) {
        for (let x = 0; x < cell; x += 1) {
          const px = (png.width * (row * cell + y) + (col * cell + x)) << 2;
          const r = png.data[px];
          const g = png.data[px + 1];
          const b = png.data[px + 2];
          const a = png.data[px + 3];
          if (a < 8 || isKey(r, g, b)) continue;
          if (isCyan(r, g, b)) hist[x] += 1;
        }
      }
      const runs = [];
      let start = -1;
      let last = -1;
      for (let x = 0; x < cell; x += 1) {
        if (hist[x] > 0) {
          if (start < 0) start = x;
          else if (x - last - 1 >= MIN_GAP) {
            runs.push([start, last]);
            start = x;
          }
          last = x;
        }
      }
      if (start >= 0) runs.push([start, last]);
      const mass = hist.reduce((a, b) => a + b, 0);
      counts.push(`c${col}:${runs.length}cl/${mass}px`);
    }
    console.log(`  row ${row}: ${counts.join('  ')}`);
  }
}

probe('assets/raw/char-steamwrecker-sheet-walk4-a.png');
probe('assets/raw/char-steamwrecker-sheet-walkdiag4-a.png');
