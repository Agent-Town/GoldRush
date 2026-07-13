import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/e2-pressure-in-run');
const QUERY = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&timescale=8';

async function open(page: Page, testInfo: TestInfo): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${QUERY}&seed=pressure-${testInfo.project.name}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('coal feeds boilers, pressure vents, and PRESSURIZE completes', async ({ page }, testInfo) => {
  const errors = await open(page, testInfo);
  await expect(page.getByTestId('hud-build-tile-boiler_house')).toHaveCount(1);

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.safeBand)).toBeNull();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.seams.every((seam) => !seam.marked))).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.takeResearchNode('pressure_assay'))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.takeResearchNode('coal_survey'))).resolves.toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.teleport(-12, 39));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.coal)).toBe(4);

  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', -4, 12))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 4, 12))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(2.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.hotBoilers)).toBe(2);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.1));
  const pressureHud = page.getByTestId('hud-pressure');
  await expect(pressureHud).toBeVisible();
  await expect(pressureHud.locator('[data-hud-pressure-label]')).toHaveText('Pressure');
  await expect(pressureHud.locator('[data-hud-pressure-uses]')).toHaveText('×2');
  await expect(pressureHud.locator('[data-hud-pressure]')).toHaveText(/^\d+\/100$/);
  await expect(pressureHud).not.toContainText('PRESSURIZE');
  await expect(pressureHud).not.toContainText('W8–12');
  await expect(pressureHud).toHaveAttribute('title', 'Pressurize windows open waves 8–12');
  const goldBox = await page.getByTestId('hud-gold').boundingBox();
  const pressureBox = await pressureHud.boundingBox();
  expect(goldBox && pressureBox && (
    pressureBox.x + pressureBox.width <= goldBox.x
    || goldBox.x + goldBox.width <= pressureBox.x
    || pressureBox.y + pressureBox.height <= goldBox.y
    || goldBox.y + goldBox.height <= pressureBox.y
  )).toBe(true);
  await shot(page, testInfo, 'gauge-safe-band');

  await page.evaluate(() => {
    const pressure = window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount ?? 0;
    window.__GR_TEST__?.grantPressure(100 - pressure);
  });
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.2));
  const vent = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure);
  expect(vent?.vents).toBeGreaterThan(0);
  expect(vent?.boilers.some((boiler) => boiler.cooling)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount)).toBeLessThanOrEqual(80);
  await shot(page, testInfo, 'vent-plume');

  await page.evaluate(() => window.__GR_TEST__?.setBalance('boilerHouse.pressurePerTick', 0));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(3.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.hotBoilers)).toBe(2);
  await page.evaluate(() => window.__GR_TEST__?.setWave(8));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.2));
  await page.evaluate(() => window.__GR_TEST__?.setWave(12));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.complete)).toBe(true);
  await expect(pressureHud.locator('[data-hud-pressure-uses]')).toHaveText('×2');

  const pressureBeforeWreck = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount);
  await page.evaluate(() => window.__GR_TEST__?.setBalance('boilerHouse.pressurePerTick', 4));
  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('boiler_house', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('boiler_house', 1))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.hotBoilers)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount)).toBe(pressureBeforeWreck);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.multiplayerPosture)).toBe('single-player-gated');
  expect(errors).toEqual([]);
});

test('boilers remain Hill Mine-only', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=pressure-e1-guard');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.some((entry) => entry.id === 'boiler_house' && entry.count > 0))).toBe(false);
  await expect(page.getByTestId('hud-build-tile-boiler_house')).toHaveCount(0);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 0, 12))).resolves.toBe(false);
});
