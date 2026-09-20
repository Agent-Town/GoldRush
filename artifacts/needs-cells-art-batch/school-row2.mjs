// The schoolteacher is wired through src/town/town-actor-sheets.json (one sheet name per actor) and
// TownScene builds the cell key as `<sheet>-r<directionRow>c<frame>.png`, so her east row can only be
// replaced IN PLACE, in the sheet's own filenames. directionRow() puts e/se/ne on row 2.
// The sidecar bbox is not decoration: TownScene.ts:3428 anchors the billboard's foot on
// `bbox[3]-bbox[1]+1`, so the four row-2 bboxes are re-measured here in the same pass.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { measureCell } from './measure.mjs';
const SHEET = 'char-schoolteacher-sheet-walk8-a';
const SRC = process.argv[2] || 'artifacts/needs-cells-art-batch/extract-tmp';
const STEM = 'char-schoolteacher-east4-v1';
const map = [['r0c0', 'r2c0'], ['r0c1', 'r2c1'], ['r1c0', 'r2c2'], ['r1c1', 'r2c3']];
for (const [from, to] of map) copyFileSync(`${SRC}/${STEM}-${from}.png`, `assets/processed/${SHEET}-${to}.png`);
const metaPath = `assets/processed/${SHEET}.frames.json`;
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
for (const [, to] of map) {
  const row = Number(to[1]), col = Number(to[3]);
  const m = await measureCell(`assets/processed/${SHEET}-${to}.png`);
  const cell = meta.cells.find((c) => c.row === row && c.col === col);
  const before = cell.bbox.slice();
  cell.bbox = m.bbox;
  cell.empty = false;
  console.log(`${to}: bbox ${before.join(',')} -> ${m.bbox.join(',')}  height ${before[3] - before[1] + 1} -> ${m.height}`);
}
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
console.log('frames.json updated');
