#!/usr/bin/env node
// FRAME CORRESPONDENCE: is the branch cell r<R>c<C> the same WALK FRAME as main's r<R>c<C>?
// Masks are binarised at alpha>=128, cropped to their bbox, resampled to 64x64 and compared by IoU
// against every cell of the same ROW. If the diagonal wins, the frame mapping is intact.
import fs from 'node:fs';
import { PNG } from 'pngjs';
const S = process.env.SCRATCH;
const N = 64;
const mask = (file) => {
  const p = PNG.sync.read(fs.readFileSync(file));
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) if (p.data[((y * p.width + x) << 2) + 3] >= 128) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const m = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const sx = x0 + Math.floor((x + 0.5) * w / N), sy = y0 + Math.floor((y + 0.5) * h / N);
    m[y * N + x] = p.data[((sy * p.width + sx) << 2) + 3] >= 128 ? 1 : 0;
  }
  return m;
};
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] & b[k]) i++; if (a[k] | b[k]) u++; } return u ? i / u : 1; };
for (const fam of process.argv.slice(2)) {
  const re = new RegExp(`^${fam}-r(\\d+)c(\\d+)\\.png$`);
  const cells = fs.readdirSync('assets/processed').filter((f) => re.test(f)).sort();
  const byRow = new Map();
  for (const c of cells) { const m = c.match(re); const r = m[1]; if (!byRow.has(r)) byRow.set(r, []); byRow.get(r).push(c); }
  let diag = 0, off = 0, total = 0; const misses = [];
  for (const [r, list] of byRow) {
    const bm = list.map((c) => mask(S + '/branchcells/' + c));
    for (let i = 0; i < list.length; i++) {
      const mm = mask('assets/processed/' + list[i]);
      if (!mm) continue;
      const scores = bm.map((b) => (b ? iou(mm, b) : 0));
      let best = 0; for (let k = 1; k < scores.length; k++) if (scores[k] > scores[best]) best = k;
      total++;
      if (best === i) diag++; else { off++; misses.push(`${list[i]} -> c${best} (self ${scores[i].toFixed(3)}, best ${scores[best].toFixed(3)})`); }
    }
  }
  console.log(`${fam.padEnd(34)} diagonal ${diag}/${total}, off-diagonal ${off}`);
  for (const m of misses.slice(0, 8)) console.log('     ' + m);
}
