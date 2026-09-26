// scripts/launch-video/contact-sheet.mjs: one contact sheet of the kept stills (task launch-video-capture-2).
// The only image the task lets into the repository: one JPEG under 2 MB at
// artifacts/launch-video-capture-2/contact-sheet.jpg. Each cell is a still from ~/.goldrush/launch-video/, scaled to
// fit on parchment (#f5e6c8) with a ledger-ink (#2e1b0e) caption: the beat, the moment, and REAL or STAGED as the
// take's sidecar says. Node only (sharp); no server, no lock.
//
// Usage: node scripts/launch-video/contact-sheet.mjs --stills a.jpg,b.jpg,... [--out artifacts/launch-video-capture-2/contact-sheet.jpg]

import { existsSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values: args } = parseArgs({
  options: {
    stills: { type: 'string' },
    out: { type: 'string', default: 'artifacts/launch-video-capture-2/contact-sheet.jpg' },
    columns: { type: 'string', default: '4' },
  },
});
const OUT_DIR = process.env.GR_LV_OUT ?? path.join(os.homedir(), '.goldrush', 'launch-video');
const names = (args.stills ?? '').split(',').map((name) => name.trim()).filter(Boolean);
if (!names.length) throw new Error('--stills is required');
const columns = Number(args.columns);
const cell = { width: 480, height: 300, caption: 40, gap: 12 };
const rows = Math.ceil(names.length / columns);
const width = columns * cell.width + (columns + 1) * cell.gap;
const height = rows * (cell.height + cell.caption) + (rows + 1) * cell.gap + 56;
const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function captionFor(name) {
  const take = name.replace(/\.(jpg|png)$/, '');
  const match = take.match(/^(B[0-9-]+(?:-B[0-9]+)*)-(.+)-(1280x800|390x844)-(t\d+)-(.+)$/);
  const sidecarName = match ? `${match[1]}-${match[2]}-${match[3]}-${match[4]}.json` : null;
  let staged = false;
  if (sidecarName && existsSync(path.join(OUT_DIR, sidecarName))) staged = Boolean(JSON.parse(readFileSync(path.join(OUT_DIR, sidecarName), 'utf8')).staged);
  const label = match ? `${match[1]} · ${match[2]} · ${match[5]} · ${match[3]}` : take;
  return { label, staged };
}

const composites = [];
for (const [index, name] of names.entries()) {
  const file = path.join(OUT_DIR, name);
  if (!existsSync(file)) throw new Error(`missing still ${file}`);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const left = cell.gap + column * (cell.width + cell.gap);
  const top = 56 + cell.gap + row * (cell.height + cell.caption + cell.gap);
  const image = await sharp(file).resize(cell.width, cell.height, { fit: 'contain', background: '#2e1b0e' }).toBuffer();
  composites.push({ input: image, left, top });
  const { label, staged } = captionFor(name);
  const svg = `<svg width="${cell.width}" height="${cell.caption}" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="17" font-family="Georgia, serif" font-size="14" fill="#2e1b0e">${escape(label)}</text>
    <text x="4" y="34" font-family="Georgia, serif" font-size="13" fill="${staged ? '#a0522d' : '#5b8a8a'}">${staged ? 'STAGED' : 'real play, 1x, plain seed'}</text>
  </svg>`;
  composites.push({ input: Buffer.from(svg), left, top: top + cell.height });
}
const title = `<svg width="${width}" height="56" xmlns="http://www.w3.org/2000/svg">
  <text x="${cell.gap}" y="36" font-family="Georgia, serif" font-size="26" fill="#2e1b0e">WHAT IS A CLAIM? · phase 2 stills (launch-video-capture-2)</text>
</svg>`;
composites.push({ input: Buffer.from(title), left: 0, top: 0 });

let quality = 84;
for (;;) {
  await sharp({ create: { width, height, channels: 3, background: '#f5e6c8' } }).composite(composites).jpeg({ quality, mozjpeg: true }).toFile(args.out);
  const bytes = statSync(args.out).size;
  if (bytes < 2_000_000 || quality <= 50) {
    console.log(`contact sheet: ${args.out} ${width}x${height} ${names.length} stills, ${bytes} bytes at quality ${quality}`);
    if (bytes >= 2_000_000) process.exit(1);
    break;
  }
  quality -= 6;
}
