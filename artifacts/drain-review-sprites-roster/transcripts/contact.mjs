// Eyes-on contact sheets: main cell (top row) beside the merged cell (bottom row), per family.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import sharp from '/Users/robin/Claude/Projects/Gold Rush/node_modules/sharp/lib/index.js';

const MERGED = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites';
const CONTROL = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites-control';
const OUT = `${MERGED}/artifacts/drain-review-sprites-roster`;
mkdirSync(OUT, { recursive: true });

const TILE = 224;
const LABEL = 26;

function svgLabel(text, w) {
  return Buffer.from(`<svg width="${w}" height="${LABEL}"><rect width="${w}" height="${LABEL}" fill="#101014"/><text x="4" y="18" font-family="Helvetica,Arial" font-size="13" fill="#f0e6d2">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`);
}

async function tile(path) {
  if (!existsSync(path)) {
    return sharp({ create: { width: TILE, height: TILE, channels: 4, background: { r: 40, g: 20, b: 20, alpha: 1 } } }).png().toBuffer();
  }
  // checkerboard ground so alpha/fringe is visible
  const checks = Buffer.from(`<svg width="${TILE}" height="${TILE}">${
    Array.from({ length: Math.ceil(TILE / 16) * Math.ceil(TILE / 16) }, (_, k) => {
      const cx = k % Math.ceil(TILE / 16), cy = Math.floor(k / Math.ceil(TILE / 16));
      const fill = (cx + cy) % 2 ? '#6a6a72' : '#4a4a52';
      return `<rect x="${cx * 16}" y="${cy * 16}" width="16" height="16" fill="${fill}"/>`;
    }).join('')}</svg>`);
  const art = await sharp(path).resize(TILE, TILE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'nearest' }).png().toBuffer();
  return sharp(checks).composite([{ input: art }]).png().toBuffer();
}

async function sheet(name, columns) {
  // columns: [{ label, main, merged }]
  const width = columns.length * TILE;
  const height = LABEL * 2 + TILE * 2 + LABEL;
  const layers = [];
  layers.push({ input: svgLabel(`${name}  —  row 1 = main (27227acdc), row 2 = merged (Astra)`, width), top: 0, left: 0 });
  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    layers.push({ input: svgLabel(c.label, TILE), top: LABEL, left: i * TILE });
    layers.push({ input: await tile(`${CONTROL}/${c.path}`), top: LABEL * 2, left: i * TILE });
    layers.push({ input: await tile(`${MERGED}/${c.path}`), top: LABEL * 2 + TILE, left: i * TILE });
  }
  layers.push({ input: svgLabel(columns.map((c) => c.path.split('/').pop()).join('   '), width), top: LABEL * 2 + TILE * 2, left: 0 });
  const buf = await sharp({ create: { width, height, channels: 4, background: { r: 16, g: 16, b: 20, alpha: 1 } } })
    .composite(layers).png().toBuffer();
  writeFileSync(`${OUT}/contact-${name}.png`, buf);
  console.log(`wrote contact-${name}.png  ${width}x${height}`);
}

const P = (p, label) => ({ path: `assets/processed/${p}`, label: label ?? p.replace(/\.png$/, '') });

await sheet('elder-walk8', [
  P('char-elder-sheet-walk8-r0c0.png', 'elder r0c0'),
  P('char-elder-sheet-walk8-r0c4.png', 'elder r0c4'),
  P('char-elder-sheet-walk8-r1c0.png', 'elder r1c0'),
  P('char-elder-sheet-walk8-r2c0.png', 'elder r2c0'),
  P('char-elder-sheet-walk8-r3c0.png', 'elder r3c0'),
  P('char-elder-sheet-walk8-r3c4.png', 'elder r3c4'),
  P('townsfolk-elder.png', 'elder portrait'),
  P('char-elder-idle-r0c0.png', 'elder idle NEW'),
]);

