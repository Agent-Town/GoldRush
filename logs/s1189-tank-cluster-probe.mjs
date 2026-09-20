// s1189 follow-up: row 1's cyan mass splits 64/36 across the content midline in all four
// frames, while rows 0/2/3 are 100% one-sided. Two readings are possible and they lead to
// opposite conclusions:
//   (A) row 1 carries TWO cyan fixtures -> the "one-sided tank" tell is VOID for row 1;
//   (B) row 1 carries ONE tank that merely straddles the bbox midline -> tell still applies.
// Distinguish by clustering: project cyan pixels onto x and look for a gap. One fixture is
// a single contiguous run; two fixtures leave a clear empty corridor between them.
import fs from 'node:fs';
import { PNG } from 'pngjs';

const CELL = 313;
const png = PNG.sync.read(fs.readFileSync('assets/raw/char-steamwrecker-sheet-walkdiag4-a.png'));
const isKey = (r, g, b) => r > 200 && b > 200 && g < 60;
const isCyan = (r, g, b) => g > r + 18 && b > r + 18 && g > 70 && b > 70;

const MIN_GAP = 8; // px of empty x-corridor to call two clusters distinct

for (let row = 0; row < 4; row += 1) {
  const summaries = [];
  for (let col = 0; col < 4; col += 1) {
    const hist = new Array(CELL).fill(0);
    for (let y = 0; y < CELL; y += 1) {
      for (let x = 0; x < CELL; x += 1) {
        const px = (png.width * (row * CELL + y) + (col * CELL + x)) << 2;
        const r = png.data[px];
        const g = png.data[px + 1];
        const b = png.data[px + 2];
        const a = png.data[px + 3];
        if (a < 8 || isKey(r, g, b)) continue;
        if (isCyan(r, g, b)) hist[x] += 1;
      }
    }
    // contiguous runs of occupied x columns, merged across gaps < MIN_GAP
    const runs = [];
    let start = -1;
    let lastSeen = -1;
    for (let x = 0; x < CELL; x += 1) {
      if (hist[x] > 0) {
        if (start < 0) start = x;
        else if (x - lastSeen - 1 >= MIN_GAP) {
          runs.push([start, lastSeen]);
          start = x;
        }
        lastSeen = x;
      }
    }
    if (start >= 0) runs.push([start, lastSeen]);

    const mass = runs.map(([a, b]) => {
      let m = 0;
      for (let x = a; x <= b; x += 1) m += hist[x];
      return m;
    });
    summaries.push({ col, runs, mass });
  }

  const clusterCounts = summaries.map((s) => s.runs.length);
  const detail = summaries
    .map((s) => `c${s.col}[${s.runs.map(([a, b], i) => `${a}-${b}:${s.mass[i]}px`).join(' | ')}]`)
    .join('  ');
  console.log(`row ${row}: clusters per frame ${clusterCounts.join(',')}   ${detail}`);
}
