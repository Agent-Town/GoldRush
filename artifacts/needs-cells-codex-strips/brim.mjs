// Travel-direction instrument for the Claim Jumper, on the silhouette alone (no palette, so pose
// lighting cannot bias it): the flat straw brim overhangs the way the face points, so the HEAD band's
// horizontal centroid leads the TORSO band's. Reported as (headCx - torsoCx)/width, per cent.
// Calibrated below on the live opposite profiles e and w; if those do not separate, the instrument
// is discarded rather than reported.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
async function skew(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  let bx0 = w, bx1 = -1, by0 = h, by1 = -1;
  for (let p = 0; p < w * h; p += 1) if (data[p * ch + 3] > 128) { const x = p % w, y = (p / w) | 0;
    if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
  const H = by1 - by0 + 1, W = bx1 - bx0 + 1;
  const bandCx = (a, b) => { let n = 0, s = 0;
    for (let y = by0 + Math.round(H * a); y <= by0 + Math.round(H * b); y += 1)
      for (let x = bx0; x <= bx1; x += 1) if (data[((y * w + x) * ch) + 3] > 128) { n += 1; s += x; }
    return n ? s / n : null; };
  const head = bandCx(0.00, 0.13), torso = bandCx(0.30, 0.62), foot = bandCx(0.85, 1.0);
  return { brim: +(((head - torso) / W) * 100).toFixed(1), foot: +(((foot - torso) / W) * 100).toFixed(1) };
}
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const wk = contract.slots.find((x) => x.slot === 'char.claim_jumper').walk4;
const P = 'assets/processed/', T = 'artifacts/needs-cells-codex-strips/tmp/', Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const line = async (label, files) => {
  const r = []; for (const f of files) r.push(await skew(f));
  const m = +(r.reduce((a, b) => a + b.brim, 0) / r.length).toFixed(1);
  console.log(` ${label.padEnd(10)} brim=[${r.map((x) => (x.brim > 0 ? '+' : '') + x.brim).join(', ')}] mean=${m > 0 ? '+' : ''}${m}%`);
};
console.log('LIVE (calibration: e must read clearly + and w clearly -, or the instrument is void)');
for (const d of ['e', 'w', 's', 'n', 'se', 'sw', 'ne', 'nw']) await line(`live ${d}`, wk.directions[d].frames.files.map((f) => P + f));
console.log('NEW');
for (const d of ['s', 'e', 'se', 'sw', 'ne', 'nw']) await line(`new ${d}`, Q4.map((c) => `${T}char-jumper-${d}4-codex-v1-${c}.png`));
