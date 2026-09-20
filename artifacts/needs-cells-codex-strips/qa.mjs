// Per-cell QA for the seven rows, run on whatever tree is passed (default the tmp extraction).
import sharp from 'sharp';
import { measureCell } from '../needs-cells-art-batch/measure.mjs';
import { eyeBlob, tealClusters } from '../needs-cells-art-batch/eye-check.mjs';
import { ROWS } from './strips.mjs';

const DIR = process.argv[2] || 'artifacts/needs-cells-codex-strips/tmp';
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];

// Mirror check: lowest foreground-union RGB MAE between any cell pair after flipping one.
async function mirrorMin(files) {
  const bufs = [];
  for (const f of files) {
    const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data: fd } = await sharp(f).flop().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    bufs.push({ data, flipped: fd, w: info.width, h: info.height, ch: info.channels });
  }
  let best = Infinity, pair = null;
  for (let i = 0; i < bufs.length; i += 1) for (let j = 0; j < bufs.length; j += 1) {
    if (i === j) continue;
    const a = bufs[i], b = bufs[j];
    let sum = 0, n = 0;
    for (let p = 0; p < a.w * a.h; p += 1) {
      const ia = p * a.ch, ib = p * b.ch;
      if (a.data[ia + 3] < 128 && b.flipped[ib + 3] < 128) continue;
      sum += Math.abs(a.data[ia] - b.flipped[ib]) + Math.abs(a.data[ia + 1] - b.flipped[ib + 1]) + Math.abs(a.data[ia + 2] - b.flipped[ib + 2]);
      n += 3;
    }
    const mae = n ? sum / n : Infinity;
    if (mae < best) { best = mae; pair = `${i + 1}-${j + 1}`; }
  }
  return { mae: +best.toFixed(2), pair };
}

// Halo residue: alpha<250 pixels carrying magenta-dominant RGB (the key bleeding back under filtering).
async function halo(files) {
  let soft = 0, bad = 0, worst = 0;
  for (const f of files) {
    const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let cellBad = 0;
    for (let p = 0; p < info.width * info.height; p += 1) {
      const i = p * info.channels;
      if (data[i + 3] >= 250) continue;
      soft += 1;
      if (data[i] >= 180 && data[i + 2] >= 180 && data[i + 1] <= 90) { bad += 1; cellBad += 1; }
    }
    if (cellBad > worst) worst = cellBad;
  }
  return { soft, bad, worst };
}

const out = [];
for (const row of ROWS) {
  const files = Q4.map((c) => `${DIR}/${row.stem}-${c}.png`);
  const ms = [];
  for (const f of files) ms.push(await measureCell(f));
  const h = ms.map((m) => m.height);
  const footY = ms.map((m) => m.bbox[3]);
  const mir = await mirrorMin(files);
  const hal = await halo(files);
  const lamp = row.lamp ? await Promise.all(files.map((f) => eyeBlob(f))) : null;
  const teal = row.lamp ? await Promise.all(files.map((f) => tealClusters(f))) : null;
  const r = { id: row.id, stem: row.stem, cell: ms[0].cellH, heights: h, pct: ms.map((m) => m.pctOfCell),
    mean: +(h.reduce((a, b) => a + b) / 4).toFixed(1), spread: Math.max(...h) - Math.min(...h),
    footY, footRange: Math.max(...footY) - Math.min(...footY), band: row.band,
    inBand: h.every((v) => v >= row.band[0] && v <= row.band[1]),
    mirrorMAE: mir.mae, mirrorPair: mir.pair, halo: hal,
    lamp, teal: teal ? teal.map((t) => ({ n: t.length, sides: t.map((x) => `${x.side}:${x.size}`) })) : null };
  out.push(r);
  console.log(`${r.id.padEnd(11)} h=[${h.join(', ')}] mean=${r.mean} spread=${r.spread} inBand=${r.inBand} footY=[${footY.join(',')}] footRange=${r.footRange} mirrorMAE=${r.mirrorMAE}(${r.mirrorPair}) halo=${hal.bad}/${hal.soft}${lamp ? ` lamp=[${lamp.join(', ')}]` : ''}${teal ? ` teal=[${teal.map((t) => t.length).join(',')}] ${JSON.stringify(teal.map((t) => t.map((x) => x.side + x.size)))}` : ''}`);
}
console.log('\nJSON\n' + JSON.stringify(out, null, 1));
