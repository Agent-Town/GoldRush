#!/usr/bin/env node
/**
 * edge-comparison.mjs — F-1450-4, the LOOK step.
 *
 * F-1446-1 is law: a numeric cut-out probe is not proof a sprite is right — look at it.
 * This builds a zoomed comparison board over the edge region that carries the most
 * `partial` pixels, for three variants:
 *
 *   OLD  shipped 2026-07-08 : keyed @1024 then downsampled -> soft edges (partial 1845)
 *                             BUT 84,770 key-magenta px under transparency (the halo)
 *   NEW  shipped 2026-08-04 : keyed directly @384 -> hard edges (partial 121), halo cured
 *   D    current extractor @1024 then downsampled -> soft edges AND halo cured
 *
 * Each variant is rendered twice: composited over a mid-grey checker (what the eye sees)
 * and as a raw ALPHA ramp (what the edge actually is).
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const WORK = path.join(process.cwd(), 'artifacts/f1450-4');
const read = (f) => PNG.sync.read(fs.readFileSync(f));

const variants = [
  ['OLD 2026-07-08 (halo)', path.join(WORK, 'blobs/shipped-OLD-a1b3f4b0.png')],
  ['NEW 2026-08-04 (shipped)', path.join(WORK, 'blobs/shipped-NEW-head.png')],
  ['D  @1024 then ->384', path.join(WORK, 'arms/D-1024-then-384.png')],
];

// --- pick the crop: the 48x48 window with the most partial pixels in the OLD file ---
const ref = read(variants[0][1]);
const CROP = 48;
let best = { n: -1, x: 0, y: 0 };
for (let y = 0; y + CROP <= ref.height; y += 4) {
  for (let x = 0; x + CROP <= ref.width; x += 4) {
    let n = 0;
    for (let dy = 0; dy < CROP; dy++) {
      for (let dx = 0; dx < CROP; dx++) {
        const a = ref.data[(((y + dy) * ref.width + (x + dx)) << 2) + 3];
        if (a > 0 && a < 255) n++;
      }
    }
    if (n > best.n) best = { n, x, y };
  }
}
console.log(`crop window ${CROP}x${CROP} at (${best.x},${best.y}) — ${best.n} partial px in the OLD file`);

const ZOOM = 8;
const CW = CROP * ZOOM, LABEL = 22, GAP = 8;
const cols = variants.length, rows = 2;
const W = cols * CW + (cols + 1) * GAP;
const H = rows * (CW + LABEL) + (rows + 1) * GAP;
const board = new PNG({ width: W, height: H });
board.data.fill(24);
for (let i = 0; i < W * H; i++) board.data[(i << 2) + 3] = 255;

function put(px, py, r, g, b) {
  if (px < 0 || py < 0 || px >= W || py >= H) return;
  const o = (py * W + px) << 2;
  board.data[o] = r; board.data[o + 1] = g; board.data[o + 2] = b; board.data[o + 3] = 255;
}

variants.forEach(([label, file], ci) => {
  const png = read(file);
  const ox = GAP + ci * (CW + GAP);
  for (let mode = 0; mode < 2; mode++) {
    const oy = GAP + mode * (CW + LABEL + GAP) + LABEL;
    for (let dy = 0; dy < CROP; dy++) {
      for (let dx = 0; dx < CROP; dx++) {
        const idx = ((best.y + dy) * png.width + (best.x + dx)) << 2;
        const a = png.data[idx + 3];
        let r, g, b;
        if (mode === 0) {
          // composite over a checker so both the silhouette and any halo are visible
          const checker = ((Math.floor(dx / 6) + Math.floor(dy / 6)) % 2) ? 150 : 110;
          const f = a / 255;
          r = Math.round(png.data[idx] * f + checker * (1 - f));
          g = Math.round(png.data[idx + 1] * f + checker * (1 - f));
          b = Math.round(png.data[idx + 2] * f + checker * (1 - f));
        } else {
          r = g = b = a; // raw alpha ramp
        }
        for (let zy = 0; zy < ZOOM; zy++) for (let zx = 0; zx < ZOOM; zx++) put(ox + dx * ZOOM + zx, oy + dy * ZOOM + zy, r, g, b);
      }
    }
  }
  console.log(`  col ${ci}: ${label}`);
});

const out = path.join(WORK, 'edge-comparison-board.png');
fs.writeFileSync(out, PNG.sync.write(board));
console.log(`\nboard -> ${out}  (${W}x${H}; row 1 = composited over checker, row 2 = raw alpha)`);
console.log(`columns L->R: ${variants.map(([l]) => l).join('  |  ')}`);
