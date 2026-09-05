import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, matchesGlob, relative, resolve } from 'node:path';

const distDir = resolve('dist');
const modelManifest = JSON.parse(await readFile(new URL('./asset-diet.manifest.json', import.meta.url), 'utf8'));
// F-1184-1, made permanent by gazette-art-wiring-hardening.
const HERALD_SPOT_CUT_BUDGET_BYTES = 1_500_000;
// Scope 1 measured 1,099,906 B on disk; 1.5 MB leaves 36% encoder drift
// (and still bounds 8 spot cuts at 64 KiB plus 6 panels at 160 KiB).
const HERALD_DEV_ART_BUDGET_BYTES = 1_500_000;

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

async function filesReachedByHeraldGlobs() {
  const source = await readFile(resolve('src/news/heraldReader.ts'), 'utf8');
  const patterns = [...source.matchAll(/import\.meta\.glob<string>\('([^']*(?:herald-engraving|gazette-panel)-[^']*)'/g)]
    .map((match) => resolve('src/news', match[1]));
  if (patterns.length !== 2) throw new Error(`Expected 2 Herald art globs, found ${patterns.length}.`);
  const reached = await Promise.all(patterns.map(async (pattern) => {
    const [prefix, suffix, extra] = basename(pattern).split('*');
    if (extra !== undefined || suffix === undefined) throw new Error(`Unsupported Herald art glob: ${pattern}`);
    const files = (await readdir(dirname(pattern), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith(suffix))
      .map((entry) => join(dirname(pattern), entry.name));
    return files;
  }));
  const files = reached.flat();
  const expectedNames = new Set([
    ...[...source.matchAll(/heraldEngravingUrls\['[^']*\/([^/'*]+\.webp)'\]/g)].map((match) => match[1]),
    ...[...source.matchAll(/\bid: '([^']+)'/g)].map((match) => `gazette-panel-${match[1]}.webp`),
  ]);
  const reachedNames = new Set(files.map((file) => basename(file)));
  const missing = [...expectedNames].filter((name) => !reachedNames.has(name));
  const unexpected = [...reachedNames].filter((name) => !expectedNames.has(name));
  if (expectedNames.size !== 14 || missing.length || unexpected.length) {
    throw new Error(`Expected the 14 Herald derivatives; missing [${missing}], unexpected [${unexpected}].`);
  }
  return files;
}

async function runPool(items, workers, job) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(workers, items.length) }, async () => {
    while (cursor < items.length) await job(items[cursor++]);
  }));
}

const heraldDevArtBytes = await totalBytes(await filesReachedByHeraldGlobs());
console.log(`[asset-diet] Herald dev-path art ${heraldDevArtBytes} bytes (${HERALD_DEV_ART_BUDGET_BYTES} byte ceiling).`);
if (heraldDevArtBytes > HERALD_DEV_ART_BUDGET_BYTES) {
  throw new Error(`Herald dev-path art exceeds byte budget: ${heraldDevArtBytes} B measured > ${HERALD_DEV_ART_BUDGET_BYTES} B ceiling.`);
}

assert.ok(Array.isArray(modelManifest) && modelManifest.length, 'Asset diet needs a nonempty GLB manifest.');
for (const entry of modelManifest) {
  assert.ok(typeof entry.family === 'string' && entry.family.trim()
    && Array.isArray(entry.patterns) && entry.patterns.length && entry.patterns.every((pattern) => typeof pattern === 'string' && pattern.trim())
    && typeof entry.compress === 'boolean' && typeof entry.reason === 'string' && entry.reason.trim(),
  `Invalid asset diet manifest entry: ${JSON.stringify(entry)}`);
  assert.ok(entry.quantize === undefined || typeof entry.quantize === 'boolean', `Invalid quantize policy: ${entry.family}`);
}
assert.equal(new Set(modelManifest.map(({ family }) => family)).size, modelManifest.length, 'Asset diet family names must be unique.');
const sourceModels = (await filesUnder(resolve('assets/pilots'))).filter((file) => extname(file) === '.glb');
const distFiles = await filesUnder(distDir);
const modelFamilies = modelManifest.map((entry) => ({ ...entry, files: [], before: 0 }));
for (const file of distFiles.filter((file) => extname(file) === '.glb')) {
  // Strip only Vite's emitted suffix; worker assets omit the diet fingerprint.
  // Match the entire remaining source filename, including .eN; never a family prefix.
  const sourceName = basename(file).replace(/-[\w-]{8}(?:-diet-[a-f0-9]{8})?\.glb$/, '.glb');
  const sources = sourceModels.filter((source) => basename(source) === sourceName);
  assert.equal(sources.length, 1, `Asset diet cannot resolve a unique source for ${relative(distDir, file)}: ${sources.join(', ')}`);
  const sourcePath = relative(resolve('.'), sources[0]).split('\\').join('/');
  const families = modelFamilies.filter(({ patterns }) => patterns.some((pattern) => matchesGlob(sourcePath, pattern)));
  assert.equal(families.length, 1, `Asset diet requires exactly one manifest entry for ${sourcePath} (${relative(distDir, file)}); found ${families.length}.`);
  families[0].files.push(file);
}
await Promise.all(modelFamilies.map(async (family) => { family.before = await totalBytes(family.files); }));
const dietModels = modelFamilies.filter(({ compress }) => compress).flatMap(({ files, quantize }) => files.map((file) => ({ file, quantize })));
const platePngs = [];

