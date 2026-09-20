// Re-run:  node artifacts/bounded-prefetch-town-halls/measure-town-bytes.mjs
// Needs:  `npm run build` (dist/ is the byte source) and a dev server on 5302 (URL resolution).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const { chromium } = createRequire(path.join(ROOT, 'package.json'))('playwright');
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIST = path.join(ROOT, 'dist/assets');

// dist basenames look like `<original-stem>-<viteHash>-diet-<manifestHash>.<ext>`
// build the stem -> bytes map (prefer the -diet- copy, which is what ships)
const distFiles = readdirSync(DIST);
function distBytesFor(sourceBasename) {
  const ext = path.extname(sourceBasename);
  const stem = path.basename(sourceBasename, ext);
  // stem may itself contain dots (e.g. tavern.e8)
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const dietRe = new RegExp(`^${escaped}-[A-Za-z0-9_-]{8}-diet-[0-9a-f]{8}\\${ext}$`);
  const plainRe = new RegExp(`^${escaped}-[A-Za-z0-9_-]{8}\\${ext}$`);
  const diet = distFiles.filter((f) => dietRe.test(f));
  if (diet.length === 1) return { file: diet[0], bytes: statSync(path.join(DIST, diet[0])).size, kind: 'diet' };
  const plain = distFiles.filter((f) => plainRe.test(f));
  if (plain.length === 1) return { file: plain[0], bytes: statSync(path.join(DIST, plain[0])).size, kind: 'plain' };
  return { file: null, bytes: null, kind: `UNRESOLVED(diet=${diet.length},plain=${plain.length})` };
}

const browser = await chromium.launch();
const results = {};
for (const epochId of ['epoch-1-frontier','epoch-2-steamworks','epoch-3-voltage','epoch-4-motor','epoch-5-deepwater','epoch-6-atomic','epoch-7-signal','epoch-8-orbital','epoch-9-redfields','epoch-10-deepsky']) {
  const page = await browser.newPage();
  await page.route('**/measure-fixture*', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<html><head><link rel="icon" href="data:,"></head><body><canvas id="game-canvas"></canvas><script>window.__GR_RELEASE_E1__ = false;</script></body></html>',
  }));
  await page.goto('http://127.0.0.1:5302/measure-fixture');
  const out = await page.evaluate(async (epochId) => {
    const cf = await import('/src/meta/ContractFamilies.ts');
    localStorage.setItem(cf.ACTIVE_EPOCH_KEY, epochId);
    const resolvedEpoch = cf.activeEpochId();
    const order = cf.activeEpoch().order;
    const { townPrefetchUrls } = await import('/src/town/TownTavernPilot.ts');
    const { contractPrefetchUrls } = await import('/src/world/Terrain3dClaimPilot.ts');
    const town = townPrefetchUrls();
    const board = cf.listBoardContracts().map(({ id }) => id);
    const contracts = {};
    for (const id of board) contracts[id] = await contractPrefetchUrls(id);
    return { resolvedEpoch, order, town, board, contracts };
  }, epochId);
  results[epochId] = out;
  await page.close();
}
await browser.close();

const HALL = /stamp-mill|dynamo-hall/;
const baseOf = (url) => decodeURIComponent(new URL(url, 'http://127.0.0.1:5302/').pathname.split('/').pop());
const report = {};
for (const [epochId, data] of Object.entries(results)) {
  const rows = data.town.map((url) => {
    const base = baseOf(url);
    const d = distBytesFor(base);
    return { base, hall: HALL.test(base), ...d };
  });
  const contractRows = {};
  for (const [id, urls] of Object.entries(data.contracts)) {
    contractRows[id] = urls.map((url) => {
      const base = baseOf(url);
      return { base, ...distBytesFor(base) };
    });
  }
  report[epochId] = { resolvedEpoch: data.resolvedEpoch, order: data.order, board: data.board, town: rows, contracts: contractRows };
}
writeFileSync(path.join(ROOT, 'artifacts/bounded-prefetch-town-halls/town-bytes.json'), JSON.stringify(report, null, 2));

for (const [epochId, data] of Object.entries(report)) {
  const sum = (rows) => rows.reduce((t, r) => t + (r.bytes ?? 0), 0);
  const unresolved = data.town.filter((r) => r.bytes === null);
  const halls = data.town.filter((r) => r.hall);
  console.log(`\n=== ${epochId} (resolved=${data.resolvedEpoch}, order=${data.order}) ===`);
  console.log(`town urls: ${data.town.length}  unresolved: ${unresolved.length} ${unresolved.map((r) => r.base + ':' + r.kind).join(', ')}`);
  console.log(`town WITH halls   : ${sum(data.town).toLocaleString()} bytes`);
  console.log(`town WITHOUT halls: ${sum(data.town.filter((r) => !r.hall)).toLocaleString()} bytes`);
  console.log(`halls             : ${sum(halls).toLocaleString()} bytes  (${halls.map((r) => r.base + '=' + r.bytes).join(', ')})`);
  for (const [id, rows] of Object.entries(data.contracts)) {
    const u = rows.filter((r) => r.bytes === null);
    console.log(`  contract ${id}: ${sum(rows).toLocaleString()} bytes (${rows.length} urls${u.length ? ', UNRESOLVED ' + u.map((r) => r.base).join(',') : ''})`);
  }
}
