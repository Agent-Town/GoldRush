// s1051 GLB CENSUS part 2 — READ-ONLY. Splits the 171 never-named GLBs into:
//   (A) ERA VARIANTS of models the diet ALREADY names, missed only because the
//       naming convention is `name.eN-hash` and the selector tests `name-`.
//   (B) genuinely unnamed models (never in the diet's intended set).
// (A) is a selector bug. (B) is a scope question for the owner.
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
const compressedModelNames = new Set(sourceModels
  .filter((file) => file.endsWith('-terrain.glb') || file.includes('/landmarks/'))
  .map((file) => basename(file, '.glb')));
townLandmarkModelNames.forEach((name) => compressedModelNames.add(name));

const distFiles = await filesUnder(distDir);
const allGlb = distFiles.filter((f) => extname(f) === '.glb');
const isDieted = (file) => {
  const outputName = basename(file, '.glb');
  return [...compressedModelNames].some((s) => outputName.startsWith(`${s}-`));
};
const untouched = allGlb.filter((f) => !isDieted(f));

// An era variant: basename starts with `<namedSource>.` (dot), e.g. schoolhouse.e8-hash
const eraVariantOf = (file) => {
  const outputName = basename(file, '.glb');
  for (const s of compressedModelNames) if (outputName.startsWith(`${s}.`)) return s;
  return null;
};

const rows = await Promise.all(untouched.map(async (f) => ({
  f, size: (await stat(f)).size, era: eraVariantOf(f),
})));
const eraRows = rows.filter((r) => r.era).sort((a, b) => b.size - a.size);
const otherRows = rows.filter((r) => !r.era).sort((a, b) => b.size - a.size);
const sum = (rs) => rs.reduce((s, r) => s + r.size, 0);
const mb = (n) => (n / 1048576).toFixed(1);

console.log('=== s1051 CENSUS 2 — why 171 GLBs escaped the diet ===');
console.log(`(A) ERA VARIANTS of already-named models: ${eraRows.length} files, ${mb(sum(eraRows))} MB`);
console.log(`    -> missed ONLY because the name is "base.eN-" and the selector tests "base-"`);
console.log(`(B) genuinely unnamed models:             ${otherRows.length} files, ${mb(sum(otherRows))} MB`);

const byBase = new Map();
for (const r of eraRows) {
  const cur = byBase.get(r.era) ?? { n: 0, bytes: 0 };
  byBase.set(r.era, { n: cur.n + 1, bytes: cur.bytes + r.size });
}
console.log('\n--- (A) era variants grouped by the base model the diet ALREADY compresses ---');
for (const [b, v] of [...byBase].sort((x, y) => y[1].bytes - x[1].bytes)) {
  console.log(`${mb(v.bytes).padStart(7)} MB  ${String(v.n).padStart(3)} files  ${b}.eN`);
}
console.log('\n--- (B) top 20 genuinely unnamed ---');
for (const r of otherRows.slice(0, 20)) {
  console.log(`${mb(r.size).padStart(7)} MB  ${basename(r.f)}`);
}
