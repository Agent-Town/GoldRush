// The set of shipped cells that today reproduce BYTE-IDENTICALLY from their processed-full master
// under scripts/anim-pass-reextract.mjs --verify-downscale. Those must keep their exact repository
// encoding through a lossless pass, or that control's "byte-identical" count collapses to 0
// (the F-1464-1 rule: "master-derived shipped cells retain their exact repository encoding so the
// downscale byte gate stays green"). resize/isOpaque/writePng are copied verbatim from
// scripts/anim-pass-reextract.mjs:60-87, which copied them from optimize-assets.mjs.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PNG } from 'pngjs';
const PROC = 'assets/processed';
const FULL = 'assets/processed-full';
function resize(png, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / png.width, maxHeight / png.height);
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  if (width === png.width && height === png.height) return png;
  const out = new PNG({ width, height });
  const sx = png.width / width, sy = png.height / height;
  for (let y = 0; y < height; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0), y1 = Math.min(y0 + 1, png.height - 1), wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0), x1 = Math.min(x0 + 1, png.width - 1), wx = fx - x0;
      const outIdx = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c], p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c], p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[outIdx + c] = Math.round(p00 * (1 - wx) * (1 - wy) + p10 * wx * (1 - wy) + p01 * (1 - wx) * wy + p11 * wx * wy);
      }
    }
  }
  return out;
}
function isOpaque(png) { for (let i = 3; i < png.data.length; i += 4) if (png.data[i] !== 255) return false; return true; }
function writePng(png, file) {
  const options = isOpaque(png) ? { colorType: 2, zlib: { level: 9 } } : { zlib: { level: 9 } };
  fs.writeFileSync(file, PNG.sync.write(png, options));
}
const readPng = (f) => PNG.sync.read(fs.readFileSync(f));
const files = fs.readdirSync(FULL).filter((f) => /-r\d+c\d+\.png$/.test(f)).sort();
const identical = [];
let noShipped = 0, differs = 0;
const tmp = path.join(os.tmpdir(), `identical-list-${process.pid}.png`);
for (const f of files) {
  const p = path.join(PROC, f);
  if (!fs.existsSync(p)) { noShipped += 1; continue; }
  writePng(resize(readPng(path.join(FULL, f)), 256, 256), tmp);
  if (Buffer.compare(fs.readFileSync(tmp), fs.readFileSync(p)) === 0) identical.push(f); else differs += 1;
}
fs.unlinkSync(tmp);
fs.writeFileSync('artifacts/hygiene-battery-lossless-triangles/downscale-identical.json',
  JSON.stringify({ masters: files.length, identical: identical.length, differs, noShipped, files: identical }, null, 1) + '\n');
console.log(JSON.stringify({ masters: files.length, identical: identical.length, differs, noShipped }));
