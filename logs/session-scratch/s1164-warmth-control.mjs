// s1164 drain instrument — INDEPENDENT re-implementation of the E7/E8 ground-warmth
// statistic, written from the definition in the run report rather than copied from any
// prior script, so that agreement on the six pinned E1 control raws is evidence.
//
// Statistic: mean of (R - B) over the top-left and top-right 60x60 corners, reported
// per corner (TL and TR separate, per F-1161-2). Gate floor: 120 on BOTH corners.
import sharp from 'sharp';

const CORNER = 60;

async function stats(file) {
  const img = sharp(file);
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const corner = (x0) => {
    let sum = 0;
    let n = 0;
    for (let y = 0; y < CORNER; y += 1) {
      for (let x = x0; x < x0 + CORNER; x += 1) {
        const i = (y * info.width + x) * ch;
        sum += data[i] - data[i + 2];
        n += 1;
      }
    }
    return sum / n;
  };
  const tl = corner(0);
  const tr = corner(info.width - CORNER);

  // purity: alpha, fully-transparent pixels, exact and near magenta (#ff00ff)
  let alphaNon255 = 0;
  let transparent = 0;
  let exactMagenta = 0;
  let nearMagenta = 0;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (ch === 4) {
      const a = data[i + 3];
      if (a !== 255) alphaNon255 += 1;
      if (a === 0) transparent += 1;
    }
    if (r === 255 && g === 0 && b === 255) exactMagenta += 1;
    else if (r > 230 && g < 40 && b > 230) nearMagenta += 1;
  }
  return {
    file: file.split('/').pop(),
    w: info.width,
    h: info.height,
    ch,
    space: meta.space,
    tl: +tl.toFixed(1),
    tr: +tr.toFixed(1),
    mean: +((tl + tr) / 2).toFixed(1),
    spread: +Math.abs(tl - tr).toFixed(1),
    alphaNon255,
    transparent,
    exactMagenta,
    nearMagenta,
  };
}

const CONTROL = {
  'assets/raw/tf-assay-clerk.png': [137.2, 138.5],
  'assets/raw/tf-elder-rowan.png': [137.3, 130.6],
  'assets/raw/tf-mei.png': [106.4, 104.2],
  'assets/raw/tf-preacher.png': [124.1, 124.9],
  'assets/raw/tf-schoolteacher.png': [141.8, 139.1],
  'assets/raw/tf-storekeeper.png': [144.4, 143.3],
};

let maxDrift = 0;
console.log('=== INSTRUMENT CONTROL (six pinned E1 raws) ===');
for (const [f, [eTl, eTr]] of Object.entries(CONTROL)) {
  const s = await stats(f);
  const d = Math.max(Math.abs(s.tl - eTl), Math.abs(s.tr - eTr));
  maxDrift = Math.max(maxDrift, d);
  console.log(
    `${s.file.padEnd(26)} TL ${String(s.tl).padStart(6)} (exp ${eTl})  TR ${String(s.tr).padStart(6)} (exp ${eTr})  drift ${d.toFixed(2)}  ${s.mean < 120 ? 'FLAG<120' : ''}`,
  );
}
console.log(`MAX DRIFT vs pinned expectations: ${maxDrift.toFixed(2)}`);

console.log('\n=== SUBJECT ===');
console.log(JSON.stringify(await stats(process.argv[2]), null, 2));
