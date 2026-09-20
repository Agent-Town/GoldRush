// s1155 — re-derive F-1154-3 independently.
// Method: split a 3x2 contact sheet into 6 cells, resize each candidate raw to the
// cell size, compute mean-absolute per-channel difference for ALL 36 pairings.
// CONTROL FIRST: run on the E6 sheet, whose ordering is independently known-correct
// (row 61, verified cell-by-cell). If the instrument recovers E6's own raw-list order
// with an unambiguous gap, it is trustworthy for the E1 sheet. If it does not, the
// instrument is wrong and E1's answer means nothing.
import sharp from 'sharp';

const COLS = 3, ROWS = 2;

async function cells(sheetPath) {
  const img = sharp(sheetPath);
  const { width, height } = await img.metadata();
  // Cells are SQUARE (the portraits are square and row 61 says "undistorted 418px cells
  // centered on the required square canvas"). Width sets the cell size; when the canvas is
  // taller than ROWS*cell the grid is letterboxed and must be centered, not stretched.
  // Slicing height/ROWS instead cuts padding into every cell and destroys discrimination —
  // that failure is what the E6 control arm caught on the first run of this script.
  const cw = Math.floor(width / COLS), ch = cw;
  const top0 = Math.floor((height - ROWS * ch) / 2);
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const buf = await sharp(sheetPath)
        .extract({ left: c * cw, top: top0 + r * ch, width: cw, height: ch })
        .removeAlpha().raw().toBuffer();
      out.push({ idx: r * COLS + c, buf, cw, ch });
    }
  }
  return { list: out, cw, ch, width, height, top0 };
}

async function rawAt(rawPath, cw, ch) {
  return sharp(rawPath).resize(cw, ch, { fit: 'fill' }).removeAlpha().raw().toBuffer();
}

function mae(a, b) {
  if (a.length !== b.length) throw new Error(`len ${a.length} vs ${b.length}`);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

async function matrix(label, sheetPath, raws) {
  const { list, cw, ch, width, height } = await cells(sheetPath);
  console.log(`\n=== ${label} — ${sheetPath.split('/').pop()} ${width}x${height}, cell ${cw}x${ch} ===`);
  const resized = [];
  for (const r of raws) resized.push(await rawAt(r.path, cw, ch));

  const header = ['cell'].concat(raws.map(r => r.name.padStart(9).slice(0, 9)));
  console.log(header.join(' | '));
  const winners = [];
  for (const cell of list) {
    const row = resized.map(rb => mae(cell.buf, rb));
    const best = row.indexOf(Math.min(...row));
    const sorted = [...row].sort((a, b) => a - b);
    winners.push({ cell: cell.idx, name: raws[best].name, best: sorted[0], runnerUp: sorted[1] });
    console.log(
      String(cell.idx).padStart(4) + ' | ' +
      row.map((v, i) => (i === best ? '*' : ' ') + v.toFixed(1).padStart(8)).join(' | ')
    );
  }
  console.log('\nRecovered order (cell 0..5):');
  for (const w of winners) {
    console.log(`  cell ${w.cell}: ${w.name.padEnd(14)} MAE ${w.best.toFixed(2).padStart(6)}  (runner-up ${w.runnerUp.toFixed(1)}, gap x${(w.runnerUp / w.best).toFixed(1)})`);
  }
  const uniq = new Set(winners.map(w => w.name)).size;
  console.log(`  -> ${winners.map(w => w.name).join(' / ')}`);
  console.log(`  -> distinct winners: ${uniq}/6 ${uniq === 6 ? '(bijective, no cell contested)' : '(NOT bijective — instrument or sheet is ambiguous)'}`);
  return winners;
}

const A = 'assets/raw/';
// E6 raws, in the order row 61's file list states.
const e6 = ['reactor-steward', 'kitchen-chemist', 'appliance-wrangler', 'diner-carhop', 'combine-defector', 'depot-clerk']
  .map(n => ({ name: n, path: `${A}tf-${n}-e6.png` }));
// E1 raws, in the order row 60's FILE LIST states (alphabetical inside the braces).
const e1 = ['assay-clerk', 'elder-rowan', 'mei', 'preacher', 'schoolteacher', 'storekeeper']
  .map(n => ({ name: n, path: `${A}tf-${n}.png` }));

console.log('CONTROL ARM — E6 sheet, order independently known-correct (row 61).');
const gotE6 = await matrix('CONTROL E6', 'assets/contact-sheets/tf-e6-town-sheet.png', e6);
const e6Expected = e6.map(r => r.name);
const e6Ok = gotE6.every((w, i) => w.name === e6Expected[i]);
console.log(`\nCONTROL VERDICT: instrument ${e6Ok ? 'REPRODUCES' : 'FAILS TO REPRODUCE'} E6's known-correct order.`);
if (!e6Ok) {
  console.log('=> Instrument is NOT validated. E1 result below is meaningless. STOP.');
}

console.log('\n\nTREATMENT ARM — E1 sheet, the claim under test.');
const gotE1 = await matrix('TREATMENT E1', 'assets/contact-sheets/tf-e1-portrait-convention-sheet.png', e1);
const rowClaim = e1.map(r => r.name); // row 60: "the master's exact order"
const s1154Claim = ['assay-clerk', 'elder-rowan', 'mei', 'storekeeper', 'preacher', 'schoolteacher'];
const got = gotE1.map(w => w.name);
console.log(`\nrow-60 file-list order : ${rowClaim.join(' / ')}`);
console.log(`s1154 F-1154-3 claim   : ${s1154Claim.join(' / ')}`);
console.log(`s1155 measured         : ${got.join(' / ')}`);
console.log(`\nmatches row-60 file list : ${got.every((n, i) => n === rowClaim[i])}`);
console.log(`matches s1154's claim    : ${got.every((n, i) => n === s1154Claim[i])}`);
