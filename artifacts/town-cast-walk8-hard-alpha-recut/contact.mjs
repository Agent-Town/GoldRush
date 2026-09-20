#!/usr/bin/env node
// Contact sheets: row 1 main · row 2 branch (sol/code-review-20260908) · row 3 the hard-alpha re-cut
// · row 4 |main - re-cut| at 6x amplification. Mid-grey ground so alpha reads.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import sharp from 'sharp';
const S = process.env.SCRATCH;
const OUT = 'artifacts/town-cast-walk8-hard-alpha-recut';
const TILE = 128, GROUND = 96;
const fams = process.argv.slice(2);
const composite = async (file, ground) => {
  const png = PNG.sync.read(fs.readFileSync(file));
  const out = Buffer.alloc(png.width * png.height * 3);
  for (let i = 0; i < png.width * png.height; i++) {
    const o = i << 2, a = png.data[o + 3] / 255;
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(png.data[o + c] * a + ground * (1 - a));
  }
  return sharp(out, { raw: { width: png.width, height: png.height, channels: 3 } })
    .resize(TILE, TILE, { kernel: 'lanczos3' }).raw().toBuffer();
};
const diffTile = async (a, b) => {
  const pa = PNG.sync.read(fs.readFileSync(a)), pb = PNG.sync.read(fs.readFileSync(b));
  const out = Buffer.alloc(pa.width * pa.height * 3);
  for (let i = 0; i < pa.width * pa.height; i++) {
    const o = i << 2;
    const aa = pa.data[o + 3] / 255, ab = pb.data[o + 3] / 255;
    for (let c = 0; c < 3; c++) {
      const va = pa.data[o + c] * aa, vb = pb.data[o + c] * ab;
      out[i * 3 + c] = Math.min(255, Math.abs(va - vb) * 6);
    }
  }
  return sharp(out, { raw: { width: pa.width, height: pa.height, channels: 3 } })
    .resize(TILE, TILE, { kernel: 'lanczos3' }).raw().toBuffer();
};
for (const fam of fams) {
  const re = new RegExp(`^${fam}-r\\d+c\\d+\\.png$`);
  const all = fs.readdirSync('assets/processed').filter((f) => re.test(f)).sort();
  const rows = [...new Set(all.map((f) => f.match(/-r(\d+)c/)[1]))];
  const picks = [];
  for (const r of rows) { const inRow = all.filter((f) => f.includes(`-r${r}c`)); for (const c of [0, 2, 4, 6]) if (inRow[c]) picks.push(inRow[c]); }
  const cols = picks.length;
  const W = cols * TILE, H = 4 * TILE;
  const canvas = Buffer.alloc(W * H * 3, GROUND);
  const put = (tile, col, row) => {
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const src = (y * TILE + x) * 3, dst = ((row * TILE + y) * W + col * TILE + x) * 3;
      canvas[dst] = tile[src]; canvas[dst + 1] = tile[src + 1]; canvas[dst + 2] = tile[src + 2];
    }
  };
  for (let i = 0; i < cols; i++) {
    const cell = picks[i];
    put(await composite('assets/processed/' + cell, GROUND), i, 0);
    put(await composite(S + '/branchcells/' + cell, GROUND), i, 1);
    put(await composite(S + '/recut/' + cell, GROUND), i, 2);
    put(await diffTile('assets/processed/' + cell, S + '/recut/' + cell), i, 3);
  }
  const file = path.join(OUT, `contact-${fam}.png`);
  await sharp(canvas, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 9 }).toFile(file);
  console.log(`${file}  ${W}x${H}  cols=${cols}  rows: main / branch / re-cut / |diff|x6`);
}
