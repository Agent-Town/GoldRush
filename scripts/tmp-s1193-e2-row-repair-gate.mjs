#!/usr/bin/env node
/**
 * tmp-s1193-e2-row-repair-gate.mjs — INDEPENDENT drain gate for art-e2-eight-winds-row-repairs.
 *
 * s1192's handoff pre-declared the three things a green run cannot show, and this
 * measures all three from the bytes rather than reading the runner's table:
 *   (1) per-frame cyan cluster counts on Steam Wrecker diagonal rows 1 and 2;
 *   (2) the row-level byte-exactness proof across all 12 rows of the 3 sheets;
 *   (3) which rows actually moved.
 *
 * The cyan instrument is VALIDATED FIRST on row 2, whose left/right control the run
 * report already published (116/0, 112/0, 117/0, 99/0). An instrument that cannot
 * reproduce the known-good row is not trusted on the disputed one.
 *
 *   node scripts/tmp-s1193-e2-row-repair-gate.mjs <before-rev>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const BEFORE = process.argv[2] ?? 'f61843c0^';
const CELL = 313;
const GRID = 4;
const SHEETS = [
  ['Coal Thief', 'assets/raw/char-coalthief-sheet-walkdiag4-a.png'],
  ['Steam Wrecker', 'assets/raw/char-steamwrecker-sheet-walkdiag4-a.png'],
  ['Rail Tough', 'assets/raw/char-railtough-sheet-walkdiag4-a.png'],
];

const readNew = (p) => PNG.sync.read(fs.readFileSync(p));
const readOld = (rev, p) =>
  PNG.sync.read(execFileSync('git', ['show', `${rev}:${p}`], { maxBuffer: 1e9 }));

/** Row band bytes, as an RGBA slice — the unit the "byte-exact" claim is about. */
function rowBytes(png, row) {
  const start = row * CELL * png.width * 4;
  const end = Math.min((row + 1) * CELL, png.height) * png.width * 4;
  return png.data.subarray(start, end);
}

const isCyan = (r, g, b, a) =>
  a > 128 && b > 110 && g > 100 && r < 0.62 * Math.min(g, b) && b + g - 2 * r > 90;

/** Connected components (4-neighbour) of cyan pixels inside one cell, plus L/R split. */
function cyanProbe(png, row, col) {
  const x0 = col * CELL;
  const y0 = row * CELL;
  const mask = new Uint8Array(CELL * CELL);
  let left = 0;
  let right = 0;
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const i = ((y0 + y) * png.width + (x0 + x)) * 4;
      if (isCyan(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3])) {
        mask[y * CELL + x] = 1;
        if (x < CELL / 2) left++;
        else right++;
      }
    }
  }
  // flood fill; ignore specks so anti-aliasing does not invent clusters
  const seen = new Uint8Array(CELL * CELL);
  const sizes = [];
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || seen[s]) continue;
    let n = 0;
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const p = stack.pop();
      n++;
      const px = p % CELL;
      const py = (p / CELL) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= CELL || ny >= CELL) continue;
        const q = ny * CELL + nx;
        if (mask[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
      }
    }
    sizes.push(n);
  }
  const clusters = sizes.filter((n) => n >= 12);
  return { clusters: clusters.length, sizes: clusters.sort((a, b) => b - a), left, right };
}

console.log(`INDEPENDENT GATE — before-rev ${BEFORE}\n`);

console.log('(2)+(3) ROW-LEVEL BYTE-EXACTNESS — 12 rows, measured not read');
let identical = 0;
const moved = [];
for (const [name, p] of SHEETS) {
  const nw = readNew(p);
  const od = readOld(BEFORE, p);
  const cells = [];
  for (let r = 0; r < GRID; r++) {
    const same = Buffer.compare(Buffer.from(rowBytes(od, r)), Buffer.from(rowBytes(nw, r))) === 0;
    if (same) identical++;
    else moved.push(`${name} row ${r}`);
    cells.push(same ? 'identical' : '**CHANGED**');
  }
  console.log(`  ${name.padEnd(14)} ${nw.width}x${nw.height}  ${cells.map((c, i) => `r${i}:${c}`).join('  ')}`);
}
console.log(`  => ${identical}/12 rows byte-identical; rows that moved: ${moved.join(', ') || 'none'}\n`);

console.log('(1) STEAM WRECKER CYAN PROBE — instrument validated on row 2 first');
const sw = readNew(SHEETS[1][1]);
for (const row of [2, 1]) {
  const per = [0, 1, 2, 3].map((c) => cyanProbe(sw, row, c));
  const label = row === 2 ? 'row 2 `nw` (published control 116/0, 112/0, 117/0, 99/0)' : 'row 1 `se` (disputed)';
  console.log(`  ${label}`);
  console.log(`    clusters/frame : ${per.map((x) => x.clusters).join(', ')}`);
  console.log(`    left/right px  : ${per.map((x) => `${x.left}/${x.right}`).join(', ')}`);
  console.log(`    cluster sizes  : ${per.map((x) => `[${x.sizes.join(',')}]`).join(' ')}`);
}
