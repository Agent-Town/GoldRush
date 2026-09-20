// Detached-speck sweep for a generated magenta plate. The schoolteacher's east reference carries a
// small dark ground blob under her boots (the F-RECUT-2 row's shadow remnant) and take 1 copied it;
// a blob that sits under the feet also drags extract-alpha's bbox centre down, which would move the
// footline TownScene anchors on. Everything that is not connected to a figure-sized island is painted
// back to the key BEFORE extraction, so the extractor sees a clean plate.
import sharp from 'sharp';
const KEY = (r, g, b) => r > 150 && b > 150 && g < 140 && Math.abs(r - b) < 90 && r - g > 40 && b - g > 40;

export async function cleanPlate(src, dst, { minFrac = 0.02, grid = '2x2' } = {}) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const [cols, rows] = grid.split('x').map(Number);
  const cw = Math.floor(w / cols), chh = Math.floor(h / rows);
  const out = Buffer.from(data);
  let removed = 0, islands = 0;
  for (let gy = 0; gy < rows; gy += 1) for (let gx = 0; gx < cols; gx += 1) {
    const x0 = gx * cw, y0 = gy * chh;
    const seen = new Uint8Array(cw * chh);
    const comps = [];
    for (let y = 0; y < chh; y += 1) for (let x = 0; x < cw; x += 1) {
      const li = y * cw + x;
      if (seen[li]) continue;
      const i = ((y0 + y) * w + (x0 + x)) * ch;
      if (KEY(data[i], data[i + 1], data[i + 2])) { seen[li] = 1; continue; }
      const stack = [li]; seen[li] = 1; const pix = [];
      while (stack.length) {
        const p = stack.pop(); pix.push(p);
        const px = p % cw, py = (p / cw) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = px + dx, ny = py + dy;
          if (nx < 0 || ny < 0 || nx >= cw || ny >= chh) continue;
          const nl = ny * cw + nx;
          if (seen[nl]) continue;
          const ni = ((y0 + ny) * w + (x0 + nx)) * ch;
          if (KEY(data[ni], data[ni + 1], data[ni + 2])) { seen[nl] = 1; continue; }
          seen[nl] = 1; stack.push(nl);
        }
      }
      comps.push(pix);
    }
    if (!comps.length) continue;
    const biggest = Math.max(...comps.map((c) => c.length));
    islands += comps.length;
    for (const c of comps) {
      if (c.length >= biggest * minFrac) continue;
      removed += c.length;
      for (const p of c) {
        const px = p % cw, py = (p / cw) | 0;
        const i = ((y0 + py) * w + (x0 + px)) * ch;
        out[i] = 255; out[i + 1] = 0; out[i + 2] = 255; if (ch > 3) out[i + 3] = 255;
      }
    }
  }
  await sharp(out, { raw: { width: w, height: h, channels: ch } }).png().toFile(dst);
  return { islands, removedPx: removed };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain && process.argv[2]) console.log(await cleanPlate(process.argv[2], process.argv[3], { grid: process.argv[4] || '2x2' }));
