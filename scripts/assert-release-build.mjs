import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, parse, relative } from 'node:path';

if (process.env.GR_RELEASE !== 'e1') throw new Error('build:release requires GR_RELEASE=e1');

const root = process.cwd();
const dist = join(root, 'dist');
const files = await walk(dist);
// A guard must never clear a subject it did not read. With no dist/ every check below iterates
// an empty list and the summary line reports an affirmative all-clear over zero bytes (s1251).
if (!files.length) fail(`no build to check — ${dist} is missing or empty; run \`npm run build:release\` first`);
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

// The plate/GLB check is only as strong as this blacklist, which is rebuilt from disk every run
// (261 stems at s1251). If those source dirs are moved or renamed the set silently empties and the
// two checks below pass vacuously — so an empty denominator is a failure, not a clean bill.
if (!laterAssetStems.size) {
  fail('no later-epoch asset stems found — assets/raw and assets/pilots/map-rebuild-spike are missing or renamed, so the plate/GLB leak check would pass vacuously; repoint it');
}

const leakedAssets = files
  .map((file) => basename(file))
  .filter((file) => [...laterAssetStems].some((stem) => file === `${stem}${extname(file)}` || file.startsWith(`${stem}-`)));
if (leakedAssets.length) fail(`later plate/GLB assets emitted: ${leakedAssets.slice(0, 8).join(', ')}`);
// Dist filenames are `<module>-<hash>-diet-<fingerprint><ext>` (vite.config.ts:51-53). That hash is
// 8 chars of base64url and MAY contain '-' (187 of 1869 did at s1382), so an era pattern matched
// against the whole basename can fire on hash text: rolldown minted `e4-RHTJh` for the E1 frame
// char-bandit-base-sheet-walk8-r2c6, and this check read it as an E4 leak and held the release door
// shut on CLEAN MAIN. Match the module name only, and anchor the tail with `$` so a genuine era
// suffix (`icons-e2`, `...-e4`) is still caught once the hash is stripped (F-1382-1).
const moduleName = (file) => basename(file, extname(file)).replace(/-[A-Za-z0-9_-]{8}-diet-[0-9a-f]{8}$/, '');
// F-RGD-1 (2026-09-24): a sprite sheet's compass token collides with the era token: `char-jumper-e4-codex-v1-r0c0` is
// the Claim Jumper's EAST plate, four cells (owner 2026-09-19), not an era-4 asset. A direction plate is
// `<char stem>-<n|e|s|w|ne|nw|se|sw><4|8>-codex-v<n>[-r<row>c<col>]`; it is excused here by that shape only.
const directionPlate = /^char-[a-z0-9-]+-(?:n|e|s|w|ne|nw|se|sw)(?:4|8)-codex-v\d+(?:-r\d+c\d+)?$/;
const laterEraNamed = files.filter((file) => !directionPlate.test(moduleName(file)) && /(?:^|[.-])e(?:[2-9]|10)(?:[.-]|$)/.test(moduleName(file)));
if (laterEraNamed.length) fail(`later era assets emitted: ${laterEraNamed.map((file) => basename(file)).slice(0, 8).join(', ')}`);
const laterEraAssets = files.map((file) => basename(file)).filter((file) =>
  /^(?:boss-railcar-|char-(?:railtough|steamwrecker|coalthief)-|bld-boiler-house-|ceremony-stage-t(?:[2-9]|10)-|kit-era-(?:[2-9]|10)-)/.test(file),
);
if (laterEraAssets.length) fail(`later era assets emitted: ${laterEraAssets.slice(0, 8).join(', ')}`);

const bytes = (await Promise.all(files.map((file) => stat(file)))).reduce((sum, entry) => sum + entry.size, 0);
// Report the denominator alongside the verdict: a reader can then see at a glance whether the
// clearance was earned against a real blacklist or against an empty one.
console.log(`[release-build] E1-only: ${files.length} files, ${bytes} bytes, zero later manifest ids or plate/GLB assets (checked against ${laterAssetStems.size} later-asset stems)`);

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
