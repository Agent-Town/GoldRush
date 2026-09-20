// perf-r2 delta forensics: the rig says "how many pixels moved"; this says WHERE and HOW HARD,
// which is the only way to tell an ordering flip (round 1's grave) from edge rasterisation noise.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [, , aPath, bPath, outPath] = process.argv;
const a = PNG.sync.read(readFileSync(aPath));
const b = PNG.sync.read(readFileSync(bPath));
if (a.width !== b.width || a.height !== b.height) throw new Error('size mismatch');

const heat = new PNG({ width: a.width, height: a.height });
const hist = new Map();
let changed = 0;
let maxDelta = 0;
const pts = [];
// Column/row projections localise the delta: a flipped draw order lands as a few dense blobs,
// rasterisation noise smears thinly along every sprite edge in the frame.
const colHits = new Uint32Array(a.width);
const rowHits = new Uint32Array(a.height);

for (let y = 0; y < a.height; y += 1) {
  for (let x = 0; x < a.width; x += 1) {
    const o = (y * a.width + x) * 4;
    const dr = Math.abs(a.data[o] - b.data[o]);
    const dg = Math.abs(a.data[o + 1] - b.data[o + 1]);
    const db = Math.abs(a.data[o + 2] - b.data[o + 2]);
    const da = Math.abs(a.data[o + 3] - b.data[o + 3]);
    const d = Math.max(dr, dg, db, da);
    if (d > maxDelta) maxDelta = d;
    const bucket = d === 0 ? 0 : d <= 2 ? 2 : d <= 4 ? 4 : d <= 8 ? 8 : d <= 16 ? 16 : d <= 32 ? 32 : d <= 64 ? 64 : d <= 128 ? 128 : 255;
    hist.set(bucket, (hist.get(bucket) ?? 0) + 1);
    if (d > 4) {
      changed += 1;
      colHits[x] += 1;
      rowHits[y] += 1;
      if (pts.length < 400000) pts.push([x, y, d]);
    }
    // Heatmap: amplified so a delta of 8 is already clearly visible to the eye.
    const amp = Math.min(255, d * 12);
    heat.data[o] = amp;
    heat.data[o + 1] = d > 32 ? 0 : amp; // >32 burns red — that is structural, not AA
    heat.data[o + 2] = d > 32 ? 0 : Math.min(255, d * 4);
    heat.data[o + 3] = 255;
  }
}
if (outPath) writeFileSync(outPath, PNG.sync.write(heat));

// Cluster the changed pixels with a coarse grid so "how many separate places" is answerable.
const CELL = 32;
const cells = new Map();
for (const [x, y, d] of pts) {
  const k = `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
  const c = cells.get(k) ?? { n: 0, max: 0 };
  c.n += 1;
  if (d > c.max) c.max = d;
  cells.set(k, c);
}
const top = [...cells.entries()].sort((p, q) => q[1].n - p[1].n).slice(0, 10);
const spanOf = (arr) => {
  const idx = [...arr.keys()].filter((i) => arr[i] > 0);
  return idx.length ? `${idx[0]}..${idx[idx.length - 1]}` : 'none';
};

console.log(JSON.stringify({
  pair: `${aPath.split('/').pop()} vs ${bPath.split('/').pop()}`,
  changedOver4: changed,
  maxChannelDelta: maxDelta,
  histogram: Object.fromEntries([...hist.entries()].sort((p, q) => p[0] - q[0])),
  cellsTouched: cells.size,
  topCells: top.map(([k, v]) => ({ cell: k, px: v.n, maxDelta: v.max })),
  colSpan: spanOf(colHits),
  rowSpan: spanOf(rowHits),
}, null, 2));
