#!/usr/bin/env node
// THE FAR GROUND CONTACT SHEETS — one PNG per map per viewport: before on top, after below, one
// column per pose, so keep-or-revert is a glance rather than a table.
//   node scripts/beauty-far-ground-sheet.mjs
// Composes reviews/shots-beauty-far-ground/{before,after}/<map>-<viewport>-<pose>.png.
// Adapted from scripts/beauty-atmos-board.mjs (its label/composite grammar).
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('reviews/shots-beauty-far-ground');
const OUT = path.join(ROOT, 'board');
const POSES = ['boot', 'fresh-eye', 'centre', 'push', 'far-half', 'far-edge'];
const POSE_CAPTION = {
  boot: 'boot — apron 0.00% of frame',
  'fresh-eye': 'fresh-eye z+8.65 — 0.00%',
  centre: 'centre z0 — 0.00%',
  push: 'push z-10 — apron ~8%',
  'far-half': 'far half z-22 — apron ~33%',
  'far-edge': 'far edge z-30 — apron ~55%',
};
const SCALE = 0.42;
const LABEL_H = 30;
const GAP = 6;

function labelSvg(width, text, tint = '#241a10') {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return Buffer.from(
    `<svg width="${width}" height="${LABEL_H}"><rect width="100%" height="100%" fill="${tint}"/>` +
      `<text x="10" y="20" font-family="Georgia,serif" font-size="15" fill="#f0dcb4">${safe}</text></svg>`,
  );
}

const files = await readdir(path.join(ROOT, 'after')).catch(() => []);
const keys = new Set();
for (const file of files) {
  const match = /^(.+)-(desktop-chrome|mobile-chrome)-(.+)\.png$/.exec(file);
  if (match && POSES.includes(match[3])) keys.add(`${match[1]}|${match[2]}`);
}

await mkdir(OUT, { recursive: true });
const written = [];
for (const key of [...keys].sort()) {
  const [map, viewport] = key.split('|');
  const columns = [];
  for (const pose of POSES) {
    const tiles = [];
    for (const [arm, tint] of [['before', '#2b1c10'], ['after', '#123024']]) {
      const file = path.join(ROOT, arm, `${map}-${viewport}-${pose}.png`);
      const image = sharp(file);
      const meta = await image.metadata().catch(() => null);
      if (!meta) { tiles.length = 0; break; }
      const w = Math.round(meta.width * SCALE);
      const h = Math.round(meta.height * SCALE);
      const body = await image.resize(w, h).png().toBuffer();
      const caption = arm === 'before' ? `BEFORE · ${POSE_CAPTION[pose] ?? pose}` : `AFTER  · ${map} ${viewport}`;
      tiles.push(await sharp({ create: { width: w, height: h + LABEL_H, channels: 3, background: tint } })
        .composite([{ input: labelSvg(w, caption, tint), top: 0, left: 0 }, { input: body, top: LABEL_H, left: 0 }])
        .png().toBuffer());
      columns.width = w;
      columns.height = h + LABEL_H;
    }
    if (tiles.length === 2) columns.push(tiles);
  }
  if (!columns.length) continue;
  const tw = columns.width;
  const th = columns.height;
  const sheet = await sharp({
    create: { width: tw * columns.length + GAP * (columns.length + 1), height: th * 2 + GAP * 3, channels: 3, background: '#0d0906' },
  })
    .composite(columns.flatMap((pair, index) => pair.map((buffer, row) => ({
      input: buffer,
      left: GAP + index * (tw + GAP),
      top: GAP + row * (th + GAP),
    }))))
    .png({ compressionLevel: 9 })
    .toBuffer();
  const out = path.join(OUT, `${map}-${viewport}.png`);
  await writeFile(out, sheet);
  written.push(`${out} (${(sheet.length / 1024).toFixed(0)} kB, ${columns.length} poses)`);
}
console.log(written.length ? written.join('\n') : 'nothing composed — is the after/ arm captured?');