await sheet('hero-and-baron', [
  P('char-hero-sheet-walk8-r0c0.png', 'hero walk8'),
  P('char-hero-sheet-walkdiag8-r0c0.png', 'hero diag8'),
  P('char-hero-sheet-work8-r0c0.png', 'hero work8'),
  P('char-hero-sheet-attack8-r0c0.png', 'hero attack8'),
  P('char-baron-sheet-walk8-r0c0.png', 'baron walk8'),
  P('char-baron-sheet-walkdiag8-r0c0.png', 'baron diag8'),
  P('char-baron-sheet-walk4-a-r0c0.png', 'baron walk4-a'),
  P('char-baron-walk4-diagonal-v2-r0c0.png', 'baron diag-v2 NEW'),
]);

await sheet('town-cast-walk8', [
  P('char-storekeeper-sheet-walk8-r0c0.png', 'storekeeper'),
  P('char-tavernkeeper-sheet-walk8-r0c0.png', 'tavernkeeper'),
  P('char-youngster-f-sheet-walk8-r0c0.png', 'youngster-f'),
  P('char-youngster-m-sheet-walk8-r0c0.png', 'youngster-m'),
  P('char-newsie-mei-sheet-walk8-r0c0.png', 'newsie-mei'),
  P('char-schoolteacher-sheet-walk8-a-r2c0.png', 'teacher r2c0'),
  P('char-preacher-sheet-walk8-a-r0c0.png', 'preacher'),
  P('char-assay-clerk-sheet-walk8-a-r2c0.png', 'clerk r2c0'),
]);

await sheet('hero-ages-and-others', [
  P('char-hero-elder-sheet-walk4-a-r0c0.png', 'hero-elder a'),
  P('char-hero-elder-sheet-walk4-b-r0c0.png', 'hero-elder b'),
  P('char-hero-silver-sheet-walk4-a-r0c0.png', 'hero-silver a'),
  P('char-hero-midlife-sheet-walk4-a-r0c0.png', 'hero-midlife a'),
  P('char-prospector-sheet-hover8-r0c0.png', 'prospector'),
  P('char-railtough-sheet-walkdiag4-a-r0c0.png', 'railtough'),
  P('char-bandit-base-sheet-walk8-r0c0.png', 'bandit-base'),
  P('char-bandit-thief-sheet-walk8-r0c0.png', 'bandit-thief'),
]);

await sheet('new-town-idles', [
  P('char-assay-clerk-idle-r0c0.png', 'clerk idle'),
  P('char-newsie-mei-idle-r0c0.png', 'newsie idle'),
  P('char-preacher-idle-r0c0.png', 'preacher idle'),
  P('char-schoolteacher-idle-r0c0.png', 'teacher idle'),
  P('char-storekeeper-idle-r0c0.png', 'storekeeper idle'),
  P('char-tavernkeeper-idle-r0c0.png', 'tavernkeeper idle'),
  P('char-elder-idle-r0c0.png', 'elder idle'),
  P('char-thief-se-f0-r0c0.png', 'thief-se f0 NEW'),
]);

await sheet('enemies-e6-e9', [
  P('char-e6-glowjack-sheet-walk8-r0c0.png', 'glowjack'),
  P('char-e6-feral_toaster-sheet-walk8-r0c0.png', 'feral toaster'),
  P('char-e6-lawn_shepherd-sheet-walk8-r0c0.png', 'lawn shepherd'),
  P('char-e7-data_rustler-sheet-walk8-r0c0.png', 'data rustler'),
  P('char-e7-rogue_automaton-sheet-walk8-r0c0.png', 'rogue automaton'),
  P('char-e8-scrap_corsair-sheet-walk8-r0c0.png', 'scrap corsair'),
  P('char-e8-sun_glare_shambler-sheet-walk8-r0c0.png', 'shambler'),
  P('char-e9-feral_terraformer-sheet-walk8-r0c0.png', 'terraformer'),
]);

await sheet('portraits-reencoded', [
  P('townsfolk-youngster-b.png', 'youngster-b +113k'),
  P('townsfolk-clerk-e2.png', 'clerk-e2 +50k'),
  P('townsfolk-old-digger.png', 'old-digger +50k'),
  P('char-prospector-portrait.png', 'prospector portrait'),
  P('boss-railcar-intact.png', 'railcar intact'),
  P('townsfolk-preacher.png', 'preacher portrait'),
  P('townsfolk-storekeeper.png', 'storekeeper portrait'),
  P('townsfolk-newsie-e1.png', 'newsie-e1 NEW'),
]);
