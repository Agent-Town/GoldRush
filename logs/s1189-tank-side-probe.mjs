// s1189 drain verification: the row-order survey's Steam Wrecker verdict rests on the
// claim that the small cyan tank is a ONE-SIDED fixture. That is the same class of claim
// as the brass pauldron that voided s1188's own discriminator — so it gets checked at the
// pixels, on the raw sheet, not read off the contact board.
//
// Method: for each of the 4 diagonal rows, count cyan-ish pixels in the LEFT half vs the
// RIGHT half of each cell's content bounding box. A genuinely one-sided fixture should put
// essentially all cyan mass on ONE side. Cyan on both sides in any row means the tell does
// not apply to that row.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const SHEET = 'assets/raw/char-steamwrecker-sheet-walkdiag4-a.png';
const CELL = 313;
const png = PNG.sync.read(fs.readFileSync(SHEET));
console.log(`sheet ${png.width}x${png.height}  cell ${CELL}  grid 4x4`);

// #ff00ff key band, matching the extractor's tolerance style.
const isKey = (r, g, b) => r > 200 && b > 200 && g < 60;

// The tank reads as a desaturated teal/cyan against warm brass: green and blue both
// clearly above red, and not near-black.
const isCyan = (r, g, b) => g > r + 18 && b > r + 18 && g > 70 && b > 70;

for (let row = 0; row < 4; row += 1) {
  // content bbox of the whole row's non-key pixels, per cell
  const perCell = [];
  for (let col = 0; col < 4; col += 1) {
    let minX = Infinity;
    let maxX = -Infinity;
    let left = 0;
    let right = 0;
    const cyanXs = [];

    for (let y = 0; y < CELL; y += 1) {
      for (let x = 0; x < CELL; x += 1) {
        const px = (png.width * (row * CELL + y) + (col * CELL + x)) << 2;
        const r = png.data[px];
        const g = png.data[px + 1];
        const b = png.data[px + 2];
        const a = png.data[px + 3];
        if (a < 8 || isKey(r, g, b)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    const mid = (minX + maxX) / 2;

    for (let y = 0; y < CELL; y += 1) {
      for (let x = 0; x < CELL; x += 1) {
        const px = (png.width * (row * CELL + y) + (col * CELL + x)) << 2;
        const r = png.data[px];
        const g = png.data[px + 1];
        const b = png.data[px + 2];
        const a = png.data[px + 3];
        if (a < 8 || isKey(r, g, b)) continue;
        if (!isCyan(r, g, b)) continue;
        cyanXs.push(x);
        if (x < mid) left += 1;
        else right += 1;
      }
    }
    perCell.push({ col, left, right, total: left + right, width: maxX - minX });
  }

  const sumL = perCell.reduce((a, c) => a + c.left, 0);
  const sumR = perCell.reduce((a, c) => a + c.right, 0);
  const tot = sumL + sumR;
  const pctL = tot ? ((sumL / tot) * 100).toFixed(1) : 'n/a';
  const pctR = tot ? ((sumR / tot) * 100).toFixed(1) : 'n/a';
  const perCellStr = perCell.map((c) => `c${c.col} ${c.left}/${c.right}`).join('  ');
  console.log(
    `row ${row}: cyan px LEFT ${sumL} (${pctL}%) | RIGHT ${sumR} (${pctR}%)   [per-cell L/R] ${perCellStr}`,
  );
}
