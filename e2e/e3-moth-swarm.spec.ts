import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const QUERY = '?debug&daynight&contract=e1-night-shift&nowaves&nospawn&nolevel&seed=e3-moths';

test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

test('moths attach to a lantern, dim its coverage, and restore it when killed', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();

  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setDayNightTime(16);
    window.__GR_TEST__!.grantGold(20);
    window.__GR_TEST__!.teleport(0, 16);
    window.__GR_TEST__!.repair('lantern_post', 0);
    window.__GR_TEST__!.teleport(-20, -20);
    window.__GR_TEST__!.advanceSim(2);
  });
  const full = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(5.5, 16));
  expect(full).toBeGreaterThan(0.95);

  expect(await page.evaluate(() => window.__GR_TEST__!.spawnMoths(1, 3, 16))).toBe(1);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm)).toMatchObject({ alive: 1, attached: 1, sourceId: 'lantern:0' });
  const dimmed = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(5.5, 16));
  expect(dimmed).toBeLessThan(full * 0.5);
  await mkdir('artifacts/e3-moth-swarm', { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `artifacts/e3-moth-swarm/${testInfo.project.name}-lantern-dimmed.png` });

  await page.evaluate(() => {
    window.__GR_TEST__!.setBalance('sparkRig.damage', 100);
    window.__GR_TEST__!.setBalance('sparkRig.fireRate', 20);
    window.__GR_TEST__!.teleport(0, 16);
    window.__GR_TEST__!.advanceSim(2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.alive)).toBe(0);
  const restored = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(5.5, 16));
  expect(restored).toBeGreaterThan(0.95);
  expect(errors).toEqual([]);
});

test('moth harness stays off outside the E3 day-night gate', async ({ page }) => {
  await page.goto('/?debug&contract=the-claim&nowaves&nospawn&nolevel');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__!.spawnMoths(1, 0, 0))).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm)).toMatchObject({ enabled: false, alive: 0, attached: 0 });
});
