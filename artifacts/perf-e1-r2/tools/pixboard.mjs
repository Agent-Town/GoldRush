// Build the reviewer boards for the perf-r2 pixel gate. The gate's second limb is "a visual delta
// <= what a reviewer calls invisible at 100%", so the board must be 1:1 -- no magnification, which
// is exactly how the change will (not) be seen in play.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const S = 'reviews/shots-perf-r2';
const SCENES = ['e1-night-shift', 'the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'];
const project = process.argv[2] ?? 'desktop-chrome';
const GAP = 10;

for (const scene of SCENES) {
  const base = `${S}/${project}-${scene}-pressure`;
  let inst; let spr; let reb;
  try {
    inst = PNG.sync.read(readFileSync(`${base}-instanced.png`));
    spr = PNG.sync.read(readFileSync(`${base}-sprites.png`));
    reb = PNG.sync.read(readFileSync(`${base}-instanced-reboot.png`));
  } catch { console.log(`skip ${scene} (missing arm)`); continue; }

  const W = inst.width; const H = inst.height;
  const out = new PNG({ width: W * 2 + GAP, height: H });
  const blit = (src, dx) => {
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const s = (y * W + x) * 4; const d = (y * out.width + x + dx) * 4;
        out.data[d] = src.data[s]; out.data[d + 1] = src.data[s + 1];
        out.data[d + 2] = src.data[s + 2]; out.data[d + 3] = 255;
      }
    }
  };
  blit(inst, 0);
  blit(spr, W + GAP);
  for (let y = 0; y < H; y += 1) {
    for (let g = 0; g < GAP; g += 1) {
      const o = (y * out.width + W + g) * 4;
      out.data[o] = 255; out.data[o + 1] = 0; out.data[o + 2] = 255; out.data[o + 3] = 255;
    }
  }
  writeFileSync(`${S}/board-${project}-${scene}-pressure-1to1.png`, PNG.sync.write(out));

  // Delta mask: red = instancing changed it AND a same-build reboot did not.
  const dm = (p, q, o) => Math.max(
    Math.abs(p.data[o] - q.data[o]), Math.abs(p.data[o + 1] - q.data[o + 1]), Math.abs(p.data[o + 2] - q.data[o + 2]),
  );
  const mask = new PNG({ width: W, height: H });
  let only = 0;
  for (let i = 0; i < W * H; i += 1) {
    const o = i * 4;
    const t = dm(inst, spr, o) > 16;
    const c = dm(inst, reb, o) <= 4;
    if (t && c) {
      only += 1;
      mask.data[o] = 255; mask.data[o + 1] = 0; mask.data[o + 2] = 0;
    } else {
      mask.data[o] = inst.data[o] >> 2; mask.data[o + 1] = inst.data[o + 1] >> 2; mask.data[o + 2] = inst.data[o + 2] >> 2;
    }
    mask.data[o + 3] = 255;
  }
  writeFileSync(`${S}/board-${project}-${scene}-pressure-deltamask.png`, PNG.sync.write(mask));
  console.log(`${project} ${scene}: board + mask written, treatment-only px ${only} (${((only / (W * H)) * 100).toFixed(3)}% of frame)`);
}
