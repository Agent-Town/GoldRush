import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const root = path.resolve(import.meta.dirname, '../..');
const offenders = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'audit-before.json'))).offenders;
const files = offenders.map((x) => x.file);
const broadCream = (d, o) => d[o + 3] >= 192 && d[o] >= 115 && d[o + 1] >= 90 && d[o + 2] >= 55
  && d[o] >= d[o + 1] && d[o + 1] >= d[o + 2] && d[o] - d[o + 1] <= 65 && d[o + 1] - d[o + 2] >= 12;
const qa = [];
const bbox = (p) => {
  let x0 = p.width, y0 = p.height, x1 = -1, y1 = -1;
  for (let i = 0; i < p.width * p.height; i++) if (p.data[(i << 2) + 3]) {
    const x = i % p.width, y = (i / p.width) | 0;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
};

for (const file of files) {
  const original = PNG.sync.read(execFileSync('git', ['show', `HEAD:${file}`], { cwd: root }));
  const png = PNG.sync.read(fs.readFileSync(path.join(root, file)));
  const cleared = new Uint8Array(png.width * png.height);
  for (const blob of offenders.find((x) => x.file === file).blobs) {
    const [x0, y0, x1, y1] = blob.bbox.map((n, i) => i < 2 ? Math.max(0, n - 4) : Math.min((i === 2 ? png.width : png.height) - 1, n + 4));
    const queue = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * png.width + x;
      if (original.data[(i << 2) + 3] >= 192 && png.data[(i << 2) + 3] < 128) { cleared[i] = 1; queue.push(i); }
    }
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q], x = i % png.width, y = (i / png.width) | 0;
      for (const j of [i - 1, i + 1, i - png.width, i + png.width]) {
        const nx = j % png.width, ny = (j / png.width) | 0;
        if (j < 0 || j >= cleared.length || nx < x0 || nx > x1 || ny < y0 || ny > y1 || cleared[j] || !broadCream(original.data, j << 2)) continue;
        cleared[j] = 1; queue.push(j);
      }
    }
  }
  for (let i = 0; i < cleared.length; i++) if (cleared[i]) png.data[(i << 2) + 3] = 0;
  for (let i = 0; i < cleared.length; i++) {
    if (!cleared[i]) continue;
    const x = i % png.width, y = (i / png.width) | 0;
    if ((x && !cleared[i - 1]) || (x + 1 < png.width && !cleared[i + 1]) || (y && !cleared[i - png.width]) || (y + 1 < png.height && !cleared[i + png.width])) png.data[(i << 2) + 3] = 64;
  }
  const beforeBbox = bbox(original), afterBbox = bbox(png);
  qa.push({ file, beforeBbox, afterBbox, bboxDeltaMax: Math.max(...beforeBbox.map((n, i) => Math.abs(n - afterBbox[i]))) });
  fs.writeFileSync(path.join(root, file), PNG.sync.write(png));
}
fs.writeFileSync(path.join(import.meta.dirname, 'edge-qa.json'), `${JSON.stringify({ allWithinOnePixel: qa.every((x) => x.bboxDeltaMax <= 1), cells: qa }, null, 2)}\n`);
const strip = new PNG({ width: 512 * 6, height: 512 });
const beforeStrip = new PNG({ width: 512 * 6, height: 512 });
const composite = (png) => {
  const out = new PNG({ width: png.width, height: png.height });
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2, a = png.data[o + 3] / 255, x = i % png.width, y = (i / png.width) | 0;
    const bg = ((x >> 4) + (y >> 4)) & 1 ? 72 : 112;
    for (let c = 0; c < 3; c++) out.data[o + c] = Math.round(png.data[o + c] * a + bg * (1 - a));
    out.data[o + 3] = 255;
  }
  return out;
};
for (let n = 0; n < 6; n++) {
  const file = path.basename(offenders[n].file);
  const png = composite(PNG.sync.read(fs.readFileSync(path.join(root, offenders[n].file))));
  const before = composite(PNG.sync.read(fs.readFileSync(path.join(import.meta.dirname, `worst-${n + 1}-before-${file}`))));
  PNG.bitblt(png, strip, 0, 0, 512, 512, n * 512, 0);
  PNG.bitblt(before, beforeStrip, 0, 0, 512, 512, n * 512, 0);
}
fs.writeFileSync(path.join(import.meta.dirname, 'worst-6-after.png'), PNG.sync.write(strip));
fs.writeFileSync(path.join(import.meta.dirname, 'worst-6-before.png'), PNG.sync.write(beforeStrip));
