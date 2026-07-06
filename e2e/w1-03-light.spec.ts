import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

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
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24);
  return errors;
}

test('light, fog, shadows, post, and water variance expose stable diagnostics', async ({ page }) => {
  const errors = await openGame(page, 'w1-03-light');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.lighting?.blobShadows ?? 0) > 0);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  const mobile = (page.viewportSize()?.width ?? 1280) <= 430;

  expect(diagnostics?.lighting?.sunPresent).toBe(true);
  expect(diagnostics?.lighting?.shadowsQuality).toBe(mobile ? 'blob' : 'soft');
  expect(diagnostics?.lighting?.shadowMapSize).toBe(mobile ? 0 : Balance.world.shadowMapSize);
  expect(diagnostics?.lighting?.shadowMapTargetSize).toBe(mobile ? 0 : Balance.world.shadowMapSize);
  expect(diagnostics?.lighting?.fogNear).toBe(Balance.world.fogNear);
  expect(diagnostics?.lighting?.fogFar).toBe(Balance.world.fogFar);
  expect(diagnostics?.lighting?.postEnabled).toBe(true);
  expect(diagnostics?.lighting?.blobShadows ?? 0).toBeGreaterThan(0);
  expect(diagnostics?.terrain.water?.waterPhaseVariance ?? 0).toBeGreaterThan(0);

  if (!mobile) {
    await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('world.shadowMapSize', 1024))).resolves.toBe(true);
    await page.waitForFunction(() => {
      const lighting = window.__THREE_GAME_DIAGNOSTICS__?.lighting;
      return lighting?.shadowMapSize === 1024 && lighting.shadowMapTargetSize === 1024;
    });
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('post grade has a kill knob', async ({ page }) => {
  const errors = await openGame(page, 'w1-03-post-off');
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('world.postEnabled', false))).resolves.toBe(true);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.postEnabled === false);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
