// s1162 drain evidence: independent warmth measurement.
// BINDING ORDER (s1160/s1161 law): the instrument must reproduce the six pinned E1
// values — including tf-mei's known ~105.3 drift — BEFORE any E8 number is admissible.
// Statistic: mean(R-B) over the TL and TR 60x60 corners, reported SEPARATELY per
// F-1161-2. Gate: flag below 120; accepted observed range 124-145.
import sharp from 'sharp';

const C = 60;
async function warmth(p) {
  const corner = async (left) => {
    const { data, info } = await sharp(p)
      .extract({ left, top: 0, width: C, height: C })
      .raw().toBuffer({ resolveWithObject: true });
    let s = 0;
    const px = C * C;
    for (let i = 0; i < px; i++) s += data[i * info.channels] - data[i * info.channels + 2];
    return s / px;
  };
  const { width } = await sharp(p).metadata();
  const tl = await corner(0);
  const tr = await corner(width - C);
  return { tl, tr, mean: (tl + tr) / 2 };
}

// also report mean channel levels, to test the "+5.5% red calibration" claim
async function channels(p) {
  const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0;
  const px = info.width * info.height;
  for (let i = 0; i < px; i++) { r += data[i * info.channels]; g += data[i * info.channels + 1]; b += data[i * info.channels + 2]; }
  return { r: r / px, g: g / px, b: b / px };
}

const PINNED = {
  'tf-assay-clerk': 137.8, 'tf-elder-rowan': 134.0, 'tf-mei': 105.3,
  'tf-preacher': 124.5, 'tf-schoolteacher': 140.4, 'tf-storekeeper': 143.9,
};

console.log('=== INSTRUMENT CONTROL on E1 (must reproduce, incl. the tf-mei drift) ===');
let maxDrift = 0, flags = [];
for (const [name, expected] of Object.entries(PINNED)) {
  const w = await warmth(`assets/raw/${name}.png`);
  const drift = Math.abs(w.mean - expected);
  maxDrift = Math.max(maxDrift, drift);
  if (w.mean < 120) flags.push(name);
  console.log(`${name.padEnd(20)} TL ${w.tl.toFixed(1).padStart(6)}  TR ${w.tr.toFixed(1).padStart(6)}  mean ${w.mean.toFixed(1).padStart(6)}  expected ${expected}  drift ${drift.toFixed(2)}`);
}
console.log(`\nmax drift ${maxDrift.toFixed(2)} | flagged below 120: [${flags.join(', ')}]`);
const ok = maxDrift <= 0.5 && flags.length === 1 && flags[0] === 'tf-mei';
console.log(ok ? '✅ CONTROL PASSED — E8 numbers are admissible\n' : '❌ CONTROL FAILED — E8 numbers are NOT admissible\n');
if (!ok) process.exit(1);

console.log('=== E8 batch (TL/TR separate per F-1161-2) ===');
const E8 = ['tf-launch-master-e8', 'tf-dome-gardener-e8', 'tf-suit-fitter-e8', 'tf-moon-born-child-e8'];
const claimed = { 'tf-launch-master-e8': [137.3, 132.7], 'tf-dome-gardener-e8': [139.9, 131.0], 'tf-suit-fitter-e8': [134.3, 128.4], 'tf-moon-born-child-e8': [133.6, 135.1] };
for (const n of E8) {
  const w = await warmth(`assets/raw/${n}.png`);
  const [cTL, cTR] = claimed[n];
  const spread = Math.abs(w.tl - w.tr);
  const floorOK = w.tl >= 120 && w.tr >= 120;
  console.log(`${n.padEnd(24)} TL ${w.tl.toFixed(1).padStart(6)} (claim ${cTL}) TR ${w.tr.toFixed(1).padStart(6)} (claim ${cTR}) mean ${w.mean.toFixed(1)} spread ${spread.toFixed(1)} bothCornersOver120=${floorOK}`);
}

console.log('\n=== whole-image channel means (tests the +5.5% red-calibration claim) ===');
for (const n of E8) {
  const c = await channels(`assets/raw/${n}.png`);
  console.log(`${n.padEnd(24)} R ${c.r.toFixed(1)}  G ${c.g.toFixed(1)}  B ${c.b.toFixed(1)}  R/G ${(c.r / c.g).toFixed(3)}`);
}
