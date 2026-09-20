// Drain-review measurement: per-family byte deltas, pixel identity, alpha stats, violet census.
// Reads ONLY: the merged worktree and the control worktree. Writes JSON/text into the work dir.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { PNG } from '/Users/robin/Claude/Projects/Gold Rush/node_modules/pngjs/lib/png.js';

const MERGED = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites';
const CONTROL = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-sprites-control';
const WORK = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/sprites-work';

const status = readFileSync(`${WORK}/asset-status.txt`, 'utf8').trim().split('\n').map((l) => l.split('\t'));
const pngs = status.filter(([, p]) => p.endsWith('.png'));

// ── byte totals, by directory and status
const totals = {};
for (const [st, p] of pngs) {
  const dir = p.split('/')[1];
  const key = `${dir}/${st}`;
  const t = (totals[key] ??= { files: 0, mainBytes: 0, mergedBytes: 0 });
  t.files++;
  if (st !== 'A' && existsSync(`${CONTROL}/${p}`)) t.mainBytes += statSync(`${CONTROL}/${p}`).size;
  if (existsSync(`${MERGED}/${p}`)) t.mergedBytes += statSync(`${MERGED}/${p}`).size;
}

// ── one representative cell per family
const famOf = (p) => {
  const dir = p.split('/')[1];
  const base = p.split('/').pop();
  return `${dir}|${base.replace(/-r\d+c\d+\.png$/, '.png')}`;
};
const reps = new Map();
for (const [st, p] of pngs) {
  const f = famOf(p);
  if (!reps.has(f)) reps.set(f, { status: st, path: p, cells: 0, mainBytes: 0, mergedBytes: 0 });
  const r = reps.get(f);
  r.cells++;
  if (st !== 'A' && existsSync(`${CONTROL}/${p}`)) r.mainBytes += statSync(`${CONTROL}/${p}`).size;
  if (existsSync(`${MERGED}/${p}`)) r.mergedBytes += statSync(`${MERGED}/${p}`).size;
};

function read(p) { return PNG.sync.read(readFileSync(p)); }
function stats(img) {
  const { width: w, height: h, data } = img;
  let opaque = 0, partial = 0, violet = 0, minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, a = data[i + 3];
    if (a === 0) continue;
    if (a === 255) opaque++; else partial++;
    if (a > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // the magenta key residue the census hunts: strong red+blue, weak green
    if (r > 150 && b > 150 && g < Math.min(r, b) - 40) violet++;
  }
  return { w, h, opaque, partial, violet, bbox: maxX < 0 ? null : { minX, maxX, minY, maxY, hgt: maxY - minY + 1, wid: maxX - minX + 1 } };
}

const out = [];
for (const [fam, r] of reps) {
  const mPath = `${MERGED}/${r.path}`;
  const cPath = `${CONTROL}/${r.path}`;
  const row = { fam, status: r.status, cells: r.cells, mainBytes: r.mainBytes, mergedBytes: r.mergedBytes, rep: r.path };
  try {
    const m = read(mPath);
    row.merged = stats(m);
    if (r.status !== 'A' && existsSync(cPath)) {
      const c = read(cPath);
      row.main = stats(c);
      row.pixelIdentical = Buffer.compare(m.data, c.data) === 0;
    }
  } catch (e) { row.error = String(e).slice(0, 120); }
  out.push(row);
}

writeFileSync(`${WORK}/family-analysis.json`, JSON.stringify({ totals, families: out }, null, 1));

console.log('=== byte totals by dir/status ===');
for (const [k, v] of Object.entries(totals).sort()) {
  console.log(` ${k}: ${v.files} files  main ${v.mainBytes}  merged ${v.mergedBytes}  delta ${v.mergedBytes - v.mainBytes}`);
}
const reencoded = out.filter((r) => r.pixelIdentical === true);
console.log(`\nfamilies whose representative cell is PIXEL-IDENTICAL to main (re-encode only): ${reencoded.length} of ${out.filter((r) => r.pixelIdentical !== undefined).length} compared`);
for (const r of reencoded.slice(0, 40)) console.log(`  ${r.fam}  ${r.mainBytes} -> ${r.mergedBytes} (${r.mergedBytes - r.mainBytes >= 0 ? '+' : ''}${r.mergedBytes - r.mainBytes})`);
const violet = out.filter((r) => r.merged?.violet > 0);
console.log(`\nrepresentative cells with violet-key residue (>0 px): ${violet.length}`);
for (const r of violet.sort((a, b) => b.merged.violet - a.merged.violet).slice(0, 30)) {
  console.log(`  ${r.fam}  merged ${r.merged.violet} px  main ${r.main ? r.main.violet : 'n/a'} px  (${r.rep})`);
}
