// Contact sheets for the report: per station, the before crop beside the after crop, cropped to
// the body's own projected column (screenPoint apex..base from checks.json, widened symmetrically).
//
//   node artifacts/open-maps-art-blackout-fairground/compose.mjs <pack> <viewport>
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const pack = process.argv[2] ?? 'blackout-ridge';
const viewport = process.argv[3] ?? 'desktop';
const root = 'artifacts/open-maps-art-blackout-fairground';
const load = (phase) => JSON.parse(readFileSync(`${root}/${phase}/checks.json`, 'utf8'));
const PAD = viewport === 'mobile' ? 110 : 210;
const CELL_H = viewport === 'mobile' ? 300 : 340;

const before = load('before').find((r) => r.boot === 'debug' && r.pack === pack && r.viewport === viewport);
let after = null;
try { after = load('after').find((r) => r.boot === 'debug' && r.pack === pack && r.viewport === viewport); } catch {}

const cells = [];
for (const station of before.stations) {
  const twin = after?.stations.find((s) => s.id === station.id);
  const cx = Math.round(station.apex.x);
  const top = Math.max(0, Math.round(Math.min(station.apex.y, station.base.y)) - 30);
  const crop = { left: Math.max(0, cx - PAD), top, width: PAD * 2, height: CELL_H };
  const cut = async (file) => {
    const image = sharp(file);
    const meta = await image.metadata();
    return image.extract({ left: Math.min(crop.left, meta.width - crop.width), top: Math.min(crop.top, meta.height - crop.height),
      width: Math.min(crop.width, meta.width), height: Math.min(crop.height, meta.height) }).toBuffer();
  };
  const row = [await cut(`${root}/before/${station.file}`)];
  if (twin) row.push(await cut(`${root}/after/${twin.file}`));
  cells.push({ id: station.id, row });
}

const cols = cells[0].row.length;
const W = PAD * 2 * cols + 8 * (cols - 1);
const H = cells.length * (CELL_H + 8) - 8;
const composites = [];
cells.forEach((cell, r) => cell.row.forEach((buffer, c) => {
  composites.push({ input: buffer, left: c * (PAD * 2 + 8), top: r * (CELL_H + 8) });
}));
const out = `${root}/${after ? 'after' : 'before'}/${pack}-contact-${viewport}${after ? '-before-after' : ''}.png`;
await sharp({ create: { width: W, height: H, channels: 3, background: { r: 20, g: 18, b: 16 } } })
  .composite(composites).png().toFile(out);
console.log(out, `${cols} column(s):`, cells.map((c) => c.id).join(' / '));
