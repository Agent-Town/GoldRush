import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

type CanvasSample = {
  ok: boolean;
  reason: string;
  variance?: number;
  colorBuckets?: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function sampleCanvas(page: import('@playwright/test').Page): Promise<CanvasSample> {
  const canvas = page.locator('#game-canvas');
  const box = await canvas.boundingBox();
  if (!box || box.width < 32 || box.height < 32) {
    return { ok: false, reason: 'canvas-too-small' };
  }

  const buffer = await canvas.screenshot();
  const png = PNG.sync.read(buffer);
  let min = 255;
  let max = 0;
  let alphaPixels = 0;
  const buckets = new Set<string>();
  const stride = Math.max(1, Math.floor((png.width * png.height) / 4096));

  for (let pixel = 0; pixel < png.width * png.height; pixel += stride) {
    const offset = pixel * 4;
    const r = png.data[offset];
    const g = png.data[offset + 1];
    const b = png.data[offset + 2];
    const a = png.data[offset + 3];
    min = Math.min(min, r, g, b);
    max = Math.max(max, r, g, b);
    if (a > 0) alphaPixels += 1;
    buckets.add(`${r >> 4},${g >> 4},${b >> 4},${a >> 6}`);
  }

  const variance = max - min;
  return {
    ok: alphaPixels > 256 && (variance > 8 || buckets.size > 3),
    reason: 'sampled',
    variance,
    colorBuckets: buckets.size,
  };
}

function expectStableRect(after: Rect | null, before: Rect | null): void {
  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (!before || !after) return;
  expect(Math.abs(after.x - before.x)).toBeLessThan(0.5);
  expect(Math.abs(after.y - before.y)).toBeLessThan(0.5);
  expect(Math.abs(after.width - before.width)).toBeLessThan(0.5);
  expect(Math.abs(after.height - before.height)).toBeLessThan(0.5);
}

test('renders a nonblank interactive game canvas', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const sample = await sampleCanvas(page);
  expect(sample, JSON.stringify(sample)).toMatchObject({ ok: true });

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0);

  if (testInfo.project.name.includes('mobile')) {
    const stick = page.locator('#touch-stick');
    await expect(stick).toBeVisible();
    const box = await stick.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.05, { steps: 6 });
      await page.waitForTimeout(450);
      await page.mouse.up();
    }
  } else {
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(450);
    await page.keyboard.up('KeyW');
  }

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0))
    .toBeLessThan(before - 0.3);

  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${testInfo.project.name}-game`, {
    body: screenshot,
    contentType: 'image/png',
  });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('terrain diagnostics expose claim zones and speeds', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const probes = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.probes);
  expect(probes).toMatchObject({
    bank: { walkable: true, speedMul: 1, zone: 'bank' },
    shallows: { walkable: true, speedMul: 0.8, zone: 'shallows' },
    river: { walkable: true, speedMul: 0.55, zone: 'river' },
    ford: { walkable: true, speedMul: 0.85, zone: 'ford' },
    northBank: { walkable: true, speedMul: 1, zone: 'bank' },
    out: { walkable: false, speedMul: 0, zone: 'out' },
  });
});

test('HUD shell is readable and stable as run numbers tick', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const vitals = page.getByTestId('hud-vitals');
  const gold = page.getByTestId('hud-gold');
  const xp = page.getByTestId('hud-xp');
  const wave = page.getByTestId('hud-wave');
  const pause = page.getByTestId('hud-pause');

  await expect(vitals).toBeVisible();
  await expect(gold).toBeVisible();
  await expect(xp).toBeVisible();
  await expect(wave).toBeVisible();
  await expect(pause).toBeVisible();
  await expect(vitals).toContainText('HP');
  await expect(vitals).toContainText('100 / 100');
  await expect(gold).toContainText('Gold');
  await expect(gold).toContainText('0');
  await expect(xp).toContainText('0 / 12 XP');
  await expect(pause).toContainText('P - catch your breath');

  const before = {
    vitals: await vitals.boundingBox(),
    gold: await gold.boundingBox(),
    xp: await xp.boundingBox(),
  };

  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) > 1.05);

  expectStableRect(await vitals.boundingBox(), before.vitals);
  expectStableRect(await gold.boundingBox(), before.gold);
  expectStableRect(await xp.boundingBox(), before.xp);

  const viewport = page.viewportSize();
  for (const locator of [vitals, gold, xp, wave, pause]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    if (!box || !viewport) continue;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('P toggles pause diagnostics and freezes sim time', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');

  await page.keyboard.press('KeyP');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('paused');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(true);
  const pausedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForTimeout(280);
  const stillPausedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  expect(stillPausedAt).toBe(pausedAt);

  await page.keyboard.press('KeyP');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(false);
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0))
    .toBeGreaterThan(pausedAt);
});

test('river band slows the hero through diagnostics', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await page.keyboard.down('KeyA');
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0))
    .toBeLessThan(-4);
  await page.keyboard.up('KeyA');
  await page.waitForTimeout(180);

  await page.keyboard.down('KeyW');
  await page.waitForTimeout(650);
  const bankSpeed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0);
  expect(bankSpeed).toBeGreaterThan(5.2);

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.playerZone))
    .toBe('river');
  await page.waitForTimeout(400);
  const riverSpeed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0);
  await page.keyboard.up('KeyW');

  const ratio = riverSpeed / bankSpeed;
  expect(ratio).toBeGreaterThan(0.48);
  expect(ratio).toBeLessThan(0.62);
});
