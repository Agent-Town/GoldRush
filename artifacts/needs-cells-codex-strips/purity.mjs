// Field purity before and after processing, on the bar the GENERATOR parked itself on (literal
// 255,0,255) and on the bar the PIPELINE actually uses (what --tol 26 + the hue-targeted despill
// absorb). Run on the native plates that produced the landed cells.
import sharp from 'sharp';
import { ROWS } from './strips.mjs';
const N = 'artifacts/needs-cells-codex-strips/native/';
async function purity(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let exact = 0, near = 0; const total = info.width * info.height;
  for (let i = 0; i + info.channels - 1 < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r === 255 && g === 0 && b === 255) exact += 1;
    else if (r > 180 && g < 110 && b > 180 && Math.abs(r - b) < 70) near += 1;
  }
  return { w: info.width, h: info.height, total, exact, near,
    exactPct: +((exact / total) * 100).toFixed(3), nearPct: +((near / total) * 100).toFixed(2) };
}
for (const row of ROWS) {
  const src = row.id === 'wrecker-se' ? N + 'char-steamwrecker-se4-v1.png' : row.raw;
  const p = await purity(src);
  console.log(`${row.id.padEnd(11)} ${p.w}x${p.h} literal #ff00ff ${String(p.exact).padStart(8)} px (${p.exactPct}%)  near-magenta ${String(p.near).padStart(8)} px (${p.nearPct}%)`);
}
