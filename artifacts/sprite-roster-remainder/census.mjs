// Per-family census: cell size, figure height (alpha>=128) absolute and as a fraction of the cell,
// mean opaque RGB (hue/value identity), visible violet-key pixels, and key pixels under transparency.
// Usage: node artifacts/sprite-roster-remainder/census.mjs <prefix> [<prefix> ...]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const rows = [];
for (const prefix of process.argv.slice(2)) {
  const dir = prefix.includes('/') ? path.dirname(prefix) : 'assets/processed';
  const base = path.basename(prefix);
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(base) && f.endsWith('.png')).sort();
  let n = 0, hSum = 0, hMin = Infinity, hMax = -Infinity, fracSum = 0;
  let r = 0, g = 0, b = 0, opaque = 0, violet = 0, keyUnder = 0, partial = 0, w = 0, h = 0;
  for (const f of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(dir, f)));
    w = png.width; h = png.height;
    let top = -1, bottom = -1;
    for (let y = 0; y < png.height; y++) {
      let any = false;
      for (let x = 0; x < png.width; x++) {
        const o = ((y * png.width + x) << 2);
        const a = png.data[o + 3];
        if (a >= 128) any = true;
        if (a > 0 && a < 255) partial++;
        if (a >= 16 && png.data[o] - png.data[o + 1] >= 40 && png.data[o + 2] - png.data[o + 1] >= 40) violet++;
        if (a === 0 && png.data[o] - png.data[o + 1] >= 40 && png.data[o + 2] - png.data[o + 1] >= 40) keyUnder++;
        if (a === 255) { r += png.data[o]; g += png.data[o + 1]; b += png.data[o + 2]; opaque++; }
      }
      if (any) { if (top < 0) top = y; bottom = y; }
    }
    const figure = top < 0 ? 0 : bottom - top + 1;
    hSum += figure; hMin = Math.min(hMin, figure); hMax = Math.max(hMax, figure);
    fracSum += figure / png.height;
    n++;
  }
  rows.push({
    family: base, cells: n, cell: `${w}x${h}`,
    figure: `${hMin}-${hMax} (mean ${(hSum / n).toFixed(1)})`,
    figureFractionPct: +(100 * fracSum / n).toFixed(2),
    meanOpaqueRGB: [r / opaque, g / opaque, b / opaque].map((v) => +v.toFixed(1)),
    visibleVioletPx: violet, keyUnderTransparentPx: keyUnder, partialAlphaPx: partial,
    bytes: files.reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0),
  });
}
console.log(JSON.stringify(rows, null, 1));
