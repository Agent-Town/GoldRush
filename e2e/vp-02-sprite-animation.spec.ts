import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

const shotDir = path.resolve('reviews/shots-vp-02');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function waitForHeroClip(page: Page, frameCount: number): Promise<void> {
  await page.waitForFunction(
    (count) => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameCount === count,
    frameCount,
  );
}

async function setHeroTestClip(page: Page, frames: string[], fps: number): Promise<void> {
  await page.evaluate(({ frames: nextFrames, fps: nextFps }) => {
    window.__GR_TEST__?.setTestClip('char.hero', nextFrames, nextFps);
  }, { frames, fps });
  await waitForHeroClip(page, frames.length);
}

function meanPixelDelta(a: PNG, b: PNG): number {
  expect(a.width).toBe(b.width);
  expect(a.height).toBe(b.height);
  let total = 0;
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    total += Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    count += 3;
  }
  return total / count;
}

test('hero test clip advances on sim time and holds during hit-pause', async ({ page }) => {
  const errors = await openGame(page, 'vp-02-frames');
  await setHeroTestClip(page, ['#ff0000', '#00ff00'], 8);
  await page.evaluate(() => {
    const w = window as unknown as {
      __vp02Track: { frames: string[]; pauseFrames: string[]; sawPause: boolean };
    };
    w.__vp02Track = { frames: [], pauseFrames: [], sawPause: false };
    const tick = () => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      const frameKey = diagnostics?.spriteAnimations['char.hero']?.frameKey;
      if (frameKey && (diagnostics?.speed ?? 0) > 0.05) w.__vp02Track.frames.push(frameKey);
      if (diagnostics?.charmPause && frameKey) {
        w.__vp02Track.sawPause = true;
        w.__vp02Track.pauseFrames.push(frameKey);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.keyboard.down('KeyW');
  await expect
    .poll(async () => page.evaluate(() => new Set((window as unknown as { __vp02Track: { frames: string[] } }).__vp02Track.frames).size), {
      timeout: 2_000,
    })
    .toBeGreaterThanOrEqual(2);

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('rig.fireRate', 20);
    window.__GR_TEST__?.setBalance('rig.damage', 999);
    window.__GR_TEST__?.setBalance('enemy.hp', 1);
    window.__GR_TEST__?.spawnPack(1, 8);
  });
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __vp02Track: { sawPause: boolean } }).__vp02Track.sawPause))
    .toBe(true);
  await page.keyboard.up('KeyW');

  const pauseFrames = await page.evaluate(() => (window as unknown as { __vp02Track: { pauseFrames: string[] } }).__vp02Track.pauseFrames);
  expect(pauseFrames.length).toBeGreaterThan(0);
  expect(new Set(pauseFrames).size).toBe(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('missing sheet cells fall back to the existing one-frame billboard without drift', async ({ page }) => {
  await page.route('**/char-hero-sheet-side-r*.png', (route) => route.abort());
  await page.route('**/char-jumper-sheet-side-r*.png', (route) => route.abort());
  const errors = await openGame(page, 'vp-02-fallback');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameKey === 'hero-homesteader.png');
  await page.keyboard.press('KeyP');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  await page.waitForTimeout(800);

  const before = PNG.sync.read(await page.locator('#game-canvas').screenshot());
  await page.waitForTimeout(300);
  const after = PNG.sync.read(await page.locator('#game-canvas').screenshot());
  expect(meanPixelDelta(before, after)).toBeLessThan(0.01);
  expect(errors.consoleErrors.filter((message) => !message.includes('Failed to load resource: net::ERR_FAILED'))).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('warmed test clip swaps do not grow renderer memory or draw calls', async ({ page }) => {
  const errors = await openGame(page, 'vp-02-memory');
  const clipA = ['#ff0000', '#00ff00'];
  const clipB = ['#0000ff', '#ffff00'];
  await setHeroTestClip(page, clipA, 10);
  await page.waitForTimeout(250);
  await setHeroTestClip(page, clipB, 10);
  await page.waitForTimeout(250);
  await setHeroTestClip(page, clipA, 10);
  await page.waitForTimeout(250);
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);

  for (let i = 0; i < 3; i += 1) {
    await setHeroTestClip(page, clipB, 10);
    await page.waitForTimeout(160);
    await setHeroTestClip(page, clipA, 10);
    await page.waitForTimeout(160);
  }

  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);
  expect(after?.textures).toBe(baseline?.textures);
  expect(after?.geometries).toBe(baseline?.geometries);
  expect(after?.calls).toBe(baseline?.calls);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('captures VP-02 desktop and narrow screenshots', async ({ page }, testInfo) => {
  const errors = await openGame(page, `vp-02-shot-${testInfo.project.name}`);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.hp', 999);
    window.__GR_TEST__?.spawnPack(1, 6);
  });
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.loaded === true);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper']?.loaded === true);
  await page.addStyleTag({ content: '.lil-gui, .dg.ac { display: none !important; }' });

  fs.mkdirSync(shotDir, { recursive: true });
  const name = testInfo.project.name.includes('mobile') ? '390px' : 'desktop';
  const screenshot = await page.screenshot({
    fullPage: false,
    path: path.join(shotDir, `${name}.png`),
  });
  await testInfo.attach(`vp-02-${name}`, {
    body: screenshot,
    contentType: 'image/png',
  });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
