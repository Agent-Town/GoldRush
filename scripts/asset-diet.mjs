import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';

const distDir = resolve('dist');
const modelSourceDir = resolve('assets/pilots/map-rebuild-spike');
const townLandmarkModelNames = [
  'assay-office',
  'chapel',
  'claim-office',
  'general-store',
  'schoolhouse',
  'town-plate',
  'town-v3-tavern',
];

async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }))).flat();
}

function totalBytes(files) {
  return Promise.all(files.map((file) => stat(file).then(({ size }) => size)))
    .then((sizes) => sizes.reduce((sum, size) => sum + size, 0));
}

async function runPool(items, workers, job) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(workers, items.length) }, async () => {
    while (cursor < items.length) await job(items[cursor++]);
  }));
}

const sourceModels = await filesUnder(modelSourceDir);
const compressedModelNames = new Set(sourceModels
  .filter((file) => file.endsWith('-terrain.glb') || file.includes('/landmarks/'))
  .map((file) => basename(file, '.glb')));
townLandmarkModelNames.forEach((name) => compressedModelNames.add(name));
const distFiles = await filesUnder(distDir);
const dietModels = distFiles.filter((file) => {
  if (extname(file) !== '.glb') return false;
  const outputName = basename(file, '.glb');
  return [...compressedModelNames].some((sourceName) => outputName.startsWith(`${sourceName}-`));
});
const platePngs = [];

await runPool(distFiles.filter((file) => extname(file) === '.png'), 8, async (file) => {
  const { width, height } = await sharp(file).metadata();
  if ((width === 1671 || width === 1672) && height === 941) platePngs.push(file);
});

const beforeModels = await totalBytes(dietModels);
const beforePngs = await totalBytes(platePngs);

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
await runPool(dietModels, 3, async (file) => {
  const io = new NodeIO()
    .setLogger(new Logger(Logger.Verbosity.WARN))
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });
  const document = await io.read(file);
  await document.transform(
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80, effort: 6 }),
  );
  await io.write(file, document);
});

const replacements = new Map();
await runPool(platePngs, 4, async (file) => {
  const webp = file.replace(/\.png$/i, '.webp');
  const temporary = `${webp}.tmp`;
  await sharp(file).webp({ quality: 80, effort: 6 }).toFile(temporary);
  await rename(temporary, webp);
  await unlink(file);
  replacements.set(basename(file), basename(webp));
});

const textFiles = distFiles.filter((file) => ['.css', '.html', '.js', '.json'].includes(extname(file)));
await runPool(textFiles, 8, async (file) => {
  const original = await readFile(file, 'utf8');
  let updated = original;
  for (const [png, webp] of replacements) updated = updated.replaceAll(png, webp);
  if (updated !== original) await writeFile(file, updated);
});

const staleReferences = [];
for (const file of textFiles) {
  const contents = await readFile(file, 'utf8');
  for (const png of replacements.keys()) if (contents.includes(png)) staleReferences.push(`${file}: ${png}`);
}
if (staleReferences.length) throw new Error(`Asset diet left stale PNG references:\n${staleReferences.join('\n')}`);

const afterModels = await totalBytes(dietModels);
const afterPngs = await totalBytes([...replacements.values()].map((name) => join(dirname(platePngs[0] ?? distDir), name)));
const percent = (after, before) => before ? `${Math.round((1 - after / before) * 100)}%` : '0%';
console.log(
  `[asset-diet] ${dietModels.length} terrain/landmark GLBs ${beforeModels} -> ${afterModels} bytes (${percent(afterModels, beforeModels)} cut); `
  + `${platePngs.length} plate-class PNGs ${beforePngs} -> ${afterPngs} bytes (${percent(afterPngs, beforePngs)} cut).`,
);
