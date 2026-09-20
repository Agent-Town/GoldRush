// The verdict test. Take only pixels that instancing changed and that booting the SAME build twice
// did NOT change (treatment-minus-control), then measure the SHAPE of what survives:
//   thin, high-perimeter, low-fill slivers  -> sub-pixel silhouette shift (invisible at 100%)
//   compact sprite-sized filled blobs       -> an occlusion/order flip (round 1's grave; revert)
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [, , treatA, treatB, ctrlA, ctrlB, outPath] = process.argv;
const [ta, tb, ca, cb] = [treatA, treatB, ctrlA, ctrlB].map((p) => PNG.sync.read(readFileSync(p)));
const W = ta.width;
const H = ta.height;
const dmax = (p, q, o) => Math.max(
  Math.abs(p.data[o] - q.data[o]),
  Math.abs(p.data[o + 1] - q.data[o + 1]),
  Math.abs(p.data[o + 2] - q.data[o + 2]),
);

const THRESH = 16; // below this nothing is perceptible on a lit sprite; well above AA dither
const mask = new Uint8Array(W * H);
let n = 0;
for (let i = 0; i < W * H; i += 1) {
  const o = i * 4;
  if (dmax(ta, tb, o) > THRESH && dmax(ca, cb, o) <= 4) { mask[i] = 1; n += 1; }
}

// Connected components (8-neighbour, iterative flood fill).
const seen = new Uint8Array(W * H);
const comps = [];
const stack = [];
for (let s = 0; s < W * H; s += 1) {
  if (!mask[s] || seen[s]) continue;
  stack.length = 0;
  stack.push(s);
  seen[s] = 1;
  let px = 0;
  let x0 = W; let y0 = H; let x1 = 0; let y1 = 0;
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    const y = (i - x) / W;
    px += 1;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx; const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (mask[j] && !seen[j]) { seen[j] = 1; stack.push(j); }
      }
    }
  }
  const bw = x1 - x0 + 1; const bh = y1 - y0 + 1;
  comps.push({ px, box: `${x0},${y0} ${bw}x${bh}`, fill: +(px / (bw * bh)).toFixed(2), w: bw, h: bh });
}
comps.sort((p, q) => q.px - p.px);

if (outPath) {
  const out = new PNG({ width: W, height: H });
  for (let i = 0; i < W * H; i += 1) {
    const o = i * 4;
    const lit = mask[i] ? 255 : 0;
    out.data[o] = lit; out.data[o + 1] = mask[i] ? 0 : 0; out.data[o + 2] = 0; out.data[o + 3] = 255;
    if (!mask[i]) { out.data[o] = ta.data[o] >> 2; out.data[o + 1] = ta.data[o + 1] >> 2; out.data[o + 2] = ta.data[o + 2] >> 2; }
  }
  writeFileSync(outPath, PNG.sync.write(out));
}

const big = comps.filter((c) => c.px >= 40);
console.log(JSON.stringify({
  pair: treatA.split('/').pop().replace('-instanced.png', ''),
  treatmentOnlyPixels: n,
  shareOfFrame: +((n / (W * H)) * 100).toFixed(3),
  components: comps.length,
  componentsOver40px: big.length,
  largest: comps.slice(0, 8),
  // A sprite body here is roughly 18x28 px. A flip would put a compact, well-filled blob at that
  // size near the top of this list.
  largestCompactBlob: comps.find((c) => c.px >= 120 && c.fill >= 0.5) ?? null,
}, null, 2));
