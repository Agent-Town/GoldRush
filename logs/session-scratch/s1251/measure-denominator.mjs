// s1251 — measure the blacklist ("laterAssetStems") that scripts/assert-release-build.mjs
// rebuilds from disk on every run. The leaked-asset check is only as strong as this set.
// Walk logic copied verbatim from the subject so the count is the subject's own count.
import { readdir } from 'node:fs/promises';
import { basename, extname, join, parse, relative } from 'node:path';

const root = process.cwd();
const e1Maps = new Set(['baron', 'dry-gulch', 'night-shift', 'the-claim', 'twin-banks']);
const fromRaw = [];
const fromGlb = [];

for (const file of await walk(join(root, 'assets/raw'))) {
  if (!basename(file).startsWith('plate-contract-')) continue;
  const id = parse(file).name.slice('plate-contract-'.length);
  if (!e1Maps.has(id)) fromRaw.push(parse(file).name);
}
for (const file of await walk(join(root, 'assets/pilots/map-rebuild-spike'))) {
  if (extname(file) !== '.glb') continue;
  const local = relative(join(root, 'assets/pilots/map-rebuild-spike'), file);
  const map = local.startsWith('landmarks/') ? local.split('/')[1] : parse(file).name.replace(/-(?:terrain|panorama)$/, '');
  if (!e1Maps.has(map)) fromGlb.push(parse(file).name);
}

console.log(`assets/raw plate-contract stems (non-E1): ${fromRaw.length}`);
console.log(fromRaw.slice(0, 12).join('\n') || '  (none)');
console.log(`\nmap-rebuild-spike .glb stems (non-E1): ${fromGlb.length}`);
console.log(fromGlb.slice(0, 12).join('\n') || '  (none)');
console.log(`\nTOTAL laterAssetStems = ${fromRaw.length + fromGlb.length}`);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}
