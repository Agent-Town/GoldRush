import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const root = path.resolve(import.meta.dirname, '../..');
const outDir = path.resolve(import.meta.dirname);
const files = fs.readdirSync(path.join(root, 'assets/processed'))
  .filter((name) => /^char-.*-(?:walk8|walk4)-r\d+c\d+\.png$/.test(name))
  .sort();

const isCream = (d, o) => d[o + 3] >= 192
  && d[o] >= 205 && d[o + 1] >= 175 && d[o + 2] >= 100
  && d[o] >= d[o + 1] && d[o + 1] >= d[o + 2]
  && d[o] - d[o + 1] <= 55 && d[o + 1] - d[o + 2] >= 18;

function pockets(png) {
  const { width: w, height: h, data: d } = png;
  const outside = new Uint8Array(w * h);
  const stack = [];
  const passable = (i) => d[(i << 2) + 3] < 32 || isCream(d, i << 2);
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (!outside[i] && passable(i)) { outside[i] = 1; stack.push(i); }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  const seen = new Uint8Array(w * h), found = [];
  for (let s = 0; s < w * h; s++) {
    if (outside[s] || seen[s] || !isCream(d, s << 2)) continue;
    const cells = [s]; seen[s] = 1;
    for (let q = 0; q < cells.length; q++) {
      const i = cells[q], x = i % w, y = (i / w) | 0;
      for (const j of [i - 1, i + 1, i - w, i + w]) {
        if ((j === i - 1 && x === 0) || (j === i + 1 && x === w - 1) || j < 0 || j >= w * h) continue;
        if (!outside[j] && !seen[j] && isCream(d, j << 2)) { seen[j] = 1; cells.push(j); }
      }
    }
    if (cells.length >= 40) found.push(cells);
  }
  return found;
}

const report = [];
const images = new Map();
for (const file of files) {
  const png = PNG.sync.read(fs.readFileSync(path.join(root, 'assets/processed', file)));
  images.set(file, png);
  for (const cells of pockets(png)) {
    const xs = cells.map((i) => i % png.width), ys = cells.map((i) => (i / png.width) | 0);
    const means = [0, 1, 2].map((c) => cells.reduce((n, i) => n + png.data[(i << 2) + c], 0) / cells.length);
    const std = Math.sqrt(cells.reduce((n, i) => n + [0, 1, 2].reduce((m, c) => m + (png.data[(i << 2) + c] - means[c]) ** 2, 0), 0) / (cells.length * 3));
    const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (cells.length / ((bbox[2] - bbox[0] + 1) * (bbox[3] - bbox[1] + 1)) >= 0.2)
      report.push({ file: `assets/processed/${file}`, areaPx: cells.length, bbox, rgbStd: +std.toFixed(1), cells });
  }
}
const byFile = new Map();
for (const blob of report) {
  const entry = byFile.get(blob.file) ?? { file: blob.file, blobCount: 0, areaPx: 0, blobs: [] };
  entry.blobCount++; entry.areaPx += blob.areaPx; entry.blobs.push({ areaPx: blob.areaPx, bbox: blob.bbox });
  byFile.set(blob.file, entry);
}
const offenders = [...byFile.values()].sort((a, b) => b.areaPx - a.areaPx);
const audit = { offenderCount: offenders.length, blobCount: report.length, offenders };

if (process.argv.includes('--fix')) {
  fs.writeFileSync(path.join(outDir, 'audit-before.json'), `${JSON.stringify(audit, null, 2)}\n`);
  const worst = offenders.slice(0, 6);
  const before = new PNG({ width: 512 * 6, height: 512 });
  for (let n = 0; n < worst.length; n++) {
    const file = path.basename(worst[n].file), png = images.get(file);
    fs.writeFileSync(path.join(outDir, `worst-${n + 1}-before-${file}`), PNG.sync.write(png));
    PNG.bitblt(png, before, 0, 0, 512, 512, n * 512, 0);
  }
  fs.writeFileSync(path.join(outDir, 'worst-6-before.png'), PNG.sync.write(before));
  for (const [file, entry] of byFile) {
    const name = path.basename(file), png = images.get(name);
    for (const blob of report.filter((item) => item.file === file)) {
      for (const i of blob.cells) png.data[(i << 2) + 3] = 0;
    }
    fs.writeFileSync(path.join(root, file), PNG.sync.write(png));
  }
  const qa = [];
  for (const file of byFile.keys()) {
    const original = PNG.sync.read(execFileSync('git', ['show', `HEAD:${file}`], { cwd: root }));
    const png = PNG.sync.read(fs.readFileSync(path.join(root, file)));
    const cleared = new Uint8Array(png.width * png.height);
    for (let i = 0; i < cleared.length; i++) {
      const o = i << 2;
      if (original.data[o + 3] >= 192 && png.data[o + 3] === 0 && isCream(original.data, o)) cleared[i] = 1;
    }
    for (let i = 0; i < cleared.length; i++) {
      if (!cleared[i]) continue;
      const x = i % png.width, y = (i / png.width) | 0;
      if ((x && !cleared[i - 1]) || (x + 1 < png.width && !cleared[i + 1]) || (y && !cleared[i - png.width]) || (y + 1 < png.height && !cleared[i + png.width])) png.data[(i << 2) + 3] = 64;
    }
    const bbox = (p) => {
      let x0 = p.width, y0 = p.height, x1 = -1, y1 = -1;
      for (let i = 0; i < p.width * p.height; i++) if (p.data[(i << 2) + 3]) { const x = i % p.width, y = (i / p.width) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      return [x0, y0, x1, y1];
    };
    const beforeBbox = bbox(original), afterBbox = bbox(png);
    qa.push({ file, beforeBbox, afterBbox, bboxDeltaMax: Math.max(...beforeBbox.map((n, i) => Math.abs(n - afterBbox[i]))) });
    fs.writeFileSync(path.join(root, file), PNG.sync.write(png));
  }
  fs.writeFileSync(path.join(outDir, 'edge-qa.json'), `${JSON.stringify({ allWithinOnePixel: qa.every((x) => x.bboxDeltaMax <= 1), cells: qa }, null, 2)}\n`);
  const after = new PNG({ width: 512 * 6, height: 512 });
  for (let n = 0; n < worst.length; n++) {
    const png = PNG.sync.read(fs.readFileSync(path.join(root, worst[n].file)));
    PNG.bitblt(png, after, 0, 0, 512, 512, n * 512, 0);
  }
  fs.writeFileSync(path.join(outDir, 'worst-6-after.png'), PNG.sync.write(after));
} else {
  fs.writeFileSync(path.join(outDir, 'audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
}
console.log(JSON.stringify({ offenderCount: offenders.length, blobCount: report.length, worst: offenders.slice(0, 20) }, null, 2));
