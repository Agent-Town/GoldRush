import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, parse, relative } from 'node:path';

if (process.env.GR_RELEASE !== 'e1') throw new Error('build:release requires GR_RELEASE=e1');

const root = process.cwd();
const dist = join(root, 'dist');
const files = await walk(dist);
const textFiles = files.filter((file) => ['.css', '.html', '.js', '.json'].includes(extname(file)));
const laterEpoch = /epoch-(?:[2-9]|10)-/;
for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  if (laterEpoch.test(text)) fail(`later epoch manifest id in ${relative(dist, file)}`);
  if (/t[3-8]-the-(?:refinery|boat|deep-reactor|calculating-house|starship|colony-seed)/.test(text)) {
    fail(`later ceremony script in ${relative(dist, file)}`);
  }
}

const e1Maps = new Set(['baron', 'dry-gulch', 'night-shift', 'the-claim', 'twin-banks']);
const laterAssetStems = new Set();
for (const file of await walk(join(root, 'assets/raw'))) {
  if (!basename(file).startsWith('plate-contract-')) continue;
  const id = parse(file).name.slice('plate-contract-'.length);
  if (!e1Maps.has(id)) laterAssetStems.add(parse(file).name);
}
for (const file of await walk(join(root, 'assets/pilots/map-rebuild-spike'))) {
  if (extname(file) !== '.glb') continue;
  const local = relative(join(root, 'assets/pilots/map-rebuild-spike'), file);
  const map = local.startsWith('landmarks/') ? local.split('/')[1] : parse(file).name.replace(/-(?:terrain|panorama)$/, '');
  if (!e1Maps.has(map)) laterAssetStems.add(parse(file).name);
}

const leakedAssets = files
  .map((file) => basename(file))
  .filter((file) => [...laterAssetStems].some((stem) => file === `${stem}${extname(file)}` || file.startsWith(`${stem}-`)));
if (leakedAssets.length) fail(`later plate/GLB assets emitted: ${leakedAssets.slice(0, 8).join(', ')}`);
const laterEraNamed = files.map((file) => basename(file)).filter((file) => /(?:^|[.-])e(?:[2-9]|10)(?:[.-])/.test(file));
if (laterEraNamed.length) fail(`later era assets emitted: ${laterEraNamed.slice(0, 8).join(', ')}`);
const laterEraAssets = files.map((file) => basename(file)).filter((file) =>
  /^(?:boss-railcar-|char-(?:railtough|steamwrecker|coalthief)-|bld-boiler-house-|ceremony-stage-t(?:[2-9]|10)-|kit-era-(?:[2-9]|10)-)/.test(file),
);
if (laterEraAssets.length) fail(`later era assets emitted: ${laterEraAssets.slice(0, 8).join(', ')}`);

const bytes = (await Promise.all(files.map((file) => stat(file)))).reduce((sum, entry) => sum + entry.size, 0);
console.log(`[release-build] E1-only: ${files.length} files, ${bytes} bytes, zero later manifest ids or plate/GLB assets`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

function fail(message) {
  throw new Error(`[release-build] ${message}`);
}
