#!/usr/bin/env node
// s1450 — F-1449-3 comparison board. Before/after on a mid-grey checkerboard, plus a 4x zoom
// of the same crop from each, because the halo is an EDGE property and is invisible at 1x
// against a dark page. Looking is what caught F-1449-1; a table is not a substitute.
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';

const D = 'artifacts/baron-banner-halo/';
const before = PNG.sync.read(readFileSync(D + 'before-prop-baron-banner.png'));
const after = PNG.sync.read(readFileSync(D + 'after-prop-baron-banner.png'));
const S = 384, PAD = 16, ZOOM = 4, CROP = 96;
const cellW = S, cellH = S;
const zoomW = CROP * ZOOM;

const W = PAD * 3 + cellW * 2;
const H = PAD * 4 + cellH + zoomW;
const out = new PNG({ width: W, height: H });

// checkerboard ground so transparency is legible
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = ((x >> 4) + (y >> 4)) % 2 ? 150 : 110;
    const i = (y * W + x) * 4;
    out.data[i] = c; out.data[i + 1] = c; out.data[i + 2] = c; out.data[i + 3] = 255;
  }
}

function blit(src, sx, sy, sw, sh, dx, dy, zoom = 1) {
  for (let y = 0; y < sh * zoom; y++) {
    for (let x = 0; x < sw * zoom; x++) {
      const s = ((sy + Math.floor(y / zoom)) * src.width + (sx + Math.floor(x / zoom))) * 4;
      const a = src.data[s + 3] / 255;
      if (a === 0) continue;
      const d = ((dy + y) * W + (dx + x)) * 4;
      for (let k = 0; k < 3; k++) out.data[d + k] = Math.round(src.data[s + k] * a + out.data[d + k] * (1 - a));
    }
  }
}

blit(before, 0, 0, S, S, PAD, PAD);
blit(after, 0, 0, S, S, PAD * 2 + cellW, PAD);

// Zoom the same crop from each — upper-left of the banner's torn edge region.
const CX = 150, CY = 120;
blit(before, CX, CY, CROP, CROP, PAD, PAD * 2 + cellH, ZOOM);
blit(after, CX, CY, CROP, CROP, PAD * 2 + cellW, PAD * 2 + cellH, ZOOM);

writeFileSync(D + 'comparison-board.png', PNG.sync.write(out));
console.log(`wrote ${D}comparison-board.png  (${W}x${H})  LEFT = before (shipped), RIGHT = after (re-extracted)`);
