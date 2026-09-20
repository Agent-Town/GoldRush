// Contact sheet maker: one row per group, cells left to right, on the town ground colour.
// Also prints the measured figure height (rows with alpha >= 128) of every cell.
// Usage: node artifacts/sprite-roster-remainder/contact.mjs <out.png> <label>=<glob-ish prefix> ...
// A group argument is `label=prefix`; every assets/processed file starting with prefix is a cell.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { PNG } from 'pngjs';

const out = process.argv[2];
const groups = process.argv.slice(3).map((arg) => {
  const [label, prefix] = arg.split('=');
  const dir = path.dirname(prefix.includes('/') ? prefix : `assets/processed/${prefix}`);
  const base = path.basename(prefix);
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(base) && f.endsWith('.png')).sort();
  return { label, files: files.map((f) => path.join(dir, f)) };
});

const CELL = 150;
const PAD = 4;
const cols = Math.max(...groups.map((g) => g.files.length));
const width = cols * (CELL + PAD) + PAD;
const height = groups.length * (CELL + PAD) + PAD;
const composites = [];
const measures = [];

for (const [row, group] of groups.entries()) {
  for (const [col, file] of group.files.entries()) {
    const png = PNG.sync.read(fs.readFileSync(file));
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < png.height; y++) {
      let any = false;
      for (let x = 0; x < png.width; x++) if (png.data[((y * png.width + x) << 2) + 3] >= 128) { any = true; break; }
      if (any) { if (top < 0) top = y; bottom = y; }
    }
    const figure = top < 0 ? 0 : bottom - top + 1;
    measures.push({ group: group.label, file: path.basename(file), w: png.width, h: png.height, figureHeight: figure });
    const buf = await sharp(file).resize({ height: CELL, width: CELL, fit: 'contain', background: { r: 222, g: 213, b: 185, alpha: 1 } }).png().toBuffer();
    composites.push({ input: buf, left: PAD + col * (CELL + PAD), top: PAD + row * (CELL + PAD) });
  }
}

await sharp({ create: { width, height, channels: 3, background: { r: 200, g: 190, b: 165 } } })
  .composite(composites)
  .png()
  .toFile(out);

fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(measures, null, 2) + '\n');
for (const g of groups) {
  const hs = measures.filter((m) => m.group === g.label).map((m) => m.figureHeight);
  console.log(`${g.label.padEnd(40)} n=${String(hs.length).padStart(2)} figure heights ${Math.min(...hs)}-${Math.max(...hs)} (mean ${(hs.reduce((a, b) => a + b, 0) / hs.length).toFixed(1)}) cells ${measures.filter((m) => m.group === g.label)[0]?.w}x${measures.filter((m) => m.group === g.label)[0]?.h}`);
}
console.log('wrote', out);
