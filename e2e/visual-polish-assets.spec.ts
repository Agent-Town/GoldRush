import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const batch001Slots = [
  'char.hero',
  'char.bandit_base',
  'node.gold_seam',
  'bld.sentry_beacon',
  'terrain.bank',
  'terrain.river',
] as const;

const reviewShotDir = path.resolve('reviews/shots-visual-polish-01');

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

async function expectNonblankCanvas(page: Page): Promise<void> {
  const buffer = await page.locator('#game-canvas').screenshot();
  const png = PNG.sync.read(buffer);
  let min = 255;
  let max = 0;
  const buckets = new Set<string>();
  const stride = Math.max(1, Math.floor((png.width * png.height) / 4096));

  for (let pixel = 0; pixel < png.width * png.height; pixel += stride) {
    const offset = pixel * 4;
    const r = png.data[offset] ?? 0;
    const g = png.data[offset + 1] ?? 0;
    const b = png.data[offset + 2] ?? 0;
    const a = png.data[offset + 3] ?? 0;
    min = Math.min(min, r, g, b);
    max = Math.max(max, r, g, b);
    buckets.add(`${r >> 4},${g >> 4},${b >> 4},${a >> 6}`);
  }

  expect({ variance: max - min, colorBuckets: buckets.size }).toMatchObject({
    variance: expect.any(Number),
    colorBuckets: expect.any(Number),
  });
  expect(max - min).toBeGreaterThan(8);
  expect(buckets.size).toBeGreaterThan(3);
}

test('batch-001 generated asset slots load and stay playable', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=visual-polish-01');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect
    .poll(
      async () =>
        page.evaluate((slots) => {
          const assets = window.__THREE_GAME_DIAGNOSTICS__?.assets ?? {};
          return slots.map((slot) => [slot, assets[slot] ?? 'missing']);
        }, batch001Slots),
      { timeout: 10_000 },
    )
    .toEqual(batch001Slots.map((slot) => [slot, 'loaded']));

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['char.hero'] ?? 0)).toBe(1);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['node.gold_seam'] ?? 0))
    .toBeGreaterThan(0);

  await page.evaluate(() => window.__GR_TEST__?.grantGold(35));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['bld.sentry_beacon'] ?? 0))
    .toBe(0);

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 5));
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBe(1);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['char.bandit_base'] ?? 0))
    .toBe(1);

  await expectNonblankCanvas(page);

  fs.mkdirSync(reviewShotDir, { recursive: true });
  await page.addStyleTag({ content: '.lil-gui, .dg.ac { display: none !important; }' });
  const formFactor = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  const screenshot = await page.screenshot({
    fullPage: false,
    path: path.join(reviewShotDir, `${formFactor}-batch001-assets.png`),
  });
  await testInfo.attach(`${testInfo.project.name}-batch001-assets`, {
    body: screenshot,
    contentType: 'image/png',
  });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('failed generated seam image keeps procedural fallback playable', async ({ page }) => {
  const errors = collectErrors(page);
  await page.route('**/node-gold-seam*', (route) => route.abort());
  await page.goto('/?debug&nowaves&nolevel&seed=visual-polish-fallback');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assets['node.gold_seam'] ?? 'missing'), {
      timeout: 10_000,
    })
    .toBe('error');
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['node.gold_seam'] ?? 0))
    .toBe(0);

  const target = await page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    const nodes = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active) ?? [];
    nodes.sort((a, b) => {
      const adx = a.position.x - hero.x;
      const adz = a.position.z - hero.z;
      const bdx = b.position.x - hero.x;
      const bdz = b.position.z - hero.z;
      return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
    });
    return nodes[0]?.position;
  });
  expect(target).toBeTruthy();
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), target!);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false)).toBe(true);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.progress ?? 0))
    .toBeGreaterThan(0.1);
  await expectNonblankCanvas(page);

  expect(errors.consoleErrors.filter((message) => !message.includes('Failed to load resource: net::ERR_FAILED'))).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
