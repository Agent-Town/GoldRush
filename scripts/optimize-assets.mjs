#!/usr/bin/env node
/**
 * Shrink shipped assets after alpha extraction.
 *
 * Targets are display-size x1.5, rounded up where the renderer/CSS can get close:
 * - sprite cells: 256px (2.24 world-unit max billboard at DPR 2 projects under 220px)
 * - gameplay cutouts/signs/portraits: 384px
 * - terrain tiles: 448px (4 repeats across the 64u claim, RGB PNG)
 * - menu backdrop: 720x405; tavern board backdrop: 600x400
 * - menu panel/emblem: 256px; upgrade icons: 512px
 *
 * Full processed originals are preserved in assets/processed-full/. The shipped
 * assets/processed/ copies are overwritten, so Vite's broad processed/*.png globs
 * cannot accidentally ship raw-resolution files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const PROCESSED_DIR = 'assets/processed';
const FULL_DIR = 'assets/processed-full';
const MAX_BYTES = 600 * 1024;
const REFRESH_FULL = process.argv.includes('--refresh-full');

const TARGETS = [
  { test: (file) => file === 'ui-menu-backdrop.png', width: 720, height: 405, label: 'menu backdrop' },
  { test: (file) => file === 'tavern-interior-backdrop.png', width: 600, height: 400, label: 'tavern backdrop' },
  { test: (file) => /^terrain-.+-tile(?:-[a-z])?\.png$/.test(file), width: 448, height: 448, label: 'terrain tile' },
  { test: (file) => /^.+-r\d+c\d+\.png$/.test(file), width: 256, height: 256, label: 'sprite cell' },
  { test: (file) => file === 'ui-title-emblem.png' || file === 'ui-menu-panel.png', width: 256, height: 256, label: 'menu ui art' },
  { test: (file) => file.startsWith('icon-') || file.startsWith('ui-'), width: 512, height: 512, label: 'ui art' },
  { test: () => true, width: 384, height: 384, label: 'gameplay cutout' },
];

function targetFor(file) {
  return TARGETS.find((target) => target.test(file));
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function resize(png, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / png.width, maxHeight / png.height);
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  if (width === png.width && height === png.height) return png;

  const out = new PNG({ width, height });
  const sx = png.width / width;
  const sy = png.height / height;
  for (let y = 0; y < height; y += 1) {
    const fy = Math.min((y + 0.5) * sy - 0.5, png.height - 1);
    const y0 = Math.max(Math.floor(fy), 0);
    const y1 = Math.min(y0 + 1, png.height - 1);
    const wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.min((x + 0.5) * sx - 0.5, png.width - 1);
      const x0 = Math.max(Math.floor(fx), 0);
      const x1 = Math.min(x0 + 1, png.width - 1);
      const wx = fx - x0;
      const outIdx = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        const p00 = png.data[((png.width * y0 + x0) << 2) + c];
        const p10 = png.data[((png.width * y0 + x1) << 2) + c];
        const p01 = png.data[((png.width * y1 + x0) << 2) + c];
        const p11 = png.data[((png.width * y1 + x1) << 2) + c];
        out.data[outIdx + c] = Math.round(
          p00 * (1 - wx) * (1 - wy) +
            p10 * wx * (1 - wy) +
            p01 * (1 - wx) * wy +
            p11 * wx * wy,
        );
      }
    }
  }
  return out;
}

function isOpaque(png) {
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i] !== 255) return false;
  }
  return true;
}

function writePng(png, file) {
  const options = isOpaque(png) ? { colorType: 2, zlib: { level: 9 } } : { zlib: { level: 9 } };
  fs.writeFileSync(file, PNG.sync.write(png, options));
}

function maybeRefreshFullCopy(processedPath, fullPath) {
  if (!fs.existsSync(fullPath) || REFRESH_FULL) {
    fs.copyFileSync(processedPath, fullPath);
  }
}

fs.mkdirSync(FULL_DIR, { recursive: true });

const rows = [];
for (const file of fs.readdirSync(PROCESSED_DIR).filter((entry) => entry.endsWith('.png')).sort()) {
  const target = targetFor(file);
  const processedPath = path.join(PROCESSED_DIR, file);
  const fullPath = path.join(FULL_DIR, file);
  maybeRefreshFullCopy(processedPath, fullPath);

  const source = readPng(fullPath);
  const optimized = resize(source, target.width, target.height);
  writePng(optimized, processedPath);
  const beforeBytes = fs.statSync(fullPath).size;
  const afterBytes = fs.statSync(processedPath).size;
  if (afterBytes > MAX_BYTES) {
    throw new Error(`${file} is ${Math.round(afterBytes / 1024)}KB after ${target.label}; budget is 600KB`);
  }
  rows.push({
    file,
    class: target.label,
    beforeBytes,
    afterBytes,
    before: `${source.width}x${source.height}`,
    after: `${optimized.width}x${optimized.height}`,
  });
}

for (const row of rows) {
  const saved = row.beforeBytes - row.afterBytes;
  console.log(
    `${row.file}\t${row.class}\t${row.before}->${row.after}\t${Math.round(row.beforeBytes / 1024)}KB->${Math.round(
      row.afterBytes / 1024,
    )}KB\t-${Math.round(saved / 1024)}KB`,
  );
}