await runPool(distFiles.filter((file) => extname(file) === '.png'), 8, async (file) => {
  const { width, height } = await sharp(file).metadata();
  if (((width === 1671 || width === 1672) && height === 941) || (width === 1024 && height === 1024)) platePngs.push(file);
});

const beforeModels = await totalBytes(dietModels.map(({ file }) => file));
const beforePngs = await totalBytes(platePngs);

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
await runPool(dietModels, 3, async ({ file, quantize }) => {
  const io = new NodeIO()
    .setLogger(new Logger(Logger.Verbosity.WARN))
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });
  const document = await io.read(file);
  if (quantize === false) document.createExtension(EXTMeshoptCompression).setRequired(true);
  else await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await document.transform(
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80, effort: 6 }),
  );
  await io.write(file, document);
});

const replacements = new Map();
await runPool(platePngs, 4, async (file) => {
  const webp = file.replace(/\.png$/i, '.webp');
  const temporary = `${webp}.tmp`;
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const squareTier = width === 1024 && height === 1024;
  const heraldSpotCut = basename(file).includes('herald-engraving-');
  if (squareTier && !heraldSpotCut) {
    console.warn(`[asset-diet] WARNING: unrecognised 1024-square tier, converted but NOT resized: ${basename(file)}`);
  }
  await (squareTier && heraldSpotCut ? image.resize(384, 384) : image).webp({ quality: 80, effort: 6 }).toFile(temporary);
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

const afterModels = await totalBytes(dietModels.map(({ file }) => file));
const afterPngs = await totalBytes([...replacements.values()].map((name) => join(dirname(platePngs[0] ?? distDir), name)));
const afterHeraldBytes = await totalBytes((await filesUnder(distDir))
  .filter((file) => basename(file).includes('herald-engraving-')));
const percent = (after, before) => before ? `${Math.round((1 - after / before) * 100)}%` : '0%';
console.log(
  `[asset-diet] ${dietModels.length} manifest GLBs ${beforeModels} -> ${afterModels} bytes (${percent(afterModels, beforeModels)} cut); `
  + `${platePngs.length} plate-class PNGs ${beforePngs} -> ${afterPngs} bytes (${percent(afterPngs, beforePngs)} cut); `
  + `herald spot cuts ${afterHeraldBytes} bytes.`,
);
console.log('[asset-diet] GLB bytes by manifest family:\n| Family | GLBs | Before bytes | After bytes | Cut | Policy |\n| --- | ---: | ---: | ---: | ---: | --- |');
for (const family of modelFamilies) {
  const after = await totalBytes(family.files);
  console.log(`| ${family.family} | ${family.files.length} | ${family.before} | ${after} | ${percent(after, family.before)} | ${family.compress ? 'compress' : `skip: ${family.reason}`} |`);
}
if (afterHeraldBytes > HERALD_SPOT_CUT_BUDGET_BYTES) {
  throw new Error(`Herald spot cuts exceed byte budget: ${afterHeraldBytes} B measured > ${HERALD_SPOT_CUT_BUDGET_BYTES} B ceiling.`);
}
