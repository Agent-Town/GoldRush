// Cardinal-vs-diagonal instrument for a human figure: silhouette width / height. A front or back
// view is narrow (shoulders only); a full profile is wide (stride + trailing poncho). A true 45°
// three-quarter sits between the two. Calibrated on the live jumper cardinals.
import { readFileSync } from 'node:fs';
import { measureCell } from '../needs-cells-art-batch/measure.mjs';
const contract = JSON.parse(readFileSync('assets/layer-contracts/characters.v2.json', 'utf8'));
const wk = contract.slots.find((x) => x.slot === 'char.claim_jumper').walk4;
const P = 'assets/processed/', Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
const ratio = async (files) => {
  const ms = []; for (const f of files) ms.push(await measureCell(f));
  const r = ms.map((m) => +(m.width / m.height).toFixed(3));
  return { r, mean: +(r.reduce((a, b) => a + b) / r.length).toFixed(3) };
};
console.log('LIVE (today\'s registrations)');
for (const dir of ['s', 'n', 'e', 'w', 'se', 'ne', 'sw', 'nw']) {
  const { r, mean } = await ratio(wk.directions[dir].frames.files.map((f) => P + f));
  console.log(` ${dir.padEnd(3)} w/h=[${r.join(', ')}] mean=${mean}`);
}
console.log('NEW');
for (const dir of ['s', 'e', 'se', 'sw', 'ne', 'nw']) {
  const { r, mean } = await ratio(Q4.map((c) => `artifacts/needs-cells-codex-strips/tmp/char-jumper-${dir}4-codex-v1-${c}.png`));
  console.log(` ${dir.padEnd(3)} w/h=[${r.join(', ')}] mean=${mean}`);
}
