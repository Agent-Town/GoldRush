import sharp from 'sharp';
const LIT = (r, g, b) => r > 225 && g > 120 && g < 215 && b < 95 && r - b > 150;
async function lampOffset(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const seen = new Uint8Array(w * h); let best = null; let bx0 = w, bx1 = -1;
  for (let p = 0; p < w * h; p += 1) if (data[p * ch + 3] > 8) { const x = p % w; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; }
  for (let p = 0; p < w * h; p += 1) {
    if (seen[p]) continue; const i = p * ch;
    if (data[i + 3] < 200 || !LIT(data[i], data[i + 1], data[i + 2])) { seen[p] = 1; continue; }
    const st = [p]; seen[p] = 1; let size = 0, sx = 0;
    while (st.length) { const q = st.pop(); size += 1; sx += q % w; const qx = q % w, qy = (q / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const nl = ny * w + nx; if (seen[nl]) continue;
        const ni = nl * ch; if (data[ni + 3] < 200 || !LIT(data[ni], data[ni + 1], data[ni + 2])) { seen[nl] = 1; continue; }
        seen[nl] = 1; st.push(nl); } }
    if (!best || size > best.size) best = { size, cx: sx / size };
  }
  if (!best) return 'none';
  const c = (bx0 + bx1) / 2, wd = bx1 - bx0 + 1;
  return `${best.size}px@${((best.cx - c) / wd * 100).toFixed(1)}%`;
}
for (const [label, dir, stem] of [['retake1 (rejected on scale)', 'artifacts/needs-cells-codex-strips/probe', 'wrecker-retake1'],
                                  ['retake2 (selected)', 'artifacts/needs-cells-codex-strips/tmp', 'char-steamwrecker-se4-v1']]) {
  const r = [];
  for (const c of ['r0c0', 'r0c1', 'r1c0', 'r1c1']) r.push(await lampOffset(`${dir}/${stem}-${c}.png`));
  console.log(label.padEnd(30), r.join('  '));
}
