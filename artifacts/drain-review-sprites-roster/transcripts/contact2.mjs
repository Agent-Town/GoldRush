import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import sharp from '/Users/robin/Claude/Projects/Gold Rush/node_modules/sharp/lib/index.js';

const MERGED = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites';
const CONTROL = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites-control';
const OUT = `${MERGED}/artifacts/drain-review-sprites-roster`;
mkdirSync(OUT, { recursive: true });
const TILE = 288, LABEL = 26;
const svgLabel = (t, w) => Buffer.from(`<svg width="${w}" height="${LABEL}"><rect width="${w}" height="${LABEL}" fill="#101014"/><text x="4" y="18" font-family="Helvetica,Arial" font-size="13" fill="#f0e6d2">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`);
async function tile(p) {
  if (!existsSync(p)) return sharp({ create: { width: TILE, height: TILE, channels: 4, background: { r: 40, g: 20, b: 20, alpha: 1 } } }).png().toBuffer();
  const n = Math.ceil(TILE / 16);
  const checks = Buffer.from(`<svg width="${TILE}" height="${TILE}">${Array.from({ length: n * n }, (_, k) => { const cx = k % n, cy = Math.floor(k / n); return `<rect x="${cx * 16}" y="${cy * 16}" width="16" height="16" fill="${(cx + cy) % 2 ? '#6a6a72' : '#4a4a52'}"/>`; }).join('')}</svg>`);
  const art = await sharp(p).resize(TILE, TILE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'nearest' }).png().toBuffer();
  return sharp(checks).composite([{ input: art }]).png().toBuffer();
}
async function sheet(name, cols) {
  const width = cols.length * TILE, height = LABEL * 2 + TILE * 2;
  const layers = [{ input: svgLabel(`${name}  —  row 1 = main (403c996cd), row 2 = merged (Astra)`, width), top: 0, left: 0 }];
  for (let i = 0; i < cols.length; i++) {
    layers.push({ input: svgLabel(cols[i].label, TILE), top: LABEL, left: i * TILE });
    layers.push({ input: await tile(`${CONTROL}/${cols[i].path}`), top: LABEL * 2, left: i * TILE });
    layers.push({ input: await tile(`${MERGED}/${cols[i].path}`), top: LABEL * 2 + TILE, left: i * TILE });
  }
  writeFileSync(`${OUT}/contact-${name}.png`, await sharp({ create: { width, height, channels: 4, background: { r: 16, g: 16, b: 20, alpha: 1 } } }).composite(layers).png().toBuffer());
  console.log(`wrote contact-${name}.png ${width}x${height}`);
}
const P = (p, l) => ({ path: `assets/processed/${p}`, label: l });

await sheet('hero-elder-yellow', [
  P('char-hero-elder-sheet-walk4-a-r0c0.png', 'elder a r0c0'),
  P('char-hero-elder-sheet-walk4-a-r1c0.png', 'elder a r1c0'),
  P('char-hero-elder-sheet-walk4-a-r2c0.png', 'elder a r2c0'),
  P('char-hero-elder-sheet-walk4-a-r3c0.png', 'elder a r3c0'),
  P('char-hero-elder-sheet-walk4-b-r0c0.png', 'elder b r0c0'),
  P('char-hero-silver-sheet-walk4-a-r0c0.png', 'silver a r0c0'),
]);

await sheet('schoolteacher-rows', [
  P('char-schoolteacher-sheet-walk8-a-r0c0.png', 'teacher r0c0'),
  P('char-schoolteacher-sheet-walk8-a-r1c0.png', 'teacher r1c0'),
  P('char-schoolteacher-sheet-walk8-a-r2c0.png', 'teacher r2c0 REPL'),
  P('char-schoolteacher-sheet-walk8-a-r3c0.png', 'teacher r3c0 REPL'),
  P('char-assay-clerk-sheet-walk8-a-r1c0.png', 'clerk r1c0'),
  P('char-assay-clerk-sheet-walk8-a-r2c0.png', 'clerk r2c0 REPL'),
]);

await sheet('prospector-rows', [
  P('char-prospector-sheet-hover8-r0c0.png', 'prospector r0c0'),
  P('char-prospector-sheet-hover8-r1c0.png', 'r1c0 REPL'),
  P('char-prospector-sheet-hover8-r2c0.png', 'r2c0 REPL'),
  P('char-prospector-gilded-sheet-hover8-r1c0.png', 'gilded r1c0'),
  P('char-prospector-complainant-sheet-hover8-r1c0.png', 'complainant r1c0'),
  P('char-hero-sheet-work8-r2c0.png', 'hero work8 r2c0'),
]);
