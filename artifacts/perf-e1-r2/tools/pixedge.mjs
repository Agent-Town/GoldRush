// The decisive test between the two hypotheses for a pixel delta:
//   (a) SUB-PIXEL EDGE SHIFT  -> changed pixels sit on high-gradient silhouette edges
//   (b) OCCLUSION/ORDER FLIP  -> changed pixels sit in flat sprite INTERIORS (a body swapped
//                                 for the body behind it changes a whole smooth region)
// Round 1 died of (b). This measures which one we have, instead of asking eyes to guess.
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [, , aPath, bPath] = process.argv;
const a = PNG.sync.read(readFileSync(aPath));
const b = PNG.sync.read(readFileSync(bPath));
const lum = (p, o) => 0.299 * p.data[o] + 0.587 * p.data[o + 1] + 0.114 * p.data[o + 2];

// Local gradient (max of |dx|,|dy|) in the REFERENCE image, measured over a stencil matched to the
// device pixel ratio. At DPR 2.75 a one-CSS-pixel silhouette edge is ~3 device pixels wide, so a
// 3x3 device-pixel stencil reads a genuine edge as FLAT and would fake up an occlusion signal.
const R = Number(process.argv[4] ?? 1);
const grad = (p, x, y) => {
  if (x < R || y < R || x >= p.width - R || y >= p.height - R) return 0;
  const at = (dx, dy) => lum(p, ((y + dy) * p.width + (x + dx)) * 4);
  return Math.max(Math.abs(at(R, 0) - at(-R, 0)), Math.abs(at(0, R) - at(0, -R)));
};

let changed = 0;
const buckets = { onStrongEdge: 0, onWeakEdge: 0, inFlatInterior: 0 };
let flatWorst = 0;
const flatSamples = [];
// Gradient distribution of ALL pixels, to know what share of the frame is "edge" at all --
// otherwise "most deltas are on edges" could just mean "most of the frame is edges".
let frameStrong = 0;
let frameTotal = 0;

for (let y = 1; y < a.height - 1; y += 1) {
  for (let x = 1; x < a.width - 1; x += 1) {
    const o = (y * a.width + x) * 4;
    const g = grad(b, x, y);
    frameTotal += 1;
    if (g > 24) frameStrong += 1;
    const d = Math.max(
      Math.abs(a.data[o] - b.data[o]),
      Math.abs(a.data[o + 1] - b.data[o + 1]),
      Math.abs(a.data[o + 2] - b.data[o + 2]),
    );
    if (d <= 4) continue;
    changed += 1;
    if (g > 24) buckets.onStrongEdge += 1;
    else if (g > 8) buckets.onWeakEdge += 1;
    else {
      buckets.inFlatInterior += 1;
      if (d > flatWorst) flatWorst = d;
      if (flatSamples.length < 12) flatSamples.push({ x, y, delta: d, localGradient: Math.round(g) });
    }
  }
}
console.log(JSON.stringify({
  pair: `${aPath.split('/').pop()} vs ${bPath.split('/').pop()}`,
  changed,
  shareOnEdges: +(((buckets.onStrongEdge + buckets.onWeakEdge) / changed) * 100).toFixed(1),
  buckets,
  worstDeltaInFlatInterior: flatWorst,
  flatInteriorSamples: flatSamples,
  frameShareThatIsStrongEdge: +((frameStrong / frameTotal) * 100).toFixed(1),
}, null, 2));
