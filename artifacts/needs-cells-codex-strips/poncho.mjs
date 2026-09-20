// Left/right heading instrument for the Claim Jumper, built on the one prop his silhouette always
// carries: the rust-red poncho, which hangs over the shoulders and TRAILS the direction of travel.
// Reported as (red centroid x - silhouette centre x) / silhouette width, per cent: negative = the
// poncho sits screen-LEFT, i.e. he travels RIGHT. Calibrated on the live cardinals e and w.
// `area` is red px as a fraction of opaque px: a back view shows the whole poncho, a front view the
// smaller chest fall.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const RED = (r, g, b) => r > 110 && r - g > 38 && r - b > 38;
// Warm skin under the hat brim: separates the three south winds (face) from the three north (no face).
const SKIN = (r, g, b) => r > 150 && r < 245 && g > 105 && g < 200 && b > 80 && b < 175 && r - g > 22 && g - b > 8 && r - b > 45;
async function probe(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  let bx0 = w, bx1 = -1, by0 = h, by1 = -1, opaque = 0, red = 0, sx = 0, skinTop = 0, topOpaque = 0;
  for (let p = 0; p < w * h; p += 1) {
    const i = p * ch; if (data[i + 3] < 128) continue;
    const x = p % w, y = (p / w) | 0;
    opaque += 1; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
  }
  const headCut = by0 + (by1 - by0) * 0.32;
  for (let p = 0; p < w * h; p += 1) {
    const i = p * ch; if (data[i + 3] < 128) continue;
    const x = p % w, y = (p / w) | 0;
    if (RED(data[i], data[i + 1], data[i + 2])) { red += 1; sx += x; }
    if (y <= headCut) { topOpaque += 1; if (SKIN(data[i], data[i + 1], data[i + 2])) skinTop += 1; }
  }
  const c = (bx0 + bx1) / 2, wd = bx1 - bx0 + 1;
  return { off: red ? +(((sx / red) - c) / wd * 100).toFixed(1) : null,
    area: +((red / opaque) * 100).toFixed(1), face: +((skinTop / Math.max(1, topOpaque)) * 100).toFixed(1) };
}
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const wk = contract.slots.find((x) => x.slot === 'char.claim_jumper').walk4;
const P = 'assets/processed/', Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const line = async (label, files) => {
  const r = []; for (const f of files) r.push(await probe(f));
  const avg = (k) => +(r.reduce((a, b) => a + (b[k] ?? 0), 0) / r.length).toFixed(1);
  console.log(` ${label.padEnd(12)} off=[${r.map((x) => (x.off > 0 ? '+' : '') + x.off).join(', ')}] mean=${avg('off') > 0 ? '+' : ''}${avg('off')}%  ponchoArea=${avg('area')}%  faceTop=${avg('face')}%`);
};
console.log('LIVE');
for (const d of ['s', 'n', 'e', 'w', 'se', 'ne', 'sw', 'nw']) await line(`live ${d}`, wk.directions[d].frames.files.map((f) => P + f));
console.log('NEW');
for (const d of ['s', 'e', 'se', 'sw', 'ne', 'nw']) await line(`new ${d}`, Q4.map((c) => `artifacts/needs-cells-codex-strips/tmp/char-jumper-${d}4-codex-v1-${c}.png`));
