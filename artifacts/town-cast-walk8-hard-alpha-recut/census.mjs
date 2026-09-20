#!/usr/bin/env node
// Per-family census: bytes, partial-alpha, opaque, figure height, key-under-transparent.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const FAMS = process.argv[2] ? [process.argv[2]] : [
  'char-youngster-m-sheet-walk8','char-youngster-f-sheet-walk8','char-storekeeper-sheet-walk8',
  'char-tavernkeeper-sheet-walk8','char-newsie-mei-sheet-walk8','char-assay-clerk-sheet-walk8-a',
  'char-schoolteacher-sheet-walk8-a','char-preacher-sheet-walk8-a','char-elder-sheet-walk8',
  'char-hero-sheet-walk8',
];
const MAIN = 'assets/processed';
const BRANCH = process.env.BRANCH_DIR;

function cellStats(buf) {
  const p = PNG.sync.read(buf);
  const n = p.width * p.height;
  let partial = 0, opaque = 0, transparent = 0, minY = p.height, maxY = -1, minX = p.width, maxX = -1;
  let violet = 0, keyUnderTransparent = 0, nonzeroRgbUnderTransparent = 0;
  let ringSum = 0;
  for (let i = 0; i < n; i++) {
    const o = i << 2, a = p.data[o + 3];
    const x = i % p.width, y = (i / p.width) | 0;
    if (a === 0) {
      transparent++;
      const r = p.data[o], g = p.data[o+1], b = p.data[o+2];
      if (r || g || b) nonzeroRgbUnderTransparent++;
      if ((r === 255 && g === 0 && b === 255) || (r === 138 && g === 138 && b === 138)) keyUnderTransparent++;
    } else {
      if (a === 255) opaque++; else partial++;
      if (a >= 128) { if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x; }
      if (a >= 16) { const r = p.data[o], g = p.data[o+1], b = p.data[o+2]; if (r - g >= 40 && b - g >= 40) violet++; }
    }
  }
  return { w: p.width, h: p.height, partial, opaque, transparent, violet, keyUnderTransparent,
    nonzeroRgbUnderTransparent, height: maxY >= 0 ? maxY - minY + 1 : 0, top: minY, bottom: maxY };
}

const out = [];
for (const fam of FAMS) {
  const cells = fs.readdirSync(MAIN).filter(f => f.startsWith(fam + '-r') && f.endsWith('.png'))
    .filter(f => new RegExp(`^${fam}-r\\d+c\\d+\\.png$`).test(f)).sort();
  const agg = (dir, resolveName) => {
    let bytes = 0, partial = 0, opaque = 0, violet = 0, kut = 0, nzrgb = 0, maxH = 0, minH = 1e9, missing = 0;
    for (const c of cells) {
      const fp = resolveName(dir, c);
      if (!fs.existsSync(fp)) { missing++; continue; }
      const buf = fs.readFileSync(fp);
      bytes += buf.length;
      const s = cellStats(buf);
      partial += s.partial; opaque += s.opaque; violet += s.violet; kut += s.keyUnderTransparent; nzrgb += s.nonzeroRgbUnderTransparent;
      if (s.height > maxH) maxH = s.height;
      if (s.height && s.height < minH) minH = s.height;
    }
    return { bytes, partial, opaque, violet, keyUnderTransparent: kut, nonzeroRgbUnderTransparent: nzrgb, maxH, minH: minH === 1e9 ? 0 : minH, missing, cells: cells.length };
  };
  const m = agg(MAIN, (d, c) => path.join(d, c));
  const b = BRANCH ? agg(BRANCH, (d, c) => path.join(d, c)) : null;
  out.push({ fam, main: m, branch: b });
}
console.log(JSON.stringify(out, null, 1));
