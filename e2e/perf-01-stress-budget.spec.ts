import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

type PerfTracker = {
  done: boolean;
  samples: number;
  maxDrawCalls: number;
  maxTextureSwaps: number;
  maxActiveAnimators: number;
  maxFadeOverlays: number;
  textureSwapViolation: boolean;
};

declare global {
  interface Window {
    __PERF_01_TRACKER__?: PerfTracker;
  }
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto('/?debug&stress=120&timescale=3&nowaves&nolevel&nokill&profile&seed=perf-01');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  return errors;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await gold(page);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => gold(page)).toBe(before + amount);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function buildableCount(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function placePalisadeAt(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  const before = await buildableCount(page, 'palisade');
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(before + 1);
}

async function installPerfTracker(page: Page, durationMs: number): Promise<void> {
  await page.evaluate((duration) => {
    const started = performance.now();
    window.__PERF_01_TRACKER__ = {
      done: false,
      samples: 0,
      maxDrawCalls: 0,
      maxTextureSwaps: 0,
      maxActiveAnimators: 0,
      maxFadeOverlays: 0,
      textureSwapViolation: false,
    };

    const tick = () => {
      const tracker = window.__PERF_01_TRACKER__!;
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (diagnostics) {
        const spriteStats = diagnostics.spriteStats;
        tracker.samples += 1;
        tracker.maxDrawCalls = Math.max(tracker.maxDrawCalls, diagnostics.renderer.calls);
        tracker.maxTextureSwaps = Math.max(tracker.maxTextureSwaps, spriteStats.textureSwapsPerFrame);
        tracker.maxActiveAnimators = Math.max(tracker.maxActiveAnimators, spriteStats.activeAnimators);
        tracker.maxFadeOverlays = Math.max(tracker.maxFadeOverlays, spriteStats.fadeOverlaysActive);
        tracker.textureSwapViolation ||= spriteStats.textureSwapsPerFrame > spriteStats.activeAnimators;
      }
      if (performance.now() - started < duration) requestAnimationFrame(tick);
      else tracker.done = true;
    };
    requestAnimationFrame(tick);
  }, durationMs);
}

test('stress profile stays within draw-call and sprite-swap budgets', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page);
  await grantGold(page, 120);

  for (let x = -5; x <= 6; x += 1) {
    await placePalisadeAt(page, x, 9);
  }
  await expect.poll(() => buildableCount(page, 'palisade')).toBe(12);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.spriteStats.activeAnimators ?? 0) > 0);

  await installPerfTracker(page, 5_250);
  await expect.poll(() => page.evaluate(() => window.__PERF_01_TRACKER__?.done ?? false), { timeout: 12_000 }).toBe(true);

  const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  const tracker = await page.evaluate(() => window.__PERF_01_TRACKER__);
  expect(snapshot?.stressCount).toBe(120);
  expect(snapshot?.enemiesAlive).toBeGreaterThan(0);
  expect(tracker?.samples ?? 0).toBeGreaterThan(10);
  expect(tracker?.maxDrawCalls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200);
  expect(tracker?.textureSwapViolation).toBe(false);
  expect(tracker?.maxTextureSwaps ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(tracker?.maxActiveAnimators ?? -1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
