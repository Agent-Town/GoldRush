// Heading instrument: the amber porthole is on the machine's FRONT face, so its centroid moves with
// the turn. Reported as (lamp centroid x - silhouette centre x) / silhouette width, in per cent:
// negative = lamp screen-LEFT of centre, positive = screen-RIGHT. Calibrated on the live rows.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const LIT = (r, g, b) => r > 225 && g > 120 && g < 215 && b < 95 && r - b > 150;
async function lampOffset(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const seen = new Uint8Array(w * h);
  let best = null;
  let bx0 = w, bx1 = -1;
  for (let p = 0; p < w * h; p += 1) if (data[p * ch + 3] > 8) { const x = p % w; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; }
  for (let p = 0; p < w * h; p += 1) {
    if (seen[p]) continue;
    const i = p * ch;
    if (data[i + 3] < 200 || !LIT(data[i], data[i + 1], data[i + 2])) { seen[p] = 1; continue; }
    const stack = [p]; seen[p] = 1; let size = 0, sx = 0;
    while (stack.length) {
      const q = stack.pop(); size += 1; sx += q % w;
      const qx = q % w, qy = (q / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const nl = ny * w + nx; if (seen[nl]) continue;
        const ni = nl * ch;
        if (data[ni + 3] < 200 || !LIT(data[ni], data[ni + 1], data[ni + 2])) { seen[nl] = 1; continue; }
        seen[nl] = 1; stack.push(nl);
      }
    }
    if (!best || size > best.size) best = { size, cx: sx / size };
  }
  if (!best) return null;
  const centre = (bx0 + bx1) / 2, width = bx1 - bx0 + 1;
  return { size: best.size, offPct: +(((best.cx - centre) / width) * 100).toFixed(1) };
}
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const wk = contract.slots.find((x) => x.slot === 'char.e2.steam_wrecker').walk4;
const P = 'assets/processed/';
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
for (const dir of ['s', 'sw', 'w', 'e', 'n', 'ne', 'nw']) {
  const files = wk.directions[dir].frames.files.map((f) => P + f);
  const r = await Promise.all(files.map(lampOffset));
  console.log(`live ${dir.padEnd(3)} ${r.map((x) => (x ? `${x.size}px@${x.offPct > 0 ? '+' : ''}${x.offPct}%` : 'none')).join('  ')}`);
}
const nf = Q4.map((c) => `artifacts/needs-cells-codex-strips/tmp/char-steamwrecker-se4-v1-${c}.png`);
const nr = await Promise.all(nf.map(lampOffset));
console.log(`NEW  se  ${nr.map((x) => (x ? `${x.size}px@${x.offPct > 0 ? '+' : ''}${x.offPct}%` : 'none')).join('  ')}`);
