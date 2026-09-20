// Contact-board maker: rows of cells composited onto a dark ground at a fixed cell size.
import sharp from 'sharp';
export async function board(rows, out, cellPx = 128) {
  const cols = Math.max(...rows.map((r) => r.files.length));
  const labelW = 0;
  const W = cols * cellPx, H = rows.length * cellPx;
  const comps = [];
  for (let r = 0; r < rows.length; r += 1) {
    for (let c = 0; c < rows[r].files.length; c += 1) {
      const buf = await sharp(rows[r].files[c]).resize(cellPx, cellPx, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      comps.push({ input: buf, left: c * cellPx, top: r * cellPx });
    }
  }
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 34, g: 30, b: 26, alpha: 1 } } }).composite(comps).png().toFile(out);
  return { out, W, H, rows: rows.map((r) => r.label) };
}
