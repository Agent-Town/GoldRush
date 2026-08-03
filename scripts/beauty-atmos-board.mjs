// THE THREE-SKIES BOARD — one PNG per moment, four columns, so the owner picks in one glance.
// Composes reviews/shots-beauty-atmos/{off,a,b,c}/<shot>.png into a labelled 2x2 contact sheet.
//   node scripts/beauty-atmos-board.mjs
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('reviews/shots-beauty-atmos');
const OUT = path.join(ROOT, 'board');
const COLUMNS = [
  ['off', 'NO FLAG — the town as it ships'],
  ['c', 'c  ONLY AIR — sky ramp, no geometry'],
  ['b', 'b  THE PAINTED RING — run-map grammar'],
  ['a', 'a  THE LAND GOES ON — a lit dune belt'],
];
const SCALE = 0.5;
const LABEL_H = 34;
const GAP = 8;

function labelSvg(width, text) {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return Buffer.from(
    `<svg width="${width}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#241a10"/>` +
      `<text x="12" y="23" font-family="Georgia,serif" font-size="17" fill="#f0dcb4">${safe}</text></svg>`,
  );
}

const shots = new Set();
for (const [variant] of COLUMNS) {
  for (const file of await readdir(path.join(ROOT, variant)).catch(() => [])) {
    if (file.endsWith('.png')) shots.add(file.replace(/\.png$/, ''));
  }
}

await mkdir(OUT, { recursive: true });
const written = [];
for (const shot of [...shots].sort()) {
  const tiles = [];
  for (const [variant, caption] of COLUMNS) {
    const file = path.join(ROOT, variant, `${shot}.png`);
    const image = sharp(file);
    const meta = await image.metadata().catch(() => null);
    if (!meta) continue;
    const w = Math.round(meta.width * SCALE);
    const h = Math.round(meta.height * SCALE);
    const body = await image.resize(w, h).png().toBuffer();
    const tile = await sharp({ create: { width: w, height: h + LABEL_H, channels: 3, background: '#241a10' } })
      .composite([{ input: labelSvg(w, caption), top: 0, left: 0 }, { input: body, top: LABEL_H, left: 0 }])
      .png()
      .toBuffer();
    tiles.push({ buffer: tile, width: w, height: h + LABEL_H });
  }
  if (tiles.length !== COLUMNS.length) continue;
  const tw = tiles[0].width;
  const th = tiles[0].height;
  const sheet = await sharp({
    create: { width: tw * 2 + GAP * 3, height: th * 2 + GAP * 3, channels: 3, background: '#120c07' },
  })
    .composite(tiles.map((tile, index) => ({
      input: tile.buffer,
      left: GAP + (index % 2) * (tw + GAP),
      top: GAP + Math.floor(index / 2) * (th + GAP),
    })))
    .png({ compressionLevel: 9 })
    .toBuffer();
  const out = path.join(OUT, `${shot}.png`);
  await writeFile(out, sheet);
  written.push(`${out} (${(sheet.length / 1024).toFixed(0)} kB)`);
}
console.log(written.join('\n'));
