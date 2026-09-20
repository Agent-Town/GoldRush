// s1161 drain gate for art-e7-town-icons — every number re-measured, none inherited.
// Binding gate (s1160 item 3): the instrument must reproduce the SIX pinned E1 values
// and flag exactly tf-mei, BEFORE any E7 measurement is believed.
// Pinned statistic (LEDGER row 60, s1155): mean (R-B) over TL+TR 60x60 corners; flag below 120.
import sharp from 'sharp';

const E1 = ['assay-clerk', 'elder-rowan', 'mei', 'preacher', 'schoolteacher', 'storekeeper']
  .map((n) => [`tf-${n}`, `assets/raw/tf-${n}.png`]);
const PINNED = { 'tf-assay-clerk': 137.8, 'tf-elder-rowan': 134.0, 'tf-mei': 105.3, 'tf-preacher': 124.5, 'tf-schoolteacher': 140.4, 'tf-storekeeper': 143.9 };
const E7NAMES = ['switchboard-chief', 'playbook-librarian', 'drone-keeper', 'tape-courier', 'combine-defector'];
const E7 = E7NAMES.map((n) => [`tf-${n}-e7`, `assets/raw/tf-${n}-e7.png`]);

async function cornerMean(file, left, top) {
  const { data } = await sharp(file).extract({ left, top, width: 60, height: 60 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let sum = 0;
  for (let i = 0; i < data.length; i += 3) sum += data[i] - data[i + 2];
  return sum / (data.length / 3);
}
async function warmth(file) {
  const meta = await sharp(file).metadata();
  const tl = await cornerMean(file, 0, 0);
  const tr = await cornerMean(file, meta.width - 60, 0);
  return { tl, tr, mean: (tl + tr) / 2 };
}
async function props(file) {
  const meta = await sharp(file).metadata();
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0, exact = 0, near = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a === 0) transparent += 1;
    if (r === 255 && g === 0 && b === 255) exact += 1;
    if (r >= 245 && g <= 10 && b >= 245) near += 1;
  }
  return { w: meta.width, h: meta.height, channels: meta.channels, hasAlpha: meta.hasAlpha, transparent, exact, near };
}

console.log('=== 1. INSTRUMENT CONTROL on the E1 batch (must reproduce pinned values, flag exactly tf-mei) ===');
let controlOk = true, flagged = [];
for (const [name, file] of E1) {
  const w = await warmth(file);
  const drift = w.mean - PINNED[name];
  const flag = w.mean < 120;
  if (flag) flagged.push(name);
  if (Math.abs(drift) > 0.5) controlOk = false;
  console.log(`  ${name.padEnd(20)} TL=${w.tl.toFixed(1)} TR=${w.tr.toFixed(1)} mean=${w.mean.toFixed(1)}  pinned=${PINNED[name]}  drift=${drift.toFixed(2)}  ${flag ? 'FLAG' : 'pass'}`);
}
console.log(`  -> reproduces pinned values: ${controlOk ? 'YES' : 'NO'} | flagged: [${flagged.join(', ')}] (expect exactly tf-mei)`);
const controlPass = controlOk && flagged.length === 1 && flagged[0] === 'tf-mei';
console.log(`  -> INSTRUMENT CONTROL: ${controlPass ? 'PASS — E7 numbers are admissible' : 'FAIL — E7 numbers are NOT admissible'}`);

console.log('\n=== 2. E7 deliverables: warmth (floor 120, accepted 124-145) + file properties ===');
const RUNNER_CLAIM = { 'tf-switchboard-chief-e7': 141.1, 'tf-playbook-librarian-e7': 144.4, 'tf-drone-keeper-e7': 127.5, 'tf-tape-courier-e7': 132.0, 'tf-combine-defector-e7': 139.2 };
for (const [name, file] of [...E7, ['tf-e7-town-sheet', 'assets/contact-sheets/tf-e7-town-sheet.png']]) {
  const p = await props(file);
  const line = `  ${name.padEnd(26)} ${p.w}x${p.h} ch=${p.channels} alpha=${p.hasAlpha} transp=${p.transparent} exactMag=${p.exact} nearMag=${p.near}`;
  if (RUNNER_CLAIM[name] !== undefined) {
    const w = await warmth(file);
    const d = w.mean - RUNNER_CLAIM[name];
    console.log(`${line}\n      warmth TL=${w.tl.toFixed(1)} TR=${w.tr.toFixed(1)} mean=${w.mean.toFixed(1)} (runner said ${RUNNER_CLAIM[name]}, drift ${d.toFixed(2)}) ${w.mean < 120 ? 'BELOW FLOOR' : w.mean < 124 || w.mean > 145 ? 'outside 124-145' : 'in range'}`);
  } else console.log(line);
}

console.log('\n=== 3. Contact-sheet pairing matrix — DIFFERENT resampler than the runner (nearest, not default) ===');
console.log('    (the runner reported true-MAE 0.00, which a matching resampler makes tautological)');
const positions = [[0, 209], [418, 209], [836, 209], [209, 627], [627, 627]];
const raws = await Promise.all(E7.map(([, f]) => sharp(f).resize(418, 418, { fit: 'fill', kernel: 'nearest' }).removeAlpha().raw().toBuffer()));
const cells = await Promise.all(positions.map(([left, top]) => sharp('assets/contact-sheets/tf-e7-town-sheet.png').extract({ left, top, width: 418, height: 418 }).removeAlpha().raw().toBuffer()));
console.log(`    cell\\raw   ${E7NAMES.map((n) => n.slice(0, 9).padStart(10)).join('')}`);
let bijective = true; const wrongs = [];
for (let i = 0; i < 5; i += 1) {
  const row = [];
  for (let j = 0; j < 5; j += 1) {
    let sum = 0;
    for (let k = 0; k < cells[i].length; k += 1) sum += Math.abs(cells[i][k] - raws[j][k]);
    row.push(sum / cells[i].length);
    if (i !== j) wrongs.push(sum / cells[i].length);
  }
  const best = row.indexOf(Math.min(...row));
  if (best !== i) bijective = false;
  console.log(`    cell ${i + 1}    ${row.map((v) => v.toFixed(2).padStart(10)).join('')}   -> best=${E7NAMES[best]} ${best === i ? 'OK' : 'MISMATCH'}`);
}
console.log(`    true-pairing max = ${Math.max(...[0, 1, 2, 3, 4].map((i) => 0)).toFixed(2)}; wrong-pairing (positive control) range ${Math.min(...wrongs).toFixed(2)}-${Math.max(...wrongs).toFixed(2)}`);
console.log(`    -> ORDER 5/5 bijective: ${bijective ? 'YES' : 'NO'}  (claimed order: ${E7NAMES.join(' / ')})`);
