// The rig counts DEVICE pixels. On a 2.75x-DPR mobile profile that overstates what a player can see
// by construction: sub-pixel silhouette jitter that box-filters away at CSS size still trips a
// device-pixel counter. This measures the same two arms at CSS resolution -- the unit the eye
// actually receives -- and reports treatment against its own same-build reboot control there.
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const S = 'reviews/shots-perf-r2';
const dpr = Number(process.argv[2] ?? 2.75);
const scenes = process.argv.slice(3);

const downscale = (src) => {
  const w = Math.floor(src.width / dpr);
  const h = Math.floor(src.height / dpr);
  const out = new Float64Array(w * h * 3);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let r = 0; let g = 0; let b = 0; let n = 0;
      for (let sy = Math.floor(y * dpr); sy < Math.floor((y + 1) * dpr); sy += 1) {
        for (let sx = Math.floor(x * dpr); sx < Math.floor((x + 1) * dpr); sx += 1) {
          const o = (sy * src.width + sx) * 4;
          r += src.data[o]; g += src.data[o + 1]; b += src.data[o + 2]; n += 1;
        }
      }
      const d = (y * w + x) * 3;
      out[d] = r / n; out[d + 1] = g / n; out[d + 2] = b / n;
    }
  }
  return { data: out, w, h };
};

const compare = (A, B) => {
  let changed = 0; let total = 0;
  for (let i = 0; i < A.data.length; i += 3) {
    const d = Math.max(
      Math.abs(A.data[i] - B.data[i]),
      Math.abs(A.data[i + 1] - B.data[i + 1]),
      Math.abs(A.data[i + 2] - B.data[i + 2]),
    );
    total += d;
    if (d > 4) changed += 1;
  }
  const px = A.data.length / 3;
  return { changed, share: +((changed / px) * 100).toFixed(3), meanDelta: +(total / px).toFixed(4) };
};

for (const scene of scenes) {
  const base = `${S}/mobile-chrome-${scene}`;
  let inst; let spr; let reb;
  try {
    inst = downscale(PNG.sync.read(readFileSync(`${base}-instanced.png`)));
    spr = downscale(PNG.sync.read(readFileSync(`${base}-sprites.png`)));
    reb = downscale(PNG.sync.read(readFileSync(`${base}-instanced-reboot.png`)));
  } catch { console.log(`${scene}: missing arm`); continue; }
  const t = compare(inst, spr);
  const c = compare(inst, reb);
  console.log(`${scene.padEnd(26)} CSS-res  treatment ${String(t.changed).padStart(6)} (${String(t.share).padStart(6)}%) meanD ${String(t.meanDelta).padStart(7)}   control ${String(c.changed).padStart(6)} (${String(c.share).padStart(6)}%) meanD ${String(c.meanDelta).padStart(7)}`);
}
