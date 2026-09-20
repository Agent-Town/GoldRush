// s1155 — test F-1154-2's RECOMMENDATION before pinning it into the LEDGER convention.
// The recommendation: pin the guard as "mean R-B over the TL+TR 60x60 corners, band 130-145".
// A pin is only safe if it (a) reproduces the one outlier the convention is known to catch
// (tf-mei, row 60's F-1120-1) and (b) does NOT retroactively fail any ACCEPTED portrait.
// If it fails an accepted portrait, the recommendation is wrong and must not be written as law.
import sharp from 'sharp';

const N = 60;

async function corners(p) {
  const { width, height } = await sharp(p).metadata();
  const box = async (left, top) => {
    const b = await sharp(p).extract({ left, top, width: N, height: N }).removeAlpha().raw().toBuffer();
    let r = 0, g = 0, bl = 0;
    for (let i = 0; i < b.length; i += 3) { r += b[i]; g += b[i + 1]; bl += b[i + 2]; }
    const n = b.length / 3;
    return (r / n) - (bl / n);
  };
  const TL = await box(0, 0);
  const TR = await box(width - N, 0);
  const BL = await box(0, height - N);
  const BR = await box(width - N, height - N);
  return { TL, TR, BL, BR, TLTR: (TL + TR) / 2, four: (TL + TR + BL + BR) / 4 };
}

const A = 'assets/raw/';
const e1 = ['assay-clerk', 'elder-rowan', 'mei', 'preacher', 'schoolteacher', 'storekeeper']
  .map(n => ({ name: n, path: `${A}tf-${n}.png`, batch: 'E1' }));
const e6 = ['reactor-steward', 'kitchen-chemist', 'appliance-wrangler', 'diner-carhop', 'combine-defector', 'depot-clerk']
  .map(n => ({ name: n, path: `${A}tf-${n}-e6.png`, batch: 'E6' }));

const LO = 130, HI = 145;
const rows = [];
console.log('portrait                 batch      TL60     TR60   TL+TR    4-corner   spread');
for (const f of [...e1, ...e6]) {
  const c = await corners(f.path);
  rows.push({ ...f, ...c });
  console.log(
    f.name.padEnd(22) + '  ' + f.batch + '  ' +
    c.TL.toFixed(1).padStart(8) + c.TR.toFixed(1).padStart(9) +
    c.TLTR.toFixed(1).padStart(8) + c.four.toFixed(1).padStart(11) +
    Math.abs(c.TL - c.TR).toFixed(1).padStart(9)
  );
}

const inBand = v => v >= LO && v <= HI;
console.log(`\n--- Which portraits does each candidate statistic FAIL against the stated ${LO}-${HI} band? ---`);
for (const stat of ['TL', 'TR', 'TLTR', 'four']) {
  const bad = rows.filter(r => !inBand(r[stat]));
  console.log(`${stat.padEnd(5)}: ${bad.length} fail -> ${bad.map(r => `${r.name}(${r.batch} ${r[stat].toFixed(1)})`).join(', ') || 'none'}`);
}

console.log('\n--- The two properties a pinned statistic MUST have ---');
const mei = rows.find(r => r.name === 'mei');
for (const stat of ['TL', 'TR', 'TLTR', 'four']) {
  const catchesMei = !inBand(mei[stat]);
  // "accepted" = every portrait shipped and never flagged: all of E1 except mei, plus all of E6.
  const accepted = rows.filter(r => r.name !== 'mei');
  const falseFails = accepted.filter(r => !inBand(r[stat]));
  console.log(
    `${stat.padEnd(5)}: catches tf-mei? ${catchesMei ? 'YES' : 'NO '}  (${mei[stat].toFixed(1)})   ` +
    `false-fails on accepted art: ${falseFails.length}` +
    (falseFails.length ? ` -> ${falseFails.map(r => `${r.name} ${r[stat].toFixed(1)}`).join(', ')}` : '')
  );
}
