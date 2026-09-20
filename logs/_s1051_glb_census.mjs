// s1051 GLB CENSUS — READ-ONLY. Writes nothing, deletes nothing, touches no asset.
// Replicates scripts/asset-diet.mjs's selector exactly (lines 41-52) and reports the
// byte split between GLBs the diet DOES optimize and GLBs it never names.
// Purpose: settle the premise under F-1050-3 recommendation (a) with a measurement.
import { readdir, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

const distDir = resolve('dist');
const modelSourceDir = resolve('assets/pilots/map-rebuild-spike');
const townLandmarkModelNames = [
  'assay-office', 'chapel', 'claim-office', 'general-store',
  'schoolhouse', 'town-plate', 'town-v3-tavern',
];

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }))).flat();
}

const sourceModels = await filesUnder(modelSourceDir);
// EXACT copy of asset-diet.mjs:41-44
const compressedModelNames = new Set(sourceModels
  .filter((file) => file.endsWith('-terrain.glb') || file.includes('/landmarks/'))
  .map((file) => basename(file, '.glb')));
townLandmarkModelNames.forEach((name) => compressedModelNames.add(name));

const distFiles = await filesUnder(distDir);
const allGlb = distFiles.filter((file) => extname(file) === '.glb');
// EXACT copy of asset-diet.mjs:46-52
const dietModels = allGlb.filter((file) => {
  const outputName = basename(file, '.glb');
  return [...compressedModelNames].some((sourceName) => outputName.startsWith(`${sourceName}-`));
});
const dietSet = new Set(dietModels);
const untouched = allGlb.filter((file) => !dietSet.has(file));

const sized = async (files) => {
  const rows = await Promise.all(files.map(async (f) => ({ f, size: (await stat(f)).size })));
  return rows.sort((a, b) => b.size - a.size);
};
const sum = (rows) => rows.reduce((s, r) => s + r.size, 0);
const mb = (n) => (n / 1048576).toFixed(1);

const dietRows = await sized(dietModels);
const untouchedRows = await sized(untouched);
const allRows = await sized(allGlb);

console.log('=== s1051 GLB CENSUS (read-only) ===');
console.log(`dist GLB total:      ${allGlb.length} files, ${mb(sum(allRows))} MB`);
console.log(`  DIETED (in place): ${dietModels.length} files, ${mb(sum(dietRows))} MB`);
console.log(`  NEVER NAMED:       ${untouched.length} files, ${mb(sum(untouchedRows))} MB   <-- the untapped lever`);
console.log(`\nsource models scanned in ${modelSourceDir}: ${sourceModels.length}`);
console.log(`diet selector names ${compressedModelNames.size} source basenames`);
console.log('\n=== TOP 25 NEVER-NAMED GLBs (biggest first) ===');
for (const r of untouchedRows.slice(0, 25)) {
  console.log(`${mb(r.size).padStart(7)} MB  ${r.f.replace(distDir + '/', '')}`);
}
console.log('\n=== NEVER-NAMED grouped by dist directory ===');
const byDir = new Map();
for (const r of untouchedRows) {
  const d = r.f.replace(distDir + '/', '').split('/').slice(0, -1).join('/') || '.';
  const cur = byDir.get(d) ?? { n: 0, bytes: 0 };
  byDir.set(d, { n: cur.n + 1, bytes: cur.bytes + r.size });
}
for (const [d, v] of [...byDir].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`${mb(v.bytes).padStart(7)} MB  ${String(v.n).padStart(4)} files  ${d}`);
}
