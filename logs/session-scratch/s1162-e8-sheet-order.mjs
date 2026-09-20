// s1162 drain evidence: re-prove the E8 contact-sheet order with a DIFFERENT resampler
// than the runner used. The run report's 0.00 true-pairing MAE is near-tautological —
// the sheet is a Lanczos3 composite of the same raws, so re-slicing it with Lanczos3
// MUST return the same bytes. `nearest` is a genuinely independent instrument: it can
// disagree. Positive control = all 12 wrong pairings.
import sharp from 'sharp';

const SHEET = 'assets/contact-sheets/tf-e8-town-sheet.png';
const RAWS = [
  ['launch master', 'assets/raw/tf-launch-master-e8.png'],
  ['dome gardener', 'assets/raw/tf-dome-gardener-e8.png'],
  ['suit fitter', 'assets/raw/tf-suit-fitter-e8.png'],
  ['moon-born child', 'assets/raw/tf-moon-born-child-e8.png'],
];

const meta = await sharp(SHEET).metadata();
const CELL = Math.floor(meta.width / 2);
console.log(`sheet ${meta.width}x${meta.height} -> 2x2, cell ${CELL}px, kernel=nearest`);

// row-major: 1=TL 2=TR 3=BL 4=BR
const cells = [];
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 2; c++) {
    cells.push(
      await sharp(SHEET)
        .extract({ left: c * CELL, top: r * CELL, width: CELL, height: CELL })
        .raw().toBuffer(),
    );
  }
}

const raws = [];
for (const [, p] of RAWS) {
  raws.push(await sharp(p).resize(CELL, CELL, { kernel: 'nearest' }).raw().toBuffer());
}

const mae = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
};

const trueP = [], wrongP = [];
console.log('\ncell | ' + RAWS.map(([n]) => n).join(' | '));
for (let i = 0; i < 4; i++) {
  const row = [];
  for (let j = 0; j < 4; j++) {
    const v = mae(cells[i], raws[j]);
    row.push(v.toFixed(2));
    (i === j ? trueP : wrongP).push(v);
  }
  // argmin = which raw this sheet cell actually is
  const best = row.map(Number).indexOf(Math.min(...row.map(Number)));
  console.log(`${i + 1} | ${row.join(' | ')}  -> best=${RAWS[best][0]}${best === i ? ' ✓' : ' ✗MISMATCH'}`);
}

const f = (a) => `${Math.min(...a).toFixed(2)}–${Math.max(...a).toFixed(2)}`;
console.log(`\ntrue pairings : ${f(trueP)}`);
console.log(`wrong controls: ${f(wrongP)}  (n=${wrongP.length})`);
console.log(`separation    : x${(Math.min(...wrongP) / Math.max(...trueP)).toFixed(2)} minimum`);
console.log(`bijective     : ${trueP.every((t) => t < Math.min(...wrongP)) ? 'YES 4/4' : 'NO'}`);
