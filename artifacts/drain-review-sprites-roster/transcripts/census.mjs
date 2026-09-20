// Full per-cell census over the SHIPPED dirs (assets/processed, assets/processed-full):
// pixel identity vs main, violet-key residue, alpha edge softness, figure bbox.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { PNG } from '/Users/robin/Claude/Projects/Gold Rush/node_modules/pngjs/lib/png.js';

const MERGED = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites';
const CONTROL = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites-control';
const WORK = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/sprites-work';

const status = readFileSync(`${WORK}/asset-status.txt`, 'utf8').trim().split('\n').map((l) => l.split('\t'));
const cells = status.filter(([st, p]) => p.endsWith('.png') && /^assets\/processed(-full)?\//.test(p));
console.log(`cells to walk: ${cells.length}`);

const famOf = (p) => `${p.split('/')[1]}|${p.split('/').pop().replace(/-r\d+c\d+\.png$/, '.png')}`;
const fams = new Map();

function px(img, i) { return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]; }

let n = 0;
for (const [st, p] of cells) {
  n++;
  if (n % 400 === 0) console.log(`  ...${n}`);
  const f = famOf(p);
  const rec = fams.get(f) ?? { fam: f, cells: 0, added: 0, identical: 0, changed: 0,
    mainBytes: 0, mergedBytes: 0, violetMerged: 0, violetMain: 0, violetCells: 0,
    partialMerged: 0, partialMain: 0, opaqueMerged: 0, opaqueMain: 0,
    bboxBottomMerged: [], bboxBottomMain: [], hgtMerged: [], hgtMain: [] };
  fams.set(f, rec);
  rec.cells++;
  if (st === 'A') rec.added++;
  const mPath = `${MERGED}/${p}`;
  const cPath = `${CONTROL}/${p}`;
  if (existsSync(mPath)) rec.mergedBytes += statSync(mPath).size;
  if (st !== 'A' && existsSync(cPath)) rec.mainBytes += statSync(cPath).size;
  let m, c = null;
  try { m = PNG.sync.read(readFileSync(mPath)); } catch { continue; }
  if (st !== 'A' && existsSync(cPath)) { try { c = PNG.sync.read(readFileSync(cPath)); } catch { c = null; } }
  if (c && c.width === m.width && c.height === m.height && Buffer.compare(m.data, c.data) === 0) rec.identical++;
  else if (c) rec.changed++;

  for (const [img, tag] of c ? [[m, 'Merged'], [c, 'Main']] : [[m, 'Merged']]) {
    let violet = 0, partial = 0, opaque = 0, maxY = -1, minY = img.height;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a === 0) continue;
      if (a === 255) opaque++; else partial++;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 150 && b > 150 && g < Math.min(r, b) - 40) violet++;
      if (a > 8) { const y = Math.floor(i / 4 / img.width); if (y > maxY) maxY = y; if (y < minY) minY = y; }
    }
    rec[`violet${tag}`] += violet;
    if (tag === 'Merged' && violet > 0) rec.violetCells++;
    rec[`partial${tag}`] += partial;
    rec[`opaque${tag}`] += opaque;
    if (maxY >= 0) { rec[`bboxBottom${tag}`].push(maxY); rec[`hgt${tag}`].push(maxY - minY + 1); }
  }
}

const rows = [...fams.values()].map((r) => ({
  ...r,
  bboxBottomMerged: r.bboxBottomMerged.length ? Math.max(...r.bboxBottomMerged) : null,
  bboxBottomMain: r.bboxBottomMain.length ? Math.max(...r.bboxBottomMain) : null,
  hgtMergedMax: r.hgtMerged.length ? Math.max(...r.hgtMerged) : null,
  hgtMainMax: r.hgtMain.length ? Math.max(...r.hgtMain) : null,
  hgtMerged: undefined, hgtMain: undefined,
}));
writeFileSync(`${WORK}/census.json`, JSON.stringify(rows, null, 1));

console.log('\n=== families where EVERY compared cell is pixel-identical (pure re-encode) ===');
const pure = rows.filter((r) => r.changed === 0 && r.identical > 0);
let pureDelta = 0, pureCells = 0;
for (const r of pure) { pureDelta += r.mergedBytes - r.mainBytes; pureCells += r.identical; }
console.log(`${pure.length} families, ${pureCells} cells, byte delta ${pureDelta >= 0 ? '+' : ''}${pureDelta}`);
for (const r of pure.sort((a, b) => (b.mergedBytes - b.mainBytes) - (a.mergedBytes - a.mainBytes)).slice(0, 25)) {
  console.log(`  ${r.fam}  ${r.identical} cells  ${r.mainBytes} -> ${r.mergedBytes} (${r.mergedBytes - r.mainBytes >= 0 ? '+' : ''}${r.mergedBytes - r.mainBytes})`);
}

console.log('\n=== violet-key residue in SHIPPED cells (merged vs main) ===');
const v = rows.filter((r) => r.violetMerged > 0 || r.violetMain > 0);
console.log(`${v.length} families carry any; totals merged ${rows.reduce((s, r) => s + r.violetMerged, 0)} px, main ${rows.reduce((s, r) => s + r.violetMain, 0)} px`);
for (const r of v.sort((a, b) => b.violetMerged - a.violetMerged).slice(0, 30)) {
  console.log(`  ${r.fam}  merged ${r.violetMerged} px in ${r.violetCells}/${r.cells} cells | main ${r.violetMain} px`);
}

console.log('\n=== soft-alpha (partial-alpha pixel count) growth, top 20 ===');
for (const r of rows.filter((x) => x.partialMain > 0).sort((a, b) => (b.partialMerged - b.partialMain) - (a.partialMerged - a.partialMain)).slice(0, 20)) {
  console.log(`  ${r.fam}  partial ${r.partialMain} -> ${r.partialMerged} (${r.partialMerged - r.partialMain >= 0 ? '+' : ''}${r.partialMerged - r.partialMain}) | bytes ${r.mainBytes} -> ${r.mergedBytes}`);
}

console.log('\n=== ground line (max bottom row of alpha>8) shifts, families where it moved ===');
for (const r of rows.filter((x) => x.bboxBottomMain !== null && x.bboxBottomMerged !== x.bboxBottomMain).sort((a, b) => Math.abs(b.bboxBottomMerged - b.bboxBottomMain) - Math.abs(a.bboxBottomMerged - a.bboxBottomMain)).slice(0, 25)) {
  console.log(`  ${r.fam}  bottom ${r.bboxBottomMain} -> ${r.bboxBottomMerged}  | tallest figure ${r.hgtMainMax} -> ${r.hgtMergedMax}`);
}
