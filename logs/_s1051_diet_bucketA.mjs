// s1051 — measures ALL of bucket (A): every never-named GLB that is an era variant
// (`base.eN-`) of a model the diet ALREADY compresses. READ-ONLY w.r.t. dist:
// every file is copied to a temp dir outside the repo before the transform runs.
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
const bucketA = allGlb.filter((f) => !isDieted(f) && [...named].some((s) => basename(f, '.glb').startsWith(`${s}.`)));

console.log(`bucket A = ${bucketA.length} era-variant GLBs; measuring each with the real diet transform...\n`);
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const work = await mkdtemp(join(tmpdir(), 's1051-bucketA-'));
const mb = (n) => (n / 1048576).toFixed(2);

let before = 0; let after = 0; let done = 0; const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < bucketA.length) {
    const src = bucketA[cursor++];
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
      console.log(`${String(done).padStart(2)}/${bucketA.length} ${basename(src).slice(0, 44).padEnd(44)} ${mb(b).padStart(6)} -> ${mb(a).padStart(6)} MB (${Math.round((1 - a / b) * 100)}%)`);
      await unlink(copy);
    } catch (error) {
      failures.push(`${basename(src)}: ${error.message}`);
    }
  }
}));

console.log(`\n=== BUCKET A MEASURED TOTAL (${done}/${bucketA.length} files) ===`);
console.log(`${mb(before)} MB -> ${mb(after)} MB   (${Math.round((1 - after / before) * 100)}% cut, ${mb(before - after)} MB saved)`);
if (failures.length) console.log(`\nFAILED (${failures.length}):\n${failures.join('\n')}`);
