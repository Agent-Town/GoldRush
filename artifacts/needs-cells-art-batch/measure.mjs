// Measurement helper for the needs-cells art batch. Reports per-cell: size, alpha bbox, figure height,
// height as % of cell, mean opaque RGB, and (for raw sheets) magenta-key purity.
import sharp from 'sharp';
export async function measureCell(file, alphaThreshold = 16) {
  const img = sharp(file);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  let minX = w, minY = h, maxX = -1, maxY = -1, n = 0, sr = 0, sg = 0, sb = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * ch;
      if (data[i + 3] > alphaThreshold) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        n += 1; sr += data[i]; sg += data[i + 1]; sb += data[i + 2];
      }
    }
  }
  const height = maxY < 0 ? 0 : maxY - minY + 1;
  const width = maxX < 0 ? 0 : maxX - minX + 1;
  return {
    file: file.split('/').pop(), cell: `${w}x${h}`, cellW: w, cellH: h,
    bbox: maxY < 0 ? null : [minX, minY, maxX, maxY], height, width,
    pctOfCell: maxY < 0 ? 0 : +((height / h) * 100).toFixed(2),
    opaque: n, rgb: n ? [ +(sr / n).toFixed(1), +(sg / n).toFixed(1), +(sb / n).toFixed(1) ] : null,
    fmt: meta.format,
  };
}
// Key purity on a generated raw sheet: fraction of pixels close to #ff00ff, and how many are "muddy"
// (near-magenta but not exact — the despill load), plus any letters-ish high-contrast check is eyes-on.
export async function keyPurity(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  let exact = 0, near = 0, total = w * h;
  for (let i = 0; i + ch - 1 < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r > 240 && g < 24 && b > 240) exact += 1;
    else if (r > 180 && g < 110 && b > 180 && Math.abs(r - b) < 70) near += 1;
  }
  return { w, h, total, exact, near, exactPct: +((exact / total) * 100).toFixed(2), nearPct: +((near / total) * 100).toFixed(2) };
}
