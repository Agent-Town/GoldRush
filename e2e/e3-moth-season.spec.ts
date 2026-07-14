import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const QUERY = '?debug&contract=e3-moth-season&nowaves&nospawn&nolevel&seed=e3-moth-season';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

async function open(page: Page): Promise<{ console: string[]; page: string[] }> {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

test('locks the night, scales the moth wave with light, and pays the decoy tithe', async ({ page }, testInfo) => {
  const errors = await open(page);
  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  expect(contract).toMatchObject({
    id: 'e3-moth-season',
    twist: {
      secureWave: 12,
      dayNightCycle: { nightLocked: true, duskRampSeconds: 2, dawnRampSeconds: 2 },
      mothSeason: {
        radiusWeight: 1,
        decoyWeight: 2,
        mothsPerLightPerWave: 1,
        nightSpeedOutsideLight: 1.12,
        litThreshold: 0.35,
        attachDamagePerSecond: 6,
      },
    },
    boardRow: { unlock: 'secured:e3-blackout-ridge' },
    briefing: { goals: ['Hold through wave 12 while the decoy shed draws the migration.'] },
  });

  for (const [time, phase, minDarkness] of [[0, 'dusk', 0.75], [3, 'dark', 1], [23, 'dawn', 0.75]] as const) {
    await page.evaluate((seconds) => window.__GR_TEST__!.setDayNightTime(seconds), time);
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight)).toMatchObject({ phase });
    expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight?.darkness ?? 0))).toBeGreaterThanOrEqual(minDarkness);
  }

  expect(await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setDayNightTime(3);
    return [
      window.__GR_TEST__!.placeFree('lantern_post', -8, 12),
      window.__GR_TEST__!.placeFree('decoy_shed', 8, 12),
    ];
  })).toEqual([true, true]);
  await page.evaluate(() => window.__GR_TEST__!.teleport(-30, -30));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.coverage.sources ?? 0)).toBe(2);

  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(1);
    window.__GR_TEST__!.advanceSim(4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.alive)).toBe(2);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.attachCounts), { timeout: 15_000 })
    .toContainEqual({ sourceId: 'decoy:0', count: 2, radius: 11, targetWeight: 2 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.attachCounts))
    .toContainEqual({ sourceId: 'lantern:0', count: 0, radius: 7, targetWeight: 1 });

  await expect.poll(() => page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find((entry) => entry.id === 'decoy_shed')?.hp ?? 120,
  )).toBeLessThan(120);
  await page.evaluate(() => window.__GR_TEST__!.teleport(4, 12));
  await mkdir('artifacts/e3-moth-season', { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `artifacts/e3-moth-season/${testInfo.project.name}-decoy-tithe.png` });

  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});
