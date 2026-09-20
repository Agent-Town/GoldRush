// s1051 — measures ALL of bucket (B): the never-named GLBs that are NOT era variants
// of an already-named model. READ-ONLY w.r.t. dist (every file transformed on a copy
// in a temp dir outside the repo). Completes the census: A + B = the whole 217.3 MB.
import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { copyFile, mkdtemp, readdir, stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';

const distDir = resolve('dist');
const modelSourceDir = resolve('assets/pilots/map-rebuild-spike');
const townLandmarkModelNames = ['assay-office', 'chapel', 'claim-office', 'general-store', 'schoolhouse', 'town-plate', 'town-v3-tavern'];

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  }))).flat();
}

const sourceModels = await filesUnder(modelSourceDir);
const named = new Set(sourceModels
  .filter((f) => f.endsWith('-terrain.glb') || f.includes('/landmarks/'))
  .map((f) => basename(f, '.glb')));
townLandmarkModelNames.forEach((n) => named.add(n));

const allGlb = (await filesUnder(distDir)).filter((f) => extname(f) === '.glb');
const isDieted = (f) => { const o = basename(f, '.glb'); return [...named].some((s) => o.startsWith(`${s}-`)); };
const isEraVariant = (f) => [...named].some((s) => basename(f, '.glb').startsWith(`${s}.`));
const bucketB = allGlb.filter((f) => !isDieted(f) && !isEraVariant(f));

console.log(`bucket B = ${bucketB.length} GLBs; measuring each with the real diet transform...\n`);
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const work = await mkdtemp(join(tmpdir(), 's1051-bucketB-'));
const mb = (n) => (n / 1048576).toFixed(2);

let before = 0; let after = 0; let done = 0; const failures = []; const rows = [];
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < bucketB.length) {
    const src = bucketB[cursor++];
    const copy = join(work, basename(src));
    try {
      await copyFile(src, copy);
      const b = (await stat(copy)).size;
      const io = new NodeIO().setLogger(new Logger(Logger.Verbosity.ERROR))
        .registerExtensions(ALL_EXTENSIONS)
        .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
      const doc = await io.read(copy);
      await doc.transform(
        meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
        textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80, effort: 6 }),
      );
      await io.write(copy, doc);
      const a = (await stat(copy)).size;
      before += b; after += a; done += 1;
      rows.push({ name: basename(src), b, a });
      await unlink(copy);
    } catch (error) {
      failures.push({ name: basename(src), msg: error.message });
    }
  }
}));

rows.sort((x, y) => (y.b - y.a) - (x.b - x.a));
console.log('--- top 15 savers ---');
for (const r of rows.slice(0, 15)) {
  console.log(`${mb(r.b).padStart(6)} -> ${mb(r.a).padStart(6)} MB (${String(Math.round((1 - r.a / r.b) * 100)).padStart(2)}%)  ${r.name.slice(0, 46)}`);
}
console.log(`\n=== BUCKET B MEASURED TOTAL (${done}/${bucketB.length} files) ===`);
console.log(`${mb(before)} MB -> ${mb(after)} MB   (${Math.round((1 - after / before) * 100)}% cut, ${mb(before - after)} MB saved)`);
if (failures.length) {
  console.log(`\nFAILED (${failures.length}) — these are NOT counted in the total above:`);
  for (const f of failures) console.log(`  ${f.name}: ${f.msg}`);
}
