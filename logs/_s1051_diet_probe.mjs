// s1051 DIET PROBE — measures, does NOT guess.
// Copies ONE never-named era-variant GLB to a temp dir OUTSIDE the repo and runs the
// EXACT transform scripts/asset-diet.mjs applies (meshopt medium + textureCompress webp q80).
// dist/ is never written. Answers: "what would the era variants actually weigh dieted?"
import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { copyFile, mkdtemp, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const targets = process.argv.slice(2);
if (!targets.length) throw new Error('usage: node _s1051_diet_probe.mjs <dist glb> [...]');

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const work = await mkdtemp(join(tmpdir(), 's1051-diet-'));
const mb = (n) => (n / 1048576).toFixed(2);
let beforeAll = 0; let afterAll = 0;

for (const rel of targets) {
  const src = resolve(rel);
  const copy = join(work, basename(src));
  await copyFile(src, copy);                       // work on a COPY, never dist
  const before = (await stat(copy)).size;

  const io = new NodeIO()
    .setLogger(new Logger(Logger.Verbosity.WARN))
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
  const document = await io.read(copy);
  await document.transform(
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80, effort: 6 }),
  );
  await io.write(copy, document);

  const after = (await stat(copy)).size;
  beforeAll += before; afterAll += after;
  console.log(`${basename(src).padEnd(48)} ${mb(before).padStart(7)} MB -> ${mb(after).padStart(6)} MB  (${Math.round((1 - after / before) * 100)}% cut)`);
}

console.log(`\nTOTAL ${targets.length} file(s): ${mb(beforeAll)} MB -> ${mb(afterAll)} MB  (${Math.round((1 - afterAll / beforeAll) * 100)}% cut)`);
console.log(`temp workdir (outside repo): ${work}`);
