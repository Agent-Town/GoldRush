import { readFileSync } from 'node:fs';
import { measureCell } from '../needs-cells-art-batch/measure.mjs';
const P = 'assets/processed/';
const Q4 = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];
for (const dir of ['s', 'e', 'sw', 'ne', 'nw']) {
  const stem = `char-jumper-${dir}4-codex-v1`;
  const ms = [];
  for (const c of Q4) ms.push(await measureCell(`${P}${stem}-${c}.png`));
  const meta = JSON.parse(readFileSync(`${P}${stem}.frames.json`, 'utf8'));
  const h = ms.map((m) => m.height);
  console.log(` ${dir.padEnd(3)} cell=${ms[0].cellH} scale=${meta.scale} h=[${h.join(', ')}] pct=[${ms.map((m) => m.pctOfCell).join(', ')}] footY=[${ms.map((m) => m.bbox[3]).join(', ')}] spread=${Math.max(...h) - Math.min(...h)}`);
}
