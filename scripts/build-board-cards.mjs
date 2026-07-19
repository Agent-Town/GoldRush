import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pngjs from 'pngjs';

const { PNG } = pngjs;
const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'assets/processed/board-cards');
const OUTPUT_WIDTH = 480;
const OUTPUT_HEIGHT = Math.round((OUTPUT_WIDTH * 941) / 1672);
// ponytail: each verdict crop picks its clearest map panel; update if that evidence template changes.
const REUSE_VERDICT_CROPS = {
  'e6-picnic': { x: 45, y: 213, width: 540, height: 304 },
  'e7-dead-band': { x: 45, y: 213, width: 540, height: 304 },
  'e7-relay-rush': { x: 630, y: 213, width: 540, height: 304 },
  'e8-far-side': { x: 1218, y: 213, width: 540, height: 304 },
  'e8-eclipse': { x: 45, y: 213, width: 540, height: 304 },
};

export const BOARD_CARD_SOURCES = {
  'e2-trestle': 'artifacts/map-rebuild-spike/trestle-overview.png',
  'e2-pressure-garden': 'artifacts/map-rebuild-spike/pressure-garden-landmarks-proposed-overview.png',
  'e2-incline': 'artifacts/map-rebuild-spike/incline-landmarks-proposed-overview.png',
  'e3-blackout-ridge': 'artifacts/map-rebuild-spike/blackout-ridge-landmarks-proposed-overview.png',
  'e3-moth-season': 'artifacts/map-rebuild-spike/moth-season-landmarks-proposed-overview.png',
  'e3-canyon-works': 'artifacts/map-rebuild-spike/canyon-works-landmarks-proposed-overview.png',
  'e3-fairground': 'artifacts/map-rebuild-spike/fairground-landmarks-proposed-overview.png',
  'e4-dust-flats': 'artifacts/map-rebuild-spike/dust-flats-landmarks-proposed-overview.png',
  'e4-long-road': 'artifacts/map-rebuild-spike/long-road-landmarks-mounted-overview.png',
  'e4-gusher-county': 'artifacts/map-rebuild-spike/gusher-county-landmarks-mounted-overview.png',
  'e4-boneyard': 'artifacts/map-rebuild-spike/boneyard-landmarks-mounted-overview.png',
  'e5-deepwater-claim': 'artifacts/map-rebuild-spike/deepwater-claim-overview.png',
  'e5-regatta': 'artifacts/map-rebuild-spike/regatta-landmarks-proposed-overview.png',
  // These two contracts intentionally reuse the Deepwater Claim tile.
  'e5-stillwater': 'artifacts/map-rebuild-spike/deepwater-claim-overview.png',
  'e5-flotilla': 'artifacts/map-rebuild-spike/deepwater-claim-overview.png',
  'e6-glow-mesa': 'artifacts/map-rebuild-spike/glow-mesa-landmarks-proposed-overview.png',
  'e6-showroom': 'artifacts/map-rebuild-spike/showroom-landmarks-mounted-overview.png',
  'e6-half-life-hollow': 'artifacts/map-rebuild-spike/half-life-hollow-landmarks-mounted-overview.png',
  // Picnic is a Glow Mesa tile variant; its verdict render shows the variant landmarks.
  'e6-picnic': 'artifacts/map-rebuild-spike/picnic-reuse-verdict.png',
  'e7-relay-valley': 'artifacts/map-rebuild-spike/relay-valley-landmarks-proposed-overview.png',
  'e7-echo-canyon': 'artifacts/map-rebuild-spike/echo-canyon-landmarks-mounted-overview.png',
  // These are Relay Valley tile variants with contract-specific verdict renders.
  'e7-dead-band': 'artifacts/map-rebuild-spike/dead-band-reuse-verdict.png',
  'e7-relay-rush': 'artifacts/map-rebuild-spike/relay-rush-reuse-verdict.png',
  'e8-mare-claim': 'artifacts/map-rebuild-spike/mare-claim-landmarks-proposed-overview.png',
  // Far Side and Eclipse reuse Mare Claim terrain but have contract-specific verdicts.
  'e8-far-side': 'artifacts/map-rebuild-spike/far-side-reuse-verdict.png',
  'e8-low-orbit': 'artifacts/map-rebuild-spike/low-orbit-landmarks-mounted-overview.png',
  'e8-eclipse': 'artifacts/map-rebuild-spike/eclipse-reuse-verdict.png',
  'e9-dome-basin': 'artifacts/map-rebuild-spike/dome-basin-landmarks-proposed-overview.png',
  'e9-seed-run': 'artifacts/map-rebuild-spike/seed-run-landmarks-mounted-overview.png',
  'e9-devils-alley': 'artifacts/map-rebuild-spike/devils-alley-landmarks-mounted-overview.png',
  'e9-old-canal': 'artifacts/map-rebuild-spike/old-canal-landmarks-mounted-overview.png',
  'e10-ember-shore': 'artifacts/map-rebuild-spike/ember-shore-landmarks-proposed-overview.png',
  'e10-archive-world': 'artifacts/map-rebuild-spike/archive-world-landmarks-mounted-overview.png',
  // The Last Claim reuses the production Ark plaza; The River returns to The Claim tile.
  'e10-last-claim': 'assets/pilots/ark-plaza-e10-3d/renders/ark-plaza-gameplay.png',
  'e10-river': 'artifacts/map-rebuild-spike/claim-before-desert-dressing-overview.png',
};

function centerCrop(source, bounds = { x: 0, y: 0, width: source.width, height: source.height }) {
  const targetRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT;
  if (bounds.width / bounds.height > targetRatio) {
    const width = Math.round(bounds.height * targetRatio);
    return { x: bounds.x + Math.floor((bounds.width - width) / 2), y: bounds.y, width, height: bounds.height };
  }
  const height = Math.round(bounds.width / targetRatio);
  return { x: bounds.x, y: bounds.y + Math.floor((bounds.height - height) / 2), width: bounds.width, height };
}

function resize(source, contractId) {
  const crop = centerCrop(source, REUSE_VERDICT_CROPS[contractId]);
  const output = new PNG({ width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT });
  for (let y = 0; y < OUTPUT_HEIGHT; y += 1) {
    const sourceY = crop.y + Math.min(crop.height - 1, Math.floor(((y + 0.5) * crop.height) / OUTPUT_HEIGHT));
    for (let x = 0; x < OUTPUT_WIDTH; x += 1) {
      const sourceX = crop.x + Math.min(crop.width - 1, Math.floor(((x + 0.5) * crop.width) / OUTPUT_WIDTH));
      const sourceOffset = (sourceY * source.width + sourceX) * 4;
      const outputOffset = (y * OUTPUT_WIDTH + x) * 4;
      source.data.copy(output.data, outputOffset, sourceOffset, sourceOffset + 4);
    }
  }
  return output;
}

await mkdir(OUTPUT_DIR, { recursive: true });
for (const [contractId, sourceFile] of Object.entries(BOARD_CARD_SOURCES)) {
  const source = PNG.sync.read(await readFile(path.join(ROOT, sourceFile)));
  const output = PNG.sync.write(resize(source, contractId), { deflateLevel: 9, deflateStrategy: 3 });
  await writeFile(path.join(OUTPUT_DIR, `${contractId}.png`), output);
}

console.log(`Built ${Object.keys(BOARD_CARD_SOURCES).length} board cards at ${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}.`);
