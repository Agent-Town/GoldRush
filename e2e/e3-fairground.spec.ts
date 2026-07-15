import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-fairground&nowaves&nospawn&nolevel&nopause&seed=e3-fairground';
const ARTIFACT_DIR = 'artifacts/e3-fairground';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.fairground?.spinning === true);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.waitForTimeout(150);
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('wheel spin drives watts and elevated coverage until damage stops both', async ({ page }, testInfo) => {
  const errors = await open(page);
  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  expect(contract).toMatchObject({
    id: 'e3-fairground',
    tileParams: { tileId: 'e3-fairground', dimensions: { width: 88, height: 88 } },
    twist: {
      secureWave: 12,
      fairground: {
        wheel: { nodeId: 'ferris-wheel', outputWatts: 24, maxHp: 240, viewRadius: 18 },
        pavilions: [
          { id: 'copper-pavilion', baseRadius: 8, radiusPerNight: 3 },
          { id: 'silver-pavilion', baseRadius: 8, radiusPerNight: 3 },
        ],
        crowdFlocks: { count: 3, escortRadius: 7 },
      },
    },
    boardRow: { unlock: 'secured:e3-moth-season' },
  });

  await page.evaluate(() => {
    window.__GR_TEST__!.setDayNightTime(15);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  const turning = await page.evaluate(() => ({
    wheel: window.__THREE_GAME_DIAGNOSTICS__!.fairground,
    power: window.__THREE_GAME_DIAGNOSTICS__!.power,
    watchCoverage: window.__GR_TEST__!.lightCoverage(0, 26),
    firstNightPavilion: window.__GR_TEST__!.lightCoverage(-30, 10),
  }));
  expect(turning.wheel).toMatchObject({ spinning: true, hp: 240, outputWatts: 24, configuredWatts: 24, viewRadius: 18 });
  expect(turning.power).toMatchObject({ totalSupplyWatts: 24, totalDemandWatts: 12 });
  expect(turning.power.nodes.find((node) => node.id === 'ferris-wheel')).toMatchObject({ online: true, state: 'powered' });
  expect(turning.watchCoverage).toBeGreaterThan(0.8);

  await page.evaluate(() => window.__GR_TEST__!.setDayNightTime(39));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__!.lightCoverage(-30, 10))).toBeGreaterThan(turning.firstNightPavilion + 0.5);
  await page.evaluate(() => window.__GR_TEST__!.teleport(0, 12));
  await shot(page, testInfo, 'wheel-turning');

  expect(await page.evaluate(() => window.__GR_TEST__!.damageFerrisWheel(1))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  const stopped = await page.evaluate(() => ({
    wheel: window.__THREE_GAME_DIAGNOSTICS__!.fairground,
    power: window.__THREE_GAME_DIAGNOSTICS__!.power,
    watchCoverage: window.__GR_TEST__!.lightCoverage(0, 26),
  }));
  expect(stopped.wheel).toMatchObject({ spinning: false, hp: 239, outputWatts: 0, configuredWatts: 24 });
  expect(stopped.power.totalSupplyWatts).toBe(0);
  expect(stopped.power.nodes.find((node) => node.id === 'ferris-wheel')).toMatchObject({ online: false, state: 'dark' });
  expect(stopped.watchCoverage).toBeLessThan(turning.watchCoverage);
  await shot(page, testInfo, 'wheel-stopped');
  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(12));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(false);
  expect(errors).toEqual([]);
});
