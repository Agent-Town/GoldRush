// Instrument baselines on the LIVE registered rows, so "mirror MAE 50" and "teal 0" can be judged
// against what this family's already-landed art scores rather than against an abstract bar.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { eyeBlob, tealClusters } from '../needs-cells-art-batch/eye-check.mjs';
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const slot = (id) => contract.slots.find((x) => x.slot === id);
const P = 'assets/processed/';
async function mirrorMin(files) {
  const bufs = [];
  for (const f of files) {
    const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data: fd } = await sharp(f).flop().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    bufs.push({ data, flipped: fd, w: info.width, h: info.height, ch: info.channels });
  }
  let best = Infinity;
  for (let i = 0; i < bufs.length; i += 1) for (let j = 0; j < bufs.length; j += 1) {
    if (i === j) continue;
    const a = bufs[i], b = bufs[j]; let sum = 0, n = 0;
    for (let p = 0; p < a.w * a.h; p += 1) {
      const ia = p * a.ch, ib = p * b.ch;
      if (a.data[ia + 3] < 128 && b.flipped[ib + 3] < 128) continue;
      sum += Math.abs(a.data[ia] - b.flipped[ib]) + Math.abs(a.data[ia + 1] - b.flipped[ib + 1]) + Math.abs(a.data[ia + 2] - b.flipped[ib + 2]); n += 3;
    }
    const mae = n ? sum / n : Infinity; if (mae < best) best = mae;
  }
  return +best.toFixed(2);
}
for (const [slotId, withLamp] of [['char.e2.steam_wrecker', true], ['char.claim_jumper', false]]) {
  console.log('##### ' + slotId);
  for (const [dir, d] of Object.entries(slot(slotId).walk4.directions)) {
    const files = d.frames.files.map((f) => P + f);
    const mae = await mirrorMin(files);
    let extra = '';
    if (withLamp) {
      const lamp = await Promise.all(files.map((f) => eyeBlob(f)));
      const teal = await Promise.all(files.map((f) => tealClusters(f)));
      extra = ` lamp=[${lamp.join(',')}] teal=[${teal.map((t) => t.length).join(',')}] tealSides=${JSON.stringify(teal.map((t) => t.map((x) => x.side + x.size)))}`;
    }
    console.log(` ${dir.padEnd(3)} mirrorMAE=${mae}${extra}`);
  }
}
