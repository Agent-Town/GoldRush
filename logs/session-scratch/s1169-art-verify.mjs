// s1169 ART drain — INDEPENDENT verification of the art-e9-town-icons attempt-2 report.
// Shares no code with the runner's instrument: written from the definition in the task master
// ("mean R-B over the top-left and top-right 60x60 corners"), decoded via sharp.
//
// INSTRUMENT CONTROL RUNS FIRST: if the six pinned E1 portraits do not reproduce their known
// answers, this instrument is wrong and its verdict on the new art is worthless.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const CORNER = 60;

async function cornerStat(file) {
  const img = sharp(file);
  const { width, height, channels } = await img.metadata();
  const raw = await img.raw().toBuffer();
  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return raw[i] - raw[i + 2]; // R - B
  };
  const mean = (x0) => {
    let s = 0;
    for (let y = 0; y < CORNER; y += 1) for (let x = x0; x < x0 + CORNER; x += 1) s += px(x, y);
    return s / (CORNER * CORNER);
  };
  const TL = mean(0);
  const TR = mean(width - CORNER);
  return { width, height, channels, TL, TR, mean: (TL + TR) / 2 };
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

const CONTROL = [
  ['assets/raw/tf-assay-clerk.png', 137.82],
  ['assets/raw/tf-elder-rowan.png', 133.95],
  ['assets/raw/tf-mei.png', 105.34],
  ['assets/raw/tf-preacher.png', 124.50],
  ['assets/raw/tf-schoolteacher.png', 140.41],
  ['assets/raw/tf-storekeeper.png', 143.86],
];

const SUBJECTS = [
  ['assets/raw/tf-canal-reeve-e9.png', 134.72, '9647a9ae1dbf062e9dc7c1b005f8784bb58d326e38ceed22db489085285f2740'],
  ['assets/raw/tf-ice-quarry-chief-e9.png', 139.69, '77f8b3e228ea6a0f47a850fc7e94561c008f20e3a5c279e89efd2915a18736c6'],
  ['assets/raw/tf-greenkeeper-e9.png', 130.38, '640ed2e5c3dda15a677803b60d64a6d84f772d0de39b6a64f2e9ec250f1855b7'],
  ['assets/raw/tf-weather-warden-e9.png', 137.14, 'e5f54070797b539b4c44f24ced0f52a5d8e38cf252cfbcdde6443ee031df12cd'],
  ['assets/raw/tf-moon-born-child-e9.png', 142.06, 'ceddfbaf74ed8b4be703937d44768bba86ba6d75f9779026237d533a65668d55'],
];

console.log('=== INSTRUMENT CONTROL (six pinned E1 portraits) ===');
let controlOk = true;
for (const [f, pinned] of CONTROL) {
  const s = await cornerStat(f);
  const d = Math.abs(s.mean - pinned);
  const ok = d <= 1.0;
  if (!ok) controlOk = false;
  console.log(`${f.padEnd(38)} TL ${s.TL.toFixed(2).padStart(7)}  TR ${s.TR.toFixed(2).padStart(7)}  mean ${s.mean.toFixed(2).padStart(7)}  pinned ${String(pinned).padStart(7)}  d=${d.toFixed(3)} ${ok ? 'OK' : 'MISMATCH'}`);
}
console.log(controlOk ? 'CONTROL PASS — instrument reproduces all six pinned answers within 1.0\n'
                      : 'CONTROL FAIL — instrument is wrong, verdicts below are void\n');

console.log('=== SUBJECTS (five delivered E9 portraits) ===');
for (const [f, reported, srcHash] of SUBJECTS) {
  const s = await cornerStat(f);
  const h = await sha256(f);
  const d = Math.abs(s.mean - reported);
  const band = s.mean >= 124 && s.mean <= 145;
  const floor = s.TL >= 120 && s.TR >= 120;
  console.log(`${f.split('/').pop().padEnd(30)} ${s.width}x${s.height}/${s.channels}ch  TL ${s.TL.toFixed(2)}  TR ${s.TR.toFixed(2)}  mean ${s.mean.toFixed(2)}  (report ${reported}, d=${d.toFixed(3)})  band124-145=${band}  floor120=${floor}  sha_matches_native=${h === srcHash}`);
}
